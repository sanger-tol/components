/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import {
  MyBoards,
  Dropdown,
  Page,
  PBoard,
  TsDataSource,
  BOARDS,
  TDataObjectOrNull,
  PRIVILEGE
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
  boards?: PBoard
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
      const board_user = await board?.relationships?.user;
      if (board && (board_user?.id.toString() === user.id.toString() || user.roles.includes('admin'))) {
        return PRIVILEGE.BOARD.EDITABLE;
      } else {
        return PRIVILEGE.BOARD.VIEWABLE;
      }
    });
  } else {
    // If no user or boardDataSource, return hidden
    return PRIVILEGE.BOARD.HIDDEN;
  }
}

/**
 * Deletes cache stored in localStorage more than the set age limit.
 * This age limit is defined at the top of this function.
 * 
 * This function is designed to be called in `TolApp` as it mounts
 */
export function clearUnusedLocalStorage() {
  // The number of hours old a key must be before it is deleted
  const hoursAgeLimit = 1;
  
  // The prefixes of keys we're checking which may be cleared
  const prefixesOfKeysToClear = [
    "/_config/attribute_metadata-",
    "/_config/relationships-",
    "entityMeta-",
  ];

  // You can't iterate over localStorage, but you can get how many keys it has with `.length`
  // combined with `key(index)`, so we need to use a count-controlled loop, decrementing i
  // each time we remove a key
  for (let i = 0; i < localStorage.length; i++) {
    // Get storage key
    const storageKey = localStorage.key(i);
  
    // Check if this is one of the keys we're looking for
    // (by skipping ones that aren't)
    if (!(storageKey && prefixesOfKeysToClear.some(prefix => storageKey.includes(prefix)))) {
      continue;
    }

    // Retrieve value
    const valueString = localStorage.getItem(storageKey);
    if (!valueString) continue;

    // Parse value to object and use it to get expiry date of this value
    const value: { expiry: string, data: object } = JSON.parse(valueString);
    const expiryDate = new Date(value.expiry);

    // Calculate the difference in hours between now and the expiry date
    const age = Date.now() - expiryDate.getTime();
    const hoursPassed = new Date(age).getHours();

    // Delete this key if the time difference exceeds the limit
    if (hoursPassed >= hoursAgeLimit) {
      localStorage.removeItem(storageKey);
      
      // We need to adjust the index one back after removing an item
      i--;
    }
  }
}
