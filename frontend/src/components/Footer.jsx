function Footer() {
  return (
    <footer
  id="contact"
  className="bg-gray-900 text-white py-12"
>
      <div className="max-w-7xl mx-auto px-8">

        <div className="grid md:grid-cols-3 gap-10">

          {/* Logo */}
          <div>
            <h2 className="text-3xl font-bold text-emerald-400">
              FoodLink AI
            </h2>

            <p className="mt-4 text-gray-400">
              AI-powered platform connecting restaurants,
              NGOs and volunteers to reduce food waste.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2 text-gray-400">
              <li>Home</li>
              <li>Features</li>
              <li>About</li>
              <li>Contact</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Contact
            </h3>

            <p className="text-gray-400">
              📧 team@foodlink.ai
            </p>

            <p className="text-gray-400 mt-2">
              📍 Bengaluru, India
            </p>

            <p className="text-gray-400 mt-2">
              💻 github.com/FoodLinkAI
            </p>

          </div>

        </div>

        <hr className="border-gray-700 my-8" />

        <p className="text-center text-gray-500">
          © 2026 FoodLink AI. All Rights Reserved.
        </p>

      </div>
    </footer>
  );
}

export default Footer;