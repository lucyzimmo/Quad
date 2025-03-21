import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { auth } from "../../lib/firebase";
import { AnimatedCard } from "../../components/ui/animated-card";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "firebase/auth";

export function SetupProfile() {
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.currentUser) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size - limit to 5MB
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        setError("Image is too large. Please select an image under 5MB.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log(
          "Processing image:",
          file.name,
          "Size:",
          file.size,
          "bytes"
        );

        // Compress and resize the image before uploading
        const compressedImage = await compressImage(file);
        console.log(
          "Image compressed, data URL length:",
          compressedImage.length
        );

        setImagePreview(compressedImage);
        setPhotoURL(compressedImage);
        console.log("Image preview and photoURL set");

        setIsLoading(false);
      } catch (err) {
        console.error("Error handling image:", err);
        setError("Failed to process image. Please try a different image.");
        setIsLoading(false);
      }
    }
  };

  // Function to compress and resize images
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Create a canvas to resize the image
          const canvas = document.createElement("canvas");
          // Max dimensions for the image - reduced to ensure smaller file size
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with reduced quality (0.5 instead of 0.7)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          resolve(dataUrl);
        };
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    // Check if we have a photo to upload
    console.log("Submitting form, photoURL exists:", !!photoURL);
    if (photoURL) {
      console.log("photoURL length:", photoURL.length);
      console.log(
        "photoURL starts with data:image:",
        photoURL.startsWith("data:image")
      );
    }

    setIsLoading(true);
    setError(null);

    try {
      await auth.currentUser?.reload();
      const token = await auth.currentUser?.getIdToken(true);

      if (!token || !auth.currentUser) {
        throw new Error("Not authenticated");
      }

      try {
        // Prepare the request body
        const requestBody = {
          name: displayName.trim(),
          bio: bio.trim(),
          email: auth.currentUser.email,
          uid: auth.currentUser.uid,
        };

        // Only include profilePhoto if it exists
        if (photoURL) {
          // @ts-ignore - TypeScript doesn't know we're adding a property
          requestBody.profilePhoto = photoURL;
        }

        // Create user profile in Firestore
        console.log("Sending profile data to backend");
        const response = await fetch("http://localhost:8000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        // Check for non-OK responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Server error: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Response from backend:", data);

        // Get the processed photo URL from the response
        const processedPhotoURL = data.profilePhoto || null;
        console.log("Processed photo URL:", processedPhotoURL);

        // Only update Firebase Auth profile with the processed URL from backend (not data URL)
        // Firebase Auth has a limit on the photoURL length
        try {
          // Only update photoURL if we have a valid URL
          if (processedPhotoURL && processedPhotoURL.startsWith("https://")) {
            await updateProfile(auth.currentUser, {
              displayName: displayName.trim(),
              photoURL: processedPhotoURL,
            });
            console.log(
              "Successfully updated Firebase Auth profile with photo"
            );
          } else {
            // Update just the display name if no valid photo URL
            await updateProfile(auth.currentUser, {
              displayName: displayName.trim(),
            });
            console.log(
              "Successfully updated Firebase Auth profile (no photo)"
            );
          }
        } catch (profileError) {
          console.error("Error updating Firebase Auth profile:", profileError);
          // Continue even if Firebase Auth profile update fails
          // The Firestore profile is more important
        }

        // Force a profile refresh
        const profile = await refreshUserProfile();
        if (!profile) {
          throw new Error("Failed to load profile after creation");
        }

        setIsLoading(false);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        navigate("/profile");
      } catch (fetchErr: any) {
        console.error("API Error:", fetchErr);
        if (fetchErr.message === "Failed to fetch") {
          throw new Error("Server connection failed. Please try again later.");
        } else {
          throw fetchErr;
        }
      }
    } catch (err: any) {
      console.error("Error setting up profile:", err);
      setError(err.message || "Failed to setup profile");
      if (err.message.includes("token")) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <AnimatedCard
        className="max-w-md w-full bg-gray-100 rounded-xl shadow-2xl"
        float
      >
        <div className="p-8">
          <h1 className="text-3xl font-bold text-black mb-6 text-center">
            Setup your profile!
          </h1>
          <div className="mb-8 flex justify-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-gray-150 bg-white transition-transform group-hover:scale-105">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full  h-full bg-white flex items-center justify-center">
                    <Textarea
                      className="text-sm text-gray-500 text-center bg-transparent border-none"
                      placeholder="Add a profile pic"
                    />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {isLoading ? "Uploading..." : "Upload Photo"}
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDisplayName(e.target.value)
                }
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                required
              />
            </div>

            <div>
              <Textarea
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setBio(e.target.value)
                }
                className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-cardinal-red p-4 rounded-lg animate-shake">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cardinal-red to-red-700 text-white py-3 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-102"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin mr-2">⚡</div>
                  Setting Up...
                </div>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            You'll receive 1000 tokens to start betting!
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
