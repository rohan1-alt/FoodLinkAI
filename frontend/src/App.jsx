import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import NGODashboard from "./pages/NGODashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/impact" element={<AdminDashboard />} />
          <Route
            path="/dashboard/restaurant"
            element={
              <ProtectedRoute allowedRoles={["donor"]}>
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/ngo"
            element={
              <ProtectedRoute allowedRoles={["ngo"]}>
                <NGODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/volunteer"
            element={
              <ProtectedRoute allowedRoles={["volunteer"]}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;