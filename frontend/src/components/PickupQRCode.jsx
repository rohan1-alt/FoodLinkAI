import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

/**
 * Renders a scannable QR code encoding the donation's pickup_code.
 * The picker's phone camera (or the manual code entry in
 * PickupCodeVerifier) reads this to prove they were physically on-site
 * before a pickup can be marked complete.
 */
export default function PickupQRCode({ pickupCode, size = 180 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pickupCode || !canvasRef.current) return;
    QRCode.toCanvas(
      canvasRef.current,
      JSON.stringify({ type: "foodlink_pickup", code: pickupCode }),
      { width: size, margin: 1, color: { dark: "#065f46", light: "#ffffff" } },
      (err) => setError(err ? "Couldn't render QR code" : null)
    );
  }, [pickupCode, size]);

  if (!pickupCode) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
        <canvas ref={canvasRef} width={size} height={size} />
      </div>
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <p className="text-xs text-gray-400">
          Code: <span className="font-mono font-semibold text-gray-600">{pickupCode}</span>
        </p>
      )}
    </div>
  );
}
