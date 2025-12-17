import React from "react";
import { cn } from "../utils";

interface PageLoaderProps {
  className?: string;
  message?: string;
}

export const Loader: React.FC<PageLoaderProps> = ({
  className,
  message = "Yükleniyor...",
}) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm transition-all",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>

        <div className="absolute text-blue-600 animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </div>
      </div>

      {message && (
        <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse tracking-wide">
          {message}
        </p>
      )}
    </div>
  );
};
