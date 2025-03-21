const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("../config/firebase_key.json"))
});

const db = admin.firestore();

async function seedFirestore() {
  try {
    console.log("🔥 Seeding Firestore...");

    // Create a sample user
    const userRef = db.collection("users").doc("user123");
    await userRef.set({
      name: "John Doe",
      email: "john@example.com",
      tokens: 1000,
      profilePhoto: "https://example.com/photo.jpg",
      activeBets: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ User seeded");

    // Create a sample market
    const marketRef = db.collection("markets").doc("market123");
    await marketRef.set({
      question: "Will Stanford win the next game?",
      createdBy: "user123",
      status: "open",
      totalBets: 0,
      options: ["Yes", "No"],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ Market seeded");

    // Add a sample bet to the market
    const betRef = marketRef.collection("bets").doc("bet456");
    await betRef.set({
      userId: "user123",
      amount: 50,
      position: "Yes",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ Bet seeded");

    console.log("🎉 Firestore seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding Firestore:", error);
  }
}

// Run the script
seedFirestore();
