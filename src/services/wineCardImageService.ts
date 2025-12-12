/**
 * Wine Card Image Service
 * 
 * Manages random selection of wine card images across the app.
 * Each time "get wine recommendations" is clicked, random images are selected.
 */

class WineCardImageService {
  private usedIndices: Set<number> = new Set();
  private totalImageCount: number = 0;

  /**
   * Set the total number of available images
   */
  setTotalImageCount(count: number): void {
    this.totalImageCount = count;
  }

  /**
   * Get a random index that hasn't been used in the current recommendation set
   * This ensures each card in a set gets a different image
   */
  getRandomIndex(excludeIndices: number[] = []): number {
    if (this.totalImageCount === 0) {
      return 0;
    }

    // If we've used most images, reset the used set
    if (this.usedIndices.size >= this.totalImageCount * 0.8) {
      this.usedIndices.clear();
    }

    // Create a set of excluded indices (already used + provided exclusions)
    const excluded = new Set([...this.usedIndices, ...excludeIndices]);

    // If all images are excluded, reset and try again
    if (excluded.size >= this.totalImageCount) {
      this.usedIndices.clear();
      excluded.clear();
    }

    // Generate random index until we find one that's not excluded
    let randomIndex: number;
    let attempts = 0;
    do {
      randomIndex = Math.floor(Math.random() * this.totalImageCount);
      attempts++;
      // Safety check to prevent infinite loop
      if (attempts > 100) {
        this.usedIndices.clear();
        randomIndex = Math.floor(Math.random() * this.totalImageCount);
        break;
      }
    } while (excluded.has(randomIndex));

    // Mark this index as used
    this.usedIndices.add(randomIndex);
    return randomIndex;
  }

  /**
   * Reset the used indices (call this when starting a new recommendation set)
   */
  resetForNewRecommendations(): void {
    this.usedIndices.clear();
  }

  /**
   * Get multiple random indices for a set of recommendations
   * Ensures each recommendation gets a unique random image
   */
  getRandomIndices(count: number): number[] {
    this.resetForNewRecommendations();
    const indices: number[] = [];
    for (let i = 0; i < count; i++) {
      indices.push(this.getRandomIndex(indices));
    }
    return indices;
  }
}

// Export singleton instance
export const wineCardImageService = new WineCardImageService();

