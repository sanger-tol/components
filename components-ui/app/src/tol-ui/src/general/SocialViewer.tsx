/*
 * SPDX-FileCopyrightText: 2025 Genome Research Ltd.
 *
 * SPDX-License-Identifier: MIT
 */

import { Icon } from ".";

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

export function SocialViewer({ name, links }: INameAndLinks) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{name}</h3>
      <div>
        {links.map((link, id) => (
          <a
            key={id}
            href={link.link}
            target="_blank"
          >
            <Icon icon={link.icon} />
          </a>
        ))}
      </div>
    </div>
  );
}
