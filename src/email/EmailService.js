const logger = require('../shared/logger');

const sendAccountActivation = async (email, token) => {
  const url = `http://localhost:5173/activation/${token}`;
  logger.info(url);
};

const sendPasswordReset = async (email, token) => {
  const url = `http://localhost:5173/password-reset/set?tk=${token}`;
  logger.info(url);
};

module.exports = { sendAccountActivation, sendPasswordReset };
