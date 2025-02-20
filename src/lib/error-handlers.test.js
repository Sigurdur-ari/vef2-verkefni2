import { describe, expect, it, jest } from '@jest/globals';
import { handle404Error, handleError } from './error-handlers';

//Fengið úr sýnilausn Óla á v2 frá 2024 þar sem error-handlers.js er mjög svipuð og handlers.js þar.

describe('handler', () => {
  it('should handle 404', async () => {
    /** @type any */ // overwriting type for testing purposes
    const res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
    handle404Error(null, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.render).toHaveBeenCalledWith('error', {
      message: 'Síða fannst ekki',
    });
  });

  it('should handle error', async () => {
    /** @type any */ // overwriting type for testing purposes
    const res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
    const err = new Error('error');
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    handleError(err, null, res, null);

    expect(spy).toHaveBeenCalledWith('error occured', err, null);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith('error', {
      title: 'Villa kom upp',
    });

    spy.mockRestore();
  });
});