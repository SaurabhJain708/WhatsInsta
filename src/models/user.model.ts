import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface Iuser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username?: string;
  password?: string;
  about: String;
  profilePicUrl: String;
  lastSeen: Date;
  isOnline: Boolean;
  email?: string;
  refreshToken?: string;
  areDetailsComplete: boolean;
  provider: "google" | "credentials";
  comparePassword(password: string): Promise<boolean>;
  generateRefreshToken(): string;
  generateAccessToken(): string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: mongoose.Schema<Iuser> = new mongoose.Schema<Iuser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    about: {
      type: String,
      default: "Hey there! I am using WhatsInsta.",
    },
    profilePicUrl: {
      type: String,
      default: "https://example.com/default-profile.png", // replace with real URL
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
      lowercase: true,
    },
    refreshToken: {
      type: String,
      required: false,
      select: false,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    areDetailsComplete: {
      type: Boolean,
      required: true,
      default: false,
    },
    provider: {
      type: String,
      enum: ["google", "credentials"],
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  const secretKey: string = process.env.ACCESS_TOKEN_SECRET!;
  return jwt.sign(
    {
      id: this._id,
      isVerified: this.isVerified,
      areDetailsComplete: this.areDetailsComplete,
    },
    secretKey,
    {
      expiresIn: "30m",
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  const secretKey: string = process.env.REFRESH_TOKEN_SECRET!;
  return jwt.sign(
    {
      id: this._id,
    },
    secretKey,
    {
      expiresIn: "5d",
    }
  );
};

export const User: Model<Iuser> =
  mongoose.models.User || mongoose.model<Iuser>("User", userSchema);
