import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { authRequest } from "../hooks/authRequest"; // veya adminRequest
import { useSnackbar } from "../context/SnackbarContext";
import { Button, Modal, Loader } from "../components/ui";

// --- TİP TANIMLAMALARI ---
interface Appointment {
  id: number;
  doctor_name: string;
  doctor_expertise: string;
  date: string;
  hour: string | number;
  status?: string;
  location?: string;
}

interface AppointmentData {
  status: string;
  message: string;
  data: Appointment[];
}

const Appointments = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const {
    data: appointmentData,
    loading,
    error,
    refetch,
  } = useFetch<AppointmentData>("/appointment");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    setIsCanceling(true);
    try {
      await authRequest(`/appointment/${selectedAppointment.id}`, {
        method: "DELETE",
      });

      showSnackbar("Randevu başarıyla iptal edildi.", "success");
      setIsDeleteModalOpen(false);
      refetch();
    } catch (err: any) {
      showSnackbar(err.message || "İptal işlemi başarısız.", "error");
    } finally {
      setIsCanceling(false);
    }
  };

  const openDetail = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setIsDetailModalOpen(true);
  };

  const openDelete = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setIsDeleteModalOpen(true);
  };

  if (loading) return <Loader message="Randevularınız yükleniyor..." />;
  if (error)
    return <div className="text-center mt-10 text-red-500">Hata: {error}</div>;

  const appointments = appointmentData?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/home")}
          className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span className="ml-1">Geri</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Randevularım</h1>
          <p className="text-sm text-gray-500">
            Planlanmış doktor görüşmeleriniz
          </p>
        </div>
      </div>

      {appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col relative overflow-hidden group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>

              <div className="flex items-start gap-3 mb-4 pl-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                  {appt.doctor_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {appt.doctor_name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {appt.doctor_expertise}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4 grid grid-cols-2 gap-2 text-sm ml-2">
                <div>
                  <span className="block text-xs text-gray-400">Tarih</span>
                  <span className="font-semibold text-gray-700">
                    {appt.date}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Saat</span>
                  <span className="font-semibold text-gray-700">
                    {appt.hour}:00
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pl-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openDetail(appt)}
                >
                  Detay
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white"
                  onClick={() => openDelete(appt)}
                >
                  İptal Et
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
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
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Randevu Bulunamadı
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Henüz planlanmış bir randevunuz yok.
          </p>
          <Button
            onClick={() => navigate("/doctor-search")}
            className="bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          >
            + Yeni Randevu Al
          </Button>
        </div>
      )}

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Randevu Detayı"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-16 h-16 bg-white border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                {selectedAppointment.doctor_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">
                  {selectedAppointment.doctor_name}
                </h4>
                <p className="text-blue-600 font-medium">
                  {selectedAppointment.doctor_expertise}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Tarih</p>
                <p className="font-semibold text-gray-900">
                  {selectedAppointment.date}
                </p>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Saat</p>
                <p className="font-semibold text-gray-900">
                  {selectedAppointment.hour}:00
                </p>
              </div>
              <div className="p-3 border border-gray-100 rounded-lg col-span-2">
                <p className="text-xs text-gray-500 mb-1">Konum</p>
                <p className="font-semibold text-gray-900">
                  Poliklinik A, Oda 102
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-3 items-start">
              <span className="text-xl">⚠️</span>
              <p className="text-xs text-yellow-800 leading-relaxed">
                Lütfen randevu saatinizden 15 dakika önce hastanede bulununuz.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setIsDetailModalOpen(false)}>Tamam</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
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
            <strong>{selectedAppointment?.doctor_name}</strong> ile olan
            randevunuz iptal edilecektir. Bu işlem geri alınamaz.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isCanceling}
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelAppointment}
              isLoading={isCanceling}
            >
              Evet, İptal Et
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
