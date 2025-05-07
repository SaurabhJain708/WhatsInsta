import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface Iotp extends Document {
  email: string; // email or phone wrapped
  otp: string;
  compareOtp(otp: string): Promise<boolean>;
  createdAt: Date;
}

const otpSchema:mongoose.Schema<Iotp> = new mongoose.Schema<Iotp>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // auto delete in 5 minutes
  },
});

otpSchema.pre("save", async function (next) {
  if (this.isModified("otp")) {
    this.otp = await bcrypt.hash(this.otp, 10);
  }
  next();
});

otpSchema.methods.compareOtp = async function (otp: string): Promise<boolean> {
  return await bcrypt.compare(otp, this.otp);
};

export const Otp: Model<Iotp> =
  mongoose.models.Otp || mongoose.model<Iotp>("Otp", otpSchema);
