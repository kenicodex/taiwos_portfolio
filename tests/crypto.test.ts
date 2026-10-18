import { describe, expect, it } from "vitest";
import { hashPassword, hashSessionToken, newSessionToken, verifyPassword } from "@/lib/crypto";

describe("password hashing", () => {
  it("verifies the right password", async () => {
    const stored = await hashPassword("correct horse battery");
    await expect(verifyPassword("correct horse battery", stored)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const stored = await hashPassword("correct horse battery");
    await expect(verifyPassword("wrong horse battery", stored)).resolves.toBe(false);
  });

  it("salts each hash, so equal passwords store differently", async () => {
    const a = await hashPassword("same-password-here");
    const b = await hashPassword("same-password-here");
    expect(a).not.toBe(b);
  });

  it("stores the scrypt format and never the plain password", async () => {
    const stored = await hashPassword("plain-text-check-1");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(stored).not.toContain("plain-text-check-1");
  });

  it.each(["", "not-a-hash", "scrypt$16384$8$1$abc"])(
    "returns false for malformed stored value %j",
    async (stored) => {
      await expect(verifyPassword("anything", stored)).resolves.toBe(false);
    },
  );
});

describe("session tokens", () => {
  it("creates 256-bit URL-safe tokens that differ each time", () => {
    const a = newSessionToken();
    const b = newSessionToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("hashes tokens deterministically without exposing the token", () => {
    const token = newSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).not.toContain(token);
    expect(hashSessionToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });
});
