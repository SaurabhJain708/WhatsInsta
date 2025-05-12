import { CheckAuth } from "@/lib/checkAuth";
import { mongoDb } from "@/lib/mongodb";
import { errorResponse } from "@/lib/responseFuncs/errorResponse";
import { cookieResultResponse } from "@/lib/responseFuncs/resultResponsecookies";
import { User } from "@/models/user.model";
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
    const newUser = await User.findById(user._id);
    if (!newUser) {
      return errorResponse(404, "User not found");
    }
    newUser.password = password;
    newUser.areDetailsComplete = true;
    await newUser!.save();
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
