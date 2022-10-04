function wrap(asyncFn) {
  return (request, response, next) => asyncFn(request, response, next).catch(next);
}

module.exports = wrap;
