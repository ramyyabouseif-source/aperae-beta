import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../design';
import AdaptiveButton from '../components/AdaptiveButton';

const { width } = Dimensions.get('window');

interface MenuCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  dishes: string[];
}

const menuCategories: MenuCategory[] = [
  {
    id: 'appetizers',
    title: 'Appetizers',
    description: 'Start your meal with perfect wine pairings',
    icon: 'restaurant',
    color: COLORS.accent.gold,
    dishes: ['Cheese Board', 'Charcuterie', 'Oysters', 'Caviar', 'Bruschetta'],
  },
  {
    id: 'mains',
    title: 'Main Courses',
    description: 'Elevate your dining experience',
    icon: 'wine',
    color: COLORS.primary[500],
    dishes: ['Steak', 'Salmon', 'Pasta', 'Lamb', 'Duck'],
  },
  {
    id: 'desserts',
    title: 'Desserts',
    description: 'Sweet endings with dessert wines',
    icon: 'ice-cream',
    color: COLORS.accent.rose,
    dishes: ['Chocolate Cake', 'Tiramisu', 'Crème Brûlée', 'Fruit Tart', 'Cheesecake'],
  },
  {
    id: 'seafood',
    title: 'Seafood',
    description: 'Fresh catches with crisp whites',
    icon: 'fish',
    color: COLORS.accent.blue,
    dishes: ['Lobster', 'Scallops', 'Tuna', 'Crab', 'Shrimp'],
  },
];

const EnhancedMenuScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedDish(null);
  };

  const handleDishSelect = (dish: string) => {
    setSelectedDish(dish);
  };

  const handleGetRecommendation = () => {
    if (selectedDish) {
      // Navigate to home screen with pre-filled dish
      // This would typically use navigation to pass the selected dish
      console.log('Getting recommendation for:', selectedDish);
    }
  };

  const renderCategoryCard = (category: MenuCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        selectedCategory === category.id && styles.categoryCardSelected,
      ]}
      onPress={() => handleCategorySelect(category.id)}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <Ionicons name={category.icon as any} size={24} color="white" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categoryDescription}>{category.description}</Text>
        </View>
        <Ionicons
          name={selectedCategory === category.id ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.text.secondary}
        />
      </View>

      {selectedCategory === category.id && (
        <View style={styles.dishesContainer}>
          <Text style={styles.dishesTitle}>Popular Dishes</Text>
          <View style={styles.dishesGrid}>
            {category.dishes.map((dish) => (
              <TouchableOpacity
                key={dish}
                style={[
                  styles.dishButton,
                  selectedDish === dish && styles.dishButtonSelected,
                ]}
                onPress={() => handleDishSelect(dish)}
              >
                <Text
                  style={[
                    styles.dishText,
                    selectedDish === dish && styles.dishTextSelected,
                  ]}
                >
                  {dish}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSelectedDish = () => {
    if (!selectedDish) return null;

    return (
      <View style={styles.selectedDishContainer}>
        <View style={styles.selectedDishContent}>
          <View style={styles.selectedDishIcon}>
            <Ionicons name="wine" size={24} color={COLORS.primary[500]} />
          </View>
          <View style={styles.selectedDishInfo}>
            <Text style={styles.selectedDishTitle}>Selected Dish</Text>
            <Text style={styles.selectedDishName}>{selectedDish}</Text>
          </View>
        </View>
        <AdaptiveButton
          title="Get Wine Recommendation"
          onPress={handleGetRecommendation}
          variant="primary"
          size="medium"
        />
      </View>
    );
  };

  const renderQuickSuggestions = () => (
    <View style={styles.quickSuggestionsContainer}>
      <Text style={styles.quickSuggestionsTitle}>Quick Suggestions</Text>
      <View style={styles.quickSuggestionsGrid}>
        {[
          { dish: 'Ribeye Steak', wine: 'Cabernet Sauvignon' },
          { dish: 'Grilled Salmon', wine: 'Pinot Grigio' },
          { dish: 'Chocolate Cake', wine: 'Port' },
          { dish: 'Lobster', wine: 'Chardonnay' },
        ].map((suggestion, index) => (
          <View key={index} style={styles.suggestionCard}>
            <Text style={styles.suggestionDish}>{suggestion.dish}</Text>
            <Text style={styles.suggestionWine}>{suggestion.wine}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="restaurant" size={32} color={COLORS.primary[500]} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Menu Recommendations</Text>
              <Text style={styles.headerSubtitle}>
                Discover the perfect wine for your favorite dishes
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Suggestions */}
        {renderQuickSuggestions()}

        {/* Menu Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>Browse by Category</Text>
          {menuCategories.map(renderCategoryCard)}
        </View>

        {/* Selected Dish Action */}
        {renderSelectedDish()}

        {/* Wine Pairing Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Wine Pairing Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success[500]} />
              <Text style={styles.tipText}>
                Red wines pair well with red meats and rich sauces
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success[500]} />
              <Text style={styles.tipText}>
                White wines complement seafood and light dishes
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success[500]} />
              <Text style={styles.tipText}>
                Sparkling wines are perfect for celebrations and appetizers
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    backgroundColor: COLORS.background.primary,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading.large,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.text.secondary,
  },
  quickSuggestionsContainer: {
    backgroundColor: COLORS.background.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.light,
  },
  quickSuggestionsTitle: {
    ...TYPOGRAPHY.heading.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  quickSuggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionCard: {
    flex: 1,
    minWidth: (width - SPACING.md * 4) / 2,
    backgroundColor: COLORS.background.secondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  suggestionDish: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  suggestionWine: {
    ...TYPOGRAPHY.body.small,
    color: COLORS.primary[500],
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  categoriesTitle: {
    ...TYPOGRAPHY.heading.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  categoryCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary[500],
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    ...TYPOGRAPHY.heading.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  categoryDescription: {
    ...TYPOGRAPHY.body.small,
    color: COLORS.text.secondary,
  },
  dishesContainer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  dishesTitle: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  dishesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  dishButton: {
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dishButtonSelected: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[500],
  },
  dishText: {
    ...TYPOGRAPHY.body.small,
    color: COLORS.text.primary,
  },
  dishTextSelected: {
    color: COLORS.primary[500],
    fontWeight: '600',
  },
  selectedDishContainer: {
    backgroundColor: COLORS.primary[50],
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedDishContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedDishIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  selectedDishInfo: {
    flex: 1,
  },
  selectedDishTitle: {
    ...TYPOGRAPHY.body.small,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  selectedDishName: {
    ...TYPOGRAPHY.heading.small,
    color: COLORS.text.primary,
  },
  tipsContainer: {
    backgroundColor: COLORS.background.primary,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.light,
  },
  tipsTitle: {
    ...TYPOGRAPHY.heading.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  tipsList: {
    gap: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
});

export default EnhancedMenuScreen;




