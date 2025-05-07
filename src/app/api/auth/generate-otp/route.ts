import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { mongoDb } from "@/lib/mongodb";
import { isEmail, isPhone } from "@/lib/phone&emailidentifier";
import { Iotp, Otp } from "@/models/otp.model";
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await mongoDb();

  const session = await mongoose.startSession();

  try {
    const { userIdentifier } = await req.json();
    if (!userIdentifier) {
      return NextResponse.json(
        new ApiError(400, "Please enter phone number or email"),
        { status: 400 }
      );
    }
    session.startTransaction();
    const existingOtp: null | Iotp = await Otp.findOne({
      userIdentifier,
    });
    if (existingOtp) {
      const deleteOldOtp = await Otp.findByIdAndDelete(existingOtp._id, {
        session,
      });
      if (!deleteOldOtp) {
        return NextResponse.json(
          new ApiError(500, "Internal server error, otp not genrated"),
          { status: 500 }
        );
      }
    }
    const nanoid = customAlphabet("0123456789", 6);

    const otp = nanoid(); // e.g., '483920'
    const newOtp = await Otp.create({ userIdentifier, otp }, { session });
    if (!newOtp) {
      return NextResponse.json(
        new ApiError(500, "Internal server error in creating new otp"),
        { status: 500 }
      );
    }

    const isTypeEmail = isEmail(userIdentifier);
    const isTypePhone = isPhone(userIdentifier);


    // TODO add send email and message functionality

    
    if (isTypeEmail) {
    } else if (isTypePhone) {
    } else {
      return NextResponse.json(
        new ApiError(400, "Please enter a valid email or phone number"),
        { status: 400 }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return NextResponse.json(
      new ApiResponse(201, null, "Otp generated successfully"),
      { status: 201 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return NextResponse.json(
      new ApiError(500, `Internal server error: ${error}`)
    );
  }
}
