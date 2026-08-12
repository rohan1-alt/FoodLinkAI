  import { Link } from "react-router-dom";

  function Navbar() {
    return (
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              F
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-800">
                FoodLink AI
              </h1>
              <p className="text-xs text-gray-500">
                Smart Food Rescue
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <ul className="flex items-center gap-8 font-medium text-gray-700">

            <li>
              <a
                href="/"
                className="hover:text-emerald-600 transition"
              >
                Home
              </a>
            </li>

            <li>
              <a
                href="#how-it-works"
                className="hover:text-emerald-600 transition"
              >
                How It Works
              </a>
            </li>

            <li>
              <a
                href="#features"
                className="hover:text-emerald-600 transition"
              >
                Features
              </a>
            </li>

            <li>
              <a
                href="#contact"
                className="hover:text-emerald-600 transition"
              >
                Contact
              </a>
            </li>

          </ul>

          {/* Buttons */}
          <div className="flex items-center gap-4">

            <Link to="/login">
              <button className="px-5 py-2 rounded-full text-emerald-600 hover:bg-emerald-50 transition">
                Login
              </button>
            </Link>

            <Link to="/register">
              <button className="bg-emerald-600 text-white px-6 py-2 rounded-full shadow-md hover:bg-emerald-700 transition">
                Register
              </button>
            </Link>

          </div>

        </div>
      </nav>
    );
  }

  export default Navbar;