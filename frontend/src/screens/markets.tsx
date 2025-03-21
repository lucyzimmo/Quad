import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../components/navbar";
import { Market, marketService } from "../services/marketService";
import { Spinner } from "../components/ui/spinner";
import { auth } from "../lib/firebase";
import { AnimatedCard } from "../components/ui/animated-card";

// Define market categories
const CATEGORIES = [
  "All",
  "Politics",
  "Sports",
  "Culture",
  "Academics",
  "Entertainment",
  "Food",
];

type SortOption = "Trending" | "New";

export function Markets() {
  const navigate = useNavigate();
  const location = useLocation();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState<SortOption>("New");

  // Get category from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("category");
    if (category && CATEGORIES.includes(category)) {
      setSelectedCategory(category);
    }
  }, [location]);

  const sortMarkets = (marketsToSort: Market[]) => {
    if (sortOption === "Trending") {
      return [...marketsToSort].sort((a, b) => b.totalAmount - a.totalAmount);
    } else {
      // Sort by New (creation date)
      return [...marketsToSort].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    }
  };

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate("/login");
          return;
        }

        const token = await currentUser.getIdToken(true);
        console.log("Token available:", token.substring(0, 20) + "...");

        const data = await marketService.getAllMarkets();

        // First filter out resolved markets, then apply category filter
        let filteredMarkets = data.filter(market => !market.resolved);
        
        if (selectedCategory !== "All") {
          filteredMarkets = filteredMarkets.filter(
            (market) => market.category === selectedCategory
          );
        }

        // Sort the filtered markets
        filteredMarkets = sortMarkets(filteredMarkets);
        setMarkets(filteredMarkets);
      } catch (err) {
        console.error("Error fetching markets:", err);
        setError("Failed to load markets");
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchMarkets();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate, selectedCategory, sortOption]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    navigate(`/markets?category=${category}`);
  };

  const getPercentages = (market: Market) => {
    if (market.totalAmount === 0) {
      return {
        yes: market.initialYesPercentage || 50,
        no: market.initialNoPercentage || 50,
      };
    }
    return {
      yes: (market.yesAmount / market.totalAmount) * 100,
      no: (market.noAmount / market.totalAmount) * 100,
    };
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
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-28 container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Navigation and Sort Dropdown */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-4">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-5 py-2 whitespace-nowrap rounded-full border-2 transition-all ${
                        selectedCategory === category
                          ? "bg-cardinal-red text-white font-medium border-cardinal-red"
                          : "text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="appearance-none px-5 py-2 pr-10 rounded-full border-2 border-gray-300 hover:border-gray-400 bg-white text-gray-700 cursor-pointer focus:outline-none font-medium"
                  >
                    <option value="New">Sort: New</option>
                    <option value="Trending">Sort: Trending</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => navigate("/create")}
                className="text-white bg-cardinal-red hover:bg-cardinal-red-hover px-4 py-2 rounded-lg text-lg ml-4"
              >
                Create Market
              </Button>
            </div>
          </div>

          {/* Markets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market, index) => (
              <AnimatedCard
                key={market.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/market/${market.id}`)}
              >
                <div className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300 rounded-lg border border-gray-200">
                  {/* Live Badge - Positioned better */}
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center space-x-2 bg-black bg-opacity-60 px-3 py-1 rounded-full">
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-palo-alto-green opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-palo-alto-green"></span>
                      </span>
                      <span className="text-xs font-medium text-white">
                        Live
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-bold text-black mb-2 hover:text-cardinal-red transition-colors">
                      {market.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 mb-4">
                      {market.description}
                    </p>

                    <div className="space-y-3">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="text-palo-alto-green font-semibold">
                            Yes: {getPercentages(market).yes.toFixed(1)}%
                          </div>
                          <div className="text-cardinal-red font-semibold">
                            No: {getPercentages(market).no.toFixed(1)}%
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{
                              width: `${getPercentages(market).yes}%`,
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-palo-alto-green transition-all duration-500"
                          />
                          <div
                            style={{
                              width: `${getPercentages(market).no}%`,
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cardinal-red transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trading Volume Indicator */}
                    <div className="mt-4 text-sm text-gray-500">
                      ${market.totalAmount.toLocaleString()} traded
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
