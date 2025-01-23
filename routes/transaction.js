const express = require("express");
const { authMiddleware } = require("../middleware/auth");

const 
  transactionController
 = require("../controllers/transaction/transaction");

const transactionRouter = express.Router();

transactionRouter.get(
  "/",
  authMiddleware,
  transactionController.getTransactions
);

transactionRouter.get(
  "/:id",
  authMiddleware,
  transactionController.getTransaction
);

transactionRouter.post(
  "/buy",
  authMiddleware,
  transactionController.createBuyTransaction
);

transactionRouter.post(
  "/sell",
  authMiddleware,
  transactionController.createSellTransaction
);

// Analytics Routes
transactionRouter.get(
  "/analytics/overview",
  authMiddleware,
  transactionController.getAnalyticsOverview
);

transactionRouter.get(
  "/analytics/performance",
  authMiddleware,
  transactionController.getPerformanceMetrics
);

module.exports = transactionRouter;
