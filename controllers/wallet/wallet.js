const crypto = require("crypto-js");
const { Wallet } = require("../../models/models.js");

/**
 * Wallet Controller
 * Handles wallet-related operations
 */
class WalletController {
  /**
   * Create new wallet
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async createWallet(req, res) {
    try {
      const { publicKey, privateKey } = req.body;

      // Check if wallet already exists
      const existingWallet = await Wallet.findOne({ publicKey });
      if (existingWallet) {
        return res.status(400).json({
          status: "error",
          message: "Wallet with this public key already exists",
        });
      }

      // Create new wallet instance
      const wallet = new Wallet({
        publicKey,
        encryptedPrivateKey: crypto.AES.encrypt(
          privateKey,
          process.env.ENCRYPTION_KEY
        ).toString(),
      });

      // Save wallet
      await wallet.save();

      res.status(201).json({
        status: "success",
        data: {
          id: wallet._id,
          publicKey: wallet.publicKey,
          balance: wallet.balance,
          createdAt: wallet.createdAt,
        },
      });
    } catch (error) {
      console.error("Create Wallet Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while creating wallet",
      });
    }
  }

  /**
   * Get all wallets with pagination
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getWallets(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [wallets, total] = await Promise.all([
        Wallet.find()
          .select("-encryptedPrivateKey")
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Wallet.countDocuments(),
      ]);

      res.json({
        status: "success",
        data: {
          wallets,
          pagination: {
            current: page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get Wallets Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while fetching wallets",
      });
    }
  }

  /**
   * Get single wallet by ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getWallet(req, res) {
    try {
      const wallet = await Wallet.findById(req.params.id).select(
        "-encryptedPrivateKey"
      );

      if (!wallet) {
        return res.status(404).json({
          status: "error",
          message: "Wallet not found",
        });
      }

      res.json({
        status: "success",
        data: wallet,
      });
    } catch (error) {
      console.error("Get Wallet Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while fetching wallet",
      });
    }
  }

  /**
   * Update wallet balance
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updateBalance(req, res) {
    try {
      const wallet = await Wallet.findById(req.params.id);
      if (!wallet) {
        return res.status(404).json({
          status: "error",
          message: "Wallet not found",
        });
      }

      // Here you would typically:
      // 1. Connect to Solana blockchain
      // 2. Fetch real balance
      // 3. Update database

      // For now, we'll simulate this
      const newBalance = await WalletController.fetchBalanceFromBlockchain(
        wallet.publicKey
      );

      wallet.balance = newBalance;
      wallet.updatedAt = new Date();
      await wallet.save();

      res.json({
        status: "success",
        data: {
          id: wallet._id,
          publicKey: wallet.publicKey,
          balance: wallet.balance,
          updatedAt: wallet.updatedAt,
        },
      });
    } catch (error) {
      console.error("Update Balance Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while updating balance",
      });
    }
  }

  /**
   * Delete wallet
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async deleteWallet(req, res) {
    try {
      const wallet = await Wallet.findById(req.params.id);
      if (!wallet) {
        return res.status(404).json({
          status: "error",
          message: "Wallet not found",
        });
      }

      await wallet.remove();

      res.json({
        status: "success",
        message: "Wallet successfully deleted",
      });
    } catch (error) {
      console.error("Delete Wallet Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while deleting wallet",
      });
    }
  }

  /**
   * Mock method to simulate blockchain interaction
   * Replace with actual blockchain integration
   */
  static async fetchBalanceFromBlockchain(publicKey) {
    // Simulate blockchain request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Math.random() * 100; // Mock balance
  }
}

module.exports = WalletController;
