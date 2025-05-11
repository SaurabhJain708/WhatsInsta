import { Iuser, User } from "@/models/user.model";
import { mongoDb } from "./mongodb";
import { GenerateTokens } from "./generateAccess&RefreshToken";
import jwt from "jsonwebtoken";

export async function RegenerateAccessRefreshToken(
  refreshToken: string
): Promise<false | { accessToken: string; refreshToken: string; user: Iuser }> {
  try {
    await mongoDb();
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: string };
    if (!payload?.id) {
      console.log(payload);
      return false;
    }
    const user = await User.findById(payload.id).select("+refreshToken");
    if (!user) {
      console.log("User not found");
      return false;
    }
    if (refreshToken === user.refreshToken) {
      const token = await GenerateTokens("", user);
      if (!token || typeof token === "boolean") {
        console.log("Error in token", token);
        return false;
      }
      await token.user?.save();
      const { accessToken, refreshToken } = token;

      return { accessToken, refreshToken, user };
    }
    console.log("Refresh token not matched", refreshToken); 
    console.log("userToken type", typeof user.refreshToken);
    console.log("refreshToken type", typeof refreshToken);
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}
