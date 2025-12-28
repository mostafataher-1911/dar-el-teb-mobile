import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FavoriteTest {
  id: string;
  name: string;
  imageUrl: string;
  coins: number;
  category?: string;
}

const FAVORITES_KEY = "@dar_el_teb_favorites";

export const favoritesService = {
  // Get all favorites
  async getFavorites(): Promise<FavoriteTest[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  },

  // Add to favorites
  async addFavorite(test: FavoriteTest): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const exists = favorites.some((fav) => fav.id === test.id);
      
      if (!exists) {
        favorites.push(test);
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding favorite:", error);
      return false;
    }
  },

  // Remove from favorites
  async removeFavorite(testId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((fav) => fav.id !== testId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error removing favorite:", error);
      return false;
    }
  },

  // Check if test is favorite
  async isFavorite(testId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((fav) => fav.id === testId);
    } catch (error) {
      console.error("Error checking favorite:", error);
      return false;
    }
  },

  // Clear all favorites
  async clearFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error("Error clearing favorites:", error);
    }
  },
};

