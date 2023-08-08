import schedule from 'node-schedule';
import {Capl} from '../dataBase';

// Встановлюємо правило розкладу для перевірки стану isActive кожні 10 хвилин.
const rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0, 59, 10);

// Створюємо функцію, яка перевіряє стан isActive і встановлює його в false, якщо від встановленої дати пройшло більше 12 годин і 2 статуси мали value 'accepted'.
const checkIsActive = async () => {
    const now: Date = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    const count = await Capl.countDocuments({
        'data.day': { $lte: twelveHoursAgo },
        'userStatus.value': 'accepted',
        'institutionStatus.value': 'accepted'
    });

    if (count >= 2) {
        await Capl.updateMany({ isActive: true }, { isActive: false });
    }
};

// Запускаємо розклад для функції перевірки стану isActive.
schedule.scheduleJob(rule, checkIsActive);
