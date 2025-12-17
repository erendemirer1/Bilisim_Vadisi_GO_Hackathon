import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "../service/UserService.js";
import { User } from "../entity/User.js";
import Result from "../bean/Result.js";
import { getResult, getResultAndData } from "../bean/getResult.js";
import jwt from "jsonwebtoken";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public register = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const result = await this.userService.register(req.body as User);
      return getResultAndData(result, res);
    } catch (error: Error | any) {
      return getResult(new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, error.message || "User failed to register"), res);
    }
  };

  public login = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const result = await this.userService.login(req.body.phone, req.body.password);
      return getResultAndData(result, res);
    } catch (error: Error | any) {
      return getResult(new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, error.message || "Failed to login"), res);
    }
  };

  public delete = async (req: Request, res: Response) => {
    try {
      const deleted = await this.userService.delete(req.body.phone);

      if (!deleted) {
        return getResult(new Result(StatusCodes.NOT_FOUND, {}, "Failed to delete user"), res);
      }

      return getResult(new Result(StatusCodes.OK, {}, "User deleted successfully"), res);
    } catch (error: Error | any) {
      return getResult(new Result(StatusCodes.INTERNAL_SERVER_ERROR, {}, error.message || "Failed to delete user"), res);
    }
  };

  public validate = async (req: Request, res: Response) => {
    const fullToken = req.headers.authorization;

    if (!fullToken || !fullToken.startsWith("Bearer ")) {
      return getResult(new Result(StatusCodes.UNAUTHORIZED, {}, "Auth Header missing or malformed"), res);
    }

    const token = fullToken.split(" ")[1];
    if (!token) {
        return getResult(new Result(StatusCodes.UNAUTHORIZED, {}, "No token provided"), res);
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET || "batuhan";
      const decoded = jwt.verify(token, JWT_SECRET) as { phone: string; userId: number };

      return getResultAndData(new Result(StatusCodes.OK, decoded, "Token is valid"), res);
    } catch (error: any) {
      return getResult(new Result(StatusCodes.UNAUTHORIZED, {}, "Invalid or expired token"), res);
    }
  };
}