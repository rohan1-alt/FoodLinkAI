import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

/**
 * Grabs lat/lng from the browser's geolocation API with a manual
 * fallback -- used both on donation-creation forms and on the
 * "set my location" control NGOs/volunteers need for Smart Matching
 * and Volunteer Routing to work.
 */
export default function LocationPicker({ latitude, longitude, onChange }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported in this browser. Enter coordinates manually.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError("Couldn't get your location. Enter coordinates manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className="flex items-center gap-2 text-sm text-emerald-700 border border-emerald-200 rounded-xl px-3 py-2 hover:bg-emerald-50 transition disabled:opacity-60"
      >
        {locating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
        {locating ? "Locating..." : "Use my current location"}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={latitude ?? ""}
          onChange={(e) => onChange(parseFloat(e.target.value), longitude)}
          className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={longitude ?? ""}
          onChange={(e) => onChange(latitude, parseFloat(e.target.value))}
          className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      {error && <p className="text-xs text-amber-600">{error}</p>}
    </div>
  );
}
