import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../lib/firebase";

const API_URL = "http://localhost:8000";

const storage = getStorage();

export interface Market {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  yesAmount: number;
  noAmount: number;
  totalAmount: number;
  minimumBet: number;
  resolved?: boolean;
  outcome?: boolean;
  initialYesPercentage?: number;
  initialNoPercentage?: number;
  category: string;
}

export interface CreateMarketData {
  title: string;
  description: string;
  expiresAt: string;
  minimumBet: number;
  category: string;
}

export interface PlaceBetData {
  marketId: string;
  position: "yes" | "no";
  amount: number;
}

interface CommentData {
  text: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  createdAt: string;
}
interface ResolutionData {
  outcome: "yes" | "no";
  resolutionDetails: string;
  evidenceUrl: string | null;
  resolvedAt: string;
}

// Add this interface for resolution requests
export interface ResolutionRequest {
  id?: string;
  marketId: string;
  outcome: "yes" | "no";
  resolutionDetails: string;
  evidenceUrl: string | null;
  resolvedAt: string;
  resolvedBy: string;
  status: "pending" | "approved" | "rejected";
}

export const marketService = {
  async createMarket(data: CreateMarketData) {
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      let imageUrl = null;

      // Create market data with image URL
      const marketData = {
        title: data.title,
        description: data.description,
        expiresAt: data.expiresAt,
        minimumBet: data.minimumBet,
        category: data.category,
        imageUrl: imageUrl,
      };

      const response = await fetch(`${API_URL}/markets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(marketData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error = new Error(
          responseData.message || "Failed to create market"
        );
        if (responseData.similarMarket) {
          // @ts-ignore
          error.similarMarket = responseData.similarMarket;
        }
        throw error;
      }

      return responseData;
    } catch (error) {
      console.error("Error creating market:", error);
      throw error;
    }
  },

  async placeBet(data: PlaceBetData) {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    const response = await fetch(`${API_URL}/markets/${data.marketId}/bets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        position: data.position,
        amount: data.amount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to place bet");
    }

    return response.json();
  },

  async getMarket(id: string): Promise<Market> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    const response = await fetch(`${API_URL}/markets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch market");
    }

    return response.json();
  },

  async getAllMarkets(): Promise<Market[]> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      throw new Error("No authentication token available");
    }

    console.log("Making request to:", `${API_URL}/markets`);
    console.log("With token:", token.substring(0, 20) + "...");

    const response = await fetch(`${API_URL}/markets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Market fetch error response:", response.status, errorData);
      throw new Error(errorData.message || "Failed to fetch markets");
    }

    const data = await response.json();
    console.log("Received markets data:", data);
    return data;
  },

  async deleteMarket(id: string): Promise<void> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    const response = await fetch(`${API_URL}/markets/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete market");
    }
  },

  async resolveMarket(id: string): Promise<void> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    const response = await fetch(`${API_URL}/markets/${id}/resolve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to close market");
    }
  },

  async getMarketBets(marketId: string): Promise<any[]> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();

    const response = await fetch(`${API_URL}/markets/${marketId}/bets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch bets");
    }

    return response.json();
  },

  async getMarketComments(marketId: string): Promise<Comment[]> {
    try {
      const commentsRef = collection(db, `markets/${marketId}/comments`);
      const q = query(commentsRef, orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Comment)
      );
    } catch (error) {
      console.error("Error getting comments:", error);
      throw error;
    }
  },

  async addComment(marketId: string, commentData: CommentData): Promise<void> {
    try {
      if (!marketId) throw new Error("Market ID is required");

      const commentsRef = collection(db, `markets/${marketId}/comments`);

      const newComment = {
        ...commentData,
        createdAt: new Date().toISOString(),
        deleted: false,
      };

      await addDoc(commentsRef, newComment);
    } catch (error) {
      console.error("Error adding comment:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to add comment"
      );
    }
  },

  async subscribeToComments(
    marketId: string,
    callback: (comments: Comment[]) => void
  ) {
    const commentsRef = collection(db, `markets/${marketId}/comments`);
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const comments = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Comment)
        );
        callback(comments);
      },
      (error) => {
        console.error("Error subscribing to comments:", error);
      }
    );
  },

  async getUserProfile(userId: string) {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },
  async submitResolutionRequest(
    marketId: string,
    resolutionData: ResolutionData
  ): Promise<void> {
    const auth = getAuth();
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Not authenticated");

    // Send resolution request to the backend API
    const response = await fetch(
      `${API_URL}/markets/${marketId}/resolution-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resolutionData),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Failed to submit resolution request");
    }

    return await response.json();
  },
};
