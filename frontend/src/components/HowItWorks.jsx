function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Food",
      description:
        "Restaurants upload surplus food along with quantity and pickup location.",
    },
    {
      number: "02",
      title: "AI Matches NGOs",
      description:
        "Our AI finds the nearest NGO that can collect the food before it expires.",
    },
    {
      number: "03",
      title: "Volunteer Pickup",
      description:
        "A volunteer receives the pickup request and follows the optimized route.",
    },
    {
      number: "04",
      title: "Meals Delivered",
      description:
        "Fresh food reaches people in need instead of going to waste.",
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            How It Works
          </h2>

          <p className="mt-3 text-gray-600">
            A simple four-step process powered by AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-3xl shadow-md hover:shadow-xl transition duration-300 p-8"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl">
                {step.number}
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-800">
                {step.title}
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;