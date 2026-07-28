import {
  UtensilsCrossed,
  BrainCircuit,
  Truck,
  HandHeart,
} from "lucide-react";

function HowItWorks() {
  const steps = [
    {
      icon: <UtensilsCrossed size={40} />,
      title: "Upload Food",
      description:
        "Restaurants upload surplus food with quantity, pickup time and location.",
    },
    {
      icon: <BrainCircuit size={40} />,
      title: "AI Smart Match",
      description:
        "FoodLink AI instantly finds the nearest NGO based on location and urgency.",
    },
    {
      icon: <Truck size={40} />,
      title: "Volunteer Pickup",
      description:
        "Volunteers receive optimized pickup routes and collect the food.",
    },
    {
      icon: <HandHeart size={40} />,
      title: "Meals Delivered",
      description:
        "Fresh meals reach people in need before the food expires.",
    },
  ];

  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center">

          <h2 className="text-4xl font-bold text-gray-900">
            How It Works
          </h2>

          <p className="mt-4 text-gray-600">
            Four simple steps powered by AI to reduce food waste.
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">

          {steps.map((step, index) => (

            <div
              key={index}
              className="bg-white rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-8 text-center"
            >

              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                {step.icon}
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