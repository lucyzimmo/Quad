import { Navbar } from "../components/navbar";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { auth } from "../lib/firebase";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { marketService } from "../services/marketService";

interface ResolutionRequest {
  id: string;
  marketId: string;
  marketTitle: string;
  outcome: string;
  resolutionDetails: string;
  evidenceUrl?: string;
  submittedBy: string;
  submittedAt: string;
  submitterName?: string;
}

interface GroupedRequests {
  [marketId: string]: {
    marketTitle: string;
    requests: ResolutionRequest[];
  };
}

export function AdminDashboard() {
  const [requests, setRequests] = useState<ResolutionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMarkets, setExpandedMarkets] = useState<Set<string>>(
    new Set()
  );

  const fetchResolutionRequests = async () => {
    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        "http://localhost:8000/resolution-requests/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to fetch resolution requests"
        );
      }

      const data = await response.json();

      // Fetch user profiles for each request
      const requestsWithNames = await Promise.all(
        data.requests.map(async (request: ResolutionRequest) => {
          try {
            const userProfile = await marketService.getUserProfile(
              request.submittedBy
            );
            return {
              ...request,
              submitterName: userProfile?.name || "Unknown User",
            };
          } catch (err) {
            console.error("Error fetching user profile:", err);
            return {
              ...request,
              submitterName: "Unknown User",
            };
          }
        })
      );

      setRequests(requestsWithNames);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch resolution requests"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResolutionRequests();
  }, []);

  const handleResolution = async (
    requestId: string,
    marketId: string,
    action: "approved" | "rejected"
  ) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      if (action === "rejected") {
        const response = await fetch(
          `http://localhost:8000/markets/${marketId}/resolution-requests/${requestId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to reject resolution request");
        }
      } else {
        const response = await fetch(
          `http://localhost:8000/markets/${marketId}/resolution-requests/${requestId}/accept`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to accept resolution request");
        }
      }

      // Remove the request from the UI
      setRequests(requests.filter((req) => req.id !== requestId));
      
    } catch (err) {
      console.error("Error updating request:", err);
      setError(`Failed to ${action} request`);
    }
  };

  const toggleMarket = (marketId: string) => {
    setExpandedMarkets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(marketId)) {
        newSet.delete(marketId);
      } else {
        newSet.add(marketId);
      }
      return newSet;
    });
  };

  const groupedRequests = requests.reduce<GroupedRequests>((acc, request) => {
    if (!acc[request.marketId]) {
      acc[request.marketId] = {
        marketTitle: request.marketTitle,
        requests: [],
      };
    }
    acc[request.marketId].requests.push(request);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-black mb-6">
            Resolution Requests Dashboard
          </h1>

          {error && (
            <div className="bg-red-50 text-cardinal-red p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin text-2xl mb-2">⚡</div>
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : Object.keys(groupedRequests).length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              No pending resolution requests.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedRequests).map(
                ([marketId, { marketTitle, requests }]) => (
                  <div
                    key={marketId}
                    className="border rounded-lg overflow-hidden bg-white"
                  >
                    <div
                      className="bg-gray-50 p-4 cursor-pointer border-b"
                      onClick={() => toggleMarket(marketId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {expandedMarkets.has(marketId) ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              {marketTitle || `Market ${marketId}`}
                            </h2>
                            <p className="text-sm text-gray-500">
                              {requests.length} pending request
                              {requests.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/market/${marketId}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Market
                        </Link>
                      </div>
                    </div>

                    {expandedMarkets.has(marketId) && (
                      <div className="p-4 grid gap-4">
                        {requests.map((request) => (
                          <Card
                            key={request.id}
                            className="bg-white border border-gray-200"
                          >
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                                    request.outcome === "yes"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  Outcome: {request.outcome.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Submitted{" "}
                                  {formatDistanceToNow(
                                    new Date(request.submittedAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Submitted by:</span>
                                <span className="font-medium">
                                  {request.submitterName || "Unknown User"}
                                </span>
                              </div>

                              <div>
                                <h3 className="font-medium text-gray-900">
                                  Resolution Details:
                                </h3>

                                <p className="text-gray-600 mt-1 pl-2">
                                  {request.resolutionDetails}
                                </p>
                                {request.evidenceUrl && (
                                  <div className="mt-2">
                                    <span className="text-gray-900 font-medium">
                                      Source URL:
                                    </span>
                                    <a
                                      href={request.evidenceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-cardinal-red  hover:underline break-all block mt-1 pl-2"
                                    >
                                      {request.evidenceUrl}
                                    </a>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-3 pt-3">
                                <Button
                                  onClick={() =>
                                    handleResolution(
                                      request.id,
                                      request.marketId,
                                      "approved"
                                    )
                                  }
                                  className="flex-1 bg-palo-alto-green hover:bg-opacity-90"
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleResolution(
                                      request.id,
                                      request.marketId,
                                      "rejected"
                                    )
                                  }
                                  className="flex-1 bg-cardinal-red hover:bg-opacity-90"
                                >
                                  Reject
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
