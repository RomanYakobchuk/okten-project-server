import {CensorSensor} from 'censor-sensor';

const isProfaneText = (text: string) => {
    const censor = new CensorSensor();

    for (const ukBadWord of ukBadWords) {
        censor.addWord(ukBadWord)
    }

    const isEquality = censor.isProfane(text);
    const isIncludes = censor.isProfaneIsh(text);

    return isEquality && isIncludes;
}

export {
    isProfaneText
}

const ukBadWords = [
    'хер', 'херня', 'срань', 'фігня', 'залупа', 'блять',
    'блядь', 'херотінь', 'залупінь', 'пизда', 'пизданути',
    'дебіл', 'дибіл', 'долбойоб', 'лох', 'лошара', 'лопух',
    'пизданутий', 'пиздануте', 'пиздате', 'пиздаті', 'хуй', 'х@й', 'ху@','хуйня',
    'х@йня', 'ху@ня', ' манда', 'йобнутий', 'йобнута', 'йобнуте', 'йобнуті',
    'хер', 'х@р', 'муд@к', 'мудак', 'їбати', 'їбала', 'їбе', 'їба', 'їб@',
    'гімно', 'бздю', 'засран', 'сука', 'сучка', 'сук@', 'лайно', 'л@йно', 'idiot',
    'гівно', 'гавно', 'далбайоб', 'сволоч', 'курва', 'тварь', 'тварі',
    'кончені', 'кончена', 'кончений', 'кончене', 'тварюка', 'член', 'піська', 'пісюн', ''
]