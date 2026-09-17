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
vi.mock("../src/services/RecipeIngredientServices.js", () => ({
  default: { getRecipeIngredientsForRecipe: vi.fn() },
}));
vi.mock("../src/services/RecipeStepServices", () => ({
  default: { getRecipeStepsForRecipeWithIngredients: vi.fn() },
}));

import RecipeCard from "../src/components/RecipeCardComponent.vue";
import RecipeIngredientServices from "../src/services/RecipeIngredientServices.js";
import RecipeStepServices from "../src/services/RecipeStepServices";

const vuetify = createVuetify({ components, directives });

const recipe = {
  id: 1,
  name: "Chili",
  description: "Weeknight chili",
  servings: 4,
  time: 45,
};

const beansIngredient = {
  id: 10,
  quantity: 2,
  ingredient: { name: "Beans", unit: "cup", pricePerUnit: "1.50" },
};

const simmerStep = {
  id: 20,
  stepNumber: 1,
  instruction: "Simmer the beans",
  recipeIngredient: [beansIngredient],
};

// The expandable detail pane — the second v-card-text in the card
const detailsRegion = (wrapper) => wrapper.findAll(".v-card-text")[1];

const mountCard = async ({ ingredients = [], steps = [] } = {}) => {
  RecipeIngredientServices.getRecipeIngredientsForRecipe.mockResolvedValue({
    data: ingredients,
  });
  RecipeStepServices.getRecipeStepsForRecipeWithIngredients.mockResolvedValue({
    data: steps,
  });
  const wrapper = mount(RecipeCard, {
    props: { recipe },
    global: {
      plugins: [vuetify],
      // jsdom never finishes the expand animation, so let v-show alone
      // decide visibility
      stubs: { VExpandTransition: { template: "<div><slot /></div>" } },
    },
  });
  await flushPromises();
  return wrapper;
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("user", JSON.stringify({ id: 1, token: "test-token" }));
});

describe("Feature 2 — Recipe Management", () => {
  describe("US-2.3 — Review a recipe's details", () => {
    it("Card shows the recipe summary", async () => {
      const wrapper = await mountCard();

      expect(wrapper.text()).toContain("Chili");
      expect(wrapper.text()).toContain("4 Servings");
      expect(wrapper.text()).toContain("45 minutes");
      expect(wrapper.text()).toContain("Weeknight chili");
    });

    it("Expanding a card reveals ingredients and steps", async () => {
      const wrapper = await mountCard({
        ingredients: [beansIngredient],
        steps: [simmerStep],
      });

      expect(detailsRegion(wrapper).element.style.display).toBe("none");

      await wrapper.find(".v-card").trigger("click");
      await flushPromises();

      const details = detailsRegion(wrapper);
      expect(details.element.style.display).not.toBe("none");
      expect(details.text()).toContain("Beans");
      expect(details.text()).toContain("2 cups");
      expect(details.text()).toContain("Simmer the beans");
    });

    it("Expanding a recipe with no ingredients or steps", async () => {
      const wrapper = await mountCard({ ingredients: [], steps: [] });

      await wrapper.find(".v-card").trigger("click");
      await flushPromises();

      const details = detailsRegion(wrapper);
      expect(details.element.style.display).not.toBe("none");
      expect(details.text()).toContain("Ingredients");
      expect(details.text()).toContain("Recipe Steps");
      expect(details.findAll("tbody tr")).toHaveLength(0);
      expect(details.findAll(".v-list-item")).toHaveLength(0);
    });
  });

  describe("US-2.5 — Delete a recipe", () => {
    it("The delete icon does not expand the card", async () => {
      const wrapper = await mountCard();

      expect(detailsRegion(wrapper).element.style.display).toBe("none");

      await wrapper.find('[aria-label="Delete recipe"]').trigger("click");
      await flushPromises();

      expect(wrapper.emitted("requestDelete")).toEqual([[recipe]]);
      expect(detailsRegion(wrapper).element.style.display).toBe("none");
    });
  });
});
