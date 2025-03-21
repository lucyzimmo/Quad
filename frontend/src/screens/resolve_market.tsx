import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { marketService } from "../services/marketService";
import { Navbar } from "../components/navbar";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";

export function ResolveMarket() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"yes" | "no" | null>(null);
  const [resolutionDetails, setResolutionDetails] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  useEffect(() => {
    console.log("ResolveMarket component mounted");
  }, []);

  const handleResolveMarket = async () => {
    if (!id) {
      setError("Market ID is missing");
      return;
    }

    if (!outcome) {
      setError("Please select an outcome (Yes or No)");
      return;
    }

    if (!resolutionDetails.trim()) {
      setError("Please provide resolution details");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create resolution data
      const resolutionData = {
        outcome,
        resolutionDetails,
        evidenceUrl: evidenceUrl.trim() || null,
        resolvedAt: new Date().toISOString(),
      };

      // Call the new submitResolutionRequest function
      await marketService.submitResolutionRequest(id, resolutionData);

      console.log("Resolution request submitted");
      setSuccess("Resolution request submitted successfully");
      setTimeout(() => navigate("/markets"), 2000);
    } catch (err) {
      console.error("Error submitting resolution request:", err);
      setError("Failed to submit resolution request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <span className="text-xl">←</span>
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-black">Resolve Market</h1>
            <div className="w-16"></div>
          </div>

          {error && (
            <div className="bg-red-50 text-cardinal-red p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-palo-alto-green p-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-black mb-3">
                What was the outcome?
              </h2>
              <div className="flex gap-4">
                <Button
                  onClick={() => setOutcome("yes")}
                  className={`flex-1 h-16 text-lg font-semibold transition-all ${
                    outcome === "yes"
                      ? "bg-palo-alto-green text-white ring-2 ring-offset-2 ring-palo-alto-green"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-palo-alto-green"
                  }`}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => setOutcome("no")}
                  className={`flex-1 h-16 text-lg font-semibold transition-all ${
                    outcome === "no"
                      ? "bg-cardinal-red text-white ring-2 ring-offset-2 ring-cardinal-red"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-cardinal-red"
                  }`}
                >
                  No
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black mb-3">
                Resolution Details
              </h2>
              <Textarea
                placeholder="Explain why this market is being resolved this way..."
                value={resolutionDetails}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setResolutionDetails(e.target.value)
                }
                className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent"
                rows={5}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-black mb-3">
                Evidence URL (Optional)
              </h2>
              <Input
                type="url"
                placeholder="https://example.com/evidence"
                value={evidenceUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEvidenceUrl(e.target.value)
                }
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Link to an article, tweet, or other evidence supporting the
                resolution
              </p>
            </div>

            <Button
              onClick={handleResolveMarket}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cardinal-red to-red-700 text-white py-3 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-102"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin mr-2">⚡</div>
                  Resolving...
                </div>
              ) : (
                "Resolve Market"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
