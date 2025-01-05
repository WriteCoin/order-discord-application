import type { Client, Message, User } from "discord.js";
import fs from "fs"
import type { DateTime } from "luxon";

export const isOwnBot = (user: User, client: Client) => client.user && client.user.id === user.id

export enum RolesTextDisable {
    Забаненный,
    Бестекстовый
}

export const saveMessages = (messages: Message[]) => {
    console.log("Сохранение сообщений")
    if (messages.length <= 0) {
        return
    }
    const deletedMessagesData = fs.readFileSync("./data/deletedMessages.json", "utf-8")
    const deletedMessages = JSON.parse(deletedMessagesData || "[]")
    const newDeletedMessages = [...deletedMessages, ...messages]
    fs.writeFileSync("./data/deletedMessages.json", JSON.stringify(newDeletedMessages), 'utf-8')
}

export interface BotData {
    exitDate: string
}

export const saveBotData = (data: BotData) => {
    const lastData = JSON.parse(fs.readFileSync("./data/bot.json", 'utf-8') || "{}")
    const newData = Object.assign(lastData, data)
    fs.writeFileSync("./data/bot.json", JSON.stringify(newData), 'utf-8')
}