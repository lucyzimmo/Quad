import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { marketService } from "../services/marketService";
import { Navbar } from "../components/navbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface SimilarMarket {
  id: string;
  title: string;
  description: string;
}

export function CreateMarket() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minimumBet, setMinimumBet] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [similarMarket, setSimilarMarket] = useState<SimilarMarket | null>(null);
  const [marketId, setMarketId] = useState<string | null>(null);
  const [expirationDate, setExpirationDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return new Date(date.setMinutes(0)).toISOString().slice(0, 16);
  });
  const [category, setCategory] = useState("Politics");

  useEffect(() => {
    const fetchMarket = async (id: string) => {
      const market = await marketService.getMarket(id);
      setTitle(market.title);
      setDescription(market.description);
      setMinimumBet(market.minimumBet);
      setMarketId(market.id);
    };

    if (marketId) {
      fetchMarket(marketId);
    }
  }, [marketId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSimilarMarket(null);

    try {
      await marketService.createMarket({
        title,
        description,
        expiresAt: new Date(expirationDate).toISOString(),
        minimumBet,
        category,
      });
      navigate("/markets");
    } catch (err: any) {
      console.error("Error creating market:", err);
      
      // Check if the error contains similar market information
      if (err.similarMarket) {
        setSimilarMarket(err.similarMarket);
        setError("A similar market already exists");
      } else {
        setError(
          err.message === "Failed to create market"
            ? "Unable to create market. Please try again later."
            : err.message ||
              "An unexpected error occurred while creating the market"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (marketId) {
      setIsLoading(true);
      try {
        await marketService.deleteMarket(marketId);
        navigate("/markets");
      } catch (err) {
        console.error("Error deleting market:", err);
        setError("Failed to delete market");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate("/markets")}
              className="text-gray-600 hover:text-gray-900"
            >
              <span className="flex items-center gap-2">← Back to Markets</span>
            </Button>
            <h1 className="text-3xl flex items-center gap-2 font-bold text-black">
              Create New Market
            </h1>
          </div>

          {error && (
            <div className="bg-red-50 text-cardinal-red p-4 rounded-lg mb-6">
              <p className="font-medium">{error}</p>
              {similarMarket && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700 mb-2">Similar market found:</p>
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h3 className="font-medium text-black">{similarMarket.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{similarMarket.description}</p>
                    <Button
                      onClick={() => navigate(`/market/${similarMarket.id}`)}
                      className="mt-3 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      View Similar Market
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-100 rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="title"
                  className="text-lg block font-medium text-gray-700 mb-2"
                >
                  Market Question
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                  placeholder="E.g., Will Stanford win the next game?"
                  className="mt-1 bg-white border border-gray-300 text-black focus:ring-2 focus:ring-cardinal-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Provide more details about your market..."
                  className="mt-1 bg-white border border-gray-300 text-black focus:ring-2 focus:ring-cardinal-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="minimumBet"
                  className="block text-sm font-medium text-gray-700"
                >
                  Minimum Bet (tokens)
                </Label>
                <Input
                  type="number"
                  id="minimumBet"
                  min="10"
                  max="1000"
                  value={minimumBet}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMinimumBet(Number(e.target.value))
                  }
                  className="mt-1 bg-white border border-gray-300 text-black focus:ring-2 focus:ring-cardinal-red focus:border-transparent"
                  placeholder="Enter minimum bet amount (10-1000)"
                />
                <span className="text-sm text-gray-500 mt-1 block">
                  Minimum bet must be between 10 and 1000 tokens
                </span>
              </div>

              <div>
                <Label
                  htmlFor="expirationDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Market Expiration Date and Time
                </Label>
                <input
                  type="datetime-local"
                  id="expirationDate"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="mt-1 block w-full rounded-md bg-white border border-gray-300 text-black 
                    focus:ring-2 focus:ring-cardinal-red focus:border-transparent"
                />
                <span className="text-sm text-gray-500 mt-1 block">
                  Select when this market will close
                </span>
              </div>

              <div>
                <Label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Market Category
                </Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                >
                  <SelectTrigger className="mt-1 bg-white border border-gray-300 text-black focus:ring-2 focus:ring-cardinal-red focus:border-transparent">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Politics">Politics</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Culture">Culture</SelectItem>
                    <SelectItem value="Academics">Academics</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500 mt-1 block">
                  Choose the most relevant category for your market
                </span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cardinal-red text-white hover:bg-cardinal-red-hover transition-colors"
              >
                {isLoading ? "Creating..." : "Create Market"}
              </Button>

              {marketId && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="w-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  {isLoading ? "Deleting..." : "Delete Market"}
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
