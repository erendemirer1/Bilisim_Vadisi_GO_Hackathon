import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui";

interface UserMenuProps {
  user: {
    name: string;
    surname?: string;
    email?: string;
  };
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getInitials = () => {
    const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : "";
    const surnameInitial = user.surname
      ? user.surname.charAt(0).toUpperCase()
      : "";
    return `${nameInitial}${surnameInitial}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-2 py-1 h-auto hover:bg-gray-100 rounded-full transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-blue-700 transition-colors border-2 border-white ring-1 ring-gray-200">
          {getInitials()}
        </div>
        <div className="flex flex-col items-start mr-1">
          <span className="text-sm font-semibold text-gray-800 leading-none">
            {user.name} {user.surname}
          </span>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 origin-top-left animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Hesap Bilgileri
            </p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {user.email || "E-posta yok"}
            </p>
          </div>

          <div className="py-1">
            <Link
              to="/appointments"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              Randevularım
            </Link>
          </div>

          <div className="border-t border-gray-100 mt-1 pt-1 px-2 pb-1">
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 justify-start"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Güvenli Çıkış
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
