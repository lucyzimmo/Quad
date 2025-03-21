import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import "./home.css";
import { useNavigate } from "react-router-dom";
import { getMarkets } from "../data/markets.ts";
import { Navbar } from "../components/navbar";
import { TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export default function Home() {
  const markets = getMarkets();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-6xl font-bold mb-6 text-black">
            Predict. Bet. Win.
          </h1>
          <p className="text-xl text-black-600 mb-12">
            Join Stanford's first prediction market for campus events. Use your
            tokens to forecast everything from sports outcomes to campus
            happenings.
          </p>
          <Button
            onClick={() => navigate("/signup")}
            className="text-white bg-cardinal-red hover:bg-cardinal-red-hover text-black px-8 py-3 rounded-lg text-lg"
          >
            Start Predicting
          </Button>
        </div>
      </section>

      {/* Trending Markets */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            <h2 className="text-3xl font-bold text-black">Trending Markets</h2>
          </div>
          <button
            onClick={() => navigate("/markets")}
            className="text-white bg-cardinal-red hover:bg-cardinal-red-hover px-4 py-2 rounded-lg text-lg hover:border-transparent focus:outline-none focus:ring-0"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <Card
              key={market.id}
              className="bg-gray-100 hover:-translate-y-1 transition-transform"
            >
              <CardContent className="pt-6 pb-4">
                <h3 className="text-xl font-bold text-black mb-2">
                  {market.title}
                </h3>
                <p className="text-gray-600">{market.description}</p>
                <div className="mt-4 mb-4 text-sm">
                  <span className="text-palo-alto-green">
                    {market.yesPercentage}% Yes
                  </span>
                  <span className="text-gray-500"> · </span>
                  <span className="text-cardinal-red">
                    {market.noPercentage}% No
                  </span>
                </div>
                <Button
                  onClick={() => navigate(`/market/${market.id}`)}
                  className="w-full bg-gray-200 text-black hover:bg-gray-300 transition-colors hover:border-transparent focus:outline-none focus:ring-0"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
