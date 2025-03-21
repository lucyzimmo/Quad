import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { Activity, PersonStanding, BookA } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userTokens, setUserTokens] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("http://localhost:8000/user", {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        });
        const data = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (auth.currentUser) {
      fetchUserProfile();
    }
  }, [auth.currentUser]);

  return (
    <header className="fixed w-full top-0 z-10 bg-white shadow-md">
      <div className="container mx-auto flex items-center px-6 py-4">
        {/* Left section */}
        <Link to="/" className="text-3xl font-bold text-black hover:text-cardinal-red transition-colors">
          The Quad
        </Link>

        {/* Center section */}
        <div className="flex-1 flex justify-center space-x-4">
          <Link
            to="/markets"
            className="text-black hover:text-cardinal-red px-4 py-2 transition-colors appearance-none border-none bg-transparent flex items-center gap-2"
          >
            <Activity className="w-5 h-5" />
            Markets
          </Link>
          <Link
            to="/leaderboard"
            className="text-black hover:text-cardinal-red px-4 py-2 transition-colors appearance-none border-none bg-transparent flex items-center gap-2"
          >
            <PersonStanding className="w-5 h-5" />
            Leaderboard
          </Link>
          <Link
            to="/about"
            className="text-black hover:text-cardinal-red px-4 py-2 transition-colors appearance-none border-none bg-transparent flex items-center gap-2"
          >
            <BookA className="w-5 h-5" />
            About
          </Link>
          {userProfile?.isAdmin && (
            <Link
              to="/admin/dashboard"
              className="text-black hover:text-cardinal-red px-4 py-2 transition-colors appearance-none border-none bg-transparent flex items-center gap-2"
            >
              <BookA className="w-5 h-5" />
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Right section */}
        <div className="flex space-x-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <div className="animate-float flex items-center gap-2 bg-white border-2 border-yellow-400 text-black px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all">
                    <div className="w-6 h-6 flex items-center justify-center bg-yellow-400 rounded-full">
                      💰
                    </div>
                    <span className="font-bold">
                      {userProfile?.tokens || 0}
                    </span>
                  </div>
                  <div className="absolute hidden group-hover:block w-48 p-2 bg-white shadow-xl rounded-lg -bottom-12 right-0">
                    <p className="text-sm text-gray-600">Your betting tokens</p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="text-black hover:text-cardinal-red px-4 py-2 transition-colors appearance-none border-none bg-transparent flex items-center gap-2"
                >
                  {userProfile?.profilePhoto ? (
                    <img
                      src={userProfile.profilePhoto}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-cardinal-red"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      👤
                    </div>
                  )}
                </Link>
              </div>
              Profile
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-cardinal-red px-4 py-2 transition-colors appearance-none border-none bg-transparent"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-cardinal-red text-white px-4 py-2 rounded hover:bg-cardinal-red-hover transition-colors hover:border-transparent focus:outline-none focus:ring-0"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
