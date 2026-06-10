/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  BASE_PROFILE_FORM_CONFIG,
  FormAllInOne,
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

  const { profile, updateUserProfile } = useUserProfile();
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
      component: ProfileForm,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}
