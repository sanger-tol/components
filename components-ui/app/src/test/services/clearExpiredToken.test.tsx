/*
SPDX-FileCopyrightText: 2026 Genome Research Ltd.
SPDX-License-Identifier: MIT
*/

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { clearExpiredToken } from '../../tol-ui/src/services/auth/clearExpiredToken';

describe('clearExpiredToken decorator', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Set initial values in localStorage
    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('user', 'test-user');
    
    // Replace global localStorage
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  test('should return the result when the method succeeds', async () => {
    class TestService {
      @clearExpiredToken()
      async successfulMethod() {
        return 'success';
      }
    }

    const service = new TestService();
    const result = await service.successfulMethod();

    expect(result).toBe('success');
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  test('should clear localStorage when a 401 error is thrown', async () => {
    class TestService {
      @clearExpiredToken()
      async unauthorizedMethod() {
        const error: any = new Error('Unauthorized');
        error.response = { status: 401 };
        throw error;
      }
    }

    const service = new TestService();
    await service.unauthorizedMethod();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
  });

  test('should not clear localStorage when a non-401 error is thrown', async () => {
    class TestService {
      @clearExpiredToken()
      async serverErrorMethod() {
        const error: any = new Error('Server Error');
        error.response = { status: 500 };
        throw error;
      }
    }

    const service = new TestService();
    await service.serverErrorMethod();

    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  test('should handle methods with parameters', async () => {
    class TestService {
      @clearExpiredToken()
      async methodWithParams(param1: string, param2: number) {
        return `${param1}-${param2}`;
      }
    }

    const service = new TestService();
    const result = await service.methodWithParams('test', 123);

    expect(result).toBe('test-123');
    expect(localStorageMock.removeItem).not.toHaveBeenCalled();
  });

  test('should preserve "this" context in decorated methods', async () => {
    class TestService {
      private value = 'instance-value';

      @clearExpiredToken()
      async methodUsingThis() {
        return this.value;
      }
    }

    const service = new TestService();
    const result = await service.methodUsingThis();

    expect(result).toBe('instance-value');
  });
});
