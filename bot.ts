// import discord.js
import {ActionRowBuilder, Client, Events, GatewayIntentBits, Message, ModalBuilder, TextInputBuilder, TextInputStyle} from 'discord.js';
import { isOwnBot, RolesTextDisable, saveBotData, saveMessages, type BotData } from './utils';

// начальные данные
let messages: Message[] = []
let botData: BotData = {
    exitDate: ""
}
let isExit: boolean = false

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]

// create a new Client instance
const client = new Client({intents});

// listen for the client to be ready
client.once(Events.ClientReady, (c) => {
  console.log(`Готово! Авторизован как "${c.user.tag}"`);
})

// client.on(Events.InteractionCreate, async interaction => {
//     if (!interaction.isCommand()) {
//         return
//     }
//     if (interaction.commandName === 'example') {
//         const modal = new ModalBuilder()
//             .setCustomId('exampleModal')
//             .setTitle('Example Modal')

//         const textInput = new TextInputBuilder()
//             .setCustomId('exampleInput')
//             .setLabel("Enter some text")
//             .setStyle(TextInputStyle.Short)

//         const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput)

//         modal.addComponents(actionRow)

//         await interaction.showModal(modal)
//     }
// })

// client.on(Events.InteractionCreate, async interaction => {
//     if (!interaction.isModalSubmit()) return;

//     if (interaction.customId === 'exampleModal') {
//         const userInput = interaction.fields.getTextInputValue('exampleInput');
//         await interaction.reply(`You entered: ${userInput}`);
//     }
// })

client.on(Events.MessageCreate, async message => {
    console.log("Новое сообщение от", message.createdAt)
    // игнорирование сообщений собственных ботов
    const isOwn = isOwnBot(message.author, client)
    console.log("Собственный бот", isOwn)
    if (isOwn) {
        return
    }
    // игнорирование личных сообщений
    console.log("Личное сообщение", !!message.guild)
    if (!message.guild) {
        return
    }
    const member = message.member
    console.log("Действующий автор сообщения", message.member?.displayName)
    console.log("Текст сообщения", message.content)
    const isRole = member?.roles.cache.find(role => Object.keys(RolesTextDisable).includes(role.name))
    console.log("Роль соответствует", !!isRole)
    if (message.content && isRole) {
        await message.delete()
        messages.push(message)
    }
})

// Обработка события отключения
client.on(Events.ShardDisconnect, (event, shardId) => {
    console.log(`Шард ${shardId} отключен с кодом ${event.code}`)
    saveMessages(messages)
    messages.length = 0
    botData = {
        ...botData,
        exitDate: new Date().toLocaleString()
    }
});

process.on('exit', (code) => {
    console.log(`Процесс завершен с кодом: ${code}`);
    if (isExit) {
        return
    }
    saveMessages(messages)
    botData = {
        ...botData,
        exitDate: new Date().toLocaleString()
    }
    saveBotData(botData)
    messages.length = 0
    isExit = true
});

process.on('SIGINT', () => {
    console.log('Получен сигнал SIGINT');
    if (!isExit) {
        saveMessages(messages)
        botData = {
            ...botData,
            exitDate: new Date().toLocaleString()
        }
        saveBotData(botData)
        messages.length = 0
        isExit = true
    }
    process.exit();
});

process.on('uncaughtException', (error) => {
    console.error('Необработанное исключение:', error)
    if (!isExit) {
        saveMessages(messages)
        botData = {
            ...botData,
            exitDate: new Date().toLocaleString()
        }
        saveBotData(botData)
        messages.length = 0
        isExit = true
    }
    process.exit(1)
});

// Авторизация с токеном из .env.local
client.login(process.env.DISCORD_TOKEN)