const express = require("express");
const router = express.Router();
const UserService = require("../user/UserService");
const AuthenticationException = require("./AuthenticationException");
const ForbiddenException = require("../error/ForbiddenException");
const ValidationException = require("../error/ValidationException");
const { check, validationResult } = require("express-validator");
const TokenService = require("./TokenService");

router.post(
  "/api/v1/auth",
  check("email").isEmail().withMessage("email_invalid"),
  check("password").isLength({ min: 6 }).withMessage("password_size"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }

    const { email, password } = req.body;
    const user = await UserService.findByEmail(email);
    if (!user) {
      return next(new AuthenticationException());
    }
    const match = password === user.password;
    if (!match) {
      return next(new AuthenticationException());
    }
    if (user.inactive) {
      return next(new ForbiddenException());
    }
    const token = await TokenService.createToken(user);
    res.cookie("app-cookie", `${token}`, {
      secure: false,
      httpOnly: true,
    });
    res.send({
      id: user.id,
      username: user.username,
      email: user.email,
      image: user.image,
    });
  }
);

router.post("/api/v1/logout", async (req, res) => {
  const authorization = req.cookies["app-cookie"];
  if (authorization) {
    await TokenService.deleteToken(authorization);
  }
  res.clearCookie("app-cookie");
  res.send({});
});

module.exports = router;
