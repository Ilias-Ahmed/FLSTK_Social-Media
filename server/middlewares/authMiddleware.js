import { verifyToken } from "../utils/jwtUtils.js";
import User from "../models/User.js";

/*Middleware to protect routes by verifying JWT token*/
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // If no token found, return unauthorized
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // Verify the token
    const decoded = verifyToken(token);

    // Fetch the user from the database based on the decoded token
    const user = await User.findById(decoded.id).select("-password");

    // If user not found, return unauthorized
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
