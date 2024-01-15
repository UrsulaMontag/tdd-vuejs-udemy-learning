let tokens = [];

const create = (token) => {
  token.save = () => {};
  token.destroy = () => {
    destroy({ where: { token: token.token } });
  };
  tokens.push(token);
  return token;
};

const findOne = ({ where: { token: token } }) => {
  return tokens.find((t) => t.token === token) || null;
};

const destroy = ({ where: { token: token } }) => {
  tokens = tokens.filter((t) => t.token !== token);
};

const destroyForUser = ({ where: { userId: userId } }) => {
  tokens = tokens.filter((t) => t.userId !== userId);
};

const findAll = ({ where: { userId: userId } }) => {
  return tokens.filter((t) => t.userId == userId);
};

module.exports = {
  create,
  findOne,
  destroy,
  destroyForUser,
  findAll,
};
