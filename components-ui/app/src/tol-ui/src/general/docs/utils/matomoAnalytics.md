# `matomoAnalytics`

## Description

Integrates Matomo analytics into a web application. This function initializes the Matomo tracking script and configures it with a specified site ID. It is designed to track page views and enable link tracking for analytics purposes.

## Props

- `siteId: number`: The unique identifier for the site being tracked. This is required to associate the tracking data with the correct Matomo site.

## Usage

```tsx
import { matomoAnalytics } from './Utils';

// Call this function with your Matomo site ID to start tracking
matomoAnalytics(1);
```

## Implementation

The function first checks if a `siteId` is provided. If so, it proceeds to configure the Matomo analytics tracking. It ensures the global `_paq` (Matomo tracking queue) array is initialized and then pushes configuration commands into this array, such as `trackPageView` for tracking page views and `enableLinkTracking` for tracking link clicks.

A script element for Matomo's `matomo.js` is dynamically created and inserted into the document. This script is responsible for sending the tracking data to the Matomo server. The URL of the Matomo server and the site ID are set through `_paq` commands. The script is inserted asynchronously to avoid blocking the loading of the page.

This approach allows for the dynamic integration of Matomo analytics without needing to directly modify the HTML of the page, making it a flexible solution for single-page applications and other dynamic web projects.
