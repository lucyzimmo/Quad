import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/navbar";
import { Spinner } from "../components/ui/spinner";
import { AnimatedCard } from "../components/ui/animated-card";
import { auth } from "../lib/firebase";

interface PublicUserProfile {
  id: string;
  displayName: string | null;
  bio: string | null;
  profilePhoto: string | null;
  tokens: number;
  activeBets: Array<{
    id: string;
    marketId: string;
    marketTitle: string;
    amount: number;
    position: "yes" | "no";
    createdAt: string;
    effectivePrice: number;
  }>;
}

export function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setIsLoading(true);
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`http://localhost:8000/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404) {
          setError("User not found");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-cardinal-red">{error}</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/leaderboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <span className="text-xl">←</span>
            <span>Back to Leaderboard</span>
          </button>

          {/* Profile Header Card */}
          <AnimatedCard className="mb-8 overflow-hidden">
            <div className="relative">
              {/* Profile Banner */}
              <div className="h-32 bg-gradient-to-r from-cardinal-red to-palo-alto-green" />

              {/* Profile Info Section */}
              <div className="px-8 pb-6">
                {/* Profile Picture */}
                <div className="relative -mt-16 mb-4">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                    {profile.profilePhoto ? (
                      <img
                        src={profile.profilePhoto}
                        alt={profile.displayName || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">
                        👤
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-black mb-2">
                      {profile.displayName || "Anonymous"}
                    </h1>
                    <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                      <span className="text-2xl">💰</span>
                      <span className="font-bold text-yellow-700">
                        {profile.tokens}
                      </span>
                      <span className="text-yellow-600">tokens</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Bio Section */}
          <AnimatedCard className="mb-8">
            <div className="p-6">
              <h2 className="text-black text-2xl font-semibold mb-6">About</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 leading-relaxed">
                  {profile.bio || "No bio available."}
                </p>
              </div>
            </div>
          </AnimatedCard>

          {/* Active Bets Section */}
          <AnimatedCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Active Bets</h2>
                <span className="text-sm text-gray-500">
                  {profile.activeBets?.length || 0} active bets
                </span>
              </div>
              <div className="space-y-4">
                {profile.activeBets?.length ? (
                  profile.activeBets.map((bet) => (
                    <div
                      key={bet.id}
                      onClick={() => navigate(`/market/${bet.marketId}`)}
                      className="p-4 rounded-lg border border-gray-200 hover:border-cardinal-red cursor-pointer transition-all hover:shadow-md bg-white"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-lg mb-2">
                            {bet.marketTitle}
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                bet.position === "yes"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {bet.position.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                              <span>💰</span> {bet.amount} tokens
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Entry Price</div>
                          <div className="font-medium text-gray-900">
                            {(bet.effectivePrice * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-3">🎲</div>
                    <div className="text-gray-500">No active bets</div>
                  </div>
                )}
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
} 