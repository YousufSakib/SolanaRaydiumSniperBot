const {
  Transaction,
  TradingParameters,
  Wallet,
} = require("../../models/models.js");

// const { Web3Connection } = require("../services/blockchain");

/**
 * Trading Parameters Controller
 * Handles trading configuration operations
 */
class TradingParametersController {
  /**
   * Create new trading parameters
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async createParameters(req, res) {
    try {
      const { buyParameters, sellParameters, stopLossParameters } = req.body;

      const tradingParams = new TradingParameters({
        buyParameters,
        sellParameters,
        stopLossParameters,
        updatedBy: req.user.id,
      });

      await tradingParams.save();

      res.status(201).json({
        status: "success",
        data: tradingParams,
      });
    } catch (error) {
      console.error("Create Trading Parameters Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while creating trading parameters",
      });
    }
  }

  /**
   * Get current trading parameters
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async getParameters(req, res) {
    try {
      const parameters = await TradingParameters.findOne({
        isActive: true,
      }).populate("updatedBy", "email");

      if (!parameters) {
        return res.status(404).json({
          status: "error",
          message: "No active trading parameters found",
        });
      }

      res.json({
        status: "success",
        data: parameters,
      });
    } catch (error) {
      console.error("Get Trading Parameters Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while fetching trading parameters",
      });
    }
  }

  /**
   * Update trading parameters
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  static async updateParameters(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      updateData.updatedBy = req.user.id;

      const parameters = await TradingParameters.findById(id);
      if (!parameters) {
        return res.status(404).json({
          status: "error",
          message: "Trading parameters not found",
        });
      }

      // Update parameters
      Object.assign(parameters, updateData);
      await parameters.save();

      res.json({
        status: "success",
        data: parameters,
      });
    } catch (error) {
      console.error("Update Trading Parameters Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while updating trading parameters",
      });
    }
  }
}

module.exports = TradingParametersController;
