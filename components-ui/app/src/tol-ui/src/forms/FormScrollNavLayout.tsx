/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Button,
  FormSideNavBar,
  FORM_SCROLL_NAV_TEXT,
  getNavItems,
  getScrollContainerId,
  useScrollSpy,
} from "..";
import type { IScrollNavGroup, resolveScrollNavConfig } from "..";

export type TResolvedFormScrollNavConfig = NonNullable<
  ReturnType<typeof resolveScrollNavConfig>
>;

export interface PFormScrollNavLayout {
  config: TResolvedFormScrollNavConfig;
  /** Sub-section groups shown in the side navigation. */
  groups: IScrollNavGroup[];
  /** Rendered beside the title, e.g. status tags. */
  titleAdornment?: ReactNode;
  /** Rendered at the top of the scroll container, above the form. */
  contentHeader?: ReactNode;
  /** Rendered below the scroll container, e.g. pagination buttons. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Wraps a form in a titled, scrollable container with a collapsible
 * "On this page" side navigation that tracks the sub-section in view.
 */
export function FormScrollNavLayout(props: PFormScrollNavLayout) {
  const { config, groups, titleAdornment, contentHeader, footer, children } =
    props;
  const [open, setOpen] = useState<boolean>(config.defaultOpen ?? false);
  const containerId = getScrollContainerId(config.key);

  const { activeSubSection, scrollToAnchor } = useScrollSpy({
    items: getNavItems(groups),
    containerId,
    sectionKey: config.key,
    sectionParam: config.syncUrl ? config.sectionParam : undefined,
    subSectionParam: config.syncUrl ? config.subSectionParam : undefined,
    active: config.active,
  });

  return (
    <div className="tol-form-layout">
      {groups.length > 0 && (
        <div className={`tol-form-side-nav__wrapper${open ? " open" : ""}`}>
          <div className="tol-form-side-nav__button-wrapper">
            <strong className="tol-form-side-nav__label">
              {FORM_SCROLL_NAV_TEXT.LABEL}
            </strong>
            <div className="tol-form-side-nav__button">
              <Button
                outline={true}
                type="primary"
                icon="square-caret-right"
                onClick={() => setOpen(!open)}
                tooltip={
                  open
                    ? FORM_SCROLL_NAV_TEXT.HIDE_NAVIGATION
                    : FORM_SCROLL_NAV_TEXT.SHOW_NAVIGATION
                }
              />
            </div>
          </div>
          <div className="tol-form-side-nav__content-wrapper">
            <FormSideNavBar
              groups={groups}
              activeSubSection={activeSubSection}
              onSelect={scrollToAnchor}
            />
          </div>
        </div>
      )}
      <div className="tol-form-layout__inner">
        {(config.title || titleAdornment) && (
          <div className="tol-form-layout__header">
            <div className="tol-form-layout__header-inner">
              {config.title && <h3>{config.title}</h3>}
              {titleAdornment}
            </div>
          </div>
        )}
        <div className="tol-form-layout__content">
          <div id={containerId} className="tol-form-layout__scroll-container">
            {contentHeader}
            <div className="tol-form-layout__form">{children}</div>
          </div>
        </div>
        {footer}
      </div>
    </div>
  );
}
