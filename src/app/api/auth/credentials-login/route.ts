import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { GenerateTokens } from "@/lib/generateAccess&RefreshToken";
import { mongoDb } from "@/lib/mongodb";
import { errorResponse } from "@/lib/responseFuncs/errorResponse";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { password, email, username } = await req.json();
    const aredetailsComplete = username || email ? true : false;
    if (!password || !aredetailsComplete) {
      return NextResponse.json(
        new ApiError(400, "Password and email are required"),
        { status: 400 }
      );
    }
    await mongoDb();
    const findExistingUser = await User.findOne({
      $or: [
        { email: email?.trim().toLowerCase() ?? "" },
        { username: username?.trim().toLowerCase() ?? "" },
      ],
    }).select("+password");
    if (!findExistingUser) {
      return NextResponse.json(
        new ApiError(404, "User not found please sign-up"),
        { status: 404 }
      );
    }
    const isPasswordCorrect = await findExistingUser.comparePassword(password);
    console.log(isPasswordCorrect);
    if (!isPasswordCorrect) {
      return NextResponse.json(new ApiError(401, "Incorrect password"), {
        status: 401,
      });
    }
    const token = await GenerateTokens(findExistingUser.email!);
    console.log(token);
    if (!token || typeof token === "boolean") {
      return NextResponse.json(
        new ApiError(500, "Server error while generating tokens")
      );
    }
    if (!findExistingUser.isVerified || !findExistingUser.areDetailsComplete) {
      return errorResponse(411, "Please complete your profile");
    }
    const response = NextResponse.json(
      new ApiResponse(200, null, "User login successful"),
      { status: 200 }
    );
    response.cookies.set("accessToken", token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict", // Adjust to your needs, 'strict' is safer
      path: "/", // Accessible throughout the entire app
      maxAge: 60 * 60,
    });

    response.cookies.set("refreshToken", token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(new ApiError(500, `Server error`), {
      status: 500,
    });
  }
}
