import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Navbar } from "../../components/navbar";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (err) {
      setError("Failed to login. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 container mx-auto px-6 py-8">
        <div className="max-w-md mx-auto bg-gray-100 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-black text-center">
            Login
          </h1>

          {error && <p className="text-cardinal-red mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
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
                Password
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

            <Button
              type="submit"
              className="w-full bg-cardinal-red text-lg hover:bg-cardinal-red-hover transition-colors text-white"
            >
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-cardinal-red hover:text-cardinal-red-hover"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
