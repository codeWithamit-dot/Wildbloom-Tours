import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Wildbloom Tours",
  description: "Explore your next adventure with us!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head><link rel="icon" type="image/x-icon" href="/favicon.ico" /></head>
      <body className={`${poppins.variable} antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-poppins)",
              background: "#fff",  // Background color of the toast
              color: "#1f2937",     // Text color
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",   // Rounded corners
              padding: "16px",       // Padding inside the toast
              fontSize: "14px",      // Font size for the toast text
            },
            success: {
              iconTheme: {
                primary: "#10b981", // Green color for success icon
                secondary: "#fff",  // White icon
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444", // Red color for error icon
                secondary: "#fff",  // White icon
              },
            },
          }}
        />
      </body>
    </html>
  );
}