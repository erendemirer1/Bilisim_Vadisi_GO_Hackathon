import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
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
        message: "Auth Header missing",
      });
      return;
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET as string);
    if (decoded) {
      next();
    }
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid or expired token",
    });
  }
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Auth Header missing",
      });
      return;
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Token bulunamadı",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET as string);
    if (decoded) {
      const decodedObj = decoded as { isAdmin: boolean };
      if (!decodedObj.isAdmin) {
        res.status(StatusCodes.FORBIDDEN).json({
          message: "Admin yetkisi gereklidir.",
        });
        return;
      }
      next();
    }
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Süresi geçmiş yada geçersiz token",
    });
  }
};

export const getDecodedJwtToken = (
  authHeader?: string
): JwtPayload => {
  if (!authHeader) {
    throw new Error("Auth header missing");
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    throw new Error("Token not provided");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  return decoded;
};
