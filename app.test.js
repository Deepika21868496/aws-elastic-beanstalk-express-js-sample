describe('GET /', () => {
const request = require('supertest');
const express = require('express');

describe('GET /', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.get('/', (req, res) => res.send('Hello World! My name is Deepika'));
  });

  it('should return 200 and a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Hello World! My name is Deepika/i);
  });
})
});
