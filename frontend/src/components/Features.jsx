import {
  BrainCircuit,
  MapPinned,
  BarChart3,
  Leaf,
} from "lucide-react";

function Features() {
  const features = [
    {
      icon: <BrainCircuit size={40} />,
      title: "AI Smart Matching",
      description:
        "Automatically connects restaurants with the most suitable NGO based on distance, urgency, and food availability.",
    },
    {
      icon: <MapPinned size={40} />,
      title: "Live Location Tracking",
      description:
        "Track food donations and volunteer pickups in real time using interactive maps.",
    },
    {
      icon: <BarChart3 size={40} />,
      title: "Analytics Dashboard",
      description:
        "Visualize meals saved, active donations, and environmental impact through intuitive dashboards.",
    },
    {
      icon: <Leaf size={40} />,
      title: "Eco Impact",
      description:
        "Measure food waste reduction and estimate carbon emissions prevented with every successful donation.",
    },
  ];

  return (
    <section
  id="features"
  className="py-24 bg-white"
>
      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900">
            Why Choose FoodLink AI?
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Our platform combines Artificial Intelligence with real-time
            logistics to ensure surplus food reaches those who need it most.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">

          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-8 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                {feature.icon}
              </div>

              <h3 className="mt-6 text-2xl font-bold text-gray-800">
                {feature.title}
              </h3>

              <p className="mt-4 text-gray-600 leading-7">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;