const Boom = require('@hapi/boom');

/**
 * Basic mocking utility.
 * @returns Express middleware
 */
function mock(cases) {
  return (req, res, next) => {
    if (!req.query.mock) {
      return next();
    }

    let c = cases.find((i) => i.name == (req.query.case || req.query.mock));
    if (!c) {
      return next(
        Boom.badRequest(
          `Unknown case ${req.query.case || req.query.mock} specified in query params`,
        ),
      );
    }

    return res.json(c.payload);
  };
}

module.exports = mock;
