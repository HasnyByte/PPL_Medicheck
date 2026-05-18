"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Check, Star, Calendar, Clock, User, MapPin, Stethoscope,
} from "lucide-react";
import type { ScreeningResult, User as UserType, BookingData } from "../app/App";
import { bookings as bookingsApi, doctors as doctorsApi, type DoctorPublic } from "@/lib/api";

interface BookingFlowProps {
  // Updated props
  result?: ScreeningResult | null;
  user?: UserType | null;
  onSuccess: (booking: BookingData) => void;
  onBack: () => void;
}

const TIME_SLOTS = {
  pagi: ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30"],
  siang: ["11:00", "11:30", "13:00", "13:30", "14:00", "14:30"],
  sore: ["15:00", "15:30", "16:00", "16:30", "17:00"],
};

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function getNextDays(n: number): Date[] {
  const dates: Date[] = [];
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
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: i <= step ? "#2a6e5e" : "#e8f5f1", border: `2px solid ${i <= step ? "#2a6e5e" : "#c8dfd8"}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
              {i < step ? <Check size={15} color="white" /> : <span style={{ fontSize: 13, fontWeight: 600, color: i === step ? "white" : "#b0cec7" }}>{i + 1}</span>}
            </div>
            <span style={{ fontSize: 11, fontWeight: i === step ? 600 : 400, color: i <= step ? "#2a6e5e" : "#b0cec7", whiteSpace: "nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, margin: "-14px 8px 0", background: i < step ? "#2a6e5e" : "#e8f5f1", transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function DoctorInitials({ name }: { name: string }) {
  const initials = name.split(" ").filter((w) => !w.toLowerCase().startsWith("dr")).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "DR";
  return (
    <div style={{ width: 72, height: 72, borderRadius: 16, background: "linear-gradient(135deg, #2a6e5e, #5ecfb1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "white", fontFamily: "'Cormorant Garamond', serif", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export function BookingFlow({ result, user, onSuccess, onBack }: BookingFlowProps) {
  if (!result) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 16, color: "#7a9e96" }}>Lakukan pemeriksaan terlebih dahulu untuk rekomendasi dokter terbaik.</div>
          <button onClick={onBack} style={{ background: "#2a6e5e", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontFamily: "Outfit,sans-serif" }}>Kembali</button>
        </div>
      </div>
    );
  }
  const [step, setStep] = useState(1);
  const [allDoctors, setAllDoctors] = useState<DoctorPublic[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState("");

  const nextDays = getNextDays(14);

  // Load doctors filtered by specialist from screening result
  useEffect(() => {
    setLoadingDoctors(true);
    // First try to find doctors with matching specialist code
    doctorsApi.list({ specialistCode: result.specialistCode })
      .then((docs) => {
        if (docs.length > 0) {
          setAllDoctors(docs);
        } else {
          // Fallback: load all doctors
          return doctorsApi.list().then((all) => setAllDoctors(all));
        }
      })
      .catch(() => setAllDoctors([]))
      .finally(() => setLoadingDoctors(false));
  }, [result?.specialistCode]);

  const selectedDoctor = allDoctors.find((d) => d.id === selectedDoctorId) || null;

  // Filter available time slots based on doctor's schedule
  const isDayAvailable = (date: Date): boolean => {
    if (!selectedDoctor || !selectedDoctor.schedules || selectedDoctor.schedules.length === 0) return true;
    const dayOfWeek = date.getDay();
    return selectedDoctor.schedules.some((s) => s.dayOfWeek === dayOfWeek && s.isActive);
  };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    setLoading(true);
    setError("");
    try {
      const booking = await bookingsApi.create({
        doctorId: selectedDoctor.id,
        date: selectedDate.toISOString(),
        time: selectedTime,
        disease: result.disease,
        notes: `Hasil screening: ${result.confidence}% confidence. Spesialis yang direkomendasikan: ${result.specialist}`,
      });
      onSuccess({
        id: booking.id,
        doctor: {
          id: selectedDoctor.id,
          name: selectedDoctor.name,
          specialist: selectedDoctor.specialist,
          hospital: selectedDoctor.hospital,
          hospitalAddress: selectedDoctor.hospitalAddress,
        },
        date: selectedDate,
        time: selectedTime,
        disease: result.disease,
        status: "Menunggu",
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal membuat booking, coba lagi");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f8fcfa", padding: "40px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button onClick={step === 1 ? onBack : () => setStep((s) => s - 1)}
          style={{ display: "flex", alignItems: "center", gap: 8, border: "none", background: "none", cursor: "pointer", color: "#5a7870", fontSize: 13, marginBottom: 28, fontFamily: "'Outfit', sans-serif" }}>
          <ArrowLeft size={14} /> {step === 1 ? "Kembali ke Hasil" : "Kembali"}
        </button>

        <StepIndicator step={step} />

        {/* ─── STEP 1: Result Summary ─── */}
        {step === 1 && (
          <div style={{ background: "white", borderRadius: 24, padding: 32, border: "1px solid #e8f5f1" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#0f2420", marginBottom: 20 }}>
              Ringkasan Hasil Analisis
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Diagnosis Awal", value: result.disease },
                { label: "Confidence Score", value: `${result.confidence}%` },
                { label: "Spesialis yang Disarankan", value: result.specialist },
                { label: "Waktu Pemeriksaan", value: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(result.timestamp) },
              ].map((item) => (
                <div key={item.label} style={{ background: "#f8fcfa", borderRadius: 14, padding: "16px 18px", border: "1px solid #e8f5f1" }}>
                  <div style={{ fontSize: 11, color: "#7a9e96", fontWeight: 500, marginBottom: 5 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#0f2420" }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Specialist match info */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#e8f5f1", borderRadius: 12, marginBottom: 20, fontSize: 13, color: "#3d6058" }}>
              <Stethoscope size={14} color="#2a6e5e" />
              <span>Sistem akan mencarikan dokter <strong>{result.specialist}</strong> yang terdaftar di MediCheck.</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#5a7870", fontSize: 13, marginBottom: 28, padding: "12px 16px", background: "#f0f9f6", borderRadius: 12 }}>
              <User size={14} color="#2a6e5e" />
              <span>Booking atas nama: <strong style={{ color: "#0f2420" }}>{user?.name}</strong></span>
            </div>
            <button onClick={() => setStep(2)}
              style={{ width: "100%", padding: "14px 0", borderRadius: 13, background: "#2a6e5e", border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(42,110,94,0.25)" }}>
              Pilih Dokter <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ─── STEP 2: Select Doctor ─── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#0f2420", marginBottom: 6 }}>
              Pilih Dokter
            </h2>
            <p style={{ fontSize: 14, color: "#5a7870", marginBottom: 24 }}>
              {result.specialist} yang tersedia di MediCheck.
            </p>

            {loadingDoctors ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#7a9e96" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e8f5f1", borderTopColor: "#2a6e5e", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13 }}>Mencari dokter yang sesuai...</p>
              </div>
            ) : allDoctors.length === 0 ? (
              <div style={{ background: "white", borderRadius: 18, padding: 32, border: "1px solid #e8f5f1", textAlign: "center" }}>
                <Stethoscope size={40} color="#c8dfd8" style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 15, fontWeight: 600, color: "#0f2420", marginBottom: 6 }}>Belum ada dokter {result.specialist} terdaftar</p>
                <p style={{ fontSize: 13, color: "#7a9e96" }}>Saat ini belum ada dokter spesialis ini. Anda tetap bisa melihat dokter umum.</p>
                <button onClick={() => doctorsApi.list().then(setAllDoctors)}
                  style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, border: "1.5px solid #2a6e5e", background: "white", color: "#2a6e5e", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                  Lihat Semua Dokter
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                {allDoctors.map((doc) => (
                  <div key={doc.id} onClick={() => setSelectedDoctorId(doc.id)}
                    style={{ background: "white", borderRadius: 18, padding: "20px 24px", border: `2px solid ${selectedDoctorId === doc.id ? "#2a6e5e" : "#e8f5f1"}`, cursor: "pointer", display: "flex", gap: 18, alignItems: "center", boxShadow: selectedDoctorId === doc.id ? "0 8px 24px rgba(42,110,94,0.12)" : "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.2s" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      {doc.photoUrl ? (
                        <img src={doc.photoUrl} alt={doc.name} style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover" }} />
                      ) : (
                        <DoctorInitials name={doc.name} />
                      )}
                      {selectedDoctorId === doc.id && (
                        <div style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: "#2a6e5e", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={11} color="white" />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f2420", marginBottom: 3 }}>{doc.name}</div>
                      <div style={{ fontSize: 13, color: "#5a7870", marginBottom: 4 }}>{doc.specialist || "Dokter Umum"}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                        {doc.experience && (
                          <span style={{ fontSize: 11, padding: "2px 8px", background: "#e8f5f1", borderRadius: 20, color: "#2a6e5e", fontWeight: 500 }}>
                            {doc.experience} thn pengalaman
                          </span>
                        )}
                        {doc.education && (
                          <span style={{ fontSize: 11, padding: "2px 8px", background: "#f0f9f6", borderRadius: 20, color: "#5a7870" }}>
                            {doc.education}
                          </span>
                        )}
                      </div>
                      {doc.hospital && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#7a9e96" }}>
                          <MapPin size={11} />
                          {doc.hospital}
                          {doc.hospitalAddress && ` · ${doc.hospitalAddress}`}
                        </div>
                      )}
                    </div>
                    {doc.consultationFee && (
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 11, color: "#7a9e96", marginBottom: 2 }}>Biaya</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#2a6e5e" }}>
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(doc.consultationFee)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setStep(3)} disabled={!selectedDoctorId || loadingDoctors}
              style={{ width: "100%", padding: "14px 0", borderRadius: 13, background: !selectedDoctorId ? "#c8dfd8" : "#2a6e5e", border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: !selectedDoctorId ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Pilih Jadwal <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ─── STEP 3: Select Schedule ─── */}
        {step === 3 && selectedDoctor && (
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#0f2420", marginBottom: 6 }}>
              Pilih Jadwal
            </h2>
            <p style={{ fontSize: 14, color: "#5a7870", marginBottom: 24 }}>
              Pilih tanggal dan slot waktu yang tersedia untuk {selectedDoctor.name}.
            </p>

            {/* Doctor mini card */}
            <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", border: "1px solid #e8f5f1", display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              {selectedDoctor.photoUrl ? (
                <img src={selectedDoctor.photoUrl} alt={selectedDoctor.name} style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #2a6e5e, #5ecfb1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white", fontFamily: "'Cormorant Garamond', serif", flexShrink: 0 }}>
                  {selectedDoctor.name.split(" ").filter((w) => !w.toLowerCase().startsWith("dr")).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "DR"}
                </div>
              )}
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f2420" }}>{selectedDoctor.name}</div>
                <div style={{ fontSize: 12, color: "#7a9e96" }}>{selectedDoctor.specialist} · {selectedDoctor.hospital}</div>
              </div>
            </div>

            {/* Doctor's available days info */}
            {selectedDoctor.schedules && selectedDoctor.schedules.length > 0 && (
              <div style={{ background: "#e8f5f1", borderRadius: 12, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#3d6058" }}>
                <strong>Jadwal praktik:</strong>{" "}
                {selectedDoctor.schedules.filter((s) => s.isActive).map((s) => ["Min","Sen","Sel","Rab","Kam","Jum","Sab"][s.dayOfWeek]).join(", ")}
              </div>
            )}

            {/* Date picker */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f2420", marginBottom: 14 }}>Pilih Tanggal</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                {nextDays.map((date, i) => {
                  const dayLabel = DAYS[date.getDay()];
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const available = isDayAvailable(date);
                  return (
                    <button key={i} onClick={() => { if (available) { setSelectedDate(date); setSelectedTime(null); } }}
                      disabled={!available}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 6px", borderRadius: 12, border: `2px solid ${isSelected ? "#2a6e5e" : available ? "#e8f5f1" : "#f0f0f0"}`, background: isSelected ? "#2a6e5e" : available ? "white" : "#fafafa", cursor: available ? "pointer" : "not-allowed", transition: "all 0.15s", opacity: available ? 1 : 0.4 }}>
                      <span style={{ fontSize: 10, color: isSelected ? "rgba(255,255,255,0.7)" : "#7a9e96", marginBottom: 3 }}>{dayLabel}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: isSelected ? "white" : available ? "#0f2420" : "#9ca3af" }}>{date.getDate()}</span>
                      <span style={{ fontSize: 10, color: isSelected ? "rgba(255,255,255,0.7)" : "#7a9e96" }}>{MONTHS[date.getMonth()]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f2420", marginBottom: 14 }}>Pilih Waktu</h3>
                {(Object.entries(TIME_SLOTS) as [string, string[]][]).map(([period, slots]) => (
                  <div key={period} style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#7a9e96", textTransform: "capitalize", marginBottom: 10 }}>{period === "pagi" ? "Pagi" : period === "siang" ? "Siang" : "Sore"}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {slots.map((time) => {
                        const isSelected = selectedTime === time;
                        return (
                          <button key={time} onClick={() => setSelectedTime(time)}
                            style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${isSelected ? "#2a6e5e" : "#e8f5f1"}`, background: isSelected ? "#2a6e5e" : "white", color: isSelected ? "white" : "#0f2420", fontSize: 13, fontWeight: isSelected ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s", fontFamily: "'Outfit', sans-serif" }}>
                            <Clock size={11} /> {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setStep(4)} disabled={!selectedDate || !selectedTime}
              style={{ width: "100%", padding: "14px 0", borderRadius: 13, background: !selectedDate || !selectedTime ? "#c8dfd8" : "#2a6e5e", border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: !selectedDate || !selectedTime ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Konfirmasi Booking <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ─── STEP 4: Confirm ─── */}
        {step === 4 && selectedDoctor && selectedDate && selectedTime && (
          <div style={{ background: "white", borderRadius: 24, padding: 32, border: "1px solid #e8f5f1" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#0f2420", marginBottom: 6 }}>
              Konfirmasi Booking
            </h2>
            <p style={{ fontSize: 14, color: "#5a7870", marginBottom: 28 }}>Periksa kembali detail booking Anda.</p>

            <div style={{ display: "flex", gap: 18, alignItems: "flex-start", padding: "20px", background: "#f8fcfa", borderRadius: 18, marginBottom: 20, border: "1px solid #e8f5f1" }}>
              {selectedDoctor.photoUrl ? (
                <img src={selectedDoctor.photoUrl} alt={selectedDoctor.name} style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <DoctorInitials name={selectedDoctor.name} />
              )}
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0f2420", marginBottom: 4 }}>{selectedDoctor.name}</div>
                <div style={{ fontSize: 13, color: "#5a7870", marginBottom: 6 }}>{selectedDoctor.specialist}</div>
                {selectedDoctor.hospital && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#7a9e96" }}>
                    <MapPin size={11} /> {selectedDoctor.hospital}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { icon: Calendar, label: "Tanggal", value: new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(selectedDate) },
                { icon: Clock, label: "Waktu", value: selectedTime + " WIB" },
                { icon: User, label: "Pasien", value: user?.name },
                { icon: Stethoscope, label: "Keluhan", value: result.disease },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ background: "#f8fcfa", borderRadius: 14, padding: "14px 16px", border: "1px solid #e8f5f1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <Icon size={12} color="#2a6e5e" />
                    <span style={{ fontSize: 11, color: "#7a9e96", fontWeight: 500 }}>{label}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f2420" }}>{value}</div>
                </div>
              ))}
            </div>

            {selectedDoctor.consultationFee && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#e8f5f1", borderRadius: 14, marginBottom: 24 }}>
                <span style={{ fontSize: 14, color: "#3d6058", fontWeight: 500 }}>Estimasi Biaya Konsultasi</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: "#2a6e5e", fontFamily: "'Cormorant Garamond', serif" }}>
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(selectedDoctor.consultationFee)}
                </span>
              </div>
            )}

            {error && (
              <div style={{ background: "#fee2e2", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>{error}</div>
            )}

            <button onClick={handleConfirm} disabled={loading}
              style={{ width: "100%", padding: "15px 0", borderRadius: 13, background: loading ? "#7a9e96" : "#2a6e5e", border: "none", color: "white", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(42,110,94,0.25)" }}>
              {loading ? "Memproses..." : <><Check size={16} /> Konfirmasi Booking</>}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}