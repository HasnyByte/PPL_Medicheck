"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, AlertTriangle, CheckCircle, Clock, Phone } from "lucide-react";
import type { ScreeningResult, User } from "../app/App";
import { doctors as doctorsApi, type DoctorPublic } from "@/lib/api";

interface ResultSectionProps {
  result: ScreeningResult;
  user?: User | null;
  onBook: () => void;
  onBack: () => void;
  onNewScreening: () => void;
}

const G = "#2a6e5e";

function DoctorCard({ doctor, onBook }: { doctor: DoctorPublic; onBook: () => void }) {
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "16px 18px", border: "1px solid #e8f5f1", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${G}, #5ecfb1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "white", flexShrink: 0 }}>
          {doctor.name.charAt(4)?.toUpperCase() || "D"}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2420" }}>{doctor.name}</div>
          <div style={{ fontSize: 12, color: G, fontWeight: 500 }}>{doctor.specialist}</div>
          <div style={{ fontSize: 11, color: "#7a9e96" }}>{doctor.hospital}</div>
          {doctor.experience && <div style={{ fontSize: 11, color: "#9ca3af" }}>{doctor.experience} tahun pengalaman</div>}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {doctor.consultationFee && (
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2420", marginBottom: 8 }}>
            Rp {doctor.consultationFee.toLocaleString("id-ID")}
          </div>
        )}
        <button onClick={onBook}
          style={{ background: G, color: "white", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
          Buat Janji
        </button>
      </div>
    </div>
  );
}

export function ResultSection({ result, user, onBook, onBack, onNewScreening }: ResultSectionProps) {
  const [recommendedDoctors, setRecommendedDoctors] = useState<DoctorPublic[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        // Filter by specialist code that matches the AI recommendation
        const all = await doctorsApi.list(
          result.specialistCode && result.specialistCode !== "umum"
            ? { specialistCode: result.specialistCode }
            : {}
        );
        setRecommendedDoctors(all.slice(0, 3));
      } catch {
        // Try unfiltered
        try {
          const all = await doctorsApi.list();
          setRecommendedDoctors(all.slice(0, 3));
        } catch {}
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, [result.specialistCode]);

  const confidenceColor = result.confidence >= 80 ? "#22c55e" : result.confidence >= 60 ? "#d97706" : "#ef4444";
  const confidenceLabel = result.confidence >= 80 ? "Tinggi" : result.confidence >= 60 ? "Sedang" : "Rendah";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0f9f6,#e8f5f1)", paddingTop: 80 }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #c8dfd8", borderRadius: 10, padding: "8px 14px", cursor: "pointer", marginBottom: 20, fontSize: 13, color: "#5a7870", fontFamily: "'Outfit',sans-serif" }}>
          <ArrowLeft size={14} /> Kembali
        </button>

        {result.isEmergency && (
          <div style={{ background: "#fee2e2", border: "2px solid #ef4444", borderRadius: 16, padding: 20, marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>⚠️ Kondisi Darurat Terdeteksi!</div>
              <div style={{ fontSize: 13, color: "#7f1d1d", marginBottom: 12 }}>Gejala Anda memerlukan penanganan segera. Segera hubungi layanan darurat atau pergi ke IGD terdekat.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="tel:119" style={{ background: "#dc2626", color: "white", borderRadius: 10, padding: "10px 20px", textDecoration: "none", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={14} /> Hubungi 119 IGD
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Result card */}
        <div style={{ background: "white", borderRadius: 22, padding: "28px 32px", border: "1px solid #e8f5f1", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: "#7a9e96", fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Hasil Analisis AI</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#0f2420", lineHeight: 1.2 }}>{result.disease}</h2>
              <div style={{ fontSize: 14, color: G, fontWeight: 500, marginTop: 6 }}>Rekomendasi: {result.specialist}</div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: 22, background: `${confidenceColor}12`, border: `2.5px solid ${confidenceColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: confidenceColor, fontFamily: "'Cormorant Garamond',serif" }}>{result.confidence}%</div>
                <div style={{ fontSize: 9, color: confidenceColor, fontWeight: 600 }}>{confidenceLabel}</div>
              </div>
            </div>
          </div>

          <div style={{ background: "#f8fcfa", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#3d6058", marginBottom: 8 }}>Gejala yang dilaporkan:</div>
            <div style={{ fontSize: 13, color: "#1a2e28" }}>{result.symptoms}</div>
          </div>

          {/* Tips */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2420", marginBottom: 12 }}>💡 Saran Kesehatan</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <CheckCircle size={14} color={G} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: "#3d6058", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, padding: "12px 14px", background: "#fffbeb", borderRadius: 10, border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 11, color: "#92400e" }}>⚠️ Hasil analisis ini bersifat indikatif dan bukan pengganti diagnosis dokter. Konsultasikan dengan dokter untuk diagnosis yang akurat.</div>
          </div>
        </div>

        {/* Recommended Doctors */}
        <div style={{ background: "white", borderRadius: 22, padding: "24px 28px", border: "1px solid #e8f5f1", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2420", marginBottom: 4 }}>Dokter yang Direkomendasikan</h3>
          <p style={{ fontSize: 12, color: "#7a9e96", marginBottom: 16 }}>
            Berdasarkan hasil screening, berikut dokter <strong>{result.specialist}</strong> yang tersedia:
          </p>
          {loadingDoctors ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#7a9e96", fontSize: 13 }}>Memuat daftar dokter...</div>
          ) : recommendedDoctors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#7a9e96", fontSize: 13 }}>Tidak ada dokter tersedia saat ini</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recommendedDoctors.map(doc => (
                <DoctorCard key={doc.id} doctor={doc} onBook={onBook} />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button onClick={onNewScreening}
            style={{ padding: "14px 0", borderRadius: 14, border: `2px solid ${G}`, background: "white", color: G, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <RotateCcw size={15} /> Pemeriksaan Baru
          </button>
          <button onClick={onBook}
            style={{ padding: "14px 0", borderRadius: 14, border: "none", background: G, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Buat Janji Dokter <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
