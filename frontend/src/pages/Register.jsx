function Register() {
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <form className="space-y-5 mt-8">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-xl px-4 py-3"
          />

          <button
            className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700"
          >
            Register
          </button>

        </form>

      </div>
    </div>
  );
}

export default Register;