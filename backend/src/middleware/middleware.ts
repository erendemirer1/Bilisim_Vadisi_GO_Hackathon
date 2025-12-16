import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

const JWT_SECRET = process.env.JWT_SECRET || "batuhan";

export const middleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Auth Header missing",
      });
      return;
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET as string);
    if (decoded) {
      next();
    }
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      error: "Invalid or expired token",
    });
  }
};

