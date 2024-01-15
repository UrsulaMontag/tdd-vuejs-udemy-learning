let users = [];

let nextId = 26;
for (let index = 1; index <= 25; index++) {
  const user = {
    id: index,
    username: `user${index}`,
    email: `user${index}@mail.com`,
    password: 'P4ssword',
    inactive: false,
    save: () => {},
    destroy: () => {
      deleteUserById(user.id);
    }
  };
  users.push(user);
}

const create = async (user) => {
  user.id = nextId;
  user.inactive = true;
  user.activationToken = '1234567890';
  user.save = () => {};
  user.destroy = () => {
    deleteUserById(user.id);
  };
  nextId += 1;
  users.push(user);
  return user;
};

const findByEmail = (email) => {
  return users.find((user) => user.email === email);
};

const findByActivationToken = (activationToken) => {
  return users.find((user) => user.activationToken === activationToken);
};

const findAndCountAll = (start, end, excludedId) => {
  const userList = users.filter((user) => user.id !== excludedId && !user.inactive);
  return {
    rows: userList.slice(start, end).map((user) => {
      const { id, username, email, image } = user;
      return {
        id,
        username,
        email,
        image,
      };
    }),
    count: userList.length,
  };
};

const findActiveUserById = (id) => {
  const user = users.find((user) => user.id == id && !user.inactive);
  if (user) {
    const { id, username, email, image } = user;
    return { id, username, email, image };
  }
};

const findByPasswordResetToken = (token) => {
  return users.find((user) => user.passwordResetToken == token);
};

const findOne = ({ where: { id } }) => {
  return users.find((user) => user.id == id);
};

const destroy = () => {
  users = [];
};

const findAll = () => {
  return users;
};

const deleteUserById = (id) => {
  users = users.filter((u) => u.id !== id);
};

module.exports = {
  create,
  findByEmail,
  findByActivationToken,
  findAndCountAll,
  findActiveUserById,
  findByPasswordResetToken,
  destroy,
  findAll,
  findOne,
};
