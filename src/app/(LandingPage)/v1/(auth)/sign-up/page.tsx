"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FcGoogle } from "react-icons/fc";
import { AiFillLock, AiOutlineMail } from "react-icons/ai";
import { BsPerson } from "react-icons/bs";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Zod validation schema
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be digits only"),
});

const emailSchema = z.string().email();

export default function SignupPage() {
  const [allowOtp, setAllowOtp] = useState(true);
  const [otpCounter, setOtpCounter] = useState(30);
  const router = useRouter();
  const [otp, setOtp] = useState(false);
  const [email, setEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    console.log("Form data:", data);
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          otp: data.otp,
        }),
      });

      const result = await response.json();
      toast(result.message, {
        action: {
          label: "x",
          onClick: () => console.log("Closed toast"),
        },
      });
      console.log("Server response:", result);

      if (result.statusCode === 201) {
        router.push("/v1/create-username");
      } else if (result.statusCode === 409) {
        router.push("/v1/login");
      } else if (result.statusCode === 422) {
        router.push("/v1/create-username");
      } else if (result.statusCode === 411) {
        router.push("/v1/create-password");
      }
    } catch (error) {
      toast("An error occurred. Please try again.", {
        action: {
          label: "x",
          onClick: () => console.log("Closed toast"),
        },
      });
      console.error("Signup error:", error);
    }
  };

  const handleGoogleSignup = () => {
    // Handle Google OAuth flow
    console.log("Google signup clicked");
  };

  const sendOtp = async () => {
    const isemailvalid = emailSchema.safeParse(email);
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
    console.log(result);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold text-green-700">
            KrishiSaarthi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us today and get started
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <BsPerson className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`pl-10 block w-full rounded-md border ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm h-10`}
                  placeholder="John Doe"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <AiOutlineMail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`pl-10 block w-full rounded-md border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm h-10`}
                  placeholder="you@example.com"
                  {...register("email")}
                  onChange={(e) => {
                    setOtp(true);
                    setEmail(e.target.value);
                  }}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mt-2">
              <button
                type="button"
                className="text-sm text-green-600 hover:underline cursor-pointer disabled:opacity-50"
                disabled={!allowOtp}
                onClick={sendOtp}
              >
                {allowOtp ? "Send Otp" : `Resend in ${otpCounter}s`}
              </button>
            </div>
            {otp && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Verify OTP
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <AiFillLock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    type="text"
                    className={`pl-10 block w-full rounded-md border ${
                      errors.otp ? "border-red-300" : "border-gray-300"
                    } shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm h-10`}
                    placeholder="otp"
                    {...register("otp")}
                  />
                </div>
                {errors.otp && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.otp.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSubmitting ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full cursor-pointer hover:bg-gray-300 inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FcGoogle className="w-5 h-5 mr-2" />
              Continue with Google
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/v1/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
