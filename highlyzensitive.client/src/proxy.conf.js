const { env } = require('process');

const target = 'http://localhost:5000';

const PROXY_CONFIG = [
  {
    context: [
      "/calendar",
      "/gmail",
      "/newsletter",
    ],
    target,
    secure: false
  }
]

module.exports = PROXY_CONFIG;
