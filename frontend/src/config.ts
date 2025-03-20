import { QueryClient } from "react-query";
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:3000",
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: false,
    },
  },
});
