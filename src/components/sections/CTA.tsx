"use client";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-20 bg-emerald-500 text-white text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="px-4"
      >
        <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-lg mb-8">
          Book now and create memories that last a lifetime.
        </p>
        <Link href="/auth/login">
          <Button
            size="lg"
            variant="outline"
            className="border-white text-black hover:bg-white hover:text-emerald-600 transition duration-300 ease-in-out hover:scale-105"
          >
            Explore Trips
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
