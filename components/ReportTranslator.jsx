"use client";

import { useState } from "react";

const TEAL = "#00c896";

const LANGUAGES = [
  { key: "hindi",     name: "Hindi",     native: "हिंदी",    flag: "🇮🇳" },
  { key: "marathi",   name: "Marathi",   native: "मराठी",    flag: "🇮🇳" },
  { key: "bengali",   name: "Bengali",   native: "বাংলা",    flag: "🇮🇳" },
  { key: "tamil",     name: "Tamil",     native: "தமிழ்",   flag: "🇮🇳" },
  { key: "telugu",    name: "Telugu",    native: "తెలుగు",  flag: "🇮🇳" },
  { key: "gujarati",  name: "Gujarati",  native: "ગુજરાતી", flag: "🇮🇳" },
  { key: "kannada",   name: "Kannada",   native: "ಕನ್ನಡ",   flag: "🇮🇳" },
  { key: "malayalam", name: "Malayalam", native: "മലയാളം",  flag: "🇮🇳" },
  { key: "punjabi",   name: "Punjabi",   native: "ਪੰਜਾਬੀ",  flag: "🇮🇳" },
  { key: "odia",      name: "Odia",      native: "ଓଡ଼ିଆ",   flag: "🇮🇳" },
];

export default function ReportTranslator({ reportText, medicines = [] }) {
  const [language, setLanguage] = useState("hindi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedLang = LANGUAGES.find((l) => l.key === language);

  const translate = async () => {
    if (!reportText || reportText.trim().length < 10) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reportText, medicines, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLangSelect = (key) => {
    setLanguage(key);
    setIsOpen(false);
    setResult(null);
    setError(null);
  };

  return (
    <div
      style={{
        marginTop: "24px",
        backgroundColor: "#0d0d0d",
        border: "1px solid #1f1f1f",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "20px" }}>🌐</span>
        <div>
          <p style={{ color: "#fff", fontWeight: "600", fontSize: "14px", margin: 0 }}>
            Explain in Indian Language
          </p>
          <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
            10 languages supported — simple explanation for every patient
          </p>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>

        {/* Language Grid */}
        <p style={{ color: "#555", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
          Select Language
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.key;
            return (
              <button
                key={lang.key}
                onClick={() => handleLangSelect(lang.key)}
                style={{
                  padding: "10px 6px",
                  borderRadius: "10px",
                  border: isSelected ? `2px solid ${TEAL}` : "1px solid #2a2a2a",
                  backgroundColor: isSelected ? `${TEAL}18` : "#111",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s",
                }}
              >
                <p
                  style={{
                    fontSize: "15px",
                    margin: "0 0 3px",
                    color: isSelected ? TEAL : "#aaa",
                    fontWeight: isSelected ? "700" : "400",
                    lineHeight: 1,
                  }}
                >
                  {lang.native}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    margin: 0,
                    color: isSelected ? TEAL : "#555",
                    fontWeight: isSelected ? "600" : "400",
                  }}
                >
                  {lang.name}
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected language indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            backgroundColor: `${TEAL}11`,
            border: `1px solid ${TEAL}33`,
            borderRadius: "10px",
            marginBottom: "14px",
          }}
        >
          <span style={{ fontSize: "16px" }}>✅</span>
          <p style={{ margin: 0, fontSize: "13px", color: TEAL, fontWeight: "500" }}>
            Translating to{" "}
            <strong>{selectedLang?.native}</strong>{" "}
            ({selectedLang?.name})
          </p>
        </div>

        {/* Translate Button */}
        <button
          onClick={translate}
          disabled={loading || !reportText}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "10px",
            border: "none",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loading || !reportText ? "not-allowed" : "pointer",
            backgroundColor: loading || !reportText ? "#1a1a1a" : TEAL,
            color: loading || !reportText ? "#444" : "#000",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {loading ? (
            <>
              <SpinnerIcon />
              Translating to {selectedLang?.native}...
            </>
          ) : (
            `🌐 Explain in ${selectedLang?.native} (${selectedLang?.name})`
          )}
        </button>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              backgroundColor: "#1a0505",
              border: "1px solid #3a1515",
              borderRadius: "10px",
              color: "#ff6b6b",
              fontSize: "13px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  backgroundColor: `${TEAL}22`,
                  color: TEAL,
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "3px 10px",
                  borderRadius: "999px",
                }}
              >
                {result.native} — {result.language}
              </span>
              <span style={{ color: "#444", fontSize: "11px" }}>Powered by Groq AI</span>
            </div>

            {/* Summary */}
            <TranslationCard
              icon="📋"
              title={`${result.native} — रिपोर्ट सारांश`}
              subtitle="Report Summary"
              content={result.translation?.summary}
            />

            {/* Medicines */}
            {result.translation?.medicines?.length > 0 && (
              <div
                style={{
                  backgroundColor: "#111",
                  border: "1px solid #1f1f1f",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "16px" }}>💊</span>
                  <div>
                    <p style={{ color: "#fff", fontSize: "13px", fontWeight: "600", margin: 0 }}>
                      Medicines — {result.native}
                    </p>
                    <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>Explained in {result.language}</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.translation.medicines.map((med, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#0d0d0d",
                        border: "1px solid #1a1a1a",
                        borderRadius: "8px",
                        padding: "10px 12px",
                      }}
                    >
                      <p style={{ color: TEAL, fontSize: "13px", fontWeight: "600", margin: "0 0 4px" }}>
                        {med.name}
                      </p>
                      <p style={{ color: "#999", fontSize: "13px", margin: 0, lineHeight: "1.5" }}>
                        {med.use}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action */}
            {result.translation?.action && (
              <TranslationCard
                icon="✅"
                title="Recommended Action"
                subtitle={`What to do next — ${result.language}`}
                content={result.translation.action}
                bg="#1a1200"
                border="#2a2000"
                textColor="#f0a500"
              />
            )}

            {/* Disclaimer */}
            {result.translation?.disclaimer && (
              <div
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#111",
                  borderRadius: "8px",
                  borderLeft: "3px solid #333",
                }}
              >
                <p style={{ color: "#555", fontSize: "12px", margin: 0, lineHeight: "1.6" }}>
                  ⚠️ {result.translation.disclaimer}
                </p>
              </div>
            )}

            {/* Share Button */}
            <button
              onClick={() => {
                const t = result.translation;
                const shareText =
                  `📋 ${result.language} (${result.native}) Report\n\n` +
                  `${t.summary}\n\n` +
                  (t.action ? `✅ ${t.action}\n\n` : "") +
                  `⚠️ ${t.disclaimer}`;
                if (navigator.share) {
                  navigator.share({ title: "Medical Report", text: shareText });
                } else {
                  navigator.clipboard.writeText(shareText);
                  alert("Copied to clipboard! Share with patient via WhatsApp.");
                }
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: `1px solid ${TEAL}44`,
                backgroundColor: `${TEAL}11`,
                color: TEAL,
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              📤 Share via WhatsApp / SMS
            </button>

          </div>
        )}
      </div>
    </div>
  );
}

function TranslationCard({
  icon,
  title,
  subtitle,
  content,
  bg = "#001a12",
  border = "#002a1c",
  textColor = "#ccc",
}) {
  return (
    <div
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <div>
          <p style={{ color: "#fff", fontSize: "13px", fontWeight: "600", margin: 0 }}>{title}</p>
          <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <p style={{ color: textColor, fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
        {content}
      </p>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      style={{ width: "16px", height: "16px" }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
