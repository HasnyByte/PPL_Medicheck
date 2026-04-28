import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Star,
  Calendar,
  Clock,
  User,
  MapPin,
} from "lucide-react";
import type {
  ScreeningResult,
  User as UserType,
  BookingData,
} from "../app/App";
import { ImageWithFallback } from "@/components/ImageWithFallback";

interface BookingFlowProps {
  result: ScreeningResult;
  user: UserType;
  onSuccess: (booking: BookingData) => void;
  onBack: () => void;
}

const HOSPITAL_ADDRESSES: Record<string, string> = {
  "RS Medika Utama": "Jl. Gatot Subroto No. 123, Jakarta Selatan",
  "Klinik Sentosa": "Jl. Sudirman Kav. 45, Jakarta Pusat",
  "RS Harapan Sehat": "Jl. Thamrin No. 88, Jakarta Pusat",
  "RS Neurologi Jakarta": "Jl. Rasuna Said Kav. 10, Jakarta Selatan",
  "RS Digestive Center": "Jl. HR Rasuna Said No. 234, Jakarta Selatan",
};

const DOCTORS_BY_SPEC: Record<
  string,
  {
    name: string;
    title: string;
    img: string;
    rating: number;
    exp: string;
    hospital: string;
  }[]
> = {
  umum: [
    {
      name: "Dr. Sari Dewi",
      title: "Sp.PD — Dokter Umum",
      img: "https://images.unsplash.com/photo-1673865641073-4479f93a7776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      rating: 4.9,
      exp: "12 tahun",
      hospital: "RS Medika Utama",
    },
    {
      name: "Dr. Ahmad Rizal",
      title: "Sp.PD — Penyakit Dalam",
      img: "https://images.unsplash.com/photo-1758691463393-a2aa9900af8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      rating: 4.8,
      exp: "9 tahun",
      hospital: "Klinik Sentosa",
    },
  ],
  paru: [
    {
      name: "Dr. Citra Putri",
      title: "Sp.P — Spesialis Paru",
      img: "https://images.unsplash.com/photo-1686737357932-ae1c50492a9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      rating: 4.9,
      exp: "14 tahun",
      hospital: "RS Harapan Sehat",
    },
    {
      name: "Dr. Ahmad Rizal",
      title: "Sp.PD — Penyakit Dalam",
      img: "https://images.unsplash.com/photo-1758691463393-a2aa9900af8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      rating: 4.8,
      exp: "9 tahun",
      hospital: "Klinik Sentosa",
    },
  ],
  saraf: [
    {
      name: "Dr. Budi Santoso",
      title: "Sp.S — Spesialis Saraf",
      img: "https://images.unsplash.com/photo-1645066928295-2506defde470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      rating: 4.7,
      exp: "10 tahun",
      hospital: "RS Neurologi Jakarta",
    },
    {
      name: "Dr. Sari Dewi",
      title: "Sp.PD — Dokter Umum",
      img: "https://images.unsplash.com/photo-1673865641073-4479f93a7776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      rating: 4.9,
      exp: "12 tahun",
      hospital: "RS Medika Utama",
    },
  ],
  gastro: [
    {
      name: "Dr. Maya Indira",
      title: "Sp.PD-KGEH — Gastroenterologi",
      img: "https://images.unsplash.com/photo-1659354206036-3d2699c31e0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      rating: 4.8,
      exp: "11 tahun",
      hospital: "RS Digestive Center",
    },
    {
      name: "Dr. Ahmad Rizal",
      title: "Sp.PD — Penyakit Dalam",
      img: "https://images.unsplash.com/photo-1758691463393-a2aa9900af8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      rating: 4.8,
      exp: "9 tahun",
      hospital: "Klinik Sentosa",
    },
  ],
};

const TIME_SLOTS = {
  "Pagi (08:00 – 12:00)": ["08:00", "09:00", "10:00", "11:00"],
  "Siang (13:00 – 17:00)": ["13:00", "14:00", "15:00", "16:00"],
  "Malam (17:00 – 20:00)": ["17:00", "18:00", "19:00"],
};

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function getNextDays(n: number) {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function StepIndicator({ step }: { step: number }) {
  const steps = ["Hasil", "Dokter", "Jadwal", "Konfirmasi"];
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
      {steps.map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            flex: i < steps.length - 1 ? 1 : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background:
                  i < step ? "#2a6e5e" : i === step ? "#2a6e5e" : "#e8f5f1",
                border: `2px solid ${i <= step ? "#2a6e5e" : "#c8dfd8"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              {i < step ? (
                <Check size={15} color="white" />
              ) : (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: i === step ? "white" : "#b0cec7",
                  }}
                >
                  {i + 1}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: i === step ? 600 : 400,
                color: i <= step ? "#2a6e5e" : "#b0cec7",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                margin: "-14px 8px 0",
                background: i < step ? "#2a6e5e" : "#e8f5f1",
                transition: "background 0.3s ease",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function BookingFlow({
  result,
  user,
  onSuccess,
  onBack,
}: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const doctors =
    DOCTORS_BY_SPEC[result.specialistCode] || DOCTORS_BY_SPEC.umum;
  const nextDays = getNextDays(7);

  const doctor = selectedDoctor !== null ? doctors[selectedDoctor] : null;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);

    if (doctor && selectedDate && selectedTime) {
      onSuccess({
        id: "BK-" + Date.now(),
        doctor: {
          name: doctor.name,
          title: doctor.title,
          hospital: doctor.hospital,
          hospitalAddress:
            HOSPITAL_ADDRESSES[doctor.hospital] || "Alamat tidak tersedia",
        },
        date: selectedDate,
        time: selectedTime,
        disease: result.disease,
        status: "Menunggu",
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "#f8fcfa",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Back */}
        <button
          onClick={step === 1 ? onBack : () => setStep((s) => s - 1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#5a7870",
            fontSize: 13,
            marginBottom: 28,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <ArrowLeft size={14} /> {step === 1 ? "Kembali ke Hasil" : "Kembali"}
        </button>

        <StepIndicator step={step} />

        {/* ─── STEP 1: Result Summary ─── */}
        {step === 1 && (
          <div
            style={{
              background: "white",
              borderRadius: 24,
              padding: 32,
              border: "1px solid #e8f5f1",
            }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 30,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 20,
              }}
            >
              Ringkasan Hasil Analisis
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 24,
              }}
            >
              {[
                { label: "Diagnosis Awal", value: result.disease },
                { label: "Confidence Score", value: `${result.confidence}%` },
                { label: "Dokter yang Disarankan", value: result.specialist },
                {
                  label: "Waktu Pemeriksaan",
                  value: new Intl.DateTimeFormat("id-ID", {
                    dateStyle: "medium",
                  }).format(result.timestamp),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "#f8fcfa",
                    borderRadius: 14,
                    padding: "16px 18px",
                    border: "1px solid #e8f5f1",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#7a9e96",
                      fontWeight: 500,
                      marginBottom: 5,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0f2420",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#5a7870",
                fontSize: 13,
                marginBottom: 28,
                padding: "12px 16px",
                background: "#f0f9f6",
                borderRadius: 12,
              }}
            >
              <User size={14} color="#2a6e5e" />
              <span>
                Booking atas nama:{" "}
                <strong style={{ color: "#0f2420" }}>{user.name}</strong>
              </span>
            </div>
            <button
              onClick={() => setStep(2)}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 13,
                background: "#2a6e5e",
                border: "none",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 16px rgba(42,110,94,0.25)",
              }}
            >
              Pilih Dokter <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ─── STEP 2: Select Doctor ─── */}
        {step === 2 && (
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 30,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 6,
              }}
            >
              Pilih Dokter
            </h2>
            <p style={{ fontSize: 14, color: "#5a7870", marginBottom: 24 }}>
              Dokter spesialis yang sesuai dengan hasil analisis Anda.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 24,
              }}
            >
              {doctors.map((doc, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedDoctor(i)}
                  style={{
                    background: "white",
                    borderRadius: 18,
                    padding: "20px 24px",
                    border: `2px solid ${selectedDoctor === i ? "#2a6e5e" : "#e8f5f1"}`,
                    cursor: "pointer",
                    display: "flex",
                    gap: 18,
                    alignItems: "center",
                    boxShadow:
                      selectedDoctor === i
                        ? "0 8px 24px rgba(42,110,94,0.12)"
                        : "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <ImageWithFallback
                      src={doc.img}
                      alt={doc.name}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 16,
                        objectFit: "cover",
                        objectPosition: "top",
                        display: "block",
                      }}
                    />
                    {selectedDoctor === i && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: -4,
                          right: -4,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "#2a6e5e",
                          border: "2px solid white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={11} color="white" />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#0f2420",
                        marginBottom: 3,
                      }}
                    >
                      {doc.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#2a6e5e",
                        fontWeight: 500,
                        marginBottom: 8,
                      }}
                    >
                      {doc.title}
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: 12, color: "#5a7870" }}>
                          {doc.rating}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: "#7a9e96" }}>
                        {doc.exp} pengalaman
                      </span>
                      <span style={{ fontSize: 12, color: "#7a9e96" }}>
                        {doc.hospital}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: `2px solid ${selectedDoctor === i ? "#2a6e5e" : "#c8dfd8"}`,
                      background: selectedDoctor === i ? "#2a6e5e" : "white",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (selectedDoctor !== null) setStep(3);
              }}
              disabled={selectedDoctor === null}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 13,
                background: selectedDoctor !== null ? "#2a6e5e" : "#c8dfd8",
                border: "none",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: selectedDoctor !== null ? "pointer" : "not-allowed",
                fontFamily: "'Outfit', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow:
                  selectedDoctor !== null
                    ? "0 4px 16px rgba(42,110,94,0.25)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              Pilih Jadwal <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ─── STEP 3: Date & Time ─── */}
        {step === 3 && (
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 30,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 6,
              }}
            >
              Pilih Jadwal
            </h2>
            <p style={{ fontSize: 14, color: "#5a7870", marginBottom: 24 }}>
              Pilih tanggal dan slot waktu yang tersedia untuk {doctor?.name}.
            </p>

            {/* Date picker */}
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: "24px",
                border: "1px solid #e8f5f1",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Calendar size={16} color="#2a6e5e" />
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "#0f2420" }}
                >
                  Pilih Tanggal
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {nextDays.map((d, i) => {
                  const isSelected =
                    selectedDate?.toDateString() === d.toDateString();
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(d)}
                      style={{
                        flexShrink: 0,
                        width: 58,
                        textAlign: "center",
                        padding: "10px 0",
                        borderRadius: 14,
                        background: isSelected ? "#2a6e5e" : "#f8fcfa",
                        border: `1.5px solid ${isSelected ? "#2a6e5e" : "#e8f5f1"}`,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: isSelected
                            ? "rgba(255,255,255,0.7)"
                            : "#7a9e96",
                          marginBottom: 3,
                        }}
                      >
                        {DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: isSelected ? "white" : "#0f2420",
                          fontFamily: "'Cormorant Garamond', serif",
                        }}
                      >
                        {d.getDate()}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: isSelected
                            ? "rgba(255,255,255,0.7)"
                            : "#7a9e96",
                        }}
                      >
                        {MONTHS[d.getMonth()]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: "24px",
                border: "1px solid #e8f5f1",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Clock size={16} color="#2a6e5e" />
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "#0f2420" }}
                >
                  Pilih Waktu
                </span>
              </div>
              {Object.entries(TIME_SLOTS).map(([period, times]) => (
                <div key={period} style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#7a9e96",
                      fontWeight: 500,
                      marginBottom: 10,
                    }}
                  >
                    {period}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {times.map((t) => {
                      const isSelected = selectedTime === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 100,
                            border: `1.5px solid ${isSelected ? "#2a6e5e" : "#e8f5f1"}`,
                            background: isSelected ? "#2a6e5e" : "white",
                            color: isSelected ? "white" : "#3d6058",
                            fontSize: 13,
                            fontWeight: isSelected ? 600 : 400,
                            cursor: "pointer",
                            fontFamily: "'Outfit', sans-serif",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (selectedDate && selectedTime) setStep(4);
              }}
              disabled={!selectedDate || !selectedTime}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 13,
                background:
                  selectedDate && selectedTime ? "#2a6e5e" : "#c8dfd8",
                border: "none",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor:
                  selectedDate && selectedTime ? "pointer" : "not-allowed",
                fontFamily: "'Outfit', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow:
                  selectedDate && selectedTime
                    ? "0 4px 16px rgba(42,110,94,0.25)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              Lanjut ke Konfirmasi <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ─── STEP 4: Confirmation ─── */}
        {step === 4 && doctor && selectedDate && selectedTime && (
          <div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 30,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 6,
              }}
            >
              Konfirmasi Janji Temu
            </h2>
            <p style={{ fontSize: 14, color: "#5a7870", marginBottom: 24 }}>
              Periksa kembali detail booking Anda sebelum mengkonfirmasi.
            </p>

            {/* Summary card */}
            <div
              style={{
                background: "white",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid #e8f5f1",
                marginBottom: 20,
              }}
            >
              {/* Doctor info */}
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid #f0f9f6",
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <ImageWithFallback
                  src={doctor.img}
                  alt={doctor.name}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    objectFit: "cover",
                    objectPosition: "top",
                    display: "block",
                  }}
                />
                <div>
                  <div
                    style={{ fontSize: 16, fontWeight: 600, color: "#0f2420" }}
                  >
                    {doctor.name}
                  </div>
                  <div style={{ fontSize: 13, color: "#2a6e5e" }}>
                    {doctor.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#7a9e96" }}>
                    {doctor.hospital}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: "20px 24px" }}>
                {[
                  { label: "Pasien", value: user.name },
                  {
                    label: "Tanggal",
                    value: new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "full",
                    }).format(selectedDate),
                  },
                  { label: "Waktu", value: selectedTime + " WIB" },
                  { label: "Tujuan", value: result.disease },
                  { label: "Status", value: "Menunggu Konfirmasi Dokter" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "10px 0",
                      borderBottom: "1px solid #f8fcfa",
                    }}
                  >
                    <span
                      style={{ fontSize: 13, color: "#7a9e96", flexShrink: 0 }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#0f2420",
                        textAlign: "right",
                        maxWidth: "60%",
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div
              style={{
                background: "#e8f5f1",
                borderRadius: 14,
                padding: "14px 18px",
                fontSize: 13,
                color: "#3d6058",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Konfirmasi dari dokter akan dikirimkan melalui email dalam 30
              menit. Harap tiba 10 menit sebelum jadwal.
            </div>

            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 13,
                background: loading ? "#7a9e96" : "#2a6e5e",
                border: "none",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "'Outfit', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: loading ? "none" : "0 4px 16px rgba(42,110,94,0.3)",
                transition: "all 0.2s ease",
              }}
            >
              {loading ? (
                "Memproses Booking..."
              ) : (
                <>
                  <Check size={15} /> Konfirmasi Janji Temu
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
