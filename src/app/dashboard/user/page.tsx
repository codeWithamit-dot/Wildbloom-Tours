"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Trip } from "../../../types/api/trips";
import { Booking } from "../../../types/api/booking";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  CheckCircle,
  CreditCard,
  Info,
  Star,
  ArrowRight,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { cn, fetchTrips, fetchUserBookings } from "../../../lib/utils";
import { signOut } from "next-auth/react";

interface AppError extends Error {
  message: string;
}

async function createBooking(tripId: string): Promise<Booking> {
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tripId }),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.error || `Failed to create booking. Status: ${res.status}`;
      console.error("API error response:", errorMessage);
      throw new Error(errorMessage);
    }

    const data = await res.json();
    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to create booking");
    }
    return data.data;
  } catch (err: unknown) {
    const error = err as AppError;
    console.error("Create booking error:", error.message || error);
    throw new Error(error.message || "Something went wrong while creating the booking");
  }
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"trips" | "bookings">("trips");
  const [error, setError] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  const fetchData = useCallback(async () => {
    if (status !== "authenticated" || !session?.user) return;
    try {
      setLoading(true);
      setError(null);
      if (activeTab === "bookings") {
        const userBookings = await fetchUserBookings();
        console.log("User bookings:", userBookings);
        setBookings(userBookings.filter(booking => booking.trip));
      } else {
        const tripsData = await fetchTrips();
        setTrips(tripsData);
      }
    } catch (err: unknown) {
      const error = err as AppError;
      console.error("Fetch data error:", error.message || error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, status, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateBooking = async (tripId: string) => {
    try {
      await createBooking(tripId);
      toast.success("Booking created successfully! Awaiting approval and payment.");
      setIsBookingDialogOpen(true);
      setActiveTab("bookings");
      fetchData();
    } catch (err: unknown) {
      const error = err as AppError;
      toast.error(error.message || "Failed to create booking");
    }
  };

  const handlePayNow = (tripId: string) => {
    router.push(`/dashboard/user/trips/${tripId}/payment`);
  };

  const handleSearchChange = debounce((value: string) => {
    setSearchTerm(value.toLowerCase());
  }, 300);

  const filteredTrips = trips.filter((trip) =>
    trip.destination.toLowerCase().includes(searchTerm)
  );

  const filteredBookings = bookings.filter((booking) =>
    booking.trip?.destination.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen font-sans">
      {/* Logout Button - Top right corner */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 flex items-center"
      >
        <Button
          variant="ghost"
          className="text-gray-700 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-full px-3 py-1 transition duration-200"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </motion.div>

      {/* Welcome Message */}
      {session?.user?.name && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-clip-text">
            Welcome back, <span className="text-teal-600">{session.user.name}</span>!
          </h1>
          <p className="text-gray-600 text-lg">
            {activeTab === "trips"
              ? "Discover your next adventure"
              : "Manage your travel plans"}
          </p>
        </motion.div>
      )}

      {/* Top Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-6xl mx-auto"
      >
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg shadow-inner">
          <Button
            variant={activeTab === "trips" ? "default" : "ghost"}
            className={cn(
              "px-6 rounded-lg transition-all duration-300",
              activeTab === "trips"
                ? "bg-white shadow-sm text-teal-600 hover:text-teal-700"
                : "text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => setActiveTab("trips")}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              Trips
            </motion.span>
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "ghost"}
            className={cn(
              "px-6 rounded-lg transition-all duration-300",
              activeTab === "bookings"
                ? "bg-white shadow-sm text-teal-600 hover:text-teal-700"
                : "text-gray-600 hover:bg-gray-200"
            )}
            onClick={() => setActiveTab("bookings")}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              Bookings
            </motion.span>
          </Button>
          <Button
            variant="ghost"
            className="px-6 rounded-lg transition-all duration-300 text-gray-600 hover:bg-gray-200"
            onClick={() => router.push("/dashboard/user/media")}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              View Gallery
            </motion.span>
          </Button>
        </div>
        <div className="w-full sm:w-72 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            placeholder="Search destinations..."
            className="pl-10 border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 rounded-lg shadow-sm"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[...Array(6)].map((_, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-4 space-y-4 rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                  <Skeleton className="h-4 w-1/3 rounded" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </Card>
            </motion.div>
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center px-4 py-2 bg-red-50 rounded-lg text-red-600 font-medium shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          <AnimatePresence>
            {activeTab === "trips" ? (
              filteredTrips.length > 0 ? (
                filteredTrips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="flex flex-col justify-between bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                      <div>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">
                            {trip.destination}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-1 text-gray-600">
                            <MapPin size={16} className="text-teal-500" />
                            <span className="text-sm">{trip.country}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="relative aspect-video overflow-hidden rounded-lg mb-4 group">
                            <motion.img
                              src={trip.imageUrl || "/default.jpg"}
                              alt={trip.destination}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5 }}
                            />
                            <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-sm font-medium text-gray-900 shadow-sm">
                              ₹{trip.price}
                            </div>
                          </div>
                          <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <CalendarDays size={16} className="text-teal-500 flex-shrink-0" />
                              <span>
                                {format(new Date(trip.startDate), "MMM dd, yyyy", {
                                  locale: enUS,
                                })} - {format(new Date(trip.endDate), "MMM dd, yyyy", {
                                  locale: enUS,
                                })}
                              </span>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <svg className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.027 15.986C5.235 15.926 2 15.649 2 11.996V9.996C2 6.685 5.224 6.066 8.027 6.006C8.824 3.128 10.803 2 12 2C13.197 2 15.176 3.128 15.973 6.006C18.765 6.066 22 6.685 22 9.996V11.996C22 15.649 18.765 15.926 15.973 15.986C15.176 18.864 13.197 19.992 12 19.992C10.803 19.992 8.824 18.864 8.027 15.986ZM12 12.996C12.83 12.996 13.5 12.326 13.5 11.496C13.5 10.666 12.83 9.996 12 9.996C11.17 9.996 10.5 10.666 10.5 11.496C10.5 12.326 11.17 12.996 12 12.996Z"/>
                              </svg>
                              <span className="font-medium">₹{trip.price} total</span>
                            </div>

                            {trip.description && (
                              <div className="flex items-start space-x-2">
                                <Info size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-700 line-clamp-3">{trip.description}</p>
                              </div>
                            )}

                            {trip.highlights && (
                              <div className="flex items-start space-x-2">
                                <Star size={16} className="text-teal-500 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-700 line-clamp-3">{trip.highlights}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </div>
                      <CardFooter className="flex flex-col space-y-2 pt-0">
                        <Button
                          className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-lg py-5 shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={() => handleCreateBooking(trip.id)}
                        >
                          <motion.span 
                            className="flex items-center"
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            Book Now <ArrowRight className="ml-2 h-4 w-4" />
                          </motion.span>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  layout
                  className="col-span-full py-12 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="inline-flex flex-col items-center max-w-md p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                    <p className="text-gray-500">We couldn`t find any trips matching your search.</p>
                  </div>
                </motion.div>
              )
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="flex flex-col justify-between bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                    <div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">
                          {booking.trip?.destination || "Unknown Destination"}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-1 text-gray-600">
                          <MapPin size={16} className="text-teal-500" />
                          <span className="text-sm">{booking.trip?.country || "Unknown Country"}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="relative aspect-video overflow-hidden rounded-lg mb-4 group">
                          <motion.img
                            src={booking.trip?.imageUrl || "/default.jpg"}
                            alt={booking.trip?.destination || "Booking Image"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          />
                          <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-sm font-medium text-gray-900 shadow-sm">
                            ₹{booking.trip?.price || "N/A"}
                          </div>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <CalendarDays size={16} className="text-teal-500 flex-shrink-0" />
                            <span>
                              {booking.trip?.startDate && booking.trip?.endDate ? (
                                <>
                                  {format(
                                    new Date(booking.trip.startDate),
                                    "MMM dd, yyyy",
                                    { locale: enUS }
                                  )} -{" "}
                                  {format(
                                    new Date(booking.trip.endDate),
                                    "MMM dd, yyyy",
                                    { locale: enUS }
                                  )}
                                </>
                              ) : (
                                "No dates available"
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <div className="flex items-center space-x-2">
                              <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                              <span className="capitalize font-medium">Approved</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard
                                size={16}
                                className={booking.paymentStatus === "paid" ? "text-green-500" : "text-amber-500 flex-shrink-0"}
                              />
                              <span className={`capitalize font-medium ${
                                booking.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"
                              }`}>
                                {booking.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      {booking.paymentStatus === "pending" && (
                        <CardFooter className="pt-0">
                          <Button
                            className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-lg py-5 shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={() => handlePayNow(booking.tripId)}
                          >
                            <motion.span 
                              className="flex items-center"
                              whileHover={{ x: 2 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              Complete Payment <ArrowRight className="ml-2 h-4 w-4" />
                            </motion.span>
                          </Button>
                        </CardFooter>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div
                layout
                className="col-span-full py-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="inline-flex flex-col items-center max-w-md p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-500 mb-4">You don`t have any approved bookings at the moment.</p>
                  <Button 
                    variant="outline" 
                    className="border-teal-600 text-teal-600 hover:bg-teal-50 shadow-sm"
                    onClick={() => setActiveTab("trips")}
                  >
                    Browse Trips
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Booking Confirmation Popup */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Confirmed!</DialogTitle>
            <DialogDescription>
              Thank you for booking, we will contact you soon then we approved booking after discussion on call and from bookings tab you see your approved bookings and payment status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsBookingDialogOpen(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}