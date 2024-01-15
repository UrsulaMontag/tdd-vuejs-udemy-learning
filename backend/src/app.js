const express = require("express");
const cors = require('cors');
const UserRouter = require("./user/UserRouter");
const AuthenticationRouter = require("./auth/AuthenticationRouter");
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const errorHandler = require("./error/ErrorHandler");
const tokenAuthentication = require("./middleware/tokenAuthentication");
const FileService = require("./file/FileService");
const path = require("path");
const cookieParser = require('cookie-parser')

const profileFolder = path.join(
  ".",
  FileService.config.uploadDir,
  FileService.config.profileDir
);

const ONE_YEAR_IN_MILLIS = 365 * 24 * 60 * 60 * 1000;

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    lng: "en",
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: "./locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      lookupHeader: "accept-language",
    },
  });

FileService.createFolders();

const app = express();
app.use(cors());

app.use(middleware.handle(i18next));

app.use(express.json({ limit: "3mb" }));
app.use(cookieParser())

app.use(
  "/images",
  express.static(profileFolder, { maxAge: ONE_YEAR_IN_MILLIS })
);

app.use(tokenAuthentication);

app.use(UserRouter);
app.use(AuthenticationRouter);

app.use(errorHandler);

module.exports = app;
