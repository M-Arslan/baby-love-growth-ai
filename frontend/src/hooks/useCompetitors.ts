import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import axios from "axios";

// Define a TypeScript interface for a competitor
export interface Competitor {
  url: string;
  traffic: number;
  description: string;
  logo: string | null;
}

// Define the mutation function correctly
const fetchCompetitors = async (website: string): Promise<Competitor[]> => {
  const response = await axios.post<{ competitors: Competitor[] }>(
    "http://localhost:5000/api/competitors",
    { website }
  );
  return response.data.competitors;
};

// Correctly define `useCompetitors` with proper types
export const useCompetitors = () => {
  return useMutation<Competitor[], Error, string>({
    mutationFn: fetchCompetitors,
  });
};