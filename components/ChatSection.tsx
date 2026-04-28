import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, AlertTriangle, Phone } from "lucide-react";
import type { ScreeningResult } from "../app/App";

interface ChatSectionProps {
  onComplete: (result: ScreeningResult) => void;
  onBack: () => void;
}

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  quickReplies?: string[];
  timestamp: Date;
}

type ChatStage =
  | "greeting"
  | "awaiting_complaint"
  | "asking_severity"
  | "asking_duration"
  | "asking_additional"
  | "analyzing"
  | "complete";

const EMERGENCY_KEYWORDS = [
  "nyeri dada",
  "sesak napas berat",
  "pingsan",
  "lumpuh",
  "tidak sadar",
  "stroke",
  "serangan jantung",
];

const DISEASE_MAP: Record<
  string,
  {
    name: string;
    specialist: string;
    specialistCode: string;
    tips: string[];
    keywords: string[];
  }
> = {
  flu: {
    name: "Influenza (Flu)",
    specialist: "Dokter Umum",
    specialistCode: "umum",
    tips: [
      "Istirahat cukup minimal 7–8 jam per malam",
      "Perbanyak konsumsi cairan hangat",
      "Konsumsi makanan bergizi untuk memperkuat imunitas",
      "Hindari kontak dekat untuk mencegah penularan",
    ],
    keywords: [
      "flu",
      "pilek",
      "bersin",
      "hidung tersumbat",
      "ingusan",
      "meriang",
      "badan pegal",
      "rinorea",
    ],
  },
  demam: {
    name: "Demam (Febris)",
    specialist: "Dokter Umum",
    specialistCode: "umum",
    tips: [
      "Kompres hangat pada dahi dan ketiak",
      "Perbanyak minum untuk mencegah dehidrasi",
      "Gunakan pakaian tipis dan nyaman",
      "Pantau suhu tubuh secara berkala — bila >39°C segera ke dokter",
    ],
    keywords: [
      "demam",
      "panas",
      "suhu tinggi",
      "menggigil",
      "keringat dingin",
      "badan panas",
      "febris",
      "panas tinggi",
    ],
  },
  batuk: {
    name: "Batuk (Bronkitis)",
    specialist: "Spesialis Paru",
    specialistCode: "paru",
    tips: [
      "Minum air hangat dengan madu dan lemon",
      "Hindari paparan asap rokok dan debu",
      "Istirahat suara — kurangi berbicara keras",
      "Hindari makanan berminyak dan terlalu dingin",
    ],
    keywords: [
      "batuk",
      "dahak",
      "berdahak",
      "tenggorokan gatal",
      "radang tenggorokan",
      "batuk-batuk",
      "gatal di tenggorokan",
    ],
  },
  maag: {
    name: "Gastritis (Maag)",
    specialist: "Spesialis Gastroenterologi",
    specialistCode: "gastro",
    tips: [
      "Makan dalam porsi kecil namun lebih sering (5–6x sehari)",
      "Hindari makanan pedas, asam, dan berminyak",
      "Hindari minuman berkafein dan bersoda",
      "Jangan berbaring segera setelah makan",
    ],
    keywords: [
      "maag",
      "lambung",
      "mual",
      "kembung",
      "nyeri ulu hati",
      "asam lambung",
      "perut perih",
      "mulas",
      "ulu hati",
      "perut sakit",
      "gastritis",
    ],
  },
  kepala: {
    name: "Sakit Kepala (Cephalgia)",
    specialist: "Spesialis Saraf",
    specialistCode: "saraf",
    tips: [
      "Beristirahat di ruangan yang tenang dan redup",
      "Kompres dingin atau hangat di dahi",
      "Cukupi kebutuhan cairan — dehidrasi sering memicu sakit kepala",
      "Atur posisi duduk dan tidur yang ergonomis",
    ],
    keywords: [
      "sakit kepala",
      "pusing",
      "migrain",
      "kepala berdenyut",
      "kepala berat",
      "vertigo",
      "kepala sakit",
      "nyeri kepala",
      "cephalgia",
    ],
  },
};

function detectDisease(text: string): { key: string; score: number } {
  const norm = text.toLowerCase();
  const results = Object.entries(DISEASE_MAP).map(([key, d]) => ({
    key,
    score: d.keywords.filter((kw) => norm.includes(kw)).length,
  }));
  results.sort((a, b) => b.score - a.score);
  return results[0];
}

function calcConfidence(
  baseScore: number,
  severity: string,
  duration: string,
): number {
  let c = baseScore > 0 ? 62 + baseScore * 8 : 55;
  if (severity === "Berat (7–9)" || severity === "Sangat Berat (10)") c += 6;
  if (duration === "4–7 hari" || duration === "Lebih dari seminggu") c += 4;
  return Math.min(94, Math.max(58, c));
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: "linear-gradient(135deg, #2a6e5e, #3d9e86)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 14,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
          }}
        >
          M
        </span>
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(200,223,216,0.5)",
          borderRadius: "4px 16px 16px 16px",
          padding: "12px 16px",
          boxShadow: "0 2px 12px rgba(42,110,94,0.06)",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#2a6e5e",
              animation: "bounce 1.2s infinite ease-in-out",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatSection({ onComplete, onBack }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stage, setStage] = useState<ChatStage>("greeting");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [detectedKey, setDetectedKey] = useState("");
  const [detectedScore, setDetectedScore] = useState(0);
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollBottom = useCallback(() => {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  }, []);

  const addAiMessage = useCallback(
    (content: string, quickReplies?: string[], delay = 900) => {
      setIsTyping(true);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "ai",
              content,
              quickReplies,
              timestamp: new Date(),
            },
          ]);
          scrollBottom();
          resolve();
        }, delay);
      });
    },
    [scrollBottom],
  );

  const addUserMessage = useCallback(
    (content: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content,
          timestamp: new Date(),
        },
      ]);
      scrollBottom();
    },
    [scrollBottom],
  );

  // Initialize
  useEffect(() => {
    (async () => {
      await addAiMessage(
        "Selamat datang di MediCheck. Saya adalah Asisten Medis AI yang siap membantu Anda melakukan pemeriksaan gejala awal.",
        undefined,
        600,
      );
      await addAiMessage(
        "Silakan ceritakan keluhan utama yang Anda rasakan saat ini. Jelaskan gejala sejelas mungkin untuk hasil yang lebih akurat.",
        undefined,
        700,
      );
      setStage("awaiting_complaint");
    })();
  }, []);

  const handleUserInput = useCallback(
    async (text: string) => {
      if (!text.trim() || stage === "analyzing" || stage === "complete") return;
      addUserMessage(text);
      setInput("");

      const norm = text.toLowerCase();

      // Emergency check
      if (EMERGENCY_KEYWORDS.some((kw) => norm.includes(kw))) {
        setIsEmergency(true);
        setStage("complete");
        await addAiMessage(
          "Perhatian: Saya mendeteksi kata kunci yang mengindikasikan kondisi darurat medis. Mohon segera hubungi layanan darurat atau menuju IGD/UGD terdekat.",
          undefined,
          500,
        );
        return;
      }

      if (stage === "awaiting_complaint") {
        const detected = detectDisease(text);
        setDetectedKey(detected.key);
        setDetectedScore(detected.score);
        await addAiMessage(
          "Terima kasih atas informasinya. Saya memahami keluhan Anda.",
          undefined,
          700,
        );
        await addAiMessage(
          "Seberapa parah keluhan yang Anda rasakan saat ini?",
          ["Ringan (1–3)", "Sedang (4–6)", "Berat (7–9)", "Sangat Berat (10)"],
          600,
        );
        setStage("asking_severity");
      } else if (stage === "asking_severity") {
        setSeverity(text);
        await addAiMessage(
          "Sudah berapa lama Anda merasakan keluhan ini?",
          ["Baru hari ini", "1–3 hari", "4–7 hari", "Lebih dari seminggu"],
          600,
        );
        setStage("asking_duration");
      } else if (stage === "asking_duration") {
        setDuration(text);
        const additionalOptions: Record<string, string[]> = {
          flu: [
            "Demam ringan",
            "Badan terasa pegal",
            "Sakit kepala",
            "Tidak ada tambahan",
          ],
          demam: [
            "Menggigil",
            "Berkeringat berlebihan",
            "Mual",
            "Tidak ada tambahan",
          ],
          batuk: [
            "Sesak ringan",
            "Nyeri dada ringan",
            "Demam",
            "Tidak ada tambahan",
          ],
          maag: [
            "Kembung",
            "Mual dan muntah",
            "Nyeri ulu hati",
            "Tidak ada tambahan",
          ],
          kepala: [
            "Mual",
            "Sensitif terhadap cahaya",
            "Leher kaku",
            "Tidak ada tambahan",
          ],
        };
        const opts = additionalOptions[detectedKey] || [
          "Demam",
          "Mual",
          "Badan lemas",
          "Tidak ada tambahan",
        ];
        await addAiMessage(
          "Apakah Anda merasakan gejala tambahan berikut? (pilih salah satu atau ketik jawaban Anda)",
          opts,
          600,
        );
        setStage("asking_additional");
      } else if (stage === "asking_additional") {
        // Analyze
        setStage("analyzing");
        await addAiMessage(
          "Baik, saya memiliki cukup informasi. Sedang menganalisis gejala Anda...",
          undefined,
          500,
        );
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, 2800));
        setIsTyping(false);

        const conf = calcConfidence(detectedScore, severity, duration);
        const disease = DISEASE_MAP[detectedKey] || DISEASE_MAP["demam"];

        const result: ScreeningResult = {
          disease: disease.name,
          confidence: conf,
          tips: disease.tips,
          specialist: disease.specialist,
          specialistCode: disease.specialistCode,
          isEmergency: false,
          symptoms: text,
          timestamp: new Date(),
        };

        await addAiMessage(
          `Analisis selesai. Berdasarkan gejala yang Anda sampaikan, AI kami mendeteksi kemungkinan kondisi: ${disease.name} dengan tingkat kepercayaan ${conf}%.`,
          undefined,
          400,
        );
        await addAiMessage(
          "Lihat hasil lengkap beserta rekomendasi awal dan pilihan dokter spesialis di halaman hasil.",
          undefined,
          600,
        );
        setStage("complete");
        setTimeout(() => onComplete(result), 1200);
      }
    },
    [
      stage,
      messages,
      detectedKey,
      detectedScore,
      severity,
      duration,
      addAiMessage,
      addUserMessage,
      onComplete,
    ],
  );

  const handleSend = () => {
    if (input.trim()) handleUserInput(input.trim());
  };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(160deg, #f8fcfa 0%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Emergency Banner */}
      {isEmergency && (
        <div
          style={{
            background: "linear-gradient(90deg, #dc2626, #ef4444)",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AlertTriangle size={18} color="white" />
            <span style={{ color: "white", fontSize: 14, fontWeight: 500 }}>
              Kondisi darurat terdeteksi — Segera hubungi layanan gawat darurat
            </span>
          </div>
          <a
            href="tel:119"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "white",
              color: "#dc2626",
              padding: "8px 16px",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Phone size={14} /> Hubungi 119
          </a>
        </div>
      )}

      {/* Chat Header */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e8f5f1",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "#f0f9f6",
            cursor: "pointer",
            padding: 8,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={16} color="#2a6e5e" />
        </button>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg, #2a6e5e, #3d9e86)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "white",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            M
          </span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f2420" }}>
            Asisten Medis AI
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <span style={{ fontSize: 12, color: "#7a9e96" }}>
              {stage === "analyzing" ? "Menganalisis..." : "Online"}
            </span>
          </div>
        </div>
        <div
          className="ml-auto"
          style={{
            fontSize: 12,
            color: "#c8dfd8",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              background: "#f0f9f6",
              borderRadius: 100,
              padding: "4px 12px",
              fontSize: 11,
              color: "#5a7870",
            }}
          >
            Screening Gejala
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          maxWidth: 780,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
              gap: 10,
              animation: "fadeIn 0.3s ease",
            }}
          >
            {msg.role === "ai" && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #2a6e5e, #3d9e86)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 700,
                  }}
                >
                  M
                </span>
              </div>
            )}

            <div
              style={{
                maxWidth: "72%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={
                  msg.role === "ai"
                    ? {
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(200,223,216,0.6)",
                        borderRadius: "4px 16px 16px 16px",
                        padding: "12px 16px",
                        boxShadow: "0 2px 12px rgba(42,110,94,0.06)",
                        fontSize: 14,
                        color: "#1a2e28",
                        lineHeight: 1.6,
                      }
                    : {
                        background: "linear-gradient(135deg, #2a6e5e, #3d9e86)",
                        borderRadius: "16px 4px 16px 16px",
                        padding: "12px 16px",
                        fontSize: 14,
                        color: "white",
                        lineHeight: 1.6,
                        boxShadow: "0 2px 12px rgba(42,110,94,0.22)",
                      }
                }
              >
                {msg.content}
              </div>

              {msg.quickReplies &&
                msg.quickReplies.length > 0 &&
                stage !== "analyzing" &&
                stage !== "complete" && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    {msg.quickReplies.map((r) => (
                      <button
                        key={r}
                        onClick={() => handleUserInput(r)}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 100,
                          border: "1.5px solid #c8dfd8",
                          background: "white",
                          color: "#2a6e5e",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: "'Outfit', sans-serif",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#e8f5f1";
                          e.currentTarget.style.borderColor = "#2a6e5e";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "white";
                          e.currentTarget.style.borderColor = "#c8dfd8";
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      {stage !== "complete" && !isEmergency && (
        <div
          style={{
            background: "white",
            borderTop: "1px solid #e8f5f1",
            padding: "16px 24px",
          }}
        >
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-end",
                background: "#f8fcfa",
                borderRadius: 16,
                border: "1.5px solid #c8dfd8",
                padding: "10px 14px",
                transition: "border-color 0.15s",
              }}
              onFocusCapture={(e) =>
                (e.currentTarget.style.borderColor = "#2a6e5e")
              }
              onBlurCapture={(e) =>
                (e.currentTarget.style.borderColor = "#c8dfd8")
              }
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={
                  stage === "analyzing"
                    ? "Menganalisis gejala Anda..."
                    : "Ketik keluhan atau pilih opsi di atas..."
                }
                disabled={stage === "analyzing"}
                rows={1}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  resize: "none",
                  fontSize: 14,
                  color: "#1a2e28",
                  fontFamily: "'Outfit', sans-serif",
                  lineHeight: 1.5,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || stage === "analyzing"}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: input.trim() ? "#2a6e5e" : "#c8dfd8",
                  border: "none",
                  cursor: input.trim() ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                <Send size={15} color="white" />
              </button>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#b0cec7",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Informasi yang Anda berikan hanya digunakan untuk analisis medis
              awal dan bersifat rahasia.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
