import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HomeScreen from "../../screens/Clients/HomeScreen";
import { useProductStore } from "../../store/useProductStore";
import { MemoryRouter } from "react-router-dom";

// Mock Zustand store
vi.mock("../../store/useProductStore", () => ({
  useProductStore: vi.fn(() => ({
    products: [],
    fetchProducts: vi.fn(),
    loading: true,
  })),
}));

describe("HomeScreen Component", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
  });

  it("renders the loading state initially", async () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    // Debugging para verificar qué se renderiza
    screen.debug();

    // Buscar el mensaje de carga correcto
    expect(await screen.findByText("🔄 Loading products...")).toBeInTheDocument();
  });

  it("displays filtered products correctly", async () => {
    // Reconfigurar el mock para este test
    vi.mocked(useProductStore).mockReturnValue({
      products: [
        { id: 1, name: "Bike", price: 200, type: "bicycle", isAvailable: true },
        { id: 2, name: "Helmet", price: 50, type: "accessory", isAvailable: true },
      ],
      fetchProducts: vi.fn(),
      loading: false,
    });

    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );

    expect(screen.getByText("Bike")).toBeInTheDocument();
    expect(screen.getByText("Helmet")).toBeInTheDocument();
  });
});
