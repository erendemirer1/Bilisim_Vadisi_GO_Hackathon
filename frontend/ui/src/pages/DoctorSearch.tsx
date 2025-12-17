import { useState, useMemo, useEffect } from "react";
import { Button, Input, Modal, Loader } from "../components/ui";
import { useFetch } from "../hooks/useFetch";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authRequest } from "../hooks/authRequest";
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

interface Appointment {
  id: number;
  date: string;
  hour: number;
  status: string;
}

const TIME_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

const getNextDays = () => {
  const days = [];
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
  };
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      days.push({
        label: d.toLocaleDateString("tr-TR", options),
        value: d.toISOString().split("T")[0],
      });
    }
  }
  return days;
};

const DoctorSearch = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [searchParams] = useSearchParams();

  const initialDept = searchParams.get("dept") || "Tümü";

  const {
    data: doctors,
    loading,
    error,
  } = useFetch<DoctorsData>("/admin/doctor");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialDept);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    getNextDays()[0]?.value || ""
  );
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const [isBooking, setIsBooking] = useState(false);

  const [existingAppointments, setExistingAppointments] = useState<
    Appointment[]
  >([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const specialties = useMemo(() => {
    if (!doctors) return ["Tümü"];
    const unique = Array.from(new Set(doctors.data.map((d) => d.expertise)));
    return ["Tümü", ...unique];
  }, [doctors]);

  const filteredDoctors =
    doctors?.data?.filter((doc) => {
      const fullName = `${doc.fullname}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesSpecialty =
        selectedSpecialty === "Tümü" || doc.expertise === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    }) || [];

  const HandleDoctorAppointments = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDoctor) return;

      setLoadingSlots(true);
      try {
        const response = await authRequest(`/doctor/${selectedDoctor.id}`, {
          method: "GET",
        });

        setExistingAppointments(response.data || []);
      } catch (err) {
        console.error("Randevular çekilemedi:", err);
        setExistingAppointments([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAppointments();
  }, [selectedDoctor]);

  const isSlotTaken = (slot: number) => {
    return existingAppointments.some(
      (appt) => appt.date === selectedDate && appt.hour === slot
    );
  };

  const handleCreateAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;

    setIsBooking(true);
    try {
      await authRequest("/appointment", {
        method: "POST",
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          date: selectedDate,
          hour: selectedSlot,
        }),
      });

      showSnackbar("Randevunuz başarıyla oluşturuldu!", "success");
      setSelectedDoctor(null);
      navigate("/home");
    } catch (err: any) {
      showSnackbar("Randevu oluşturulamadı: " + err.message, "error");
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <Loader message="Doktorlar listeleniyor..." />;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  const nextDays = getNextDays();

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
          <h1 className="text-2xl font-bold text-gray-900">Doktor Randevusu</h1>
          <p className="text-sm text-gray-500">
            Uzmanlarımızdan size uygun olanı seçin
          </p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Bölümler</h2>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`text-sm px-4 py-2 rounded-lg text-left whitespace-nowrap transition-colors ${
                    selectedSpecialty === spec
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6">
            <Input
              placeholder="Doktor adı ile arama yapın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col p-5 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
                      {doctor.fullname.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {doctor.fullname}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {doctor.expertise}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  <Button
                    className="w-full"
                    onClick={() => HandleDoctorAppointments(doctor)}
                  >
                    Randevu Al
                  </Button>
                </div>
              </div>
            ))}

            {filteredDoctors.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                Doktor bulunamadı.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedDoctor}
        onClose={() => {
          setSelectedDoctor(null);
          setSelectedSlot(null);
          setExistingAppointments([]);
        }}
        title="Randevu Oluştur"
        size="lg"
      >
        {selectedDoctor && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold">
                {selectedDoctor.fullname.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">
                  {selectedDoctor.fullname}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedDoctor.expertise}
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-3 text-sm">
                Tarih Seçin
              </h5>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {nextDays.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => {
                      setSelectedDate(day.value);
                      setSelectedSlot(null);
                    }}
                    className={`flex-1 min-w-20 py-2 px-1 rounded-lg border text-center transition-all ${
                      selectedDate === day.value
                        ? "border-blue-600 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-600"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs block mb-1 opacity-70">
                      {day.value.split("-")[2]}
                    </span>
                    <span className="text-xs font-bold block uppercase">
                      {day.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-3 text-sm">
                Saat Seçin ({selectedDate})
              </h5>

              {loadingSlots ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Saatler kontrol ediliyor...
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {TIME_SLOTS.map((slot) => {
                    const isTaken = isSlotTaken(slot);
                    return (
                      <button
                        key={slot}
                        disabled={isTaken}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-1 rounded border text-sm font-medium transition-all ${
                          isTaken
                            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed box-decoration-slice"
                            : selectedSlot === slot
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {slot}:00
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
              <Button variant="ghost" onClick={() => setSelectedDoctor(null)}>
                Vazgeç
              </Button>
              <Button
                disabled={!selectedSlot}
                onClick={handleCreateAppointment}
                isLoading={isBooking}
                className="w-32"
              >
                Onayla
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorSearch;
