/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

function UserId() {
  const user = JSON.parse(localStorage.getItem('user') || '');
  const userId = user['id'];
  const isAdmin = user['roles'].includes('admin');

  return (
    <div className="userId">
      Your user ID is &quot;{ userId }&quot;!
      <br/>
      You are {isAdmin ? '' : <i>not </i> }an admin
    </div>
  );
};

export default UserId;
