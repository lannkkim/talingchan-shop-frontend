"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite, checkFavorite } from "@/services/favorite";
import { useAuth } from "@/contexts/AuthContext";

export function useFavorite(productId: string) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: isFavorite = false } = useQuery({
    queryKey: ["favorite", "check", productId],
    queryFn: () => checkFavorite(productId),
    enabled: isAuthenticated && !!productId,
  });

  const addMutation = useMutation({
    mutationFn: () => addFavorite(productId),
    onSuccess: () => {
      queryClient.setQueryData(["favorite", "check", productId], true);
      queryClient.invalidateQueries({ queryKey: ["favorites", "me"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => removeFavorite(productId),
    onSuccess: () => {
      queryClient.setQueryData(["favorite", "check", productId], false);
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
