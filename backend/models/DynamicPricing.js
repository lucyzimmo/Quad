const calculateMarketImpact = (size, liquidity) => {
  // Market impact increases with order size and decreases with liquidity
  return (size / liquidity) * 0.1;
};

class DynamicPricing {
  constructor() {
    this.MIN_PRICE = 0.01;
    this.MAX_PRICE = 0.99;
    this.BASE_LIQUIDITY = 1000;
  }

  // Calculate the new price after a trade
  calculateNewPrice(currentPrice, tradeSize, position, totalLiquidity = this.BASE_LIQUIDITY) {
    const impact = calculateMarketImpact(tradeSize, totalLiquidity);
    
    // If buying YES (or selling NO), price goes up
    // If selling YES (or buying NO), price goes down
    const direction = position === 'yes' ? 1 : -1;
    let newPrice = currentPrice + (impact * direction);

    // Ensure price stays within bounds
    newPrice = Math.max(this.MIN_PRICE, Math.min(this.MAX_PRICE, newPrice));
    
    return newPrice;
  }

  // Calculate the price slippage for a given order size
  calculateSlippage(orderSize, currentLiquidity) {
    return Math.min(0.1, orderSize / currentLiquidity);
  }

  // Get the effective price for a trade considering market depth
  getEffectivePrice(basePrice, orderSize, position, liquidity) {
    const slippage = this.calculateSlippage(orderSize, liquidity);
    const direction = position === 'yes' ? 1 : -1;
    let effectivePrice = basePrice * (1 + (slippage * direction));
    
    return Math.max(this.MIN_PRICE, Math.min(this.MAX_PRICE, effectivePrice));
  }

  // Update market prices based on order book imbalance
  adjustPriceForImbalance(yesVolume, noVolume, currentPrice) {
    const totalVolume = yesVolume + noVolume;
    if (totalVolume === 0) return currentPrice;

    const imbalance = (yesVolume - noVolume) / totalVolume;
    const adjustmentFactor = 0.05; // 5% maximum adjustment
    
    let newPrice = currentPrice + (imbalance * adjustmentFactor);
    return Math.max(this.MIN_PRICE, Math.min(this.MAX_PRICE, newPrice));
  }

  // Calculate implied probability from market prices
  calculateImpliedProbability(yesPrice) {
    // Account for market maker spread
    const spread = 0.02; // 2% spread
    return Math.max(0, Math.min(1, yesPrice - spread/2));
  }
}

module.exports = DynamicPricing; 