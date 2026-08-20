/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from "../..";

export interface PLinkGroups {
  firstGroupTitle?: string;
  firstGroupFirstLinkUrl?: string;
  firstGroupFirstLinkText?: string;
  firstGroupFirstLinkCondition?: boolean;
  firstGroupSecondLinkUrl?: string;
  firstGroupSecondLinkText?: string;
  firstGroupSecondLinkCondition?: boolean;
  firstGroupThirdLinkUrl?: string;
  firstGroupThirdLinkText?: string;
  firstGroupThirdLinkCondition?: boolean;
  firstGroupFourthLinkUrl?: string;
  firstGroupFourthLinkText?: string;
  firstGroupFourthLinkCondition?: boolean;
  secondGroupTitle?: string;
  secondGroupFirstLinkUrl?: string;
  secondGroupFirstLinkText?: string;
  secondGroupFirstLinkCondition?: boolean;
  secondGroupSecondLinkUrl?: string;
  secondGroupSecondLinkText?: string;
  secondGroupSecondLinkCondition?: boolean;
  secondGroupThirdLinkUrl?: string;
  secondGroupThirdLinkText?: string;
  secondGroupThirdLinkCondition?: boolean;
  secondGroupFourthLinkUrl?: string;
  secondGroupFourthLinkText?: string;
  secondGroupFourthLinkCondition?: boolean;
  thirdGroupTitle?: string;
  thirdGroupFirstLinkUrl?: string;
  thirdGroupFirstLinkText?: string;
  thirdGroupFirstLinkCondition?: boolean;
  thirdGroupSecondLinkUrl?: string;
  thirdGroupSecondLinkText?: string;
  thirdGroupSecondLinkCondition?: boolean;
  thirdGroupThirdLinkUrl?: string;
  thirdGroupThirdLinkText?: string;
  thirdGroupThirdLinkCondition?: boolean;
  thirdGroupFourthLinkUrl?: string;
  thirdGroupFourthLinkText?: string;
  thirdGroupFourthLinkCondition?: boolean;
}

const Link = ({
  rendererProps,
  placement,
  groupPlacement,
}: {
  rendererProps: PLinkGroups,
  placement: string,
  groupPlacement: string,
}) => {
  const linkUrl = rendererProps[`${groupPlacement}Group${placement}LinkUrl`] as string | undefined;
  const linkText = rendererProps[`${groupPlacement}Group${placement}LinkText`] as string | undefined;
  const linkConditionPassed = (
    rendererProps[`${groupPlacement}Group${placement}LinkCondition`] as boolean | undefined
  ) ?? true;

  return linkUrl && linkConditionPassed && (
    <li>
      <Button
        wrapperClassName="tol-data-point-link-group-link"
        text={linkText ?? "Link"}
        onClick={() => window.open(linkUrl, "_blank")}
      />
    </li>
  );
};

const LinkGroup = ({
  rendererProps,
  placement,
}: {
  rendererProps: PLinkGroups,
  placement: string,
}) => {
  const groupTitle = rendererProps[`${placement}GroupTitle`];

  return groupTitle && (
    <div className="tol-data-point-link-group-group">
      <h6>{groupTitle}</h6>
      <ul>
        <Link rendererProps={rendererProps} placement="First" groupPlacement={placement} />
        <Link rendererProps={rendererProps} placement="Second" groupPlacement={placement} />
        <Link rendererProps={rendererProps} placement="Third" groupPlacement={placement} />
        <Link rendererProps={rendererProps} placement="Fourth" groupPlacement={placement} />
      </ul>
    </div>
  );
};

export function LinkGroups(props: PLinkGroups) {
  return (
    <>
      <LinkGroup rendererProps={props} placement="first" />
      <LinkGroup rendererProps={props} placement="second" />
      <LinkGroup rendererProps={props} placement="third" />
    </>
  );
}
