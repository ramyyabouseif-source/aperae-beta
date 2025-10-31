import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WineCard from '../WineCard';
import { WineRecommendation } from '../../types/wine';

const mockWine: WineRecommendation = {
  wineName: 'Test Wine',
  producer: 'Test Producer',
  vintage: '2020',
  pricePoint: '$50',
  rationale: 'Test rationale',
  tastingNotes: 'Test tasting notes',
  servingGuidance: 'Test serving guidance',
  confidenceScore: 95,
  expertRating: '95 (Wine Spectator)',
  retailerSuggestion: 'Test retailer',
  image: 'test-image.jpg',
  storytellingElements: 'Test storytelling',
};

describe('WineCard', () => {
  const mockOnAddToFavorites = jest.fn();
  const mockOnRemoveFromFavorites = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders wine information correctly', () => {
    const { getByText } = render(
      <WineCard
        wine={mockWine}
        onAddToFavorites={mockOnAddToFavorites}
        onRemoveFromFavorites={mockOnRemoveFromFavorites}
      />
    );

    expect(getByText('Test Wine')).toBeTruthy();
    expect(getByText('Test Producer 2020')).toBeTruthy();
    expect(getByText('$50')).toBeTruthy();
    expect(getByText('95 (Wine Spectator)')).toBeTruthy();
    expect(getByText('Test rationale')).toBeTruthy();
    expect(getByText('Test tasting notes')).toBeTruthy();
    expect(getByText('Test serving guidance')).toBeTruthy();
    expect(getByText('Test retailer')).toBeTruthy();
    expect(getByText('Confidence: 95%')).toBeTruthy();
  });

  it('shows "Add to Favorites" button when not favorite', () => {
    const { getByText } = render(
      <WineCard
        wine={mockWine}
        onAddToFavorites={mockOnAddToFavorites}
        onRemoveFromFavorites={mockOnRemoveFromFavorites}
        isFavorite={false}
      />
    );

    expect(getByText('Add to Favorites')).toBeTruthy();
  });

  it('shows "Remove from Favorites" button when favorite', () => {
    const { getByText } = render(
      <WineCard
        wine={mockWine}
        onAddToFavorites={mockOnAddToFavorites}
        onRemoveFromFavorites={mockOnRemoveFromFavorites}
        isFavorite={true}
      />
    );

    expect(getByText('Remove from Favorites')).toBeTruthy();
  });

  it('calls onAddToFavorites when add button is pressed', () => {
    const { getByText } = render(
      <WineCard
        wine={mockWine}
        onAddToFavorites={mockOnAddToFavorites}
        onRemoveFromFavorites={mockOnRemoveFromFavorites}
        isFavorite={false}
      />
    );

    fireEvent.press(getByText('Add to Favorites'));
    expect(mockOnAddToFavorites).toHaveBeenCalledWith(mockWine);
  });

  it('calls onRemoveFromFavorites when remove button is pressed', () => {
    const { getByText } = render(
      <WineCard
        wine={mockWine}
        onAddToFavorites={mockOnAddToFavorites}
        onRemoveFromFavorites={mockOnRemoveFromFavorites}
        isFavorite={true}
      />
    );

    fireEvent.press(getByText('Remove from Favorites'));
    expect(mockOnRemoveFromFavorites).toHaveBeenCalledWith(mockWine);
  });

  it('handles missing price and rating gracefully', () => {
    const wineWithoutPriceAndRating = {
      ...mockWine,
      pricePoint: undefined,
      expertRating: undefined,
    };

    const { getByText } = render(
      <WineCard
        wine={wineWithoutPriceAndRating}
        onAddToFavorites={mockOnAddToFavorites}
        onRemoveFromFavorites={mockOnRemoveFromFavorites}
      />
    );

    expect(getByText('Price N/A')).toBeTruthy();
    expect(getByText('Rating N/A')).toBeTruthy();
  });

  it('works without callback functions', () => {
    const { getByText } = render(
      <WineCard wine={mockWine} />
    );

    expect(getByText('Add to Favorites')).toBeTruthy();
    
    // Should not crash when button is pressed without callback
    fireEvent.press(getByText('Add to Favorites'));
  });

  it('displays disclaimer text', () => {
    const { getByText } = render(
      <WineCard
        wine={mockWine}
        onAddToFavorites={mockOnAddToFavorites}
        onRemoveFromFavorites={mockOnRemoveFromFavorites}
      />
    );

    expect(getByText('* Prices and ratings are estimates and may vary by retailer')).toBeTruthy();
  });
});





