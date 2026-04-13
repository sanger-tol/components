/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

// This file is required for the setup of the nextstepjs package.
// It has next.js as a peer dependency. We don't use next.js, so we need to mock some of its
// exported symbols (more specifically, navigation symbols)

export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  prefetch: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
});

export const usePathname = () => '';

export const useSearchParams = () => new URLSearchParams();

export const useParams = () => ({});
