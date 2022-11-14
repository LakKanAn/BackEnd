require("dotenv").config();
require("./services/con-jobs");
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || process.env.API_PORT;

const app = express();
const API_PATH = `/v1`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
  })
);

// docs API
if (process.env.NODE_ENV == "development") {
  const swaggerUi = require("swagger-ui-express");
  const swaggerSpec = require("./configuration/swagger");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// route
const siteRouter = require("./routes/site");
const userRouter = require("./routes/user");
const distributorRouter = require("./routes/distributor");
const marketRouter = require("./routes/market");
const paymentRouter = require("./routes/payment");
const tradeRouter = require("./routes/trade");
const adminRouter = require("./routes/admin");
// API
app.use(`${API_PATH}/admin/`, adminRouter);
app.use(`${API_PATH}/market/`, marketRouter);
app.use(`${API_PATH}/site/`, siteRouter);
app.use(`${API_PATH}/users/`, userRouter);
app.use(`${API_PATH}/distributors/`, distributorRouter);
app.use(`${API_PATH}/payment/`, paymentRouter);
app.use(`${API_PATH}/trade/`, tradeRouter);

app.get("/", (req, res) => {
  res.json({
    data: `${API_PATH} is ready`,
  });
});

/// Post
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

// set 404 page
app.use("*", (req, res, next) => {
  res.status(404).json({
    error: {
      code: 404,
      message: `Method ${req.method} ${req._parsedUrl.path} is not founded`,
      data: `Method ${req.method} ${req._parsedUrl.path} is not founded`,
    },
  });
});

// handle error
app.use((error, req, res, next) => {
  res.status(error.statusCode).json({
    error: {
      code: error.statusCode,
      message: error.message,
      data: error.data,
    },
  });
});
module.exports = app;
