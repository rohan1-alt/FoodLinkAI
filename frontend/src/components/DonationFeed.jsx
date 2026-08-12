import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { UrgencyBadge } from "./Badges";
import { api } from "../lib/api";
import { haversineKm } from "../lib/geo";

export default function DonationFeed({ userLat, userLng, onClaimed }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.listAvailableDonations();
      setDonations(data);
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount
    load();
  }, []);

  async function handleClaim(id) {
    setClaimingId(id);
    setError(null);
    try {
      await api.claimDonation(id);
      await load();
      onClaimed?.();
    } catch (err) {
      setError(err.detail || err.message || "Couldn't claim this donation");
    } finally {
      setClaimingId(null);
    }
  }

  const withDistance = donations
    .map((d) => ({
      ...d,
      distanceKm:
        userLat != null && userLng != null
          ? haversineKm(userLat, userLng, d.pickup_lat, d.pickup_lng)
          : null,
    }))
    .sort((a, b) => b.urgency_score - a.urgency_score);

  if (loading) return <p className="text-gray-400 text-sm">Loading donations...</p>;

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2 mb-4">
          {error}
        </p>
      )}

      {withDistance.length === 0 ? (
        <p className="text-gray-400 text-sm">No available donations right now. Check back soon.</p>
      ) : (
        <div className="space-y-3">
          {withDistance.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-4 flex-wrap"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800">{d.title}</p>
                  <UrgencyBadge score={d.urgency_score} />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {d.quantity} {d.unit} · from {d.donor_name || "a donor"} · best before{" "}
                  {new Date(d.expiry_at).toLocaleString()}
                </p>
                {d.distanceKm != null && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    {d.distanceKm.toFixed(1)} km away
                  </p>
                )}
              </div>

              <button
                onClick={() => handleClaim(d.id)}
                disabled={claimingId === d.id}
                className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 whitespace-nowrap"
              >
                {claimingId === d.id ? "Claiming..." : "Claim Pickup"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
