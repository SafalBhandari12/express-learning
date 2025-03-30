// ================================================
// Passport Local Strategy for User Authentication
// ================================================

// Import the Strategy constructor from passport-local.
import { Strategy } from "passport-local";
// Import mock users to simulate a user database (used for initial testing or fallback).
import { mockUsers } from "../src/utils/constants.js";
// Import the passport instance.
import passport from "passport";
// Import the Mongoose User model for database authentication.
import { User } from "../src/mongoose/schemas/user.js";

// -------------------------
// Passport Session Handling
// -------------------------

// serializeUser determines which data of the user object should be stored in the session.
// Here we store only the user ID.
passport.serializeUser((user, done) => {
  console.log("Inside serializeUser");
  console.log("User being serialized:", user);
  done(null, user.id);
});

// deserializeUser retrieves the full user details from the session data using the user ID.
passport.deserializeUser(async (id, done) => {
  console.log("Inside deserializeUser");
  console.log(`Deserializing User ID: ${id}`);
  try {
    // Look up the user by id from the database using Mongoose.
    const findUser = await User.findById(id);
    if (!findUser) throw new Error("User not found");
    // Return the found user object.
    done(null, findUser);
  } catch (err) {
    // Pass any errors encountered during deserialization.
    done(err, null);
  }
});

// -------------------------
// Local Authentication Strategy
// -------------------------

// Register a new local authentication strategy with Passport.
// The strategy accepts a username and password and a done callback.
export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      // Log the received username and password (for debugging purposes).
      console.log(username, password);
      // Find the user in the MongoDB database by username.
      const findUser = await User.findOne({ username });
      if (!findUser) throw new Error("User not found");
      // Check if the provided password matches the stored password.
      if (findUser.password !== password) throw new Error("Bad Credential");

      // If successful, pass the found user to Passport.
      done(null, findUser);
    } catch (err) {
      // If any error occurs, signal authentication failure.
      done(err, null);
    }
  })
);