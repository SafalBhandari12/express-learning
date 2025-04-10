# Express & MongoDB Tutorial Project

This project demonstrates how to build a Node.js application using Express, MongoDB (via Mongoose), Passport for authentication, session management, and input validation with express-validator. It shows two authentication workflows:
- **Passport Local Strategy:** Uses Passport's built-in serialization and deserialization mechanisms.
- **Custom Session-Based Authentication:** Uses express-validator for manual authentication and manages sessions.

> **New Feature:** The session data is now stored in MongoDB using the `connect-mongo` package. This allows persistent session storage across server restarts and scales well in distributed environments.

## Project Structure

. ├── src │ ├── routes │ │ └── appRouter.js // Defines all API endpoints (CRUD operations, authentication, cart management) │ ├── mongoose │ │ └── schemas │ │ └── user.js // Mongoose schema for User documents │ └── utils │ ├── constants.js // Contains mock user data for testing custom authentication endpoints │ └── helpers.js // Contains functions for hashing and comparing passwords ├── strategies │ └── local-strategy.js // Implements Passport's local strategy for user authentication ├── index.js // Main Express server file; sets up middleware, MongoDB session store, Passport, and routes └── README.md // This file

markdown
Copy
Edit

## Key Features

- **Database Integration:** Uses Mongoose to interact with a MongoDB database.
- **User Authentication:**
  - *Passport Local Strategy:* Leverages Passport for managing authentication sessions.
  - *Custom Authentication:* Validates input with express-validator and manages sessions manually.
- **Session & Cookie Management:**  
  - **MongoDB Session Store:** Sessions are now stored in MongoDB using the `connect-mongo` package.  
    - **Why?** Storing sessions in MongoDB helps in persisting session data across server restarts, facilitates scaling across multiple server instances, and centralizes session management.
    - **How?** In `index.js`, the session middleware is configured with a `store` option that creates a new MongoStore using the active Mongoose connection:
      ```js
      store: MongoStore.create({
        client: mongoose.connection.getClient()
      })
      ```
- **RESTful API Endpoints:**  
  - CRUD operations for user data (both using MongoDB and a mock data array).
  - Endpoints to manage a shopping cart stored in the session.
- **Middleware:** Custom logging middleware is used to log every request’s method and URL.
- **Input Validation:** Uses express-validator to ensure data integrity for incoming requests.

## Setup and Installation

1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd <repository_directory>
Install Dependencies: Ensure you have Node.js installed. Then, install the required packages:

bash
Copy
Edit
npm install
Configure MongoDB: Ensure that MongoDB is installed and running on your local machine. The connection string in index.js uses:

js
Copy
Edit
mongodb://localhost/express_tutorial
Adjust the connection string as necessary.

Run the Application: Start the server with:

bash
Copy
Edit
node index.js
The server will start on the port specified by the environment variable PORT or default to 3000.

Changes Related to Session Store Using MongoDB
MongoStore Integration:

The connect-mongo package is imported in index.js:

js
Copy
Edit
import MongoStore from "connect-mongo";
The session middleware is modified to include a store option that uses MongoStore. This ensures that session data is stored in the MongoDB database instead of the default in-memory store:

js
Copy
Edit
app.use(
  session({
    secret: "anson the dev",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
    store: MongoStore.create({
      client: mongoose.connection.getClient()
    }),
  })
);
This configuration allows sessions to persist even if the server restarts and supports scaling out the application to multiple instances.

Testing the Endpoints
User CRUD:

GET /api/users/:id – Retrieve a user by ID.

POST /api/users – Create a new user (two implementations exist: one with MongoDB and one using mock data).

PUT /api/users/:id – Replace an existing user.

PATCH /api/users/:id – Update specific fields of an existing user.

DELETE /api/users/:id – Delete a user.

Authentication:

POST /api/auth – Authenticate a user using Passport or custom validation.

GET /api/auth/status – Check current authentication status.

POST /api/auth/logout – Log out the authenticated user.

Cart Management:

POST /api/cart – Add an item to the user’s cart (requires authentication).

GET /api/cart – Retrieve items in the user’s cart.

Base Endpoint:

GET / – Demonstrates middleware chaining, session updates, and cookie settings.

Notes
The project includes both real database operations (with Mongoose) and operations on a mock data array (mockUsers) to demonstrate different approaches.

Be sure to remove any stray or debugging code (such as the ss; line in the resolveIndexByUser middleware) before deploying to production.

For authentication, passwords in the mock data are stored as plain text. In production, always hash passwords and follow security best practices.

License
This project is provided for educational purposes. Feel free to modify and extend it as needed.