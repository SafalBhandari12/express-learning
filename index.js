import express, { json } from "express";
import appRouter from "./src/routes/appRouter.js";
import cookieParser from "cookie-parser";
import session from "express-session";
// Validationresult was added to perform validation on various api end points
import { body, query, validationResult } from "express-validator";
// Mock users were imported to 
import { mockUsers } from "./src/utils/constants.js";

const app = express();

app.use(express.json());
app.use(cookieParser("safal"));
// secret: it adds the security. saveUninitialized: it is set to false meanaing if the user visits the page and there is no change in the session object then it is not saved. reshave is false meaning that if the user logs in change something but the session object is not changed then it is not stored in the session store.
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
    // We are just logging the session and the session id.
    // Visisted true helps us to track the user. If visited true is not made then when ever the user moves from one end point to another session id is changed. But if it is true then for the same user the session id remain the same making it easier to track the user.
    console.log(req.session);
    console.log(req.session.id);
    req.session.visited = true;
    res.cookie("Hello", "World", { maxAge: 60000, signed: true });
    res.json({ msg: "Hello World!" });
  }
);
// We use session to authenticate the user. When the user enters the authentication details then the session id and cookie is stored in the client side and authentication detail is stored in the server side.
// Now whenever the request is made from the frontend that cookie and session id is attached. From which the server can track if the user is authenticated. 
// There can exist the multiple session and cookie which are stored in the shared storage. But exist independently. So, multiple session can exist at the same time
app.post(
  "/api/auth",
  body("username").notEmpty().withMessage("The username cannot be empty"),
  body("password").notEmpty().withMessage("The password cannot be empty"),
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { username, password } = req.body;

    const findUser = mockUsers.find((user) => user.username == username);

    if (!findUser || findUser.password !== password) {
      return res.status(401).send({ msg: "Invalid Credentials" });
    }
    req.session.user = findUser;
    return res.status(200).send(findUser);
  }
);

app.get("/api/auth/status", (req, res) => {
  console.log(req.sessionStore);
  req.sessionStore.get(req.sessionID, (err, session) => {
    console.log(session);
  });

  return req.session.user
    ? res.status(200).send(req.session.user)
    : res.status(401).send({ msg: "BAD CREDENTIALS" });
});

app.post("/api/cart", (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  const { body: item } = req;
  const { cart } = req.session;
  if (cart) {
    cart.push(item);
  } else {
    req.session.cart = [item];
  }
  return res.status(201).send(item);
});

app.get("/api/cart", (req, res) => {
  if (!req.session.user) return res.sendStatus(401);
  return res.send(req.session.cart ?? []);
});
// GET Request: Users with optional filtering

// GET Request: Products

// POST Request: Create a new user

app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});
