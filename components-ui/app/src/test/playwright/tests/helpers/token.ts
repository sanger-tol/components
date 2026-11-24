// SPDX-FileCopyrightText: 2026 Genome Research Ltd.
//
// SPDX-License-Identifier: MIT

import { Page } from '@playwright/test';

export const getKeycloakToken = async (page: Page) => {
  try {
    const response = await page.request.post('https://auth.tol.sanger.ac.uk/auth/realms/dev/protocol/openid-connect/token', {
      form: {
        grant_type: 'password',
        client_id: process.env.KEYCLOAK_CLIENT_ID || '',
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
        username: process.env.KEYCLOAK_USERNAME || '',
        password: process.env.KEYCLOAK_PASSWORD || ''
      },
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to get Keycloak token:', error);
    throw error;
  }
};