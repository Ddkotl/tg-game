import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders welcome text", () => {
    render(<App />);
    expect(screen.getByText(/Welcome to the game/i)).toBeInTheDocument();
  });
});
