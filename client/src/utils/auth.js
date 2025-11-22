"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Check if we're on the client side
const isBrowser = () => typeof window !== "undefined";

// Get auth token from localStorage
export const getAuthToken = () => {
  if (isBrowser()) {
    return localStorage.getItem("authToken");
  }
  return null;
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  if (isBrowser()) {
    localStorage.setItem("authToken", token);
  }
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  if (isBrowser()) {
    localStorage.removeItem("authToken");
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  if (isBrowser()) {
    const token = getAuthToken();
    return !!token;
  }
  return false;
};

// Higher Order Component to protect routes
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      // Check authentication
      const isAuthed = isAuthenticated();

      // List of public routes
      const publicRoutes = ["/login", "/signup"];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!isAuthed && !isPublicRoute) {
        router.push("/login");
      } else if (isAuthed && isPublicRoute) {
        router.push("/");
      }
    }, [router, pathname]);

    // Render the wrapped component with its props
    return <Component {...props} />;
  };
}
