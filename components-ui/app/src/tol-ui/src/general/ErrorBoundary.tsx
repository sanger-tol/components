/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Component, ReactNode } from "react";


export interface PErrorBoundary {
  /**
   * The child components to be rendered within the error boundary.
   */
  children: ReactNode;
  /**
   * An optional fallback component to be rendered in case of an error.
   */
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  /**
   * A boolean flag to indicate whether an error has been caught by the error boundary.
   */
  hasError: boolean;
}

/**
 * Error boundary component to catch errors in the component and display a
 * fallback UI instead of breaking an entire component.
 */
export class ErrorBoundary extends Component<PErrorBoundary, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <span className="tol-display-error">Renderer Error</span>
      );
    }
    return this.props.children;
  }
}
