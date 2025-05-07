import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { mongoDb } from "@/lib/mongodb";
import { Iotp, Otp } from "@/models/otp.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { otp, email } = await req.json();
    if (!otp || !email) {
      return NextResponse.json(
        new ApiError(400, "Please enter otp and email"),
        { status: 400 }
      );
    }
    await mongoDb();

    const hasOtp: null | Iotp = await Otp.findOne({ email });
    if (!hasOtp) {
      return NextResponse.json(new ApiError(404, "Otp not found"), {
        status: 404,
      });
    }
    const isOtpCorrect = await hasOtp?.compareOtp(otp);
    if (!isOtpCorrect) {
      return NextResponse.json(new ApiError(400, "Otp not matched"), {
        status: 400,
      });
    }
    return NextResponse.json(new ApiResponse(200, null, "Otp is correct"), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      new ApiError(500, `Internal server error: ${error}`),
      { status: 500 }
    );
  }
}
