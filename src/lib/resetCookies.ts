import { NextResponse } from "next/server";
import { Ireturn } from "./checkAuth";

export function setAuthCookies(response: NextResponse, AuthContents: Ireturn) {
  console.log("Setting cookies");
  console.log("AuthContents", AuthContents);
  if (AuthContents.isTokenModified) {
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
    console.log("Cookies set");
  }
}
