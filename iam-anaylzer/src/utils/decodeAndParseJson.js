// src/utils/decodeAndParseJson.js
export const decodeAndParseJson = (encodedJson) => {
  try {
    const strippedJson = encodedJson.replace(/^"|"$/g, '');
    return JSON.stringify(JSON.parse(decodeURIComponent(strippedJson)), null, 2);
  } catch (error) {
    console.error('Error decoding and parsing JSON:', error);
    return encodedJson;
  }
};
