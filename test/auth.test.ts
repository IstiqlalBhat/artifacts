import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, allowed } = vi.hoisted(() => ({
  getUser: vi.fn(),
  allowed: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}));
vi.mock("@/lib/allowlist", () => ({ isCurrentUserAllowed: allowed }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { currentAllowedUser, hubLoginUrl, requireUser } from "@/lib/auth";

beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://artifacts.tools.suncoast.studio";
  getUser.mockReset();
  allowed.mockReset();
});
afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.HUB_LOGIN_URL;
});

describe("hubLoginUrl", () => {
  it("builds the hub login URL with the encoded next target", () => {
    expect(hubLoginUrl("/dashboard")).toBe(
      "https://tools.suncoast.studio/login?next=" +
        encodeURIComponent("https://artifacts.tools.suncoast.studio/dashboard"),
    );
  });

  it("strips a trailing slash from NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://artifacts.tools.suncoast.studio/";
    expect(hubLoginUrl("/dashboard")).toBe(
      "https://tools.suncoast.studio/login?next=" +
        encodeURIComponent("https://artifacts.tools.suncoast.studio/dashboard"),
    );
  });
});

describe("requireUser", () => {
  it("redirects unauthenticated visitors to the hub login", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    await expect(requireUser("/dashboard")).rejects.toThrow(
      "REDIRECT:https://tools.suncoast.studio/login?next=" +
        encodeURIComponent("https://artifacts.tools.suncoast.studio/dashboard"),
    );
  });

  it("redirects non-allowlisted users to /no-access", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "x@y.z" } },
    });
    allowed.mockResolvedValue(false);
    await expect(requireUser("/dashboard")).rejects.toThrow(
      "REDIRECT:https://tools.suncoast.studio/no-access",
    );
  });

  it("returns id and email for an allowed user", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "x@y.z" } },
    });
    allowed.mockResolvedValue(true);
    await expect(requireUser("/dashboard")).resolves.toEqual({
      id: "u1",
      email: "x@y.z",
    });
  });
});

describe("currentAllowedUser", () => {
  it("returns null with no session", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    await expect(currentAllowedUser()).resolves.toBeNull();
  });

  it("returns null when not allowlisted", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "x@y.z" } },
    });
    allowed.mockResolvedValue(false);
    await expect(currentAllowedUser()).resolves.toBeNull();
  });

  it("returns the user when allowed", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "x@y.z" } },
    });
    allowed.mockResolvedValue(true);
    await expect(currentAllowedUser()).resolves.toEqual({
      id: "u1",
      email: "x@y.z",
    });
  });
});
