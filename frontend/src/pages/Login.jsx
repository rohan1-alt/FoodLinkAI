function Login() {
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-gray-800">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Login to FoodLink AI
        </p>

        <form className="mt-8 space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;