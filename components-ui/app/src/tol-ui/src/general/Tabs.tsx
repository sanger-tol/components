/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Tabs as RSTabs } from "rsuite";

type PTabs = React.ComponentProps<typeof RSTabs>;
type TabSubcomponent = typeof RSTabs.Tab;
type TabsComponent = React.FC<PTabs> & { Tab: TabSubcomponent };

export const Tabs: TabsComponent = (props: PTabs) => (
  <RSTabs className="tol-tabs" appearance="pills" {...props} />
);

Tabs.Tab = RSTabs.Tab;
