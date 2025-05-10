import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { CheckAuth } from "@/lib/checkAuth";
import { mongoDb } from "@/lib/mongodb";
import { setAuthCookies } from "@/lib/resetCookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json(new ApiError(400, "Password is required"), {
        status: 400,
      });
    }
    await mongoDb();
    const AuthContents = await CheckAuth(req);
    if (!AuthContents || typeof AuthContents === "boolean") {
      return NextResponse.json(new ApiError(403, "Authentication Failed"), {
        status: 403,
      });
    }
    if (!AuthContents.user.isVerified) {
      return NextResponse.json(new ApiError(403, "User is not verified"), {
        status: 403,
      });
    }
    const user = AuthContents.user;
    user.areDetailsComplete = true;
    user.password = password;
    await user.save();

    const response = NextResponse.json(
      new ApiResponse(200, null, "Password updated successfully"),
      { status: 200 }
    );
    setAuthCookies(response, AuthContents);
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(new ApiError(500, `Internal server error`), {
      status: 500,
    });
  }
}
