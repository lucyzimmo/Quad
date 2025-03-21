import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Market, marketService } from "../services/marketService";
import { Navbar } from "../components/navbar";
import { Spinner } from "../components/ui/spinner";
import { auth } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useBetPlacedAnimation } from "../hooks/useBetPlacedAnimation";

interface Bet {
  amount: number;
  position: "yes" | "no";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  text: string;
  createdAt: string;
}

export function MarketDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [market, setMarket] = useState<Market | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [betChoice, setBetChoice] = useState<"yes" | "no">("yes");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBet, setUserBet] = useState<Bet | null>(null);
  const [betPlacedAnimation, setBetPlacedAnimation] = useBetPlacedAnimation();
  const { currentUser, refreshUserProfile } = useAuth();
  const [isCreator, setIsCreator] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [potentialPayout, setPotentialPayout] = useState(0);
  const commentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMarketAndData = async () => {
      try {
        if (!id) return;
        setIsLoading(true);
        const [marketData, betsData, commentsData] = await Promise.all([
          marketService.getMarket(id),
          marketService.getMarketBets(id),
          marketService.getMarketComments(id),
        ]);
        setMarket(marketData);
        setComments(commentsData);

        // Find user's bet if it exists
        if (currentUser) {
          const userBet = betsData.find(
            (bet) => bet.userId === currentUser.uid
          );
          if (userBet) {
            setUserBet(userBet);
            setBetAmount(userBet.amount);
            setBetChoice(userBet.position);
          } else {
            setBetAmount(marketData.minimumBet);
          }
        }
      } catch (err) {
        console.error("Error fetching market data:", err);
        setError("Failed to load market");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketAndData();
  }, [id, currentUser]);

  useEffect(() => {
    const checkCreator = async () => {
      if (market && auth.currentUser) {
        setIsCreator(market.createdBy === auth.currentUser.uid);
      }
    };
    checkCreator();
  }, [market]);

  useEffect(() => {
    // Calculate potential payout based on current bet amount and choice
    if (market) {
      const probability =
        betChoice === "yes"
          ? market.yesAmount / market.totalAmount
          : market.noAmount / market.totalAmount;

      // If probability is 0, set a default value to avoid division by zero
      const effectiveProbability = probability === 0 ? 0.5 : probability;

      // Calculate potential payout (simplified for demonstration)
      // In a real prediction market, this would use a more complex formula
      const estimatedPayout = betAmount / effectiveProbability;
      setPotentialPayout(Math.round(estimatedPayout * 100) / 100);
    }
  }, [betAmount, betChoice, market]);

  useEffect(() => {
    let unsubscribe: () => void;

    const setupSubscription = async () => {
      unsubscribe = await marketService.subscribeToComments(
        id || "",
        (newComments) => {
          setComments(newComments);
        }
      );
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id]);

  const handlePlaceBet = async () => {
    if (!market || !id || betAmount <= 0) return;
    if (isCreator) {
      setError("As the creator of this market, you cannot place bets on it.");
      return;
    }

    try {
      setIsPlacingBet(true);
      setError(null);

      await marketService.placeBet({
        marketId: id,
        position: betChoice,
        amount: betAmount,
      });

      // Show success animation
      setBetPlacedAnimation(true);

      // Navigate to bet confirmation page
      navigate("/bet-confirmation", {
        state: {
          marketTitle: market.title,
          betAmount: betAmount,
          betChoice: betChoice,
          potentialPayout: potentialPayout,
          marketId: id,
        },
      });

      // Refresh all data
      const [updatedMarket, betsData] = await Promise.all([
        marketService.getMarket(id),
        marketService.getMarketBets(id),
      ]);

      await refreshUserProfile();

      setMarket(updatedMarket);

      // Update user's bet info
      if (currentUser) {
        const newUserBet = betsData.find(
          (bet) => bet.userId === currentUser.uid
        );
        if (newUserBet) {
          setUserBet(newUserBet);
        }
      }
    } catch (err) {
      console.error("Error placing bet:", err);
      setError("Failed to place bet");
    } finally {
      setIsPlacingBet(false);
    }
  };

  const handlePostComment = async () => {
    if (!id || !currentUser || !newComment.trim()) {
      return;
    }

    try {
      setIsPostingComment(true);
      setError(null);

      const userProfile = await marketService.getUserProfile(currentUser.uid);
      const userName = userProfile?.name || "Anonymous User";

      await marketService.addComment(id, {
        text: newComment.trim(),
        userId: currentUser.uid,
        userName: userName,
        createdAt: new Date().toISOString(),
      });

      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setIsPostingComment(false);
    }
  };

  const isMarketExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
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

  if (!market) return <div>Market not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate("/markets")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span className="text-xl">←</span>
              <span>Back to Markets</span>
            </button>

            {!isMarketExpired(market.expiresAt) && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => navigate("/resolve/" + id)}
                  className="bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  Resolve a market
                </Button>
                <div className="relative group">
                  <div className="cursor-help w-6 h-6 flex items-center justify-center rounded-full bg-amber-100 text-gray-500 hover:bg-gray-200">
                    ?
                  </div>
                  <div className="absolute hidden group-hover:block w-72 p-3 bg-white shadow-xl rounded-lg top-full right-0 mt-2 z-10 border border-gray-200">
                    <div className="text-sm text-left">
                      <p className="font-medium text-gray-900 mb-2">
                        What is resolving a market?
                      </p>
                      <p className="text-gray-600">
                        Resolving a market means determining its final outcome
                        (Yes or No). Anyone can submit a resolution request with
                        evidence, which will be reviewed before payouts are
                        distributed to winning bettors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Market Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-black">{market?.title}</h1>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isMarketExpired(market.expiresAt)
                    ? "bg-gray-100 text-gray-600"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {isMarketExpired(market.expiresAt) ? "Closed" : "Live"}
              </div>
            </div>

            <p className="text-gray-600 mb-4">{market?.description}</p>

            {/* Add Percentages Display */}
            <div className="mb-6">
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

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                Created{" "}
                {formatDistanceToNow(new Date(market?.createdAt || ""), {
                  addSuffix: true,
                })}
              </span>
              <span>•</span>
              <span>
                Expires{" "}
                {formatDistanceToNow(new Date(market?.expiresAt || ""), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {/* Disable betting if market is expired */}
          {!isMarketExpired(market.expiresAt) ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-black mb-4">
                Place Your Bet
              </h2>

              {isCreator ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  As the creator of this market, you cannot place bets on it.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Betting Interface */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setBetChoice("yes")}
                      className={`flex-1 h-16 text-lg font-semibold transition-all ${
                        betChoice === "yes"
                          ? "bg-palo-alto-green text-white ring-2 ring-offset-2 ring-palo-alto-green"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-palo-alto-green"
                      }`}
                    >
                      Yes {userBet?.position === "yes" && "✓"}
                    </Button>
                    <Button
                      onClick={() => setBetChoice("no")}
                      className={`flex-1 h-16 text-lg font-semibold transition-all ${
                        betChoice === "no"
                          ? "bg-cardinal-red text-white ring-2 ring-offset-2 ring-cardinal-red"
                          : "bg-white border-2 border-gray-200 text-gray-700 hover:border-cardinal-red"
                      }`}
                    >
                      No {userBet?.position === "no" && "✓"}
                    </Button>
                  </div>

                  {/* Integrated Bet Amount and Payout Calculator */}
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-6 space-y-4">
                      <div className="flex items-end gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            Bet Amount
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={market?.minimumBet || 10}
                              value={betAmount}
                              onChange={(e) =>
                                setBetAmount(Number(e.target.value))
                              }
                              className="w-full bg-white text-black text-2xl font-bold p-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-cardinal-red focus:border-transparent"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                              tokens
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 mt-1 block">
                            Min bet: {market?.minimumBet} tokens
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm font-medium text-gray-600 mb-2">
                            Potential Win
                          </span>
                          <div className="flex items-center justify-end gap-2">
                            <span className="block text-2xl font-bold text-palo-alto-green">
                              {potentialPayout === 0 || market.totalAmount === 0
                                ? "No bets yet!"
                                : `${potentialPayout} tokens`}
                            </span>
                            <div className="relative group">
                              <div className="cursor-help w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                                ?
                              </div>
                              <div className="absolute hidden group-hover:block w-72 p-3 bg-white shadow-xl rounded-lg -top-2 left-0 transform -translate-x-full z-10 border border-gray-200">
                                <div className="text-sm text-left">
                                  <p className="font-medium text-gray-900 mb-2">
                                    How is this calculated?
                                  </p>
                                  <div className="space-y-1 text-gray-600">
                                    <p>
                                      1. Current pool ratio:{" "}
                                      {betChoice === "yes"
                                        ? market.yesAmount
                                        : market.noAmount}{" "}
                                      / {market.totalAmount} ={" "}
                                      {(
                                        ((betChoice === "yes"
                                          ? market.yesAmount
                                          : market.noAmount) /
                                          market.totalAmount) *
                                        100
                                      ).toFixed(1)}
                                      %
                                    </p>
                                    <p>
                                      2. Odds multiplier = 1 /{" "}
                                      {(
                                        ((betChoice === "yes"
                                          ? market.yesAmount
                                          : market.noAmount) /
                                          market.totalAmount) *
                                        100
                                      ).toFixed(1)}
                                      % ={" "}
                                      {(
                                        1 /
                                        ((betChoice === "yes"
                                          ? market.yesAmount
                                          : market.noAmount) /
                                          market.totalAmount)
                                      ).toFixed(2)}
                                      x
                                    </p>
                                    <p>
                                      3. Your potential win = {betAmount} ×{" "}
                                      {(
                                        1 /
                                        ((betChoice === "yes"
                                          ? market.yesAmount
                                          : market.noAmount) /
                                          market.totalAmount)
                                      ).toFixed(2)}{" "}
                                      = {potentialPayout} tokens
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            at{" "}
                            {betChoice === "yes"
                              ? (
                                  (market.yesAmount / market.totalAmount) *
                                    100 || 50
                                ).toFixed(1)
                              : (
                                  (market.noAmount / market.totalAmount) *
                                    100 || 50
                                ).toFixed(1)}
                            % odds
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                        <p>
                          <span className="font-semibold">
                            How payouts work:{" "}
                          </span>
                          {market.totalAmount === 0 ? (
                            "Lower odds = higher potential payout. Be the first to bet on this market!"
                          ) : (
                            <>
                              Lower odds = higher potential payout. At{" "}
                              {betChoice === "yes"
                                ? (
                                    (market.yesAmount / market.totalAmount) *
                                      100 || 50
                                  ).toFixed(1)
                                : (
                                    (market.noAmount / market.totalAmount) *
                                      100 || 50
                                  ).toFixed(1)}
                              % odds, you'll win{" "}
                              {(potentialPayout / betAmount).toFixed(2)}x your
                              bet if you're right.
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handlePlaceBet}
                      disabled={
                        isPlacingBet || betAmount < (market?.minimumBet || 10)
                      }
                      className={`w-full p-6 text-lg font-semibold rounded-none transition-all ${
                        isPlacingBet || betAmount < (market?.minimumBet || 10)
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : betChoice === "yes"
                          ? "bg-palo-alto-green text-white hover:bg-opacity-90"
                          : "bg-cardinal-red text-white hover:bg-opacity-90"
                      }`}
                    >
                      {isPlacingBet
                        ? "Placing Bet..."
                        : betAmount < (market?.minimumBet || 10)
                        ? `Minimum bet is ${market?.minimumBet} tokens`
                        : `Place ${betAmount} Token Bet on ${betChoice.toUpperCase()}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-8 text-gray-500">
                This market has closed. No more bets can be placed.
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-black mb-4">
              Discussion ({comments.length})
            </h2>

            <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 p-2">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {comment.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No comments yet. Be the first to start the discussion!
                </div>
              )}
            </div>

            {currentUser ? (
              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your thoughts..."
                  className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cardinal-red focus:border-transparent resize-none bg-white text-gray-700"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handlePostComment}
                    disabled={isPostingComment || !newComment.trim()}
                    className={`${
                      isPostingComment || !newComment.trim()
                        ? "bg-gray-300"
                        : "bg-cardinal-red hover:bg-cardinal-red-hover"
                    } text-white px-6`}
                  >
                    {isPostingComment ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Please{" "}
                <a href="/login" className="text-cardinal-red hover:underline">
                  sign in
                </a>{" "}
                to join the discussion.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
