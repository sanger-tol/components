/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';

import { httpClient } from '../tol-ui/src/services/http/httpClient';


const UserId = () => {
  const [userId, setUserId] = useState(-1);

  const loggedInRender = () => userId !== -1 ? (
    <div className="userId">
            Your user ID is &quot;{ userId }&quot;!
    </div>
  ) : (
    <div className="userId">
            Just checking your user ID!
    </div>
  );

  useEffect(
    () => {
      httpClient().get('/user_id').then(
        (res: any) => setUserId(res.data.userId)
      ).catch(
        (error: any) => console.error(error.message)
      );
    },
    []
  );

  return loggedInRender();
};

export default UserId;
