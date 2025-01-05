import type { Client, Message, User } from "discord.js";
import fs from "fs"
import path from "path"
import {DateTime} from "luxon"

export const isOwnBot = (user: User, client: Client) => client.user && client.user.id === user.id

export enum RolesTextDisable {
    Забаненный,
    Бестекстовый
}

export const createFileIfNotExists = (filePath: string, data: string = '') => {
    const dir = path.dirname(filePath)

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    
    // Создаем файл, если он не существует
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data)
        return true
    }

    // уже существует
    return false
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
    exitDate: {
        day: number,
        month: number,
        year: number,
        hours: number,
        minutes: number,
        seconds: number
    }
}

export const saveBotData = (data: BotData, file: string = "./data/bot.json") => {
    console.log("Сохранение данных бота")
    createFileIfNotExists(file, "{}")
    const lastData = JSON.parse(fs.readFileSync(file, 'utf-8') || "{}")
    const newData = Object.assign(lastData, data)
    fs.writeFileSync(file, JSON.stringify(newData), 'utf-8')
}

const now = DateTime.now().toObject()
export const initialBotData: BotData = {
    exitDate: {
        day: now.day,
        month: now.month,
        year: now.year,
        hours: now.hour,
        minutes: now.minute,
        seconds: now.second
    }
}

export const getBotData: (file?: string) => BotData = (file: string = "./data/bot.json") => {
    console.log("Получение данных бота")
    createFileIfNotExists(file, "{}")
    const botData: BotData = JSON.parse(fs.readFileSync(file, 'utf-8') || "{}")
    if (!botData) {
        return initialBotData
    } else {
        return botData
    }
}

export const setBotData: (botData: BotData) => BotData = botData => {
    const date = DateTime.now()
    return {
        ...botData,
        exitDate: {
            day: date.day,
            month: date.month,
            year: date.year,
            hours: date.hour,
            minutes: date.minute,
            seconds: date.second
        }
    }
}