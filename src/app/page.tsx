import Hero from "../components/sections/Hero";
import AboutUs from "../components/sections/AboutUs";
import Services from "../components/sections/Services";
import Testimonials from "../components/sections/Testimonials";
import CTA from "../components/sections/CTA";
import Header from "../components/sections/Header";
import Footer from "../components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <AboutUs />
      <Services />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
