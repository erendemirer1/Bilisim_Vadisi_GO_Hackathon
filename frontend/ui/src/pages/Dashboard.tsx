import React, { useState } from "react";
import { Button, Input, Modal } from "../components/ui";
import { cn } from "../components/utils";

// --- TİP TANIMLAMALARI (Normalde ayrı dosyada olur) ---
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image: string;
  availableSlots: string[]; // Örn: ["09:00", "09:30"]
}

// --- MOCK DATA (Örnek Veri) ---
const DOCTORS: Doctor[] = [
  {
    id: 1,
    name: "Dr. Ayşe Yılmaz",
    specialty: "Kardiyoloji",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
    availableSlots: ["09:00", "09:30", "11:00", "14:00", "14:30"],
  },
  {
    id: 2,
    name: "Dr. Mehmet Öz",
    specialty: "Nöroloji",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop",
    availableSlots: ["10:00", "10:30", "15:00"],
  },
  {
    id: 3,
    name: "Dr. Elif Demir",
    specialty: "Dahiliye",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop",
    availableSlots: ["09:15", "11:45", "13:15", "16:00"],
  },
];

const SPECIALTIES = ["Tümü", "Kardiyoloji", "Nöroloji", "Dahiliye", "Ortopedi"];

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tümü");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "Tümü" || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = () => {
    if (!selectedSlot || !selectedDoctor) return;

    alert(
      `${selectedDoctor.name} için ${selectedSlot} saatine randevunuz oluşturuldu!`
    );

    setSelectedDoctor(null);
    setSelectedSlot(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 6v12m-6-6h12" />
              </svg>
            </div>
            <span className="font-bold text-gray-800 text-lg">42 Randevu</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Hoşgeldin, <b>Ahmet Y.</b>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doktor Bul</h1>
            <p className="text-gray-500">
              Uzman doktorlarımızdan size en uygun olanı seçin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="w-full sm:w-64">
              <Input
                placeholder="Doktor adı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {doctor.specialty}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-gray-500">Müsaitlik: Bugün</p>
                </div>

                <Button
                  className="w-full mt-auto"
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  Randevu Al
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Aradığınız kriterlere uygun doktor bulunamadı.
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("Tümü");
              }}
              className="mt-2 text-blue-600"
            >
              Filtreleri Temizle
            </Button>
          </div>
        )}
      </main>

      <Modal
        isOpen={!!selectedDoctor}
        onClose={() => {
          setSelectedDoctor(null);
          setSelectedSlot(null);
        }}
        title="Randevu Oluştur"
        size="lg"
      >
        {selectedDoctor && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
              <img
                src={selectedDoctor.image}
                className="w-24 h-24 rounded-full object-cover mb-3 border-4 border-white shadow-sm"
                alt=""
              />
              <h4 className="font-bold text-gray-900">{selectedDoctor.name}</h4>
              <p className="text-sm text-gray-500 mb-4">
                {selectedDoctor.specialty}
              </p>
              <div className="text-xs text-gray-400 text-left w-full space-y-2">
                <p>📍 Poliklinik A, Oda 102</p>
                <p>📞 Dahili: 1234</p>
              </div>
            </div>

            <div className="md:w-2/3">
              <h5 className="font-medium text-gray-900 mb-3">
                Müsait Saatler (Bugün)
              </h5>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                {selectedDoctor.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "py-2 px-3 rounded border text-sm font-medium transition-all",
                      selectedSlot === slot
                        ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded text-xs text-yellow-800 mb-6">
                ⚠️ Randevu saatinden 15 dakika önce hastanede olmanız
                gerekmektedir.
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSelectedDoctor(null)}>
                  Vazgeç
                </Button>
                <Button
                  disabled={!selectedSlot}
                  onClick={handleBookAppointment}
                >
                  {selectedSlot
                    ? `${selectedSlot} İçin Onayla`
                    : "Saat Seçiniz"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
