import { describe, it, expect } from "bun:test";
import { generateSafeUsername } from "./usernameUtils";

describe("generateSafeUsername", () => {
  it("should generate a valid username when first and last name are provided", () => {
    const username = generateSafeUsername("John", "Doe");
    expect(username).toMatch(/^john_doe_[a-z0-9]{6}$/);
    expect(username.length).toBeGreaterThanOrEqual(4);
    expect(username.length).toBeLessThanOrEqual(64);
  });

  it("should sanitize special characters, accents, and punctuation in names", () => {
    const username = generateSafeUsername("Juan-Carlos!", "@O'Connor#");
    expect(username).toMatch(/^juancarlos_oconnor_[a-z0-9]{6}$/);
  });

  it("should generate a valid username when only first name is provided", () => {
    const username = generateSafeUsername("Alice");
    expect(username).toMatch(/^alice_[a-z0-9]{6}$/);
  });

  it("should generate a valid username when only last name is provided", () => {
    const username = generateSafeUsername(undefined, "Smith");
    expect(username).toMatch(/^smith_[a-z0-9]{6}$/);
  });

  it("should fallback to email prefix when names are empty strings or whitespace", () => {
    const username = generateSafeUsername("   ", "   ", "maria.santos@ntc.gov.ph");
    expect(username).toMatch(/^mariasantos_[a-z0-9]{6}$/);
  });

  it("should fallback to email prefix when names are undefined", () => {
    const username = generateSafeUsername(undefined, undefined, "user.test+tag@example.com");
    expect(username).toMatch(/^usertesttag_[a-z0-9]{6}$/);
  });

  it("should handle extremely short single name by appending 'user' suffix for minimum base length constraint", () => {
    const username = generateSafeUsername("A");
    expect(username).toMatch(/^auser_[a-z0-9]{6}$/);
    expect(username.length).toBeGreaterThanOrEqual(4);
  });

  it("should handle single character first and last name properly", () => {
    const username = generateSafeUsername("A", "B");
    expect(username).toMatch(/^a_b_[a-z0-9]{6}$/);
    expect(username.length).toBeGreaterThanOrEqual(4);
  });

  it("should fallback to 'user_xxxxxx' when all inputs are undefined or empty", () => {
    const username = generateSafeUsername(undefined, undefined, undefined);
    expect(username).toMatch(/^user_[a-z0-9]{6}$/);
  });

  it("should fallback to 'user_xxxxxx' when email contains only symbols", () => {
    const username = generateSafeUsername("", "", "@@@.com");
    expect(username).toMatch(/^user_[a-z0-9]{6}$/);
  });

  it("should truncate extremely long names to 64 characters max", () => {
    const veryLongName = "a".repeat(100);
    const username = generateSafeUsername(veryLongName, veryLongName);
    expect(username.length).toBeLessThanOrEqual(64);
  });

  it("should only contain lowercase alphanumeric characters and underscores", () => {
    const username = generateSafeUsername("Élizabeth 123!", "D'Souza-Smith #456", "test@domain.com");
    expect(username).toMatch(/^[a-z0-9_]+$/);
  });
});
