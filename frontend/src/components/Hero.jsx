function Hero() {
  return (
    <section className="min-h-[90vh] bg-gradient-to-br from-green-50 to-emerald-100 flex items-center">

      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-10 items-center">

        <div>

          <h1 className="text-6xl font-bold leading-tight text-gray-800">

            Save Food.

            <br />

            Feed Communities.

          </h1>

          <p className="mt-6 text-lg text-gray-600">

            FoodLink AI connects restaurants,
            NGOs and volunteers using AI to
            reduce food waste and fight hunger.

          </p>

          <div className="mt-8 flex gap-5">

            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full">

              Donate Food

            </button>

            <button className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-full">

              Find Donations

            </button>

          </div>

        </div>

        <div className="flex justify-center">

          <div className="w-96 h-96 rounded-full bg-emerald-500 flex items-center justify-center text-8xl">

            🍱

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;