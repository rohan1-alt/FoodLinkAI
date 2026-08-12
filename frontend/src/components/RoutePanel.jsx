import { useState, useEffect } from "react";
import { Route as RouteIcon, Navigation } from "lucide-react";
import { api } from "../lib/api";

export default function RoutePanel({ refreshKey }) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // A newly claimed/completed pickup makes any previously computed route
  // stale, so clear it and prompt the volunteer to re-optimize.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing a stale route when claims change is intentional
    setRoute(null);
  }, [refreshKey]);

  async function optimize() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOptimizedRoute();
      setRoute(data);
    } catch (err) {
      setError(err.detail || err.message || "Couldn't compute a route");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RouteIcon size={18} className="text-emerald-600" />
          <h3 className="font-semibold text-gray-800">Optimized Pickup Route</h3>
        </div>
        <button
          onClick={optimize}
          disabled={loading}
          className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Calculating..." : "Optimize Route"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {route && (
        <>
          {route.stops.length === 0 ? (
            <p className="text-sm text-gray-400">
              No pending pickups to route. Claim a donation first.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-3">
                {route.total_distance_km} km total · ~{route.total_eta_minutes} min
              </p>
              <ol className="space-y-2">
                {route.stops.map((s, i) => (
                  <li
                    key={s.donation_id}
                    className="flex items-center gap-3 text-sm bg-emerald-50/60 rounded-lg px-3 py-2"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-gray-700">{s.title}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Navigation size={11} />
                      {s.leg_distance_km} km · {s.leg_eta_minutes}m
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      )}
    </div>
  );
}
