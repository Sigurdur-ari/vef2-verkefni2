import { readFile } from 'node:fs/promises';
import { Database } from './lib/db.client.js'; 
import { environment } from './lib/environment.js';
import { logger as loggerSingleton } from './lib/logger.js';
import { parseIndexFile, parseQuestionCategory } from './lib/parse.js';
import { readFileMy } from './lib/file.js';
import { join } from 'node:path';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const INSERT_FILE = './sql/insert.sql';

const INPUT_DIR = './data';

/**
 * @param {Database} db
 * @param {import('./lib/logger.js').Logger} logger
 * @returns {Promise<boolean>}
 */
async function setupDbFromFiles(db, logger) {
  const dropScript = await readFile(DROP_SCHEMA_FILE);
  const createScript = await readFile(SCHEMA_FILE);
  const insertScript = await readFile(INSERT_FILE);

  if (await db.query(dropScript.toString('utf-8'))) {
    logger.info('schema dropped');
  } else {
    logger.info('schema not dropped, exiting');
    return false;
  }

  if (await db.query(createScript.toString('utf-8'))) {
    logger.info('schema created');
  } else {
    logger.info('schema not created');
    return false;
  }

  if (await db.query(insertScript.toString('utf-8'))) {
    logger.info('data inserted');
  } else {
    logger.info('data not inserted');
    return false;
  }

  return true;
}

async function readAndParseFile(fileItem) {
  const content = await readFileMy(join(INPUT_DIR, fileItem.file));

  if (!content) {
    console.error('unable to read file', fileItem);
    return null;
  }
  const parsed = parseQuestionCategory(content);

  if (!parsed) {
    console.error('unable to parse file', fileItem);
    return null;
  }

  parsed.file = fileItem.file;

  return parsed;
}

//Les parsar og setur inn gögn úr ./data möppu. 
async function dataFromFiles(db, logger){
  console.group('reading and parsing index file');
  const indexFile = await readFileMy(join(INPUT_DIR, 'index.json'), 'utf8');

  if (!indexFile) {
    logger.error('unable to read index file');
    return false;
  }
  const index = parseIndexFile(indexFile);
  logger.info('index file length:', index.length);
  console.groupEnd();

  //Lesa spurningar úr json skrám úr ./data
  let questionCategoryFiles = [];
  for await (const { title, file } of index) {
    console.group('processing file', file);
    const result = await readAndParseFile({ title, file });

    if (result) {
      questionCategoryFiles.push(result);
    }
    console.groupEnd();
  }

  //setja inn gögn úr ./data
  for(let i = 0; i < questionCategoryFiles.length; i++){
    const questions = questionCategoryFiles[i].questions;
    for(let j = 0; j < questions.length; j++){
      const qId = await db.insertQuestion(questions[j].question, i+1)
      if(qId > 0){
        logger.info("question with id ", qId, " inserted to the database for cat ", i+1);
      } else {
        logger.error("Question with id", qId, " Failed to insert for cat ", i+1)
        return false;
      }
      if(await db.insertAnswers(questions[j].answers, qId)){
        logger.info("answers for question with id ", qId, "were inserted");
      }else {
        logger.error("answers for question with id ", qId, " failed to insert")
        return false;
      }
    }
  }
  return true
}

//Býr til gagnagrunninn og lætur vita ef það verða villur
async function create() {
  const logger = loggerSingleton;
  const env = environment(process.env, logger);

  if (!env) {
    process.exit(1);
  }

  logger.info('starting setup');

  const db = new Database(env.connectionString, logger);
  db.open();

  const resultFromFileSetup = await setupDbFromFiles(db, logger);

  if (!resultFromFileSetup) {
    logger.info('error setting up database from files');
    process.exit(1);
  }

  let resultFromReadingData;
  try {
    resultFromReadingData = await dataFromFiles(db, logger);
  } catch (e) {
    logger.error(e);
  }

  if (!resultFromReadingData) {
    logger.info('error reading data from files');
    process.exit(1);
  }

  logger.info('setup complete');
  await db.close();
}

create().catch((err) => {
  console.error('error running setup', err);
});
