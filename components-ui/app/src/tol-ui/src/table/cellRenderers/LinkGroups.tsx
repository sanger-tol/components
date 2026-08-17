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

export function LinkGroups(props: PLinkGroups) {
  const Link = ({ placement, groupPlacement }: { placement: string, groupPlacement: string }) => {
    const linkUrl = props[`${groupPlacement}Group${placement}LinkUrl`] as string | undefined;
    const linkText = props[`${groupPlacement}Group${placement}LinkText`] as string | undefined;
    const linkConditionPassed = (
      props[`${groupPlacement}Group${placement}LinkCondition`] as boolean | undefined
    ) ?? true;

    return linkUrl && linkConditionPassed && (
      <Button
        wrapperClassName="tol-data-point-link-group-link"
        text={linkText ?? "Link"}
        onClick={() => window.open(linkUrl, "_blank")}
      />
    );
  };

  const LinkGroup = ({ placement }: { placement: string }) => {
    const groupTitle = props[`${placement}GroupTitle`];

    return groupTitle && (
      <div className="tol-data-point-link-group-group">
        <h6>{groupTitle}</h6>
        <ul>
          <li><Link placement="First" groupPlacement={placement} /></li>
          <li><Link placement="Second" groupPlacement={placement} /></li>
          <li><Link placement="Third" groupPlacement={placement} /></li>
          <li><Link placement="Fourth" groupPlacement={placement} /></li>
        </ul>
      </div>
    );
  };

  return (
    <>
      <LinkGroup placement="first" />
      <LinkGroup placement="second" />
      <LinkGroup placement="third" />
    </>
  );
}
