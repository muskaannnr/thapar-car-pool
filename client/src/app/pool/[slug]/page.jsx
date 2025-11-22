"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Lock,
  Unlock,
  Phone,
  Mail,
  Train,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  CreditCard,
  Car,
  Star,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/utils/auth";
import PaymentCalculator from "@/components/PaymentCalculator";

const PoolDetailsPage = () => {
  const poolId = useParams().slug;
  const router = useRouter();
  const [poolDetails, setPoolDetails] = useState(null);
  const [memberDetails, setMemberDetails] = useState([]);
  const [driverDetails, setDriverDetails] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(null);
  const [genderStats, setGenderStats] = useState({
    male: 0,
    female: 0,
    other: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(
          "https://thapar-car-pool-production.up.railway.app/auth/me",
          {
            headers: {
              "auth-token": getAuthToken(),
            },
          }
        );
        const json = await userResponse.json();
        const userData = json.user;
        setCurrentUser(userData);

        const poolResponse = await fetch(
          `https://thapar-car-pool-production.up.railway.app/pool/${poolId}`,
          {
            headers: {
              "auth-token": getAuthToken(),
            },
          }
        );
        const poolData = await poolResponse.json();
        setPoolDetails(poolData.pool);
        setMemberDetails(poolData.members);
        setIsOwner(poolData.pool.owner === userData._id);
        setIsLocked(poolData.pool.locked);
        setDriverDetails(poolData.pool.driver);

        const stats = poolData.members.reduce(
          (acc, member) => {
            acc[member.gender.toLowerCase()]++;
            return acc;
          },
          { male: 0, female: 0, other: 0 }
        );
        setGenderStats(stats);

        setLoading(false);
      } catch (error) {
        console.log("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [poolId]);

  const getGenderColor = (gender) => {
    switch (gender.toLowerCase()) {
      case "male":
        return "bg-blue-100 text-blue-600";
      case "female":
        return "bg-pink-100 text-pink-600";
      default:
        return "bg-purple-100 text-purple-600";
    }
  };

  const handleLeavePool = async () => {
    try {
      await fetch(`https://thapar-car-pool-production.up.railway.app/pool/${poolId}/leave`, {
        method: "POST",
        headers: {
          "auth-token": getAuthToken(),
        },
      });
      router.push("/");
    } catch (error) {
      console.log("Error leaving pool:", error);
    }
  };

  const handleToggleLock = async () => {
    try {
      await fetch(
        `https://thapar-car-pool-production.up.railway.app/pool/${poolId}/toggle-lock`,
        {
          method: "POST",
          headers: {
            "auth-token": getAuthToken(),
          },
        }
      );
      setPoolDetails((prev) => ({
        ...prev,
        isLocked: !prev.locked,
      }));
      setIsLocked((prev) => !prev);
    } catch (error) {
      console.log("Error toggling pool lock:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="text-gray-600">Loading pool details...</span>
        </div>
      </div>
    );
  }

  if (!poolDetails || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <Alert variant="destructive">
          <AlertDescription>Failed to load pool details</AlertDescription>
        </Alert>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        {isLocked && !isOwner && (
          <Alert className="mb-6 bg-orange-100 border-orange-200">
            <AlertDescription className="text-orange-800">
              This pool is currently locked by the owner and is not accepting
              new members.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl">Pool Details</CardTitle>
                {isOwner && (
                  <button
                    onClick={handleToggleLock}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      isLocked
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock size={18} />
                        <span>Unlock Pool</span>
                      </>
                    ) : (
                      <>
                        <Unlock size={18} />
                        <span>Lock Pool</span>
                      </>
                    )}
                  </button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>Date: {formatDate(poolDetails.journeyDate)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>
                      Time: {formatTime(poolDetails.originalArrivalTime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Driver Details Card */}
            {driverDetails && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="w-6 h-6" />
                    <span>Driver Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                        <span className="text-2xl text-orange-600 font-medium">
                          {driverDetails.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium">
                            {driverDetails.name}
                          </h3>
                          <div className="flex items-center space-x-1 text-yellow-500">
                            <Star size={16} fill="currentColor" />
                            <span className="text-sm">3.4</span>
                          </div>
                        </div>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone size={16} />
                            <a
                              href={`tel:${driverDetails.phone}`}
                              className="hover:text-orange-500"
                            >
                              {driverDetails.phone}
                            </a>
                          </div>
                          {driverDetails.languages && (
                            <p className="text-sm text-gray-500">
                              Languages: {driverDetails.languages.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-6 h-6" />
                    <span>Pool Members ({poolDetails.members.length}/4)</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {memberDetails.map((member, index) => {
                    const poolMember = poolDetails.members.find(
                      (pm) => pm.id === member._id
                    );
                    return (
                      <div
                        key={member._id}
                        className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg ${
                          member._id === currentUser._id
                            ? "bg-orange-50"
                            : "bg-white"
                        } shadow-sm`}
                      >
                        <div className="space-y-2 md:space-y-0 md:space-x-4 md:flex md:items-center">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                member._id === currentUser._id
                                  ? "bg-orange-200"
                                  : "bg-orange-100"
                              }`}
                            >
                              <span className="text-orange-600 font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {member.name}
                                {member._id === currentUser._id && " (You)"}
                              </p>
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-500">
                                  {poolDetails.owner === member._id
                                    ? "(Pool Owner)"
                                    : "Member"}
                                </p>
                                <span
                                  className={`text-sm px-2 py-0.5 rounded-full ${getGenderColor(
                                    member.gender
                                  )}`}
                                >
                                  {member.gender}
                                </span>
                              </div>
                              {poolMember && (
                                <p className="text-sm text-gray-500">
                                  Arrival: {formatTime(poolMember.arrivalTime)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                          <a
                            href={`tel:${member.phone}`}
                            className="flex items-center space-x-2 text-gray-600 hover:text-orange-500"
                          >
                            <Phone size={18} />
                            <span>{member.phone}</span>
                          </a>
                          <a
                            href={`mailto:${member.email}`}
                            className="flex items-center space-x-2 text-gray-600 hover:text-orange-500"
                          >
                            <Mail size={18} />
                            <span>{member.email}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleLeavePool}
                  className="mt-6 w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Leave Pool
                </button>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <PaymentCalculator numberOfMembers={poolDetails.members.length} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolDetailsPage;
