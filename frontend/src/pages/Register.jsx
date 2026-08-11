import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Store, Heart, Bike } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "donor", label: "Restaurant / Donor", icon: Store },
  { value: "ngo", label: "NGO / Shelter", icon: Heart },
  { value: "volunteer", label: "Volunteer", icon: Bike },
];

const DASHBOARD_BY_ROLE = {
  donor: "/dashboard/restaurant",
  ngo: "/dashboard/ngo",
  volunteer: "/dashboard/volunteer",
};

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "donor",
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(DASHBOARD_BY_ROLE[user?.role] || "/");
    } catch (err) {
      setError(err.detail || err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center">Create Account</h1>
        <p className="text-center text-gray-500 mt-2">Join the food rescue network</p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2">
            {ROLES.map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() => update("role", value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-xs font-medium transition ${
                  form.role === value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-500 hover:border-emerald-200"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="tel"
            required
            placeholder="Phone Number"
            value={form.phone_number}
            onChange={(e) => update("phone_number", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
