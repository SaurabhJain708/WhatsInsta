import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface Iuser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  password?: string;
  phoneNumber: String;
  about: String; // user status
  profilePicUrl: String;
  lastSeen: Date;
  isOnline: Boolean;
  email?: string;
  refreshToken?: string;
  comparePassword(password: string): Promise<boolean>;
  generateRefreshToken(): string;
  generateAccessToken(): string;
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
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
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
    },
    refreshToken: {
      type: String,
      required: false,
      select: false,
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
    },
    secretKey,
    {
      expiresIn: "1d",
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
      expiresIn: "10d",
    }
  );
};

export const User: Model<Iuser> =
  mongoose.models.User || mongoose.model<Iuser>("User", userSchema);
