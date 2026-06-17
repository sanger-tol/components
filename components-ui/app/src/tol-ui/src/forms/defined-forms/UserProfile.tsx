/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  BASE_PROFILE_FORM_CONFIG,
  BASE_PROFILE_FORM_MODEL,
  PROFILE_FORM_FIELD_MAPPINGS,
  FormAllInOne,
  TolLoader,
  Widgets,
  applyFieldMappings,
  applyReadOnlyFields,
  createMergedConfig,
  useUserProfile,
} from "../..";
import type { IFieldMapping, IFormConfig, IUserProfileFormData } from "../..";

// TODO: Generalise
// TODO: Merge model configs

export interface IUserProfileAdditionalConfigs {
  additionalConfig?: IFormConfig;
  additionalConfigArrayPositions?: number[];
  additionalFieldMappings?: IFieldMapping[];
}

export interface IUserProfile {
  baseConfig?: IFormConfig;
  additionalConfigs?: IUserProfileAdditionalConfigs;
}

export function UserProfile(props: IUserProfile) {
  const {
    additionalConfigs: {
      additionalConfig,
      additionalConfigArrayPositions,
      additionalFieldMappings,
    } = {},
  } = props;

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const { profile, updateUserProfile, isLoading, hasCompletedProfile } =
    useUserProfile();
  const history = useHistory();
  const location = useLocation<{ from?: string }>();

  const baseConfig =
    props.baseConfig ?? BASE_PROFILE_FORM_CONFIG(hasUnsavedChanges);

  const mergedConfig = createMergedConfig(
    baseConfig,
    additionalConfig,
    additionalConfigArrayPositions,
  );

  const { mappedData: initialData, readOnlyFields } = applyFieldMappings(
    profile ?? {},
    [...PROFILE_FORM_FIELD_MAPPINGS, ...(additionalFieldMappings ?? [])],
  );
  const patchedConfig = applyReadOnlyFields(mergedConfig, readOnlyFields);

  const handleSubmit = (formData: object, isValid: boolean) => {
    if (!isValid) return;

    // Return users sent here by RequireCompletedProfile to where they came from
    // only after the mutation succeeds and the cache is updated.
    const from = location.state?.from;
    updateUserProfile(formData as IUserProfileFormData, {
      onSuccess: () => {
        if (from) history.push(from);
      },
    });
  };

  const ProfileForm = (
    <div style={{ padding: "15px", border: "1px solid var(--tol-grey-subtle)", borderRadius: "5px" }}>
      <h3>{`${hasCompletedProfile ? "Edit" : "Create"} Your Profile`}</h3>
      {!hasCompletedProfile && (
        <p>You must create a profile before you can access all features.</p>
      )}
      <FormAllInOne
        formConfig={patchedConfig}
        model={BASE_PROFILE_FORM_MODEL}
        initialData={initialData}
        fluid
        onUnsavedChanges={(unsavedChanges: boolean) =>
          setHasUnsavedChanges(unsavedChanges)
        }
        onSubmit={handleSubmit}
      />
    </div>
  );

  const components = [
    {
      component: isLoading ? (
        <TolLoader content="Loading profile..." vertical size="md" />
      ) : (
        ProfileForm
      ),
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}
