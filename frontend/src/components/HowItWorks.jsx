import { Upload, Brain, Truck, HeartHandshake } from "lucide-react";

function HowItWorks() {
  const steps = [
    {
      icon: <Upload size={40} className="text-emerald-600" />,
      title: "Upload Food",
      description:
        "Restaurants upload surplus food with quantity, expiry time and location."
    },
    {
      icon: <Brain size={40} className="text-emerald-600" />,
      title: "AI Smart Match",
      description:
        "Our AI finds the nearest NGO that can collect the food before it expires."
    },
    {
      icon: <Truck size={40} className="text-emerald-600" />,
      title: "Volunteer Pickup",
      description:
        "Volunteers receive pickup requests with the best route."
    },
    {
      icon: <HeartHandshake size={40} className="text-emerald-600" />,
      title: "Meals Delivered",
      description:
        "Fresh food reaches people instead of ending up as waste."
    }
  ];

  return (
    <section className="py-24 bg-white">

      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-4xl font-bold text-center text-gray-800">
          How It Works
        </h2>

        <p className="text-center mt-4 text-gray-600">
          Four simple steps to reduce food waste using AI.
        </p>

        <div className="grid md:grid-cols-4 gap-8 mt-16">

          {steps.map((step, index) => (

            <div
              key={index}
              className="rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 p-8 text-center border"
            >

              <div className="flex justify-center mb-6">
                {step.icon}
              </div>

              <h3 className="text-xl font-semibold">
                {step.title}
              </h3>

              <p className="text-gray-600 mt-4">
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