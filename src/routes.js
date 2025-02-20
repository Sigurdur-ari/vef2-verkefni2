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

  res.render('index', { title: 'Vefforritunar Spurningar', categories });
});



router.get('/spurningar/:category', async (req, res) => {
  const catId = req.params.category;

  //sækja spurningar úr flokk
  const questionsResult = await getDatabase()?.query('SELECT * FROM questions WHERE categoryId = $1', [catId]);

  const questions = questionsResult?.rows ?? [];

  //sækja öll svör
  const answersResult = await getDatabase()?.query('SELECT * FROM answers');

  const answers = answersResult?.rows ?? [];

  const catNameRes = await getDatabase()?.query('SELECT name FROM categories WHERE id = $1', [catId]);

  const catName = catNameRes?.rows ?? [];

  //Renderar view sem filterar svör eftir spurningum og birtir. 
  res.render('category', { title: catName[0].name, catId, questions, answers});
});



router.get('/form', (req, res) => {
  res.render('form', { title: 'Búa til spurningu fyrir flokk' });
});



router.post('/form', 
  createQuestionValidationMiddleware(),
  sanitizationMiddleware(),
  xssSanitizationMiddleware(),
  async (req, res) => {

    //athuga með villur í validation og rendera form aftur með upplýsingum um villur. 
    //mætti bæta við hér að reitir sem búið er að fylla inn í hreinsast ekki. 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('form', { errors: errors.array() });
    }

    //Búa til hlut sem inniheldur allar upplýsingar frá notanda, hér er búið að sanitizea. 
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

    res.render('form-created', { title: 'Spurning búin til og bætt við flokk ', category });
});
