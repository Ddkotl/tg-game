import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import App from "./App";

const queryClient = new QueryClient();

describe("App", () => {
  it("renders welcome text", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    );
    expect(screen.getByText(/TG RPG/i)).toBeInTheDocument();
  });
});
