import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { GenerateTokens } from "@/lib/generateAccess&RefreshToken";
import { mongoDb } from "@/lib/mongodb";
import { Iotp, Otp } from "@/models/otp.model";
import { Iuser, User } from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await mongoDb();
  const session = await mongoose.startSession();
  try {
    const { name, email, otp } = await req.json();
    if (!name || !email || !otp) {
      return NextResponse.json(
        new ApiError(400, "Please enter required fields"),
        { status: 400 }
      );
    }
    session.startTransaction();
    const existingUser: null | Iuser = await User.findOne({
      email,
    }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(new ApiError(409, "User already exists"), {
        status: 409,
      });
    }
    const hasOtp: null | Iotp = await Otp.findOne({ email }).session(session);
    if (!hasOtp) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        new ApiError(404, "Otp not found for this user"),
        { status: 404 }
      );
    }
    const isOtpCorrect = await hasOtp.compareOtp(otp);
    if (!isOtpCorrect) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(new ApiError(400, "Otp incorrect"), {
        status: 400,
      });
    }
    const newUser = new User({ name, email, provider: "credentials" });
    await newUser.save({ session });
    // if (!newUser) {
    //   await session.abortTransaction();
    //   session.endSession();
    //   return NextResponse.json(
    //     new ApiError(500, "Internal server error, User creation failed"),
    //     { status: 500 }
    //   );
    // }
    const deleteOtp = await Otp.findByIdAndDelete(hasOtp._id).session(session);
    if (!deleteOtp) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        new ApiError(500, "Internal server error, Otp deletion failed"),
        { status: 500 }
      );
    }
    const token = await GenerateTokens(newUser._id.toString());
    if (!token || typeof token ==="boolean") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        new ApiError(500, "Internal server error, token creation failed"),
        { status: 500 }
      );
    }

    await session.commitTransaction();
    session.endSession();
    const response = NextResponse.json(
      new ApiResponse(
        201,
        newUser,
        "User created successfully, please verify and create username and password"
      ),
      { status: 201 }
    );
    response.cookies.set("accessToken", token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict", // Adjust to your needs, 'strict' is safer
      path: "/", // Accessible throughout the entire app
    });

    response.cookies.set("refreshToken", token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict",
      path: "/",
    });
    return response;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(new ApiError(500, `Server error: ${error}`), {
      status: 500,
    });
  }
}
