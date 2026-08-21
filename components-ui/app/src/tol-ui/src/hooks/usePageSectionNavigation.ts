/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";

import type {
  IUsePageSectionNavigationArgs,
  IUsePageSectionNavigationResult,
} from "..";

/** Tracks the page section nearest a configurable viewport threshold. */
export function usePageSectionNavigation({
  items,
  activeOffsetRatio = 1 / 3,
}: IUsePageSectionNavigationArgs): IUsePageSectionNavigationResult {
  const [activeId, setActiveId] = useState(() => {
    if (typeof window === "undefined") return items[0]?.id || "";
    return window.location.hash.slice(1) || items[0]?.id || "";
  });

  useEffect(() => {
    let frame = 0;

    const updateActiveId = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const isAtPageEnd =
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight;
        const activeItem = isAtPageEnd
          ? items[items.length - 1]
          : [...items].reverse().find(({ id }) => {
              const section = document.getElementById(id);
              return (
                section &&
                section.getBoundingClientRect().top <=
                  window.innerHeight * activeOffsetRatio
              );
            });

        setActiveId(activeItem?.id ?? items[0]?.id ?? "");
      });
    };

    updateActiveId();
    window.addEventListener("hashchange", updateActiveId);
    window.addEventListener("resize", updateActiveId);
    window.addEventListener("scroll", updateActiveId, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", updateActiveId);
      window.removeEventListener("resize", updateActiveId);
      window.removeEventListener("scroll", updateActiveId);
    };
  }, [activeOffsetRatio, items]);

  return { activeId, setActiveId };
}
