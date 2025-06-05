// word-character 테이블 간 관계를 연결해줄 데이터 추출

import fs from 'fs';
import path from 'path';

// csv-writer: CommonJS 기반이라 import 사용 불가 require() 쓰기 위함
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wordCharacters = [];

import csvParser from 'csv-parser';
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// csv에서 추출한 데이터들을 words 배열에 저장
const getWords = () => {
  return new Promise((resolve, reject) => {
    const words = [];
    const filePath = path.join(__dirname, 'words_rows.csv');

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        words.push({ id: data.id, word: data.word });
      })
      .on('end', () => {
        console.log('words 파일 읽기 완료');
        resolve(words);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

// csv에서 추출한 데이터들을 characters 배열에 저장
const getCharacters = () => {
  return new Promise((resolve, reject) => {
    const characters = [];
    const filePath = path.join(__dirname, 'characters_rows.csv');

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        characters.push({ id: data.id, character: data.character });
      })
      .on('end', () => {
        console.log('읽기 끝!!');
        resolve(characters);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

const generateWordCharacters = (words, characters) => {
  const charMap = new Map(characters.map((c) => [c.character, c.id]));

  for (const word of words) {
    const chars = Array.from(word.word);
    const seen = new Set();

    chars.forEach((char, index) => {
      const characterId = charMap.get(char);
      if (characterId && !seen.has(characterId)) {
        wordCharacters.push({
          word_id: word.id,
          character_id: characterId,
          order: index + 1,
        });
        seen.add(characterId);
      }
    });
  }
};

function saveWordCharacters() {
  const csvWriter = createCsvWriter({
    path: path.join(__dirname, 'word_characters.csv'),
    header: [
      { id: 'word_id', title: 'word_id' },
      { id: 'character_id', title: 'character_id' },
      { id: 'order', title: 'order' },
    ],
  });

  return csvWriter.writeRecords(wordCharacters);
}

(async () => {
  const words = await getWords();
  const characters = await getCharacters();
  generateWordCharacters(words, characters);
  await saveWordCharacters();
  console.log('word_characters.csv 생성 완료');
})();
