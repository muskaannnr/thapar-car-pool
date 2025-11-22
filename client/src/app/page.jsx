"use client";

import React, { useState, useEffect } from "react";
import {
  Car,
  Train,
  Plus,
  Calendar,
  Clock,
  Users,
  LogOut,
  Search,
  CalendarIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { getAuthToken, removeAuthToken, withAuth } from "@/utils/auth";
import CreatePoolModal from "@/components/CreatePoolModal";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// Utility function to format UTC time to IST
const formatTimeToIST = (utcTimeString) => {
  try {
    const date = new Date(utcTimeString);

    // Convert to IST (UTC+5:30)
    const istTime = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

    // Format time to 12-hour format with AM/PM
    return istTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  } catch (error) {
    console.log("Error formatting time:", error);
    return "Time not available";
  }
};

// Utility function to format date
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.log("Error formatting date:", error);
    return "Date not available";
  }
};

function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("find");
  const [trainNumber, setTrainNumber] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [myRides, setMyRides] = useState([]);
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  const [processingPoolId, setProcessingPoolId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch My Rides when tab changes to "myRides"
  useEffect(() => {
    if (activeTab === "myRides") {
      fetchMyRides();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("https://thapar-car-pool-production.up.railway.app/auth/me", {
        headers: {
          "Content-Type": "application/json",
          "auth-token": getAuthToken(),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch user details");
      const data = await response.json();
      setCurrentUser(data.user);
    } catch (error) {
      console.log("Error fetching user details:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch user details. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const handlePoolAction = async (poolId, action) => {
    setProcessingPoolId(poolId);
    try {
      const response = await fetch(
        `https://thapar-car-pool-production.up.railway.app/pool/${poolId}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": getAuthToken(),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} pool`);
      }

      const data = await response.json();

      // Update the search results to reflect the changes
      setSearchResults((prevResults) =>
        prevResults.map((pool) =>
          pool._id === poolId ? { ...pool, members: data.pool.members } : pool
        )
      );

      // Show success message
      toast({
        title: "Success!",
        description: `You have successfully ${action}ed the pool.`,
        variant: "default",
        className: "bg-green-50 border-green-200",
        duration: 3000,
      });

      // Refresh my rides if we're on the my rides tab
      if (activeTab === "myRides") {
        fetchMyRides();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.message || `Failed to ${action} pool. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setProcessingPoolId(null);
    }
  };

  const isUserInPool = (pool) => {
    return (
      currentUser &&
      pool.members.some((member) => member.id === currentUser._id)
    );
  };

  const PoolCard = ({ pool, showActions = true }) => (
    <Link href={`${isUserInPool(pool) ? `/pool/${pool._id}` : ``}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600">
                Created by {pool.members[0]?.name || "Unknown"}
              </p>
            </div>
            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
              {pool.members.length}/4 members
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar size={18} />
              <span>{formatDate(pool.journeyDate)}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock size={18} />
              <span>Time: {formatTimeToIST(pool.originalArrivalTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users size={18} />
              <div className="flex flex-wrap gap-2">
                <span className="font-medium">Members: </span>
                {pool.members.map((member) => (
                  <span
                    key={member.id}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {member.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {showActions && (
            <button
              className={`mt-4 w-full px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2 
              ${
                isUserInPool(pool)
                  ? "bg-red-500 hover:bg-red-600 disabled:bg-red-300"
                  : "bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300"
              } text-white`}
              onClick={() =>
                handlePoolAction(
                  pool._id,
                  isUserInPool(pool) ? "leave" : "join"
                )
              }
              disabled={
                processingPoolId === pool._id ||
                (!isUserInPool(pool) && pool.members.length >= 4)
              }
            >
              {processingPoolId === pool._id ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span>
                    {isUserInPool(pool) ? "Leaving..." : "Joining..."}
                  </span>
                </>
              ) : !isUserInPool(pool) && pool.members.length >= 4 ? (
                "Pool Full"
              ) : isUserInPool(pool) ? (
                "Leave Pool"
              ) : (
                "Join Pool"
              )}
            </button>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  const fetchMyRides = async () => {
    setIsLoadingRides(true);
    try {
      const response = await fetch(
        "https://thapar-car-pool-production.up.railway.app/pool/myupcoming",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": getAuthToken(),
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch my rides");
      const data = await response.json();
      setMyRides(data.pools);
    } catch (error) {
      console.log("Error fetching my rides:", error);
      setMyRides([]);
    } finally {
      setIsLoadingRides(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://thapar-car-pool-production.up.railway.app/pool/search?trainno=${trainNumber}&journeyDate=${searchDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": getAuthToken(),
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch pools");
      const data = await response.json();
      setSearchResults(data.pools);
    } catch (error) {
      console.log("Error fetching pools:", error);
      setSearchResults([]);
    }
    setIsSearching(true);
  };

  const EmptyState = () => (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
        <Train className="w-8 h-8 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Find Your Perfect Travel Companions
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        Enter your train number and date to discover available pools. Join
        existing groups or create your own pool to share your journey with
        fellow travelers.
      </p>
      <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Share Travel Costs</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Flexible Timings</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Daily Pools</span>
        </div>
      </div>
    </div>
  );

  const handleCreatePool = () => {
    setIsCreateModalOpen(true);
  };

  const handlePoolSubmit = (poolData) => {
    console.log("New pool data:", poolData);
    setIsCreateModalOpen(false);
  };

  const handleJoinPool = async (poolId) => {
    setJoiningPool(poolId);
    try {
      const response = await fetch(
        `https://thapar-car-pool-production.up.railway.app/pool/${poolId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": getAuthToken(),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join pool");
      }

      const data = await response.json();

      // Update the search results to reflect the joined pool
      setSearchResults((prevResults) =>
        prevResults.map((pool) =>
          pool._id === poolId ? { ...pool, members: data.pool.members } : pool
        )
      );

      // Show success message
      toast({
        title: "Success!",
        description: "You have successfully joined the pool.",
        variant: "default",
        className: "bg-green-50 border-green-200",
        duration: 3000,
      });

      // Refresh my rides if we're on the my rides tab
      if (activeTab === "myRides") {
        fetchMyRides();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to join pool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoiningPool(null);
    }
  };

  const renderSearchResults = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {searchResults.map((pool) => (
        <PoolCard key={pool._id} pool={pool} />
      ))}
    </div>
  );

  const renderMyRides = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {myRides.map((pool) => (
        <PoolCard key={pool._id} pool={pool} />
      ))}
    </div>
  );

  const RidesEmptyState = () => (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
        <Calendar className="w-8 h-8 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Upcoming Rides
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        You haven&apos;t joined any pools yet. Search for available pools or
        create your own to start sharing rides with fellow travelers.
      </p>
      <button
        onClick={() => setActiveTab("find")}
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center space-x-2"
      >
        <Search size={20} />
        <span>Find Pools</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Car className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                Thapar Pooling System
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Updated Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab("find")}
            className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
              activeTab === "find"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-orange-100"
            } transition-colors`}
          >
            <Search size={20} />
            <span>Find Pool</span>
          </button>
          <button
            onClick={() => setActiveTab("myRides")}
            className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
              activeTab === "myRides"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-orange-100"
            } transition-colors`}
          >
            <Calendar size={20} />
            <span>My Rides</span>
          </button>
        </div>

        {/* Find Pool Section */}
        {activeTab === "find" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={trainNumber}
                      onChange={(e) => setTrainNumber(e.target.value)}
                      placeholder="Enter train number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center space-x-2"
                  >
                    <Search size={20} />
                    <span>Search</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>Create Pool</span>
                  </button>
                </form>
              </CardContent>
            </Card>

            {/* Search Results or Empty State */}
            {!isSearching ? <EmptyState /> : renderSearchResults()}
          </div>
        )}

        {/* Updated My Rides Section */}
        {activeTab === "myRides" && (
          <div className="space-y-6">
            {isLoadingRides ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600">Loading your rides...</span>
                </div>
              </div>
            ) : myRides.length === 0 ? (
              <RidesEmptyState />
            ) : (
              renderMyRides()
            )}
          </div>
        )}

        <CreatePoolModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handlePoolSubmit}
        />
        <Toaster />
      </main>
    </div>
  );
}

export default withAuth(DashboardPage);
