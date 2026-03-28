import { useEffect, useSyncExternalStore } from "react";

function createEmptyEntry() {
  return {
    data: null,
    loading: false,
    error: "",
    loaded: false
  };
}

export function createResolverStore(fetcher, getKey = (...args) => JSON.stringify(args)) {
  const entries = new Map();
  const inflight = new Map();
  const listeners = new Set();

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function readEntry(key) {
    return entries.get(key) || createEmptyEntry();
  }

  async function load(args, { force = false } = {}) {
    const key = getKey(...args);
    const current = readEntry(key);

    if (!force && current.loaded) {
      return current.data;
    }

    if (!force && inflight.has(key)) {
      return inflight.get(key);
    }

    entries.set(key, {
      data: current.data,
      loading: true,
      error: "",
      loaded: current.loaded
    });
    emit();

    const pending = fetcher(...args)
      .then((data) => {
        entries.set(key, {
          data,
          loading: false,
          error: "",
          loaded: true
        });
        emit();
        return data;
      })
      .catch((err) => {
        entries.set(key, {
          data: current.data,
          loading: false,
          error: err?.message || "Impossible de charger les données.",
          loaded: current.loaded
        });
        emit();
        throw err;
      })
      .finally(() => {
        inflight.delete(key);
      });

    inflight.set(key, pending);
    return pending;
  }

  function invalidate(args) {
    const key = getKey(...args);
    entries.delete(key);
    emit();
  }

  function useResolver(...args) {
    const key = getKey(...args);
    const entry = useSyncExternalStore(subscribe, () => readEntry(key), () => readEntry(key));

    useEffect(() => {
      if (!entry.loaded && !entry.loading) {
        load(args).catch(() => {});
      }
    }, [args, entry.loaded, entry.loading]);

    return {
      ...entry,
      reload: (options) => load(args, { force: true, ...(options || {}) }),
      ensureLoaded: (options) => load(args, options),
      invalidate: () => invalidate(args)
    };
  }

  return {
    useResolver,
    load,
    invalidate,
    readEntry: (...args) => readEntry(getKey(...args))
  };
}
