import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Navbar } from "../../components/navbar";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase"; // Import our initialized auth instance

export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/setup-profile");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 container mx-auto px-6 py-8">
        <div className="max-w-md mx-auto bg-gray-100 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-black text-center">
            Sign Up
          </h1>

          {error && <p className="text-cardinal-red mb-4">{error}</p>}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                className="mt-1 bg-white border border-gray-300 text-black focus:ring-2 focus:ring-cardinal-red focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password (at least 6 characters)
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                className="mt-1 bg-white border border-gray-300 text-black focus:ring-2 focus:ring-cardinal-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                required
                className="mt-1 bg-white border border-gray-300 text-black focus:ring-2 focus:ring-cardinal-red focus:border-transparent"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-cardinal-red text-white text-lg hover:bg-cardinal-red-hover transition-colors"
            >
              Sign Up
            </Button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-cardinal-red hover:text-cardinal-red-hover"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
