import {
  UtensilsCrossed,
  BrainCircuit,
  Truck,
  HandHeart,
} from "lucide-react";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <UtensilsCrossed size={38} />,
      title: "Upload Food",
      description:
        "Restaurants upload surplus food by specifying quantity, pickup time, and location.",
    },
    {
      number: "02",
      icon: <BrainCircuit size={38} />,
      title: "AI Smart Match",
      description:
        "FoodLink AI instantly identifies the nearest NGO using location, urgency, and food availability.",
    },
    {
      number: "03",
      icon: <Truck size={38} />,
      title: "Volunteer Pickup",
      description:
        "Nearby volunteers receive optimized pickup routes for quick and efficient collection.",
    },
    {
      number: "04",
      icon: <HandHeart size={38} />,
      title: "Meals Delivered",
      description:
        "Fresh meals are safely delivered to people in need before the food expires.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-8">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">

          <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
            How It Works
          </span>

          <h2 className="text-5xl font-bold text-gray-900 mt-6">
            Rescue Food in Four Simple Steps
          </h2>

          <p className="mt-6 text-lg text-gray-600 leading-8">
            FoodLink AI uses artificial intelligence to connect restaurants,
            NGOs, and volunteers—making food rescue faster, smarter, and more
            efficient.
          </p>

        </div>

        {/* Cards */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-20">

          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-1 bg-emerald-100 -z-10"></div>

          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-8 text-center"
            >
              {/* Step Number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-20 h-20 mx-auto mt-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="mt-6 text-2xl font-bold text-gray-800">
                {step.title}
              </h3>

              {/* Description */}
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