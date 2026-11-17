import { expect, it } from "vitest";
import { googleMessageCredential } from "../app/lib/googleSignIn";
it("accepts Google credentials only from the exact popup, auth origin and flow", () => {
  const popup = {} as Window,
    other = {} as Window;
  const event = {
    source: popup,
    origin: "https://auth.orunelle.com",
    data: {
      type: "orunelle-customer-google",
      flow: "current-flow",
      idToken: "signed-google-token",
    },
  };
  expect(
    googleMessageCredential(event, popup, event.origin, "current-flow"),
  ).toBe("signed-google-token");
  for (const input of [
    { ...event, source: other },
    { ...event, origin: "https://attacker.example" },
    { ...event, data: { ...event.data, flow: "old-flow" } },
    { ...event, data: { ...event.data, type: "other" } },
    { ...event, data: { ...event.data, idToken: "x".repeat(16385) } },
    { ...event, data: null },
  ])
    expect(
      googleMessageCredential(input, popup, event.origin, "current-flow"),
    ).toBeUndefined();
});
