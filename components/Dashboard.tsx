import { useState } from "react";
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  User,
  MapPin,
} from "lucide-react";
import type {
  ScreeningResult,
  User as UserType,
  BookingData,
} from "../app/App";
import { DoctorDashboard } from "./DoctorDashboard";
import { AdminDashboard } from "./AdminDashboard";

interface DashboardProps {
  user: UserType;
  screeningResult: ScreeningResult | null;
  bookingData: BookingData | null;
  onStartChat: () => void;
}

// ──────────── PATIENT DASHBOARD ────────────
const MOCK_SCREENINGS = [
  {
    id: "001",
    disease: "Influenza (Flu)",
    confidence: 82,
    date: "12 Apr 2026",
    status: "Selesai",
    doctor: "Dr. Sari Dewi",
  },
  {
    id: "002",
    disease: "Sakit Kepala (Cephalgia)",
    confidence: 75,
    date: "8 Apr 2026",
    status: "Terjadwal",
    doctor: "Dr. Budi Santoso",
  },
  {
    id: "003",
    disease: "Gastritis (Maag)",
    confidence: 88,
    date: "1 Apr 2026",
    status: "Dibatalkan",
    doctor: "Dr. Maya Indira",
  },
];

const STATUS_STYLE: Record<
  string,
  { bg: string; color: string; icon: React.ElementType }
> = {
  Selesai: { bg: "#e8f5f1", color: "#2a6e5e", icon: CheckCircle },
  Terjadwal: { bg: "#eff6ff", color: "#3b82f6", icon: Clock },
  Dibatalkan: { bg: "#fee2e2", color: "#dc2626", icon: XCircle },
  Menunggu: { bg: "#fef3c7", color: "#d97706", icon: AlertCircle },
  Terkonfirmasi: { bg: "#e8f5f1", color: "#2a6e5e", icon: CheckCircle },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE["Menunggu"];
  const Icon = s.icon;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: s.bg,
        color: s.color,
        padding: "4px 10px",
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <Icon size={11} /> {status}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  subtitle,
  isLocation,
  isLast,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  isLocation?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        paddingBottom: isLast ? 0 : 18,
        marginBottom: isLast ? 0 : 18,
        borderBottom: isLast ? "none" : "1px solid #f0f9f6",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: isLocation ? "#fef3c7" : "#e8f5f1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={isLocation ? "#d97706" : "#2a6e5e"} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 11,
            color: "#7a9e96",
            fontWeight: 500,
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#0f2420",
            marginBottom: subtitle ? 3 : 0,
            lineHeight: 1.4,
          }}
        >
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: "#5a7870", lineHeight: 1.5 }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function PatientDashboard({
  user,
  screeningResult,
  bookingData,
  onStartChat,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "history">(
    "overview",
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  const allScreenings = screeningResult
    ? [
        {
          id: "000",
          disease: screeningResult.disease,
          confidence: screeningResult.confidence,
          date: new Intl.DateTimeFormat("id-ID", {
            dateStyle: "medium",
          }).format(screeningResult.timestamp),
          status: "Terjadwal",
          doctor: "Menunggu pemilihan",
        },
        ...MOCK_SCREENINGS,
      ]
    : MOCK_SCREENINGS;

  const tabs = [
    { id: "overview", label: "Ringkasan" },
    { id: "history", label: "Riwayat Pemeriksaan" },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f8fcfa" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f2420 0%, #1a4035 100%)",
          padding: "28px 24px 0",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #2a6e5e, #5ecfb1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                {user.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>
                  Halo, {user.name.split(" ")[0]}
                </div>
                <div style={{ fontSize: 13, color: "#5ecfb1", marginTop: 2 }}>
                  Dashboard Pasien — MediCheck
                </div>
              </div>
            </div>
            <button
              onClick={onStartChat}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 22px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <Plus size={14} /> Pemeriksaan Baru
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2 }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  background: "transparent",
                  color: activeTab === t.id ? "white" : "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  fontWeight: activeTab === t.id ? 600 : 400,
                  cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif",
                  borderBottom:
                    activeTab === t.id
                      ? "2px solid #5ecfb1"
                      : "2px solid transparent",
                  transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Pemeriksaan",
              value: `${allScreenings.length}`,
              icon: Activity,
              color: "#2a6e5e",
            },
            {
              label: "Janji Temu",
              value: bookingData ? "1" : "0",
              icon: Calendar,
              color: "#3b82f6",
            },
            {
              label: "Selesai",
              value: `${allScreenings.filter((s) => s.status === "Selesai").length}`,
              icon: CheckCircle,
              color: "#22c55e",
            },
            {
              label: "Riwayat Diagnosa",
              value: `${allScreenings.length}`,
              icon: FileText,
              color: "#8b5cf6",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 18,
                  padding: "18px 20px",
                  border: "1px solid #e8f5f1",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: `${stat.color}14`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon size={17} color={stat.color} />
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#0f2420",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: "#7a9e96", marginTop: 5 }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Recent screenings */}
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
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={15} color="#2a6e5e" />
                  <span
                    style={{ fontSize: 15, fontWeight: 600, color: "#0f2420" }}
                  >
                    Pemeriksaan Terbaru
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("history")}
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
              {allScreenings.slice(0, 3).map((sc, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 22px",
                    borderBottom: i < 2 ? "1px solid #f8fcfa" : "none",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        marginTop: 5,
                        flexShrink: 0,
                        background:
                          sc.confidence >= 80
                            ? "#2a6e5e"
                            : sc.confidence >= 65
                              ? "#d97706"
                              : "#6b7280",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#0f2420",
                          marginBottom: 4,
                        }}
                      >
                        {sc.disease}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#2a6e5e",
                            background: "#e8f5f1",
                            padding: "2px 8px",
                            borderRadius: 100,
                          }}
                        >
                          {sc.confidence}%
                        </span>
                        <span style={{ fontSize: 12, color: "#7a9e96" }}>
                          {sc.date}
                        </span>
                        <span style={{ fontSize: 12, color: "#7a9e96" }}>
                          {sc.doctor}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={sc.status} />
                </div>
              ))}
            </div>

            {/* Appointment card */}
            {bookingData ? (
              <div
                onClick={() => setShowDetailModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(42,110,94,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  background: "linear-gradient(135deg, #0f2420, #1a4035)",
                  borderRadius: 20,
                  padding: "22px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "rgba(94,207,177,0.15)",
                    border: "1px solid rgba(94,207,177,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Calendar size={22} color="#5ecfb1" />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#5ecfb1",
                      fontWeight: 500,
                      marginBottom: 3,
                    }}
                  >
                    Janji Temu Aktif — Klik untuk detail lengkap
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 6,
                    }}
                  >
                    {bookingData.doctor.name} &middot;{" "}
                    {new Intl.DateTimeFormat("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(bookingData.date)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      fontSize: 13,
                      color: "#7a9e96",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <Clock size={12} color="#5ecfb1" /> {bookingData.time} WIB
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <MapPin size={12} color="#5ecfb1" />{" "}
                      {bookingData.doctor.hospital}
                    </span>
                  </div>
                </div>
                <StatusBadge status={bookingData.status} />
              </div>
            ) : (
              <div
                style={{
                  background: "linear-gradient(135deg, #0f2420, #1a4035)",
                  borderRadius: 20,
                  padding: "22px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "rgba(94,207,177,0.15)",
                    border: "1px solid rgba(94,207,177,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Calendar size={22} color="#5ecfb1" />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#5ecfb1",
                      fontWeight: 500,
                      marginBottom: 3,
                    }}
                  >
                    Janji Temu Berikutnya
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 6,
                    }}
                  >
                    Dr. Budi Santoso &middot; Selasa, 15 Apr 2026
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      fontSize: 13,
                      color: "#7a9e96",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <Clock size={12} color="#5ecfb1" /> 10:00 WIB
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <MapPin size={12} color="#5ecfb1" /> RS Neurologi Jakarta
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    background: "#e8f5f1",
                    color: "#2a6e5e",
                    padding: "6px 14px",
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Terkonfirmasi
                </div>
              </div>
            )}
          </div>
        )}

        {/* History tab */}
        {activeTab === "history" && (
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
                gap: 8,
              }}
            >
              <FileText size={15} color="#2a6e5e" />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#0f2420" }}>
                Semua Riwayat Pemeriksaan
              </span>
            </div>
            {allScreenings.map((sc, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 22px",
                  borderBottom:
                    i < allScreenings.length - 1 ? "1px solid #f8fcfa" : "none",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ display: "flex", gap: 14, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      marginTop: 5,
                      flexShrink: 0,
                      background:
                        sc.confidence >= 80
                          ? "#2a6e5e"
                          : sc.confidence >= 65
                            ? "#d97706"
                            : "#6b7280",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0f2420",
                        marginBottom: 4,
                      }}
                    >
                      {sc.disease}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#2a6e5e",
                          background: "#e8f5f1",
                          padding: "2px 8px",
                          borderRadius: 100,
                        }}
                      >
                        {sc.confidence}%
                      </span>
                      <span style={{ fontSize: 12, color: "#7a9e96" }}>
                        {sc.date}
                      </span>
                      <span style={{ fontSize: 12, color: "#7a9e96" }}>
                        {sc.doctor}
                      </span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={sc.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Appointment Modal */}
      {showDetailModal && bookingData && (
        <>
          <div
            onClick={() => setShowDetailModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              background: "rgba(15, 36, 32, 0.5)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 301,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 540,
              background: "white",
              borderRadius: 20,
              boxShadow: "0 32px 80px rgba(15,36,32,0.18)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #0f2420, #1a4035)",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#5ecfb1",
                    fontWeight: 500,
                    marginBottom: 3,
                  }}
                >
                  Booking ID: {bookingData.id}
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "white" }}>
                  Detail Janji Temu
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  border: "none",
                  background: "rgba(255,255,255,0.12)",
                  padding: 8,
                  borderRadius: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <XCircle size={18} color="white" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>
              <DetailRow
                icon={User}
                label="Dokter"
                value={bookingData.doctor.name}
                subtitle={bookingData.doctor.title}
              />
              <DetailRow
                icon={Calendar}
                label="Tanggal & Waktu"
                value={new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "full",
                }).format(bookingData.date)}
                subtitle={`Pukul ${bookingData.time} WIB`}
              />
              <DetailRow
                icon={MapPin}
                label="Lokasi Praktik"
                value={bookingData.doctor.hospital}
                subtitle={bookingData.doctor.hospitalAddress}
                isLocation
              />
              <DetailRow
                icon={FileText}
                label="Tujuan Konsultasi"
                value={bookingData.disease}
                subtitle={`Status: ${bookingData.status}`}
                isLast
              />
            </div>

            {/* Modal Footer */}
            <div
              style={{
                background: "#f8fcfa",
                padding: "16px 24px",
                borderTop: "1px solid #e8f5f1",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  fontSize: 12,
                  color: "#5a7870",
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#e8f5f1",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{ fontSize: 12, fontWeight: 700, color: "#2a6e5e" }}
                  >
                    !
                  </span>
                </div>
                <div>
                  <strong style={{ color: "#3d6058" }}>
                    Harap Perhatikan:
                  </strong>{" "}
                  Mohon tiba 10 menit sebelum jadwal. Bawa kartu identitas dan
                  hasil screening yang telah Anda terima via email.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ──────────── ROUTER ────────────
export function Dashboard({
  user,
  screeningResult,
  bookingData,
  onStartChat,
}: DashboardProps) {
  if (user.role === "doctor") {
    return <DoctorDashboard user={user} />;
  }
  if (user.role === "admin") {
    return <AdminDashboard user={user} />;
  }
  return (
    <PatientDashboard
      user={user}
      screeningResult={screeningResult}
      bookingData={bookingData}
      onStartChat={onStartChat}
    />
  );
}
