/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth.md
 *
 * Feature 6 — Profile Management
 * Spec: features/feature-6-profile-management.md
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import MenuBar from "../src/components/MenuBar.vue";
import UserServices from "../src/services/UserServices.js";

vi.mock("/oc_logo.png", () => ({ default: "oc_logo.png" }));

vi.mock("../src/services/UserServices.js", () => ({
  default: {
    addUser: vi.fn(),
    loginUser: vi.fn(),
    logoutUser: vi.fn(),
    getUser: vi.fn(),
  },
}));

const ada = {
  firstName: "Ada",
  lastName: "Cook",
  email: "ada@example.com",
  id: 1,
  token: "test-token",
};

function controlByText(wrapper, text) {
  return wrapper
    .findAll(".v-btn")
    .find((btn) => btn.text().replace(/\s+/g, " ").trim() === text);
}

async function mountBar(startPath = "/recipes") {
  const vuetify = createVuetify({ components, directives });
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "login", component: { template: "<div>Login page</div>" } },
      {
        path: "/recipes",
        name: "recipes",
        component: { template: "<div>Recipes</div>" },
      },
      {
        path: "/ingredients",
        name: "ingredients",
        component: { template: "<div>Ingredients</div>" },
      },
    ],
  });
  await router.push(startPath);
  await router.isReady();

  const Host = defineComponent({
    components: { MenuBar },
    template: `<v-app><MenuBar /></v-app>`,
  });

  const wrapper = mount(Host, {
    global: {
      plugins: [vuetify, router],
      stubs: {
        "v-img": true,
        "v-menu": {
          template: `<div class="v-menu"><slot name="activator" :props="{}" /><slot /></div>`,
        },
      },
    },
  });
  await flushPromises();
  return { wrapper, router };
}

async function openAccountMenu(wrapper, initials = "AC") {
  const activator = wrapper
    .findAll("button")
    .find((btn) => btn.text().includes(initials));
  expect(activator).toBeTruthy();
  await activator.trigger("click");
  await flushPromises();
}

describe("Feature 1 — User Authentication & Session Management", () => {
  describe("US-1.4 — Sign out", () => {
    let wrapper;

    beforeEach(() => {
      localStorage.clear();
      vi.clearAllMocks();
      UserServices.logoutUser.mockResolvedValue({
        data: { message: "Logged out successfully." },
      });
      vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      wrapper?.unmount();
      wrapper = undefined;
      console.log.mockRestore?.();
    });

    it("Successfully sign out", async () => {
      const account = {
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        id: 7,
        token: "test-token",
      };
      localStorage.setItem("user", JSON.stringify(account));

      const mounted = await mountBar();
      wrapper = mounted.wrapper;
      const { router } = mounted;
      const pushSpy = vi.spyOn(router, "push");

      expect(wrapper.text()).toContain("AL");

      await openAccountMenu(wrapper, "AL");
      const logoutBtn = controlByText(wrapper, "Logout");
      expect(logoutBtn).toBeTruthy();
      await logoutBtn.trigger("click");
      await flushPromises();

      expect(UserServices.logoutUser).toHaveBeenCalled();
      expect(localStorage.getItem("user")).toBeNull();
      expect(pushSpy).toHaveBeenCalledWith({ name: "login" });
    });
  });
});

describe("Feature 6 — Profile Management", () => {
  let wrapper;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    UserServices.logoutUser.mockResolvedValue({
      data: { message: "Logged out successfully." },
    });
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    console.log.mockRestore?.();
  });

  describe("US-6.1 — View Account", () => {
    it("Signed-in user views account name and email", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...ada, password: "secret-pass" })
      );
      ({ wrapper } = await mountBar());

      await openAccountMenu(wrapper);

      const text = wrapper.text();
      expect(text).toContain("Ada Cook");
      expect(text).toContain("ada@example.com");
      expect(text).toContain("AC");
      expect(text).not.toContain("secret-pass");
    });

    it("Signed-out user does not see the account menu", async () => {
      ({ wrapper } = await mountBar());

      expect(controlByText(wrapper, "Login")).toBeTruthy();
      expect(controlByText(wrapper, "Logout")).toBeUndefined();
      expect(wrapper.text()).not.toContain("Ada Cook");
      expect(wrapper.find(".v-menu").exists()).toBe(false);
    });
  });

  describe("US-6.2 — Log out", () => {
    it("Signed-in user logs out", async () => {
      localStorage.setItem("user", JSON.stringify(ada));
      const mounted = await mountBar();
      wrapper = mounted.wrapper;
      const { router } = mounted;

      expect(localStorage.getItem("user")).not.toBeNull();

      await openAccountMenu(wrapper);
      const logoutBtn = controlByText(wrapper, "Logout");
      expect(logoutBtn).toBeTruthy();
      await logoutBtn.trigger("click");
      await flushPromises();

      expect(UserServices.logoutUser).toHaveBeenCalled();
      expect(localStorage.getItem("user")).toBeNull();
      expect(router.currentRoute.value.name).toBe("login");
      expect(controlByText(wrapper, "Logout")).toBeUndefined();
      expect(controlByText(wrapper, "Login")).toBeTruthy();
    });

    it("Logout still signs the browser out if the server logout request fails", async () => {
      localStorage.setItem("user", JSON.stringify(ada));
      UserServices.logoutUser.mockRejectedValue(
        new Error("Authentication required")
      );
      const mounted = await mountBar();
      wrapper = mounted.wrapper;
      const { router } = mounted;

      await openAccountMenu(wrapper);
      await controlByText(wrapper, "Logout").trigger("click");
      await flushPromises();

      expect(localStorage.getItem("user")).toBeNull();
      expect(router.currentRoute.value.name).toBe("login");
    });
  });
});
