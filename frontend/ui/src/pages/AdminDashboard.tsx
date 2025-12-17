import React, { useState } from "react";
import { Button, Input, Modal, Loader } from "../components/ui";
import { useAdminFetch } from "../hooks/useAdminFetch";
import { useNavigate } from "react-router-dom";
import { adminRequest } from "../hooks/adminRequest";
import { useSnackbar } from "../context/SnackbarContext";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const {
    data: doctors,
    loading,
    error,
    refetch,
  } = useAdminFetch<DoctorsData>("/admin/doctor");

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [newDoctor, setNewDoctor] = useState({
    fullname: "",
    expertise: "",
  });

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await adminRequest(`/admin/doctor`, {
        method: "POST",
        body: JSON.stringify(newDoctor),
      });

      setIsAddModalOpen(false);
      setNewDoctor({
        fullname: "",
        expertise: "",
      });
      refetch();
    } catch (err) {
      showSnackbar("Hata oluştu: " + err, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDoctor = async () => {
    if (!selectedDoctorId) return;
    setFormLoading(true);

    try {
      await adminRequest(`/admin/doctor`, {
        method: "DELETE",
        body: JSON.stringify({ id: selectedDoctorId }),
      });

      setIsDeleteModalOpen(false);

      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen Hata";
      showSnackbar("Hata: " + msg, "error");
    } finally {
      setFormLoading(false);
      setSelectedDoctorId(null);
    }
  };

  const filteredDoctors =
    doctors?.data?.filter(
      (doc) =>
        doc.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.expertise.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (loading) return <Loader message="Admin paneli hazırlanıyor..." />;
  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Hata: {error}. Lütfen sayfayı yenileyin veya tekrar giriş yapın.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-wide">
              Yönetim Paneli
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 hidden sm:block">
              Admin Kullanıcısı
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
              className="bg-slate-700 hover:bg-red-600 border-0"
            >
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Doktor Yönetimi
            </h1>
            <p className="text-gray-500 text-sm">
              Sistemdeki doktorları görüntüleyin, ekleyin veya silin.
            </p>
          </div>

          <div className="flex w-full md:w-auto gap-3">
            <div className="w-full md:w-64">
              <Input
                placeholder="İsim veya Branş ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 whitespace-nowrap"
            >
              + Yeni Doktor
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                  <th className="px-6 py-4">Doktor Bilgisi</th>
                  <th className="px-6 py-4">Branş</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {doctor.fullname.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {doctor.fullname}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium border border-indigo-100">
                          {doctor.expertise}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedDoctorId(doctor.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2"
                          title="Sil"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Kriterlere uygun doktor bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Yeni Doktor Ekle"
      >
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <Input
            label="İsim Soyisim"
            placeholder="Örn: Dr. Batuhan Kaş"
            value={newDoctor.fullname}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, fullname: e.target.value })
            }
            required
          />
          <Input
            label="Branş / Uzmanlık"
            placeholder="Örn: Kardiyoloji"
            value={newDoctor.expertise}
            onChange={(e) =>
              setNewDoctor({ ...newDoctor, expertise: e.target.value })
            }
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              İptal
            </Button>
            <Button type="submit" isLoading={formLoading}>
              Kaydet
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Doktoru Sil"
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Emin misiniz?</h3>
          <p className="text-gray-500 text-sm mb-6">
            Bu doktoru sildiğinizde, doktora ait tüm randevu kayıtları da
            etkilenebilir. Bu işlem geri alınamaz.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteDoctor}
              isLoading={formLoading}
            >
              Evet, Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
