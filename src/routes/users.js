import { Router } from "express";
import { query, validationResult, body, matchedData } from "express-validator";
import { mockUsers } from "../utils/constants.js";

const router = Router();

router.get(
  "/api/users",
  // Make query parameters optional if not provided
  query("filter")
    .optional()
    .isString()
    .withMessage("Must be a string")
    .isLength({ min: 3, max: 10 })
    .withMessage("Must be at least 3-10 characters"),
  query("value")
    .optional()
    .isString()
    .withMessage("Must be a string")
    .notEmpty()
    .withMessage("Must not be empty"),
  (req, res) => {
    const { filter, value } = req.query;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (filter && value) {
      // Ensure the property exists before using includes
      const filteredUsers = mockUsers.filter(
        (user) => user[filter] && user[filter].includes(value)
      );
      return res.json(filteredUsers);
    }
    return res.json(mockUsers);
  }
);

const resolveIndexByUser = (req, res, next) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) return res.sendStatus(400);

  const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
  if (findUserIndex === -1) return res.sendStatus(404);
  req.findUserIndex = findUserIndex;
  next();
};

// GET Request: User by ID
router.get("/api/users/:id", (req, res) => {
  const parsedId = parseInt(req.params.id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).send({ msg: "Bad Request. Invalid ID" });
  }
  const findUser = mockUsers.find((user) => user.id === parsedId);
  if (!findUser) return res.sendStatus(404);
  return res.status(200).json(findUser);
});

// Post request
router.post(
  "/api/users",
  [
    body("username")
      .notEmpty()
      .withMessage("Field must not be empty")
      .isLength({ min: 5, max: 32 })
      .withMessage(
        "Username must be at least 5 characters with a max of 32 characters"
      )
      .isString()
      .withMessage("Must be a string"),
    body("displayName").notEmpty().withMessage("Must have something"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const data = matchedData(req);
    const newId =
      mockUsers.length > 0 ? mockUsers[mockUsers.length - 1].id + 1 : 1;
    const newUser = { id: newId, ...data };
    mockUsers.push(newUser);
    return res.status(201).json(newUser);
  }
);

// PUT Request: Replace a user
router.put("/api/users/:id", resolveIndexByUser, (req, res) => {
  // req.body comes from express.json() middleware
  const { body: userData, findUserIndex } = req;
  mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...userData };
  return res.sendStatus(200);
});

// PATCH Request: Update a user
router.patch("/api/users/:id", resolveIndexByUser, (req, res) => {
  const { body: userData, findUserIndex } = req;
  mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...userData };
  return res.sendStatus(200);
});

// DELETE Request: Remove a user
router.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) return res.sendStatus(400);

  const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
  if (findUserIndex === -1) return res.sendStatus(404);

  mockUsers.splice(findUserIndex, 1);
  return res.sendStatus(200);
});

export default router;
