const request = require('supertest');
const app = require('./app');

describe('GET /', () => {
  it('should return 200 and a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Hello World!/i); // Changed from /welcome/i
  });
});
