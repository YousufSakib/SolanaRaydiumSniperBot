const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const responseFormatter = require("./middleware/responseFormatter");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");

const tradingParametersRouter = require('./routes/tradingParameters');
const userRouter = require('./routes/user')
const walletRouter = require('./routes/wallet');
const transactionRouter = require('./routes/transaction');

const app = express();

const corsOptions = {
  origin: "*",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(logger);
app.use(responseFormatter);
app.use(errorHandler);

app.use("/", (req, res, next) => res.sendResponse(200, "App is in running."));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
