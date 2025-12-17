import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Loader, Modal } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { UserMenu } from "../components/UserMenu";
import { authRequest } from "../hooks/authRequest";
import { useSnackbar } from "../context/SnackbarContext";

interface User {
  name: string;
  surname?: string;
  email: string;
}
interface UserData {
  message: string;
  status: string;
  data: User;
}

interface Doctor {
  id: number;
  fullname: string;
  expertise: string;
}

interface DoctorsData {
  status: string;
  message: string;
  data: Doctor[];
}
interface Appointment {
  id: number;
  user_id: number;
  name: string;
  surname: string;
  doctor_id: number;
  doctor_name: string;
  doctor_expertise: string;
  date: string;
  hour: string;
  status: string;
  createdAt: string;
}

interface AppointmentData {
  status: string;
  message: string;
  data: Appointment[];
}

const Home = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: user, loading, error } = useFetch<UserData>("/validate");
  const { data: doctors } = useFetch<DoctorsData>("/admin/doctor");

  const { data: appointmentsResult, refetch: refetchAppointments } =
    useFetch<AppointmentData>("/appointment");

  const latestAppointment =
    appointmentsResult?.data && appointmentsResult.data.length > 0
      ? appointmentsResult.data[0]
      : null;

  const handleDeleteAppoint = async () => {
    if (!latestAppointment) return;

    setIsCanceling(true);
    try {
      await authRequest(`/appointment/${latestAppointment.id}`, {
        method: "DELETE",
      });

      setShowCancelModal(false);
      refetchAppointments();
    } catch (err: any) {
      showSnackbar("İptal işlemi başarısız: " + err.message, "error");
    } finally {
      setIsCanceling(false);
    }
  };
  useEffect(() => {
    if (error) {
      localStorage.removeItem("authToken");
      navigate("/");
    }
  }, [error, navigate]);

  const logOut = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const nextAppointment = {
    exists: !!latestAppointment,
    doctor: latestAppointment?.doctor_name || "",
    department: latestAppointment?.doctor_expertise || "",
    date: latestAppointment?.date || "",
    time: latestAppointment?.hour || "",
    location: "Poliklinik A",
    daysLeft: 0,
  };

  const popularDepartments = [
    {
      name: "Dahiliye",
      src: "assets/dahiliye.png",
      color: "bg-blue-50 text-blue-600",
    },
    {
      name: "Göz Hastalıkları",
      src: "assets/goz.png",
      color: "bg-green-50 text-green-600",
    },
    {
      name: "Diş Polikliniği",
      src: "assets/dis.png",
      color: "bg-orange-50 text-orange-600",
    },
    {
      name: "KBB",
      src: "assets/kbb.png",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  if (loading) return <Loader />;
  if (!user) return <div>No User</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <UserMenu user={user.data} onLogout={logOut} />
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
                <h2 className="text-5xl font-bold">
                  Saat: {nextAppointment.time == "9" ? "0" : ""}
                  {nextAppointment.time}:00
                </h2>
                <span className="text-2xl text-slate-300 mb-1">
                  {nextAppointment.date}
                </span>
              </div>
              <p className="text-slate-400 mt-2 flex items-center gap-2">
                <span className="bg-slate-700/50 px-2 py-1 rounded text-sm text-white">
                  Yaklaşıyor
                </span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-70 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                  {nextAppointment.doctor.charAt(0)}
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

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={() => setShowDetailModal(true)}
                >
                  Detay
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full bg-red-500/20 text-red-200 border-0 hover:bg-red-500/30"
                  onClick={() => setShowCancelModal(true)}
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
                    <img src={`${dept.src}`} alt="" className="w-8 h-8" />
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
                Alanında uzmanlığıyla tanınan Dr. Canan Karatay, hastanemiz
                bünyesinde hasta kabulüne başlamıştır. Dr. Canan Karatay’dan
                hizmet almak isteyen danışanlarımız, Randevu Oluştur bölümünden
                kolayca randevu alabilirler. Sağlığınız için en kaliteli hizmeti
                sunmaya devam ediyoruz.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Doktorlarımız</h3>
          </div>

          <div className="space-y-4">
            {doctors?.data.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    {doc.fullname}
                  </h4>
                  <p className="text-xs text-gray-500">{doc.expertise}</p>
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
          </div>
        </div>
      </div>
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Randevu İptali"
        size="sm"
      >
        <div className="text-center">
          <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>

          <h3 className="font-bold text-gray-900 mb-2">Emin misiniz?</h3>
          <p className="text-gray-500 text-sm mb-6">
            <strong>{latestAppointment?.doctor_name}</strong> ile olan
            randevunuzu iptal etmek üzeresiniz. Bu işlem geri alınamaz.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={() => setShowCancelModal(false)}
              disabled={isCanceling}
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAppoint}
              isLoading={isCanceling}
            >
              Evet, İptal Et
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Randevu Detayları"
      >
        {latestAppointment && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl shadow-sm">
                {latestAppointment.doctor_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  {latestAppointment.doctor_name}
                </h4>
                <p className="text-blue-600 font-medium">
                  {latestAppointment.doctor_expertise}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                  Aktif Randevu
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Tarih</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  {latestAppointment.date}
                </p>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Saat</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  {latestAppointment.hour}
                </p>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg col-span-2">
                <p className="text-xs text-gray-500 mb-1">Konum</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  Poliklinik A, 2. Kat, Oda 102
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-3 items-start">
              <span className="text-xl">⚠️</span>
              <p className="text-xs text-yellow-800 leading-relaxed">
                Randevu saatinizden en az <strong>15 dakika önce</strong> kayıt
                bankosunda olmanız gerekmektedir. Kimliğinizi yanınızda
                bulundurmayı unutmayınız.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setShowDetailModal(false)}
                className="w-full sm:w-auto"
              >
                Kapat
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
