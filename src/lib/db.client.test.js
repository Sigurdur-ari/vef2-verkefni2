//Mest megnið af skránni fengið frá sýnilausn Óla á v2 2024
//test fyrir föllin insertQuestion og insertAnswers eru mín smíð. (merkt með commenti)

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Database } from './db.client';

describe('db', () => {
    /** @type import('./logger').Logger */
    let mockLogger;
  
    beforeEach(() => {
      mockLogger = {
        silent: false,
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };
    });
  
    it('should create a new db connection', () => {
      const db = new Database('connectionString', mockLogger);
  
      expect(db.connectionString).toBe('connectionString');
    });
  
    it('should open a new db connection', () => {
      const db = new Database('connectionString', mockLogger);
  
      db.open();
      expect(db.pool).not.toBeNull();
    });
  
    it('should log if error occurs in db connection', () => {
      const db = new Database('connectionString', mockLogger);
  
      db.open();
      db.pool?.emit('error', 'error');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'error in database pool',
        'error',
      );
    });
  
    it('should close a db connection', async () => {
      const db = new Database('connectionString', mockLogger);
  
      db.open();
      await db.close();
      expect(db.pool).toBeNull();
    });
  
    it('should not close a undefined db connection', () => {
      const db = new Database('connectionString', mockLogger);
  
      db.close();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'unable to close database connection that is not open',
      );
    });
  
    it('should not connect to a undefined db', async () => {
      const db = new Database('connectionString', mockLogger);
  
      db.open();
      const client = await db.connect();
      expect(client).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'error connecting to db',
        expect.anything(),
      );
    });
  
    it('should connect to a mock db pool', async () => {
      const db = new Database('connectionString', mockLogger);
  
      db.open();
      // switch pool out for mock
      /** @type any */
      const mockPool = {
        connect: jest.fn(),
      };
      db.pool = mockPool;
  
      const client = await db.connect();
      expect(client).not.toBeNull();
      expect(mockLogger.error).not.toHaveBeenCalled();
      expect(mockPool.connect).toHaveBeenCalled();
    });
  
    it('should not query if no connection', async () => {
      const db = new Database('connectionString', mockLogger);
  
      const result = await db.query('SELECT * FROM test');
      expect(result).toBeNull();
    });
  
    it('should query if connection', async () => {
      const db = new Database('connectionString', mockLogger);
  
      db.open();
      // switch pool out for mock
      /** @type any */
      const mockPool = {
        connect: jest.fn().mockReturnValue({
          query: jest.fn().mockReturnValue({ rows: [] }),
          release: jest.fn(),
        }),
      };
      db.pool = mockPool;
  
      const result = await db.query('SELECT * FROM test');
      expect(result).toStrictEqual({ rows: [] });
    });

    //Prufar insertQuestion
    it('Should insert a question into the database and return the questionId of that question', async () => {
        const db = new Database('connectionString', mockLogger);

        db.open();
        db.query = jest.fn().mockResolvedValue({rowCount: 1, rows: [{questionid: 10}]})

        const qId = await db.insertQuestion('ABCDEFGHIJKLMNOP', '1');

        expect(qId).toBe(10);
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO questions (categoryId, content) VALUES ($1, $2) RETURNING questionId', 
            ['1', 'ABCDEFGHIJKLMNOP']
        );
        
    });

    //prufar insertAnswers
    it('Should insert an array of answers to the database and return true if it succeeds', async () => {
        const db = new Database('connectionString', mockLogger);

        db.open();
        db.query = jest.fn().mockResolvedValue({rowCount: 1})

        const answers = [
            {answer: 'HTML', correct: true},
            {answer: 'CSS', correct: false},
            {answer: 'JS', correct: false},
            {answer: 'JAVA', correct: false},
        ]

        const result = await db.insertAnswers(answers, 10);

        expect(result).toBe(true);
        expect(db.query).toHaveBeenCalledTimes(4);
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO answers (qId, content, correct) VALUES ($1, $2, $3)', 
            [10, 'HTML', true]
        );
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO answers (qId, content, correct) VALUES ($1, $2, $3)', 
            [10, 'CSS', false]
        );
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO answers (qId, content, correct) VALUES ($1, $2, $3)', 
            [10, 'JS', false]
        );
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO answers (qId, content, correct) VALUES ($1, $2, $3)', 
            [10, 'JAVA', false]
        );
    });

    //prufar fail case á insertQuestion
    it('Should return -1 if a question fails to insert', async () => {
        const db = new Database('connectionString', mockLogger);

        db.open();
        /** @type any */
        const mockPool = {
            connect: jest.fn().mockReturnValue({
              query: jest.fn().mockResolvedValue({rowCount: 0}),
              release: jest.fn(),
            }),
          };
        db.pool = mockPool;

        const qId = await db.insertQuestion('ABCDEFGHIJKLMNOP', '1');

        expect(qId).toBe(-1);
    });

    //prufar fail case á insertAnswer
    it('Should return false if', async () => {
        const db = new Database('connectionString', mockLogger);

        db.open();
        /** @type any */
        const mockPool = {
            connect: jest.fn().mockReturnValue({
              query: jest.fn()
                    .mockResolvedValueOnce({rowCount: 1})
                    .mockResolvedValueOnce({rowCount: 1})
                    .mockResolvedValueOnce({rowCount: 1})
                    .mockResolvedValueOnce({rowCount: 0}),
              release: jest.fn(),
            }),
          };
        db.pool = mockPool;

        const answers = [
            {answer: 'HTML', correct: true},
            {answer: 'CSS', correct: false},
            {answer: 'JS', correct: false},
            {answer: 'JAVA', correct: false},
        ]

        const result = await db.insertAnswers(answers, 10);

        expect(result).toBe(false);
    });
  });