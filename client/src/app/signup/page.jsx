"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Car,
  UserPlus,
  MapPin,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAuthToken, withAuth } from "@/utils/auth";

function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rollNo: "",
    password: "",
    gender: "", // Added gender field
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 4) {
      newErrors.name = "Name should be at least 4 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@thapar\.edu$/.test(formData.email)) {
      newErrors.email = "Please use your Thapar email address";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid Indian phone number";
    }

    if (!formData.rollNo) {
      newErrors.rollNo = "Roll number is required";
    } else if (formData.rollNo.length !== 9) {
      newErrors.rollNo = "Roll number must be 9 characters long";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!acceptedTerms) {
      newErrors.terms =
        "You must accept the Terms of Service and Privacy Policy";
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
        "https://thapar-car-pool-production.up.railway.app/auth/register",
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
        throw new Error(data.error || "Registration failed");
      }

      // Store the token
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
          <p className="text-gray-600 text-lg">Create your account</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-90">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              Sign Up
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
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full text-black px-4 py-3 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-orange-300`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Added Gender Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full text-black px-4 py-3 border ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-orange-300 bg-white`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

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
                Thapar Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full text-black px-4 py-3 pl-10 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-orange-300`}
                  placeholder="your.name@thapar.edu"
                />
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full text-black px-4 py-3 pl-10 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all group-hover:border-orange-300`}
                  placeholder="Enter your phone number"
                />
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
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
                  placeholder="Create a strong password"
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

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className={`mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-500 ${
                  errors.terms ? "border-red-500" : ""
                }`}
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-orange-600 hover:text-orange-700"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-orange-600 hover:text-orange-700"
                >
                  Privacy Policy
                </button>
              </span>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600 mt-1">{errors.terms}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-orange-400 to-orange-600 text-white py-3 rounded-xl hover:from-orange-500 hover:to-orange-700 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 font-semibold ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                "Creating Account..."
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        {/* Bottom Decorative Element */}
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

export default withAuth(SignupPage);
