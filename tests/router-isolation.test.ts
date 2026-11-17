import { expect, it } from "vitest";
import { getRouter } from "../app/router";

it("isolates query data between server-rendered requests", () => {
  const first = getRouter();
  const second = getRouter();
  first.options.context.queryClient.setQueryData(["private", "customer"], {
    id: "first-request",
  });
  expect(first).not.toBe(second);
  expect(
    second.options.context.queryClient.getQueryData(["private", "customer"]),
  ).toBeUndefined();
});
