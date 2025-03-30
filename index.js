// ================================================
// Main Express Server Setup
// ================================================

// Import express and necessary middleware functions.
import express, { json } from "express";
// Import the application routes defined in appRouter.js
import appRouter from "./src/routes/appRouter.js";
// Import cookie-parser to parse and sign cookies.
import cookieParser from "cookie-parser";
// Import session middleware to manage user sessions.
import session from "express-session";
// Import express-validator functions for validating API endpoint inputs.
import { body, query, validationResult } from "express-validator";
// Import mock users array for custom authentication handling.
import { mockUsers } from "./src/utils/constants.js";
// Import Passport for authentication.
import passport from "passport";
// Import Mongoose for MongoDB interaction.
import mongoose from "mongoose";
// Import the local strategy configuration for Passport.
import localStrategy from "./strategies/local-strategy.js";

// Initialize the Express application.
const app = express();

// -------------------------
// Database Connection (MongoDB)
// -------------------------
mongoose
  .connect("mongodb://localhost/express_tutorial")
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

// -------------------------
// Middleware Setup
// -------------------------

// Use JSON parser middleware to automatically parse JSON payloads in incoming requests.
app.use(express.json());

// Use cookie-parser middleware to parse cookies; the secret is used for signing cookies.
app.use(cookieParser("safal"));

// Configure and set up session middleware.
// Sessions store data server-side, and the client receives a session ID as a cookie.
app.use(
  session({
    secret: "anson the dev", // secret key to sign the session ID cookie
    saveUninitialized: false, // do not save sessions that are unmodified
    resave: false, // do not save session if it hasn't been modified
    cookie: {
      maxAge: 1000 * 60 * 60, // set cookie expiration to 1 hour
    },
  })
);

// -------------------------
// Passport Authentication Setup
// -------------------------
// Initialize Passport and enable session support for persistent logins.
app.use(passport.initialize());
app.use(passport.session());

// Use the custom application routes defined in appRouter.
app.use(appRouter);

// -------------------------
// Authentication Endpoints using Passport and Custom Validation
// -------------------------

// Passport-based authentication endpoint.
// When a POST request is made to "/api/auth", Passport uses the local strategy to authenticate the user.
app.post("/api/auth", passport.authenticate("local"), (req, res) => {
  // After a successful authentication, Passport will serialize the user.
  // Return a 200 OK status on success.
  res.sendStatus(200);
});

// Endpoint to check authentication status via Passport.
// Logs session and user details, then returns the user object if authenticated.
app.get("/api/auth/status", (req, res) => {
  console.log("Inside /api/auth/status");
  console.log("Authenticated user:", req.user);
  console.log("Session details:", req.session);
  // If the user is authenticated, return the user object; otherwise, return 401.
  return req.user ? res.send(req.user) : res.sendStatus(401);
});

// Endpoint for logging out a user using Passport.
// It checks if a user is logged in, and then logs out using Passport's logOut method.
app.post("/api/auth/logout", (req, res) => {
  if (!req.user) return res.sendStatus(401);

  req.logOut((err) => {
    if (err) return res.sendStatus(400);
    res.sendStatus(200);
  });
});

// -------------------------
// Custom Middleware for Logging
// -------------------------

// Middleware to log every incoming request's method and URL.
const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next(); // Proceed to the next middleware in the chain
};

// Use the logging middleware along with an additional inline middleware that logs a completion message.
app.use(loggingMiddleware, (req, res, next) => {
  console.log("Completed Middleware");
  next();
});

// -------------------------
// Additional Endpoints: Session & Cart Management
// -------------------------

// Root endpoint demonstrating the use of multiple middleware functions in sequence.
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
    // Debug: Log session object and session ID
    console.log("Session object:", req.session);
    console.log("Session ID:", req.session.id);
    // Mark the session as visited
    req.session.visited = true;
    // Set a signed cookie named 'Hello' with value 'World', expiring in 60 seconds
    res.cookie("Hello", "World", { maxAge: 60000, signed: true });
    // Respond with a JSON message
    res.json({ msg: "Hello World!" });
  }
);

// -------------------------
// Custom Authentication Endpoint (Session-Based) with express-validator
// -------------------------

// This endpoint validates username and password fields and performs manual authentication.
app.post(
  "/api/auth",
  // Validate that username is provided and not empty.
  body("username").notEmpty().withMessage("The username cannot be empty"),
  // Validate that password is provided and not empty.
  body("password").notEmpty().withMessage("The password cannot be empty"),
  (req, res) => {
    // Check for validation errors.
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    // Extract username and password from the request body.
    const { username, password } = req.body;

    // Search for the user in the mockUsers array.
    const findUser = mockUsers.find((user) => user.username === username);

    // If user is not found or password does not match, return 401 Unauthorized.
    if (!findUser || findUser.password !== password) {
      return res.status(401).send({ msg: "Invalid Credentials" });
    }
    // If credentials are valid, store the user object in the session.
    req.session.user = findUser;
    return res.status(200).send(findUser);
  }
);

// Endpoint to check authentication status using session-based auth.
// It logs session store details and returns the user stored in the session if available.
app.get("/api/auth/status", (req, res) => {
  console.log("Session Store Details:", req.sessionStore);
  // Retrieve session details from the session store (for debugging)
  req.sessionStore.get(req.sessionID, (err, session) => {
    console.log("Retrieved Session:", session);
  });

  // If a user exists in the session, return that user; otherwise, return 401.
  return req.session.user
    ? res.status(200).send(req.session.user)
    : res.status(401).send({ msg: "BAD CREDENTIALS" });
});

// -------------------------
// Endpoint: Add Item to User's Cart (Session-Based)
// -------------------------

// This endpoint adds an item (from the request body) to the user's cart stored in the session.
app.post("/api/cart", (req, res) => {
  // If the user is not authenticated, return 401.
  if (!req.session.user) return res.sendStatus(401);
  // Get the item from the request body.
  const { body: item } = req;
  // Retrieve current cart from session.
  const { cart } = req.session;
  if (cart) {
    // If a cart exists, add the new item.
    cart.push(item);
  } else {
    // Otherwise, create a new cart array in the session.
    req.session.cart = [item];
  }
  // Return the added item with a 201 Created status.
  return res.status(201).send(item);
});

// -------------------------
// Endpoint: Retrieve User's Cart (Session-Based)
// -------------------------

// This endpoint returns the items in the user's cart if the user is authenticated.
app.get("/api/cart", (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  // Respond with the cart array; if it doesn't exist, return an empty array.
  return res.send(req.session.cart ?? []);
});

// -------------------------
// Starting the Server
// -------------------------

// Determine the port from the environment variable or default to 3000.
const PORT = process.env.PORT || 3000;

// Start listening on the specified port.
app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});