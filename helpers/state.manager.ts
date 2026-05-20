/** Singleton in-memory store for sharing ephemeral test data between steps or dependent specs. */
class StateManager {
  private store: Map<string, unknown> = new Map();

  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

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

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  dump(): Record<string, unknown> {
    return Object.fromEntries(this.store.entries());
  }
}

export const stateManager = new StateManager();
