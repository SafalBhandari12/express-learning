// Importing required modules from express and express-validator
import { Router } from "express";
import { query, validationResult, body, matchedData } from "express-validator";
// Importing a mock users array to simulate a user database for some endpoints
import { mockUsers } from "../utils/constants.js";
// Importing session middleware (if needed in route-level, not used here directly)
import session from "express-session";
// Importing the Mongoose User model for database operations
import { User } from "../mongoose/schemas/user.js";
// Importing password hashing helper function
import { hashPassword } from "../utils/helpers.js";

// Create a new router instance
const router = Router();

// -------------------------
// Endpoint: Create a New User via MongoDB
// -------------------------
// This endpoint uses query parameters for filtering (optional) and creates a new user using the Mongoose model.
router.post(
  "/api/users",
  // Validate query parameter "filter": optional, must be a string with 3-10 characters.
  query("filter")
    .optional()
    .isString()
    .withMessage("Must be a string")
    .isLength({ min: 3, max: 10 })
    .withMessage("Must be at least 3-10 characters"),
  // Validate query parameter "value": optional, must be a non-empty string.
  query("value")
    .optional()
    .isString()
    .withMessage("Must be a string")
    .notEmpty()
    .withMessage("Must not be empty"),
  async (req, res) => {
    // Validate request parameters and send errors if any
    const result = validationResult(req);
    if (!result.isEmpty()) return res.send(result.array);

    // Destructure the request body (assumed to contain user data)
    const { body } = req;
    // Hash the password before storing in the database
    body.password = hashPassword(body.password);
    console.log(body);
    // Create a new Mongoose User instance with the provided data
    const newUser = new User(body);
    try {
      // Save the new user document to MongoDB
      const savedUser = await newUser.save();
      // Return the saved user with a 201 status code
      return res.status(201).send(savedUser);
    } catch (err) {
      // Log any errors that occur during save
      console.log(err);
      return res.sendStatus(400);
    }
  }
);

// -------------------------
// Middleware: resolveIndexByUser
// -------------------------
// This middleware finds the index of a user in the mockUsers array by parsing the ID parameter.
// It attaches the found index to the request object as req.findUserIndex.
const resolveIndexByUser = (req, res, next) => {
  const { id } = req.params;
  // Convert the id from string to integer
  const parsedId = parseInt(id, 10);
  // TODO: Remove or refactor the stray code 'ss;' below if it is not needed.
  // ss;
  // If the parsed id is not a valid number, return 400 Bad Request.
  if (isNaN(parsedId)) return res.sendStatus(400);

  // Find the index of the user in the mockUsers array based on the parsed ID.
  const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
  // If user not found, return 404 Not Found.
  if (findUserIndex === -1) return res.sendStatus(404);

  // Attach the found index to the request object for further processing.
  req.findUserIndex = findUserIndex;
  next();
};

// -------------------------
// Endpoint: Get User by ID (using mockUsers array)
// -------------------------
router.get("/api/users/:id", (req, res) => {
  // Convert the id from URL parameter to an integer
  const parsedId = parseInt(req.params.id, 10);
  if (isNaN(parsedId)) {
    // If the ID is invalid, return a 400 response with a message.
    return res.status(400).send({ msg: "Bad Request. Invalid ID" });
  }
  // Search for the user in the mockUsers array
  const findUser = mockUsers.find((user) => user.id === parsedId);
  if (!findUser) return res.sendStatus(404);
  // Respond with the found user data as JSON.
  return res.status(200).json(findUser);
});

// -------------------------
// Endpoint: Create a New User via mockUsers Array
// -------------------------
// This endpoint uses the request body to validate and add a new user to the mockUsers array.
router.post(
  "/api/users",
  [
    // Validate that username is a non-empty string with 5 to 32 characters.
    body("username")
      .notEmpty()
      .withMessage("Field must not be empty")
      .isLength({ min: 5, max: 32 })
      .withMessage(
        "Username must be at least 5 characters with a max of 32 characters"
      )
      .isString()
      .withMessage("Must be a string"),
    // Validate that displayName is provided.
    body("displayName").notEmpty().withMessage("Must have something"),
  ],
  (req, res) => {
    // Capture validation errors if any.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return error details if validations fail.
      return res.status(400).json({ errors: errors.array() });
    }
    // Extract only the validated data from the request.
    const data = matchedData(req);
    // Determine the next user id based on the last entry in mockUsers.
    const newId =
      mockUsers.length > 0 ? mockUsers[mockUsers.length - 1].id + 1 : 1;
    // Create the new user object with a new id and the validated data.
    const newUser = { id: newId, ...data };
    // Add the new user to the mockUsers array.
    mockUsers.push(newUser);
    // Respond with the new user object and a 201 status code.
    return res.status(201).json(newUser);
  }
);

// -------------------------
// Endpoint: Replace a User (PUT Request)
// -------------------------
// Replaces the entire user object in mockUsers at the found index.
router.put("/api/users/:id", resolveIndexByUser, (req, res) => {
  // Destructure the user data from the request body and the found index from middleware.
  const { body: userData, findUserIndex } = req;
  // Replace the user in the array while preserving the original id.
  mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...userData };
  return res.sendStatus(200);
});

// -------------------------
// Endpoint: Update a User (PATCH Request)
// -------------------------
// Updates only the provided fields of the user object in the mockUsers array.
router.patch("/api/users/:id", resolveIndexByUser, (req, res) => {
  const { body: userData, findUserIndex } = req;
  // Merge existing user data with new data.
  mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...userData };
  return res.sendStatus(200);
});

// -------------------------
// Endpoint: Delete a User (DELETE Request)
// -------------------------
// Removes a user from the mockUsers array based on the provided id.
router.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  // Convert id to integer.
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) return res.sendStatus(400);

  // Find the index of the user in the mockUsers array.
  const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
  if (findUserIndex === -1) return res.sendStatus(404);

  // Remove the user from the array.
  mockUsers.splice(findUserIndex, 1);
  return res.sendStatus(200);
});

// Export the router to be used in the main server file.
export default router;