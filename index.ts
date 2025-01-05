import {DateTime} from "luxon"

function binaryToText(binary: string): string {
    let text = '';

    // Разбиваем бинарную строку на сегменты по 8 бит (1 байт)
    for (let i = 0; i < binary.length; i += 8) {
        // Извлекаем 8-битный сегмент
        const byte = binary.substr(i, 8);

        // Конвертируем 8-битный сегмент в десятичное число
        const charCode = parseInt(byte, 2);

        // Преобразуем десятичное число в символ и добавляем к результирующей строке
        text += String.fromCharCode(charCode);
    }

    return text;
}

function binaryToUtf8(binary: string): string {
    // Преобразуем бинарную строку в массив байтов
    let bytes = [];
    binary = binary.replaceAll(' ', '')
    for (let i = 0; i < binary.length; i += 8) {
        bytes.push(parseInt(binary.substr(i, 8), 2));
    }

    // Декодируем массив байтов в строку UTF-8
    let decoder = new TextDecoder('utf-8');
    let uint8Array = new Uint8Array(bytes);
    let text = decoder.decode(uint8Array);

    return text
}

const binaryTest = () => {
    const binaryString = '11010001 10000010 11010000 10110000 11010000 10111010 11010000 10110110 11010000 10110101 00100000 11010001 10001111 00100000 11010000 10111101 11010000 10110000 11010000 10111111 11010000 10111000 11010001 10000001 11010000 10110000 11010000 10111011 00100000 11010000 10111111 11010001 10000000 11010000 10111110 11010000 10110011 11010001 10000000 11010000 10110000 11010000 10111100 11010000 10111100 11010001 10000011 00100000 11010000 10111101 11010000 10110000 00100000 01010010 01110101 01110011 01110100 00100000 11010000 10111010 11010000 10111110 11010001 10000010 11010000 10111110 11010001 10000000 11010000 10110000 11010001 10001111 00100000 11010000 10111010 11010000 10111110 11010000 10111101 11010000 10110010 11010000 10110101 11010001 10000000 11010001 10000010 11010000 10111000 11010001 10000000 11010001 10000011 11010000 10110101 11010001 10000010 00100000 11010001 10000010 11010000 10110101 11010000 10111010 11010001 10000001 11010001 10000010 00100000 11010000 10110010 00100000 11010000 10110001 11010000 10111000 11010000 10111101 11010000 10110000 11010001 10000000 11010000 10111010 11010001 10000011'
    const text = binaryToUtf8(binaryString)
    console.log(text)
}

enum Enum {
    A,
    B,
    C
}

// console.log(Object.values(Enum))
// console.log(Object.values(Enum))
// console.log(Object.entries(Enum))

const directionStrings = Object.keys(Enum).filter(key => isNaN(Number(key)));

console.log(DateTime.now())

console.log(JSON.stringify({ date: DateTime.now() }))