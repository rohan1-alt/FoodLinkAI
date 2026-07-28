function Mission() {
  return (
    <section className="py-24 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left Side */}
        <div className="flex justify-center">
          <div className="w-96 h-96 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-400 shadow-2xl flex items-center justify-center">

            <span className="text-8xl">
              🌍
            </span>

          </div>
        </div>

        {/* Right Side */}
        <div>

          <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
            Our Mission
          </span>

          <h2 className="text-5xl font-bold text-gray-900 mt-6 leading-tight">
            Every Meal Saved
            <br />
            Makes A Difference.
          </h2>

          <p className="mt-8 text-lg text-gray-600 leading-8">
            Every day, thousands of kilograms of perfectly edible food go to
            waste while millions of people struggle with hunger.
            FoodLink AI bridges this gap by intelligently connecting
            restaurants, NGOs and volunteers to ensure surplus food reaches
            those who need it most.
          </p>

          <button className="mt-10 bg-emerald-600 text-white px-8 py-4 rounded-full hover:bg-emerald-700 transition shadow-lg">
            Learn More
          </button>

        </div>

      </div>
    </section>
  );
}

export default Mission;