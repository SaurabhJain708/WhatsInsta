import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { CheckAuth } from "@/lib/checkAuth";
import { mongoDb } from "@/lib/mongodb";
import { setAuthCookies } from "@/lib/resetCookies";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { readytocreate, username } = await req.json();

    //check Auth
    const AuthContents = await CheckAuth(req);
    if (!AuthContents || typeof AuthContents === "boolean") {
      return NextResponse.json(new ApiError(403, "Authentication Failed"), {
        status: 403,
      });
    }

    await mongoDb();
    const normalisedUsername = username.trim().toLowerCase();
    const checkexistingUsername = await User.findOne({
      username: normalisedUsername,
    });
    if (checkexistingUsername) {
      return NextResponse.json(new ApiError(400, "Username already exists"), {
        status: 400,
      });
    }
    if (readytocreate || readytocreate === "true") {
      const newUsername = await User.findByIdAndUpdate(
        AuthContents.user._id,
        { username },
        { new: true }
      );
      if (!newUsername) {
        return NextResponse.json(
          new ApiError(500, "Internal server error while updating username"),
          { status: 500 }
        );
      }
      const response = NextResponse.json(
        new ApiResponse(201, newUsername, "username created successfully"),
        { status: 201 }
      );
      setAuthCookies(response, AuthContents);
      return response;
    }
    const response = NextResponse.json(
      new ApiResponse(200, null, "username is available"),
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
