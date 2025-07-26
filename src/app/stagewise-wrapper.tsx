"use client";

import { useEffect } from "react";

export default function StagewiseWrapper() {
  useEffect(() => {
    // Only initialize in development mode
    if (process.env.NODE_ENV === "development") {
      try {
        // Dynamically import to avoid SSR issues
        import("@stagewise/toolbar").then(({ initToolbar }) => {
          initToolbar();
        }).catch((error) => {
          console.warn("Failed to load stagewise toolbar:", error);
        });
      } catch (error) {
        console.warn("Stagewise toolbar initialization failed:", error);
      }
    }
  }, []);

  return null;
} 