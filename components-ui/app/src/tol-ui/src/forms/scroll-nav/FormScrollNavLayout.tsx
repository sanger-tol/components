/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Button,
  FormSideNavBar,
  FORM_SCROLL_NAV_TEXT,
  getNavItems,
  getScrollContainerId,
  useScrollSpy,
  isFormAtBottom,
} from "../..";
import type { IScrollNavGroup, resolveScrollNavConfig } from "../..";

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
  const [expandAll, setExpandAll] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const navScrollRef = useRef<HTMLDivElement>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const containerId = getScrollContainerId(config.key);

  const { activeSubSection, scrollToAnchor } = useScrollSpy({
    items: getNavItems(groups),
    containerId,
    sectionKey: config.key,
    sectionParam: config.syncUrl ? config.sectionParam : undefined,
    subSectionParam: config.syncUrl ? config.subSectionParam : undefined,
    active: config.active,
  });

  useEffect(() => {
    if (!expandAll) setCollapsedSections(new Set());
  }, [activeSubSection, expandAll]);

  const isExpanded = (section: string) =>
    (expandAll || section === activeSubSection) &&
    !collapsedSections.has(section);

  const allExpanded =
    expandAll &&
    groups.length > 0 &&
    groups.every((group) => isExpanded(group.subSection));

  const expansionKey = groups
    .map((group) => (isExpanded(group.subSection) ? "1" : "0"))
    .join("");

  const toggleSection = (section: string, anchorId: string) => {
    setCollapsedSections((previous) => {
      const next = new Set(previous);
      if (isExpanded(section)) next.add(section);
      else next.delete(section);
      return next;
    });
    scrollToAnchor(anchorId);
  };

  const toggleAll = () => {
    setExpandAll(!allExpanded);
    setCollapsedSections(new Set());
  };

  useLayoutEffect(() => {
    const container = navScrollRef.current;
    const form = formScrollRef.current;
    const header = container?.querySelector<HTMLElement>(
      ".tol-form-sidenav-group-header.active",
    );
    
    if (!open || !container || !form || container.clientHeight === 0) return;

    if (isFormAtBottom(form)) {
      container.scrollTop = container.scrollHeight - container.clientHeight;
      return;
    }

    if (!header) return;

    const containerRect = container.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const groupRect = header.parentElement?.getBoundingClientRect();
    const top = containerRect.top + container.clientTop;
    const bottom = top + container.clientHeight;
    const targetRect =
      groupRect && groupRect.bottom - groupRect.top <= container.clientHeight
        ? groupRect
        : headerRect;

    if (targetRect.top < top) {
      container.scrollTop += targetRect.top - top;
    } else if (targetRect.bottom > bottom) {
      container.scrollTop += targetRect.bottom - bottom;
    }
  }, [activeSubSection, open, groups.length, expansionKey]);

  useLayoutEffect(() => {
    const form = formScrollRef.current;
    if (!form || !open) return;
    const scrollNavToBottom = () => {
      const container = navScrollRef.current;
      if (container && isFormAtBottom(form)) {
        container.scrollTop = container.scrollHeight - container.clientHeight;
      }
    };
    form.addEventListener("scroll", scrollNavToBottom, { passive: true });
    return () => form.removeEventListener("scroll", scrollNavToBottom);
  }, [containerId, open]);

  return (
    <div className="tol-form-layout">
      {groups.length > 0 && (
        <div
          className={`tol-form-side-nav__wrapper${open ? " open" : ""}${config.showStatus === false ? "" : " with-status"}`}
        >
          <div className="tol-form-side-nav__inner">
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
                allExpanded={allExpanded}
                isExpanded={isExpanded}
                onToggleAll={toggleAll}
                onToggleSection={toggleSection}
                scrollRef={navScrollRef}
              />
            </div>
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
          <div
            id={containerId}
            className="tol-form-layout__scroll-container"
            ref={formScrollRef}
          >
            {contentHeader}
            <div className="tol-form-layout__form">{children}</div>
          </div>
        </div>
      </div>
      {footer && <div className="tol-form-layout__footer">{footer}</div>}
    </div>
  );
}
