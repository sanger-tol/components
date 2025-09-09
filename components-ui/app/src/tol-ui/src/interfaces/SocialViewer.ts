/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

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