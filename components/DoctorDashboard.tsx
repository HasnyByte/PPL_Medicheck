import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
  Star,
  Phone,
  Mail,
  MapPin,
  Users,
  Activity,
  Edit3,
  Save,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { User as UserType } from "../app/App";

interface DoctorDashboardProps {
  user: UserType;
}

// ──────────── TYPES ────────────
type AppStatus = "Menunggu" | "Terkonfirmasi" | "Selesai" | "Dibatalkan";

interface Appointment {
  id: string;
  patient: string;
  age: number;
  gender: "L" | "P";
  phone: string;
  email: string;
  complaint: string;
  disease: string;
  confidence: number;
  severity: string;
  duration: string;
  additionalSymptoms: string;
  tips: string[];
  time: string;
  date: Date;
  status: AppStatus;
  screened: string;
  doctorNotes: string;
}

// ──────────── MOCK DATA ────────────
const TODAY = new Date(2026, 3, 14); // 14 Apr 2026

function makeDate(offset: number) {
  const d = new Date(TODAY);
  d.setDate(TODAY.getDate() + offset);
  return d;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "BK001",
    patient: "Budi Santoso",
    age: 34,
    gender: "L",
    phone: "0821-3456-7890",
    email: "budi@email.com",
    complaint:
      "Sakit kepala berdenyut sejak kemarin, pusing saat berdiri, sensitif terhadap cahaya dan suara.",
    disease: "Sakit Kepala (Cephalgia)",
    confidence: 75,
    severity: "Sedang (4–6)",
    duration: "1–3 hari",
    additionalSymptoms: "Mual ringan, sensitif terhadap cahaya",
    tips: [
      "Beristirahat di ruangan tenang dan redup",
      "Kompres dingin di dahi",
      "Cukupi kebutuhan cairan",
      "Hindari layar terlalu lama",
    ],
    time: "10:00",
    date: makeDate(0),
    status: "Menunggu",
    screened: "13 Apr 2026 • 14:23",
    doctorNotes: "",
  },
  {
    id: "BK002",
    patient: "Rina Sari",
    age: 27,
    gender: "P",
    phone: "0856-7891-2340",
    email: "rina@email.com",
    complaint:
      "Demam tinggi sudah 2 hari, menggigil di malam hari, badan terasa lemas.",
    disease: "Demam (Febris)",
    confidence: 83,
    severity: "Berat (7–9)",
    duration: "1–3 hari",
    additionalSymptoms: "Menggigil, berkeringat berlebihan",
    tips: [
      "Kompres hangat pada dahi dan ketiak",
      "Perbanyak minum cairan",
      "Gunakan pakaian tipis",
      "Monitor suhu tubuh secara berkala",
    ],
    time: "11:00",
    date: makeDate(0),
    status: "Terkonfirmasi",
    screened: "13 Apr 2026 • 10:15",
    doctorNotes: "",
  },
  {
    id: "BK003",
    patient: "Ahmad Fauzi",
    age: 41,
    gender: "L",
    phone: "0812-9087-6543",
    email: "ahmad@email.com",
    complaint:
      "Batuk berdahak sudah 5 hari, tenggorokan terasa gatal dan nyeri, sedikit sesak.",
    disease: "Batuk (Bronkitis)",
    confidence: 78,
    severity: "Sedang (4–6)",
    duration: "4–7 hari",
    additionalSymptoms: "Sesak ringan, demam subfebris",
    tips: [
      "Minum air hangat dengan madu",
      "Hindari paparan asap dan debu",
      "Istirahat suara",
      "Hindari makanan berminyak",
    ],
    time: "14:00",
    date: makeDate(0),
    status: "Terkonfirmasi",
    screened: "12 Apr 2026 • 19:45",
    doctorNotes: "",
  },
  {
    id: "BK004",
    patient: "Dewi Kartika",
    age: 29,
    gender: "P",
    phone: "0878-2345-6789",
    email: "dewi@email.com",
    complaint:
      "Pilek, bersin-bersin, hidung tersumbat sejak kemarin, badan terasa pegal dan meriang.",
    disease: "Influenza (Flu)",
    confidence: 91,
    severity: "Ringan (1–3)",
    duration: "Baru hari ini",
    additionalSymptoms: "Badan pegal, meriang ringan",
    tips: [
      "Istirahat cukup 7–8 jam",
      "Perbanyak cairan hangat",
      "Konsumsi makanan bergizi",
      "Hindari kontak dekat orang lain",
    ],
    time: "15:00",
    date: makeDate(0),
    status: "Menunggu",
    screened: "13 Apr 2026 • 22:10",
    doctorNotes: "",
  },
  {
    id: "BK005",
    patient: "Hendra Wijaya",
    age: 38,
    gender: "L",
    phone: "0895-1234-5678",
    email: "hendra@email.com",
    complaint:
      "Nyeri ulu hati, mual setelah makan, perut kembung, asam lambung naik.",
    disease: "Gastritis (Maag)",
    confidence: 86,
    severity: "Sedang (4–6)",
    duration: "4–7 hari",
    additionalSymptoms: "Mual, kembung, nyeri ulu hati",
    tips: [
      "Makan porsi kecil 5–6x sehari",
      "Hindari makanan pedas dan asam",
      "Hindari kopi dan soda",
      "Jangan langsung berbaring setelah makan",
    ],
    time: "09:00",
    date: makeDate(1),
    status: "Menunggu",
    screened: "14 Apr 2026 • 08:30",
    doctorNotes: "",
  },
  {
    id: "BK006",
    patient: "Siti Rahayu",
    age: 22,
    gender: "P",
    phone: "0811-8765-4321",
    email: "siti@email.com",
    complaint:
      "Pusing berputar saat berubah posisi, kepala berat, mual ringan.",
    disease: "Sakit Kepala (Cephalgia)",
    confidence: 72,
    severity: "Ringan (1–3)",
    duration: "1–3 hari",
    additionalSymptoms: "Mual, vertigo ringan",
    tips: [
      "Hindari perubahan posisi tiba-tiba",
      "Beristirahat cukup",
      "Cukupi kebutuhan cairan",
      "Konsultasikan jika memburuk",
    ],
    time: "10:30",
    date: makeDate(1),
    status: "Terkonfirmasi",
    screened: "14 Apr 2026 • 09:20",
    doctorNotes: "",
  },
  {
    id: "BK007",
    patient: "Riko Pratama",
    age: 45,
    gender: "L",
    phone: "0821-1111-2222",
    email: "riko@email.com",
    complaint: "Demam 38.5°C selama 3 hari, keringat malam, badan pegal.",
    disease: "Demam (Febris)",
    confidence: 89,
    severity: "Berat (7–9)",
    duration: "4–7 hari",
    additionalSymptoms: "Keringat malam, badan pegal",
    tips: ["Kompres hangat", "Perbanyak minum", "Pakaian tipis"],
    time: "09:00",
    date: makeDate(-4),
    status: "Selesai",
    screened: "9 Apr 2026 • 18:00",
    doctorNotes:
      "Diberikan paracetamol 500mg 3x1. Disarankan tes darah lengkap jika demam tidak turun dalam 3 hari.",
  },
  {
    id: "BK008",
    patient: "Nurul Aini",
    age: 31,
    gender: "P",
    phone: "0856-3333-4444",
    email: "nurul@email.com",
    complaint: "Nyeri lambung, mual, kembung terus-menerus, tidak nafsu makan.",
    disease: "Gastritis (Maag)",
    confidence: 82,
    severity: "Sedang (4–6)",
    duration: "Lebih dari seminggu",
    additionalSymptoms: "Mual berat, tidak nafsu makan",
    tips: ["Makan teratur", "Hindari pedas", "Kelola stres"],
    time: "11:00",
    date: makeDate(-3),
    status: "Selesai",
    screened: "10 Apr 2026 • 09:30",
    doctorNotes:
      "Resep antasida dan omeprazole 1x1. Anjuran diet rendah asam. Follow-up 2 minggu lagi.",
  },
  {
    id: "BK009",
    patient: "Fajar Hidayat",
    age: 19,
    gender: "L",
    phone: "0878-5555-6666",
    email: "fajar@email.com",
    complaint: "Flu berat, pilek, bersin, hidung mampet, badan pegal semua.",
    disease: "Influenza (Flu)",
    confidence: 77,
    severity: "Sedang (4–6)",
    duration: "1–3 hari",
    additionalSymptoms: "Badan pegal, meriang",
    tips: ["Istirahat total", "Perbanyak cairan hangat"],
    time: "13:00",
    date: makeDate(-2),
    status: "Selesai",
    screened: "11 Apr 2026 • 12:00",
    doctorNotes:
      "Vitamin C 1000mg dan CTM. Istirahat 3 hari. Tidak perlu antibiotik.",
  },
  {
    id: "BK010",
    patient: "Laras Dewi",
    age: 36,
    gender: "P",
    phone: "0895-7777-8888",
    email: "laras@email.com",
    complaint: "Batuk berdahak, tenggorokan sakit.",
    disease: "Batuk (Bronkitis)",
    confidence: 70,
    severity: "Ringan (1–3)",
    duration: "1–3 hari",
    additionalSymptoms: "Tidak ada tambahan",
    tips: ["Minum air hangat"],
    time: "14:00",
    date: makeDate(-5),
    status: "Dibatalkan",
    screened: "8 Apr 2026 • 20:00",
    doctorNotes: "Pasien membatalkan tanpa konfirmasi.",
  },
];

const WEEKLY_DATA = [
  { day: "Sen", patients: 8, confirmed: 6 },
  { day: "Sel", patients: 12, confirmed: 10 },
  { day: "Rab", patients: 9, confirmed: 7 },
  { day: "Kam", patients: 15, confirmed: 13 },
  { day: "Jum", patients: 11, confirmed: 9 },
  { day: "Sab", patients: 4, confirmed: 4 },
  { day: "Min", patients: 0, confirmed: 0 },
];

// ──────────── HELPERS ────────────
const STATUS_CFG: Record<
  AppStatus,
  { bg: string; color: string; icon: React.ElementType; label: string }
> = {
  Menunggu: {
    bg: "#fef3c7",
    color: "#d97706",
    icon: AlertCircle,
    label: "Menunggu",
  },
  Terkonfirmasi: {
    bg: "#e8f5f1",
    color: "#2a6e5e",
    icon: CheckCircle,
    label: "Terkonfirmasi",
  },
  Selesai: {
    bg: "#eff6ff",
    color: "#3b82f6",
    icon: CheckCircle,
    label: "Selesai",
  },
  Dibatalkan: {
    bg: "#fee2e2",
    color: "#dc2626",
    icon: XCircle,
    label: "Dibatalkan",
  },
};

const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatDate(d: Date) {
  return `${DAYS_ID[d.getDay()]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function StatusBadge({ status }: { status: AppStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: cfg.bg,
        color: cfg.color,
        padding: "4px 11px",
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={11} /> {cfg.label}
    </div>
  );
}

function ConfidenceMeter({ value }: { value: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 120);
    return () => clearTimeout(t);
  }, [value]);
  const color = value >= 80 ? "#2a6e5e" : value >= 65 ? "#d97706" : "#6b7280";
  const track = value >= 80 ? "#e8f5f1" : value >= 65 ? "#fef3c7" : "#f3f4f6";
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12, color: "#7a9e96" }}>
          Confidence Score (AI)
        </span>
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            color,
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          {value}%
        </span>
      </div>
      <div
        style={{
          height: 7,
          background: track,
          borderRadius: 100,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${w}%`,
            height: "100%",
            borderRadius: 100,
            background:
              value >= 80
                ? "linear-gradient(90deg,#3d9e86,#2a6e5e)"
                : value >= 65
                  ? "linear-gradient(90deg,#f59e0b,#d97706)"
                  : "linear-gradient(90deg,#9ca3af,#6b7280)",
            transition: "width 0.9s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "#b0cec7", marginTop: 5 }}>
        {value >= 80
          ? "Kepercayaan tinggi"
          : value >= 65
            ? "Kepercayaan sedang"
            : "Pemeriksaan lebih lanjut disarankan"}
      </div>
    </div>
  );
}

// ──────────── PATIENT DETAIL PANEL ────────────
function PatientPanel({
  appt,
  onClose,
  onUpdateStatus,
  onSaveNotes,
}: {
  appt: Appointment;
  onClose: () => void;
  onUpdateStatus: (id: string, status: AppStatus) => void;
  onSaveNotes: (id: string, notes: string) => void;
}) {
  const [notes, setNotes] = useState(appt.doctorNotes);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSaveNotes(appt.id, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(15,36,32,0.4)",
          backdropFilter: "blur(3px)",
          animation: "fadeIn .2s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 201,
          width: "min(480px, 100vw)",
          background: "white",
          boxShadow: "-8px 0 48px rgba(15,36,32,0.15)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight .3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <style>{`
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Panel header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e8f5f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#7a9e96",
                fontWeight: 500,
                letterSpacing: ".04em",
                marginBottom: 3,
              }}
            >
              DETAIL PASIEN
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0f2420",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {appt.patient}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              border: "none",
              background: "#f0f9f6",
              borderRadius: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} color="#5a7870" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Patient info */}
          <div
            style={{
              background: "#f8fcfa",
              borderRadius: 16,
              padding: "16px 18px",
              border: "1px solid #e8f5f1",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                { label: "Usia", value: `${appt.age} tahun` },
                {
                  label: "Jenis Kelamin",
                  value: appt.gender === "L" ? "Laki-laki" : "Perempuan",
                },
                { label: "Telepon", value: appt.phone },
                { label: "Jadwal", value: `${appt.time} WIB` },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#7a9e96",
                      fontWeight: 500,
                      marginBottom: 2,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#0f2420", fontWeight: 500 }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid #e8f5f1",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#7a9e96",
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                Diperiksa AI pada
              </div>
              <div style={{ fontSize: 12, color: "#5a7870" }}>
                {appt.screened}
              </div>
            </div>
          </div>

          {/* Keluhan pasien */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "16px 18px",
              border: "1px solid #e8f5f1",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 10,
              }}
            >
              Keluhan Pasien
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#5a7870",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              {appt.complaint}
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  background: "#f0f9f6",
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 11,
                  color: "#3d6058",
                }}
              >
                Tingkat: {appt.severity}
              </div>
              <div
                style={{
                  background: "#f0f9f6",
                  borderRadius: 8,
                  padding: "4px 10px",
                  fontSize: 11,
                  color: "#3d6058",
                }}
              >
                Durasi: {appt.duration}
              </div>
            </div>
            {appt.additionalSymptoms !== "Tidak ada tambahan" && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#5a7870" }}>
                <span style={{ fontWeight: 500, color: "#0f2420" }}>
                  Gejala tambahan:
                </span>{" "}
                {appt.additionalSymptoms}
              </div>
            )}
          </div>

          {/* AI Screening Result */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "18px 18px",
              border: "1px solid #e8f5f1",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#2a6e5e",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0f2420",
                  letterSpacing: ".03em",
                }}
              >
                HASIL ANALISIS AI
              </span>
            </div>

            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 14,
              }}
            >
              {appt.disease}
            </div>

            <ConfidenceMeter value={appt.confidence} />

            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid #f0f9f6",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0f2420",
                  marginBottom: 10,
                }}
              >
                Rekomendasi Awal AI
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {appt.tips.map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 9,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#e8f5f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: "#2a6e5e",
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#5a7870",
                        lineHeight: 1.55,
                      }}
                    >
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div
              style={{
                marginTop: 14,
                background: "#fffbeb",
                borderRadius: 10,
                padding: "10px 12px",
                border: "1px solid #fde68a",
                fontSize: 11,
                color: "#78350f",
                lineHeight: 1.6,
              }}
            >
              Hasil AI adalah skrining awal dan bukan diagnosis definitif.
              Pemeriksaan fisik oleh dokter tetap diperlukan.
            </div>
          </div>

          {/* Doctor notes */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "16px 18px",
              border: "1px solid #e8f5f1",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "#0f2420" }}>
                Catatan Dokter
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Edit3 size={12} color="#7a9e96" />
                <span style={{ fontSize: 11, color: "#7a9e96" }}>
                  Dapat diedit
                </span>
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan catatan medis, resep, atau instruksi tindak lanjut..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1.5px solid #c8dfd8",
                background: "#f8fcfa",
                fontSize: 13,
                color: "#1a2e28",
                fontFamily: "'Outfit', sans-serif",
                lineHeight: 1.6,
                resize: "vertical",
                outline: "none",
                transition: "border-color .15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2a6e5e")}
              onBlur={(e) => (e.target.style.borderColor = "#c8dfd8")}
            />
            <button
              onClick={handleSave}
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: saved ? "#e8f5f1" : "#2a6e5e",
                color: saved ? "#2a6e5e" : "white",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                transition: "all .2s ease",
              }}
            >
              {saved ? (
                <>
                  <CheckCircle size={13} /> Tersimpan!
                </>
              ) : (
                <>
                  <Save size={13} /> Simpan Catatan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        {(appt.status === "Menunggu" || appt.status === "Terkonfirmasi") && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e8f5f1",
              display: "flex",
              gap: 10,
              flexShrink: 0,
            }}
          >
            {appt.status === "Menunggu" && (
              <button
                onClick={() => {
                  onUpdateStatus(appt.id, "Terkonfirmasi");
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 11,
                  border: "none",
                  background: "#2a6e5e",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 3px 12px rgba(42,110,94,0.25)",
                  transition: "all .15s",
                }}
              >
                Konfirmasi Janji
              </button>
            )}
            {appt.status === "Terkonfirmasi" && (
              <button
                onClick={() => {
                  onUpdateStatus(appt.id, "Selesai");
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: "11px 0",
                  borderRadius: 11,
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 3px 12px rgba(59,130,246,0.25)",
                  transition: "all .15s",
                }}
              >
                Tandai Selesai
              </button>
            )}
            <button
              onClick={() => {
                onUpdateStatus(appt.id, "Dibatalkan");
                onClose();
              }}
              style={{
                padding: "11px 18px",
                borderRadius: 11,
                border: "1.5px solid #fca5a5",
                background: "white",
                color: "#dc2626",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Batalkan
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ──────────── APPOINTMENT CARD ────────────
function AppointmentCard({
  appt,
  onSelect,
  onQuickStatus,
}: {
  appt: Appointment;
  onSelect: () => void;
  onQuickStatus: (status: AppStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: `1.5px solid ${appt.status === "Menunggu" ? "#fde68a" : appt.status === "Terkonfirmasi" ? "#c8dfd8" : appt.status === "Selesai" ? "#bfdbfe" : "#fca5a5"}`,
        overflow: "hidden",
        transition: "all .2s ease",
      }}
    >
      {/* Main row */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
        }}
      >
        {/* Time badge */}
        <div style={{ flexShrink: 0, textAlign: "center", minWidth: 48 }}>
          <div
            style={{
              background: "#e8f5f1",
              borderRadius: 10,
              padding: "6px 8px",
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#2a6e5e",
                fontFamily: "'Cormorant Garamond', serif",
                lineHeight: 1,
              }}
            >
              {appt.time}
            </div>
            <div style={{ fontSize: 10, color: "#7a9e96", marginTop: 2 }}>
              WIB
            </div>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0f2420",
                  marginBottom: 2,
                }}
              >
                {appt.patient}
              </div>
              <div style={{ fontSize: 12, color: "#7a9e96", marginBottom: 8 }}>
                {appt.age} th •{" "}
                {appt.gender === "L" ? "Laki-laki" : "Perempuan"}
              </div>
            </div>
            <StatusBadge status={appt.status} />
          </div>

          {/* Disease + confidence */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                background:
                  appt.confidence >= 80
                    ? "#e8f5f1"
                    : appt.confidence >= 65
                      ? "#fef3c7"
                      : "#f3f4f6",
                color:
                  appt.confidence >= 80
                    ? "#2a6e5e"
                    : appt.confidence >= 65
                      ? "#d97706"
                      : "#6b7280",
                padding: "3px 10px",
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Activity size={10} /> {appt.disease}
            </div>
            <span style={{ fontSize: 11, color: "#7a9e96" }}>
              AI {appt.confidence}%
            </span>
          </div>

          {/* Quick complaint preview */}
          <p
            style={{
              fontSize: 12,
              color: "#7a9e96",
              lineHeight: 1.5,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {appt.complaint}
          </p>

          {/* Actions */}
          <div
            style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}
          >
            <button
              onClick={onSelect}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 9,
                border: "1.5px solid #c8dfd8",
                background: "white",
                color: "#2a6e5e",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e8f5f1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              <FileText size={12} /> Lihat Detail
            </button>

            {appt.status === "Menunggu" && (
              <button
                onClick={() => onQuickStatus("Terkonfirmasi")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 9,
                  border: "none",
                  background: "#2a6e5e",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <CheckCircle size={12} /> Konfirmasi
              </button>
            )}
            {appt.status === "Terkonfirmasi" && (
              <button
                onClick={() => onQuickStatus("Selesai")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 9,
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <CheckCircle size={12} /> Selesai
              </button>
            )}
            {(appt.status === "Menunggu" ||
              appt.status === "Terkonfirmasi") && (
              <button
                onClick={() => onQuickStatus("Dibatalkan")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 9,
                  border: "1.5px solid #fca5a5",
                  background: "white",
                  color: "#dc2626",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <XCircle size={12} /> Batalkan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────── MAIN DOCTOR DASHBOARD ────────────
type DoctorTab = "overview" | "schedule" | "patients" | "records" | "profile";

export function DoctorDashboard({ user }: DoctorDashboardProps) {
  const [tab, setTab] = useState<DoctorTab>("overview");
  const [appointments, setAppointments] =
    useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(
    null,
  );
  const [scheduleDate, setScheduleDate] = useState<Date>(new Date(TODAY));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<AppStatus | "Semua">(
    "Semua",
  );
  const [notifOpen, setNotifOpen] = useState(false);

  const docName = user.name || "Dr. Sari Dewi";
  const docSpecialty = "Dokter Umum";

  const todayAppts = appointments.filter((a) => isSameDay(a.date, TODAY));
  const scheduleAppts = appointments
    .filter((a) => isSameDay(a.date, scheduleDate))
    .sort((a, b) => a.time.localeCompare(b.time));
  const completedAppts = appointments.filter((a) => a.status === "Selesai");
  const pendingCount = todayAppts.filter((a) => a.status === "Menunggu").length;

  const filteredPatients = appointments.filter((a) => {
    const matchSearch =
      a.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.disease.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "Semua" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: AppStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  };
  const saveNotes = (id: string, notes: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, doctorNotes: notes } : a)),
    );
  };
  const getLatestAppt = (id: string) =>
    appointments.find((a) => a.id === id) || null;

  const TABS: { id: DoctorTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Ringkasan", icon: BarChart2 },
    { id: "schedule", label: "Jadwal", icon: Calendar },
    { id: "patients", label: "Semua Pasien", icon: Users },
    { id: "records", label: "Rekam Medis", icon: FileText },
    { id: "profile", label: "Profil Saya", icon: User },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f8fcfa" }}>
      {/* ── Doctor Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f2420 0%, #1a4035 100%)",
          padding: "28px 24px 0",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #2a6e5e, #5ecfb1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "'Cormorant Garamond', serif",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                  flexShrink: 0,
                }}
              >
                {docName
                  .split(" ")
                  .filter((w) => w.toLowerCase() !== "dr.")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "white",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {docName}
                </div>
                <div style={{ fontSize: 13, color: "#5ecfb1", marginTop: 2 }}>
                  {docSpecialty} · RS Medika Utama
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {/* Notif badge */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={18} color="white" />
                  {pendingCount > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#ef4444",
                        border: "2px solid #0f2420",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      {pendingCount}
                    </div>
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div
                      style={{ position: "fixed", inset: 0, zIndex: 9 }}
                      onClick={() => setNotifOpen(false)}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        zIndex: 10,
                        background: "white",
                        borderRadius: 16,
                        padding: "12px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                        border: "1px solid #e8f5f1",
                        minWidth: 280,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#0f2420",
                          marginBottom: 10,
                        }}
                      >
                        Notifikasi
                      </div>
                      {todayAppts
                        .filter((a) => a.status === "Menunggu")
                        .map((a) => (
                          <div
                            key={a.id}
                            onClick={() => {
                              setSelectedPatient(a);
                              setNotifOpen(false);
                            }}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 10,
                              cursor: "pointer",
                              background: "#fffbeb",
                              border: "1px solid #fde68a",
                              marginBottom: 6,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#0f2420",
                              }}
                            >
                              {a.patient}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#d97706",
                                marginTop: 2,
                              }}
                            >
                              Menunggu konfirmasi · {a.time}
                            </div>
                          </div>
                        ))}
                      {pendingCount === 0 && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#7a9e96",
                            textAlign: "center",
                            padding: "8px 0",
                          }}
                        >
                          Tidak ada notifikasi baru
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  color: "#5ecfb1",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {formatDate(TODAY)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "12px 20px",
                    border: "none",
                    background: "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    whiteSpace: "nowrap",
                    borderBottom: active
                      ? "2px solid #5ecfb1"
                      : "2px solid transparent",
                    transition: "all .15s ease",
                  }}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* ── TAB: RINGKASAN ── */}
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Pasien Hari Ini",
                  value: `${todayAppts.length}`,
                  icon: Users,
                  color: "#3b82f6",
                  sub: "total terjadwal",
                },
                {
                  label: "Menunggu Konfirmasi",
                  value: `${todayAppts.filter((a) => a.status === "Menunggu").length}`,
                  icon: AlertCircle,
                  color: "#d97706",
                  sub: "perlu tindakan",
                },
                {
                  label: "Terkonfirmasi",
                  value: `${todayAppts.filter((a) => a.status === "Terkonfirmasi").length}`,
                  icon: CheckCircle,
                  color: "#2a6e5e",
                  sub: "siap diperiksa",
                },
                {
                  label: "Total Bulan Ini",
                  value: "47",
                  icon: Activity,
                  color: "#8b5cf6",
                  sub: "↑ 12% vs bulan lalu",
                },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      borderRadius: 18,
                      padding: "20px 22px",
                      border: "1px solid #e8f5f1",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: `${s.color}14`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={18} color={s.color} />
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 34,
                        fontWeight: 700,
                        color: "#0f2420",
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#0f2420",
                        marginTop: 6,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#7a9e96", marginTop: 3 }}
                    >
                      {s.sub}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart + Today's schedule side by side */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Weekly chart */}
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "22px 24px",
                  border: "1px solid #e8f5f1",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#0f2420",
                      }}
                    >
                      Statistik Minggu Ini
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#7a9e96", marginTop: 2 }}
                    >
                      Jumlah pasien per hari
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: "#2a6e5e",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "#7a9e96" }}>
                        Terkonfirmasi
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: "#c8dfd8",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "#7a9e96" }}>
                        Total
                      </span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={WEEKLY_DATA} barGap={4} barCategoryGap={12}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f9f6"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#7a9e96" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #e8f5f1",
                        borderRadius: 10,
                        fontSize: 12,
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      }}
                      cursor={{ fill: "rgba(42,110,94,0.04)" }}
                    />
                    <Bar
                      dataKey="patients"
                      name="Total"
                      fill="#c8dfd8"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={24}
                    />
                    <Bar
                      dataKey="confirmed"
                      name="Terkonfirmasi"
                      fill="#2a6e5e"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Today's appointments mini */}
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  border: "1px solid #e8f5f1",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "18px 22px",
                    borderBottom: "1px solid #f0f9f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ fontSize: 15, fontWeight: 600, color: "#0f2420" }}
                  >
                    Jadwal Hari Ini
                  </div>
                  <button
                    onClick={() => setTab("schedule")}
                    style={{
                      fontSize: 12,
                      color: "#2a6e5e",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    Lihat semua
                  </button>
                </div>
                <div>
                  {todayAppts.length === 0 && (
                    <div
                      style={{
                        padding: "32px 24px",
                        textAlign: "center",
                        color: "#b0cec7",
                        fontSize: 14,
                      }}
                    >
                      Tidak ada jadwal hari ini
                    </div>
                  )}
                  {todayAppts.map((a, i) => (
                    <div
                      key={a.id}
                      onClick={() => setSelectedPatient(a)}
                      style={{
                        padding: "14px 22px",
                        borderBottom:
                          i < todayAppts.length - 1
                            ? "1px solid #f8fcfa"
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        cursor: "pointer",
                        transition: "background .15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fcfa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: 44,
                          flexShrink: 0,
                          textAlign: "center",
                          background: "#e8f5f1",
                          borderRadius: 10,
                          padding: "5px 0",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#2a6e5e",
                          }}
                        >
                          {a.time}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0f2420",
                            marginBottom: 2,
                          }}
                        >
                          {a.patient}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#7a9e96",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {a.disease}
                        </div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insight strip */}
            <div
              style={{
                background: "linear-gradient(135deg, #0f2420, #1a4035)",
                borderRadius: 20,
                padding: "22px 28px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  flexShrink: 0,
                  background: "rgba(94,207,177,0.15)",
                  border: "1px solid rgba(94,207,177,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={22} color="#5ecfb1" />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  Insight AI Hari Ini
                </div>
                <div
                  style={{ fontSize: 13, color: "#7a9e96", lineHeight: 1.6 }}
                >
                  Rata-rata confidence score pasien hari ini:{" "}
                  <span style={{ color: "#5ecfb1", fontWeight: 600 }}>
                    81.75%
                  </span>
                  . Pola terbanyak: Sakit Kepala (2 pasien) dan Flu (1 pasien).
                  Satu pasien (Dewi Kartika) memiliki confidence tertinggi: 91%.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: JADWAL ── */}
        {tab === "schedule" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Date navigation */}
            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: "16px 20px",
                border: "1px solid #e8f5f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <button
                onClick={() => {
                  const d = new Date(scheduleDate);
                  d.setDate(d.getDate() - 1);
                  setScheduleDate(d);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid #e8f5f1",
                  background: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronLeft size={16} color="#5a7870" />
              </button>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: 16, fontWeight: 700, color: "#0f2420" }}
                >
                  {formatDate(scheduleDate)}
                </div>
                {isSameDay(scheduleDate, TODAY) && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#2a6e5e",
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    Hari Ini
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  const d = new Date(scheduleDate);
                  d.setDate(d.getDate() + 1);
                  setScheduleDate(d);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid #e8f5f1",
                  background: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronRight size={16} color="#5a7870" />
              </button>
            </div>

            {/* Summary row for selected date */}
            {scheduleAppts.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(["Menunggu", "Terkonfirmasi", "Selesai"] as AppStatus[]).map(
                  (s) => {
                    const count = scheduleAppts.filter(
                      (a) => a.status === s,
                    ).length;
                    const cfg = STATUS_CFG[s];
                    return count > 0 ? (
                      <div
                        key={s}
                        style={{
                          background: cfg.bg,
                          color: cfg.color,
                          padding: "6px 14px",
                          borderRadius: 100,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {count} {cfg.label}
                      </div>
                    ) : null;
                  },
                )}
              </div>
            )}

            {/* Appointment list */}
            {scheduleAppts.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "56px 24px",
                  border: "1px solid #e8f5f1",
                  textAlign: "center",
                }}
              >
                <Calendar
                  size={40}
                  color="#c8dfd8"
                  style={{ marginBottom: 16 }}
                />
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#0f2420",
                    marginBottom: 6,
                  }}
                >
                  Tidak ada jadwal
                </div>
                <div style={{ fontSize: 14, color: "#7a9e96" }}>
                  Tidak ada janji temu pada {formatDate(scheduleDate)}.
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {scheduleAppts.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    onSelect={() => setSelectedPatient(appt)}
                    onQuickStatus={(status) => updateStatus(appt.id, status)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: SEMUA PASIEN ── */}
        {tab === "patients" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Search + filter */}
            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: "16px 20px",
                border: "1px solid #e8f5f1",
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 200,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#f8fcfa",
                  borderRadius: 12,
                  padding: "9px 14px",
                  border: "1.5px solid #c8dfd8",
                }}
              >
                <Search size={15} color="#7a9e96" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama pasien atau diagnosis..."
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: 13,
                    color: "#1a2e28",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <X size={13} color="#7a9e96" />
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(
                  [
                    "Semua",
                    "Menunggu",
                    "Terkonfirmasi",
                    "Selesai",
                    "Dibatalkan",
                  ] as const
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: 100,
                      border: "none",
                      background: filterStatus === s ? "#2a6e5e" : "#f0f9f6",
                      color: filterStatus === s ? "white" : "#5a7870",
                      fontSize: 12,
                      fontWeight: filterStatus === s ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "'Outfit', sans-serif",
                      transition: "all .15s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div style={{ fontSize: 13, color: "#7a9e96" }}>
              Menampilkan{" "}
              <strong style={{ color: "#0f2420" }}>
                {filteredPatients.length}
              </strong>{" "}
              pasien
            </div>

            {/* Patient grid */}
            {filteredPatients.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "48px",
                  textAlign: "center",
                  border: "1px solid #e8f5f1",
                }}
              >
                <Search
                  size={36}
                  color="#c8dfd8"
                  style={{ marginBottom: 12 }}
                />
                <div style={{ fontSize: 15, color: "#5a7870" }}>
                  Tidak ada pasien yang ditemukan.
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredPatients.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => setSelectedPatient(appt)}
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: "18px 20px",
                      border: "1px solid #e8f5f1",
                      cursor: "pointer",
                      transition: "all .2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(42,110,94,0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            flexShrink: 0,
                            background:
                              "linear-gradient(135deg, #e8f5f1, #c8dfd8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 15,
                            fontWeight: 700,
                            color: "#2a6e5e",
                          }}
                        >
                          {appt.patient
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#0f2420",
                            }}
                          >
                            {appt.patient}
                          </div>
                          <div style={{ fontSize: 12, color: "#7a9e96" }}>
                            {appt.age} th · {appt.gender === "L" ? "L" : "P"} ·{" "}
                            {appt.phone}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>

                    <div
                      style={{
                        background: "#f8fcfa",
                        borderRadius: 10,
                        padding: "10px 12px",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f2420",
                          marginBottom: 3,
                        }}
                      >
                        {appt.disease}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 5,
                            background: "#e8f5f1",
                            borderRadius: 100,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${appt.confidence}%`,
                              height: "100%",
                              background:
                                appt.confidence >= 80
                                  ? "linear-gradient(90deg,#3d9e86,#2a6e5e)"
                                  : appt.confidence >= 65
                                    ? "linear-gradient(90deg,#f59e0b,#d97706)"
                                    : "#9ca3af",
                              borderRadius: 100,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#7a9e96",
                            whiteSpace: "nowrap",
                          }}
                        >
                          AI {appt.confidence}%
                        </span>
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <Clock size={12} color="#7a9e96" />
                      <span style={{ fontSize: 12, color: "#7a9e96" }}>
                        {appt.date.getDate()}{" "}
                        {MONTHS_ID[appt.date.getMonth()].slice(0, 3)} ·{" "}
                        {appt.time} WIB
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#c8dfd8",
                          marginLeft: "auto",
                        }}
                      >
                        Klik untuk detail →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: REKAM MEDIS ── */}
        {tab === "records" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 13, color: "#7a9e96" }}>
              <strong style={{ color: "#0f2420" }}>
                {completedAppts.length}
              </strong>{" "}
              rekam medis tersimpan
            </div>

            {completedAppts.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "48px",
                  textAlign: "center",
                  border: "1px solid #e8f5f1",
                }}
              >
                <FileText
                  size={36}
                  color="#c8dfd8"
                  style={{ marginBottom: 12 }}
                />
                <div style={{ fontSize: 15, color: "#5a7870" }}>
                  Belum ada rekam medis selesai.
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {completedAppts.map((appt, i) => (
                  <div
                    key={appt.id}
                    style={{
                      background: "white",
                      borderRadius: 18,
                      border: "1px solid #e8f5f1",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "18px 22px",
                        display: "flex",
                        gap: 16,
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Left info */}
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: "#eff6ff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#3b82f6",
                            }}
                          >
                            {appt.patient
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#0f2420",
                              }}
                            >
                              {appt.patient}
                            </div>
                            <div style={{ fontSize: 12, color: "#7a9e96" }}>
                              {appt.age} th · {appt.date.getDate()}{" "}
                              {MONTHS_ID[appt.date.getMonth()].slice(0, 3)}{" "}
                              {appt.date.getFullYear()}
                            </div>
                          </div>
                          <StatusBadge status={appt.status} />
                        </div>

                        <div
                          style={{
                            display: "inline-flex",
                            gap: 6,
                            alignItems: "center",
                            background: "#eff6ff",
                            color: "#3b82f6",
                            padding: "3px 10px",
                            borderRadius: 100,
                            fontSize: 11,
                            fontWeight: 500,
                            marginBottom: 10,
                          }}
                        >
                          <Activity size={10} /> {appt.disease} · AI{" "}
                          {appt.confidence}%
                        </div>

                        <p
                          style={{
                            fontSize: 13,
                            color: "#5a7870",
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {appt.complaint}
                        </p>
                      </div>

                      {/* Doctor notes */}
                      <div
                        style={{
                          flex: 1,
                          minWidth: 220,
                          background: "#f8fcfa",
                          borderRadius: 12,
                          padding: "14px 16px",
                          border: "1px solid #e8f5f1",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "#7a9e96",
                            fontWeight: 500,
                            marginBottom: 8,
                          }}
                        >
                          CATATAN DOKTER
                        </div>
                        {appt.doctorNotes ? (
                          <p
                            style={{
                              fontSize: 13,
                              color: "#0f2420",
                              lineHeight: 1.65,
                              margin: 0,
                            }}
                          >
                            {appt.doctorNotes}
                          </p>
                        ) : (
                          <p
                            style={{
                              fontSize: 13,
                              color: "#b0cec7",
                              fontStyle: "italic",
                              margin: 0,
                            }}
                          >
                            Belum ada catatan dokter.
                          </p>
                        )}
                        <button
                          onClick={() => setSelectedPatient(appt)}
                          style={{
                            marginTop: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1px solid #c8dfd8",
                            background: "white",
                            color: "#2a6e5e",
                            fontSize: 12,
                            cursor: "pointer",
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        >
                          <Edit3 size={11} /> Edit Catatan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: PROFIL ── */}
        {tab === "profile" && (
          <div className="grid md:grid-cols-3 gap-5">
            {/* Profile card */}
            <div
              style={{
                background: "white",
                borderRadius: 22,
                padding: "28px 24px",
                border: "1px solid #e8f5f1",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 22,
                  margin: "0 auto 16px",
                  background: "linear-gradient(135deg, #2a6e5e, #5ecfb1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "'Cormorant Garamond', serif",
                  boxShadow: "0 8px 24px rgba(42,110,94,0.2)",
                }}
              >
                {docName
                  .split(" ")
                  .filter((w) => w.toLowerCase() !== "dr.")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: "#0f2420",
                  marginBottom: 4,
                }}
              >
                {docName}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#2a6e5e",
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                {docSpecialty}
              </div>
              <div style={{ fontSize: 12, color: "#7a9e96", marginBottom: 20 }}>
                RS Medika Utama, Jakarta
              </div>

              <div
                style={{ display: "flex", gap: 10, flexDirection: "column" }}
              >
                {[
                  { icon: Phone, value: "+62 821-3456-7890" },
                  { icon: Mail, value: "sari.dewi@medicheck.id" },
                  { icon: MapPin, value: "Jakarta Selatan" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 12px",
                        background: "#f8fcfa",
                        borderRadius: 10,
                      }}
                    >
                      <Icon size={14} color="#2a6e5e" />
                      <span style={{ fontSize: 12, color: "#5a7870" }}>
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: "14px",
                  background: "#e8f5f1",
                  borderRadius: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    justifyContent: "center",
                    marginBottom: 4,
                  }}
                >
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0f2420",
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                  >
                    4.9
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#5a7870" }}>
                  Rating dari 1.247 ulasan
                </div>
              </div>
            </div>

            {/* Info + Stats */}
            <div
              style={{
                gridColumn: "span 2",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Credentials */}
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "22px 24px",
                  border: "1px solid #e8f5f1",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0f2420",
                    marginBottom: 16,
                  }}
                >
                  Informasi Profesional
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "No. SIP", value: "123/SIP-DKI/2020" },
                    { label: "Spesialisasi", value: docSpecialty },
                    { label: "Rumah Sakit", value: "RS Medika Utama" },
                    { label: "Pengalaman", value: "12 Tahun" },
                    { label: "Hari Praktik", value: "Senin – Jumat" },
                    { label: "Jam Praktik", value: "08:00 – 17:00 WIB" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "#f8fcfa",
                        borderRadius: 12,
                        padding: "12px 16px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "#7a9e96",
                          fontWeight: 500,
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f2420",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly stats */}
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "22px 24px",
                  border: "1px solid #e8f5f1",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0f2420",
                    marginBottom: 16,
                  }}
                >
                  Statistik Bulan Ini
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Total Pasien",
                      value: "47",
                      icon: Users,
                      color: "#3b82f6",
                    },
                    {
                      label: "Konsultasi Selesai",
                      value: "44",
                      icon: CheckCircle,
                      color: "#2a6e5e",
                    },
                    {
                      label: "Rata-rata Confidence AI",
                      value: "81%",
                      icon: Activity,
                      color: "#8b5cf6",
                    },
                    {
                      label: "Tingkat Kepuasan",
                      value: "98%",
                      icon: Star,
                      color: "#f59e0b",
                    },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          padding: "12px 14px",
                          background: "#f8fcfa",
                          borderRadius: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            flexShrink: 0,
                            background: `${s.color}14`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Icon size={16} color={s.color} />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#0f2420",
                              fontFamily: "'Cormorant Garamond', serif",
                              lineHeight: 1,
                            }}
                          >
                            {s.value}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#7a9e96",
                              marginTop: 2,
                            }}
                          >
                            {s.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Keahlian */}
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "22px 24px",
                  border: "1px solid #e8f5f1",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0f2420",
                    marginBottom: 14,
                  }}
                >
                  Keahlian & Kompetensi
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[
                    "Penyakit Dalam",
                    "Demam & Infeksi",
                    "Sakit Kepala",
                    "Gangguan Pencernaan",
                    "Penyakit Pernafasan",
                    "Flu & ISPA",
                    "Preventif Kesehatan",
                    "Konsultasi Umum",
                  ].map((skill) => (
                    <div
                      key={skill}
                      style={{
                        background: "#e8f5f1",
                        color: "#2a6e5e",
                        padding: "6px 14px",
                        borderRadius: 100,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient detail panel */}
      {selectedPatient && (
        <PatientPanel
          appt={getLatestAppt(selectedPatient.id) || selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onUpdateStatus={updateStatus}
          onSaveNotes={saveNotes}
        />
      )}
    </div>
  );
}
