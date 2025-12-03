/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useQuery } from "@tanstack/react-query";
import { REFRESH_INTERVAL } from "../constants";

export interface RefetchBackoffOptions {
  limit?: number;
  initialInterval?: number;
  stopCondition?: boolean;
}

export interface RefetchBackoff {
  enabled?: boolean;
  options?: RefetchBackoffOptions;
}

export function useQueryData<T>(
  queryKey: string[],
  fetchFn: () => Promise<T>,
  options?: {
    select?: (data: T) => any;
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchInterval?: number | boolean;
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
    retry?: boolean | number;
    retryDelay?: number | ((attemptIndex: number) => number);
    placeholderData?: T;
    refetchBackoff?: RefetchBackoff;
  }
) {
  const {
    data = [],
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey,
    queryFn: fetchFn,
    enabled: options?.enabled ?? !!queryKey[1],
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchInterval: options?.refetchBackoff?.enabled
      ? (query: any) => {
          const count = query.state.dataUpdateCount ?? 0;
          if (
            count > (options?.refetchBackoff?.options?.limit || 20) ||
            options?.refetchBackoff?.options?.stopCondition
          ) {
            return false;
          } else {
            const interval = Math.min(REFRESH_INTERVAL * 2 ** count, 20000);
            return interval;
          }
        }
      : options?.refetchInterval,
    structuralSharing: false,
    ...options,
  });
  return {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isSuccess,
    refetch,
    dataUpdatedAt,
  };
}
