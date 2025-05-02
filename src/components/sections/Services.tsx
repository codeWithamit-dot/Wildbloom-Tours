"use client";
import { Card, CardContent } from "../../components/ui/card";
import { Globe, Headphones, Star } from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Custom Itineraries",
    description: "Trips tailored to your preferences.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We’re here for you at every step.",
  },
  {
    icon: Star,
    title: "Best Price Guarantee",
    description: "Competitive rates, always.",
  },
];

export default function Services() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          Our Services
        </h2>

        {/* Services Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s) => (
            <Card
              key={s.title}
              className="p-8 text-center bg-gray-900 rounded-lg shadow-lg hover:bg-emerald-500 hover:text-white transition-all duration-300"
            >
              <s.icon
                className="mx-auto mb-4 text-emerald-500 transition-all duration-300 group-hover:text-white group-hover:scale-110"
                size={48}
              />
              <CardContent>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-300">{s.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
