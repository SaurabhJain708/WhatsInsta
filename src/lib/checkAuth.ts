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
}

export async function CheckAuth(req: NextRequest): Promise<boolean | Ireturn> {
  try {
    await mongoDb();
    let accessToken = req.cookies.get("accessToken")?.value;
    let refreshToken = req.cookies.get("refreshToken")?.value;
    let id: string;
    let isTokenModified: boolean = false;
    if (!accessToken || !refreshToken) {
      return false;
    }

    // check validity of tokens
    try {
      const payload = jwt.verify(
        accessToken,
        process.env.ACCESSTOKEN_SECRET!
      ) as { id: string };
      id = payload.id;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.error("Token has expired");
        const tokens = await RegenerateAccessRefreshToken(refreshToken);
        if (!tokens || typeof tokens === "boolean") {
          return false;
        }
        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;
        const payload = jwt.verify(
          accessToken,
          process.env.ACCESSTOKEN_SECRET!
        ) as { id: string };
        id = payload.id;
        isTokenModified = true;
      } else if (error instanceof JsonWebTokenError) {
        console.error("Token is invalid");
        return false;
      } else {
        console.error("Unknown JWT error:", error);
        return false;
      }
    }

    const user = await User.findById(id);
    if (!user) {
      return false;
    }
    return { user, isTokenModified, accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    return false;
  }
}
