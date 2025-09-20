import "./index.css";
import { App } from "./App.tsx";
import { store } from "./store.ts";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./providers/ThemeProvider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupResponseInterceptor } from "./lib/interceptor/AxiosInterceptor.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados são considerados "fresh"
      gcTime: 10 * 60 * 1000, // 10 minutos - tempo para garbage collection
      retry: (failureCount, error: any) => {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 404
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false, // Evita refetch desnecessário ao focar na janela
      refetchOnReconnect: true, // Refetch quando reconectar à internet
    },
    mutations: {
      retry: false, // Mutations não devem ter retry automático
    },
  },
});

setupResponseInterceptor(store);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
