import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";

export const generateToken = (user) => {
  return jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};