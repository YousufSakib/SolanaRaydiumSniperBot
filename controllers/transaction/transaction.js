const {
  Transaction,
  TradingParameters,
  Wallet,
} = require("../../models/models.js");
const { Web3Connection } = require("../services/blockchain");

class TransactionController {
  /**
   * Create buy transaction
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async createBuyTransaction(req, res) {
    try {
      const { walletId, tokenAddress, amount, currency } = req.body;

      // Verify wallet exists
      const wallet = await Wallet.findById(walletId);
      if (!wallet) {
        return res.status(404).json({
          status: "error",
          message: "Wallet not found",
        });
      }

      // Get active trading parameters
      const tradingParams = await TradingParameters.findOne({ isActive: true });
      if (!tradingParams) {
        return res.status(400).json({
          status: "error",
          message: "No active trading parameters found",
        });
      }

      // Create transaction
      const transaction = new Transaction({
        wallet: walletId,
        tokenAddress,
        type: "BUY",
        status: "PENDING",
        entryTime: new Date(),
        purchasePrice: amount,
        tipAmount: {
          amount: tradingParams.buyParameters.tipAmount.amount,
          currency: tradingParams.buyParameters.tipAmount.currency,
        },
      });

      // Execute buy order
      const result = await TransactionController.executeBuyOrder(
        wallet,
        tokenAddress,
        amount,
        currency,
        tradingParams
      );

      // Update transaction with results
      transaction.transactionSignature = result.signature;
      transaction.blockExplorerUrl = `https://explorer.solana.com/tx/${result.signature}`;
      transaction.status = "COMPLETED";
      transaction.buyingFees = result.fees;
      transaction.liquidity = result.liquidity;

      await transaction.save();

      res.status(201).json({
        status: "success",
        data: transaction,
      });
    } catch (error) {
      console.error("Create Buy Transaction Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while creating buy transaction",
      });
    }
  }

  /**
   * Create sell transaction
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async createSellTransaction(req, res) {
    try {
      const { transactionId } = req.body;

      // Find buy transaction
      const buyTransaction = await Transaction.findById(transactionId);
      if (!buyTransaction) {
        return res.status(404).json({
          status: "error",
          message: "Buy transaction not found",
        });
      }

      if (buyTransaction.type !== "BUY") {
        return res.status(400).json({
          status: "error",
          message: "Referenced transaction is not a buy transaction",
        });
      }

      // Get trading parameters
      const tradingParams = await TradingParameters.findOne({ isActive: true });
      if (!tradingParams) {
        return res.status(400).json({
          status: "error",
          message: "No active trading parameters found",
        });
      }

      // Execute sell order
      const result = await TransactionController.executeSellOrder(
        buyTransaction,
        tradingParams
      );

      // Create sell transaction
      const sellTransaction = new Transaction({
        wallet: buyTransaction.wallet,
        tokenAddress: buyTransaction.tokenAddress,
        type: "SELL",
        status: "COMPLETED",
        entryTime: new Date(),
        salePrice: result.price,
        transactionSignature: result.signature,
        blockExplorerUrl: `https://explorer.solana.com/tx/${result.signature}`,
        sellingFees: result.fees,
        liquidity: result.liquidity,
        profitLoss: result.profitLoss,
      });

      await sellTransaction.save();

      res.status(201).json({
        status: "success",
        data: sellTransaction,
      });
    } catch (error) {
      console.error("Create Sell Transaction Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while creating sell transaction",
      });
    }
  }

  /**
   * Get transactions with filtering and pagination
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        startDate,
        endDate,
        sortBy = "entryTime",
        sortOrder = "desc",
      } = req.query;

      // Build query
      const query = {};
      if (status) query.status = status;
      if (type) query.type = type;
      if (startDate || endDate) {
        query.entryTime = {};
        if (startDate) query.entryTime.$gte = new Date(startDate);
        if (endDate) query.entryTime.$lte = new Date(endDate);
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      // Execute query
      const [transactions, total] = await Promise.all([
        Transaction.find(query)
          .populate("wallet", "publicKey")
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Transaction.countDocuments(query),
      ]);

      res.json({
        status: "success",
        data: {
          transactions,
          pagination: {
            current: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get Transactions Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while fetching transactions",
      });
    }
  }

  /**
   * Get analytics overview
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getAnalyticsOverview(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Build date range query
      const dateQuery = {};
      if (startDate || endDate) {
        dateQuery.entryTime = {};
        if (startDate) dateQuery.entryTime.$gte = new Date(startDate);
        if (endDate) dateQuery.entryTime.$lte = new Date(endDate);
      }

      // Aggregate metrics
      const metrics = await Transaction.aggregate([
        { $match: { ...dateQuery, status: "COMPLETED" } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalBuyTransactions: {
              $sum: { $cond: [{ $eq: ["$type", "BUY"] }, 1, 0] },
            },
            totalSellTransactions: {
              $sum: { $cond: [{ $eq: ["$type", "SELL"] }, 1, 0] },
            },
            totalProfit: { $sum: "$profitLoss" },
            averageProfit: { $avg: "$profitLoss" },
            totalFees: { $sum: { $add: ["$buyingFees", "$sellingFees"] } },
          },
        },
      ]);

      res.json({
        status: "success",
        data: metrics[0] || {
          totalTransactions: 0,
          totalBuyTransactions: 0,
          totalSellTransactions: 0,
          totalProfit: 0,
          averageProfit: 0,
          totalFees: 0,
        },
      });
    } catch (error) {
      console.error("Get Analytics Overview Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while fetching analytics",
      });
    }
  }

  /**
   * Mock method to simulate buy order execution
   * Replace with actual blockchain integration
   */
  static async executeBuyOrder(
    wallet,
    tokenAddress,
    amount,
    currency,
    tradingParams
  ) {
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      signature: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      fees: amount * 0.01,
      liquidity: amount * 10,
    };
  }

  /**
   * Mock method to simulate sell order execution
   * Replace with actual blockchain integration
   */
  static async executeSellOrder(buyTransaction, tradingParams) {
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const salePrice = buyTransaction.purchasePrice * 1.1; // Simulate 10% profit

    return {
      signature: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      price: salePrice,
      fees: salePrice * 0.01,
      liquidity: salePrice * 10,
      profitLoss: salePrice - buyTransaction.purchasePrice,
    };
  }
}

module.exports = TransactionController;
