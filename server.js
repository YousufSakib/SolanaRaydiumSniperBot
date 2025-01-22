const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const responseFormatter = require("./middleware/responseFormatter");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");

const loginRouter = require("./routes/user");

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
