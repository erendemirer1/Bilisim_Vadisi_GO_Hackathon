import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../components/ui";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.target as HTMLFormElement;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    try {
      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/admin/login`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Giriş başarısız.");
      }

      localStorage.setItem("adminToken", data.data);

      navigate("/admin/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Sunucu ile bağlantı kurulamadı.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/50 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Yönetici Paneli
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Sisteme erişmek için kimliğinizi doğrulayın.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <Input
                name="phone"
                label="Yönetici Telefonu"
                placeholder="555 555 55 55"
                autoComplete="phone"
              />

              <Input
                name="password"
                label="Şifre"
                type="password"
                placeholder="••••••••••••"
                autoComplete="current-password"
              />

              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 focus:ring-slate-900"
                isLoading={isLoading}
              >
                Güvenli Giriş
              </Button>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Bu alana sadece yetkili personel erişebilir.
              <br />
              IP adresiniz kayıt altına alınmaktadır.
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          &copy; 2025 Hastane Yönetim Sistemi v1.0
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
