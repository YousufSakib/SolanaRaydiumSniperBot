const express = require("express");
const { authMiddleware } = require("../middleware/auth");

const { userController } = require("../controllers/user/user");

const userRouter = express.Router();

userRouter.post("/login", userController.login);
userRouter.post("/logout", authMiddleware, userController.logout);
userRouter.post(
  "/changePassword",
  authMiddleware,
  userController.changePassword
);
module.exports = userRouter;
