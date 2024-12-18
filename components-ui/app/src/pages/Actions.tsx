/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { RemoteTable, Widgets, env, useZone, Toaster, Message  } from '../tol-ui/src';


function Actions() {
  const title = <h2>Actions</h2>;

  const toaster = Toaster();

  const pushMessage = (message: string) => {
    toaster.push(
      <Message
        children={message}
        type="info"
        showIcon={true}
      />,
      { duration: 4000 }
    );
  };

  const sample = useZone({
    endpoint: 'sample',
    baseUrl: env.TOL_DATA,
    components: [{id: 'actions-example-3'}]
  });

  const actions = [
    {
      dropdownButtonName: 'say... hello',
      action: () => pushMessage('hello'),
    },
    'super fun EXPORT',
    {
      dropdownButtonName: 'bounce back :)',
      action: (ids: any, filter: any) => {
        console.log('ids', ids);
        console.log('filter', filter);
        pushMessage('check your console :D')
      },
    },
    'fail... deliberately ;)' // there is no action by this name
  ];

  const table = <RemoteTable
    id="actions-example-3"
    height={500}
    actions={actions}
    rowSelection={true}
    {...sample}
  />

  const components = [
    {
      component: title,
      type: 'full'
    },
    {
      component: table,
      type: 'full'
    }
  ];

  return (
    <Widgets
      components={components}
    />
  );
}

export default Actions;
