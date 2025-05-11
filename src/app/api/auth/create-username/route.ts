import { ApiError } from "@/lib/ApiError";
import { CheckAuth } from "@/lib/checkAuth";
import { mongoDb } from "@/lib/mongodb";
import { errorResponse } from "@/lib/responseFuncs/errorResponse";
import { cookieErrorResponse } from "@/lib/responseFuncs/errorResponseCookies";
import { cookieResultResponse } from "@/lib/responseFuncs/resultResponsecookies";
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
      return errorResponse(403, "Authentication Failed");
    }
    session.startTransaction();
    const normalisedUsername = username.trim().toLowerCase();
    const checkexistingUsername = await User.findOne({
      username: normalisedUsername,
    });
    if (checkexistingUsername) {
      await session.abortTransaction();
      session.endSession();
      return cookieErrorResponse(400, "Username already exists",AuthContents);
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
      await session.commitTransaction();
      session.endSession();
      return cookieResultResponse(201, newUsername, "username created successfully", AuthContents);
    }
    return cookieResultResponse(200, null, "username is available", AuthContents);
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(new ApiError(500, `Internal server error`), {
      status: 500,
    });
  }
}
