import { CheckAuth } from "@/lib/checkAuth";
import { mongoDb } from "@/lib/mongodb";
import { errorResponse } from "@/lib/responseFuncs/errorResponse";
import { cookieResultResponse } from "@/lib/responseFuncs/resultResponsecookies";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) {
      return errorResponse(400, "Password is required");
    }
    await mongoDb();
    const AuthContents = await CheckAuth(req);
    if (!AuthContents || typeof AuthContents === "boolean") {
      return errorResponse(403, "Authentication Failed");
    }
    if (!AuthContents.user.isVerified) {
      return errorResponse(411, "User is not verified");
    }
    const user = AuthContents.user;
    user.areDetailsComplete = true;
    user.password = password;
    await user.save();
    return cookieResultResponse(
      200,
      null,
      "Password updated successfully",
      AuthContents
    );
  } catch (error) {
    console.log(error);
    return errorResponse(500, "Internal Server error");
  }
}
