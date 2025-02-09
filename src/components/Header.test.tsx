import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // to simulate react router navigation
import Header from "./Header";

describe("Header Component", () => {
  it("renders the header title", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const title = screen.getByText(/sport shop/i);
    expect(title).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cart/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /admin/i })).toBeInTheDocument();
  });
});
