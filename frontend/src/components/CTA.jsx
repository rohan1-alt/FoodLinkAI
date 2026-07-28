function CTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-emerald-600 to-green-500">

      <div className="max-w-5xl mx-auto px-8 text-center">

        <h2 className="text-5xl font-bold text-white">
          Ready to Rescue Food?
        </h2>

        <p className="text-emerald-100 mt-6 text-lg max-w-2xl mx-auto">
          Join restaurants, NGOs and volunteers who are working together to
          reduce food waste and feed communities using AI.
        </p>

        <div className="mt-10 flex justify-center gap-6 flex-wrap">

          <button className="bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold hover:scale-105 transition duration-300">
            Get Started
          </button>

          <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-emerald-600 transition duration-300">
            Contact Us
          </button>

        </div>

      </div>

    </section>
  );
}

export default CTA;