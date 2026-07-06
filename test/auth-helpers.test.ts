import { afterEach, describe, expect, it } from "vitest";
import { cookieDomainOptions } from "@/lib/auth-helpers";

describe("cookieDomainOptions", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;
  });

  it("returns the shared domain when the env var is set", () => {
    process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN = ".tools.suncoast.studio";
    expect(cookieDomainOptions()).toEqual({ domain: ".tools.suncoast.studio" });
  });

  it("returns {} when unset so dev cookies stay host-only", () => {
    expect(cookieDomainOptions()).toEqual({});
  });
});
