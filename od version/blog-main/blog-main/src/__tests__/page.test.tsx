import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/(blog)/page";

test("Page", () => {
  render(<Page />);

  const section = screen.getByRole("main");
  expect(section).toBeDefined();
});
