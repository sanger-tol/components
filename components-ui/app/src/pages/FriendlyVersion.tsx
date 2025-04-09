/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from 'react';
import { Widgets } from "../tol-ui/src/general";
import { getGitSHAFromName } from "../tol-ui/src/general/ReleaseInfo";

function FriendlyVersion() {

  const [gitSHA, setGitSHA] = useState("");

  const convertFriendlyName = (formData: any): void => {
    formData.preventDefault();
    const friendlyName = formData.target.elements.friendlyName.value;
    const convertedGitSHA = getGitSHAFromName(friendlyName);
    setGitSHA(convertedGitSHA);
  };

  const nameForm = (
    <form onSubmit={convertFriendlyName}>
      <input name="friendlyName" />
      <button type="submit">Convert</button>
    </form>
  );

  const viewer = (
    <div>
      <span>{gitSHA}</span>
    </div>
  );

  const components = [
    {
      component: nameForm,
      type: "full",
    },
    {
      component: viewer,
      type: "full",
    },
  ];

  return <Widgets components={components} />;
}

export default FriendlyVersion;
