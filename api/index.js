const { createServer } = require('../build/server');
const { createStreamableHttpHandler } = require('../build/services');

const handler = createStreamableHttpHandler(createServer);

module.exports = async (req, res) => {
  await handler(req, res);
}; 