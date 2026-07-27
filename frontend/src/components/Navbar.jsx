function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-emerald-600">
          FoodLink AI
        </h1>

        <div className="space-x-8 hidden md:flex">
          <a href="#" className="hover:text-emerald-600">
            Home
          </a>

          <a href="#" className="hover:text-emerald-600">
            About
          </a>

          <a href="#" className="hover:text-emerald-600">
            Features
          </a>

          <button className="text-emerald-600">
            Login
          </button>

          <button className="bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition">
            Register
          </button>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;