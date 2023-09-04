import {isJsonString} from "./isJsonString";

export function parseJsonStringsRecursive(obj: any): void {
    if (Array.isArray(obj)) {
        // Якщо це масив, перевіряємо кожен елемент на наявність JSON-рядка
        for (let i = 0; i < obj.length; i++) {
            if (typeof obj[i] === 'string' && isJsonString(obj[i])) {
                try {
                    obj[i] = JSON.parse(obj[i]);
                } catch (e) {
                    // Не вдалося розпарсити, залишаємо як є
                }
            } else if (typeof obj[i] === 'object' && obj[i] !== null) {
                // Рекурсивно викликаємо функцію для об'єктів у масиві
                parseJsonStringsRecursive(obj[i]);
            }
        }
    } else if (typeof obj === 'object' && obj !== null) {
        // Рекурсивно викликаємо функцію для об'єктів
        for (const key in obj) {
            if (typeof obj[key] === 'string' && isJsonString(obj[key])) {
                try {
                    obj[key] = JSON.parse(obj[key]);
                } catch (e) {
                    // Не вдалося розпарсити, залишаємо як є
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                // Рекурсивно викликаємо функцію для об'єктів у об'єкті
                parseJsonStringsRecursive(obj[key]);
            }
        }
    }
}
