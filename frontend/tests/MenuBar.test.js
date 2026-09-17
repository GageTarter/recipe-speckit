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
import MenuBar from "../src/components/MenuBar.vue";
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
      {
        path: "/",
        name: "login",
        component: { template: "<div>login</div>" },
      },
      {
        path: "/recipes",
        name: "recipes",
        component: { template: "<div>recipes</div>" },
      },
      {
        path: "/ingredients",
        name: "ingredients",
        component: { template: "<div>ingredients</div>" },
      },
    ],
  });
}

describe("Feature 1 — User Authentication & Session Management", () => {
  describe("US-1.4 — Sign out", () => {
    let wrapper;

    beforeEach(() => {
      localStorage.clear();
      vi.clearAllMocks();
    });

    afterEach(() => {
      if (wrapper) {
        wrapper.unmount();
        wrapper = undefined;
      }
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
      UserServices.logoutUser.mockResolvedValue({
        data: { message: "Logged out successfully." },
      });

      const router = buildRouter();
      router.push({ name: "recipes" });
      await router.isReady();
      const pushSpy = vi.spyOn(router, "push");

      wrapper = mount(
        {
          template: "<v-app><MenuBar /></v-app>",
          components: { MenuBar },
        },
        {
          global: {
            plugins: [vuetify, router],
            stubs: {
              // Keep menu content visible so Logout can be clicked in tests
              VMenu: {
                template:
                  '<div class="v-menu-stub"><slot name="activator" :props="{}" /><slot /></div>',
              },
            },
          },
        }
      );
      await flushPromises();

      expect(wrapper.text()).toContain("AL");

      const logoutBtn = wrapper
        .findAllComponents({ name: "VBtn" })
        .find((btn) => btn.text().includes("Logout"));
      expect(logoutBtn).toBeTruthy();
      await logoutBtn.trigger("click");
      await flushPromises();

      expect(UserServices.logoutUser).toHaveBeenCalled();
      expect(localStorage.getItem("user")).toBeNull();
      expect(pushSpy).toHaveBeenCalledWith({ name: "login" });
    });
  });
});
