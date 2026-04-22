/**
 * helpers/state.manager.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Singleton in-memory store for sharing ephemeral test data between steps or
 * dependent specs within a single Playwright worker run.
 *
 * Usage:
 *   import { stateManager } from '../helpers/state.manager';
 *
 *   stateManager.set('programId', '12345');
 *   const id = stateManager.get<string>('programId');
 *   stateManager.clear();
 *
 * Rules:
 *   ✅ Use for IDs or transient values produced in one test and consumed in another.
 *   ✅ Always call stateManager.clear() in an afterAll / afterEach where appropriate.
 *   ⛔ Never store secrets or PII — use process.env for those.
 * ──────────────────────────────────────────────────────────────────────────────
 */

class StateManager {
  private store: Map<string, unknown> = new Map();

  /**
   * Persist a value under the given key for the duration of the test run.
   */
  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  /**
   * Retrieve a stored value. Returns `undefined` if the key has not been set.
   */
  get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  /**
   * Assert that a key exists; returns the value typed as T.
   * Use this when the key MUST be present — it will throw a descriptive error
   * so the calling spec can decide to `test.skip()` instead of failing silently.
   *
   * Example usage in a spec:
   *   const id = stateManager.require<string>('programId');
   */
  require<T>(key: string): T {
    const value = this.store.get(key);
    if (value === undefined || value === null) {
      throw new Error(
        `[StateManager] Required key "${key}" is not set. ` +
        `Ensure the preceding test step (that sets this value) ran successfully. ` +
        `If running in isolation, use test.skip() to prevent a false failure.`
      );
    }
    return value as T;
  }

  /**
   * Remove a single key from the store.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Wipe the entire store (call in afterAll hooks to reset state between suites).
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Dump all keys and values — useful for debugging inside a failing test.
   */
  dump(): Record<string, unknown> {
    return Object.fromEntries(this.store.entries());
  }
}

// Export a single shared instance for the entire worker process.
export const stateManager = new StateManager();
