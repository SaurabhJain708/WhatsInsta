"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { AiOutlineLock } from "react-icons/ai";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Validation schema
const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function CreatePasswordPage() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      const response = await fetch("/api/auth/create-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
        }),
        credentials: "include",
      });
      const result = await response.json();
      if (result.statusCode === 200) {
        router.push("/v2/dashboard");
      } else if (result.statusCode === 403) {
        router.push("/v1/login");
      } else if (result.statusCode === 411) {
        router.push("/v1/create-username");
      }

      toast(result.message, {
        action: {
          label: "x",
          onClick: () => console.log("Closed toast"),
        },
      });
    } catch (error) {
      console.error("Error:", error);
      toast("Failed to connect, Please try again", {
        action: {
          label: "x",
          onClick: () => console.log("Closed toast"),
        },
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-green-700 mb-2">
            KrishiSaarthi
          </h1>
          <p className="text-sm text-gray-600">Create a strong password</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineLock className="text-gray-400 w-5 h-5" />
              </div>
              <input
                id="password"
                type={passwordVisible ? "text" : "password"}
                className={`pl-10 w-full border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm h-10`}
                placeholder="Enter password"
                {...register("password")}
              />
              <div
                className="absolute top-3.5 right-4 cursor-pointer"
                onClick={() => {
                  setPasswordVisible((prev) => !prev);
                }}
              >
                {passwordVisible ? <BsEyeSlash /> : <BsEye color="black" />}
              </div>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineLock className="text-gray-400 w-5 h-5" />
              </div>
              <input
                id="confirmPassword"
                type={confirmPasswordVisible ? "text" : "password"}
                className={`pl-10 w-full border ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm h-10`}
                placeholder="Re-enter password"
                {...register("confirmPassword")}
              />
              <div
                className="absolute top-3.5 right-4 cursor-pointer"
                onClick={() => {
                  setConfirmPasswordVisible((prev) => !prev);
                }}
              >
                {confirmPasswordVisible ? (
                  <BsEyeSlash />
                ) : (
                  <BsEye color="black" />
                )}
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-semibold"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
