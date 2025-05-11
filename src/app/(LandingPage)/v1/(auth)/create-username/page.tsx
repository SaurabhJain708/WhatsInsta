"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineUser } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

// Validation schema
const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores are allowed"
    ),
});

export default function CreateUsernamePage() {
  const [username, setUsername] = useState("");
  const debouncedUsername = useDebounce(username, 1000);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(usernameSchema),
  });

  

  const onSubmit = async (data: z.infer<typeof usernameSchema>) => {
    try {
      const response = await fetch("/api/auth/create-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          readytocreate: true,
        }),
        credentials: "include"
      });
      const result = await response.json();
      console.log(result);
      toast(result.message, {
        action: {
          label: "x",
          onClick: () => console.log("Closed toast"),
        },
      });
      if (result.statusCode === 201 && result.data.areDetailsComplete) {
        router.back();
      } else if (result.statusCode === 201 && !result.data.areDetailsComplete) {
        router.push("/v1/create-password");
      }
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

  const handleCheckUsername = async (value: string) => {
    const isValid = usernameSchema.safeParse({ username: value });
    if (!isValid.success) {
      setIsUsernameAvailable(false);
      setIsUsernameChecked(true);
      return;
    }
      try {
        const response = await fetch("/api/auth/create-username", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: value,
          }),
          credentials: "include"
        });
        console.log("Response:", response);
        const result = await response.json();
        console.log(result);
        setIsUsernameChecked(true);
        if (result.statusCode === 200) {
          toast(result.message, {
            action: {
              label: "x",
              onClick: () => console.log("Closed toast"),
            },
          });
          setIsUsernameAvailable(true);
        } else {
          toast(result.message, {
            action: {
              label: "x",
              onClick: () => console.log("Closed toast"),
            },
          });
        }
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

  useEffect(()=>{
    handleCheckUsername(username);
},[debouncedUsername])
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-green-700 mb-2">
            KrishiSaarthi
          </h1>
          <p className="text-sm text-gray-600">Create your unique username</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AiOutlineUser className="text-gray-400 w-5 h-5" />
              </div>
              <input
                id="username"
                type="text"
                autoComplete="off"
                className={`pl-10 w-full border ${
                  errors.username ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm h-10`}
                placeholder="Choose a username"
                {...register("username")}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
              {isUsernameChecked && (
                <div className="absolute top-3.5 right-3">
                  {isUsernameAvailable ? (
                    <AiOutlineCheckCircle color="green" />
                  ) : (
                    <AiOutlineCloseCircle color="red" />
                  )}
                </div>
              )}
            </div>
            {!isUsernameAvailable && isUsernameChecked && (
              <p className="text-xs text-red-600 mt-1">
                Username not available
              </p>
            )}
            {errors.username && (
              <p className="text-xs text-red-600 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 cursor-pointer text-white py-2 rounded-md hover:bg-green-700 transition font-semibold"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
