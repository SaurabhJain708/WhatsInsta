import { NextRequest } from "next/server";
import { mongoDb } from "./mongodb";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { RegenerateAccessRefreshToken } from "./regenerateRefreshToken";
import { Iuser, User } from "@/models/user.model";

export interface Ireturn {
  user: Iuser;
  isTokenModified: boolean;
  accessToken: string;
  refreshToken: string;
  isVerified: boolean;
  areDetailsComplete: boolean;
}

export async function CheckAuth(req: NextRequest): Promise<boolean | Ireturn> {
  try {
    await mongoDb();
    let accessToken = req.cookies.get("accessToken")?.value ?? "";
    let refreshToken = req.cookies.get("refreshToken")?.value;
    let id: string;
    let isTokenModified: boolean = false;
    if (!refreshToken) {
      console.log("No tokens found");
      return false;
    }

    // check validity of tokens
    try {
      const payload = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET!
      ) as { id: string };
      console.log(payload);
      id = payload.id;
    } catch (error) {
      if (error instanceof TokenExpiredError || JsonWebTokenError) {
        console.error("Token has expired");
        const tokens = await RegenerateAccessRefreshToken(refreshToken);
        console.log(tokens);
        if (!tokens || typeof tokens === "boolean") {
          return false;
        }
        console.log("Tokens regenerated");
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        const payload = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET!
        ) as { id: string };
        id = payload.id;
        isTokenModified = true;
      } else {
        console.error("Unknown JWT error:", error);
        return false;
      }
    }

    const user = await User.findById(id);
    if (!user) {
      console.log("User not found");
      return false;
    }
    return {
      user,
      isTokenModified,
      accessToken,
      refreshToken,
      isVerified: user.isVerified,
      areDetailsComplete: user.areDetailsComplete,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
}
