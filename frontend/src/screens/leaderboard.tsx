import { useState, useEffect } from "react";
import { Navbar } from "../components/navbar";
import { AnimatedCard } from "../components/ui/animated-card";
import { Spinner } from "../components/ui/spinner";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

interface LeaderboardUser {
  id: string;
  displayName: string;
  profilePhoto: string | null;
  tokens: number;
  rank?: number;
  isAdmin?: boolean;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch("http://localhost:8000/leaderboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        // Filter out admin accounts
        const filteredData = data.filter(
          (user: LeaderboardUser) =>
            !user.displayName.toLowerCase().includes("admin")
        );

        // Add rank to each user
        const rankedUsers = filteredData.map(
          (user: LeaderboardUser, index: number) => ({
            ...user,
            rank: index + 1,
          })
        );

        setUsers(rankedUsers);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (error) return <div className="text-cardinal-red">{error}</div>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold text-black">Leaderboard</h1>
          <div className="relative group">
            <div className="cursor-help w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
              ?
            </div>
            <div className="absolute hidden group-hover:block w-72 p-3 bg-white shadow-xl rounded-lg top-0 left-0 transform translate-x-2 z-10 border border-gray-200">
              <div className="text-sm text-left">
                <p className="font-medium text-gray-900 mb-2">
                  How does the leaderboard work?
                </p>
                <div className="space-y-1 text-gray-600">
                  <p>1. Rankings are based on total tokens earned</p>
                  <p>2. Tokens are earned by winning bets</p>
                  <p>3. Higher ranks indicate more successful predictions</p>
                  <p>4. Rankings update in real-time as bets are resolved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {users.map((user) => {
            console.log(user);

            return (
              <AnimatedCard
                key={user.id}
                onClick={() => navigate(`/profile/${user.id}`)}
                className={`transform transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.01] ${
                  user.rank === 1 ? "border-2 border-yellow-400 shadow-xl" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 font-bold text-2xl text-gray-400">
                      #{user.rank}
                    </div>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={user.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-black hover:text-cardinal-red">
                        {user.displayName || "Anonymous"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600">
                    <span>💰</span>
                    <span className="font-bold">{user.tokens}</span>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
