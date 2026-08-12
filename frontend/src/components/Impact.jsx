function Impact() {
  const stats = [
    {
      number: "12500+",
      label: "Meals Saved",
    },
    {
      number: "350+",
      label: "Restaurants",
    },
    {
      number: "180+",
      label: "NGOs",
    },
    {
      number: "4.5 Tons",
      label: "CO2 Reduced",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-4xl font-bold text-center text-gray-800">
          Our Impact
        </h2>

        <p className="text-center text-gray-600 mt-3">
          Every donation creates a measurable difference.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-emerald-50 rounded-3xl p-8 text-center shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-4xl font-bold text-emerald-600">
                {stat.number}
              </h3>

              <p className="mt-3 text-gray-600 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Impact;