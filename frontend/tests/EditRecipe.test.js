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

const dialogStub = {
  props: ["modelValue"],
  template: '<div class="v-dialog" v-if="modelValue"><slot /></div>',
};
const snackbarStub = {
  props: ["modelValue"],
  template: '<div class="v-snackbar" v-if="modelValue"><slot /></div>',
};

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

const mountEdit = async ({ ingredients = [], steps = [], catalog = [] } = {}) => {
  RecipeServices.getRecipe.mockResolvedValue({ data: [chili] });
  RecipeIngredientServices.getRecipeIngredientsForRecipe.mockResolvedValue({
    data: ingredients,
  });
  RecipeStepServices.getRecipeStepsForRecipeWithIngredients.mockResolvedValue({
    data: steps,
  });
  IngredientServices.getIngredients.mockResolvedValue({ data: catalog });
  const wrapper = mount(EditRecipe, {
    global: {
      plugins: [vuetify],
      stubs: { VDialog: dialogStub, VSnackbar: snackbarStub },
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

describe("Feature 3 — Recipe List Item Management", () => {
  describe("US-3.1 — Add a measured ingredient to a recipe", () => {
    it("Edit Recipe lists the recipe's ingredients", async () => {
      const wrapper = await mountEdit({ ingredients: [beansRow] });

      expect(wrapper.text()).toContain("2");
      expect(wrapper.text()).toContain("cups");
      expect(wrapper.text()).toContain("Beans");
    });

    it("User adds a measured ingredient from Edit Recipe", async () => {
      const wrapper = await mountEdit({
        catalog: [{ id: 3, name: "Beans", unit: "cup", pricePerUnit: "1.50" }],
      });
      RecipeIngredientServices.addRecipeIngredient.mockResolvedValue({
        data: { id: 10, quantity: 2 },
      });

      const addButtons = wrapper
        .findAll(".v-btn")
        .filter((button) => button.text() === "Add");
      await addButtons[0].trigger("click");
      await flushPromises();

      wrapper.vm.newIngredient.quantity = 2;
      wrapper.vm.selectedIngredient = {
        id: 3,
        name: "Beans",
        unit: "cup",
      };
      RecipeIngredientServices.getRecipeIngredientsForRecipe.mockResolvedValue({
        data: [beansRow],
      });

      await wrapper
        .findAll(".v-btn")
        .find((button) => button.text() === "Add Ingredient")
        .trigger("click");
      await flushPromises();

      expect(RecipeIngredientServices.addRecipeIngredient).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Beans");
    });
  });

  describe("US-3.3 — Remove an ingredient from a recipe", () => {
    it("Owner removes a recipe ingredient from Edit Recipe", async () => {
      const wrapper = await mountEdit({ ingredients: [beansRow] });
      RecipeIngredientServices.deleteRecipeIngredient.mockResolvedValue({
        data: { message: "RecipeIngredient was deleted successfully!" },
      });
      RecipeIngredientServices.getRecipeIngredientsForRecipe.mockResolvedValue({
        data: [],
      });

      await wrapper.find('[aria-label="Delete ingredient"]').trigger("click");
      await flushPromises();

      expect(RecipeIngredientServices.deleteRecipeIngredient).toHaveBeenCalled();
      expect(wrapper.find('[aria-label="Delete ingredient"]').exists()).toBe(
        false
      );
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

    it("Owner adds a numbered step from Edit Recipe", async () => {
      const wrapper = await mountEdit();
      RecipeStepServices.addRecipeStep.mockResolvedValue({
        data: { id: 20, stepNumber: 1, instruction: "Simmer the beans" },
      });

      const addButtons = wrapper
        .findAll(".v-btn")
        .filter((button) => button.text() === "Add");
      await addButtons[1].trigger("click");
      await flushPromises();

      wrapper.vm.newStep.stepNumber = 1;
      wrapper.vm.newStep.instruction = "Simmer the beans";
      RecipeStepServices.getRecipeStepsForRecipeWithIngredients.mockResolvedValue(
        {
          data: [
            {
              id: 20,
              stepNumber: 1,
              instruction: "Simmer the beans",
              recipeIngredient: [],
            },
          ],
        }
      );

      await wrapper
        .findAll(".v-btn")
        .find((button) => button.text() === "Add Step")
        .trigger("click");
      await flushPromises();

      expect(RecipeStepServices.addRecipeStep).toHaveBeenCalled();
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

  describe("US-3.7 — Delete a step", () => {
    it("Owner deletes a step from Edit Recipe", async () => {
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
      RecipeStepServices.deleteRecipeStep.mockResolvedValue({
        data: { message: "RecipeStep was deleted successfully!" },
      });
      RecipeStepServices.getRecipeStepsForRecipeWithIngredients.mockResolvedValue(
        { data: [] }
      );

      await wrapper.find('[aria-label="Delete step"]').trigger("click");
      await flushPromises();

      expect(RecipeStepServices.deleteRecipeStep).toHaveBeenCalled();
      expect(wrapper.text()).not.toContain("Simmer the beans");
    });
  });
});
