"use client";

import { useState } from "react";
import { Eye, EyeOff, Car, LogIn, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAuthToken, withAuth } from "@/utils/auth";

function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    rollNo: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rollNo) {
      newErrors.rollNo = "Roll number is required";
    } else if (formData.rollNo.length !== 9) {
      newErrors.rollNo = "Roll number must be 9 characters long";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://thapar-car-pool-production.up.railway.app/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setAuthToken(data.authtoken);

      // Redirect to dashboard
      router.push("/");
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements remain the same */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200 rounded-full -translate-x-32 -translate-y-32 blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300 rounded-full translate-x-32 translate-y-32 blur-3xl opacity-40" />

      {/* Floating Icons remain the same */}
      <div className="absolute top-20 right-20 animate-bounce">
        <Car className="w-8 h-8 text-orange-400 transform rotate-12" />
      </div>
      <div className="absolute bottom-20 left-20 animate-bounce delay-100">
        <MapPin className="w-8 h-8 text-orange-400 transform -rotate-12" />
      </div>
      <div className="absolute top-1/2 left-20 animate-bounce delay-200">
        <Users className="w-8 h-8 text-orange-400" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo and Branding remain the same */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 mb-4 shadow-lg transform hover:scale-105 transition-transform">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thapar Pooling System
          </h1>
          <p className="text-gray-600 text-lg">Welcome back!</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-90">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              Sign In
            </div>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                className={`w-full text-black px-4 py-3 border ${
                  errors.rollNo ? "border-red-500" : "border-gray-300"
                } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-orange-300`}
                placeholder="Enter your roll number"
              />
              {errors.rollNo && (
                <p className="mt-1 text-sm text-red-600">{errors.rollNo}</p>
              )}
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full text-black px-4 py-3 border ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-orange-300`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link href={"/forgot"}>
                <button
                  type="button"
                  className="text-orange-600 hover:text-orange-700"
                >
                  Forgot password?
                </button>
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 font-semibold ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="inline-flex items-center justify-center gap-2 text-gray-500 text-sm">
            <span className="w-16 h-px bg-gray-300" />
            <span>Safe • Reliable • Fast</span>
            <span className="w-16 h-px bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(LoginPage);
