"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";
import { ImageIcon, VideoIcon, Clapperboard, MapPin } from "lucide-react";

interface Media {
  id: string;
  title: string;
  description: string | null;
  type: "IMAGE" | "VIDEO" | "REEL";
  url: string;
}

interface Destination {
  id: string;
  name: string;
  location: string;
  description: string | null;
  medias: Media[];
}

export default function UserMediaPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<Destination[]>("/api/user/destinations");
        setDestinations(res.data);
      } catch (err: unknown) {
        console.error("Fetch error:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden bg-gray-800 border-gray-700">
              <Skeleton className="h-48 w-full rounded-t-lg bg-gray-700" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4 bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-1/2 bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-[50vh] bg-gray-900"
      >
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-6 py-4 rounded-lg max-w-md text-center">
          <h3 className="font-medium text-lg mb-2">Error loading media</h3>
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-900 min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
      >
        Travel Gallery
      </motion.h1>

      <AnimatePresence>
        {destinations.map((destination) => {
          const images = destination.medias.filter((m) => m.type === "IMAGE");
          const videos = destination.medias.filter((m) => m.type === "VIDEO");
          const reels = destination.medias.filter((m) => m.type === "REEL");

          return (
            <motion.div 
              key={destination.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-16 last:mb-0"
            >
              <div className="mb-6">
                <motion.h2 
                  className="text-2xl font-bold mb-2 flex items-center text-white"
                  whileHover={{ x: 5 }}
                >
                  <MapPin className="text-emerald-400 mr-2" size={20} />
                  {destination.name}
                </motion.h2>
                <p className="text-gray-400 mb-4 max-w-3xl">
                  {destination.description || "Explore the beauty of this destination through our media collection."}
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <span className="mr-4 flex items-center">
                    <ImageIcon className="mr-1 text-emerald-400" size={16} /> {images.length} images
                  </span>
                  <span className="mr-4 flex items-center">
                    <VideoIcon className="mr-1 text-emerald-400" size={16} /> {videos.length} videos
                  </span>
                  <span className="flex items-center">
                    <Clapperboard className="mr-1 text-emerald-400" size={16} /> {reels.length} reels
                  </span>
                </div>
              </div>

              {/* Images Section */}
              {images.length > 0 && (
                <section className="mb-10">
                  <motion.h3 
                    className="text-xl font-semibold mb-4 flex items-center text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ImageIcon className="text-emerald-400 mr-2" size={20} />
                    Photo Gallery
                  </motion.h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((media) => (
                      <motion.div
                        key={media.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02, zIndex: 10 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="relative group"
                      >
                        <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 h-full bg-gray-800 border-gray-700">
                          <CardContent className="p-0">
                            <div className="relative aspect-square overflow-hidden">
                              <img
                                src={media.url}
                                alt={media.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <div>
                                  <h4 className="text-white font-medium">{media.title}</h4>
                                  {media.description && (
                                    <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                                      {media.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Videos Section */}
              {videos.length > 0 && (
                <section className="mb-10">
                  <motion.h3 
                    className="text-xl font-semibold mb-4 flex items-center text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <VideoIcon className="text-emerald-400 mr-2" size={20} />
                    Travel Videos
                  </motion.h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {videos.map((media) => (
                      <motion.div
                        key={media.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-gray-800 border-gray-700">
                          <CardContent className="p-0">
                            <div className="relative">
                              <video
                                controls
                                className="w-full aspect-video"
                                poster={media.url.replace('.mp4', '.jpg')}
                              >
                                <source src={media.url} type="video/mp4" />
                              </video>
                            </div>
                            <div className="p-4">
                              <h4 className="font-medium text-white">{media.title}</h4>
                              {media.description && (
                                <p className="text-gray-400 text-sm mt-1">
                                  {media.description}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reels Section */}
              {reels.length > 0 && (
                <section className="mb-10">
                  <motion.h3 
                    className="text-xl font-semibold mb-4 flex items-center text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Clapperboard className="text-emerald-400 mr-2" size={20} />
                    Short Reels
                  </motion.h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {reels.map((media) => (
                      <motion.div
                        key={media.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-gray-800 border-gray-700">
                          <CardContent className="p-0">
                            <div className="relative aspect-[9/16] bg-black">
                              <video
                                controls
                                className="w-full h-full object-cover"
                                playsInline
                              >
                                <source src={media.url} type="video/mp4" />
                              </video>
                            </div>
                            <div className="p-4">
                              <h4 className="font-medium text-white">{media.title}</h4>
                              {media.description && (
                                <p className="text-gray-400 text-sm mt-1">
                                  {media.description}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}