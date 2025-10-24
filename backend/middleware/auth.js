const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

function createJwtMiddleware(audience, issuer) {
  return jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      jwksUri: `https://${issuer}/.well-known/jwks.json`
    }),
    audience: audience,
    issuer: `https://${issuer}/`,
    algorithms: ['RS256']
  });
}

module.exports = { createJwtMiddleware };
