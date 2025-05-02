"use client";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Jane Doe",
    text: "The trip was amazing! Highly recommend.",
    image: "/images/testimonial1.jpg",
  },
  {
    name: "John Smith",
    text: "Fantastic service and unforgettable experiences.",
    image: "/images/testimonial2.jpg",
  },
  {
    name: "Emily Clark",
    text: "Best travel agency I’ve ever used!",
    image: "/images/testimonial3.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          Testimonials
        </h2>
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={6000}
          transitionTime={700}
        >
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center px-6 pb-12"
            >
              <div className="relative w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden shadow-md border-4 border-emerald-400">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="italic text-lg text-gray-800 mb-4 max-w-2xl mx-auto">
                “{t.text}”
              </p>
              <h4 className="text-xl font-semibold text-gray-900">— {t.name}</h4>
            </motion.div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
