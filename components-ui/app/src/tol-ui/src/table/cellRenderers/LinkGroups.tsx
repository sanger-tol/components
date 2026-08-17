/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button } from "../..";

export interface PLinkGroups {
  firstGroupTitle?: string;
  firstGroupFirstLinkUrl?: string;
  firstGroupFirstLinkText?: string;
  firstGroupSecondLinkUrl?: string;
  firstGroupSecondLinkText?: string;
  firstGroupThirdLinkUrl?: string;
  firstGroupThirdLinkText?: string;
  firstGroupFourthLinkUrl?: string;
  firstGroupFourthLinkText?: string;
  secondGroupTitle?: string;
  secondGroupFirstLinkUrl?: string;
  secondGroupFirstLinkText?: string;
  secondGroupSecondLinkUrl?: string;
  secondGroupSecondLinkText?: string;
  secondGroupThirdLinkUrl?: string;
  secondGroupThirdLinkText?: string;
  secondGroupFourthLinkUrl?: string;
  secondGroupFourthLinkText?: string;
  thirdGroupTitle?: string;
  thirdGroupFirstLinkUrl?: string;
  thirdGroupFirstLinkText?: string;
  thirdGroupSecondLinkUrl?: string;
  thirdGroupSecondLinkText?: string;
  thirdGroupThirdLinkUrl?: string;
  thirdGroupThirdLinkText?: string;
  thirdGroupFourthLinkUrl?: string;
  thirdGroupFourthLinkText?: string;
}

export function LinkGroups(props: PLinkGroups) {
  const Link = ({ placement, groupPlacement }: { placement: string, groupPlacement: string }) => {
    const linkUrl = props[`${groupPlacement}Group${placement}LinkUrl`] as string | undefined;
    const linkText = props[`${groupPlacement}Group${placement}LinkText`] as string | undefined;

    return linkUrl && (
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
      <div>
        <h6>{groupTitle}</h6>
        <Link placement="First" groupPlacement={placement} />
        <Link placement="Second" groupPlacement={placement} />
        <Link placement="Third" groupPlacement={placement} />
        <Link placement="Fourth" groupPlacement={placement} />
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
