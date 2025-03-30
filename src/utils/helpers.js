import bcrypt from "bcrypt";

const saltRounds = 10;

// Function to hash a password before storing it in the database.
export const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  console.log(salt);
  return bcrypt.hashSync(password, salt);
};

// Function to compare a plain text password with a hashed password.
export const comparePassword = (plain, hashed) => {
  return bcrypt.compareSync(plain, hashed);
};