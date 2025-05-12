import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { User } from "@/models/user.model";
import { mongoDb } from "@/lib/mongodb";
import { ApiError } from "@/lib/ApiError";
import { GenerateTokens } from "@/lib/generateAccess&RefreshToken";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    await mongoDb();
    const { data: tokenResponse } = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const { access_token } = tokenResponse;

    const { data: googleUser } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!googleUser) {
      return NextResponse.json(new ApiError(500, "Server error from google"));
    }

    //Existing User Login
    const alreadyUser = await User.findOne({ email: googleUser.email });
    if (alreadyUser) {
      const token = await GenerateTokens(alreadyUser.email!);
      if (!token || typeof token === "boolean") {
        return NextResponse.json(
          new ApiError(500, "Server error while generating tokens")
        );
      }
      let response;
      if (alreadyUser.areDetailsComplete) {
        response = NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_URL}/v2/dashboard`
        );
      } else {
        response = NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_URL}/v1/create-username`
        );
      }

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
    }

    // New User Signup
    const newUser = await User.create({
      name: googleUser.name,
      email: googleUser.email,
      provider: "google",
    });

    if (!newUser) {
      return NextResponse.json(
        new ApiError(500, "Server error while creating new user"),
        { status: 500 }
      );
    }
    const token = await GenerateTokens(newUser.email!);
    if (!token || typeof token === "boolean") {
      return NextResponse.json(
        new ApiError(500, "Server error while generating tokens")
      );
    }

    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/v1/create-username`
    );
    response.cookies.set("accessToken", token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict", // Adjust to your needs, 'strict' is safer
      path: "/", // Accessible throughout the entire app
      maxAge: 60 * 60, // 1 hour
    });

    response.cookies.set("refreshToken", token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  } catch (error: any) {
    console.error("OAuth Error:", error?.response?.data || error.message);
    return NextResponse.json(new ApiError(500, "Server error"), {
      status: 500,
    });
  }
}
