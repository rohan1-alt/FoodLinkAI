import { useEffect, useState } from "react";
import { Plus, QrCode, Sparkles, X } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import LocationPicker from "../components/LocationPicker";
import PickupQRCode from "../components/PickupQRCode";
import { UrgencyBadge, StatusBadge } from "../components/Badges";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

const emptyForm = () => {
  const now = new Date();
  const later = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  return {
    title: "",
    description: "",
    quantity: "",
    unit: "kg",
    is_perishable: true,
    prepared_at: toLocalInputValue(now),
    expiry_at: toLocalInputValue(later),
  };
};

export default function RestaurantDashboard() {
  const { user, refreshUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [pickupLat, setPickupLat] = useState(user?.latitude ?? null);
  const [pickupLng, setPickupLng] = useState(user?.longitude ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [qrDonation, setQrDonation] = useState(null);
  const [matchesFor, setMatchesFor] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  async function loadDonations() {
    setLoading(true);
    try {
      const data = await api.listMyDonations();
      setDonations(data);
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount
    loadDonations();
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing local form state from the auth user once loaded
      setPickupLat((v) => v ?? user.latitude ?? null);
      setPickupLng((v) => v ?? user.longitude ?? null);
    }
  }, [user]);

  async function handleSetLocation() {
    if (pickupLat == null || pickupLng == null) return;
    await api.updateLocation(pickupLat, pickupLng);
    await refreshUser();
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);

    if (pickupLat == null || pickupLng == null) {
      setError("Set a pickup location first.");
      return;
    }

    setSubmitting(true);
    try {
      const donation = await api.createDonation({
        title: form.title,
        description: form.description || null,
        quantity: parseFloat(form.quantity),
        unit: form.unit,
        is_perishable: form.is_perishable ? 1 : 0,
        prepared_at: new Date(form.prepared_at).toISOString(),
        expiry_at: new Date(form.expiry_at).toISOString(),
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
      });
      setForm(emptyForm());
      setShowForm(false);
      setQrDonation(donation);
      await loadDonations();
    } catch (err) {
      setError(err.detail || err.message || "Couldn't create donation");
    } finally {
      setSubmitting(false);
    }
  }

  async function openMatches(donation) {
    setMatchesFor(donation.id);
    setMatches([]);
    setMatchesLoading(true);
    try {
      const data = await api.getMatches(donation.id);
      setMatches(data);
    } catch {
      setMatches([]);
    } finally {
      setMatchesLoading(false);
    }
  }

  return (
    <DashboardLayout
      title="Restaurant Dashboard"
      subtitle="Post surplus food and track pickups"
      headerExtra={
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cancel" : "Post Surplus Food"}
        </button>
      }
    >
      {!user?.latitude && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            Set your restaurant's location
          </p>
          <p className="text-xs text-amber-700 mb-3">
            NGOs and volunteers need this to find and route to your donations.
          </p>
          <LocationPicker
            latitude={pickupLat}
            longitude={pickupLng}
            onChange={(lat, lng) => {
              setPickupLat(lat);
              setPickupLng(lng);
            }}
          />
          <button
            onClick={handleSetLocation}
            disabled={pickupLat == null || pickupLng == null}
            className="mt-3 bg-amber-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-amber-700 disabled:opacity-50"
          >
            Save Location
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 space-y-4"
        >
          <h2 className="font-semibold text-gray-800">New Donation</h2>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <input
            required
            placeholder="Title (e.g. 30 Veg Meals)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Quantity (kg)"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              className="border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 px-1">
              <input
                type="checkbox"
                checked={form.is_perishable}
                onChange={(e) => setForm((f) => ({ ...f, is_perishable: e.target.checked }))}
                className="w-4 h-4 accent-emerald-600"
              />
              Perishable food
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Prepared at</label>
              <input
                required
                type="datetime-local"
                value={form.prepared_at}
                onChange={(e) => setForm((f) => ({ ...f, prepared_at: e.target.value }))}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Best before</label>
              <input
                required
                type="datetime-local"
                value={form.expiry_at}
                onChange={(e) => setForm((f) => ({ ...f, expiry_at: e.target.value }))}
                className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Pickup location</label>
            <LocationPicker
              latitude={pickupLat}
              longitude={pickupLng}
              onChange={(lat, lng) => {
                setPickupLat(lat);
                setPickupLng(lng);
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {submitting ? "Posting..." : "Post Donation"}
          </button>
        </form>
      )}

      {qrDonation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative">
            <button
              onClick={() => setQrDonation(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
            <h3 className="font-semibold text-gray-800 mb-1">Donation posted!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Show this QR code to the volunteer/NGO when they arrive to pick up{" "}
              <span className="font-medium">{qrDonation.title}</span>.
            </p>
            <div className="flex justify-center">
              <PickupQRCode pickupCode={qrDonation.pickup_code} />
            </div>
          </div>
        </div>
      )}

      <h2 className="font-semibold text-gray-800 mb-4">My Donations</h2>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : donations.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No donations yet. Click "Post Surplus Food" to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {donations.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-800">{d.title}</p>
                  <p className="text-sm text-gray-500">
                    {d.quantity} {d.unit} · Best before {new Date(d.expiry_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={d.status} />
                  <UrgencyBadge score={d.urgency_score} />
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {d.status !== "completed" && (
                  <button
                    onClick={() => setQrDonation(d)}
                    className="flex items-center gap-1.5 text-sm text-emerald-700 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50"
                  >
                    <QrCode size={14} />
                    Show pickup QR
                  </button>
                )}
                {d.status === "available" && (
                  <button
                    onClick={() => openMatches(d)}
                    className="flex items-center gap-1.5 text-sm text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50"
                  >
                    <Sparkles size={14} />
                    Smart matches
                  </button>
                )}
              </div>

              {matchesFor === d.id && (
                <div className="bg-blue-50/60 rounded-xl p-4 mt-1">
                  <p className="text-xs font-semibold text-blue-800 mb-2">
                    AI-ranked NGOs/volunteers being notified first
                  </p>
                  {matchesLoading ? (
                    <p className="text-xs text-blue-600">Ranking candidates...</p>
                  ) : matches.length === 0 ? (
                    <p className="text-xs text-blue-600">
                      No nearby NGOs/volunteers have set their location yet.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {matches.map((m) => (
                        <li
                          key={m.user_id}
                          className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2"
                        >
                          <span className="font-medium text-gray-700 capitalize">
                            {m.full_name}{" "}
                            <span className="text-gray-400 font-normal">· {m.role}</span>
                          </span>
                          <span className="text-gray-500">
                            {m.distance_km} km · ~{m.eta_minutes} min
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
