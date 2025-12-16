import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "../service/UserService.js";
import { User } from "../entity/User.js";
import Result from "../bean/Result.js";
import { getResult, getResultAndData } from "../bean/getResult.js";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public register = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const result = await this.userService.register(req.body as User);
      return getResult(result, res);
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
      const deleted = this.userService.delete(req.body.phone);

      if (!deleted) {
        return new Result(StatusCodes.NOT_FOUND, {}, "Failed to delete user");
      }

      return new Result(StatusCodes.OK, {}, "User deleted successfully");
    } catch (error: Error | any) {
      return new Result(StatusCodes.INTERNAL_SERVER_ERROR, {}, error.message || "Failed to delete user");
    }
  };
}