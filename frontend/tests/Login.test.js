/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { createRouter, createMemoryHistory } from "vue-router";
import Login from "../src/views/Login.vue";
import UserServices from "../src/services/UserServices.js";

vi.mock("../src/services/UserServices.js", () => ({
  default: {
    addUser: vi.fn(),
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
    getUser: vi.fn(),
  },
}));

const vuetify = createVuetify({ components, directives });

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "login", component: Login },
      {
        path: "/recipes",
        name: "recipes",
        component: { template: "<div>recipes</div>" },
      },
    ],
  });
}

async function mountLogin() {
  const router = buildRouter();
  router.push({ name: "login" });
  await router.isReady();

  const wrapper = mount(
    {
      template: "<v-app><Login /></v-app>",
      components: { Login },
    },
    {
      global: {
        plugins: [vuetify, router],
      },
    }
  );
  await flushPromises();
  return { wrapper, router };
}

describe("Feature 1 — User Authentication & Session Management", () => {
  let wrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }
  });

  describe("US-1.1 — Create an account", () => {
    beforeEach(() => {
      localStorage.clear();
      vi.clearAllMocks();
    });

    it("Successfully create an account", async () => {
      const account = {
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        id: 7,
        token: "test-token",
      };
      UserServices.addUser.mockResolvedValue({ data: account });

      const mounted = await mountLogin();
      wrapper = mounted.wrapper;
      const { router } = mounted;
      const pushSpy = vi.spyOn(router, "push");

      await wrapper
        .findAllComponents({ name: "VBtn" })
        .find((btn) => btn.text() === "Create Account")
        .trigger("click");
      await flushPromises();

      const fields = wrapper.findAllComponents({ name: "VTextField" });
      await fields[0].vm.$emit("update:modelValue", "Ada");
      await fields[1].vm.$emit("update:modelValue", "Lovelace");
      await fields[2].vm.$emit("update:modelValue", "ada@example.com");
      await fields[3].vm.$emit("update:modelValue", "secure-password");

      const createButtons = wrapper
        .findAllComponents({ name: "VBtn" })
        .filter((btn) => btn.text() === "Create Account");
      await createButtons[createButtons.length - 1].trigger("click");
      await flushPromises();

      expect(UserServices.addUser).toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem("user"))).toMatchObject(account);
      expect(pushSpy).toHaveBeenCalledWith({ name: "recipes" });
    });
  });

  describe("US-1.2 — Login", () => {
    beforeEach(() => {
      localStorage.clear();
      vi.clearAllMocks();
    });

    it("Successfully login", async () => {
      const account = {
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        id: 7,
        token: "test-token",
      };
      UserServices.loginUser.mockResolvedValue({ data: account });

      const mounted = await mountLogin();
      wrapper = mounted.wrapper;
      const { router } = mounted;
      const pushSpy = vi.spyOn(router, "push");

      const fields = wrapper.findAllComponents({ name: "VTextField" });
      await fields[0].vm.$emit("update:modelValue", "ada@example.com");
      await fields[1].vm.$emit("update:modelValue", "secure-password");

      await wrapper
        .findAllComponents({ name: "VBtn" })
        .find((btn) => btn.text() === "Login")
        .trigger("click");
      await flushPromises();

      expect(UserServices.loginUser).toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem("user"))).toMatchObject(account);
      expect(pushSpy).toHaveBeenCalledWith({ name: "recipes" });
    });
  });
});
