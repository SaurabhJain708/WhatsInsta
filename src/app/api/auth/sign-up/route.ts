import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { mongoDb } from "@/lib/mongodb";
import { Iuser, User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phonenumber } = await req.json();
    if (!name || (!email && !phonenumber)) {
      return NextResponse.json(
        new ApiError(400, "Please enter required fields"),
        { status: 400 }
      );
    }
    await mongoDb();
    const existingUser: null | Iuser = await User.findOne({
      $or: [{ email }, { phoneNumber: phonenumber }],
    });
    if (existingUser) {
      return NextResponse.json(new ApiError(409, "User already exists"), {
        status: 409,
      });
    }
    const newUser: null | Iuser = await User.create({
      name,
      email: email ?? null,
      phoneNumber: phonenumber ?? null,
    });
    if (!newUser) {
      return NextResponse.json(
        new ApiError(500, "Internal server error, User creation failed"),
        { status: 500 }
      );
    }
    return NextResponse.json(
      new ApiResponse(
        201,
        newUser,
        "User created successfully, please verify and create username and password"
      ),
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(new ApiError(500, `Server error: ${error}`));
  }
}
