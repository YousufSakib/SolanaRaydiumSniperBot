// const express = require("express");
// const { body, param, query } = require("express-validator");
// const authMiddleware = require("../middleware/auth");
// const validateRequest = require("../middleware/validateRequest");
// const {
//   WalletController,
//   TradingParametersController,
//   TransactionController,
//   UserController,
// } = require("../controllers");

// // Initialize routers
// const router = express.Router();
// const walletRouter = express.Router();
// const tradingRouter = express.Router();
// const transactionRouter = express.Router();
// const userRouter = express.Router();

// // Authentication Routes
// userRouter.post(
//   "/login",
//   [
//     body("email").isEmail().normalizeEmail(),
//     body("password").isLength({ min: 8 }),
//     validateRequest,
//   ],
//   UserController.login
// );

// userRouter.post("/logout", authMiddleware, UserController.logout);

// // Wallet Routes
// walletRouter.post(
//   "/",
//   [
//     authMiddleware,
//     body("publicKey").isString().trim().notEmpty(),
//     body("privateKey").isString().trim().notEmpty(),
//     validateRequest,
//   ],
//   WalletController.createWallet
// );

// walletRouter.get(
//   "/",
//   [
//     authMiddleware,
//     query("page").optional().isInt({ min: 1 }),
//     query("limit").optional().isInt({ min: 1, max: 100 }),
//     validateRequest,
//   ],
//   WalletController.getWallets
// );

// walletRouter.get(
//   "/:id",
//   [authMiddleware, param("id").isMongoId(), validateRequest],
//   WalletController.getWallet
// );

// walletRouter.delete(
//   "/:id",
//   [authMiddleware, param("id").isMongoId(), validateRequest],
//   WalletController.deleteWallet
// );

// walletRouter.put(
//   "/:id/balance",
//   [authMiddleware, param("id").isMongoId(), validateRequest],
//   WalletController.updateBalance
// );

// // Trading Parameters Routes
// tradingRouter.post(
//   "/",
//   [
//     authMiddleware,
//     body("buyParameters").isObject(),
//     body("buyParameters.buyInAmount.amount").isFloat({ min: 0 }),
//     body("buyParameters.buyInAmount.currency").isIn(["USD", "SOL"]),
//     body("buyParameters.tipAmount.amount").isFloat({ min: 0 }),
//     body("buyParameters.tipAmount.currency").isIn(["USD", "SOL"]),
//     body("buyParameters.slippagePercentage").isFloat({ min: 0, max: 100 }),
//     body("sellParameters").isObject(),
//     body("sellParameters.returnTriggerPercentage").isFloat({ min: 0 }),
//     body("sellParameters.maxTradeTimeMinutes").optional().isInt({ min: 0 }),
//     body("sellParameters.profitDistributionPercentage").isFloat({
//       min: 0,
//       max: 100,
//     }),
//     body("stopLossParameters").isObject(),
//     body("stopLossParameters.totalLossLimitPercentage").isFloat({
//       min: 0,
//       max: 100,
//     }),
//     validateRequest,
//   ],
//   TradingParametersController.createParameters
// );

// tradingRouter.get(
//   "/",
//   [authMiddleware, validateRequest],
//   TradingParametersController.getParameters
// );

// tradingRouter.put(
//   "/:id",
//   [
//     authMiddleware,
//     param("id").isMongoId(),
//     body("buyParameters").optional().isObject(),
//     body("sellParameters").optional().isObject(),
//     body("stopLossParameters").optional().isObject(),
//     validateRequest,
//   ],
//   TradingParametersController.updateParameters
// );

// // Transaction Routes
// transactionRouter.get(
//   "/",
//   [
//     authMiddleware,
//     query("page").optional().isInt({ min: 1 }),
//     query("limit").optional().isInt({ min: 1, max: 100 }),
//     query("status")
//       .optional()
//       .isIn(["PENDING", "COMPLETED", "FAILED", "CANCELLED"]),
//     query("type").optional().isIn(["BUY", "SELL"]),
//     query("startDate").optional().isISO8601(),
//     query("endDate").optional().isISO8601(),
//     query("sortBy").optional().isIn(["entryTime", "liquidity"]),
//     query("sortOrder").optional().isIn(["asc", "desc"]),
//     validateRequest,
//   ],
//   TransactionController.getTransactions
// );

// transactionRouter.get(
//   "/:id",
//   [authMiddleware, param("id").isMongoId(), validateRequest],
//   TransactionController.getTransaction
// );

// transactionRouter.post(
//   "/buy",
//   [
//     authMiddleware,
//     body("walletId").isMongoId(),
//     body("tokenAddress").isString().trim().notEmpty(),
//     body("amount").isFloat({ min: 0 }),
//     body("currency").isIn(["USD", "SOL"]),
//     validateRequest,
//   ],
//   TransactionController.createBuyTransaction
// );

// transactionRouter.post(
//   "/sell",
//   [authMiddleware, body("transactionId").isMongoId(), validateRequest],
//   TransactionController.createSellTransaction
// );

// // Analytics Routes
// transactionRouter.get(
//   "/analytics/overview",
//   [
//     authMiddleware,
//     query("startDate").optional().isISO8601(),
//     query("endDate").optional().isISO8601(),
//     validateRequest,
//   ],
//   TransactionController.getAnalyticsOverview
// );

// transactionRouter.get(
//   "/analytics/performance",
//   [
//     authMiddleware,
//     query("startDate").optional().isISO8601(),
//     query("endDate").optional().isISO8601(),
//     query("walletId").optional().isMongoId(),
//     validateRequest,
//   ],
//   TransactionController.getPerformanceMetrics
// );

// // Error handling middleware
// router.use((err, req, res, next) => {
//   console.error(err.stack);

//   if (err.name === "ValidationError") {
//     return res.status(400).json({
//       status: "error",
//       message: "Validation Error",
//       errors: err.errors,
//     });
//   }

//   if (err.name === "UnauthorizedError") {
//     return res.status(401).json({
//       status: "error",
//       message: "Unauthorized",
//     });
//   }

//   res.status(500).json({
//     status: "error",
//     message: "Internal Server Error",
//   });
// });

// // Register routes
// router.use("/users", userRouter);
// router.use("/wallets", walletRouter);
// router.use("/trading-parameters", tradingRouter);
// router.use("/transactions", transactionRouter);

// module.exports = router;
