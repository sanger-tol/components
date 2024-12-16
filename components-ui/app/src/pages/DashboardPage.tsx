/*
 * SPDX-FileCopyrightText: 2023 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */


import {
    Board,
    env,
    useZone,
    Visualisation,
    Widgets
  } from '../tol-ui/src';
  import { getUserFromLocalStorage } from "../tol-ui/src/services/localStorage/localStorageService";
  
  interface Props {
    user: any,
    boardId: string
  }
  
  function DashboardPage() {

    const user = getUserFromLocalStorage();
    return (
      <div>
        <Board id='b_GxvtjQLJ4IIN' baseUrl={env.API_PATH} user={user}/>
      </div>
    );
  }
  
  export default DashboardPage;
