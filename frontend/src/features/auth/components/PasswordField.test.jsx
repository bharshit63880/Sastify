import { getPasswordStrength } from "./PasswordField";

describe("password strength", () => {
  test("scores supported password characteristics without changing auth payloads", () => {
    expect(getPasswordStrength("abc").score).toBe(1);
    expect(getPasswordStrength("Strong1!").score).toBe(5);
  });
});
