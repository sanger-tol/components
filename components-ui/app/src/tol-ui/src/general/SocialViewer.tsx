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
        <div className="tol-socialviewer-parent">
          <h6 className=".tol-socialviewer-title" key={topLevelIndex}>
            {item.name}
          </h6>
          <div className="tol-socialviewer-child">
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
