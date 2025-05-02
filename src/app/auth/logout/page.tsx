"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button"

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    console.log("Logging out...");
    
    router.push("/");
  }, [router]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/path-to-your-image.jpg')" }}>
        <div className="bg-black opacity-50 w-full h-full absolute top-0 left-0"></div>
      </div>

      <header className="z-10 relative text-white p-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">Travel Agency</div>
        </div>
      </header>

      <main className="z-10 relative text-white px-8 py-12 max-w-md mx-auto text-center">
        <h1 className="text-4xl font-semibold mb-6">Logging Out...</h1>

        <Button variant="default" size="lg" disabled>
          Logging out...
        </Button>
      </main>
    </div>
  );
};

export default LogoutPage;
