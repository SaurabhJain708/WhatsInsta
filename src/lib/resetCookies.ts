import { NextResponse } from "next/server";
import { Ireturn } from "./checkAuth";

export function setAuthCookies(response: NextResponse, AuthContents: Ireturn) {
  if (AuthContents.isTokenModified) {
    response.cookies.set("accessToken", AuthContents.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    response.cookies.set("refreshToken", AuthContents.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }
}
