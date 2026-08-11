import { useEffect, useRef, useState } from "react";
import { Camera, X, CheckCircle2 } from "lucide-react";

/**
 * Lets a volunteer/NGO confirm a pickup by entering the code from the
 * donor's QR code -- either typed manually (always works, demo-safe) or
 * scanned with the device camera via the native BarcodeDetector API
 * where the browser supports it (Chrome/Edge on Android & desktop).
 */
export default function PickupCodeVerifier({ onSubmit, submitting }) {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanSupported] = useState(
    () => typeof window !== "undefined" && "BarcodeDetector" in window
  );
  const [scanError, setScanError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!scanning) return;

    let cancelled = false;
    let detector;
    let rafId;

    async function start() {
      try {
        detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            if (results.length > 0) {
              const raw = results[0].rawValue;
              let parsedCode = raw;
              try {
                const parsed = JSON.parse(raw);
                if (parsed?.type === "foodlink_pickup" && parsed.code) {
                  parsedCode = parsed.code;
                }
              } catch {
                // not JSON, treat rawValue as the code itself
              }
              setCode(parsedCode);
              stopScanning();
              return;
            }
          } catch {
            // detection hiccup, keep trying
          }
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      } catch {
        setScanError("Couldn't access camera. Enter the code manually instead.");
        setScanning(false);
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning]);

  function stopScanning() {
    setScanning(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  return (
    <div className="space-y-3">
      {scanning ? (
        <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-black">
          <video ref={videoRef} className="w-full aspect-video object-cover" muted playsInline />
          <button
            onClick={stopScanning}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter pickup code (e.g. K7QX2P)"
            className="flex-1 border rounded-xl px-4 py-2.5 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {scanSupported && (
            <button
              type="button"
              onClick={() => {
                setScanError(null);
                setScanning(true);
              }}
              className="px-3 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              title="Scan QR code with camera"
            >
              <Camera size={18} />
            </button>
          )}
        </div>
      )}

      {scanError && <p className="text-xs text-red-500">{scanError}</p>}

      <button
        onClick={() => code.trim() && onSubmit(code.trim())}
        disabled={!code.trim() || submitting}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
      >
        <CheckCircle2 size={16} />
        {submitting ? "Confirming..." : "Confirm Pickup"}
      </button>
    </div>
  );
}
