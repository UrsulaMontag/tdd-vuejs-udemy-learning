const fs = require("fs");
const path = require("path");
const { randomString } = require("../shared/generator");
const FileType = require("file-type");

const uploadDir = "uploads-test";
const profileDir = "profile";

const profileFolder = path.join(".", uploadDir, profileDir);

const createFolders = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  if (!fs.existsSync(profileFolder)) {
    fs.mkdirSync(profileFolder);
  }
};

const saveProfileImage = async (base64File) => {
  const filename = randomString(32);
  const filePath = path.join(profileFolder, filename);
  await fs.promises.writeFile(filePath, base64File, "base64");
  return filename;
};

const deleteProfileImage = async (filename) => {
  const filePath = path.join(profileFolder, filename);
  await fs.promises.unlink(filePath);
};

const isLessThan2MB = (buffer) => {
  return buffer.length < 2 * 1024 * 1024;
};

const isSupportedFileType = async (buffer) => {
  const type = await FileType.fromBuffer(buffer);
  return !type
    ? false
    : type.mime === "image/png" || type.mime === "image/jpeg";
};

const deleteAttachment = async (filename) => {
  const filePath = path.join(attachmentFolder, filename);
  try {
    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);
  } catch (err) {}
};

const deleteUserFiles = async (user) => {
  if (user.image) {
    await deleteProfileImage(user.image);
  }
};

module.exports = {
  createFolders,
  saveProfileImage,
  deleteProfileImage,
  isLessThan2MB,
  isSupportedFileType,
  deleteAttachment,
  deleteUserFiles,
  config: {
    uploadDir,
    profileDir,
  },
};
