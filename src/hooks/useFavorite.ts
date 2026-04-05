"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyFavorites, addFavorite, removeFavorite } from "@/services/favorite";
import { useAuth } from "@/contexts/AuthContext";

export function useFavorite(productId: string) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Derive isFavorite from the cached favorites list — no separate check endpoint
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", "me"],
    queryFn: getMyFavorites,
    enabled: isAuthenticated,
  });

  const isFavorite = favorites.some((f) => f.product_id === productId);

  const addMutation = useMutation({
    mutationFn: () => addFavorite(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", "me"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFavorite(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", "me"] });
    },
  });

  const toggle = () => {
    if (isFavorite) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  return {
    isFavorite,
    toggle,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}
