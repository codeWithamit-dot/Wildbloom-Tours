"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";

interface SignUpForm {
  name: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

const SignUpPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<SignUpForm>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/auth/login");
      } else {
        setErrorMessage(data.message || "Signup failed");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-semibold text-center mb-6">Create an Account</h1>

        {errorMessage && (
          <div className="mb-4 text-center text-destructive font-medium">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: "Full Name", name: "name", type: "text" },
            { label: "Email Address", name: "email", type: "email" },
            { label: "Mobile Number", name: "mobile", type: "tel" },
            { label: "Password", name: "password", type: "password" },
            { label: "Confirm Password", name: "confirmPassword", type: "password" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof SignUpForm]}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <a href="/auth/login" className="text-primary underline font-medium">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
