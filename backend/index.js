require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const admin = require("./config/firebase-admin-config");
const OpenAI = require("openai");
const DynamicPricing = require("./models/DynamicPricing");
const {
  calculateSimilarity,
  SIMILARITY_THRESHOLD,
} = require("./utils/textSimilarity");

const app = express();
const PORT = process.env.PORT || 8000;

// Initialize Firestore
const db = admin.firestore();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set this in an .env file
});

const pricingEngine = new DynamicPricing();

console.log("🔥 Attempting to connect to Firestore...");

// Test the connection
db.collection("markets")
  .limit(1)
  .get()
  .then(() => {
    console.log("✅ Successfully connected to Firestore");
  })
  .catch((error) => {
    console.error("❌ Error connecting to Firestore:", error);
  });

console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);

// Add CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Make sure this comes BEFORE your routes
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ limit: "50mb", extended: true }));

// At the top after app initialization
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

async function moderateContent(title, description) {
  try {
    console.log("Starting content moderation for market:");
    console.log("Title:", title);
    console.log("Description:", description);

    const prompt = `Please review this prediction market question and description.
    
    Do not approve if the market is about a person's weight, height, or physical appearance. 
    Do not approve if the market is bullying, harassment, or hate speech. 
    
    Other than that, approve all markets.
    Respond with either "APPROVED" or "REJECTED", followed by a reason.

    The prediction market:
    Title: ${title}
    Description: ${description}`;

    console.log("Sending request to ChatGPT...");
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
    });

    const response = completion.choices[0].message.content.trim();
    console.log("ChatGPT Response:", response);

    // Parse the response to get both approval status and reason
    const isApproved = response.startsWith("APPROVED");
    const reason =
      response.split("\n")[1] ||
      (isApproved ? "Content is appropriate" : "Content is inappropriate");

    const result = {
      approved: isApproved,
      reason: reason,
    };

    console.log("Moderation Result:", result);
    return result;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Content moderation failed");
  }
}

// Register/Update Profile
app.post("/register", async (req, res) => {
  try {
    const { name, email, bio, profilePhoto, uid } = req.body;
    const token = req.headers["authorization"]?.split("Bearer ")[1];

    console.log(
      "Received profile photo:",
      profilePhoto ? "Photo exists (not showing full data URL)" : "No photo"
    );
    console.log("Profile photo type:", typeof profilePhoto);
    console.log(
      "Profile photo starts with data:image:",
      profilePhoto?.startsWith("data:image")
    );
    console.log(
      "Profile photo starts with https://:",
      profilePhoto?.startsWith("https://")
    );

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      // Process profile photo if it's a data URL
      let processedPhotoURL = profilePhoto; // Start with the original value
      if (
        profilePhoto &&
        typeof profilePhoto === "string" &&
        profilePhoto.startsWith("data:image")
      ) {
        console.log("Processing data URL image...");
        try {
          // Extract the base64 data
          const base64Data = profilePhoto.split(",")[1];
          const contentType = profilePhoto.split(";")[0].split(":")[1];

          // Create a unique filename with timestamp to avoid caching issues
          const timestamp = Date.now();
          const filename = `profile-photos/${userId}_${timestamp}`;

          // Get the default bucket
          const bucket = admin.storage().bucket();
          console.log("Bucket name:", bucket.name);

          // Create a file reference
          const file = bucket.file(filename);

          // Upload the image with proper content type
          await file.save(Buffer.from(base64Data, "base64"), {
            metadata: {
              contentType: contentType,
              cacheControl: "public, max-age=31536000", // Cache for 1 year
            },
          });

          // Make the file publicly accessible
          await file.makePublic();

          // Get the public URL
          processedPhotoURL = `https://storage.googleapis.com/${bucket.name}/${filename}`;

          console.log(
            "Successfully uploaded profile photo:",
            processedPhotoURL
          );
        } catch (uploadError) {
          console.error("Error uploading profile photo:", uploadError);
          // Keep the original photo URL if upload fails
          // Don't set to null
        }
      } else if (
        profilePhoto &&
        typeof profilePhoto === "string" &&
        profilePhoto.startsWith("https://")
      ) {
        console.log("Using existing HTTPS URL");
        // If it's already a valid URL, keep it
        processedPhotoURL = profilePhoto;
      } else if (!profilePhoto) {
        console.log("No profile photo provided");
        // Only set to null if no photo was provided
        processedPhotoURL = null;
      } else {
        console.log("Invalid profile photo format:", typeof profilePhoto);
        // Keep the original value for any other case
      }

      console.log("Final processedPhotoURL:", processedPhotoURL);

      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        await userRef.update({
          name,
          bio: bio || "",
          profilePhoto: processedPhotoURL,
          email,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isAdmin: userDoc.data().isAdmin,
        });
      } else {
        await userRef.set({
          name,
          email,
          bio: bio || "",
          profilePhoto: processedPhotoURL,
          tokens: 1000,
          activeBets: [],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isAdmin: false,
        });
      }

      // Return the processed photo URL to the client
      res.status(201).json({
        message: "Profile updated successfully",
        profilePhoto: processedPhotoURL,
      });
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return res.status(403).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({
      message: "Error creating profile",
      error: error.message,
    });
  }
});

// Get User Profile
app.get("/user", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];
    console.log(
      "Profile request received, token:",
      token?.substring(0, 20) + "..."
    );

    if (!token) {
      console.log("No token provided");
      return res.status(403).json({ message: "No token provided" });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Decoded token:", {
        sub: decodedToken.sub,
        uid: decodedToken.uid,
        email: decodedToken.email,
        isAdmin: decodedToken.isAdmin,
      });

      const userRef = db.collection("users").doc(decodedToken.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        // Create default profile if user doesn't exist
        const defaultProfile = {
          name: decodedToken.email?.split("@")[0] || "Anonymous",
          email: decodedToken.email,
          tokens: 1000,
          bio: "",
          profilePhoto: "",
          activeBets: [],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          isAdmin: false,
        };

        await userRef.set(defaultProfile);
        return res.status(200).json({
          displayName: defaultProfile.name,
          email: defaultProfile.email,
          tokens: defaultProfile.tokens,
          profilePhoto: defaultProfile.profilePhoto,
          bio: defaultProfile.bio,
          activeBets: defaultProfile.activeBets,
          isAdmin: defaultProfile.isAdmin,
        });
      }

      const userData = userDoc.data();
      const profileData = {
        displayName: userData.name,
        email: userData.email,
        tokens: userData.tokens,
        profilePhoto: userData.profilePhoto,
        bio: userData.bio,
        activeBets: (userData.activeBets || []).map((bet) => ({
          ...bet,
          createdAt:
            bet.createdAt instanceof admin.firestore.Timestamp
              ? bet.createdAt.toDate().toISOString()
              : bet.createdAt,
          updatedAt:
            bet.updatedAt instanceof admin.firestore.Timestamp
              ? bet.updatedAt.toDate().toISOString()
              : bet.updatedAt,
        })),
        isAdmin: userData.isAdmin,
      };

      console.log("Sending profile data:", profileData);
      res.status(200).json(profileData);
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return res.status(403).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Failed to fetch profile data" });
  }
});

// Get Public User Profile
app.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers["authorization"]?.split("Bearer ")[1];

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    try {
      await admin.auth().verifyIdToken(token);

      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userData = userDoc.data();

      // Return only public information
      res.json({
        id: userId,
        displayName: userData.name,
        bio: userData.bio,
        profilePhoto: userData.profilePhoto,
        tokens: userData.tokens,
        activeBets: userData.activeBets || [],
      });
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return res.status(403).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// Update the market creation endpoint
app.post("/markets", async (req, res) => {
  try {
    console.log("\n=== Creating New Market ===");
    console.log("Request body:", req.body);

    const token = req.headers["authorization"]?.split("Bearer ")[1];
    if (!token) {
      console.log("No token provided");
      return res.status(403).json({ message: "No token provided" });
    }

    const { title, description, expiresAt, minimumBet, category } = req.body;
    console.log("Checking market content...");

    // Check content with ChatGPT
    try {
      const moderationResult = await moderateContent(title, description);
      if (!moderationResult.approved) {
        console.log("Market content rejected:", moderationResult.reason);
        return res.status(400).json({
          message: "Market question rejected",
          reason: moderationResult.reason,
        });
      }
    } catch (moderationError) {
      console.error("Content moderation failed:", moderationError);
      console.log("Proceeding with market creation despite moderation failure");
      // Continue with market creation even if moderation fails
    }

    // Check for similar existing markets
    const existingMarketsSnapshot = await db
      .collection("markets")
      .where("status", "==", "open")
      .get();

    const similarMarket = existingMarketsSnapshot.docs.find((doc) => {
      const existingMarket = doc.data();
      const titleSimilarity = calculateSimilarity(existingMarket.title, title);
      const descSimilarity = calculateSimilarity(
        existingMarket.description,
        description
      );

      // Consider markets similar if either title or description is very similar
      return (
        titleSimilarity > SIMILARITY_THRESHOLD ||
        descSimilarity > SIMILARITY_THRESHOLD
      );
    });

    if (similarMarket) {
      console.log("Similar market found:", similarMarket.data().title);
      return res.status(400).json({
        message: "A similar market already exists",
        similarMarket: {
          id: similarMarket.id,
          title: similarMarket.data().title,
          description: similarMarket.data().description,
        },
      });
    }

    console.log("Content approved, proceeding with market creation");
    // Verify the token and get user ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log("Creating market for user:", userId);

    // Initialize market data with default values
    const marketData = {
      title,
      description,
      expiresAt,
      minimumBet: parseInt(minimumBet) || 10,
      category,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      yesAmount: 0,
      noAmount: 0,
      totalAmount: 0,
      currentPrice: 0.5,
      liquidity: 1000,
      status: "open",
      resolved: false,
      lastUpdateTime: new Date().toISOString(),
      priceHistory: [
        {
          price: 0.5,
          timestamp: new Date().toISOString(),
        },
      ],
      yesPercentage: 50,
      noPercentage: 50,
      totalBets: 0,
      yesBets: 0,
      noBets: 0,
      potentialYesWin: 2,
      potentialNoWin: 2,
      initialLiquidity: 1000,
    };

    console.log("Market data to be created:", marketData);

    // Create market reference
    const newMarketRef = db.collection("markets").doc();
    console.log("New market ID:", newMarketRef.id);

    // Run transaction
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection("users").doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        console.log("User not found:", userId);
        throw new Error("User not found");
      }

      // Create the market
      transaction.set(newMarketRef, marketData);
      console.log("Market document created");

      // Update user's created markets array
      const userData = userDoc.data();
      const createdMarkets = userData.createdMarkets || [];
      createdMarkets.push(newMarketRef.id);

      transaction.update(userRef, { createdMarkets });
      console.log("User's created markets updated");
    });

    console.log("Market creation successful");
    console.log("=== Market Creation Complete ===\n");

    res.status(201).json({
      id: newMarketRef.id,
      ...marketData,
    });
  } catch (error) {
    console.error("Error creating market:", error);
    let errorMessage = "Failed to create market: ";

    if (error.code === "auth/invalid-token") {
      errorMessage = "Authentication failed - please try logging in again";
    } else if (error.code === "permission-denied") {
      errorMessage = "You don't have permission to create markets";
    } else if (error.message.includes("User not found")) {
      errorMessage =
        "Your user profile was not found - please try logging in again";
    } else if (error.message.includes("Content moderation failed")) {
      errorMessage = "Content moderation service is temporarily unavailable";
    } else if (error.message.includes("deadline-exceeded")) {
      errorMessage = "Request timed out - please try again";
    } else if (error.message.includes("already-exists")) {
      errorMessage = "A similar market already exists";
    } else {
      errorMessage = "An unexpected error occurred while creating the market";
    }
    res.status(500).json({
      message: errorMessage,
      error: error.message,
      code: error.code || "unknown",
    });
  }
});

// For closing markets
app.patch("/markets/:marketId/close", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const marketRef = db.collection("markets").doc(req.params.marketId);

    // Transaction to ensure only the creator can close the market
    await db.runTransaction(async (transaction) => {
      const marketDoc = await transaction.get(marketRef);
      if (!marketDoc.exists) throw new Error("Market not found");

      const marketData = marketDoc.data();
      if (marketData.createdBy !== userId) {
        throw new Error("Unauthorized: Only the market creator can close it.");
      }

      transaction.update(marketRef, { status: "closed" });
    });

    res.status(200).json({ message: "Market closed successfully" });
  } catch (error) {
    console.error("Error closing market:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to close market" });
  }
});

// Place a bet on a market
app.post("/markets/:marketId/bets", async (req, res) => {
  try {
    const { marketId } = req.params;
    const { position, amount } = req.body;
    const token = req.headers["authorization"]?.split("Bearer ")[1];

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    let potentialWin = 0;
    let newPrice = 0;

    // Verify the token and get user ID
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Run everything in a transaction
    await db.runTransaction(async (transaction) => {
      // Get user data
      const userRef = db.collection("users").doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      if (userData.tokens < amount) {
        throw new Error("Insufficient tokens");
      }

      // Get market data
      const marketRef = db.collection("markets").doc(marketId);
      const marketDoc = await transaction.get(marketRef);

      if (!marketDoc.exists) {
        throw new Error("Market not found");
      }

      const marketData = marketDoc.data();

      if (userData.tokens < amount) {
        throw new Error("Insufficient tokens");
      }

      // Calculate new amounts with safe defaults
      const currentYesAmount = marketData.yesAmount || 0;
      const currentNoAmount = marketData.noAmount || 0;
      const newYesAmount =
        position === "yes" ? currentYesAmount + amount : currentYesAmount;
      const newNoAmount =
        position === "no" ? currentNoAmount + amount : currentNoAmount;
      const newTotalAmount = newYesAmount + newNoAmount;

      // Calculate percentages with safe defaults
      const yesPercentage =
        newTotalAmount > 0 ? (newYesAmount / newTotalAmount) * 100 : 50;
      const noPercentage =
        newTotalAmount > 0 ? (newNoAmount / newTotalAmount) * 100 : 50;

      // Calculate potential win based on current pool
      potentialWin =
        amount *
        (newTotalAmount / (position === "yes" ? newYesAmount : newNoAmount));

      // Calculate effective price
      const effectivePrice = pricingEngine.getEffectivePrice(
        marketData.currentPrice || 0.5,
        amount,
        position,
        marketData.liquidity || 1000
      );

      // Calculate new price
      newPrice = pricingEngine.adjustPriceForImbalance(
        newYesAmount,
        newNoAmount,
        marketData.currentPrice || 0.5
      );

      // Create bet data
      const betData = {
        userId,
        marketId,
        position,
        amount,
        effectivePrice,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        marketTitle: marketData.title,
      };

      // Store the bet in the market's bets subcollection
      const betsRef = marketRef.collection("bets");
      const newBetRef = betsRef.doc();
      transaction.create(newBetRef, betData);

      // Update market data
      const updates = {
        totalAmount: newTotalAmount,
        yesAmount: newYesAmount,
        noAmount: newNoAmount,
        currentPrice: newPrice,
        lastUpdateTime: new Date().toISOString(),
        liquidity: (marketData.liquidity || 1000) + amount,
        yesPercentage: Math.round(yesPercentage * 100) / 100,
        noPercentage: Math.round(noPercentage * 100) / 100,
        totalBets: (marketData.totalBets || 0) + 1,
        yesBets:
          position === "yes"
            ? (marketData.yesBets || 0) + 1
            : marketData.yesBets || 0,
        noBets:
          position === "no"
            ? (marketData.noBets || 0) + 1
            : marketData.noBets || 0,
        potentialYesWin: newYesAmount > 0 ? newTotalAmount / newYesAmount : 2,
        potentialNoWin: newNoAmount > 0 ? newTotalAmount / newNoAmount : 2,
        priceHistory: admin.firestore.FieldValue.arrayUnion({
          price: newPrice,
          timestamp: new Date().toISOString(),
        }),
      };

      // Update the market
      transaction.update(marketRef, updates);

      // Add to user's active bets and update tokens
      const activeBet = {
        id: newBetRef.id,
        marketId,
        marketTitle: marketData.title,
        position,
        amount,
        effectivePrice,
        createdAt: new Date().toISOString(),
      };

      transaction.update(userRef, {
        tokens: userData.tokens - amount,
        activeBets: admin.firestore.FieldValue.arrayUnion(activeBet),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.status(201).json({
      message: "Bet placed successfully",
      potentialWin,
      newPrice,
    });
  } catch (error) {
    console.error("Error placing bet:", error);
    res.status(500).json({
      message: error.message || "Failed to place bet",
    });
  }
});

// For fronted integation: to fetch all bets for a market
app.get("/markets/:marketId/bets", async (req, res) => {
  try {
    const marketId = req.params.marketId;
    const betsSnapshot = await db
      .collection("markets")
      .doc(marketId)
      .collection("bets")
      .get();

    const bets = betsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt instanceof admin.firestore.Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
        updatedAt:
          data.updatedAt instanceof admin.firestore.Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
      };
    });

    res.status(200).json(bets);
  } catch (error) {
    console.error("Error fetching bets:", error);
    res.status(500).json({ message: "Failed to fetch bets" });
  }
});

// Get all markets
app.get("/markets", async (req, res) => {
  console.log("GET /markets endpoint hit");
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];
    console.log("Markets - Received token:", token ? "exists" : "missing");

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Markets - Token verified for user:", decodedToken.uid);

      // Test Firestore connection
      console.log("Attempting to query markets collection...");
      const marketsRef = db.collection("markets");

      // Get ALL markets without filtering by status
      const marketsSnapshot = await marketsRef
        .orderBy("createdAt", "desc")
        .get();

      console.log(
        "Raw market data:",
        marketsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );

      const markets = marketsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt:
            data.createdAt instanceof admin.firestore.Timestamp
              ? data.createdAt.toDate().toISOString()
              : data.createdAt,
          expiresAt:
            data.expiresAt instanceof admin.firestore.Timestamp
              ? data.expiresAt.toDate().toISOString()
              : data.expiresAt,
        };
      });

      console.log("Sending markets to frontend:", markets);
      res.status(200).json(markets);
    } catch (verifyError) {
      console.error("Markets - Token verification failed:", verifyError);
      return res
        .status(403)
        .json({ message: "Invalid token", error: verifyError.message });
    }
  } catch (error) {
    console.error("Markets - Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch markets", error: error.message });
  }
});

// Get user's created markets
app.get("/user/markets", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const marketsSnapshot = await db
      .collection("markets")
      .where("createdBy", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const markets = marketsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt:
          data.createdAt instanceof admin.firestore.Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
        expiresAt:
          data.expiresAt instanceof admin.firestore.Timestamp
            ? data.expiresAt.toDate().toISOString()
            : data.expiresAt,
      };
    });

    res.status(200).json(markets);
  } catch (error) {
    console.error("Error fetching user markets:", error);
    res.status(500).json({
      message: "Failed to fetch user markets",
      error: error.message,
    });
  }
});

// Add this near the top after app.use() statements
app.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ message: "Server is working" });
});

// Add this endpoint for getting a single market
app.get("/markets/:marketId", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    await admin.auth().verifyIdToken(token);
    const marketId = req.params.marketId;

    const marketDoc = await db.collection("markets").doc(marketId).get();

    if (!marketDoc.exists) {
      return res.status(404).json({ message: "Market not found" });
    }

    const data = marketDoc.data();
    const market = {
      id: marketDoc.id,
      ...data,
      createdAt:
        data.createdAt instanceof admin.firestore.Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt,
      expiresAt:
        data.expiresAt instanceof admin.firestore.Timestamp
          ? data.expiresAt.toDate().toISOString()
          : data.expiresAt,
    };

    res.status(200).json(market);
  } catch (error) {
    console.error("Error fetching market:", error);
    res.status(500).json({
      message: "Failed to fetch market",
      error: error.message,
    });
  }
});

app.delete("/markets/:marketId", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    const marketId = req.params.marketId;

    await db.collection("markets").doc(marketId).delete();
    res.status(200).json({ message: "Market deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete market" });
  }
});

// Add this endpoint
app.get("/leaderboard", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    await admin.auth().verifyIdToken(token);

    const usersSnapshot = await db
      .collection("users")
      .orderBy("tokens", "desc")
      .limit(100)
      .get();

    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      displayName: doc.data().name,
      profilePhoto: doc.data().profilePhoto,
      tokens: doc.data().tokens,
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// Add endpoint to get market price history
app.get("/markets/:marketId/prices", async (req, res) => {
  try {
    const marketId = req.params.marketId;
    const marketDoc = await db.collection("markets").doc(marketId).get();

    if (!marketDoc.exists) {
      return res.status(404).json({ message: "Market not found" });
    }

    const marketData = marketDoc.data();
    res.status(200).json({
      currentPrice: marketData.currentPrice,
      priceHistory: marketData.priceHistory || [],
    });
  } catch (error) {
    console.error("Error fetching market prices:", error);
    res.status(500).json({ message: "Failed to fetch market prices" });
  }
});

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// Add this new endpoint for resolution requests
app.post("/markets/:marketId/resolution-requests", async (req, res) => {
  try {
    const { marketId } = req.params;
    const { outcome, resolutionDetails, evidenceUrl, resolvedAt } = req.body;
    const token = req.headers["authorization"]?.split("Bearer ")[1];

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if the market exists
    const marketRef = db.collection("markets").doc(marketId);
    const marketDoc = await marketRef.get();

    if (!marketDoc.exists) {
      return res.status(404).json({ message: "Market not found" });
    }

    // Store the resolution request in Firestore
    const resolutionRequest = {
      marketId,
      outcome,
      resolutionDetails,
      evidenceUrl,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      resolvedAt: resolvedAt,
      submittedBy: userId,
      status: "pending", // All requests start as pending
    };

    // Create a resolution request document
    const resolutionsRef = db.collection(
      `markets/${marketId}/resolutionRequests`
    );
    const resolutionDoc = await resolutionsRef.add(resolutionRequest);
    const resolutionId = resolutionDoc.id;

    res.status(201).json({
      message: "Resolution request submitted successfully",
      resolutionId: resolutionId,
    });
  } catch (error) {
    console.error("Error submitting resolution request:", error);
    res.status(500).json({
      message: error.message || "Error submitting resolution request",
    });
  }
});

// Add this function to verify/set admin status
async function verifyAdminStatus(userId) {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.log("User document doesn't exist");
    return false;
  }

  const userData = userDoc.data();
  console.log("User data in verify:", userData);

  // If isAdmin is not a boolean, update it
  if (typeof userData.isAdmin !== "boolean") {
    console.log("Fixing isAdmin type");
    await userRef.update({
      isAdmin: Boolean(userData.isAdmin),
    });
    return Boolean(userData.isAdmin);
  }

  return userData.isAdmin === true;
}

// Update the admin endpoint to use this function
app.get("/admin/resolution-requests", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Verify admin status
    const isAdmin = await verifyAdminStatus(userId);
    console.log("Admin status verified:", isAdmin);

    if (!isAdmin) {
      return res.status(403).json({
        message: "Unauthorized: Admin access required",
        debug: { userId },
      });
    }

    // Get all markets that have resolution requests
    const resolutionRequests = [];

    // Get all markets first
    const marketsSnapshot = await db.collection("markets").get();

    // For each market, get its resolution requests
    for (const marketDoc of marketsSnapshot.docs) {
      const marketId = marketDoc.id;
      const marketData = marketDoc.data();

      const requestsSnapshot = await db
        .collection(`markets/${marketId}/resolutionRequests`)
        .where("status", "==", "pending")
        .get();

      // Add each request with market data
      requestsSnapshot.docs.forEach((doc) => {
        resolutionRequests.push({
          id: doc.id,
          marketId,
          marketTitle: marketData.title,
          ...doc.data(),
          submittedAt:
            doc.data().submittedAt?.toDate?.()?.toISOString() ||
            doc.data().submittedAt,
        });
      });
    }

    console.log("Sending resolution requests:", resolutionRequests);
    res.status(200).json(resolutionRequests);
  } catch (error) {
    console.error("Error fetching resolution requests:", error);
    res.status(500).json({
      message: "Error fetching resolution requests",
      error: error.message,
    });
  }
});

// Add this endpoint to update resolution request status
app.patch(
  "/markets/:marketId/resolution-requests/:requestId",
  async (req, res) => {
    try {
      const { marketId, requestId } = req.params;
      const { status } = req.body;
      const token = req.headers["authorization"]?.split("Bearer ")[1];

      if (!token) {
        return res.status(403).json({ message: "No token provided" });
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Verify if the user is an admin
      const userRef = db.collection("users").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists || userDoc.data().role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Update resolution request status
      const resolutionRef = db
        .collection(`markets/${marketId}/resolutionRequests`)
        .doc(requestId);
      await resolutionRef.update({
        status,
        resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
        resolvedBy: userId,
      });

      res.json({ message: `Resolution request ${status} successfully.` });
    } catch (error) {
      console.error("Error updating resolution request:", error);
      res.status(500).json({ message: "Error updating resolution request" });
    }
  }
);

// Get all pending resolution requests across all markets
app.get("/resolution-requests/pending", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split("Bearer ")[1];

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    await admin.auth().verifyIdToken(token);

    // Get all markets that are not yet resolved
    const marketsSnapshot = await db
      .collection("markets")
      .where("resolved", "==", false)
      .get();

    const pendingRequests = [];

    // For each unresolved market, get its pending resolution requests
    for (const marketDoc of marketsSnapshot.docs) {
      const marketId = marketDoc.id;
      const marketData = marketDoc.data();

      const requestsSnapshot = await db
        .collection(`markets/${marketId}/resolutionRequests`)
        .where("status", "==", "pending")
        .orderBy("submittedAt", "desc")
        .get();

      // Add each request with associated market data
      requestsSnapshot.docs.forEach((doc) => {
        pendingRequests.push({
          id: doc.id,
          marketId,
          marketTitle: marketData.title,
          marketDescription: marketData.description,
          ...doc.data(),
          submittedAt:
            doc.data().submittedAt?.toDate?.()?.toISOString() ||
            doc.data().submittedAt,
        });
      });
    }

    res.status(200).json({
      count: pendingRequests.length,
      requests: pendingRequests,
    });
  } catch (error) {
    console.error("Error fetching pending resolution requests:", error);
    res.status(500).json({
      message: "Error fetching pending resolution requests",
      error: error.message,
    });
  }
});

// Add endpoint to reject a resolution request
app.delete(
  "/markets/:marketId/resolution-requests/:requestId",
  async (req, res) => {
    try {
      const { marketId, requestId } = req.params;
      const token = req.headers["authorization"]?.split("Bearer ")[1];

      if (!token) {
        return res.status(403).json({ message: "No token provided" });
      }

      // Verify the token and get user ID
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Verify if user is admin
      const isAdmin = await verifyAdminStatus(userId);
      if (!isAdmin) {
        return res
          .status(403)
          .json({ message: "Unauthorized: Admin access required" });
      }

      // Delete the resolution request
      const requestRef = db
        .collection("markets")
        .doc(marketId)
        .collection("resolutionRequests")
        .doc(requestId);

      await requestRef.delete();

      res.status(200).json({
        message: "Resolution request rejected and removed successfully",
      });
    } catch (error) {
      console.error("Error rejecting resolution request:", error);
      res.status(500).json({
        message: "Failed to reject resolution request",
        error: error.message,
      });
    }
  }
);

// Accept resolution request and resolve market
app.post(
  "/markets/:marketId/resolution-requests/:requestId/accept",
  async (req, res) => {
    try {
      const { marketId, requestId } = req.params;
      const token = req.headers["authorization"]?.split("Bearer ")[1];

      if (!token) {
        return res.status(403).json({ message: "No token provided" });
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      await db.runTransaction(async (transaction) => {
        // Get all necessary documents
        const marketRef = db.collection("markets").doc(marketId);
        const marketDoc = await transaction.get(marketRef);
        const requestRef = db
          .collection("markets")
          .doc(marketId)
          .collection("resolution-requests")
          .doc(requestId);
        const requestDoc = await transaction.get(requestRef);

        if (!marketDoc.exists || !requestDoc.exists) {
          throw new Error("Market or resolution request not found");
        }

        const marketData = marketDoc.data();
        const requestData = requestDoc.data();

        // Verify market creator
        if (marketData.createdBy !== userId) {
          throw new Error("Only market creator can accept resolution");
        }

        // Get all bets for this market
        const betsRef = marketRef.collection("bets");
        const betsSnapshot = await transaction.get(betsRef);

        const totalPool = marketData.totalAmount;
        const winningPool =
          requestData.outcome === "yes"
            ? marketData.yesAmount
            : marketData.noAmount;

        // Process each bet with dynamic pricing
        const payoutPromises = betsSnapshot.docs.map(async (betDoc) => {
          const betData = betDoc.data();
          const betUserRef = db.collection("users").doc(betData.userId);
          const userDoc = await transaction.get(betUserRef);

          if (!userDoc.exists) return;

          const userData = userDoc.data();
          let payout = 0;

          if (betData.position === requestData.outcome) {
            // Calculate payout based on bet's effective price
            const priceAdjustment =
              betData.position === "yes"
                ? 1 / betData.effectivePrice
                : 1 / (1 - betData.effectivePrice);

            // Payout formula: (bet amount / winning pool) * total pool * price adjustment
            payout =
              (betData.amount / winningPool) * totalPool * priceAdjustment;
            payout = Math.round(payout * 100) / 100; // Round to 2 decimal places
          }

          // Update user's bets and tokens
          const updatedActiveBets = (userData.activeBets || []).filter(
            (bet) => bet.marketId !== marketId
          );

          const resolvedBet = {
            marketId,
            marketTitle: marketData.title,
            amount: betData.amount,
            position: betData.position,
            effectivePrice: betData.effectivePrice,
            outcome: requestData.outcome,
            payout,
            resolvedAt: new Date().toISOString(),
          };

          transaction.update(betUserRef, {
            tokens: userData.tokens + payout,
            activeBets: updatedActiveBets,
            resolvedBets: admin.firestore.FieldValue.arrayUnion(resolvedBet),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          return { userId: betData.userId, payout };
        });

        const payouts = await Promise.all(payoutPromises);

        // Update market status
        transaction.update(marketRef, {
          status: "resolved",
          winningOutcome: requestData.outcome,
          payoutsDistributed: true,
          resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
          finalPayouts: payouts.filter((p) => p),
        });

        // Update resolution request
        transaction.update(requestRef, {
          status: "accepted",
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      res.status(200).json({
        message: "Resolution request accepted and payouts distributed",
      });
    } catch (error) {
      console.error("Error accepting resolution request:", error);
      res.status(500).json({
        message: error.message || "Failed to accept resolution request",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
