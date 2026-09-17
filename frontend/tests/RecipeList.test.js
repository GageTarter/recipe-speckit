/**
 * Feature 2 — Recipe Management
 * Spec: features/feature-2-recipe-management.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../src/services/RecipeServices.js", () => ({
  default: { getRecipesByUserId: vi.fn(), getRecipes: vi.fn(), addRecipe: vi.fn() },
}));
vi.mock("../src/services/RecipeIngredientServices.js", () => ({
  default: { getRecipeIngredientsForRecipe: vi.fn() },
}));
vi.mock("../src/services/RecipeStepServices", () => ({
  default: { getRecipeStepsForRecipeWithIngredients: vi.fn() },
}));

import RecipeList from "../src/views/RecipeList.vue";
import RecipeServices from "../src/services/RecipeServices.js";
import RecipeIngredientServices from "../src/services/RecipeIngredientServices.js";
import RecipeStepServices from "../src/services/RecipeStepServices";

const vuetify = createVuetify({ components, directives });

const mountList = async (recipes) => {
  RecipeServices.getRecipesByUserId.mockResolvedValue({ data: recipes });
  RecipeIngredientServices.getRecipeIngredientsForRecipe.mockResolvedValue({
    data: [],
  });
  RecipeStepServices.getRecipeStepsForRecipeWithIngredients.mockResolvedValue({
    data: [],
  });
  const wrapper = mount(RecipeList, { global: { plugins: [vuetify] } });
  await flushPromises();
  return wrapper;
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("user", JSON.stringify({ id: 1, token: "test-token" }));
});

describe("Feature 2 — Recipe Management", () => {
  describe("US-2.2 — See only my own recipes", () => {
    it("Recipes page lists the signed-in user's recipes", async () => {
      const wrapper = await mountList([
        { id: 1, name: "Chili", description: "Weeknight chili", servings: 4, time: 45 },
        { id: 2, name: "Waffles", description: "Sunday waffles", servings: 2, time: 20 },
      ]);

      // the list is fetched for the signed-in user only
      expect(RecipeServices.getRecipesByUserId).toHaveBeenCalledWith(1);
      expect(RecipeServices.getRecipes).not.toHaveBeenCalled();

      expect(wrapper.text()).toContain("Chili");
      expect(wrapper.text()).toContain("Waffles");
      expect(wrapper.text()).not.toContain("Gumbo");
    });

    it("A user with no recipes sees an empty page", async () => {
      const wrapper = await mountList([]);

      expect(wrapper.text()).toContain("No recipes yet. Add your first recipe.");
      expect(wrapper.findComponent({ name: "RecipeCardComponent" }).exists()).toBe(
        false
      );
      expect(wrapper.text()).not.toContain("Error");
    });
  });
});
