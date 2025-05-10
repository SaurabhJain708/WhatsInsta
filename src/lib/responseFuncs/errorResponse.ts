import { NextResponse } from "next/server";
import { ApiError } from "../ApiError";

export function errorResponse(
  statusCode: number,
  message: string,
): NextResponse {
  const response = NextResponse.json(new ApiError(statusCode, message), {
    status: statusCode,
  });
  return response;
}
