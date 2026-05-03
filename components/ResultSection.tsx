import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home,
  Phone,
} from "lucide-react";
import type { ScreeningResult } from "../app/App";

interface ResultSectionProps {
  result: ScreeningResult;
  onBook: () => void;
  onRetry: () => void;
  onHome: () => void;
}

function ConfidenceMeter({ value, label }: { value: number; label: string }) {
  const [animated, setAnimated] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = value / 80;
        const timer = setInterval(() => {
          start += step;
          if (start >= value) {
            setAnimated(value);
            clearInterval(timer);
          } else setAnimated(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  const color = value >= 80 ? "#2a6e5e" : value >= 65 ? "#d97706" : "#6b7280";
  const bgTrack = value >= 80 ? "#e8f5f1" : value >= 65 ? "#fef3c7" : "#f3f4f6";

  return (
    <div ref={ref}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 13, color: "#5a7870" }}>{label}</span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 600,
            color,
            lineHeight: 1,
          }}
        >
          {animated}%
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: bgTrack,
          borderRadius: 100,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${animated}%`,
            height: "100%",
            background:
              value >= 80
                ? "linear-gradient(90deg, #3d9e86, #2a6e5e)"
                : value >= 65
                  ? "linear-gradient(90deg, #f59e0b, #d97706)"
                  : "linear-gradient(90deg, #9ca3af, #6b7280)",
            borderRadius: 100,
            transition: "width 0.05s linear",
          }}
        />
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#7a9e96" }}>
        {value >= 80
          ? "Tingkat kepercayaan tinggi"
          : value >= 65
            ? "Tingkat kepercayaan sedang"
            : "Disarankan pemeriksaan lebih lanjut"}
      </div>
    </div>
  );
}

export function ResultSection({
  result,
  onBook,
  onRetry,
  onHome,
}: ResultSectionProps) {
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(result.timestamp);

  if (result.isEmergency) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          background: "#fff5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            background: "white",
            borderRadius: 24,
            padding: 40,
            textAlign: "center",
            border: "2px solid #fca5a5",
            boxShadow: "0 16px 48px rgba(220,38,38,0.12)",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <AlertTriangle size={32} color="#dc2626" />
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32,
              fontWeight: 600,
              color: "#7f1d1d",
              marginBottom: 12,
            }}
          >
            Kondisi Darurat Terdeteksi
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#5a7870",
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            Gejala yang Anda sebutkan mengindikasikan kondisi yang membutuhkan
            penanganan medis segera. Mohon hubungi layanan darurat atau menuju
            IGD/UGD terdekat.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="tel:119"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                borderRadius: 12,
                background: "#dc2626",
                border: "none",
                color: "white",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(220,38,38,0.3)",
              }}
            >
              <Phone size={15} /> Hubungi 119 (Darurat)
            </a>
            <button
              onClick={onHome}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 12,
                border: "1.5px solid #e5e7eb",
                background: "white",
                color: "#374151",
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <Home size={15} /> Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(160deg, #f8fcfa 0%, #ffffff 60%)",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Back nav */}
        <button
          onClick={onRetry}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#5a7870",
            fontSize: 13,
            marginBottom: 24,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          <ArrowLeft size={14} /> Ulangi Pemeriksaan
        </button>

        {/* Header card */}
        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: "32px 36px",
            border: "1px solid #e8f5f1",
            marginBottom: 20,
            boxShadow: "0 4px 24px rgba(42,110,94,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                background: "#e8f5f1",
                borderRadius: 100,
                padding: "5px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <CheckCircle size={13} color="#2a6e5e" />
              <span
                style={{
                  fontSize: 11,
                  color: "#2a6e5e",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                ANALISIS SELESAI
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginLeft: "auto",
              }}
            >
              <Clock size={12} color="#b0cec7" />
              <span style={{ fontSize: 12, color: "#b0cec7" }}>
                {formattedDate}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 12,
                color: "#7a9e96",
                marginBottom: 6,
                letterSpacing: "0.04em",
                fontWeight: 500,
              }}
            >
              KEMUNGKINAN KONDISI
            </div>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 44,
                fontWeight: 600,
                color: "#0f2420",
                lineHeight: 1.1,
                marginBottom: 8,
              }}
            >
              {result.disease}
            </h1>
            <div style={{ fontSize: 14, color: "#5a7870" }}>
              Disarankan berkonsultasi dengan{" "}
              <span style={{ color: "#2a6e5e", fontWeight: 500 }}>
                {result.specialist}
              </span>
            </div>
          </div>

          <ConfidenceMeter
            value={result.confidence}
            label="Confidence Score (Naive Bayes)"
          />
        </div>

        {/* Tips */}
        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: "28px 36px",
            border: "1px solid #e8f5f1",
            marginBottom: 20,
            boxShadow: "0 4px 24px rgba(42,110,94,0.04)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0f2420",
              marginBottom: 18,
              letterSpacing: "0.02em",
            }}
          >
            Rekomendasi Awal
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.tips.map((tip, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: "#e8f5f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <span
                    style={{ fontSize: 11, color: "#2a6e5e", fontWeight: 600 }}
                  >
                    {i + 1}
                  </span>
                </div>
                <span
                  style={{ fontSize: 14, color: "#3d6058", lineHeight: 1.6 }}
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
            background: "#fffbeb",
            borderRadius: 16,
            padding: "20px 24px",
            border: "1px solid #fde68a",
            marginBottom: 28,
            display: "flex",
            gap: 14,
          }}
        >
          <AlertTriangle
            size={18}
            color="#d97706"
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#92400e",
                marginBottom: 4,
              }}
            >
              Pernyataan Medis Penting
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#78350f",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Hasil analisis ini bukan merupakan diagnosis medis yang definitif
              dan tidak dapat menggantikan pemeriksaan langsung oleh tenaga
              medis profesional. Segera konsultasikan dengan dokter untuk
              mendapatkan diagnosis dan penanganan yang tepat, terutama jika
              gejala memburuk.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button
            onClick={onBook}
            style={{
              flex: 1,
              minWidth: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "16px 28px",
              borderRadius: 14,
              background: "#2a6e5e",
              border: "none",
              color: "white",
              fontSize: 15,
              fontWeight: 500,
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
            Buat Janji Temu <ArrowRight size={16} />
          </button>
          <button
            onClick={onHome}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 24px",
              borderRadius: 14,
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
            <Home size={15} /> Beranda
          </button>
          <button
            onClick={onRetry}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 24px",
              borderRadius: 14,
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
            <RotateCcw size={15} /> Periksa Ulang
          </button>
        </div>
      </div>
    </div>
  );
}
