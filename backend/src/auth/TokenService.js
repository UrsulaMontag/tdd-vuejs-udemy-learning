const { randomString } = require('../shared/generator');
const Token = require('./Token');

const createToken = async (user) => {
  const token = randomString(32);
  await Token.create({
    token: token,
    userId: user.id,
    lastUsedAt: new Date(),
  });
  return token;
};

const verify = async (token) => {
  const tokenInDB = await Token.findOne({
    where: {
      token: token,
    },
  });
  const userId = tokenInDB.userId;
  return { id: userId };
};

const deleteToken = async (token) => {
  Token.destroy({ where: { token: token } });
};

const clearTokens = async (userId) => {
  Token.destroyForUser({ where: { userId: userId } });
};

module.exports = {
  createToken,
  verify,
  deleteToken,
  clearTokens,
};
