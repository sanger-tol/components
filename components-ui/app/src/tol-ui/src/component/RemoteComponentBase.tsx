/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { ReactElement, cloneElement } from "react";
import { Placeholder, IComponentBase, NotConfiguredPlaceholder, IRemoteComponentBase } from "..";


/** Props for the `RemoteComponentBase` wrapper component. */
export interface PRemoteComponentBase extends IRemoteComponentBase {
  /** The single top-level component to enhance, e.g. an `<ObjectDetail />` or `<Table />`. */
  children: ReactElement<IComponentBase>;
}

/**
 * Enhances a top-level component (already wrapped in its own `ComponentBase`) with the behaviour
 * needed by components that fetch their own data remotely, without wrapping it in a second `ComponentBase`.
 *
 * Clones `children`, injecting a `contents` override showing a loading, error, warning, or
 * not-configured placeholder in place of the child's own body.
 */
export function RemoteComponentBase(props: PRemoteComponentBase) {
  const {
    isLoading,
    errorMessage,
    warningMessage,
    noFieldsSelected,
    height = "100%",
    utilityBarConfig,
    contents,
    children,
  } = props;

  const resolvedContents = errorMessage
    ? <Placeholder errorMessage={errorMessage} height={height} />
    : warningMessage
      ? <Placeholder warningMessage={warningMessage} height={height} />
      : isLoading
        ? <Placeholder loader height={height} />
        : noFieldsSelected
          ? <NotConfiguredPlaceholder />
          : contents;

  return cloneElement(children, {
    height,
    utilityBarConfig,
    contents: resolvedContents,
  });
}

