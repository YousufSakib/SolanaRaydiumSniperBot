const express = require("express");
const { authMiddleware } = require("../middleware/auth");

const 
  tradingParametersController
 = require("../controllers/tradingParameters/tradingParameters");

const tradingRouter = express.Router();

// Trading Parameters Routes
tradingRouter.post(
  "/",
  authMiddleware,
  tradingParametersController.createParameters
);

tradingRouter.get(
  "/",
  authMiddleware,
  tradingParametersController.getParameters
);

tradingRouter.put(
  "/:id",
  authMiddleware,
  tradingParametersController.updateParameters
);

module.exports = tradingRouter;
