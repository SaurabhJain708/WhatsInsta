import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { CheckAuth } from "@/lib/checkAuth";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const AuthContents = await CheckAuth(req);
    if (!AuthContents || typeof AuthContents === "boolean") {
      return NextResponse.json(new ApiError(403, "Authentication Failed"), {
        status: 403,
      });
    }
    const logoutUser = await User.findByIdAndUpdate(
      AuthContents.user._id,
      { refreshToken: null },
      { new: true }
    );
    if (!logoutUser) {
      return NextResponse.json(
        new ApiError(500, "Internal server error while logging out"),
        {
          status: 500,
        }
      );
    }
    const response = NextResponse.json(
      new ApiResponse(200, null, "Logout successful"),
      {
        status: 200,
      }
    );
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(new ApiError(500, "Internal server error"), {
      status: 500,
    });
  }
}
