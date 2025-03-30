// ================================================
// File: strategies/local-strategy.js
// ================================================

// Importing the 'Strategy' constructor from the 'passport-local' package.
// Passport-local is a Passport strategy for authenticating with a username and password.
import { Strategy } from "passport-local";

// Importing a list of mock users from a constants file.
// This array simulates a user database that the strategy will use to verify credentials.
import { mockUsers } from "../src/utils/constants.js";

// Importing the default passport instance.
// Passport is an authentication middleware for Node.js that supports various authentication strategies.
import passport from "passport";

// -----------------------
// Passport Session Handling
// -----------------------

// The serializeUser function determines which data of the user object should be stored in the session.
// In this case, we store only the user id. This is invoked after a successful authentication.
passport.serializeUser((usern, done) => {
  console.log("Inside serializeUser");
  console.log("User being serialized:", usern);
  // Save user id to session
  done(null, usern.id);
});

// The deserializeUser function is used to retrieve the full user details from the session data.
// It receives the user id saved by serializeUser and returns the complete user object.
passport.deserializeUser((id, done) => {
  console.log("Inside deserializeUser");
  console.log(`Deserializing User ID: ${id}`);
  try {
    // Look up the user by id from the mock users array.
    const findUser = mockUsers.find((user) => user.id === id);
    if (!findUser) throw new Error("User not found");
    // Return the user object on success.
    done(null, findUser);
  } catch (err) {
    // Pass any error encountered to done.
    done(err, null);
  }
});

// -----------------------
// Local Authentication Strategy
// -----------------------

// Registering a new local authentication strategy with Passport.
// Passport will use this strategy when authenticating requests.
export default passport.use(
  // Creating a new instance of the local Strategy.
  // The Strategy constructor takes a callback function that accepts 'username', 'password',
  // and a 'done' callback. The 'done' callback is used to signal whether authentication succeeded.
  new Strategy((username, password, done) => {
    try {
      // Search for a user in the mockUsers array whose username matches the provided username.
      // The .find method returns the first matching user, or undefined if none is found.
      const findUser = mockUsers.find((user) => user.username === username);

      // If no user is found, throw an error indicating that the user was not found.
      if (!findUser) throw new Error("User not found");

      // If a user is found but the password does not match, throw an error for invalid credentials.
      // Note: The error message has a typo ("Invali Credentials") which should be corrected.
      if (findUser.password !== password)
        throw new Error("Invalid Credentials");

      // If the user is found and the password is correct, invoke the 'done' callback with no error and the user object.
      // This signals Passport that the authentication was successful.
      done(null, findUser);
    } catch (err) {
      // If an error occurred during the authentication process,
      // call the 'done' callback with the error, signaling Passport that authentication failed.
      done(err, null);
    }
  })
);