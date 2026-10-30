/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  findScrollContainer,
  getFirstAnchor,
  getNavItems,
  getScrollSpyOffset,
  SECTION_QUERY_PARAM,
  SUB_SECTION_QUERY_PARAM,
} from "..";
import type { IScrollNavItem, IUseScrollSpyResult, IUseScrollSpyArgs } from "..";

/**
 * Tracks the user's reading position within the editor's scroll container and
 * exposes the active sub-section plus a scroll-to handler function.
 *
 * Highlights the nav item nearest the reading position, keeps a clicked target
 * highlighted until the user scrolls manually, resets on tab change, and
 * mirrors the active section/sub-section in the URL.
 */
export function useScrollSpy(props: IUseScrollSpyArgs): IUseScrollSpyResult {
  const { activeKey } = props;

  const history = useHistory();
  const scrollTargetRef = useRef<string | null>(null);
  const [activeAnchor, setActiveAnchor] = useState<string>("");

  const activeSubSection = getNavItems(activeKey).find(
    (item) => item.anchorId === activeAnchor,
  )?.subSection;

  const scrollToAnchor = (anchorId: string) => {
    const items = getNavItems(activeKey);
    const subSection = items.find(
      (item) => item.anchorId === anchorId,
    )?.subSection;
    const targetId =
      items.find((item) => item.subSection === subSection)?.anchorId ??
      anchorId;

    setActiveAnchor(targetId);
    const container = findScrollContainer(activeKey);

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

    // This can be adjusted to account for any fixed
    // headers or padding at the top of the scroll container.
    const headroom = 8;
    const top = Math.min(
      maxScrollTop,
      Math.max(
        0,
        container.scrollTop + (elementRect.top - containerRect.top) - headroom,
      ),
    );
    container.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    let frame = 0; // Used to cancel the setup loop if the component unmounts before it completes.
    let scrollFrame = 0; // Used to cancel the scroll update if the component unmounts before it completes.
    let attempts = 0; // Used to limit the number of setup attempts if the scroll container is not yet mounted.
    let scrollContainer: HTMLDivElement | null = null;

    const updateActiveAnchorForScroll = () => {
      const container = findScrollContainer(activeKey);
      if (!container) return;

      const anchors = getNavItems(activeKey).reduce<
        (IScrollNavItem & { element: HTMLElement })[]
      >((items, item) => {
        const element = document.getElementById(item.anchorId);
        if (element) items.push({ ...item, element });
        return items;
      }, []);
      if (!anchors.length) return;

      const scrollTarget = scrollTargetRef.current;
      if (scrollTarget) {
        setActiveAnchor((current) =>
          current === scrollTarget ? current : scrollTarget,
        );
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
        if (itemTop <= activationLine + 1) {
          currentAnchor = item.anchorId;
        } else {
          break;
        }
      }

      setActiveAnchor((current) =>
        current === currentAnchor ? current : currentAnchor,
      );
    };

    const handleScroll = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(updateActiveAnchorForScroll);
    };

    const clearScrollTarget = () => {
      scrollTargetRef.current = null;
    };

    const trySetup = () => {
      const container = findScrollContainer(activeKey);
      const hasAnchors = getNavItems(activeKey).some((item) =>
        document.getElementById(item.anchorId),
      );

      // Lazy tab content can mount after this effect runs; retry until ready.
      if (!container || !hasAnchors) {
        if (attempts++ < 30) frame = requestAnimationFrame(trySetup);
        return;
      }

      updateActiveAnchorForScroll();
      scrollContainer = container;
      container.addEventListener("scroll", handleScroll, { passive: true });
      container.addEventListener("wheel", clearScrollTarget, { passive: true });
      container.addEventListener("touchstart", clearScrollTarget, {
        passive: true,
      });
      container.addEventListener("mousedown", clearScrollTarget);
    };

    frame = requestAnimationFrame(trySetup);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      scrollContainer?.removeEventListener("scroll", handleScroll);
      scrollContainer?.removeEventListener("wheel", clearScrollTarget);
      scrollContainer?.removeEventListener("touchstart", clearScrollTarget);
      scrollContainer?.removeEventListener("mousedown", clearScrollTarget);
    };
  }, [activeKey]);

  useEffect(() => {
    scrollTargetRef.current = null;
    setActiveAnchor(getFirstAnchor(activeKey)?.anchorId ?? "");
  }, [activeKey]);

  useEffect(() => {
    const next = new URLSearchParams(location.search);
    next.set(SECTION_QUERY_PARAM, activeKey);
    if (activeSubSection) {
      next.set(SUB_SECTION_QUERY_PARAM, activeSubSection);
    } else {
      next.delete(SUB_SECTION_QUERY_PARAM);
    }
    history.replace({ search: next.toString() });
  }, [activeKey, activeAnchor]);

  return { activeSubSection, scrollToAnchor };
}
