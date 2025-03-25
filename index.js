import express, { json } from "express";
import appRouter from "./src/routes/appRouter.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser("safal"));
app.use(appRouter);
// Registering router in our index.js file

// Middleware
const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next();
};

app.use(loggingMiddleware, (req, res, next) => {
  console.log("Completed Middleware");
  next();
});

// Sample data

// Middleware to resolve user index from URL param

const PORT = process.env.PORT || 3000;

// GET Request: Root
app.get(
  "/",
  (req, res, next) => {
    console.log("Base url 1");
    next();
  },
  (req, res, next) => {
    console.log("Base url 2");
    next();
  },
  (req, res, next) => {
    console.log("Base url 3");
    next();
  },
  (req, res) => {
    res.cookie("Hello", "World", { maxAge: 60000,signed:true });
    res.json({ msg: "Hello World!" });
  }
);

// GET Request: Users with optional filtering

// GET Request: Products

// POST Request: Create a new user

app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});
