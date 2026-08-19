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
  useFormData,
  useAuth,
  LOCAL_DS,
  USER,
  PRE_DEFINED_FORM_TYPES,
  FORM_MESSAGE_TEXT,
  Button,
  useLogout,
} from "../..";
import type {
  IUserProfileAdditionalConfigs,
  IFormConfig,
  IUserProfileFormData,
  TUserProfileFormDataOrNull,
} from "../..";


export interface PUserProfile {
  /**
   * Optional base form configuration to use for the user profile form.
   * If not provided, a default configuration will be used.
   */
  baseConfig?: IFormConfig;
  /**
   * Optional additional configurations for the user profile form,
   * including additional fields, their positions, and field mappings.
   */
  additionalConfigs?: IUserProfileAdditionalConfigs;
  /**
   * Optional boolean flag to indicate whether to show a logout button in the profile page.
   */
  logout?: boolean;
}

export function UserProfile(props: PUserProfile) {
  const {
    additionalConfigs: {
      additionalConfig,
      additionalConfigArrayPositions,
      additionalFieldMappings,
    } = {},
  } = props;

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const { user } = useAuth();

  const {
    formData: profile,
    updateFormData: updateUserProfile,
    isLoading,
    meetsCondition: hasCompletedProfile,
  } = useFormData<TUserProfileFormDataOrNull>({
    formName: PRE_DEFINED_FORM_TYPES.USER_PROFILE,
    dataSource: LOCAL_DS,
    objectType: USER.USER,
    andFilter: { id: { eq: { value: user?.id } } },
    successMessage: FORM_MESSAGE_TEXT.PROFILE_FORM.UPDATE_SUCCESS,
    errorMessage: FORM_MESSAGE_TEXT.PROFILE_FORM.UPDATE_ERROR,
    enabledCondition: !!user?.id,
    isComplete: (data) => !!data?.email && !!data?.name,
  });
  const history = useHistory();
  const location = useLocation<{ from?: string }>();
  const handleLogout = useLogout();

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

    const from = location.state?.from;
    updateUserProfile(formData as IUserProfileFormData, {
      onSuccess: () => {
        if (from) history.push(from);
      },
    });
  };

  const ProfileForm = (
    <div className="tol-profile-form">
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
      type: "full",
      component: isLoading ? (
        <TolLoader content="Loading profile..." vertical size="md" />
      ) : (
        ProfileForm
      ),
    },
  ];

  return (
    <div>
      <Widgets components={components} />
      {props.logout && (
        <div style={{ marginTop: "10vh"}}>
          <Button
            text="Logout"
            onClick={handleLogout}
            type="error"
            position='center'
            icon='fa-solid fa-right-from-bracket'
          />
        </div>
      )}
    </div>
  );
}
