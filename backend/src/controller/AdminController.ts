import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AdminService } from "../service/AdminService.js";
import Result from "../bean/Result.js";
import { getResult, getResultAndData } from "../bean/getResult.js";
import { User } from "../entity/User.js";
import { Doctor } from "../entity/Doctor.js";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  public login = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const result = await this.adminService.login(req.body.phone, req.body.password);
      return getResultAndData(result, res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to login";
      return getResult(new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, msg), res);
    }
  }

  public addDoctor = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const result = await this.adminService.addDoctor(req.body as Doctor);
      return getResultAndData(result, res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to add doctor";
      return getResult(new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, msg), res);
    }
  }

  public deleteDoctor = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const result = await this.adminService.deleteDoctor(req.body.id as string);
      return getResultAndData(result, res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to add doctor";
      return getResult(new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, msg), res);
    }
  }

  public getAllDoctors = async (req: Request, res: Response): Promise<Result<any>> => {
    try {
      const result = await this.adminService.getAllDoctors();
      return getResultAndData(result, res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to get all doctors";
      return getResult(new Result(StatusCodes.INTERNAL_SERVER_ERROR, null, msg), res);
    }
  }
}