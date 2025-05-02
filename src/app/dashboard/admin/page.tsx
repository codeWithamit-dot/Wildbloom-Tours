"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Plus, Trash2, Edit, CheckCircle, LogOut, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Trip {
  id: string;
  destination: string;
  country: string;
  description: string;
  highlights: string;
  price: number;
  startDate: string;
  endDate: string;
  imageUrl?: string;
}

interface Booking {
  id: number;
  user: {
    name: string;
  };
  trip: Trip;
  status: "pending" | "approved" | "rejected";
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Partial<Trip> | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    destination: "",
    country: "",
    description: "",
    highlights: "",
    price: 0,
    startDate: "",
    endDate: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      redirect("/dashboard/user");
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchTrips();
      fetchBookings();
    }
  }, [status, session]);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/trips");
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      setTrips(data.data || data);
    } catch (error) {
      toast.error("Failed to fetch trips");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bookings");
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const { success, data, error } = await response.json();
      if (!success) {
        throw new Error(error || "Failed to fetch bookings");
      }
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: Expected an array");
      }
      const validBookings = data.filter(
        (b: Booking) => b && b.user && b.trip && b.id && b.status
      );
      if (validBookings.length !== data.length) {
        console.warn(
          `Filtered out ${data.length - validBookings.length} invalid bookings`
        );
      }
      setBookings(validBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentTrip?.id ? "PUT" : "POST";
    const url = currentTrip?.id ? `/api/trips/${currentTrip.id}` : "/api/trips";

    const payload = {
      ...formData,
      price: Number(formData.price),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        toast.error(
          `Error: ${
            responseData.message || responseData.error || "Unknown error"
          }`
        );
        throw new Error("Request failed");
      }

      toast.success(
        `Trip ${currentTrip?.id ? "updated" : "created"} successfully`
      );
      fetchTrips();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Operation failed");
    }
  };

  const handleEdit = (trip: Trip) => {
    setCurrentTrip(trip);
    setFormData({
      destination: trip.destination,
      country: trip.country,
      description: trip.description,
      highlights: trip.highlights,
      price: trip.price,
      startDate: trip.startDate.split("T")[0],
      endDate: trip.endDate.split("T")[0],
      imageUrl: trip.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this trip? This cannot be undone."
      )
    )
      return;

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/trips/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            `Failed to delete trip (Status: ${response.status})`
        );
      }

      toast.success("Trip deleted successfully");
      fetchTrips();
    } catch (error) {
      let errorMessage = "Failed to delete trip";

      if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes("active bookings")) {
          errorMessage += ". Please cancel all bookings first.";
        }
      }

      toast.error(errorMessage);
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleApproveBooking = async (id: number) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Approval failed (Status: ${response.status})`
        );
      }

      if (!result.success || !result.data) {
        throw new Error("Invalid response format");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === result.data.id ? result.data : b))
      );
      toast.success("Booking approved!");
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to approve booking"
      );
    }
  };

  const handleRejectBooking = async (id: number) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Rejection failed (Status: ${response.status})`
        );
      }

      if (!result.success || !result.data) {
        throw new Error("Invalid response format");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === result.data.id ? result.data : b))
      );
      toast.success("Booking rejected!");
    } catch (error) {
      console.error("Rejection error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reject booking"
      );
    }
  };

  const resetForm = () => {
    setCurrentTrip(null);
    setFormData({
      destination: "",
      country: "",
      description: "",
      highlights: "",
      price: 0,
      startDate: "",
      endDate: "",
      imageUrl: "",
    });
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          className="text-gray-700 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-full p-2 transition duration-200"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Admin Dashboard</h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="sm:w-auto w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Trip
        </Button>

        <Button
          onClick={() => redirect("/dashboard/admin/media")}
          className="sm:w-auto w-full mt-4"
        >
          Upload Media
        </Button>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Destination</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell className="font-medium">
                  {trip.destination}
                </TableCell>
                <TableCell>{trip.country}</TableCell>
                <TableCell>₹{trip.price.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(trip.startDate).toLocaleDateString()} -{" "}
                  {new Date(trip.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(trip)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(trip.id)}
                      disabled={isDeleting === trip.id}
                    >
                      {isDeleting === trip.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Trip</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.user?.name || "Unknown User"}</TableCell>
                <TableCell>{booking.trip.destination}</TableCell>
                <TableCell>
                  <span
                    className={`inline-block py-1 px-2 rounded-full ${
                      booking.status === "approved"
                        ? "bg-green-500 text-white"
                        : booking.status === "pending"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {booking.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveBooking(booking.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectBooking(booking.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add New Trip Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentTrip?.id ? "Edit Trip" : "Add New Trip"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <Input
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <Input
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <Input
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                type="number"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Highlights
              </label>
              <Textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <Input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <Input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <Input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="submit">Save Trip</Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}