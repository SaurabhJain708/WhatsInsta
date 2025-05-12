"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AiOutlineKey, AiOutlineMail } from "react-icons/ai";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Form schema for email and OTP
const otpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be digits only"),
});

export default function ConfirmOtpPage() {
  const router = useRouter()
  const [allowOtp, setAllowOtp] = useState(true);
  const [otpCounter, setOtpCounter] = useState(30);
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const sendOtp = async () => {
    const isemailvalid = otpSchema.safeParse(email);
    if (!isemailvalid) {
      return;
    }
    setAllowOtp(false);
    const response = await fetch("/api/auth/generate-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const result = await response.json();
    toast(result.message, {
      action: {
        label: "x",
        onClick: () => console.log("Closed toast"),
      },
    });
    if (result.statusCode !== 201) {
      setAllowOtp(true);
    } else if (result.statusCode === 201) {
      const interval = setInterval(() => {
        setOtpCounter((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setAllowOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    setOtpCounter(30)
    console.log(result);
  };

  const onSubmit = async (data: z.infer<typeof otpSchema>) => {
    try {
      const response = await fetch("/api/auth/check-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp:data.otp,
          email:data.email
        }),
        credentials: "include",
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        router.push("/v1/create-password");
      } else if (result.statusCode === 411 || result.statusCode === 404) {
        router.push("/v1/sign-up");
      }
      toast(result.message, {
        action: {
          label: "x",
          onClick: () => console.log("Closed toast"),
        },
      });
    } catch (error) {
      
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-green-700 mb-2">
            KrishiSaarthi
          </h1>
          <p className="text-sm text-gray-600">
            Enter the OTP sent to your email
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineMail className="text-gray-400 w-5 h-5" />
              </div>
              <input
                id="email"
                type="email"
                className={`pl-10 w-full border ${
                  errors.email ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm h-10`}
                placeholder="Enter your email"
                {...register("email")}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
            <button
              type="button"
              onClick={sendOtp}
              disabled={!allowOtp}
              className="mt-2 w-full cursor-pointer bg-green-100 text-green-700 border border-green-500 py-2 rounded-md hover:bg-green-200 transition font-medium"
            >
              {allowOtp ? "Send OTP" : `Resend OTP (${otpCounter}s)`}
            </button>
          </div>

          {/* OTP Field */}
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700"
            >
              OTP
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineKey className="text-gray-400 w-5 h-5" />
              </div>
              <input
                id="otp"
                type="text"
                className={`pl-10 w-full border ${
                  errors.otp ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm h-10`}
                placeholder="Enter 6-digit OTP"
                {...register("otp")}
              />
            </div>
            {errors.otp && (
              <p className="text-xs text-red-600 mt-1">{errors.otp.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-semibold"
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
