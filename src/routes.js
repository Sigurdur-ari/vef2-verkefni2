import express from 'express';
import { getDatabase } from './lib/db.client.js';
import { environment } from './lib/environment.js';
import { logger } from './lib/logger.js';
import { validationResult } from 'express-validator';
import {
  createQuestionValidationMiddleware, 
  sanitizationMiddleware, 
  xssSanitizationMiddleware} 
  from './lib/validate.js'

export const router = express.Router();

router.get('/', async (req, res) => {
  const result = await getDatabase()?.query('SELECT * FROM categories');

  const categories = result?.rows ?? [];

  console.log(categories);
  res.render('index', { title: 'Forsíða', categories });
});

router.get('/spurningar/:category', async (req, res) => {
  const title = req.params.category;

  const questionsResult = await getDatabase()?.query('SELECT * FROM questions WHERE categoryId = $1', [title]);

  const questions = questionsResult?.rows ?? [];

  const answersResult = await getDatabase()?.query('SELECT * FROM answers');

  const answers = answersResult?.rows ?? [];

  console.log(questions);
  console.log(answers);
  res.render('category', { title, questions, answers});
});

router.get('/form', (req, res) => {
  res.render('form', { title: 'Búa til spurningu fyrir flokk' });
});

router.post('/form', 
  createQuestionValidationMiddleware(),
  sanitizationMiddleware(),
  xssSanitizationMiddleware(),
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('form', { errors: errors.array() });
    }


    const { question, answer1, answer2, answer3, answer4, rett_svar, category } = req.body;

    const questionData = {
      question: question,
      answers: [
        {answer: answer1, correct: rett_svar === "1"},
        {answer: answer2, correct: rett_svar === "2"},
        {answer: answer3, correct: rett_svar === "3"},
        {answer: answer4, correct: rett_svar === "4"}
      ],
      category: category
    }



    // Hér þarf að setja upp validation, hvað ef name er tómt? hvað ef það er allt handritið að BEE MOVIE?
    // Hvað ef það er SQL INJECTION? HVAÐ EF ÞAÐ ER EITTHVAÐ ANNAÐ HRÆÐILEGT?!?!?!?!?!
    // TODO VALIDATION OG HUGA AÐ ÖRYGGI

    // Ef validation klikkar, senda skilaboð um það á notanda



    // Ef allt OK, búa til í gagnagrunn.
    
    
    const env = environment(process.env, logger);
    if (!env) {
      process.exit(1);
    }
    
    const db = getDatabase();
    if(!db){
      logger.warn("Connection to database failed");
      return
    }
    //MISMUNADI INSERT FYRIR SPURNINGAR OG SVO SVÖR
    const qId = await db.insertQuestion(question, category);
    console.log("question ID = ", qId);

    await db.insertAnswers(questionData.answers, qId);



    res.render('form-created', { title: 'Spurning búin til' });
});
