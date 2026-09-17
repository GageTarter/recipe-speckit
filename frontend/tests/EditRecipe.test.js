/**
 * Feature 3 — Recipe List Item Management
 * Spec: features/feature-3-recipe-list-item-management.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "7" } }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("../src/services/RecipeServices.js", () => ({
  default: { getRecipe: vi.fn(), updateRecipe: vi.fn() },
}));
vi.mock("../src/services/RecipeIngredientServices.js", () => ({
  default: {
    getRecipeIngredientsForRecipe: vi.fn(),
    addRecipeIngredient: vi.fn(),
    updateRecipeIngredient: vi.fn(),
    deleteRecipeIngredient: vi.fn(),
  },
}));
vi.mock("../src/services/RecipeStepServices", () => ({
  default: {
    getRecipeStepsForRecipeWithIngredients: vi.fn(),
    addRecipeStep: vi.fn(),
    updateRecipeStep: vi.fn(),
    deleteRecipeStep: vi.fn(),
  },
}));
vi.mock("../src/services/IngredientServices.js", () => ({
  default: { getIngredients: vi.fn() },
}));

import EditRecipe from "../src/views/EditRecipe.vue";
import RecipeServices from "../src/services/RecipeServices.js";
import RecipeIngredientServices from "../src/services/RecipeIngredientServices.js";
import RecipeStepServices from "../src/services/RecipeStepServices";
import IngredientServices from "../src/services/IngredientServices.js";

const vuetify = createVuetify({ components, directives });

const chili = {
  id: 7,
  name: "Chili",
  description: "Weeknight chili",
  servings: 4,
  time: 45,
  isPublished: false,
};

const beansRow = {
  id: 10,
  quantity: 2,
  recipeId: 7,
  ingredientId: 3,
  ingredient: { id: 3, name: "Beans", unit: "cup", pricePerUnit: "1.50" },
};

const riceRow = {
  id: 11,
  quantity: 1,
  recipeId: 7,
  ingredientId: 4,
  ingredient: { id: 4, name: "Rice", unit: "cup", pricePerUnit: "1.00" },
};

const simmerStep = {
  id: 20,
  stepNumber: 1,
  instruction: "Simmer the beans",
  recipeId: 7,
  recipeIngredient: [beansRow, riceRow],
};

const mountEdit = async ({ ingredients = [], steps = [] } = {}) => {
  RecipeServices.getRecipe.mockResolvedValue({ data: [chili] });
  RecipeIngredientServices.getRecipeIngredientsForRecipe.mockResolvedValue({
    data: ingredients,
  });
  RecipeStepServices.getRecipeStepsForRecipeWithIngredients.mockResolvedValue({
    data: steps,
  });
  IngredientServices.getIngredients.mockResolvedValue({ data: [] });
  const wrapper = mount(EditRecipe, { global: { plugins: [vuetify] } });
  await flushPromises();
  return wrapper;
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("user", JSON.stringify({ id: 1, token: "test-token" }));
});

describe("Feature 3 — Recipe List Item Management", () => {
  describe("US-3.1 — Add a measured ingredient to a recipe", () => {
    it("Edit Recipe lists the recipe's ingredients", async () => {
      const wrapper = await mountEdit({ ingredients: [beansRow] });

      expect(wrapper.text()).toContain("2");
      expect(wrapper.text()).toContain("cups");
      expect(wrapper.text()).toContain("Beans");
    });
  });

  describe("US-3.4 — Add a numbered step", () => {
    it("Edit Recipe lists the recipe's steps", async () => {
      const wrapper = await mountEdit({
        steps: [
          {
            id: 20,
            stepNumber: 1,
            instruction: "Simmer the beans",
            recipeIngredient: [],
          },
        ],
      });

      expect(wrapper.text()).toContain("1");
      expect(wrapper.text()).toContain("Simmer the beans");
    });
  });

  describe("US-3.5 — Attach ingredients to a step", () => {
    it("Attached ingredients appear on the step's row", async () => {
      const wrapper = await mountEdit({ steps: [simmerStep] });

      const chips = wrapper.findAll(".v-chip");
      const chipText = chips.map((chip) => chip.text()).join(" ");
      expect(chipText).toContain("Beans");
      expect(chipText).toContain("Rice");
    });
  });
});
