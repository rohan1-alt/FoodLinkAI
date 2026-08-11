import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Impact from "../components/Impact";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Mission from "../components/Mission";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
        });
      }
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <Hero />
      <Impact />
      <HowItWorks />
      <Features />
      <Mission />
      <CTA />
      <Footer />
    </>
  );
}

export default Home;