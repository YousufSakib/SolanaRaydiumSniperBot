const express = require("express");
const { authMiddleware } = require("../middleware/auth");

const { walletController } = require("../controllers/wallet/wallet");

const walletRouter = express.Router();

walletRouter.post("/", authMiddleware, walletController.createWallet);

walletRouter.get("/", authMiddleware, walletController.getWallets);

walletRouter.get("/:id", authMiddleware, walletController.getWallet);

walletRouter.delete("/:id", authMiddleware, walletController.deleteWallet);

// walletRouter.put(
//   "/:id/balance",
//   authMiddleware,
//   walletController.updateBalance
// );

module.exports = walletRouter;
