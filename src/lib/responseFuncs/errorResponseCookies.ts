import { NextResponse } from "next/server";
import { ApiError } from "../ApiError";
import { Ireturn } from "../checkAuth";

export function cookieErrorResponse(
  statusCode: number,
  message: string,
  AuthContents?: Ireturn | boolean
): NextResponse {
  const response = NextResponse.json(new ApiError(statusCode, message), {
    status: statusCode,
  });
  if (typeof AuthContents === "boolean" || AuthContents === null) {
    return response;
  }
  if (AuthContents && AuthContents.isTokenModified) {
    response.cookies.set("accessToken", AuthContents.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60,
    });
    response.cookies.set("refreshToken", AuthContents.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }
  return response;
}
