/**
 * Feature 5 — Ingredients Management
 * Spec: features/feature-5-ingredients-management.md
 */

import { mount, flushPromises } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { nextTick } from "vue";
import IngredientList from "../src/views/IngredientList.vue";
import IngredientServices from "../src/services/IngredientServices.js";

vi.mock("../src/services/IngredientServices.js", () => ({
  default: {
    getIngredients: vi.fn(),
    addIngredient: vi.fn(),
    updateIngredient: vi.fn(),
    deleteIngredient: vi.fn(),
    getIngredient: vi.fn(),
  },
}));

const vuetify = createVuetify({ components, directives });

const signedInUser = {
  id: 42,
  firstName: "Test",
  lastName: "Cook",
  email: "test@example.com",
  token: "test-token",
};

const butter = {
  id: 1,
  name: "Butter",
  unit: "sticks",
  pricePerUnit: 1.5,
  userId: 42,
};

function findButton(wrapper, label) {
  return wrapper
    .findAll("button")
    .find((btn) => btn.text().replace(/\s+/g, " ").trim() === label);
}

async function clickButton(wrapper, label) {
  const btn = findButton(wrapper, label);
  expect(btn).toBeTruthy();
  await btn.trigger("click");
}

async function mountView(list = []) {
  localStorage.setItem("user", JSON.stringify(signedInUser));
  IngredientServices.getIngredients.mockResolvedValue({ data: list });
  const wrapper = mount(IngredientList, {
    global: { plugins: [vuetify] },
  });
  await flushPromises();
  await nextTick();
  return wrapper;
}

async function fillNamedInputs(wrapper, { name, unit, pricePerUnit }) {
  const inputs = wrapper.findAll("input");
  if (name !== undefined && inputs[0]) {
    await inputs[0].setValue(name);
  }
  if (unit !== undefined && inputs[1]) {
    await inputs[1].setValue(unit);
  }
  if (pricePerUnit !== undefined && inputs[2]) {
    await inputs[2].setValue(pricePerUnit);
  }
}

describe("Feature 5 — Ingredients Management", () => {
  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("US-5.1 — Add a catalogue ingredient", () => {
    it("User creates a new ingredient", async () => {
      const wrapper = await mountView([]);
      const openAdd = findButton(wrapper, "+ New Ingredient");
      expect(openAdd).toBeTruthy();
      await openAdd.trigger("click");
      await nextTick();

      await fillNamedInputs(wrapper, {
        name: "Butter",
        unit: "sticks",
        pricePerUnit: "1.50",
      });

      IngredientServices.addIngredient.mockResolvedValue({
        status: 201,
        data: butter,
      });
      IngredientServices.getIngredients.mockResolvedValue({ data: [butter] });

      const confirm = findButton(wrapper, "Add Ingredient");
      expect(confirm).toBeTruthy();
      await confirm.trigger("click");
      await flushPromises();

      expect(IngredientServices.addIngredient).toHaveBeenCalled();
      expect(wrapper.text()).toContain("Butter");
      expect(findButton(wrapper, "+ New Ingredient")).toBeTruthy();
      wrapper.unmount();
    });

    it("User creates an ingredient with an empty name", async () => {
      const wrapper = await mountView([]);
      await clickButton(wrapper, "+ New Ingredient");
      await nextTick();
      await fillNamedInputs(wrapper, {
        name: "   ",
        unit: "sticks",
        pricePerUnit: "1.50",
      });
      await clickButton(wrapper, "Add Ingredient");
      await flushPromises();

      expect(wrapper.text()).toContain("Ingredient name is required.");
      expect(IngredientServices.addIngredient).not.toHaveBeenCalled();
      wrapper.unmount();
    });

    it("User creates an ingredient with an empty unit", async () => {
      const wrapper = await mountView([]);
      await clickButton(wrapper, "+ New Ingredient");
      await nextTick();
      await fillNamedInputs(wrapper, {
        name: "Butter",
        unit: "   ",
        pricePerUnit: "1.50",
      });
      await clickButton(wrapper, "Add Ingredient");
      await flushPromises();

      expect(wrapper.text()).toContain("Ingredient unit is required.");
      expect(IngredientServices.addIngredient).not.toHaveBeenCalled();
      wrapper.unmount();
    });

    it("User creates an ingredient with an empty price per unit", async () => {
      const wrapper = await mountView([]);
      await clickButton(wrapper, "+ New Ingredient");
      await nextTick();
      await fillNamedInputs(wrapper, {
        name: "Butter",
        unit: "sticks",
        pricePerUnit: "   ",
      });
      await clickButton(wrapper, "Add Ingredient");
      await flushPromises();

      expect(wrapper.text()).toContain("Ingredient price per unit is required.");
      expect(IngredientServices.addIngredient).not.toHaveBeenCalled();
      wrapper.unmount();
    });

    it("User creates an ingredient with a name that is too long", async () => {
      const wrapper = await mountView([]);
      await clickButton(wrapper, "+ New Ingredient");
      await nextTick();
      await fillNamedInputs(wrapper, {
        name: "a".repeat(101),
        unit: "sticks",
        pricePerUnit: "1.50",
      });
      IngredientServices.addIngredient.mockRejectedValue({
        response: {
          status: 400,
          data: { message: "Ingredient name must be 100 characters or fewer." },
        },
      });
      await clickButton(wrapper, "Add Ingredient");
      await flushPromises();

      const alert = wrapper.find(".v-alert");
      expect(alert.exists()).toBe(true);
      expect(alert.text()).toContain(
        "Ingredient name must be 100 characters or fewer."
      );
      wrapper.unmount();
    });

    it("User creates an ingredient with a non-numeric price per unit", async () => {
      const wrapper = await mountView([]);
      await clickButton(wrapper, "+ New Ingredient");
      await nextTick();
      await fillNamedInputs(wrapper, {
        name: "Butter",
        unit: "sticks",
        pricePerUnit: "abc",
      });
      IngredientServices.addIngredient.mockRejectedValue({
        response: {
          status: 400,
          data: { message: "Ingredient price per unit must be a number." },
        },
      });
      await clickButton(wrapper, "Add Ingredient");
      await flushPromises();

      const alert = wrapper.find(".v-alert");
      expect(alert.exists()).toBe(true);
      expect(alert.text()).toContain(
        "Ingredient price per unit must be a number."
      );
      wrapper.unmount();
    });
  });

  describe("US-5.2 — Browse the Ingredient Catalogue", () => {
    it("User views existing ingredients", async () => {
      const wrapper = await mountView([
        { id: 1, name: "Apple", unit: "piece", pricePerUnit: 0.5, userId: 42 },
        { id: 2, name: "Zucchini", unit: "piece", pricePerUnit: 1, userId: 42 },
      ]);
      const text = wrapper.text();
      expect(text).toContain("Apple");
      expect(text).toContain("Zucchini");
      expect(text.indexOf("Apple")).toBeLessThan(text.indexOf("Zucchini"));
      wrapper.unmount();
    });

    it("User has no existing ingredients", async () => {
      const wrapper = await mountView([]);
      expect(wrapper.text()).not.toContain("Butter");
      expect(wrapper.findAll("tbody tr").length).toBe(0);
      wrapper.unmount();
    });
  });

  describe("US-5.3 — Correct an ingredient's unit or price", () => {
    it("User edits an ingredient's information", async () => {
      const wrapper = await mountView([butter]);
      const edit = wrapper.find('[aria-label="Edit Ingredient"]');
      expect(edit.exists()).toBe(true);
      await edit.trigger("click");
      await nextTick();

      await fillNamedInputs(wrapper, { pricePerUnit: "2.00" });
      IngredientServices.updateIngredient.mockResolvedValue({
        status: 200,
        data: { message: "Ingredient was updated successfully." },
      });
      IngredientServices.getIngredients.mockResolvedValue({
        data: [{ ...butter, pricePerUnit: 2.0 }],
      });

      const confirm = findButton(wrapper, "Update Ingredient");
      expect(confirm).toBeTruthy();
      await confirm.trigger("click");
      await flushPromises();

      expect(IngredientServices.updateIngredient).toHaveBeenCalled();
      expect(wrapper.text()).toContain("2");
      wrapper.unmount();
    });

    it("User edits an ingredient with an empty name", async () => {
      const wrapper = await mountView([butter]);
      await wrapper.find('[aria-label="Edit Ingredient"]').trigger("click");
      await nextTick();
      await fillNamedInputs(wrapper, { name: "   " });
      await clickButton(wrapper, "Update Ingredient");
      await flushPromises();

      expect(wrapper.text()).toContain("Ingredient name is required.");
      expect(IngredientServices.updateIngredient).not.toHaveBeenCalled();
      wrapper.unmount();
    });

    it("User edits an ingredient with an empty unit", async () => {
      const wrapper = await mountView([butter]);
      await wrapper.find('[aria-label="Edit Ingredient"]').trigger("click");
      await nextTick();
      await fillNamedInputs(wrapper, { unit: "   " });
      await clickButton(wrapper, "Update Ingredient");
      await flushPromises();

      expect(wrapper.text()).toContain("Ingredient unit is required.");
      expect(IngredientServices.updateIngredient).not.toHaveBeenCalled();
      wrapper.unmount();
    });

    it("User edits an ingredient with an empty price per unit", async () => {
      const wrapper = await mountView([butter]);
      await wrapper.find('[aria-label="Edit Ingredient"]').trigger("click");
      await nextTick();
      await fillNamedInputs(wrapper, { pricePerUnit: "   " });
      await clickButton(wrapper, "Update Ingredient");
      await flushPromises();

      expect(wrapper.text()).toContain("Ingredient price per unit is required.");
      expect(IngredientServices.updateIngredient).not.toHaveBeenCalled();
      wrapper.unmount();
    });

    it("User edits an ingredient with a name that is too long", async () => {
      const wrapper = await mountView([butter]);
      await wrapper.find('[aria-label="Edit Ingredient"]').trigger("click");
      await nextTick();
      await fillNamedInputs(wrapper, { name: "a".repeat(101) });
      IngredientServices.updateIngredient.mockRejectedValue({
        response: {
          status: 400,
          data: { message: "Ingredient name must be 100 characters or fewer." },
        },
      });
      await clickButton(wrapper, "Update Ingredient");
      await flushPromises();

      const alert = wrapper.find(".v-alert");
      expect(alert.exists()).toBe(true);
      expect(alert.text()).toContain(
        "Ingredient name must be 100 characters or fewer."
      );
      wrapper.unmount();
    });

    it("User edits an ingredient with a non-numeric price per unit", async () => {
      const wrapper = await mountView([butter]);
      await wrapper.find('[aria-label="Edit Ingredient"]').trigger("click");
      await nextTick();
      await fillNamedInputs(wrapper, { pricePerUnit: "abc" });
      IngredientServices.updateIngredient.mockRejectedValue({
        response: {
          status: 400,
          data: { message: "Ingredient price per unit must be a number." },
        },
      });
      await clickButton(wrapper, "Update Ingredient");
      await flushPromises();

      const alert = wrapper.find(".v-alert");
      expect(alert.exists()).toBe(true);
      expect(alert.text()).toContain(
        "Ingredient price per unit must be a number."
      );
      wrapper.unmount();
    });
  });

  describe("US-5.4 Remove an ingredient", () => {
    it("User removes an ingredient", async () => {
      const wrapper = await mountView([butter]);
      expect(wrapper.text()).toContain("Butter");

      const del = wrapper.find('[aria-label="Delete ingredient"]');
      expect(del.exists()).toBe(true);
      await del.trigger("click");
      await nextTick();

      IngredientServices.deleteIngredient.mockResolvedValue({ status: 200 });
      IngredientServices.getIngredients.mockResolvedValue({ data: [] });

      const confirm =
        findButton(wrapper, "Delete") || findButton(wrapper, "Confirm");
      expect(confirm).toBeTruthy();
      await confirm.trigger("click");
      await flushPromises();

      expect(IngredientServices.deleteIngredient).toHaveBeenCalled();
      expect(wrapper.findAll("tbody tr").length).toBe(0);
      wrapper.unmount();
    });
  });
});
