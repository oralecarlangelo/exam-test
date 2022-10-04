require('dotenv/config');

const Next = require('next');
const express = require('express');
const session = require('express-session');
const boom = require('@hapi/boom');
const cors = require('cors');
const multer = require('multer');
const wrap = require('./helpers/wrap.js');
const CS = require('./services/serverCommunication.js');

const mocks = require('./loaders/mocks.js');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const next = Next({ dev });
const handle = next.getRequestHandler();

next.prepare().then(() => {
  const upload = multer({ storage: multer.memoryStorage() });
  const app = express();

  app.all('*', (req, res, next) => {
    if (req.url.startsWith('/api/')) {
      return next();
    }
    return handle(req, res);
  });

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      name: 'sid',
      secret: process.env.COOKIE_SECRET || 'secret',
      cookie: {
        secure: false,
      },
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    app.use(mocks);
  }

  // Proxy to CS
  app.use(
    '/api',
    wrap(async (req, res) => {
      let { credentials, data, status, headers } = await CS.invoke(req.session.credentials, {
        method: req.method,
        url: req.url,
        data: req.body,
        params: req.query,
      });
      req.session.credentials = credentials;
      res.status(status).set(headers).json(data);
    }),
  );

  // Error handler
  app.use(async (err, req, res, next) => {
    console.error(err);
    if (!boom.isBoom(err)) {
      err = boom.internal();
    }

    if (err.output.statusCode === 401) {
      await new Promise((resolve, reject) =>
        req.session.destroy((err) => (err ? reject(err) : resolve())),
      );
    }

    res.status(err.output.statusCode).json({
      status: 'NOK',
      data: err.output.payload,
    });
  });

  const server = app.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });

  
});
