"use client";

import { useState, useCallback } from "react";

export function useFilterState<T extends Record<string, unknown>>(
  initial: T
) {
  const [filters, setFilters] = useState<T>(initial);

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(initial);
  }, [initial]);

  const applyFilters = useCallback((updates: Partial<T>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  return { filters, setFilter, resetFilters, applyFilters };
}
