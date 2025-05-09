"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineUser, AiOutlineLock } from "react-icons/ai";
import Link from "next/link";

// Validation schema
const loginSchema = z.object({
  identifier: z.string().min(1, "Username or Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: unknown) => {
    setIsSubmitting(true);
    console.log("Logging in with:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-green-700 mb-2">KrishiSaarthi</h1>
          <p className="text-sm text-gray-600">Empowering Farmers with Technology</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
              Username or Email
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineUser className="text-gray-400 w-5 h-5" />
              </div>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                className={`pl-10 w-full border ${
                  errors.identifier ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm h-10`}
                placeholder="Enter your username or email"
                {...register("identifier")}
              />
            </div>
            {errors.identifier && (
              <p className="text-xs text-red-600 mt-1">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineLock className="text-gray-400 w-5 h-5" />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={`pl-10 w-full border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm h-10`}
                placeholder="Enter your password"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 cursor-pointer text-white py-2 rounded-md hover:bg-green-700 transition font-semibold"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative inline-block px-2 text-sm bg-white text-gray-500">
            Or continue with
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border cursor-pointer border-gray-300 py-2 flex items-center justify-center rounded-md shadow-sm hover:bg-gray-50 transition"
        >
          <FcGoogle className="mr-2 w-5 h-5" />
          Continue with Google
        </button>

        <div className="text-center text-sm text-gray-600 mt-4">
          New to KrishiSaarthi?{" "}
          <Link href="/v1/sign-up" className="text-green-600 font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
