const express = require('express');
const mock = require('../helpers/mock.js');

const app = express();

app.use(
  '/api/',
  mock([
    
  ]),
);

module.exports = app;
