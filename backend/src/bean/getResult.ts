import { Response } from "express";
import Result from "./Result.js";

export const getResult = (result: Result<any>, res: Response) => {
  const { statusCode, message } = result;

  if (statusCode >= 400) {
    return res.status(statusCode).json({
      status: "FAIL",
      message: message,
    });
  }

  return res.status(statusCode).json({
    status: "OK",
    message,
  });
};

export const getResultAndData = async (result: Result<any>, res: Response) => {
  const { statusCode, data, message } = result;

  if (statusCode >= 400) {
    return res.status(statusCode).send({
      status: "FAIL",
      message: message,
      data: data ? data : null
    });
  }

  return res.status(statusCode).send({
    status: "OK",
    message,
    data: data
  });
}