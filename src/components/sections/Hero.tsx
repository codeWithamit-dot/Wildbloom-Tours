"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

const slides = [
  { src: "/images/uttarakhand1.jpg", caption: "Nainital Lake, Uttarakhand" },
  {
    src: "/images/uttarakhand2.jpg",
    caption: "Valley of Flowers, Uttarakhand",
  },
  { src: "/images/uttarakhand3.jpg", caption: "Jim Corbett National Park" },
  { src: "/images/uttarakhand4.jpg", caption: "Auli Ski Resort, Uttarakhand" },
  { src: "/images/uttarakhand5.jpg", caption: "Rishikesh Ganges, Uttarakhand" },
  { src: "/images/uttarakhand6.jpg", caption: "Kedarnath Temple, Uttarakhand" },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = slides[index];

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-r from-blue-900 to-green-800">
      <AnimatePresence initial={false}>
        <motion.img
          key={current.src}
          src={current.src}
          alt={current.caption}
          className="absolute inset-0 object-cover w-full h-full opacity-75"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black opacity-50" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <motion.h1
          className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Discover Your Next Adventure in Uttarakhand
        </motion.h1>
        <motion.p
          className="text-lg mb-8 max-w-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-400 to-indigo-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {current.caption}
        </motion.p>
        <Link href="/auth/login">
          <motion.button
            className="px-8 py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition-all ease-in-out"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            Browse Trips
          </motion.button>
        </Link>
      </div>

      {/* Floating Buttons with Animations */}
      <motion.a
        href="https://wa.me/9625189298" 
        target="_blank"
        className="fixed bottom-16 right-4 p-4 bg-green-500 rounded-full text-white shadow-lg z-50 hover:bg-green-600"
        aria-label="WhatsApp"
        whileHover={{ scale: 1.2 }} 
        whileTap={{ scale: 0.9 }} 
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FaWhatsapp size={32} />
      </motion.a>

      <motion.a
        href="https://t.me/amitbhatt698"
        target="_blank"
        className="fixed bottom-16 right-20 p-4 bg-blue-500 rounded-full text-white shadow-lg z-50 hover:bg-blue-600"
        aria-label="Telegram"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <FaTelegramPlane size={32} />
      </motion.a>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <motion.div
            className="bg-white p-6 rounded-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4">Call Us Now!</h3>
            <p className="text-lg mb-4">For more information, reach us at +91 9625189298</p>
            <button
              onClick={togglePopup}
              className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
