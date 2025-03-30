# Express & MongoDB Tutorial Project

This project demonstrates how to build a Node.js application using Express, MongoDB (via Mongoose), Passport for authentication, session management, and input validation with express-validator. It shows two authentication workflows:
- **Passport Local Strategy:** Uses Passport's built-in serialization and deserialization mechanisms.
- **Custom Session-Based Authentication:** Uses express-validator for manual authentication and session storage.

## Project Structure

. ├── src │ ├── routes │ │ └── appRouter.js // Defines all API endpoints (CRUD operations, authentication, cart management) │ ├── mongoose │ │ └── schemas │ │ └── user.js // Mongoose schema for User documents (not shown here) │ └── utils │ └── constants.js // Contains mock user data for testing custom authentication endpoints ├── strategies │ └── local-strategy.js // Implements Passport's local strategy for user authentication ├── index.js // Main Express server file; sets up middleware, session, Passport, and routes └── README.md // This file

pgsql
Copy
Edit

## Features

- **Database Integration:** Uses Mongoose to interact with a MongoDB database.
- **User Authentication:**
  - *Passport Local Strategy:* Leverages Passport for managing authentication sessions.
  - *Custom Authentication:* Validates input with express-validator and manages sessions manually.
- **Session & Cookie Management:** Demonstrates session usage (server-side storage) and setting signed cookies.
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

For authentication, passwords are compared as plain text. In a real application, you should hash passwords and follow security best practices.

License
This project is provided for educational purposes. Feel free to modify and extend it as needed.