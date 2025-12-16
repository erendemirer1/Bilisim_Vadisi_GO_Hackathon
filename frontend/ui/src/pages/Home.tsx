import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";

const Home = () => {
  console.log(localStorage.getItem("authToken"));
  const user = { name: "Ahmet Yılmaz" };

  const nextAppointment = {
    exists: true,
    doctor: "Dr. Ayşe Yılmaz",
    department: "Kardiyoloji",
    date: "18 Aralık 2025",
    time: "14:30",
    location: "Poliklinik A, Oda 102",
    daysLeft: 2,
  };

  const popularDepartments = [
    { name: "Dahiliye", icon: "🩺", color: "bg-blue-50 text-blue-600" },
    {
      name: "Göz Hastalıkları",
      icon: "👁️",
      color: "bg-green-50 text-green-600",
    },
    {
      name: "Diş Polikliniği",
      icon: "🦷",
      color: "bg-orange-50 text-orange-600",
    },
    { name: "KBB", icon: "👂", color: "bg-purple-50 text-purple-600" },
  ];

  const recentDoctors = [
    {
      id: 1,
      name: "Dr. Mehmet Öz",
      dept: "Nöroloji",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80",
    },
    {
      id: 2,
      name: "Dr. Elif Demir",
      dept: "Dahiliye",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=100&q=80",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Merhaba, {user.name} 👋
          </h1>
          <p className="text-gray-500">
            Randevularınızı planlamak için bugün harika bir gün.
          </p>
        </div>
        <Link to="/doctor-search">
          <Button
            size="lg"
            className="shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700"
          >
            + Yeni Randevu Oluştur
          </Button>
        </Link>
      </div>

      {nextAppointment.exists ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl p-8">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-slate-300 text-sm font-medium uppercase tracking-wider">
                  Sıradaki Randevunuz
                </span>
              </div>
              <div className="flex items-end gap-3 mb-1">
                <h2 className="text-5xl font-bold">{nextAppointment.time}</h2>
                <span className="text-2xl text-slate-300 mb-1">
                  {nextAppointment.date}
                </span>
              </div>
              <p className="text-slate-400 mt-2 flex items-center gap-2">
                <span className="bg-slate-700/50 px-2 py-1 rounded text-sm text-white">
                  {nextAppointment.daysLeft} gün kaldı
                </span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[280px] border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                  DR
                </div>
                <div>
                  <p className="font-bold text-white">
                    {nextAppointment.doctor}
                  </p>
                  <p className="text-xs text-slate-300">
                    {nextAppointment.department}
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p>📍 {nextAppointment.location}</p>
                <p>⚠️ Lütfen 15 dk önce geliniz.</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Detay
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full bg-red-500/20 text-red-200 border-0 hover:bg-red-500/30"
                >
                  İptal
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Henüz planlanmış bir randevunuz yok.
            </h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Sağlığınızı ihmal etmeyin. Uzman doktor kadromuzdan size uygun
              olanı seçerek hemen randevunuzu oluşturabilirsiniz.
            </p>
            <Link to="/doctor-search">
              <Button>Hemen Doktor Bul</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              Hızlı Randevu Al
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Popüler Bölümler
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {popularDepartments.map((dept) => (
                <Link
                  key={dept.name}
                  to={`/doctor-search?dept=${dept.name}`}
                  className="group bg-white border border-gray-200 hover:border-blue-400 p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 h-32"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${dept.color} group-hover:scale-110 transition-transform`}
                  >
                    {dept.icon}
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-blue-600">
                    {dept.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex items-start gap-4">
            <span className="text-3xl">📢</span>
            <div>
              <h4 className="font-bold text-indigo-900">
                Hastanemizden Haberler
              </h4>
              <p className="text-sm text-indigo-700 mt-1">
                Hastanemiz artık Cumartesi günleri de 09:00 - 13:00 saatleri
                arasında poliklinik hizmeti vermektedir. Randevu alırken hafta
                sonu slotlarını kontrol etmeyi unutmayın.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Önceki Doktorlarım</h3>
            <Link
              to="/appointments"
              className="text-xs text-blue-600 hover:underline"
            >
              Geçmişi Gör
            </Link>
          </div>

          <div className="space-y-4">
            {recentDoctors.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
              >
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-12 h-12 rounded-full object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    {doc.name}
                  </h4>
                  <p className="text-xs text-gray-500">{doc.dept}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200"
                >
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
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </Button>
              </div>
            ))}

            <div className="pt-2">
              <Link to="/doctor-search">
                <Button variant="secondary" className="w-full text-xs h-9">
                  Tüm Doktorları Gör
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
