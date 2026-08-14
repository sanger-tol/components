/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

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
  return (
    <>
      {["first", "second", "third"].map(group =>
        <div key={group}>
          {/* TODO VALIDATION. IF NO LINK FOR THIS SKIP */}
          <h6>{props[`${group}GroupTitle`]}</h6>
          {["First", "Second", "Third", "Fourth"].map(link =>
            <a key={link} href={props[`${group}Group${link}LinkUrl`]}>{props[`${group}Group${link}LinkText`]}</a>
          )}
        </div>
      )}
    </>
  )
  
  return 
}
