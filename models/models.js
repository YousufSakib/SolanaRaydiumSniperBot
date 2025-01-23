const mongoose = require("mongoose");
const crypto = require("crypto-js");

// Wallet Schema
const walletSchema = new mongoose.Schema(
  {
    publicKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    encryptedPrivateKey: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Trading Parameters Schema
const tradingParametersSchema = new mongoose.Schema(
  {
    buyParameters: {
      buyInAmount: {
        amount: { type: Number, required: true },
        currency: { type: String, enum: ["USD", "SOL"], required: true },
      },
      tipAmount: {
        amount: { type: Number, required: true },
        currency: { type: String, enum: ["USD", "SOL"], required: true },
      },
      slippagePercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    sellParameters: {
      returnTriggerPercentage: {
        type: Number,
        required: true,
        min: 0,
      },
      maxTradeTimeMinutes: {
        type: Number,
        min: 0,
      },
      profitDistributionPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    stopLossParameters: {
      totalLossLimitPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },
    // updatedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
  },
  { timestamps: true }
);

// Transaction Schema
const transactionSchema = new mongoose.Schema(
  {
    tokenName: {
      type: String,
      required: true,
      index: true,
    },
    tokenSymbol: {
      type: String,
      required: true,
      index: true,
    },
    tokenAddress: {
      type: String,
      required: true,
      index: true,
    },
    transactionSignature: {
      type: String,
      required: true,
      unique: true,
    },
    blockExplorerUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    entryTime: {
      type: Date,
      required: true,
      index: true,
    },
    exitTime: Date,
    purchasePrice: {
      type: Number,
      required: true,
    },
    salePrice: Number,
    liquidity: {
      type: Number,
      required: true,
      index: true,
    },
    tipAmount: {
      amount: Number,
      currency: { type: String, enum: ["USD", "SOL"] },
    },
    position: Number,
    buyingFees: {
      type: Number,
      required: true,
    },
    sellingFees: Number,
    profitLoss: Number,
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    indexes: [{ entryTime: -1 }, { liquidity: -1 }, { status: 1, type: 1 }],
  }
);

// User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN"],
      default: "ADMIN",
    },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Add methods to schemas
walletSchema.methods.encryptPrivateKey = function (privateKey) {
  this.encryptedPrivateKey = crypto.AES.encrypt(
    privateKey,
    process.env.ENCRYPTION_KEY
  ).toString();
};

transactionSchema.methods.calculateProfitLoss = function () {
  if (this.salePrice && this.purchasePrice) {
    this.profitLoss =
      this.salePrice -
      this.purchasePrice -
      (this.buyingFees + (this.sellingFees || 0));
    return this.profitLoss;
  }
  return null;
};

// Create models
const Wallet = mongoose.model("Wallet", walletSchema);
const TradingParameters = mongoose.model(
  "TradingParameters",
  tradingParametersSchema
);
const Transaction = mongoose.model("Transaction", transactionSchema);
const User = mongoose.model("User", userSchema);

module.exports = {
  Wallet,
  TradingParameters,
  Transaction,
  User,
};
