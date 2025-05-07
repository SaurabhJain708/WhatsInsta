import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { mongoDb } from "@/lib/mongodb";
import { SendEmail } from "@/lib/Resend";
import { Iotp, Otp } from "@/models/otp.model";
import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await mongoDb();

  const session = await mongoose.startSession();

  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        new ApiError(400, "Please enter phone number or email"),
        { status: 400 }
      );
    }
    session.startTransaction();
    const existingOtp: null | Iotp = await Otp.findOne({
      email,
    }).session(session);
    if (existingOtp) {
      const deleteOldOtp = await Otp.findByIdAndDelete(existingOtp._id, {
        session,
      });
      if (!deleteOldOtp) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          new ApiError(500, "Internal server error, otp not genrated"),
          { status: 500 }
        );
      }
    }
    const nanoid = customAlphabet("0123456789", 6);

    const otp = nanoid(); // e.g., '483920'
    const newOtp = await Otp.create({ email, otp }, { session });
    if (!newOtp) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        new ApiError(500, "Internal server error in creating new otp"),
        { status: 500 }
      );
    }

    const sendEmailtoId = await SendEmail(otp, email);
    if (!sendEmailtoId) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        new ApiError(500, "Error in sending email, pleaase try again"),
        { status: 500 }
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
