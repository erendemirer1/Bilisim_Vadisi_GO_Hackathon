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
    });
  }

  return res.status(statusCode).send({
    status: "OK",
    message,
    data: data
  });
}

// export const getResultAndToken = async (result: Result<any>, res: Response) => {
//   const { statusCode, data, message } = result;
//
//   if (statusCode >= 400) {
//     return res.status(statusCode).send({
//       status: "FAIL",
//       error: message,
//     });
//   }
//
//   const userData = data as { uuid: string; username: string, email: string };
//   const token = await res.jwtSign({
//     uuid: userData.uuid,
//     username: userData.username,
//     email: userData.email
//   });
//
//   return res.status(statusCode).send({
//     status: "OK",
//     message,
//     uuid: userData.uuid,
//     username: userData.username,
//     email: userData.email,
//     token: token
//   });
// }
//
// export const getResultAndDecodedToken = async (result: Result<any>, reply: FastifyReply) => {
//   const { statusCode, data, message } = result;
//
//   if (statusCode >= 400) {
//     return reply.status(statusCode).send({
//       status: "FAIL",
//       error: message,
//     });
//   }
//
//   return reply.status(statusCode).send({
//     status: "OK",
//     message,
//     data: data
//   });
// }