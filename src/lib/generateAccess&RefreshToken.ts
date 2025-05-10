import { Iuser, User } from "@/models/user.model";
import { mongoDb } from "./mongodb";

interface IReturn {
  accessToken: string;
  refreshToken: string;
  user?: Iuser;
}
export async function GenerateTokens(
  email: string,
  userIn?: Iuser
): Promise<IReturn | boolean> {
  try {
    await mongoDb();
    if (userIn) {
      const refreshToken = userIn.generateRefreshToken();
      userIn.refreshToken = refreshToken;
      const accessToken = userIn.generateAccessToken();
      return { accessToken, refreshToken, user: userIn };
    }
    const user: null | Iuser = await User.findOne({ email });
    console.log(user);
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
