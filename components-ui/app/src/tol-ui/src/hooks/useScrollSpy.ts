/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { findScrollContainer, getScrollSpyOffset } from "..";
import type {
  IScrollNavItem,
  IUseScrollSpyArgs,
  IUseScrollSpyResult,
} from "..";

// Space left above a target when scrolling to it.
const SCROLL_HEADROOM = 8;
// Frames to wait for lazily-mounted content before giving up.
const MAX_SETUP_ATTEMPTS = 30;

/**
 * Tracks the reading position within a scroll container and exposes the
 * active sub-section plus a scroll-to handler.
 *
 * Highlights the item nearest the reading position, keeps a clicked target
 * highlighted until the user scrolls manually, restores the sub-section from
 * the URL on mount, and mirrors the active section/sub-section in the URL.
 */
export function useScrollSpy(props: IUseScrollSpyArgs): IUseScrollSpyResult {
  const {
    items,
    containerId,
    sectionKey,
    sectionParam,
    subSectionParam,
    active = true,
  } = props;

  const history = useHistory();
  const scrollTargetRef = useRef<string | null>(null);
  const itemsRef = useRef<IScrollNavItem[]>(items);
  const [activeAnchor, setActiveAnchor] = useState<string>(
    items[0]?.anchorId ?? "",
  );
  // Hold URL writes until any deep-linked sub-section has been restored.
  const [ready, setReady] = useState<boolean>(false);
  itemsRef.current = items;
  const getSearch = () => history?.location.search ?? window.location.search;
  const itemsKey = items.map((item) => item.anchorId).join("|");

  const activeSubSection = items.find(
    (item) => item.anchorId === activeAnchor,
  )?.subSection;

  const scrollToAnchor = (
    anchorId: string,
    behavior: ScrollBehavior = "smooth",
  ) => {
    const navItems = itemsRef.current;
    const subSection = navItems.find(
      (item) => item.anchorId === anchorId,
    )?.subSection;
    const targetId =
      navItems.find((item) => item.subSection === subSection)?.anchorId ??
      anchorId;

    setActiveAnchor(targetId);
    const container = findScrollContainer(containerId);
    if (!container) return;

    scrollTargetRef.current = targetId;
    const element =
      (subSection &&
        (container.querySelector(
          `[id="section-${subSection}"]`,
        ) as HTMLElement | null)) ||
      document.getElementById(targetId);
    if (!element) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const maxScrollTop = Math.max(
      0,
      container.scrollHeight - container.clientHeight,
    );
    const top = Math.min(
      maxScrollTop,
      Math.max(
        0,
        container.scrollTop +
          (elementRect.top - containerRect.top) -
          SCROLL_HEADROOM,
      ),
    );
    container.scrollTo({ top, behavior });
  };

  useEffect(() => {
    let frame = 0;
    let scrollFrame = 0;
    let attempts = 0;
    let scrollContainer: HTMLDivElement | null = null;

    const updateActiveAnchorForScroll = () => {
      const container = findScrollContainer(containerId);
      if (!container) return;

      const anchors = itemsRef.current.reduce<
        (IScrollNavItem & { element: HTMLElement })[]
      >((found, item) => {
        const element = document.getElementById(item.anchorId);
        if (element) found.push({ ...item, element });
        return found;
      }, []);
      if (!anchors.length) return;

      const scrollTarget = scrollTargetRef.current;
      if (scrollTarget) {
        setActiveAnchor(scrollTarget);
        return;
      }

      const containerTop = container.getBoundingClientRect().top;
      const maxScrollTop = Math.max(
        0,
        container.scrollHeight - container.clientHeight,
      );
      const progress =
        maxScrollTop > 0
          ? Math.min(1, Math.max(0, container.scrollTop / maxScrollTop))
          : 0;
      const baseOffset = getScrollSpyOffset(container);

      // Slide the activation line toward the foot as we near the bottom, so
      // tail sections unreachable by a fixed offset still activate in order.
      const activationLine =
        baseOffset + progress * (container.clientHeight - baseOffset);

      let currentAnchor = anchors[0].anchorId;
      for (const item of anchors) {
        const itemTop = item.element.getBoundingClientRect().top - containerTop;
        if (itemTop > activationLine + 1) break;
        currentAnchor = item.anchorId;
      }
      setActiveAnchor(currentAnchor);
    };

    const handleScroll = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(updateActiveAnchorForScroll);
    };

    const clearScrollTarget = () => {
      scrollTargetRef.current = null;
    };

    const restoreFromUrl = () => {
      if (!active || !subSectionParam) return false;
      const params = new URLSearchParams(getSearch());
      if (sectionParam && sectionKey && params.get(sectionParam) !== sectionKey)
        return false;
      const subSection = params.get(subSectionParam);
      const target = itemsRef.current.find(
        (item) => item.subSection === subSection,
      );
      if (!target) return false;
      scrollToAnchor(target.anchorId, "auto");
      return true;
    };

    const trySetup = () => {
      const container = findScrollContainer(containerId);
      const hasAnchors = itemsRef.current.some((item) =>
        document.getElementById(item.anchorId),
      );

      // Lazy content can mount after this effect runs; retry until ready.
      if (!container || !hasAnchors) {
        if (attempts++ < MAX_SETUP_ATTEMPTS) {
          frame = requestAnimationFrame(trySetup);
        } else {
          setReady(true);
        }
        return;
      }

      if (!restoreFromUrl()) updateActiveAnchorForScroll();
      setReady(true);
      scrollContainer = container;
      container.addEventListener("scroll", handleScroll, { passive: true });
      container.addEventListener("wheel", clearScrollTarget, { passive: true });
      container.addEventListener("touchstart", clearScrollTarget, {
        passive: true,
      });
      container.addEventListener("mousedown", clearScrollTarget);
    };

    scrollTargetRef.current = null;
    setReady(false);
    setActiveAnchor(itemsRef.current[0]?.anchorId ?? "");
    frame = requestAnimationFrame(trySetup);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      scrollContainer?.removeEventListener("scroll", handleScroll);
      scrollContainer?.removeEventListener("wheel", clearScrollTarget);
      scrollContainer?.removeEventListener("touchstart", clearScrollTarget);
      scrollContainer?.removeEventListener("mousedown", clearScrollTarget);
    };
  }, [containerId, itemsKey, active]);

  useEffect(() => {
    if (!ready || !active || !history || !subSectionParam) return;
    const current = getSearch().replace(/^\?/, "");
    const next = new URLSearchParams(current);
    if (sectionParam && sectionKey) next.set(sectionParam, sectionKey);
    if (activeSubSection) {
      next.set(subSectionParam, activeSubSection);
    } else {
      next.delete(subSectionParam);
    }
    if (next.toString() !== current) {
      history.replace({ search: next.toString() });
    }
  }, [
    ready,
    active,
    activeSubSection,
    history,
    sectionKey,
    sectionParam,
    subSectionParam,
  ]);

  return { activeSubSection, scrollToAnchor };
}
