/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type {
  IFormConfig,
  TDataObjectListOrNull,
  TDataObjectOrNull,
  TsDataSource,
  TUserProfileFormDataOrNull,
} from "../..";

/**
 * Merges an optional additional form config into a base config, inserting each
 * additional field at a specified index within the base fields array.
 *
 * Positions are applied left-to-right (ascending), so each insertion naturally
 * shifts the array for subsequent ones — matching the expected final order.
 * Additional fields with no corresponding position entry are appended at the end.
 * If no `additionalConfig` or `additionalConfigArrayPositions` are provided, the
 * `baseConfig` is returned unchanged.
 *
 * @param baseConfig - The base form configuration to merge into.
 * @param additionalConfig - Optional extra fields and button config to merge in.
 * @param additionalConfigArrayPositions - Ordered insertion indices within the base
 *   fields array, one per additional field. Fields beyond this array are appended.
 * @returns A new `IFormConfig` with the merged fields and resolved `buttonConfig`,
 *   or the original `baseConfig` if no additional config was supplied.
 */
export function createMergedConfig(
  baseConfig: IFormConfig,
  additionalConfig?: IFormConfig,
  additionalConfigArrayPositions?: number[],
): IFormConfig {
  if (!additionalConfig || !additionalConfigArrayPositions) {
    return baseConfig;
  }

  // Set the base config fields as the starting point for merging
  const mergedFields = [...baseConfig.fields];

  // Pair each additional field with its target position, then sort ascending
  // so we insert left-to-right — each insertion shifts the array for the next.
  const positioned = additionalConfig.fields
    .map((field, i) => ({
      field,
      position: additionalConfigArrayPositions[i],
    }))
    .filter(({ position }) => position !== undefined)
    .sort((a, b) => a.position - b.position);

  // Fields beyond the positions array have no target slot — append at end.
  const unpositioned = additionalConfig.fields.slice(
    additionalConfigArrayPositions.length,
  );

  // Insert each positioned additional field into the merged fields array at the specified index.
  positioned.forEach(({ field, position }) => {
    if (position >= 0 && position <= mergedFields.length) {
      mergedFields.splice(position, 0, field);
    }
  });

  // Append any unpositioned additional fields at the end of the merged fields array.
  mergedFields.push(...unpositioned);

  return {
    ...baseConfig,
    fields: mergedFields,
    buttonConfig: additionalConfig.buttonConfig || baseConfig.buttonConfig,
  };
}

export function normaliseProfileData(
  profileData: TDataObjectOrNull,
): TUserProfileFormDataOrNull {
  if (!profileData) return null;

  const { objectType, id, relationships, fetchRelationships, ...attributes } =
    profileData;

  return attributes;
}

export async function fetchUserProfile(
  dataSource: TsDataSource,
  userId?: string,
): Promise<TUserProfileFormDataOrNull> {
  if (!userId) return Promise.reject();

  return await dataSource
    .getListPage({
      objectType: "user",
      filter: {
        and_: {
          id: { eq: { value: userId } },
        },
      },
    })
    .then((data: TDataObjectListOrNull) => {
      return normaliseProfileData(data?.[0] ?? null);
    });
}

export async function upsertUserProfileData(
  dataSource: TsDataSource,
  userId: string | undefined,
  data: TUserProfileFormDataOrNull,
): Promise<TUserProfileFormDataOrNull> {
  if (!userId || !data) return Promise.reject();

  return await dataSource
    .upsert({
      payload: [
        {
          type: "user",
          id: userId,
          attributes: data,
        },
      ],
      objectType: "user",
    })
    .then((saved: TDataObjectListOrNull) => {
      return normaliseProfileData(saved?.[0] ?? null);
    });
}
