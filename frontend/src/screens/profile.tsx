import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/navbar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { getAuth, signOut } from "firebase/auth";
import { Spinner } from "../components/ui/spinner";
import { AnimatedCard } from "../components/ui/animated-card";

interface UserProfile {
  tokens: number;
  displayName: string | null;
  bio: string | null;
  profilePhoto: string | null;
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

export function Profile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      if (!auth.currentUser) return;

      const token = await auth.currentUser.getIdToken();
      const userDoc = await fetch(`http://localhost:8000/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await userDoc.json();

      if (!userDoc.ok) {
        throw new Error(data?.message || "Failed to fetch user data");
      }

      setProfile(data);
      setDisplayName(data.displayName || "");
      setBio(data.bio || "");
      setImagePreview(data.profilePhoto || null);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [auth.currentUser, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Calculate new dimensions - more aggressive compression
          const MAX_SIZE = 400; // Reduced from 800
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Increased compression
          resolve(canvas.toDataURL("image/jpeg", 0.5)); // Reduced quality from 0.7 to 0.5
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedImage = await compressImage(file);
      setImagePreview(compressedImage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: displayName,
          bio,
          profilePhoto: imagePreview,
          email: auth.currentUser?.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await fetchProfile();
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <AnimatedCard className="mb-8 overflow-hidden">
            <div className="relative">
              {/* Profile Banner */}
              <div className="h-32 bg-gradient-to-r from-cardinal-red to-palo-alto-green" />

              {/* Profile Info Section */}
              <div className="px-8 pb-6">
                {/* Profile Picture - Positioned to overlap banner */}
                <div className="relative -mt-16 mb-4">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                    {isEditing ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full cursor-pointer hover:opacity-75 transition-opacity flex items-center justify-center"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-4xl">📸</div>
                        )}
                      </div>
                    ) : profile?.profilePhoto ? (
                      <img
                        src={profile.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">
                        👤
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Profile Details */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="mb-2">
                      {isEditing ? (
                        <div>
                          <h1 className="text-2xl font-bold text-black mb-4">
                            {" "}
                            Display Name
                          </h1>
                          <Input
                            value={displayName}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) => setDisplayName(e.target.value)}
                            className="text-2xl bg-white font-bold"
                            placeholder="Your name"
                          />
                        </div>
                      ) : (
                        <h1 className="text-2xl  font-bold">
                          {profile?.displayName || "Anonymous"}
                        </h1>
                      )}
                    </div>
                    {/* Token Display */}
                    {!isEditing && (
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                        <span className="text-2xl">💰</span>
                        <span className="font-bold text-yellow-700">
                          {profile?.tokens || 0}
                        </span>
                        <span className="text-yellow-600">tokens</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        ✏️ Edit Profile
                      </Button>
                      <Button
                        onClick={handleSignOut}
                        className="bg-cardinal-red text-white hover:bg-cardinal-red-hover"
                      >
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Bio Section */}
          <AnimatedCard className="mb-8">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-black text-2xl font-semibold">About Me</h2>
              </div>
              {isEditing ? (
                <Textarea
                  value={bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setBio(e.target.value)
                  }
                  className="w-full text-black bg-white border border-gray-200"
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600 leading-relaxed">
                    {profile?.bio ||
                      "No bio yet. Click 'Edit Profile' to add one!"}
                  </p>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Active Bets Section */}
          {!isEditing && (
            <AnimatedCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-black">Active Bets</h2>
                  <span className="text-sm text-gray-500">
                    {profile?.activeBets?.length || 0} active bets
                  </span>
                </div>
                <div className="space-y-4">
                  {profile?.activeBets?.length ? (
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
                              <span className="text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                {new Date(bet.createdAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
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
                      <div className="text-gray-500 mb-4">No active bets yet</div>
                      <Button
                        onClick={() => navigate("/markets")}
                        className="bg-cardinal-red text-white hover:bg-cardinal-red-hover"
                      >
                        Browse Markets
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          )}

          {/* Edit Mode Actions */}
          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-cardinal-red text-white hover:bg-cardinal-red-hover"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
