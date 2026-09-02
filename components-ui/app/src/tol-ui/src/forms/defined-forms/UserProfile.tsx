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
  MESSAGE_TYPE,
  PopUpMessage,
} from "../..";
import type {
  IUserProfileAdditionalConfigs,
  IUserProfileFormData,
  TUserProfileFormDataOrNull,
  TProfileBaseConfig,
} from "../..";

export interface PUserProfile {
  /** Base form configuration, or a factory receiving `hasUnsavedChanges` followed by any `baseConfigArgs`. */
  baseConfig?: TProfileBaseConfig;
  /** Extra arguments forwarded to `baseConfig` when it's a factory (e.g. `[termsaccepted]`). */
  baseConfigArgs?: unknown[];
  /** Optional additional configurations for the user profile form,
   * including additional fields, their positions, and field mappings. */
  additionalConfigs?: IUserProfileAdditionalConfigs;
  /** Optional boolean flag to indicate whether to show a logout button in the profile page. */
  logout?: boolean;
  /** Transform form valuse into the upsert payload */
  transformSubmitData?: (
    formData: object,
    currentData: TUserProfileFormDataOrNull,
  ) => object;
  /** Return an error message to abort submission, or null to proceed. */
  validateSubmission?: (
    formData: object,
    currentData: TUserProfileFormDataOrNull,
  ) => string | null;
  /** Called after a successful save that completed the profile for the first time. */
  onFirstSubmitSuccess?: () => void;
}

export function UserProfile(props: PUserProfile) {
  const {
    baseConfig: baseConfigProp,
    baseConfigArgs = [],
    additionalConfigs: {
      additionalConfig,
      additionalConfigArrayPositions,
      additionalFieldMappings,
    } = {},
    logout,
    transformSubmitData,
    validateSubmission,
    onFirstSubmitSuccess,
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
    typeof baseConfigProp === "function"
      ? baseConfigProp(hasUnsavedChanges, profile, ...baseConfigArgs)
      : (baseConfigProp ?? BASE_PROFILE_FORM_CONFIG(hasUnsavedChanges));

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

    const error = validateSubmission?.(formData, profile);
    if (error) {
      PopUpMessage({ type: MESSAGE_TYPE.ERROR, message: error });
      return;
    }

    const wasIncomplete = !hasCompletedProfile;
    const payload = transformSubmitData
      ? transformSubmitData(formData, profile)
      : formData;

    const from = location.state?.from;
    updateUserProfile(payload as IUserProfileFormData, {
      onSuccess: () => {
        if (wasIncomplete) onFirstSubmitSuccess?.();
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
      {logout && (
        <div style={{ marginTop: "10vh" }}>
          <Button
            text="Logout"
            onClick={handleLogout}
            type="error"
            position="center"
            icon="fa-solid fa-right-from-bracket"
          />
        </div>
      )}
    </div>
  );
}
