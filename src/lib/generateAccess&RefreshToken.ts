import { Iuser, User } from "@/models/user.model";
import { mongoDb } from "./mongodb";

interface IReturn {
  accessToken: string;
  refreshToken: string;
}
export async function GenerateTokens(id: string): Promise<IReturn | boolean> {
  try {
    await mongoDb();
    const user: null | Iuser = await User.findById(id);
    if (!user) {
      return false;
    }
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    const accessToken = user.generateAccessToken();
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    return false;
  }
}
