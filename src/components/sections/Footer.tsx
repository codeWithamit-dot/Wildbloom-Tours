"use client";
import Link from "next/link";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700 bg-clip-text text-transparent">
              WildBloom Tours
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
              Embark on your next adventure with WildBloom Tours. Discover breathtaking destinations and create unforgettable memories!
            </p>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h4 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-700 bg-clip-text text-transparent">
              Connect With Us
            </h4>
            <div className="flex space-x-6">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-500 transform hover:scale-110 transition-all duration-300"
                aria-label="Follow us on Facebook"
              >
                <FaFacebook size={28} />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-pink-400 transform hover:scale-110 transition-all duration-300"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram size={28} />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-10 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} WildBloom Tours. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}