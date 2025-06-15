const compression = require("compression");
const express = require("express");
const cors = require("cors");
const { default: helmet, crossOriginResourcePolicy } = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: [process.env.BASE_URL_CLIENT],
};
app.use(cors(corsOptions));
require("./dbs/init.mongodb");
//init router
app.use("/", require("./routers"));

app.use((req, res, next) => {
  const error = new Error("not Found");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "internal error",
  });
});
module.exports = app;
