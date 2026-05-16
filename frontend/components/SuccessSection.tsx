import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Home,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import type { BookingData } from "../app/App";

interface SuccessSectionProps {
  user?: import("../app/App").User | null;
  booking: BookingData;
  onDashboard: () => void;
  onHome: () => void;
}

export function SuccessSection({ user,
  booking,
  onDashboard,
  onHome,
}: SuccessSectionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "linear-gradient(160deg, #f8fcfa 0%, #ffffff 100%)",
      }}
    >
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      <div
        style={{
          maxWidth: 540,
          width: "100%",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {/* Icon with ripple */}
        <div
          style={{
            position: "relative",
            width: 100,
            height: 100,
            margin: "0 auto 32px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(42,110,94,0.1)",
              animation: "ripple 2s ease-out infinite",
            }}
          />
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2a6e5e, #3d9e86)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              zIndex: 1,
              animation: "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: "0 8px 32px rgba(42,110,94,0.25)",
            }}
          >
            <CheckCircle size={44} color="white" />
          </div>
        </div>

        <div
          style={{
            animation: "fadeUp 0.5s ease 0.3s both",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 42,
              fontWeight: 600,
              color: "#0f2420",
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            Janji Temu Berhasil
            <br />
            <span style={{ color: "#2a6e5e", fontStyle: "italic" }}>
              Dibuat
            </span>
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#5a7870",
              lineHeight: 1.7,
              marginBottom: 32,
              maxWidth: 400,
              margin: "0 auto 32px",
            }}
          >
            Booking Anda telah diterima dan sedang menunggu konfirmasi dari
            dokter. Notifikasi akan dikirimkan ke email Anda.
          </p>
        </div>

        {/* Booking Details Card */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            border: "1px solid #e8f5f1",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            overflow: "hidden",
            marginBottom: 28,
            animation: "fadeUp 0.5s ease 0.4s both",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #0f2420, #1a4035)",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(94,207,177,0.15)",
                border: "1px solid rgba(94,207,177,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={20} color="#5ecfb1" />
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "#5ecfb1",
                  fontWeight: 500,
                  marginBottom: 2,
                }}
              >
                Booking ID: {booking.id}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "white" }}>
                Detail Janji Temu
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: "24px" }}>
            {/* Doctor */}
            <DetailRow
              icon={User}
              label="Dokter"
              value={booking.doctor.name}
              subtitle={booking.doctor.specialist || undefined}
            />

            {/* Date & Time */}
            <DetailRow
              icon={Calendar}
              label="Tanggal & Waktu"
              value={formatDate(booking.date)}
              subtitle={`Pukul ${booking.time} WIB`}
            />

            {/* Location */}
            <DetailRow
              icon={MapPin}
              label="Lokasi Praktik"
              value={booking.doctor.hospital || undefined}
              subtitle={booking.doctor.hospitalAddress || undefined}
              isLocation
            />

            {/* Diagnosis */}
            <DetailRow
              icon={FileText}
              label="Tujuan Konsultasi"
              value={booking.disease}
              subtitle={`Status: ${booking.status}`}
              isLast
            />
          </div>

          {/* Footer Note */}
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
                  style={{ fontSize: 14, fontWeight: 700, color: "#2a6e5e" }}
                >
                  !
                </span>
              </div>
              <div>
                <strong style={{ color: "#3d6058" }}>Harap Perhatikan:</strong>{" "}
                Mohon tiba 10 menit sebelum jadwal. Bawa kartu identitas dan
                hasil screening yang telah Anda terima via email.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            animation: "fadeUp 0.5s ease 0.5s both",
          }}
        >
          <button
            onClick={onDashboard}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 28px",
              borderRadius: 13,
              background: "#2a6e5e",
              border: "none",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 4px 16px rgba(42,110,94,0.3)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#235c4e";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2a6e5e";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <LayoutDashboard size={15} /> Lihat Dashboard
          </button>
          <button
            onClick={onHome}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 24px",
              borderRadius: 13,
              border: "1.5px solid #c8dfd8",
              background: "white",
              color: "#3d6058",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f0f9f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
            }}
          >
            <Home size={15} /> Kembali ke Beranda
          </button>
        </div>
      </div>
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
  value?: string;
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
