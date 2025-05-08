import { User } from "@/models/user.model";
import { mongoDb } from "./mongodb";
import { GenerateTokens } from "./generateAccess&RefreshToken";
import jwt from "jsonwebtoken";

export async function RegenerateAccessRefreshToken(
  refreshToken: string
): Promise<false | { accessToken: string; refreshToken: string }> {
  try {
    await mongoDb();
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: string };
    if (!payload?.id) {
      return false;
    }
    const user = await User.findById(payload.id);
    if (!user) {
      return false;
    }
    if (refreshToken === user.refreshToken) {
      const token = await GenerateTokens(payload.id);
      if (!token || typeof token === "boolean") {
        return false;
      }
      const { accessToken, refreshToken } = token;

      return { accessToken, refreshToken };
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}
