"use client";

import { useEffect } from "react";

/**
 * Custom hook to prevent dropdown from causing unwanted scrollbars
 * This hook temporarily disables horizontal scrolling when a dropdown is open
 */
export function useDropdownFix(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Store the original overflow values
      const originalBodyOverflowY = document.body.style.overflowY;
      const originalHtmlOverflowY = document.documentElement.style.overflowY;

      // Temporarily disable any potential horizontal scrolling
      // while allowing vertical scrolling to continue normally
      document.body.style.overflowY = originalBodyOverflowY || "auto";
      document.documentElement.style.overflowY =
        originalHtmlOverflowY || "auto";

      // Add a class to help with CSS targeting
      document.body.classList.add("dropdown-open");

      return () => {
        // Restore original overflow values
        document.body.style.overflowY = originalBodyOverflowY;
        document.documentElement.style.overflowY = originalHtmlOverflowY;
        document.body.classList.remove("dropdown-open");
      };
    }
  }, [isOpen]);
}
