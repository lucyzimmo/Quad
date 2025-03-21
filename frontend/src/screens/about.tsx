import { Navbar } from "../components/navbar";

export function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-black">About The Quad</h1>

          <div className="bg-gray-100 rounded-lg p-6 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                What is The Quad?
              </h2>
              <p className="text-gray-600">
                The Quad is Stanford's first prediction market platform, where
                students can bet on campus events and outcomes using virtual
                tokens. Make predictions, compete with friends, and climb the
                leaderboard by making accurate forecasts about everything from
                sports outcomes to campus happenings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                How Our Betting System Works
              </h2>
              <p className="text-gray-600 mb-3">
                The Quad uses a simple yet effective betting system:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Each market has a binary outcome - Yes or No.</li>
                <li>
                  Shares can range in value, reflecting the probability of an
                  outcome.
                </li>
                <li>
                  When you bet, you're buying shares at the current price.
                </li>
                <li>
                  If your prediction is correct, each share pays out 1 token.
                </li>
                <li>
                  If your prediction is wrong, your shares become worthless.
                </li>
                <li>
                  Prices adjust automatically based on betting activity,
                  creating a dynamic market.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Understanding Tokens
              </h2>
              <p className="text-gray-600 mb-3">
                Tokens on The Quad represent virtual currency with no real-world
                monetary value:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>New users receive 1000 tokens to start.</li>
                <li>Tokens are used to place bets on market outcomes.</li>
                <li>Win tokens by making accurate predictions.</li>
                <li>The leaderboard showcases users with the most tokens.</li>
                <li>
                  Tokens cannot be exchanged for real money or other items of
                  value.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Creating a Market: Step-by-Step Guide
              </h2>
              <p className="text-gray-600 mb-3">
                Creating a successful prediction market requires careful thought
                and clear criteria:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Choose Your Question:</strong>
                  <ul className="list-disc pl-6 mt-1 mb-2">
                    <li>Must have a clear Yes/No outcome</li>
                    <li>Should be verifiable by public information</li>
                    <li>Must resolve by the closing date</li>
                  </ul>
                </li>
                <li>
                  <strong>Set Up Your Market:</strong>
                  <ul className="list-disc pl-6 mt-1 mb-2">
                    <li>Click "Create Market" in the navigation</li>
                    <li>Write a clear, unambiguous title</li>
                    <li>Add detailed description with resolution criteria</li>
                    <li>Set an appropriate closing date</li>
                  </ul>
                </li>
                <li>
                  <strong>Define Resolution Criteria:</strong>
                  <ul className="list-disc pl-6 mt-1 mb-2">
                    <li>Specify exact conditions for Yes/No outcome</li>
                    <li>List trusted sources for verification</li>
                    <li>Include any special rules or conditions</li>
                  </ul>
                </li>
                <li>Submit for review by our moderation team</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Platform Credibility & Fair Play
              </h2>
              <p className="text-gray-600 mb-3">
                The Quad ensures fairness through multiple mechanisms:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Dynamic Pricing System:</strong>
                  <ul className="list-disc pl-6 mt-1 mb-2">
                    <li>
                      Prices adjust automatically based on market activity
                    </li>
                    <li>
                      Uses a mathematical formula that can't be manipulated
                    </li>
                    <li>All price changes are recorded and transparent</li>
                  </ul>
                </li>
                <li>
                  <strong>Bet Verification:</strong>
                  <ul className="list-disc pl-6 mt-1 mb-2">
                    <li>
                      Every bet is recorded with a timestamp and unique ID
                    </li>
                    <li>Bet history is immutable and can't be altered</li>
                    <li>All transactions are logged and traceable</li>
                  </ul>
                </li>
                <li>
                  <strong>Resolution Process:</strong>
                  <ul className="list-disc pl-6 mt-1 mb-2">
                    <li>Markets resolve based on pre-defined criteria only</li>
                    <li>Resolution requires verifiable public evidence</li>
                    <li>Multiple moderators review resolutions</li>
                  </ul>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                How We Prevent Market Manipulation
              </h2>
              <p className="text-gray-600 mb-3">
                Our platform includes several safeguards:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Automated price adjustments prevent price manipulation</li>
                <li>
                  Bet limits protect against large-scale market distortion
                </li>
                <li>
                  Multiple independent moderators oversee market resolution
                </li>
                <li>All market activity is publicly visible and tracked</li>
                <li>Community reporting system for suspicious activity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Our Commitment to Fairness
              </h2>
              <p className="text-gray-600 mb-3">
                The Quad is committed to creating a fair and transparent
                prediction market:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>Independent Resolution:</strong> Market outcomes are
                  determined by verifiable real-world events, not by platform
                  administrators.
                </li>
                <li>
                  <strong>Transparent Rules:</strong> Each market has clear
                  resolution criteria established before betting begins.
                </li>
                <li>
                  <strong>Moderation:</strong> All markets are reviewed before
                  publication to ensure clarity and fairness.
                </li>
                <li>
                  <strong>Audit Trail:</strong> All bets and market resolutions
                  are recorded and can be reviewed.
                </li>
                <li>
                  <strong>Community Oversight:</strong> Users can report
                  concerns about market resolution or rules.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Dynamic Pricing Algorithm Explained
              </h2>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Understanding Effective Price
                  </h3>
                  <p className="text-gray-700 mb-4">
                    The effective price is the actual price you get for your
                    bet, which may be different from the current market price.
                    This happens because:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Large bets move the price as they're being placed</li>
                    <li>
                      Your effective price is the average price across your
                      entire bet amount
                    </li>
                    <li>Smaller bets get closer to the displayed price</li>
                    <li>
                      Larger bets may get worse prices due to market impact
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Price Adjustment Explained
                  </h3>
                  <p className="text-gray-700 mb-4">
                    The price adjustment factor ensures fair payouts based on
                    when you placed your bet:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>For YES bets: adjustment = 1/effective_price</li>
                    <li>For NO bets: adjustment = 1/(1-effective_price)</li>
                    <li>Better prices (early bets) get higher adjustments</li>
                    <li>This rewards early, price-discovering bets</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    The Formula
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                    <p className="text-gray-800 mb-2">
                      // Current market price
                    </p>
                    <p className="text-blue-600">
                      price = yesAmount / (yesAmount + noAmount)
                    </p>
                    <p className="text-gray-800 mt-4 mb-2">
                      // Price after your bet
                    </p>
                    <p className="text-blue-600">
                      newPrice = (yesAmount + betAmount) / (yesAmount + noAmount
                      + betAmount)
                    </p>
                    <p className="text-gray-800 mt-4 mb-2">
                      // Your effective price
                    </p>
                    <p className="text-blue-600">
                      effectivePrice = (currentPrice + newPrice) / 2
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Example Calculation
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Initial State
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Yes pool: 400 tokens</li>
                        <li>• No pool: 600 tokens</li>
                        <li>• Current price: 0.40 (40%)</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        After 100 Token YES Bet
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• New Yes pool: 500 tokens</li>
                        <li>• New total pool: 1100 tokens</li>
                        <li>• New price: 0.45 (45%)</li>
                        <li>• Effective price: 0.425 (42.5%)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Payout Calculations Explained
              </h2>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Payout Formula
                  </h3>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="font-mono text-sm mb-2 text-gray-800">
                      // Base payout calculation
                    </p>
                    <p className="font-mono text-blue-600 mb-4">
                      payout = (betAmount / winningPool) * totalPool *
                      priceAdjustment
                    </p>

                    <p className="font-mono text-sm mb-2 text-gray-800">
                      // Price adjustment for YES bets
                    </p>
                    <p className="font-mono text-blue-600 mb-4">
                      priceAdjustment = 1 / effectivePrice
                    </p>

                    <p className="font-mono text-sm mb-2 text-gray-800">
                      // Price adjustment for NO bets
                    </p>
                    <p className="font-mono text-blue-600">
                      priceAdjustment = 1 / (1 - effectivePrice)
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Detailed Example
                  </h3>
                  <div className="bg-red-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-red-800 mb-2">
                      Important Note
                    </h4>
                    <p className="text-gray-700">
                      Payouts only occur if your prediction is correct. If you
                      bet on the wrong outcome, you lose your entire bet amount.
                      The calculations below show potential payouts assuming
                      your prediction is correct.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Market State
                        </h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Total pool: 1000 tokens</li>
                          <li>• Yes pool: 400 tokens</li>
                          <li>• No pool: 600 tokens</li>
                        </ul>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">
                          YES Bet Example
                        </h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Bet amount: 100 tokens</li>
                          <li>• Effective price: 0.40</li>
                          <li>• Price adjustment: 1/0.40 = 2.5</li>
                          <li className="font-medium text-green-700">
                            If YES wins:
                          </li>
                          <li>• Final payout: 625 tokens</li>
                          <li className="text-sm text-gray-500 mt-1">
                            (100/400) * 1000 * 2.5 = 625
                          </li>
                          <li className="font-medium text-red-700 mt-2">
                            If YES loses:
                          </li>
                          <li>• Final payout: 0 tokens</li>
                          <li className="text-sm text-gray-500 mt-1">
                            Lose entire bet amount (100 tokens)
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">
                          NO Bet Example
                        </h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Bet amount: 100 tokens</li>
                          <li>• Effective price: 0.60</li>
                          <li>• Price adjustment: 1/0.40 = 2.5</li>
                          <li className="font-medium text-green-700">
                            If NO wins:
                          </li>
                          <li>• Final payout: 416.67 tokens</li>
                          <li className="text-sm text-gray-500 mt-1">
                            (100/600) * 1000 * 2.5 = 416.67
                          </li>
                          <li className="font-medium text-red-700 mt-2">
                            If NO loses:
                          </li>
                          <li>• Final payout: 0 tokens</li>
                          <li className="text-sm text-gray-500 mt-1">
                            Lose entire bet amount (100 tokens)
                          </li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800 mb-2">
                          Key Takeaways
                        </h4>
                        <ul className="space-y-1 text-gray-700">
                          <li>• Payouts only occur for correct predictions</li>
                          <li>• Incorrect bets lose entire bet amount</li>
                          <li>• Better prices = higher potential payouts</li>
                          <li>• Early bets get better prices</li>
                          <li>• Large bets get worse prices</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-black">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-black">
                    Can I cash out my tokens for real money?
                  </h3>
                  <p className="text-gray-600">
                    No, tokens have no monetary value and cannot be exchanged
                    for real currency.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">
                    What happens if a market can't be clearly resolved?
                  </h3>
                  <p className="text-gray-600">
                    In rare cases where the outcome is ambiguous or the event
                    doesn't occur, the market may be canceled and all bets
                    refunded.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">
                    Can I delete a bet I've made?
                  </h3>
                  <p className="text-gray-600">
                    No, once a bet is placed, it cannot be reversed or deleted.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">
                    How are disputes handled?
                  </h3>
                  <p className="text-gray-600">
                    Users can report concerns about market resolution. Our team
                    will review the market's resolution criteria and make a
                    final determination based on verifiable evidence.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-black">
                    What makes The Quad's betting system fair?
                  </h3>
                  <p className="text-gray-600">
                    Our platform uses an automated market-making algorithm that
                    adjusts prices based on betting activity. This creates a
                    fair system where prices reflect the collective wisdom of
                    all participants.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
