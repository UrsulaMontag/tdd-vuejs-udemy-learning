const User = require('./User');
const EmailService = require('../email/EmailService');
const EmailException = require('../email/EmailException');
const InvalidTokenException = require('./InvalidTokenException');
const NotFoundException = require('../error/NotFoundException');
const { randomString } = require('../shared/generator');
const TokenService = require('../auth/TokenService');
const FileService = require('../file/FileService');

const save = async (body) => {
  const { username, email, password } = body;
  const user = { username, email, password, activationToken: randomString(16) };
  await User.create(user);
  try {
    await EmailService.sendAccountActivation(email, user.activationToken);
  } catch (err) {
    user.destroy();
    throw new EmailException();
  }
};

const findByEmail = async (email) => {
  return User.findByEmail(email);
};

const activate = async (token) => {
  const user = User.findByActivationToken(token);
  if (!user) {
    throw new InvalidTokenException();
  }
  user.inactive = false;
  user.activationToken = null;
  await user.save();
};

const getUsers = async (page, size, authenticatedUser) => {
  const id = authenticatedUser ? authenticatedUser.id : 0;
  const start = page * size;
  const end = start + size;
  const usersWithCount = User.findAndCountAll(start, end, id);
  return {
    content: usersWithCount.rows,
    page,
    size,
    totalPages: Math.ceil(usersWithCount.count / size),
  };
};

const getUser = async (id) => {
  const user = User.findActiveUserById(id);
  if (!user) {
    throw new NotFoundException('user_not_found');
  }
  return user;
};

const updateUser = async (id, updatedBody) => {
  const user = await User.findOne({ where: { id: id } });
  user.username = updatedBody.username;
  if (updatedBody.image) {
    if (user.image) {
      await FileService.deleteProfileImage(user.image);
    }
    user.image = await FileService.saveProfileImage(updatedBody.image);
  }
  await user.save();
  return {
    id: id,
    username: user.username,
    email: user.email,
    image: user.image,
  };
};

const deleteUser = async (id) => {
  const user = await User.findOne({ where: { id: id } });
  await FileService.deleteUserFiles(user);
  await user.destroy();
  await TokenService.clearTokens(user.id);
};

const passwordResetRequest = async (email) => {
  const user = await findByEmail(email);
  if (!user) {
    throw new NotFoundException('email_not_inuse');
  }
  user.passwordResetToken = randomString(16);
  await user.save();
  try {
    await EmailService.sendPasswordReset(email, user.passwordResetToken);
  } catch (err) {
    throw new EmailException();
  }
};

const updatePassword = async (token, body) => {
  const user = await findByPasswordResetToken(token);
  if(!user) {
    throw new InvalidTokenException('invalid_token');
  }
  user.password = body.password;
  user.passwordResetToken = null;
  user.inactive = false;
  user.activationToken = null;
  await user.save();
  await TokenService.clearTokens(user.id);
};

const findByPasswordResetToken = (token) => {
  return User.findByPasswordResetToken(token);
};

module.exports = {
  save,
  findByEmail,
  activate,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  passwordResetRequest,
  updatePassword,
  findByPasswordResetToken,
};
