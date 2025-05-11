import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { CheckAuth } from "@/lib/checkAuth";
import { mongoDb } from "@/lib/mongodb";
import { setAuthCookies } from "@/lib/resetCookies";
import { errorResponse } from "@/lib/responseFuncs/errorResponse";
import { User } from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await mongoDb();
  const session = await mongoose.startSession();
  try {
    const { readytocreate, username } = await req.json();

    //check Auth
    const AuthContents = await CheckAuth(req);
    if (!AuthContents || typeof AuthContents === "boolean") { 
      console.log(AuthContents);
      return NextResponse.json(new ApiError(403, "Authentication Failed"), {
        status: 403,
      });
    }
    session.startTransaction();
    const normalisedUsername = username.trim().toLowerCase();
    const checkexistingUsername = await User.findOne({
      username: normalisedUsername,
    });
    if (checkexistingUsername) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(new ApiError(400, "Username already exists"), {
        status: 400,
      });
    }
    if (readytocreate || readytocreate === "true") {
      const newUsername = await User.findById(AuthContents.user._id);
      if (!newUsername) {
        await session.abortTransaction();
        session.endSession();
        return errorResponse(500, "Database error");
      }
      newUsername.username = username;
      newUsername.isVerified = true;
      if (newUsername?.provider === "google") {
        newUsername.areDetailsComplete = true;
        await newUsername.save({ session });
      }
      if (newUsername?.provider === "credentials") {
        await newUsername.save({ session });
      }
      const response = NextResponse.json(
        new ApiResponse(201, newUsername, "username created successfully"),
        { status: 201 }
      );
      await session.commitTransaction();
      session.endSession();
      setAuthCookies(response, AuthContents);
      return response;
    }
    const response = NextResponse.json(
      new ApiResponse(200, null, "username is available"),
      { status: 200 }
    );
    setAuthCookies(response, AuthContents);
    console.log("Response", response);
    return response;
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(new ApiError(500, `Internal server error`), {
      status: 500,
    });
  }
}
