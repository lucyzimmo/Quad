function calculateSimilarity(str1, str2) {
  // Convert both strings to lowercase and remove punctuation
  const cleanStr1 = str1.toLowerCase().replace(/[^\w\s]/g, '');
  const cleanStr2 = str2.toLowerCase().replace(/[^\w\s]/g, '');

  // Convert strings to word arrays
  const words1 = cleanStr1.split(/\s+/);
  const words2 = cleanStr2.split(/\s+/);

  // Create sets of words
  const set1 = new Set(words1);
  const set2 = new Set(words2);

  // Find intersection
  const intersection = new Set([...set1].filter(word => set2.has(word)));

  // Calculate Jaccard similarity
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

module.exports = {
  calculateSimilarity,
  // Threshold for considering markets as similar
  SIMILARITY_THRESHOLD: 0.6
}; 