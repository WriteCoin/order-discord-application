import type { Client, Message, User } from "discord.js";
import fs from "fs"
import path from "path"

export const isOwnBot = (user: User, client: Client) => client.user && client.user.id === user.id

export enum RolesTextDisable {
    Забаненный,
    Бестекстовый
}

export const createFileIfNotExists = (filePath: string, data: string = '') => {
    const dir = path.dirname(filePath)

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    // Создаем файл, если он не существует
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
    }
}

export const saveMessages = (messages: Message[], file: string = "./data/deletedMessages.json") => {
    console.log("Сохранение сообщений")
    if (messages.length <= 0) {
        return
    }
    createFileIfNotExists(file, "[]")
    const deletedMessagesData = fs.readFileSync(file, "utf-8")
    const deletedMessages = JSON.parse(deletedMessagesData || "[]")
    const newDeletedMessages = [...deletedMessages, ...messages]
    fs.writeFileSync(file, JSON.stringify(newDeletedMessages), 'utf-8')
}

export interface BotData {
    exitDate: string
}

export const saveBotData = (data: BotData, file: string = "./data/bot.json") => {
    createFileIfNotExists(file, "{}")
    const lastData = JSON.parse(fs.readFileSync(file, 'utf-8') || "{}")
    const newData = Object.assign(lastData, data)
    fs.writeFileSync(file, JSON.stringify(newData), 'utf-8')
}