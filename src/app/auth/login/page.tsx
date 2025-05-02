"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";

const LoginPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (result?.error) {
      setErrorMessage("Invalid credentials.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    if (!sessionRes.ok) {
      setErrorMessage("Failed to fetch session.");
      return;
    }
    const session = await sessionRes.json();

    if (session?.user?.role === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/user");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 bg-card text-card-foreground rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold text-center mb-6">Login</h1>

        {errorMessage && (
          <div className="mb-4 text-center text-destructive font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-center text-muted-foreground">
          Forgot your password?{" "}
          <a
            href="/auth/forgot-password"
            className="text-primary underline font-medium"
          >
            Reset Password
          </a>
        </div>

        <div className="mt-2 text-sm text-center text-muted-foreground">
          Don’t have an account?{" "}
          <a href="/auth/signup" className="text-primary underline font-medium">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
