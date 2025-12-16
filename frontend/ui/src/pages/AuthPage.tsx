import React, { useState } from "react";
import { Button, Input } from "../components/ui";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    surname?: string;
    phone?: string;
  }>({});

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    let name = "";
    let surname = "";
    let phone = "";
    if (!isLogin) {
      name = (form.elements.namedItem("name") as HTMLInputElement)?.value;
      surname = (form.elements.namedItem("surname") as HTMLInputElement)?.value;
      phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value;
    }

    setTimeout(() => {
      const newErrors: typeof errors = {};

      if (!email || !email.includes("@")) {
        newErrors.email = "Geçerli bir e-posta adresi giriniz.";
      }
      if (password.length < 6) {
        newErrors.password = "Şifre en az 6 karakter olmalıdır.";
      }

      if (!isLogin) {
        if (!name || name.length < 3) {
          newErrors.name = "Ad Soyad en az 3 karakter olmalıdır.";
        }
        if (!surname || surname.length < 2) {
          newErrors.surname = "Ad Soyad en az 2 karakter olmalıdır.";
        }
        if (!phone || phone.length < 10) {
          newErrors.phone = "Geçerli bir telefon numarası giriniz.";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      alert(isLogin ? "Giriş Başarılı!" : "Kayıt Başarılı! Hoşgeldiniz.");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center lg:grid lg:grid-cols-2 bg-gray-50">
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 w-full max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-8 self-start">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white"></div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">
            42 Randevu
          </span>
        </div>

        <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? "Hoşgeldiniz" : "Kaydolun"}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {isLogin
                ? "Randevularınızı yönetmek için giriş yapın."
                : "Hızlı randevu oluşturmak için hemen kayıt oluşturun."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <Input
                  name="name"
                  label="Adınız"
                  placeholder="Örn: Melih"
                  error={errors.name}
                />
                <Input
                  name="surname"
                  label="Soyadınız"
                  placeholder="Örn: Yıldız"
                  error={errors.surname}
                />
                <Input
                  name="email"
                  label="E-posta"
                  placeholder="ornek@mail.com"
                  error={errors.email}
                />
              </>
            )}
            <Input
              name="phone"
              label="Telefon Numarası"
              type="tel"
              placeholder="0555 555 55 55"
              error={errors.phone}
            />

            <div className="space-y-1">
              <Input
                name="password"
                label="Şifre"
                type="password"
                placeholder="••••••••"
                error={errors.password}
              />
              {isLogin && (
                <div className="flex justify-end">
                  <a
                    href="#"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Şifremi unuttum?
                  </a>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 mt-2"
              isLoading={isLoading}
            >
              {isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-blue-600 font-semibold hover:underline focus:outline-none cursor-pointer"
            >
              {isLogin ? "Hasta Kaydı Oluştur" : "Giriş Yap"}
            </button>
          </div>
        </div>

        <p className="mt-8 text-xs text-center text-gray-400">
          &copy; 2025 MediRandevu Sağlık Grubu. KVKK ve Gizlilik Politikası.
        </p>
      </div>

      <div className="hidden lg:flex flex-col relative h-full bg-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-blue-600/80"></div>

        <div className="relative z-10 flex flex-col justify-center h-full p-16 max-w-2xl">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Sağlığınız İçin
            <br />
            En Hızlı Çözümler
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Uzman doktor kadromuz ve gelişmiş randevu sistemimiz ile beklemeden
            muayene olun. Acil durumlarda 7/24 yanınızdayız.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
