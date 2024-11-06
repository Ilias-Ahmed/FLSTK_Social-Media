import jwt from "jsonwebtoken";

// Check if JWT_SECRET is defined in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Token expiration time
const TOKEN_EXPIRATION = "30d";

/*Generates a JWT token for a given user ID*/
export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

/*Verifies the JWT token*/
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

/*Refreshes a JWT token*/
export const refreshToken = (token) => {
  const { id } = verifyToken(token);
  return generateToken(id);
};

/*Extracts user ID from a verified token*/
export const getUserIdFromToken = (token) => {
  const decoded = verifyToken(token);
  return decoded.id;
};
