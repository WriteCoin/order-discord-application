// import discord.js
import {ActionRowBuilder, Client, Collection, Events, GatewayIntentBits, Guild, Message, ModalBuilder, TextInputBuilder, TextInputStyle} from 'discord.js';
import { getBotData, initialBotData, isOwnBot, RolesTextDisable, saveBotData, saveMessages, setBotData, type BotData } from './utils';
import { DateTime } from 'luxon';

// начальные данные
let messages: Message[] = []
let botData: BotData = initialBotData
let isExit: boolean = false

const isMessageForDelete: (message: Message) => boolean = message => {
    const isOwn = isOwnBot(message.author, client)
    // console.log("Собственный бот", isOwn)
    if (isOwn) {
        return false
    }
    // игнорирование личных сообщений
    // console.log("Личное сообщение", !!message.guild)
    if (!message.guild) {
        return false
    }
    const member = message.member
    // console.log("Действующий автор сообщения", message.member?.displayName)
    // console.log("Текст сообщения", message.content)
    const isRole = member?.roles.cache.find(role => Object.keys(RolesTextDisable).includes(role.name))
    // console.log("Роль соответствует", !!isRole)
    return Boolean(message.content) && Boolean(isRole)
}

const deleteMessage = async (message: Message) => {
    if (isMessageForDelete(message)) {
        try {
            await message.delete()
            messages.push(message)
            console.log(`Удалено сообщение с ID: ${message.id}`)
        } catch (error) {
            console.error(`Не удалось удалить сообщение с ID: ${message.id}`, error)
        }
    }
}

const deleteMessagesAfterLastExit = async (date: DateTime, guildFrom: Guild, client: Client) => {
    console.log("Удаление сообщений с даты последнего отключения бота")

    const compareDate = date.toJSDate()

    // const guilds = client.guilds.cache

    const channels = guildFrom.channels.cache

    for (const [_, channel] of channels) {
        // канал не найден или он текстовый
        if (!channel || !channel.isTextBased()) {
            return
        }
    
        let lastMessageId
    
        while (true) {
            // Получаем сообщения из канала
            const oldMessages: Collection<string, Message> = await channel.messages.fetch({ limit: 100, before: lastMessageId });
            const oldMessagesArray = Array.from(oldMessages.values());
        
            // Если больше нет сообщений, выходим из цикла
            if (oldMessagesArray.length === 0) break;
        
            // Фильтруем сообщения по дате и критерию
            const messagesToDelete = oldMessagesArray.filter(message => message.createdAt >= compareDate)
        
            // Удаляем сообщения
            for (const message of messagesToDelete) {
                await deleteMessage(message)
            }
        
            // Устанавливаем ID последнего сообщения для следующей итерации
            lastMessageId = oldMessagesArray[oldMessagesArray.length - 1].id;
        }
    }
    // for (const [_, guild] of guilds) {
    // }

    console.log("Все предыдущие сообщения удалены")
}

const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]

// create a new Client instance
const client = new Client({intents});

// listen for the client to be ready
client.once(Events.ClientReady, async client => {
    console.log(`Готово! Авторизован как "${client.user.tag}"`);

    botData = getBotData()
    const date = DateTime.fromObject(botData.exitDate)
    const guildId = process.env.DISCORD_GUILD_ID || ''
    if (!guildId) {
        console.error("Нет id Discord-сервера для анализа предыдущих сообщений")
        return
    }
    const guildFrom = await client.guilds.fetch(guildId)
    deleteMessagesAfterLastExit(date, guildFrom, client)
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
    await deleteMessage(message)
})

// Обработка события отключения
client.on(Events.ShardDisconnect, (event, shardId) => {
    console.log(`Шард ${shardId} отключен с кодом ${event.code}`)
    saveMessages(messages)
    messages.length = 0
    botData = setBotData(botData)
});

process.on('exit', (code) => {
    console.log(`Процесс завершен с кодом: ${code}`);
    if (isExit) {
        return
    }
    saveMessages(messages)
    botData = setBotData(botData)
    saveBotData(botData)
    messages.length = 0
    isExit = true
});

process.on('SIGINT', () => {
    console.log('Получен сигнал SIGINT');
    if (!isExit) {
        saveMessages(messages)
        botData = setBotData(botData)
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
        botData = setBotData(botData)
        saveBotData(botData)
        messages.length = 0
        isExit = true
    }
    process.exit(1)
});

// Авторизация с токеном из .env.local
client.login(process.env.DISCORD_TOKEN)