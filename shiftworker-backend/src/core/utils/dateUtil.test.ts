import { isValidTimeZone } from "./dateUtil";

test("isValidTimeZone", () => {
  expect(isValidTimeZone("Oslo")).toBeFalse();
  expect(isValidTimeZone("Europe/Oslo")).toBeTrue();
});
