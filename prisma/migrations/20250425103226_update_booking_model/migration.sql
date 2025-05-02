-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingDate" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'pending';
