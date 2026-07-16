/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFormData,
  upsertFormData,
  useQueryData,
  PopUpMessage,
  MESSAGE_TYPE,
  useAuth,
} from "..";
import type { TsDataSource, IAndAttributes } from "..";

export interface PUseFormData<T> {
  /**
   * The name of the form to fetch and cache. This is used as part of the query key for React Query.
   */
  formName: string;
  /**
   * The data source to fetch the form data from.
   */
  dataSource: TsDataSource;
  /**
   * The object type of the form data to fetch.
   */
  objectType: string;
  /**
   * Optional filter to apply when fetching the form data.
   */
  andFilter?: IAndAttributes;
  /**
   * Optional message to display on successful form data update.
   */
  successMessage?: string;
  /**
   * Optional message to display on failed form data update.
   */
  errorMessage?: string;
  /**
   * Optional condition to determine if the form data should be fetched. If false, the form data will not be fetched.
   */
  enabledCondition?: boolean;
  /**
   * Optional predicate run against the current form data. The result is
   * returned as `meetsCondition`, letting callers verify any arbitrary
   * condition (e.g. a completed profile, required fields present, etc.).
   */
  isComplete?: (data: T | null) => boolean;
<<<<<<< HEAD
  /**
   * Optional additional parts to append to the query key for React Query.
   * This can be used to create unique query keys for different instances of the same form.
   */
  queryKeyParts?: string[];
=======
>>>>>>> dev
}

/**
 * Provides the current form data, backed by the shared React Query cache.
 *
 * Every component calling this hook shares a single cached fetch per session
 * (keyed on `["formName", userId]`), so no provider is required and the
 * form is only fetched once per session.
 */
export const useFormData = <T>(props: PUseFormData<T>) => {
  const {
    formName,
    dataSource,
    objectType,
    andFilter,
    successMessage,
    errorMessage,
    enabledCondition,
    isComplete,
<<<<<<< HEAD
    queryKeyParts = [],
=======
>>>>>>> dev
  } = props;
  const { user } = useAuth();
  const queryClient = useQueryClient();

<<<<<<< HEAD
  const userId = user?.id ? String(user.id) : undefined;
  const queryKey = [
    formName,
    userId ?? "pending-user",
    ...(queryKeyParts.length > 0 ? queryKeyParts : ["unnamed-form"]),
  ];

  const { data, isLoading, isError, error } = useQueryData<T>(
    queryKey,
=======
  const { data, isLoading, isError, error } = useQueryData<T>(
    [formName, user?.id!],
>>>>>>> dev
    () =>
      fetchFormData<T>(dataSource, objectType, andFilter ?? {}).catch((err) => {
        console.error("fetchFormData failed:", err);
        throw err;
      }),
    {
      // If the `enabledCondition` is explicitly set to false, we disable the query.
      ...(enabledCondition === false ? { enabled: false } : {}),
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
    },
  );

  const { mutate: updateFormData } = useMutation({
    mutationFn: (formData: T) =>
      upsertFormData<T>(dataSource, objectType, formData, user?.id),
    onSuccess: (saved) => {
      queryClient.setQueryData([formName, user?.id], saved);
      successMessage &&
        PopUpMessage({ type: MESSAGE_TYPE.SUCCESS, message: successMessage });
    },
    onError: () => {
      errorMessage &&
        PopUpMessage({ type: MESSAGE_TYPE.ERROR, message: errorMessage });
    },
  });

  // useQueryData defaults `data` to [] before the fetch resolves,
  // but we want it to be null if there's no form data, so normalise that here.
  const formData: T = Array.isArray(data) ? null : (data ?? null);

  return {
    formData,
    meetsCondition: isComplete ? isComplete(formData) : false,
    isLoading,
    isError,
    error,
    updateFormData,
  };
};
