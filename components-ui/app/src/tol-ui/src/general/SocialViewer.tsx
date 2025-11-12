/*
 * SPDX-FileCopyrightText: 2025 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Icon } from ".";
import { TNameAndLinks } from "..";

export interface PNameAndLinks {
  data: TNameAndLinks;
}

export function SocialViewer(props: PNameAndLinks) {
  const { data } = props;
  return (
    <div>
      {data.map((item, topLevelIndex) => (
        <div className="tol-social-viewer-parent">
          <p className="tol-social-viewer-title" key={topLevelIndex}>
            {item.name}
          </p>
          <div className="tol-social-viewer-child">
            {item.links.map((link, bottomLevelIndex) => (
              <a
                key={bottomLevelIndex}
                href={link.link}
                target="_blank"
                className="icon"
              >
                <Icon
                  icon={link.icon}
                  config={link.icon === "link" ? "solid" : "brands"}
                  size={"2x"}
                />
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
