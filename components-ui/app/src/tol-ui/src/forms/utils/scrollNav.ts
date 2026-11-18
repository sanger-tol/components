/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import type { KeyboardEvent } from "react";
import {
  normaliseCaps,
  SECTION_QUERY_PARAM,
  SUB_SECTION_QUERY_PARAM,
  DEFAULT_FORM_SCROLL_NAV_KEY,
  UNDEFINED_FORM_SECTION_IDENTIFIER,
} from "../..";
import type {
  IFieldStatusContext,
  IFormScrollNavConfig,
  IFormSection,
  IScrollNavGroup,
  IScrollNavItem,
  TFieldNavStatus,
  TFormField,
  TScrollNavGroupStatus,
} from "../..";
import { isEmptyFieldValue } from "./data";
import { cleanTitle, prettify } from "./labels";

/**
 * Builds the DOM anchor id for a field when a form uses scroll navigation.
 *
 * @param formKey - The scroll-nav key of the form.
 * @param subSection - The sub-section the field belongs to.
 * @param name - The field's name.
 * @param index - The field's index within the form config.
 * @returns The composed anchor id (e.g. `tol-form-metadata-general-doi-0`).
 */
export function getFieldAnchorId(
  formKey: string,
  subSection: string,
  name: string,
  index: number,
): string {
  return `tol-form-${formKey}-${subSection}-${name}-${index}`;
}

/**
 * Builds the DOM id for a form's scroll container.
 *
 * @param formKey - The scroll-nav key of the form.
 * @returns The scroll container id (e.g. `tol-form-scroll-metadata`).
 */
export function getScrollContainerId(formKey: string): string {
  return `tol-form-scroll-${formKey}`;
}

/**
 * Normalises the `scrollNav` form option into a full config, or `undefined`
 * when scroll navigation is disabled.
 *
 * @param scrollNav - The raw `formConfig.options.scrollNav` value.
 * @returns The resolved config with defaults applied.
 */
export function resolveScrollNavConfig(
  scrollNav?: boolean | IFormScrollNavConfig,
) {
  if (!scrollNav) return undefined;
  const config = scrollNav === true ? {} : scrollNav;
  if (config.enabled === false) return undefined;
  return {
    ...config,
    key: config.key ?? DEFAULT_FORM_SCROLL_NAV_KEY,
    active: config.active ?? true,
    syncUrl: config.syncUrl ?? true,
    sectionParam: config.sectionParam ?? SECTION_QUERY_PARAM,
    subSectionParam: config.subSectionParam ?? SUB_SECTION_QUERY_PARAM,
  };
}

/**
 * Gives every field an anchor id so scroll navigation can target it. Fields
 * with an explicit `id` keep it.
 *
 * @param fields - The form fields.
 * @param formKey - The scroll-nav key of the form.
 * @returns The fields with an `id` set.
 */
export function withFieldAnchorIds(
  fields: TFormField[],
  formKey: string,
): TFormField[] {
  return fields.map((field, index) => ({
    ...field,
    id:
      field.id ??
      getFieldAnchorId(
        formKey,
        field.section ?? UNDEFINED_FORM_SECTION_IDENTIFIER,
        field.name,
        index,
      ),
  }));
}

/**
 * Groups fields by their `section` (sub-section) in render order: sections in
 * order of first appearance, then fields without a section last.
 *
 * @param fields - The form fields, with anchor ids applied.
 * @param sections - Optional section metadata used for labels.
 * @param getStatus - Optional callback to calculate each field's current status.
 * @returns The sub-section groups with their ordered fields.
 */
export function getNavGroups(
  fields: TFormField[],
  sections: IFormSection[] = [],
  getStatus?: (field: TFormField) => TFieldNavStatus,
): IScrollNavGroup[] {
  const sectionsById = new Map(
    sections.map((section) => [section.id, section]),
  );
  const groups = new Map<string, IScrollNavGroup>();
  const miscFields: IScrollNavGroup["fields"] = [];

  fields.forEach((field, index) => {
    if (field.type === "checkbox" && field.hidden) return;
    const status = getStatus?.(field);

    const navField = {
      anchorId: field.id ?? field.name,
      label: cleanTitle(field.label ?? prettify(field.name)),
      name: field.name,
      index,
      ...(status
        ? {
            status,
            requiredForProgress:
              isRequiredField(field) &&
              status !== "auto" &&
              status !== "locked",
          }
        : {}),
    };

    if (!field.section) {
      miscFields.push(navField);
      return;
    }

    if (!groups.has(field.section)) {
      groups.set(field.section, {
        subSection: field.section,
        label:
          sectionsById.get(field.section)?.label ??
          normaliseCaps(field.section),
        fields: [],
      });
    }

    groups.get(field.section)!.fields.push(navField);
  });

  const orderedGroups = Array.from(groups.values());

  if (miscFields.length) {
    orderedGroups.push({
      subSection: UNDEFINED_FORM_SECTION_IDENTIFIER,
      label: normaliseCaps("Misc"),
      fields: miscFields,
    });
  }

  if (!getStatus) return orderedGroups;

  return orderedGroups.map((group) => ({
    ...group,
    status: getNavGroupStatus(
      group.fields.map((field) => field.status ?? "none"),
      sectionsById.get(group.subSection),
      group.fields.some((field) => field.requiredForProgress),
    ),
  }));
}

/**
 * Summarises the visible statuses in a section without treating filled fields as validated.
 *
 * @param statuses - The statuses of the fields in the section.
 * @param section - The form section.
 * @param hasRequiredFields - Whether the section contains editable required fields.
 * @returns The summarized status of the section, or `undefined` if no status applies.
 */
export function getNavGroupStatus(
  statuses: TFieldNavStatus[],
  section?: IFormSection,
  hasRequiredFields = false,
): TScrollNavGroupStatus | undefined {
  if (statuses.length === 0) return undefined;
  if (section?.locked || statuses.every((status) => status === "locked")) {
    return { kind: "locked" };
  }
  if (statuses.every((status) => status === "auto")) return { kind: "auto" };

  const remaining = statuses.filter((status) => status === "required").length;
  const errors = statuses.filter((status) => status === "error").length;
  if (remaining && errors) {
    return { kind: "attention", count: remaining + errors };
  }

  if (remaining) return { kind: "remaining", count: remaining };
  if (errors) return { kind: "error", count: errors };
  if (section?.optional) return { kind: "optional" };
  const nonAutomatic = statuses.filter((status) => status !== "auto");
  if (
    hasRequiredFields ||
    (nonAutomatic.some((status) => status === "complete") &&
      nonAutomatic.every(
        (status) => status === "complete" || status === "recommended",
      ))
  ) {
    const recommendedRemaining = statuses.filter(
      (status) => status === "recommended",
    ).length;
    return recommendedRemaining
      ? { kind: "complete", recommendedRemaining }
      : { kind: "complete" };
  }
  return undefined;
}

/**
 * Flattens nav groups into DOM-ordered nav items.
 *
 * @param groups - The nav groups.
 * @returns The flattened nav items.
 */
export function getNavItems(groups: IScrollNavGroup[]): IScrollNavItem[] {
  return groups.flatMap((group) =>
    group.fields.map(({ anchorId, name, index }) => ({
      anchorId,
      subSection: group.subSection,
      field: name,
      index,
    })),
  );
}

/**
 * Looks up a scroll container element in the DOM.
 *
 * @param containerId - The container's DOM id.
 * @returns The container element, or `null` if it is not mounted.
 */
export function findScrollContainer(
  containerId: string,
): HTMLDivElement | null {
  return document.getElementById(containerId) as HTMLDivElement | null;
}

/**
 * Computes the scroll-spy activation offset for a container: a quarter of its
 * visible height, capped at 120px.
 *
 * @param container - The scroll container.
 * @returns The offset in pixels.
 */
export function getScrollSpyOffset(container: HTMLDivElement): number {
  return Math.min(container.clientHeight * 0.25, 120);
}

/**
 * Determines the current status of a form field based on its value and context.
 *
 * @param field - The form field to get the status for.
 * @param value - The current value of the field.
 * @param ctx - Context with form and section lock status, and error information.
 * @returns The current status of the field.
 */
export function getFieldStatus(
  field: TFormField,
  value: unknown,
  ctx: IFieldStatusContext,
): TFieldNavStatus {
  if (field.automatic) return "auto";
  if (ctx.formLocked || ctx.sectionLocked || field.readOnly) return "locked";
  if (ctx.error) return "error";

  const empty = Array.isArray(value)
    ? value.every(isEmptyFieldValue)
    : isEmptyFieldValue(value);

  if (isRequiredField(field) && empty) return "required";
  if (!empty) return "complete";

  return field.recommended ? "recommended" : "none";
}

/**
 * Checks whether a field status means the field can't be edited.
 *
 * @param status - The field's status from `getFieldStatus`.
 * @returns `true` for locked and automatic fields.
 */
export function isReadOnlyStatus(status: TFieldNavStatus): boolean {
  return status === "locked" || status === "auto";
}

/**
 * Checks whether a field needs a value, either because it's required or
 * because a multiple field needs at least one row.
 *
 * @param field - The field to check.
 * @returns Whether the field must be filled in.
 */
export function isRequiredField(field: TFormField): boolean {
  return Boolean(field.required || ("minOne" in field && field.minOne));
}

/**
 * Determines if a form is scrolled to the bottom.
 *
 * @param form - The form element.
 * @returns `true` if the form is at the bottom, `false` otherwise.
 */
export function isFormAtBottom(form: HTMLDivElement): boolean {
  const maxScroll = form.scrollHeight - form.clientHeight;
  return (
    form.clientHeight > 0 && maxScroll > 0 && form.scrollTop >= maxScroll - 1
  );
}

/**
 * Generates the label for a form field or scroll navigation group based on its status.
 *
 * @param status - The status of the form field or scroll navigation group.
 * @returns The label corresponding to the status, or `null` if no label is applicable.
 */
export function generateFormNavStatusLabel(
  status: TFieldNavStatus | TScrollNavGroupStatus,
) {
  if (status === "none") return null;

  const kind = typeof status === "string" ? status : status.kind;
  const sectionComplete = typeof status !== "string" && kind === "complete";

  const recommendedRemaining =
    typeof status !== "string" && status.kind === "complete"
      ? (status.recommendedRemaining ?? 0)
      : 0;

  const count =
    typeof status === "object" && "count" in status ? status.count : 0;
  const fieldCount = `${count} ${count === 1 ? "field" : "fields"}`;

  const labels = {
    auto: "Auto-generated",
    locked: "Locked",
    error: count ? `${fieldCount} invalid` : "Invalid",
    required: "Required",
    remaining: `${fieldCount} remaining`,
    attention: `${fieldCount} ${count === 1 ? "needs" : "need"} attention`,
    complete: sectionComplete
      ? recommendedRemaining
        ? `Complete, ${recommendedRemaining} recommended ${recommendedRemaining === 1 ? "field" : "fields"} missing`
        : "Complete"
      : "Provided",
    recommended: "Recommended",
    optional: "Optional",
  };

  return labels[kind];
}

/**
 * Generates the icon for a form field or scroll navigation group based on its status.
 *
 * @param status - The status of the form field or scroll navigation group.
 * @returns The icon name corresponding to the status, or `null` if no icon is applicable.
 */
export function generateFormNavStatusIcon(
  status: TFieldNavStatus | TScrollNavGroupStatus,
) {
  if (status === "none") return null;

  const kind = typeof status === "string" ? status : status.kind;
  const sectionComplete = typeof status !== "string" && kind === "complete";

  const icon =
    kind === "auto"
      ? "robot"
      : kind === "locked"
        ? "lock"
        : kind === "complete" && !sectionComplete
          ? "check"
          : kind === "required" ||
              kind === "remaining" ||
              kind === "error" ||
              kind === "attention"
            ? "circle"
            : undefined;

  return icon;
}

/**
 * Returns the necessary props to make an element accessible as a clickable button.
 *
 * @param handler - The function to call when the element is activated via click or keyboard.
 * @returns An object containing the role, tabIndex, onClick, and onKeyDown handlers.
 */
export function onActivate(handler: () => void) {
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
