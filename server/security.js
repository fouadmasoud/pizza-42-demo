const { expressjwt: jwt } = require("express-jwt");
const jwtScope = require("express-jwt-scope");
const jwksRsa = require("jwks-rsa");

const jwtConfig = {
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.DOMAIN}/.well-known/jwks.json`,
  }),

  audience: process.env.AUDIENCE,
  issuer: `https://${process.env.DOMAIN}/`,
  algorithms: ["RS256"],
};


const checkJwt = jwt(jwtConfig);

const scope_order = jwtScope("create:order");

module.exports = { checkJwt, scope_order };
