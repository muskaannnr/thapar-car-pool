"use client";

import { useState, useEffect } from "react";
import { Car, MapPin, Users, ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setServerError(
        "No reset token provided. Please request a new password reset."
      );
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
        "https://api.thaparpool.rebec.in/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-orange-200 rounded-full -translate-x-32 -translate-y-32 blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300 rounded-full translate-x-32 translate-y-32 blur-3xl opacity-40" />

      {/* Floating Icons */}
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
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 mb-4 shadow-lg transform hover:scale-105 transition-transform">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set New Password
          </h1>
          <p className="text-gray-600 text-lg">
            {isSuccess
              ? "Your password has been updated successfully!"
              : "Please enter your new password"}
          </p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-90">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              Reset Password
            </div>
          </div>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {serverError}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                <p className="font-medium">Password Reset Successful!</p>
                <p className="text-sm mt-1">Redirecting you to login page...</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`w-full text-black px-4 py-3 border ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-orange-300`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    {showPassword.new ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full text-black px-4 py-3 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-orange-300`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    {showPassword.confirm ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 font-semibold ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  "Resetting..."
                ) : (
                  <>
                    <Lock size={20} />
                    Reset Password
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
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

export default ResetPasswordPage;
