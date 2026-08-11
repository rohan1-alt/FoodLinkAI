import { useState } from "react";
import { Trophy } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import LocationPicker from "../components/LocationPicker";
import DonationFeed from "../components/DonationFeed";
import MyClaimsList from "../components/MyClaimsList";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function NGODashboard() {
  const { user, refreshUser } = useAuth();
  const [lat, setLat] = useState(user?.latitude ?? null);
  const [lng, setLng] = useState(user?.longitude ?? null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [claimsRefreshKey, setClaimsRefreshKey] = useState(0);

  async function saveLocation() {
    if (lat == null || lng == null) return;
    setSavingLocation(true);
    try {
      await api.updateLocation(lat, lng);
      await refreshUser();
    } finally {
      setSavingLocation(false);
    }
  }

  return (
    <DashboardLayout
      title="NGO Dashboard"
      subtitle="Browse surplus food and manage pickups"
      headerExtra={
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
          <Trophy size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-gray-700">{user?.points ?? 0} pts</span>
        </div>
      }
    >
      {!user?.latitude && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="text-sm font-semibold text-amber-800 mb-2">Set your organization's location</p>
          <p className="text-xs text-amber-700 mb-3">
            This powers Smart Matching (getting notified about nearby donations first).
          </p>
          <LocationPicker
            latitude={lat}
            longitude={lng}
            onChange={(a, b) => {
              setLat(a);
              setLng(b);
            }}
          />
          <button
            onClick={saveLocation}
            disabled={lat == null || lng == null || savingLocation}
            className="mt-3 bg-amber-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-amber-700 disabled:opacity-50"
          >
            {savingLocation ? "Saving..." : "Save Location"}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold text-gray-800 mb-4">Available Donations</h2>
          <DonationFeed
            userLat={user?.latitude}
            userLng={user?.longitude}
            onClaimed={() => setClaimsRefreshKey((k) => k + 1)}
          />
        </div>
        <div>
          <h2 className="font-semibold text-gray-800 mb-4">My Claims</h2>
          <MyClaimsList refreshKey={claimsRefreshKey} onCompleted={refreshUser} />
        </div>
      </div>
    </DashboardLayout>
  );
}
