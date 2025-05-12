import { ApiResponse } from "@/lib/ApiResponse";
import { GenerateTokens } from "@/lib/generateAccess&RefreshToken";
import { mongoDb } from "@/lib/mongodb";
import { errorResponse } from "@/lib/responseFuncs/errorResponse";
import { Iotp, Otp } from "@/models/otp.model";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { otp, email } = await req.json();
    if (!otp || !email) return errorResponse(400, "Please enter otp & email");
    await mongoDb();

    const hasOtp: null | Iotp = await Otp.findOne({ email });

    if (!hasOtp) return errorResponse(401, "Otp not found");

    const isOtpCorrect = await hasOtp?.compareOtp(otp);

    if (!isOtpCorrect) return errorResponse(400, "Otp not matched");

    const user = await User.findOneAndUpdate(
      { email },
      { areDetailsComplete: false },
      { new: true }
    );

    if (!user) return errorResponse(404, "User not found");
    if (!user.isVerified) return errorResponse(411, "Please complete details");

    const token = await GenerateTokens(email);

    if (!token || typeof token === "boolean")
      return errorResponse(500, "Server error while generating tokens");

    const response = NextResponse.json(
      new ApiResponse(200, null, "Otp is correct"),
      {
        status: 200,
      }
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
    return errorResponse(500, "Internal server error");
  }
}
