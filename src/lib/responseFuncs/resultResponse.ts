import { NextResponse } from "next/server";
import { ApiResponse } from "../ApiResponse";

export function resultResponse(
  statusCode: number,
  data: unknown | null,
  message: string
): NextResponse {
  const response = NextResponse.json(
    new ApiResponse(statusCode, data, message),
    { status: statusCode }
  );
  return response;
}
