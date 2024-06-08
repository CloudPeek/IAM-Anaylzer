// utils/stringReplaceUtil.js
import reactStringReplace from 'react-string-replace';

export function replaceEscapedQuotes(input) {
    // Replace escaped quotes
    let transformData = reactStringReplace(input, /\\"/gm, '"').join('');

    // Replace newline characters
    transformData = reactStringReplace(transformData, /\\n/gm, '').join('');

    // Replace instances of "}\n and "}
    transformData = reactStringReplace(transformData, /}"/gm, '}').join('');
    transformData = reactStringReplace(transformData, /"{/gm, '{').join('');

    console.log('data transform:', transformData);
    return transformData;
}
