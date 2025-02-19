import { body } from 'express-validator';
import xss from 'xss';

export function createQuestionValidationMiddleware(){
    return [
        body('question')
            .notEmpty().withMessage('Spurning getur ekki verið tóm')
            .isLength({ min:10, max: 300 }).withMessage('Spurning ekki af réttri lengd, max = 300 stafir, min = 10 stafir'), 
        body('answer1')
            .notEmpty().withMessage('Svar 1 má ekki vera tómt')
            .isLength({ min:1, max: 200 }).withMessage('Svar 1 ekki af réttri lengd, max = 200 stafir, min = 1 stafur'),
        body('answer2')
            .notEmpty().withMessage('Svar 2 má ekki vera tómt')
            .isLength({ min:1, max: 200 }).withMessage('Svar 2 ekki af réttri lengd, max = 200 stafir, min = 1 stafur'),
        body('answer3')
            .notEmpty().withMessage('Svar 3 má ekki vera tómt')
            .isLength({ min:1, max: 200 }).withMessage('Svar 3 ekki af réttri lengd, max = 200 stafir, min = 1 stafur'),
        body('answer4')
            .notEmpty().withMessage('Svar 4 má ekki vera tómt')
            .isLength({ min:1, max: 200 }).withMessage('Svar 4 ekki af réttri lengd, max = 200 stafir, min = 1 stafur'),
        body('rett_svar')
            .notEmpty().withMessage('Verður að velja rétt svar')
            .isIn(['1', '2', '3', '4']).withMessage('Rétt svar verður að vera 1, 2, 3 eða 4'),
        body('category')
            .notEmpty().withMessage('Verður að velja flokk')
            .isIn(['1', '2', '3', 1, 2, 3]).withMessage('Flokkur verður að vera gildur'),
    ];
}

export function xssSanitizationMiddleware() {
    return [
      body('date').customSanitizer((v) => xss(v)),
      body('home').customSanitizer((v) => xss(v)),
      body('away').customSanitizer((v) => xss(v)),
      body('home_score').customSanitizer((v) => xss(v)),
      body('away_score').customSanitizer((v) => xss(v)),
    ];
  }
  
  export function sanitizationMiddleware() {
    return [
      body('date').trim().escape(),
      body('home').trim().escape(),
      body('away').trim().escape(),
      body('home_score').trim().escape(),
      body('away_score').trim().escape(),
    ];
  }