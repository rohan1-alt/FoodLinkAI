import { useEffect, useState } from "react";
import { StatusBadge } from "./Badges";
import PickupCodeVerifier from "./PickupCodeVerifier";
import { api } from "../lib/api";

export default function MyClaimsList({ refreshKey, onCompleted }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api.myClaims();
      setClaims(data);
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount/refresh
    load();
  }, [refreshKey]);

  async function handleConfirm(claim, code) {
    setSubmittingId(claim.id);
    setError(null);
    try {
      await api.completePickup(claim.donation_id, code);
      setConfirmingId(null);
      await load();
      onCompleted?.();
    } catch (err) {
      setError(err.detail || err.message || "Pickup code didn't match");
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) return <p className="text-gray-400 text-sm">Loading claims...</p>;

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2 mb-4">
          {error}
        </p>
      )}

      {claims.length === 0 ? (
        <p className="text-gray-400 text-sm">You haven't claimed any pickups yet.</p>
      ) : (
        <div className="space-y-3">
          {claims.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-800">{c.donation_title}</p>
                  <p className="text-sm text-gray-500">
                    {c.donation_quantity} {c.donation_unit} · claimed{" "}
                    {new Date(c.claimed_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {c.status !== "completed" && (
                <div className="mt-4">
                  {confirmingId === c.id ? (
                    <PickupCodeVerifier
                      submitting={submittingId === c.id}
                      onSubmit={(code) => handleConfirm(c, code)}
                    />
                  ) : (
                    <button
                      onClick={() => setConfirmingId(c.id)}
                      className="text-sm text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50"
                    >
                      Confirm pickup (scan/enter code)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
