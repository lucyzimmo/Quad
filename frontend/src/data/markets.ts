export interface Market {
  id: number;
  title: string;
  description: string;
  // image: string;
  yesPercentage: number;
  noPercentage: number;
  minimumBet: number;
}

export const defaultMarkets: Market[] = [
  {
    id: 1,
    title: "Will Stanford beat Cal in Big Game 2024?",
    description:
      "Predict the outcome of the Big Game between Stanford and Cal.",
    // image: "./assets/profile.png",
    yesPercentage: 63,
    noPercentage: 27,
    minimumBet: 10,
  },
  {
    id: 2,
    title: "Fountain Hopping Friday Attendance >100?",
    description:
      "Predict if more than 100 students will attend Fountain Hopping Friday.",
    // image: "./assets/profile.png",
    yesPercentage: 55,
    noPercentage: 45,
    minimumBet: 10,
  },
  {
    id: 3,
    title: "Next Frost Amphitheater Concert Sellout?",
    description:
      "Predict if the next Frost Amphitheater concert will sell out.",
    // image: "./assets/profile.png",
    yesPercentage: 70,
    noPercentage: 30,
    minimumBet: 10,
  },
];

// Load markets from localStorage or use defaults
export const getMarkets = (): Market[] => {
  const stored = localStorage.getItem("markets");
  return stored ? JSON.parse(stored) : defaultMarkets;
};

// Save markets to localStorage
export const saveMarkets = (markets: Market[]) => {
  localStorage.setItem("markets", JSON.stringify(markets));
};

// Add a new market
export const addMarket = (market: Market) => {
  const markets = getMarkets();
  markets.push(market);
  saveMarkets(markets);
};
