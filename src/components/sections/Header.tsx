"use client";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-6 bg-gray-900 text-white shadow-lg">
      <Link
        href="/"
        className="text-xl sm:text-2xl font-bold"
      >
        WildBloom Tours
      </Link>

      <nav className="hidden lg:flex items-center space-x-4">
        <Link href="/auth/login">
          <Button
            size="sm"
            variant="outline"
            className="text-black border-white hover:bg-emerald-500 hover:border-emerald-500 transition duration-300"
          >
            Login
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button
            size="sm"
            variant="default"
            className="hover:bg-emerald-500 transition duration-300"
          >
            Sign Up
          </Button>
        </Link>
      </nav>

      <div className="lg:hidden flex items-center space-x-4">
        <Link href="/auth/login">
          <Button
            size="sm"
            variant="outline"
            className="text-black border-white hover:bg-emerald-500 hover:border-emerald-500 transition duration-300"
          >
            Login
          </Button>
        </Link>
        <Link href="/auth/signup">
          <Button
            size="sm"
            variant="default"
            className="hover:bg-emerald-500 transition duration-300"
          >
            Sign Up
          </Button>
        </Link>
      </div>
    </header>
  );
}
