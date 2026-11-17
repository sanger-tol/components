/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useId } from "react";
import type { KeyboardEvent, RefObject } from "react";
import { Icon, FORM_SCROLL_NAV_TEXT, FormNavStatus } from "../..";
import type {
  IScrollNavGroup,
} from "../..";

export interface PFormSideNavBar {
  /** Sub-section groups to list, in render order. */
  groups: IScrollNavGroup[];
  /** The sub-section currently in view. */
  activeSubSection?: string;
  /** Called with the anchor id of the clicked group or field. */
  onSelect: (anchorId: string) => void;
  /** Whether all section lists are expanded. */
  allExpanded?: boolean;
  /** Whether an individual section list is expanded. */
  isExpanded?: (section: string) => boolean;
  /** Toggle all section lists. */
  onToggleAll?: () => void;
  /** Toggle a section list and navigate to it. */
  onToggleSection?: (section: string, anchorId: string) => void;
  /** Ref for the independently scrollable list of sections. */
  scrollRef?: RefObject<HTMLDivElement>;
}

function onActivate(handler: () => void) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: handler,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handler();
      }
    },
  };
}

/** Lists a form's sub-sections and fields, highlighting the one in view. */
export function FormSideNavBar(props: PFormSideNavBar) {
  const {
    groups,
    activeSubSection,
    onSelect,
    allExpanded,
    isExpanded,
    onToggleAll,
    onToggleSection,
    scrollRef,
  } = props;
  const id = useId();

  const requiredFields = groups.flatMap((group) =>
    group.fields.filter((field) => field.requiredForProgress),
  );

  const completedFields = requiredFields.filter(
    (field) => field.status === "complete",
  ).length;

  return (
    <nav className="tol-form-sidenav">
      {onToggleAll && (
        <button
          type="button"
          className="tol-form-sidenav-toggle-all"
          onClick={onToggleAll}
        >
          {allExpanded
            ? FORM_SCROLL_NAV_TEXT.SHOW_ACTIVE_ONLY
            : FORM_SCROLL_NAV_TEXT.EXPAND_ALL}
        </button>
      )}
      {requiredFields.length > 0 && (
        <div className="tol-form-sidenav-progress">
          <label htmlFor={`${id}-progress`}>
            {completedFields} of {requiredFields.length} required fields
            complete
          </label>
          <progress
            id={`${id}-progress`}
            value={completedFields}
            max={requiredFields.length}
          />
        </div>
      )}
      <div className="tol-form-sidenav-groups" ref={scrollRef}>
        {groups.map((group, index) => {
          const active = group.subSection === activeSubSection ? " active" : "";
          const expanded = isExpanded?.(group.subSection) ?? true;
          const listId = `${id}-section-${index}`;

          return (
            <div key={group.subSection} className="tol-form-sidenav-group">
              <div
                className={`tol-form-sidenav-group-header${active}`}
                aria-expanded={onToggleSection ? expanded : undefined}
                aria-controls={onToggleSection ? listId : undefined}
                {...onActivate(() => {
                  if (onToggleSection) {
                    onToggleSection(group.subSection, group.fields[0].anchorId);
                  } else {
                    onSelect(group.fields[0].anchorId);
                  }
                })}
              >
                {onToggleSection && (
                  <span className="tol-form-sidenav-chevron" aria-hidden="true">
                    <Icon icon={expanded ? "chevron-down" : "chevron-right"} />
                  </span>
                )}
                <span className="tol-form-sidenav-label">{group.label}</span>
                <FormNavStatus status={group.status} />
              </div>
              <ul
                id={listId}
                hidden={!expanded}
                className={`tol-form-sidenav-group-list${active}`}
              >
                {group.fields.map((field) => (
                  <li key={field.anchorId}>
                    <div
                      className={`tol-form-sidenav-field${active}`}
                      {...onActivate(() => onSelect(field.anchorId))}
                    >
                      <span className="tol-form-sidenav-label">
                        {field.label}
                      </span>
                      <FormNavStatus status={field.status} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
