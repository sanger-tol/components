/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts";
import {
  fetchFormData,
  upsertFormData,
  LOCAL_DS,
  useQueryData,
  type TUserProfileFormDataOrNull,
  PopUpMessage,
} from "..";

/**
 * Provides the current user's profile, backed by the shared React Query cache.
 *
 * Every component calling this hook shares a single cached fetch per user
 * (keyed on `["userProfile", userId]`), so no provider is required and the
 * profile is only fetched once per session.
 */
export const useUserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } =
    useQueryData<TUserProfileFormDataOrNull>(
      ["userProfile", user?.id!],
      () =>
        fetchFormData<TUserProfileFormDataOrNull>(LOCAL_DS, "user", {
          id: { eq: { value: user?.id } },
        }).catch((err) => {
          console.error("fetchFormData failed:", err);
          throw err;
        }),
      {
        enabled: !!user?.id,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnMount: false,
      },
    );

  const { mutate: updateUserProfile } = useMutation({
    mutationFn: (profileData: TUserProfileFormDataOrNull) =>
      upsertFormData<TUserProfileFormDataOrNull>(
        LOCAL_DS,
        "user",
        profileData,
        user?.id,
      ),
    onSuccess: (saved) => {
      (queryClient.setQueryData(["userProfile", user?.id], saved),
        PopUpMessage({
          type: "success",
          message: "Profile updated successfully.",
        }));
    },
    onError: () =>
      PopUpMessage({ type: "error", message: "Failed to update profile." }),
  });

  // useQueryData defaults `data` to [] before the fetch resolves,
  // but we want it to be null if there's no profile, so normalise that here.
  const profile: TUserProfileFormDataOrNull = Array.isArray(data)
    ? null
    : (data ?? null);

  return {
    profile,
    hasCompletedProfile: !!profile?.email,
    isLoading,
    isError,
    error,
    updateUserProfile,
  };
};
