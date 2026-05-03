import { useEffect, useRef, useState } from "react";
import {
  Brain,
  BarChart3,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  Thermometer,
  Wind,
  Zap,
  Droplets,
  Activity,
} from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";

interface LandingPageProps {
  onStartChat: () => void;
  onLogin: () => void;
}

const DOCTORS = [
  {
    name: "Dr. Sari Dewi, Sp.PD",
    specialty: "Dokter Umum",
    rating: 4.9,
    patients: "1.2k+",
    available: "Tersedia hari ini",
    img: "/assets/dokter-1.jpg",
  },
  {
    name: "Dr. Ahmad Rizal, Sp.PD",
    specialty: "Penyakit Dalam",
    rating: 4.8,
    patients: "980+",
    available: "Tersedia hari ini",
    img: "/assets/dokter-2.jpg",
  },
  {
    name: "Dr. Citra Putri, Sp.P",
    specialty: "Spesialis Paru",
    rating: 4.9,
    patients: "870+",
    available: "Tersedia besok",
    img: "/assets/dokter-3.jpg",
  },
  {
    name: "Dr. Budi Santoso, Sp.S",
    specialty: "Spesialis Saraf",
    rating: 4.7,
    patients: "760+",
    available: "Tersedia hari ini",
    img: "/assets/dokter-4.jpg",
  },
];

const DISEASES = [
  {
    label: "Influenza",
    desc: "Demam, pilek, dan nyeri tubuh akibat infeksi virus",
    icon: Wind,
    color: "#3b82f6",
  },
  {
    label: "Demam",
    desc: "Peningkatan suhu tubuh di atas batas normal (>37.5°C)",
    icon: Thermometer,
    color: "#f59e0b",
  },
  {
    label: "Batuk",
    desc: "Batuk berdahak atau kering akibat infeksi atau iritasi",
    icon: Activity,
    color: "#8b5cf6",
  },
  {
    label: "Maag",
    desc: "Nyeri lambung, mual, dan gangguan pencernaan",
    icon: Droplets,
    color: "#ec4899",
  },
  {
    label: "Sakit Kepala",
    desc: "Nyeri kepala, migrain, atau tension headache",
    icon: Zap,
    color: "#f97316",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Analisis AI Cerdas",
    desc: "Teknologi Naive Bayes & Decision Tree menganalisis gejala Anda dengan presisi tinggi dan memberikan hasil yang akurat.",
  },
  {
    icon: BarChart3,
    title: "Confidence Score",
    desc: "Setiap hasil dilengkapi dengan persentase tingkat kepercayaan agar Anda dapat memahami akurasi analisis dengan jelas.",
  },
  {
    icon: CalendarCheck,
    title: "Booking Dokter Spesialis",
    desc: "Langsung terhubung dengan dokter yang tepat sesuai hasil analisis Anda, dan pilih jadwal yang paling nyaman.",
  },
  {
    icon: ShieldCheck,
    title: "Data Terlindungi",
    desc: "Semua informasi kesehatan Anda terenkripsi dan dijaga kerahasiaannya sesuai standar privasi medis.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Ceritakan Gejala",
    desc: "Ketik keluhan Anda di chat AI kami. Tidak perlu login terlebih dahulu.",
  },
  {
    num: "02",
    title: "Dapatkan Analisis",
    desc: "AI menganalisis gejala dan memberikan hasil beserta confidence score.",
  },
  {
    num: "03",
    title: "Temui Dokter",
    desc: "Booking jadwal dengan dokter spesialis yang sesuai dengan keluhan Anda.",
  },
];

function AnimatedStat({
  value,
  suffix,
  label,
}: {
  value: number;
  suffix: string;
  label: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const step = value / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= value) {
            setCount(value);
            clearInterval(timer);
          } else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 40,
          fontWeight: 600,
          color: "#2a6e5e",
          lineHeight: 1,
        }}
      >
        {count.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#7a9e96",
          marginTop: 6,
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function LandingPage({ onStartChat }: LandingPageProps) {
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* ─── HERO ─── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg, #ffffff 55%, #e8f5f1 100%)",
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background circle decor */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(42,110,94,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(42,110,94,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "70px 32px",
            width: "100%",
          }}
        >
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#e8f5f1",
                  border: "1px solid #c8dfd8",
                  borderRadius: 100,
                  padding: "6px 14px",
                  marginBottom: 28,
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
                    color: "#2a6e5e",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                  }}
                >
                  AI-POWERED MEDICAL SCREENING
                </span>
              </div>

              <h1
                style={{
                 fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(36px, 4vw, 56px)",
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: "#0f2420",
                  marginBottom: 20,
                  // whiteSpace: "nowrap",
                  maxWidth: 520,
                  // overflow: "hidden",
                  // textOverflow: "ellipsis",
                }}
              >
                Periksa Gejala Anda
                <span
                  style={{
                    color: "#2a6e5e",
                    fontStyle: "italic",
                    display: "block",
                  }}
                >
                  Dengan Kecerdasan Buatan
                </span>
              </h1>

              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: "#5a7870",
                  marginBottom: 36,
                  maxWidth: 460,
                }}
              >
                MediCheck menganalisis keluhan Anda secara akurat dan
                menghubungkan Anda dengan dokter spesialis yang tepat — tanpa
                perlu antre, tanpa perlu login terlebih dahulu.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  marginBottom: 40,
                }}
              >
                <button
                  onClick={onStartChat}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 28px",
                    borderRadius: 14,
                    background: "#2a6e5e",
                    border: "none",
                    color: "white",
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif",
                    boxShadow: "0 4px 16px rgba(42,110,94,0.35)",
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
                  Mulai Pemeriksaan Gratis <ArrowRight size={16} />
                </button>
                <a
                  href="#fitur"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 24px",
                    borderRadius: 14,
                    border: "1.5px solid #c8dfd8",
                    background: "transparent",
                    color: "#3d6058",
                    fontSize: 15,
                    fontWeight: 500,
                    textDecoration: "none",
                    fontFamily: "'Outfit', sans-serif",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e8f5f1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>

              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  "Tanpa biaya pendaftaran",
                  "Tidak perlu login untuk mulai",
                  "Hasil instan",
                ].map((t) => (
                  <div
                    key={t}
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <CheckCircle2 size={14} color="#2a6e5e" />
                    <span style={{ fontSize: 13, color: "#5a7870" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Chat mockup */}
            <div className="hidden md:block">
              <div
                style={{
                  background: "white",
                  borderRadius: 24,
                  padding: 24,
                  maxWidth: 380,
                  margin: "0 auto",
                  boxShadow: "0 24px 64px rgba(42,110,94,0.14)",
                  border: "1px solid #e8f5f1",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: "1px solid #f0f9f6",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
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
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0f2420",
                      }}
                    >
                      Asisten Medis AI
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#22c55e",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "#7a9e96" }}>
                        Online sekarang
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      background: "#f8fcfa",
                      borderRadius: "4px 16px 16px 16px",
                      padding: "10px 14px",
                      maxWidth: "85%",
                      border: "1px solid #e8f5f1",
                      fontSize: 13,
                      color: "#3d6058",
                      lineHeight: 1.5,
                    }}
                  >
                    Halo! Ceritakan keluhan utama Anda. Saya siap membantu.
                  </div>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #2a6e5e, #3d9e86)",
                      borderRadius: "16px 4px 16px 16px",
                      padding: "10px 14px",
                      maxWidth: "80%",
                      alignSelf: "flex-end",
                      fontSize: 13,
                      color: "white",
                      lineHeight: 1.5,
                    }}
                  >
                    Saya pusing dan demam tinggi sejak kemarin.
                  </div>
                  <div
                    style={{
                      background: "#f8fcfa",
                      borderRadius: "4px 16px 16px 16px",
                      padding: "10px 14px",
                      maxWidth: "85%",
                      border: "1px solid #e8f5f1",
                      fontSize: 13,
                      color: "#3d6058",
                      lineHeight: 1.5,
                    }}
                  >
                    Baik, saya memahami. Seberapa parah gejalanya pada skala
                    1–10?
                  </div>
                </div>

                {/* Result preview */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #e8f5f1, #d0e9e0)",
                    borderRadius: 14,
                    padding: 14,
                    border: "1px solid #c8dfd8",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "#2a6e5e",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                    }}
                  >
                    HASIL ANALISIS
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#0f2420",
                        fontFamily: "'Cormorant Garamond', serif",
                      }}
                    >
                      Demam
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#2a6e5e",
                      }}
                    >
                      87% akurasi
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#c8dfd8",
                      borderRadius: 100,
                      height: 6,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "87%",
                        height: "100%",
                        background: "linear-gradient(90deg, #3d9e86, #2a6e5e)",
                        borderRadius: 100,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section style={{ background: "#0f2420", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value={12000} suffix="+" label="Pasien Terskrining" />
            <AnimatedStat value={50} suffix="+" label="Dokter Spesialis" />
            <AnimatedStat value={95} suffix="%" label="Tingkat Akurasi AI" />
            <AnimatedStat
              value={3}
              suffix=" mnt"
              label="Waktu Analisis Rata-rata"
            />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="fitur" style={{ padding: "96px 24px", background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                display: "inline-block",
                background: "#e8f5f1",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#2a6e5e",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                }}
              >
                CARA KERJA
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 42,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 12,
              }}
            >
              Tiga Langkah Mudah
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#5a7870",
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              Dari keluhan hingga bertemu dokter, semuanya bisa selesai dalam
              beberapa menit.
            </p>
          </div>

          <div
            className="grid md:grid-cols-3 gap-8"
            style={{ position: "relative" }}
          >
            {STEPS.map((step, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 32,
                  border: "1px solid #e8f5f1",
                  position: "relative",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(42,110,94,0.1)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 56,
                    fontWeight: 700,
                    color: "#e8f5f1",
                    lineHeight: 1,
                    marginBottom: 16,
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#0f2420",
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: "#5a7870", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block"
                    style={{
                      position: "absolute",
                      right: -20,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                    }}
                  >
                    <ChevronRight size={20} color="#c8dfd8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section style={{ padding: "80px 24px", background: "#f8fcfa" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "inline-block",
                background: "#e8f5f1",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#2a6e5e",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                }}
              >
                FITUR UNGGULAN
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 42,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 12,
              }}
            >
              Dirancang untuk Ketenangan Pikiran
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: "white",
                    borderRadius: 20,
                    padding: 28,
                    border: "1px solid #e8f5f1",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 12px 36px rgba(42,110,94,0.1)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "#e8f5f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Icon size={22} color="#2a6e5e" />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#0f2420",
                      marginBottom: 10,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{ fontSize: 13, color: "#5a7870", lineHeight: 1.65 }}
                  >
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── DISEASES ─── */}
      <section style={{ padding: "80px 24px", background: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "inline-block",
                background: "#e8f5f1",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#2a6e5e",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                }}
              >
                CAKUPAN PENYAKIT
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 42,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 12,
              }}
            >
              Apa yang Dapat Kami Deteksi
            </h2>
            <p style={{ fontSize: 15, color: "#5a7870" }}>
              AI kami terlatih mengenali pola dari 5 kondisi medis umum yang
              sering dialami masyarakat.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {DISEASES.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: "white",
                    borderRadius: 18,
                    padding: "24px 20px",
                    border: "1px solid #e8f5f1",
                    textAlign: "center",
                    transition: "all 0.25s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 12px 32px ${d.color}18`;
                    e.currentTarget.style.borderColor = `${d.color}30`;
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#e8f5f1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: `${d.color}12`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <Icon size={24} color={d.color} />
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0f2420",
                      marginBottom: 8,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {d.label}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#7a9e96", lineHeight: 1.5 }}
                  >
                    {d.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── DOCTORS ─── */}
      <section
        id="dokter"
        style={{ padding: "80px 24px", background: "#f8fcfa" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "inline-block",
                background: "#e8f5f1",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "#2a6e5e",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                }}
              >
                TIM DOKTER
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 42,
                fontWeight: 600,
                color: "#0f2420",
                marginBottom: 12,
              }}
            >
              Dokter Terverifikasi & Berpengalaman
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCTORS.map((doc, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid #e8f5f1",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(42,110,94,0.12)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    position: "relative",
                    height: 200,
                    overflow: "hidden",
                  }}
                >
                  <ImageWithFallback
                    src={doc.img}
                    alt={doc.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: 10,
                      background: "#22c55e",
                      borderRadius: 100,
                      padding: "3px 10px",
                      fontSize: 11,
                      color: "white",
                      fontWeight: 500,
                    }}
                  >
                    {doc.available}
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0f2420",
                      marginBottom: 3,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {doc.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#2a6e5e",
                      fontWeight: 500,
                      marginBottom: 12,
                    }}
                  >
                    {doc.specialty}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: 12, color: "#5a7870" }}>
                        {doc.rating} ({doc.patients} pasien)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        style={{
          padding: "96px 24px",
          background: "linear-gradient(135deg, #0f2420 0%, #1a4035 100%)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 48,
              fontWeight: 600,
              color: "white",
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            Mulai Pemeriksaan
            <br />
            <span style={{ color: "#5ecfb1", fontStyle: "italic" }}>
              Sekarang, Gratis
            </span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#7a9e96",
              marginBottom: 36,
              lineHeight: 1.7,
            }}
          >
            Tidak perlu login. Tidak perlu kartu kredit. Dapatkan analisis
            gejala Anda dalam hitungan menit.
          </p>
          <button
            onClick={onStartChat}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 36px",
              borderRadius: 16,
              background: "white",
              border: "none",
              color: "#0f2420",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 4px 24px rgba(255,255,255,0.15)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 24px rgba(255,255,255,0.15)";
            }}
          >
            Mulai Pemeriksaan Gratis <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        id="tentang"
        style={{ background: "#0a1c18", padding: "48px 24px 32px" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
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
                      fontSize: 18,
                    }}
                  >
                    M
                  </span>
                </div>
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: 17,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  MediCheck
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#7a9e96",
                  lineHeight: 1.7,
                  maxWidth: 260,
                }}
              >
                Platform pemeriksaan gejala berbasis AI yang membantu Anda
                mendapatkan informasi kesehatan awal yang akurat.
              </p>
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#5ecfb1",
                  marginBottom: 14,
                  letterSpacing: "0.05em",
                }}
              >
                LAYANAN
              </div>
              {[
                "Pemeriksaan Gejala",
                "Booking Dokter",
                "Riwayat Pemeriksaan",
                "Konsultasi Online",
              ].map((t) => (
                <a
                  key={t}
                  href="#"
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "#7a9e96",
                    marginBottom: 8,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#5ecfb1")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#7a9e96")
                  }
                >
                  {t}
                </a>
              ))}
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#5ecfb1",
                  marginBottom: 14,
                  letterSpacing: "0.05em",
                }}
              >
                KONTAK
              </div>
              {[
                "support@medicheck.id",
                "+62 800 1234 5678",
                "Jakarta, Indonesia",
              ].map((t) => (
                <div
                  key={t}
                  style={{ fontSize: 13, color: "#7a9e96", marginBottom: 8 }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 12, color: "#4a6e68" }}>
              © 2026 MediCheck. Semua hak dilindungi.
            </span>
            <span style={{ fontSize: 12, color: "#4a6e68" }}>
              Bukan pengganti diagnosis medis profesional.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
