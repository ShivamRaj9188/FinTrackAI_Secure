const crypto = require('crypto');

let dynamicJwtSecret = null;
let dynamicSessionSecret = null;

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  
  if (!dynamicJwtSecret) {
    console.warn('⚠️ WARNING: No JWT_SECRET found in environment variables. Generating a secure random secret for this session. (Users will need to re-login if the server restarts)');
    dynamicJwtSecret = crypto.randomBytes(64).toString('hex');
  }
  
  return dynamicJwtSecret;
};

const getSessionSecret = () => {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  
  if (!dynamicSessionSecret) {
    console.warn('⚠️ WARNING: No SESSION_SECRET found in environment variables. Generating a secure random secret for this session.');
    dynamicSessionSecret = crypto.randomBytes(64).toString('hex');
  }
  
  return dynamicSessionSecret;
};

module.exports = { getJwtSecret, getSessionSecret };
