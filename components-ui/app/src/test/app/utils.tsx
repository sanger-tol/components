/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import React from "react";

export function asElements(nodes: React.ReactNode[]) {
  return nodes.filter(React.isValidElement) as React.ReactElement[];
}

export function findLinkByText(nodes: React.ReactNode[], text: string) {
  return asElements(nodes).find((el) => el.props?.children === text);
}

export function findDropdownByTitle(nodes: React.ReactNode[], title: string) {
  return asElements(nodes).find((el) => el.props?.title === title);
}
