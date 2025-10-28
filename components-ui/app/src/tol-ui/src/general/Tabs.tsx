/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from "react";
import { Tabs as RSTabs } from "rsuite";

type PTabs = React.ComponentProps<typeof RSTabs>;
type TabSubcomponent = typeof RSTabs.Tab;
type TabsComponent = React.FC<PTabs> & { Tab: TabSubcomponent };

export function Tabs(props: PTabs): TabsComponent {
  const { children, activeKey, defaultActiveKey, onSelect } = props;

  const [activatedKeys, setActivatedKeys] = useState<string[]>(
    defaultActiveKey ? [defaultActiveKey] : activeKey ? [activeKey] : []
  );

  const handleSelect = (eventKey: string, event: React.SyntheticEvent) => {
    if (!activatedKeys.includes(eventKey)) {
      setActivatedKeys(keys => [...keys, eventKey]);
    }
    onSelect?.(eventKey, event);
  };

  // clone children to only render content if activated
  const lazyChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    const { eventKey, children: tabChildren } = child.props as { eventKey: string; children?: React.ReactNode };
    const isActive = activatedKeys.includes(eventKey);
    return React.cloneElement(
      child,
      undefined,
      isActive ? tabChildren : null
    );
  });

  // @ts-ignore
  return (
    <RSTabs
      className="tol-tabs"
      appearance="pills"
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      onSelect={handleSelect}
      {...props}
    >
        {lazyChildren}
    </RSTabs>
  );
};

Tabs.Tab = RSTabs.Tab;
