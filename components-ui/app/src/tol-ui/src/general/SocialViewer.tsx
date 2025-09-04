/*
 * SPDX-FileCopyrightText: 2025 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Icon } from ".";

export interface PNameAndLinks {
  id: string;
  data: TNameAndLinks;
}

export type TNameAndLinks = INameAndLinks[];

export interface INameAndLinks {
  name: string;
  links: TLinks;
}

type TLinks = ILink[];

export interface ILink {
  link: string;
  icon: string;
}

export function SocialViewer(props: PNameAndLinks) {
  const { id, data } = props;
  return (
    <div id={id}>
      {data.map((item, topLevelIndex) => (
        <div className="">
          <h3 className="text-lg font-semibold" key={topLevelIndex}>
            {item.name}
          </h3>
          <div>
            {item.links.map((link, bottomLevelIndex) => {
              console.log(link);
              return (
                <a key={bottomLevelIndex} href={link.link} target="_blank">
                  <Icon icon={link.icon} size="10" />
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
