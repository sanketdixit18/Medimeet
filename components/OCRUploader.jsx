// "use client";

// import { useState, useRef, useCallback } from "react";

// const TEAL = "#00c896";

// export default function OCRUploader() {
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState("idle"); // idle | scanning | processing | done | error
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [saved, setSaved] = useState(false);
//   const fileInputRef = useRef(null);
//   const dropRef = useRef(null);

//   const handleFile = (selectedFile) => {
//     if (!selectedFile) return;
//     if (!selectedFile.type.startsWith("image/")) {
//       setError("Please upload an image file (JPG, PNG, etc.)");
//       return;
//     }
//     setFile(selectedFile);
//     setPreview(URL.createObjectURL(selectedFile));
//     setResult(null);
//     setError(null);
//     setSaved(false);
//     setStatus("idle");
//   };

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     const dropped = e.dataTransfer.files[0];
//     if (dropped) handleFile(dropped);
//   }, []);

//   const handleScan = async () => {
//     if (!file) return;
//     setStatus("scanning");
//     setProgress(0);
//     setError(null);

//     try {
//       // Dynamic import to avoid SSR issues with Tesseract.js
//       const { createWorker } = await import("tesseract.js");

//       const worker = await createWorker("eng", 1, {
//         logger: (m) => {
//           if (m.status === "recognizing text") {
//             setProgress(Math.round(m.progress * 90)); // 0-90% for OCR
//           }
//         },
//       });

//       const { data: { text } } = await worker.recognize(file);
//       await worker.terminate();

//       setProgress(95);
//       setStatus("processing");

//       // Post-process with API
//       const res = await fetch("/api/ocr", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           text,
//           fileName: file.name,
//           userId: "demo-user", // Replace with real auth userId
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Processing failed");

//       setProgress(100);
//       setResult(data);
//       setStatus("done");
//     } catch (err) {
//       setError(err.message || "OCR failed. Please try a clearer image.");
//       setStatus("error");
//     }
//   };

//   const handleSave = async () => {
//     if (!result) return;
//     // Re-call API with save: true
//     const res = await fetch("/api/ocr", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         text: result.text,
//         fileName: file?.name,
//         userId: "demo-user",
//         save: true,
//       }),
//     });
//     if (res.ok) setSaved(true);
//   };

//   const reset = () => {
//     setFile(null);
//     setPreview(null);
//     setResult(null);
//     setError(null);
//     setStatus("idle");
//     setProgress(0);
//     setSaved(false);
//   };

//   return (
//     <div className="min-h-screen bg-black text-white p-6 md:p-10">
//       <div className="max-w-3xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <span style={{ color: TEAL }} className="text-2xl">📄</span>
//             <h1 className="text-2xl font-bold">Medical Report OCR</h1>
//           </div>
//           <p className="text-gray-400 text-sm">
//             Upload a photo of your medical report or prescription. We'll extract the text and detect medicines automatically.
//           </p>
//         </div>

//         {/* Upload Zone */}
//         {!file ? (
//           <div
//             ref={dropRef}
//             onDrop={handleDrop}
//             onDragOver={(e) => e.preventDefault()}
//             onClick={() => fileInputRef.current?.click()}
//             className="rounded-xl p-12 text-center cursor-pointer transition-all mb-6"
//             style={{
//               border: `2px dashed #2a2a2a`,
//               backgroundColor: "#0a0a0a",
//             }}
//             onMouseEnter={(e) => (e.currentTarget.style.borderColor = TEAL + "66")}
//             onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
//           >
//             <div className="text-4xl mb-3">📷</div>
//             <p className="text-gray-300 font-medium mb-1">Drop image here or click to upload</p>
//             <p className="text-gray-600 text-sm">JPG, PNG, WEBP • Max 10MB</p>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept="image/*"
//               className="hidden"
//               onChange={(e) => handleFile(e.target.files?.[0])}
//             />
//           </div>
//         ) : (
//           <div className="mb-6 rounded-xl overflow-hidden" style={{ border: "1px solid #1f1f1f" }}>
//             <div className="relative">
//               <img
//                 src={preview}
//                 alt="Report preview"
//                 className="w-full object-cover max-h-72"
//               />
//               <button
//                 onClick={reset}
//                 className="absolute top-3 right-3 w-8 h-8 rounded-full text-sm flex items-center justify-center"
//                 style={{ backgroundColor: "#000000bb", color: "#fff" }}
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="p-4 flex items-center justify-between" style={{ backgroundColor: "#111" }}>
//               <div>
//                 <p className="text-sm font-medium text-white">{file.name}</p>
//                 <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
//               </div>
//               {status === "idle" && (
//                 <button
//                   onClick={handleScan}
//                   className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
//                   style={{ backgroundColor: TEAL, color: "#000" }}
//                 >
//                   🔍 Scan Report
//                 </button>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Progress */}
//         {(status === "scanning" || status === "processing") && (
//           <div className="mb-6 rounded-xl p-5" style={{ backgroundColor: "#111", border: "1px solid #1f1f1f" }}>
//             <div className="flex items-center justify-between mb-3">
//               <span className="text-sm text-gray-300 flex items-center gap-2">
//                 <SpinnerIcon />
//                 {status === "scanning" ? "Extracting text from image..." : "Detecting medicines..."}
//               </span>
//               <span className="text-sm font-bold" style={{ color: TEAL }}>{progress}%</span>
//             </div>
//             <div className="h-2 rounded-full" style={{ backgroundColor: "#1f1f1f" }}>
//               <div
//                 className="h-full rounded-full transition-all duration-300"
//                 style={{ width: `${progress}%`, backgroundColor: TEAL }}
//               />
//             </div>
//           </div>
//         )}

//         {/* Error */}
//         {error && (
//           <div
//             className="rounded-xl p-4 mb-6 text-sm"
//             style={{ backgroundColor: "#2a0a0a", border: "1px solid #5a1a1a", color: "#ff6b6b" }}
//           >
//             ⚠️ {error}
//           </div>
//         )}

//         {/* Results */}
//         {status === "done" && result && (
//           <div className="space-y-4">
//             {/* Stats */}
//             <div className="grid grid-cols-3 gap-3">
//               {[
//                 { label: "Words Extracted", value: result.wordCount },
//                 { label: "Medicines Found", value: result.medicineCount },
//                 { label: "Status", value: saved ? "Saved ✓" : "Not saved" },
//               ].map((stat) => (
//                 <div
//                   key={stat.label}
//                   className="rounded-xl p-4 text-center"
//                   style={{ backgroundColor: "#111", border: "1px solid #1f1f1f" }}
//                 >
//                   <p className="text-xl font-bold" style={{ color: TEAL }}>{stat.value}</p>
//                   <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Medicines */}
//             {result.medicines?.length > 0 && (
//               <div className="rounded-xl p-5" style={{ backgroundColor: "#001a12", border: `1px solid ${TEAL}33` }}>
//                 <h3 className="font-semibold mb-3" style={{ color: TEAL }}>💊 Detected Medicines</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {result.medicines.map((med) => (
//                     <span
//                       key={med}
//                       className="text-xs px-3 py-1 rounded-full capitalize"
//                       style={{ backgroundColor: "#00c89622", color: TEAL, border: `1px solid ${TEAL}44` }}
//                     >
//                       {med}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Extracted Text */}
//             <div className="rounded-xl p-5" style={{ backgroundColor: "#111", border: "1px solid #1f1f1f" }}>
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="font-semibold text-white">📝 Extracted Text</h3>
//                 <button
//                   onClick={() => navigator.clipboard.writeText(result.text)}
//                   className="text-xs px-3 py-1 rounded-lg transition-colors"
//                   style={{ backgroundColor: "#1a1a1a", color: "#aaa", border: "1px solid #2a2a2a" }}
//                 >
//                   Copy
//                 </button>
//               </div>
//               <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
//                 {result.text || "No text extracted."}
//               </pre>
//             </div>

//             {/* Actions */}
//             <div className="flex gap-3">
//               {!saved && (
//                 <button
//                   onClick={handleSave}
//                   className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
//                   style={{ backgroundColor: TEAL, color: "#000" }}
//                 >
//                   💾 Save Report
//                 </button>
//               )}
//               <button
//                 onClick={reset}
//                 className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
//                 style={{ backgroundColor: "#1a1a1a", color: "#aaa", border: "1px solid #2a2a2a" }}
//               >
//                 Scan Another
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function SpinnerIcon() {
//   return (
//     <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
//       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//     </svg>
//   );
// }


"use client";

import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import ReportTranslator from "@/components/ReportTranslator";

const TEAL = "#00c896";

export default function OCRUploader() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG, PNG, etc.)");
      return;
    }
    setError(null);
    setResult(null);
    setOcrProgress(0);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleScan = async () => {
    if (!image) return;
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Tesseract OCR in browser
      const { data: { text } } = await Tesseract.recognize(image, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      if (!text || text.trim().length < 10) {
        throw new Error("Could not extract text. Please upload a clearer image.");
      }

      // Step 2: Send to API for cleaning + medicine detection
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          fileName: image.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Processing failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
      setOcrProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span style={{ color: TEAL }} className="text-2xl">📄</span>
            <h1 className="text-2xl font-bold">Medical Report Scanner</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Upload a photo of your prescription or report. We extract text, detect medicines, and explain it in Hindi or Marathi.
          </p>
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !preview && fileRef.current?.click()}
          style={{
            border: `2px dashed ${preview ? TEAL + "55" : "#2a2a2a"}`,
            backgroundColor: preview ? "#001a12" : "#0d0d0d",
            borderRadius: "16px",
            padding: preview ? "16px" : "48px 24px",
            textAlign: "center",
            cursor: preview ? "default" : "pointer",
            transition: "all 0.2s",
            marginBottom: "16px",
          }}
        >
          {preview ? (
            <div>
              <img
                src={preview}
                alt="Uploaded report"
                style={{ maxHeight: "280px", maxWidth: "100%", borderRadius: "10px", margin: "0 auto", display: "block" }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setPreview(null); setImage(null); setResult(null); setError(null); }}
                style={{ marginTop: "12px", color: "#555", fontSize: "12px", background: "none", border: "none", cursor: "pointer" }}
              >
                ✕ Remove and upload another
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🖼️</div>
              <p style={{ color: "#fff", fontWeight: "600", marginBottom: "6px" }}>
                Drop your report image here
              </p>
              <p style={{ color: "#555", fontSize: "13px", marginBottom: "16px" }}>
                or click to browse — JPG, PNG, WEBP supported
              </p>
              <span
                style={{
                  backgroundColor: `${TEAL}22`,
                  color: TEAL,
                  padding: "8px 20px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Choose Image
              </span>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Scan Button */}
        {image && (
          <button
            onClick={handleScan}
            disabled={scanning}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              fontSize: "15px",
              fontWeight: "700",
              cursor: scanning ? "not-allowed" : "pointer",
              backgroundColor: scanning ? "#1a1a1a" : TEAL,
              color: scanning ? "#555" : "#000",
              marginBottom: "16px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {scanning ? (
              <>
                <SpinnerIcon />
                {ocrProgress < 100 ? `Scanning... ${ocrProgress}%` : "Processing report..."}
              </>
            ) : (
              "🔍 Scan & Extract Report"
            )}
          </button>
        )}

        {/* Progress Bar */}
        {scanning && ocrProgress > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ height: "4px", backgroundColor: "#1a1a1a", borderRadius: "999px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${ocrProgress}%`,
                  backgroundColor: TEAL,
                  borderRadius: "999px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <p style={{ color: "#555", fontSize: "12px", textAlign: "center", marginTop: "6px" }}>
              Reading image text... {ocrProgress}%
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "14px",
              backgroundColor: "#1a0505",
              border: "1px solid #3a1515",
              borderRadius: "12px",
              color: "#ff6b6b",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <StatCard label="Words Extracted" value={result.wordCount} icon="📝" />
              <StatCard label="Medicines Found" value={result.medicineCount} icon="💊" />
              <StatCard label="Status" value="Done" icon="✅" />
            </div>

            {/* Extracted Text */}
            <div
              style={{
                backgroundColor: "#0d0d0d",
                border: "1px solid #1f1f1f",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ color: "#fff", fontSize: "13px", fontWeight: "600", margin: 0 }}>📝 Extracted Text</p>
                <button
                  onClick={() => navigator.clipboard.writeText(result.text)}
                  style={{ color: TEAL, fontSize: "12px", background: "none", border: "none", cursor: "pointer" }}
                >
                  Copy
                </button>
              </div>
              <div style={{ padding: "14px 16px", maxHeight: "180px", overflowY: "auto" }}>
                <p style={{ color: "#999", fontSize: "13px", lineHeight: "1.7", margin: 0, whiteSpace: "pre-wrap" }}>
                  {result.text}
                </p>
              </div>
            </div>

            {/* Medicines */}
            {result.medicines && result.medicines.length > 0 && (
              <div
                style={{
                  backgroundColor: "#0d0d0d",
                  border: "1px solid #1f1f1f",
                  borderRadius: "14px",
                  padding: "16px",
                }}
              >
                <p style={{ color: "#fff", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
                  💊 Detected Medicines ({result.medicines.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {result.medicines.map((med, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: `${TEAL}18`,
                        color: TEAL,
                        border: `1px solid ${TEAL}33`,
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ TRANSLATION SECTION */}
            <ReportTranslator
              reportText={result.text}
              medicines={result.medicines || []}
            />

          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div
      style={{
        backgroundColor: "#0d0d0d",
        border: "1px solid #1f1f1f",
        borderRadius: "12px",
        padding: "14px",
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: "20px", margin: "0 0 6px" }}>{icon}</p>
      <p style={{ color: "#fff", fontWeight: "700", fontSize: "20px", margin: "0 0 2px" }}>{value}</p>
      <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>{label}</p>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
