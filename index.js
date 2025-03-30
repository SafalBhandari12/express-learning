// ================================================
// File: index.js (Main Express Server)
// ================================================

// Importing required modules
import express, { json } from "express";
import appRouter from "./src/routes/appRouter.js"; // Import your application routes
import cookieParser from "cookie-parser";
import session from "express-session";

// Importing express-validator for validating API endpoint inputs.
import { body, query, validationResult } from "express-validator";

// Importing mock users (again) for endpoints that use custom authentication handling.
import { mockUsers } from "./src/utils/constants.js";

// Importing passport instance for authentication.
import passport from "passport";

// Importing our local strategy configuration.
import localStrategy from "./strategies/local-strategy.js";

// Initialize the Express application.
const app = express();

// -----------------------
// Middleware Setup
// -----------------------

// Use JSON parser middleware to automatically parse JSON payloads in requests.
app.use(express.json());

// Use cookie-parser to parse cookies from the client. The secret here is used for signing cookies.
app.use(cookieParser("safal"));

// Set up session middleware to handle user sessions.
// The session middleware will save session data server-side and send a session id to the client as a cookie.
// Options:
//   - secret: a string used to sign the session ID cookie, ensuring session data integrity.
//   - saveUninitialized: if false, it prevents saving sessions that are not modified.
//   - resave: if false, it avoids saving session data that has not been modified.
//   - cookie: configuration for the session cookie, here setting a max age of 1 hour.
app.use(
  session({
    secret: "anson the dev",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

// Initialize Passport and integrate it with session support.
// passport.initialize() sets up Passport for use in the app.
// passport.session() integrates Passport with the session middleware so that persistent login sessions can be maintained.
app.use(passport.initialize());
app.use(passport.session());

// Use custom application routes defined in appRouter.
app.use(appRouter);

// -----------------------
// Authentication Endpoints
// -----------------------

// Endpoint for authenticating a user using the Passport local strategy.
// When a POST request is made to "/api/auth", Passport will invoke our local strategy.
app.post("/api/auth", passport.authenticate("local"), (req, res) => {
  // After a successful authentication, Passport calls serializeUser,
  // and this callback is then executed.
  // A successful login returns a 200 OK status.
  res.sendStatus(200);
});

// Endpoint to check authentication status using Passport's session
// This route shows the currently authenticated user (if any) and session details.
app.get("/api/auth/status", (req, res) => {
  console.log("Inside /api/auth/status");
  console.log("Authenticated user:", req.user);
  console.log("Session details:", req.session);
  // If a user is authenticated (req.user is set), send the user object;
  // otherwise, respond with a 401 Unauthorized status.
  return req.user ? res.send(req.user) : res.sendStatus(401);
});

// Endpoint for logging out the authenticated user.
// It checks if a user is logged in, then logs out via Passport's logOut method.
app.post("/api/auth/logout", (req, res) => {
  if (!req.user) return res.sendStatus(401);

  // The req.logOut method is used to terminate the user session.
  req.logOut((err) => {
    if (err) return res.sendStatus(400);
    res.sendStatus(200);
  });
});

// -----------------------
// Custom Middleware for Logging
// -----------------------

// A middleware function to log details about every incoming request.
const loggingMiddleware = (req, res, next) => {
  console.log(`${req.method} - ${req.url}`);
  next(); // Proceed to the next middleware in the chain
};

// Use the logging middleware along with an additional middleware to log a completion message.
app.use(loggingMiddleware, (req, res, next) => {
  console.log("Completed Middleware");
  next();
});

// -----------------------
// Additional Endpoints (Session & Cart)
// -----------------------

// Root GET endpoint demonstrating multiple middleware in sequence.
// This endpoint logs multiple messages and then sets a session value and cookie before sending a JSON response.
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
    // Log session details and session ID for debugging.
    console.log("Session object:", req.session);
    console.log("Session ID:", req.session.id);
    // Mark the session as visited.
    req.session.visited = true;
    // Set a signed cookie with the key 'Hello' and value 'World', expiring in 60 seconds.
    res.cookie("Hello", "World", { maxAge: 60000, signed: true });
    // Respond with a JSON message.
    res.json({ msg: "Hello World!" });
  }
);

// Custom authentication endpoint using express-validator for input validation.
// This endpoint validates the username and password fields, then manually checks user credentials.
app.post(
  "/api/auth",
  // Validate that username is not empty.
  body("username").notEmpty().withMessage("The username cannot be empty"),
  // Validate that password is not empty.
  body("password").notEmpty().withMessage("The password cannot be empty"),
  (req, res) => {
    // Retrieve the validation errors (if any).
    const error = validationResult(req);
    if (!error.isEmpty()) {
      // If validation errors exist, respond with status 400 and error details.
      return res.status(400).json({ error: error.array() });
    }
    // Extract username and password from the request body.
    const { username, password } = req.body;

    // Find the user in the mockUsers array.
    const findUser = mockUsers.find((user) => user.username === username);

    // If the user is not found or the password is incorrect, respond with 401 Unauthorized.
    if (!findUser || findUser.password !== password) {
      return res.status(401).send({ msg: "Invalid Credentials" });
    }
    // If credentials are valid, save the user information in the session.
    req.session.user = findUser;
    // Respond with the user object and a 200 OK status.
    return res.status(200).send(findUser);
  }
);

// Endpoint to check authentication status using session-based authentication.
// This route retrieves the session from the session store and returns the authenticated user.
app.get("/api/auth/status", (req, res) => {
  console.log("Session Store Details:", req.sessionStore);
  // Retrieve the current session details from the session store.
  req.sessionStore.get(req.sessionID, (err, session) => {
    console.log("Retrieved Session:", session);
  });

  // If a user exists in the session, return the user object; otherwise, send a 401 status.
  return req.session.user
    ? res.status(200).send(req.session.user)
    : res.status(401).send({ msg: "BAD CREDENTIALS" });
});

// Endpoint to add an item to the user's cart.
// The cart is stored in the session, ensuring that only authenticated users can modify it.
app.post("/api/cart", (req, res) => {
  // Check if the user is authenticated; if not, return 401.
  if (!req.session.user) return res.sendStatus(401);
  // Get the item from the request body.
  const { body: item } = req;
  // Retrieve the current cart from the session.
  const { cart } = req.session;
  // If the cart already exists, add the new item.
  if (cart) {
    cart.push(item);
  } else {
    // Otherwise, create a new cart array in the session.
    req.session.cart = [item];
  }
  // Respond with the added item and status 201 (Created).
  return res.status(201).send(item);
});

// Endpoint to retrieve the user's cart.
// Returns the list of items in the cart if the user is authenticated.
app.get("/api/cart", (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  // Send the cart array if it exists, or an empty array otherwise.
  return res.send(req.session.cart ?? []);
});

// -----------------------
// Starting the Server
// -----------------------

// Determine the port to listen on. Uses environment variable PORT or defaults to 3000.
const PORT = process.env.PORT || 3000;

// Start the Express server.
app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});

/*
Workflow Overview:

1. **User Authentication via Passport:**
   - The user sends a POST request to "/api/auth" with username and password.
   - Passport uses the local strategy defined in "local-strategy.js" to verify credentials.
   - If successful, Passport calls serializeUser to store the user id in the session.
   - For any subsequent request, deserializeUser retrieves the full user from the session id.
   - The "/api/auth/status" endpoint uses this mechanism to check if the user is authenticated.

2. **Custom Session-Based Authentication:**
   - An alternate "/api/auth" endpoint validates the credentials manually (using express-validator).
   - On successful validation, the user object is stored in the session directly.
   - The "/api/auth/status" endpoint checks the session for a stored user and returns it.

3. **Session Usage:**
   - Sessions store data on the server, with a unique session ID sent to the client as a cookie.
   - The session middleware ensures that the same session persists across multiple requests.
   - This mechanism is used to keep track of authenticated users and store user-specific data such as the cart.

4. **Logging and Additional Middleware:**
   - A logging middleware logs each request’s method and URL.
   - Additional middleware logs a completion message after processing requests.
   - The root endpoint demonstrates the use of multiple middleware functions, session updates, and cookie settings.

This code demonstrates two ways of handling authentication:
- Using Passport’s local strategy (with automatic session handling via serialize/deserialize)
- A manual session-based approach with express-validator

Both workflows ensure that users are authenticated and that their session data persists across requests.
*/