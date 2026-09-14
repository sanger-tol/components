/*
 * SPDX-FileCopyrightText: 2025 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { IconLink } from "./IconLink";

export interface PNameAndLinks {
  data: TNameAndLinks;
}

export function SocialViewer(props: PNameAndLinks) {
  const { data } = props;
  return (
    <div>
      {data.map((item, topLevelIndex) => (
        <div className="tol-social-viewer-parent" key={topLevelIndex}>
          <p className="tol-social-viewer-title">
            {item.name}
          </p>
          <div className="tol-social-viewer-child">
            {item.links.map((link, bottomLevelIndex) => (
              <IconLink
                key={bottomLevelIndex}
                {...link}
                config={link.icon === "link" ? "solid" : "brands"}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
