/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  BASE_PROFILE_FORM_CONFIG,
  BASE_PROFILE_FORM_MODEL,
  FormAllInOne,
  PopUpMessage,
  TolLoader,
  Widgets,
  createMergedConfig,
  useUserProfile,
} from "../..";
import type { IFormConfig, IUserProfileFormData } from "../..";

export interface IUserProfile {
  additionalConfig?: IFormConfig;
  additionalConfigArrayPositions?: number[];
  baseConfig?: IFormConfig;
}

export function UserProfile(props: IUserProfile) {
  const { additionalConfig, additionalConfigArrayPositions } = props;

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  const { profile, updateUserProfile, isLoading } = useUserProfile();
  const history = useHistory();
  const location = useLocation<{ from?: string }>();

  const baseConfig =
    props.baseConfig ?? BASE_PROFILE_FORM_CONFIG(hasUnsavedChanges);

  const mergedConfig = createMergedConfig(
    baseConfig,
    additionalConfig,
    additionalConfigArrayPositions,
  );

  const handleSubmit = (formData: object, isValid: boolean) => {
    if (!isValid) return;

    
    const { id, oidc_id, ...profileWithoutIds } = profile ?? {};
    console.log(JSON.stringify(formData), JSON.stringify(profileWithoutIds));

    if (JSON.stringify(formData) === JSON.stringify(profileWithoutIds)) {
      PopUpMessage({
        type: "info",
        message: "Did not Save. No changes were made.",
      });
      setHasUnsavedChanges(false);
      return;
    }

    updateUserProfile(formData as IUserProfileFormData);

    // Return users sent here by RequireCompletedProfile to where they came from
    const from = location.state?.from;
    if (from) history.push(from);
  };

  const ProfileForm = (
    <div style={{ padding: "15px" }}>
      <h3>Edit Your Profile</h3>
      <p>You must create a profile before you can access all features.</p>
      <FormAllInOne
        formConfig={mergedConfig}
        model={BASE_PROFILE_FORM_MODEL}
        initialData={profile ?? undefined}
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
