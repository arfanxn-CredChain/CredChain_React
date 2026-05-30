import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./index";

describe("UI store theme", () => {
  beforeEach(() => {
    useStore.setState({ theme: "system" });
  });

  it("defaults to 'system' when not persisted", () => {
    expect(useStore.getState().theme).toBe("system");
  });

  it("setTheme updates the value", () => {
    useStore.getState().setTheme("dark");
    expect(useStore.getState().theme).toBe("dark");
  });

  it("accepts light/dark/system values", () => {
    const set = useStore.getState().setTheme;
    set("light");
    expect(useStore.getState().theme).toBe("light");
    set("dark");
    expect(useStore.getState().theme).toBe("dark");
    set("system");
    expect(useStore.getState().theme).toBe("system");
  });
});
