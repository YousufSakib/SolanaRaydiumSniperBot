// Models for the Solana Sniper Bot

const mongoose = require("mongoose");
const crypto = require("crypto");

// Encryption Helper Function
function encryptPrivateKey(privateKey) {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Decryption Helper Function
function decryptPrivateKey(encryptedKey) {
  const decipher = crypto.createDecipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY
  );
  let decrypted = decipher.update(encryptedKey, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// User Schema
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Wallet Schema
const WalletSchema = new mongoose.Schema(
  {
    publicKey: {
      type: String,
      required: true,
      unique: true,
    },
    privateKey: {
      type: String,
      required: true,
      set: encryptPrivateKey,
    },
  },
  { timestamps: true }
);

// Transaction Schema
const TransactionSchema = new mongoose.Schema(
  {
    tokenName: {
      type: String,
      required: true,
    },
    tokenSymbol: {
      type: String,
      required: true,
    },
    tokenAddress: {
      type: String,
      required: true,
    },
    transactionSignature: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    entryTime: {
      type: Date,
      required: true,
    },
    exitTime: Date,
    purchasePrice: {
      type: Number,
      required: true,
    },
    salePrice: Number,
    liquidity: Number,
    tipAmount: Number,
    fees: Number,
    profitOrLoss: Number,
  },
  { timestamps: true }
);

// Parameters Schema
const ParametersSchema = new mongoose.Schema(
  {
    buyInAmount: {
      type: Number,
      required: true,
    },
    tipAmount: {
      type: Number,
      required: true,
    },
    slippagePercentage: {
      type: Number,
      required: true,
    },
    returnTriggerPercentage: {
      type: Number,
      required: true,
    },
    maxTradeTime: {
      type: Number,
      default: null, // In minutes
    },
    profitDistribution: {
      type: Number,
      required: true, // Percentage (0-100)
    },
    stopLossLimit: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Models
const User = mongoose.model("User", UserSchema);
const Wallet = mongoose.model("Wallet", WalletSchema);
const Transaction = mongoose.model("Transaction", TransactionSchema);
const Parameters = mongoose.model("Parameters", ParametersSchema);

module.exports = {
  User,
  Wallet,
  Transaction,
  Parameters,
};
