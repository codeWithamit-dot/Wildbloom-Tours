"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutUs() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-8 px-4">
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >

          <motion.div
            className="mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/logo.png"
              alt="WildBloom Tours Logo"
              width={120}
              height={120}
            />
          </motion.div>

          <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700">
            About Us
          </h2>

          <p className="text-lg mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-400 to-indigo-500">
            At WildBloom Tours, we’re blossoming adventures across Uttarakhand’s 
            most vibrant landscapes. Our curated experiences ensure every 
            journey is as colorful and unforgettable as the valley of flowers itself.
          </p>
        </motion.div>

        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/images/about-us.png"
            alt="About us"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}
