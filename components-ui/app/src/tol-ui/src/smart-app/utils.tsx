/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createContext } from "react";
import {
  MyBoards,
  Dropdown,
  Page,
  BoardSources,
  TsDataSource,
  BOARDS,
  TDataObjectOrNull
} from "..";


/**
 * Adds a "My Boards" page to the profile pages if the boards prop is provided.
 *
 * @param {Page[]} [profilePages] - An optional array of profile pages.
 * @param {BoardsObject} [boards] - An optional boards object.
 * @returns {Page[]} - A new array containing the "My Boards" page (if boards exist) followed by the original profile pages.
 */
export function addBoardPages(
  profilePages?: Page[],
  boards?: BoardSources
): Page[] {
  if (boards) {
    return [
      {
        name: "My Boards",
        element: <MyBoards boardDataSource={boards.boardDataSource!} />,
        auth: true,
      },
      ...(profilePages ?? []),
    ];
  }
  return profilePages ?? [];
}

/**
 * Removes all link pages from a list of pages.
 *
 * This function takes an optional array of Page or Dropdown items, and returns a new array 
 * that excludes any items with a "link" property.
 *
 * @param {(Page | Dropdown)[]} [pages] - An optional array containing pages or dropdowns.
 * @returns {(Page | Dropdown)[]} A new array containing only items without the "link" property.
 */
function removeLinkPages(pages?: (Page | Dropdown)[]): (Page | Dropdown)[] {
  return (pages ?? []).filter(page => !("link" in page));
}

/**
 * Combines main pages and profile pages into a single route array while filtering out pages with static links.
 *
 * In addition to removing top-level link items, if a Dropdown item exists and has nested pages,
 * those nested pages are also filtered to remove any with a "link" property.
 *
 * @param {(Page | Dropdown)[]} [pages] - An optional array of main pages. Pages with a static link are excluded.
 * @param {Page[]} [profilePages] - An optional array of profile pages.
 * @returns {(Page | Dropdown)[]} A new array with the main and profile pages (pages with a static link are excluded).
 */
export function generatePagesThatRequireARoute(
  pages?: (Page | Dropdown)[],
  profilePages?: Page[]
): (Page | Dropdown)[] {
  const filteredPages = removeLinkPages(pages).map(page => {
    if ("pages" in page && Array.isArray(page.pages)) {
      return {
        ...page,
        pages: removeLinkPages(page.pages)
      };
    }
    return page;
  });

  return [...filteredPages, ...(profilePages ?? [])];
}

export async function getUserPrivilege(
  user: any,
  boardDataSource: TsDataSource,
  boardId: string
) {
  if (user && boardDataSource && boardId) {
    return boardDataSource.getOne({
      objectType: BOARDS.BOARD,
      id: boardId,
    }).then(async (board: TDataObjectOrNull) => {
      const board_user = await board?.relationships.user;
      if (board && (board_user?.id.toString() === user.id.toString() || user.roles.includes('admin'))) {
        return 'editable';
      } else {
        return 'view-only';
      }
    });
  } else {
    return 'hidden'; // If no user or boardDataSource, return hidden
  }
}

export const PrivilegeContext = createContext<string | undefined>(undefined);
