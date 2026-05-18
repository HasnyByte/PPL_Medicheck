"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, AlertTriangle, Phone, Loader2 } from "lucide-react";
import type { ScreeningResult, User } from "../app/App";
import { screenings as screeningsApi, ai } from "@/lib/api";

interface ChatSectionProps {
  onComplete: (result: ScreeningResult) => void;
  onBack: () => void;
  user?: User | null;
}

interface Message {
  id: string; role: "ai" | "user"; content: string;
  quickReplies?: string[]; timestamp: Date;
}

type ChatStage = "greeting" | "awaiting_complaint" | "asking_severity" | "asking_duration" | "asking_additional" | "analyzing" | "complete";

const EMERGENCY_KEYWORDS = ["nyeri dada", "sesak napas berat", "pingsan", "lumpuh", "tidak sadar", "stroke", "serangan jantung"];

export function ChatSection({ onComplete, onBack, user }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<ChatStage>("greeting");
  const [complaint, setComplaint] = useState("");
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session_${Date.now()}`);

  const addMsg = (role: "ai" | "user", content: string, quickReplies?: string[]) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, quickReplies, timestamp: new Date() }]);
  };

  useEffect(() => {
    const greeting = user
      ? `Halo, **${user.name}**! 👋 Selamat datang di MediCheck AI.\n\nSaya siap membantu menganalisis gejala Anda. Ceritakan keluhan utama yang Anda rasakan saat ini.`
      : `Halo! 👋 Selamat datang di MediCheck AI Screening.\n\nSaya akan membantu menganalisis gejala Anda dan memberikan rekomendasi dokter yang tepat. Ceritakan keluhan utama Anda.`;
    addMsg("ai", greeting);
    setStage("awaiting_complaint");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkEmergency = (text: string) => EMERGENCY_KEYWORDS.some(kw => text.toLowerCase().includes(kw));

  const analyzeWithAI = async (comp: string, sev: string, dur: string, add: string) => {
    setStage("analyzing");
    setLoading(true);
    addMsg("ai", "🔍 Menganalisis gejala Anda dengan AI...");

    try {
      const result = await ai.analyze({
        complaint: comp, severity: sev, duration: dur,
        additional_symptoms: add, user_id: user?.id,
      });

      // Save to DB
      try {
        await screeningsApi.create({
          userId: user?.id,
          disease: result.disease,
          confidence: Math.round(result.confidence),
          symptoms: comp,
          specialist: result.specialist,
          specialistCode: result.specialistCode,
          isEmergency: result.isEmergency,
          tips: result.tips,
        });
      } catch (saveErr) {
        console.warn("Could not save screening:", saveErr);
      }

      addMsg("ai", `✅ Analisis selesai! Hasil akan ditampilkan di halaman berikutnya.`);
      setTimeout(() => {
        onComplete({
          disease: result.disease,
          confidence: result.confidence,
          tips: result.tips,
          specialist: result.specialist,
          specialistCode: result.specialistCode,
          isEmergency: result.isEmergency,
          symptoms: comp,
          timestamp: new Date(),
        });
      }, 800);
    } catch (err) {
      console.error("AI analyze error:", err);
      // Fallback local
      const fallback = localFallback(comp);
      try {
        await screeningsApi.create({
          userId: user?.id, disease: fallback.disease,
          confidence: fallback.confidence, symptoms: comp,
          specialist: fallback.specialist, specialistCode: fallback.specialistCode,
          isEmergency: false, tips: fallback.tips,
        });
      } catch {}
      setTimeout(() => {
        onComplete({ ...fallback, symptoms: comp, isEmergency: false, timestamp: new Date() });
      }, 500);
    } finally {
      setLoading(false);
      setStage("complete");
    }
  };

  const localFallback = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("jantung") || lower.includes("dada")) return { disease: "Penyakit Jantung Koroner", confidence: 68, specialist: "Dokter Jantung (Sp.JP)", specialistCode: "jantung", tips: ["Segera periksakan ke dokter spesialis jantung", "Hindari aktivitas fisik berat", "Pantau tekanan darah", "Hindari makanan berlemak"] };
    if (lower.includes("paru") || lower.includes("batuk") || lower.includes("sesak")) return { disease: "Gangguan Paru (Bronkitis)", confidence: 70, specialist: "Dokter Paru (Sp.P)", specialistCode: "paru", tips: ["Minum air hangat dengan madu", "Hindari asap rokok", "Istirahat cukup", "Konsultasi dokter paru"] };
    if (lower.includes("maag") || lower.includes("lambung") || lower.includes("perut")) return { disease: "Gastritis (Maag)", confidence: 72, specialist: "Dokter Penyakit Dalam (Sp.PD)", specialistCode: "penyakit_dalam", tips: ["Makan teratur", "Hindari makanan pedas", "Hindari kafein", "Minum antasida sesuai saran dokter"] };
    return { disease: "Keluhan Umum", confidence: 60, specialist: "Dokter Umum", specialistCode: "umum", tips: ["Istirahat cukup", "Perbanyak minum air", "Pantau gejala", "Segera ke dokter jika memburuk"] };
  };

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    addMsg("user", msg);

    if (checkEmergency(msg)) {
      setIsEmergency(true);
      addMsg("ai", "🚨 **KONDISI DARURAT TERDETEKSI!**\n\nGejala yang Anda sebutkan memerlukan penanganan segera. **Segera hubungi IGD (119)** atau pergi ke rumah sakit terdekat sekarang!");
      return;
    }

    if (stage === "awaiting_complaint") {
      setComplaint(msg);
      setStage("asking_severity");
      addMsg("ai", "Baik, saya mengerti. Seberapa parah gejala ini mengganggu aktivitas Anda?", ["Ringan — masih bisa beraktivitas normal", "Sedang — agak terganggu aktivitas", "Berat — tidak bisa beraktivitas"]);
    } else if (stage === "asking_severity") {
      setSeverity(msg);
      setStage("asking_duration");
      addMsg("ai", "Sudah berapa lama Anda mengalami gejala ini?", ["Baru hari ini", "1–3 hari", "Lebih dari seminggu", "Lebih dari sebulan"]);
    } else if (stage === "asking_duration") {
      setDuration(msg);
      setStage("asking_additional");
      addMsg("ai", "Apakah ada gejala lain yang menyertai? Misalnya demam, mual, pusing, atau lainnya. (Ketik 'tidak ada' jika tidak ada)");
    } else if (stage === "asking_additional") {
      await analyzeWithAI(complaint, severity, duration, msg === "tidak ada" ? "" : msg);
    }
  }, [input, stage, complaint, severity, duration, loading, user]);

  const G = "#2a6e5e";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9f6 0%, #e8f5f1 100%)", paddingTop: 80 }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", height: "calc(100vh - 80px)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "white", border: "1px solid #c8dfd8", borderRadius: 10, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={16} color={G} />
          </button>
          <div style={{ background: `${G}18`, borderRadius: 10, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 13, color: G, fontWeight: 600 }}>MediCheck AI — Aktif</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 12 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              {m.role === "ai" && (
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8, flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 16 }}>🩺</span>
                </div>
              )}
              <div style={{ maxWidth: "78%" }}>
                <div style={{
                  background: m.role === "user" ? G : "white",
                  color: m.role === "user" ? "white" : "#1a2e28",
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "12px 16px", fontSize: 14, lineHeight: 1.6,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  whiteSpace: "pre-wrap",
                }}>
                  {m.content.split("**").map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>
                {m.quickReplies && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {m.quickReplies.map(qr => (
                      <button key={qr} onClick={() => handleSend(qr)}
                        style={{ background: "white", border: `1.5px solid ${G}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: G, cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: G, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 size={16} color="white" style={{ animation: "spin 1s linear infinite" }} />
              </div>
              <div style={{ background: "white", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: G, opacity: 0.4, animation: `bounce 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            </div>
          )}
          {isEmergency && (
            <div style={{ background: "#fee2e2", border: "2px solid #ef4444", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <AlertTriangle size={20} color="#dc2626" />
                <span style={{ fontWeight: 700, color: "#dc2626", fontSize: 15 }}>DARURAT — Segera Hubungi:</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href="tel:119" style={{ flex: 1, background: "#dc2626", color: "white", borderRadius: 10, padding: "10px 0", textAlign: "center", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Phone size={14} /> 119 - IGD
                </a>
                <a href="tel:112" style={{ flex: 1, background: "#dc2626", color: "white", borderRadius: 10, padding: "10px 0", textAlign: "center", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Phone size={14} /> 112 - Darurat
                </a>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!isEmergency && stage !== "analyzing" && stage !== "complete" && (
          <div style={{ display: "flex", gap: 10, paddingTop: 12, borderTop: "1px solid #e8f5f1" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ceritakan gejala Anda..."
              style={{ flex: 1, border: "1.5px solid #c8dfd8", borderRadius: 12, padding: "12px 16px", fontSize: 14, outline: "none", fontFamily: "'Outfit', sans-serif", color: "#1a2e28" }}
            />
            <button onClick={() => handleSend()} disabled={loading || !input.trim()}
              style={{ background: G, border: "none", borderRadius: 12, padding: "12px 16px", cursor: "pointer", opacity: loading || !input.trim() ? 0.5 : 1 }}>
              <Send size={18} color="white" />
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  );
}
