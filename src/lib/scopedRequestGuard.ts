export interface ScopedRequestGuard {
  readonly scopeId: string;
  isActive(scopeId?: string): boolean;
  cancel(): void;
}

/**
 * Prevents an async response from being accepted after its user/tenant scope
 * has been replaced or the owning effect has unmounted.
 */
export function createScopedRequestGuard(scopeId: string): ScopedRequestGuard {
  let active = true;

  return {
    scopeId,
    isActive(candidateScopeId = scopeId) {
      return active && candidateScopeId === scopeId;
    },
    cancel() {
      active = false;
    },
  };
}
