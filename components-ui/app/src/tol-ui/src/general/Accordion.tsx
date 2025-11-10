/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React, { useState } from "react";
import { Accordion as RSAccordion } from "rsuite";


type PAccordion = React.ComponentProps<typeof RSAccordion>;
type AccordionPanelSubcomponent = typeof RSAccordion.Panel;

const Accordion: React.FC<PAccordion> & { Panel: AccordionPanelSubcomponent } = (props: PAccordion) => {
  const { children, activeKey, defaultActiveKey, onSelect } = props;

  const [activatedKeys, setActivatedKeys] = useState<string[]>(
    defaultActiveKey !== undefined
      ? [String(defaultActiveKey)]
      : activeKey !== undefined
        ? [String(activeKey)]
        : []
  );

  const handleSelect = (eventKey: string | number, event: React.SyntheticEvent) => {
    const keyStr = String(eventKey);
    if (!activatedKeys.includes(keyStr)) {
      setActivatedKeys(keys => [...keys, keyStr]);
    }
    onSelect?.(eventKey, event);
  };

  // clone children to only render content if activated
  const lazyChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;
    const { eventKey, children: panelChildren } = child.props as { eventKey: string | number; children?: React.ReactNode };
    const isActive = activatedKeys.includes(String(eventKey));
    return React.cloneElement(
      child,
      undefined,
      isActive ? panelChildren : null
    );
  });

  return (
    <RSAccordion
      bordered
      className="tol-accordion"
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      onSelect={handleSelect}
      {...props}
    >
      {lazyChildren}
    </RSAccordion>
  );
};

Accordion.Panel = RSAccordion.Panel;

export { Accordion };