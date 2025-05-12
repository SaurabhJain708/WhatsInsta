import { NextResponse } from "next/server";
import { ApiResponse } from "../ApiResponse";
import { Ireturn } from "../checkAuth";

export function cookieResultResponse(
  statusCode: number,
  data: unknown | null,
  message: string,
  AuthContents?: Ireturn | boolean,
  secured?: boolean
): NextResponse {
  if (
    AuthContents &&
    typeof AuthContents !== "boolean" &&
    secured &&
    (!AuthContents.isVerified || !AuthContents.areDetailsComplete)
  ) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/v1/sign-up`);
  }
  const response = NextResponse.json(
    new ApiResponse(statusCode, data, message),
    { status: statusCode }
  );
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
