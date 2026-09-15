type AppDetailListener = (appId: string) => void;

let pendingAppDetailId: string | null = null;
const listeners = new Set<AppDetailListener>();

export function openApplicationDetail(appId: string): void {
  pendingAppDetailId = appId;
  for (const listener of listeners) {
    listener(appId);
  }
}

export function consumePendingApplicationDetail(): string | null {
  const id = pendingAppDetailId;
  pendingAppDetailId = null;
  return id;
}

export function subscribeToApplicationDetail(listener: AppDetailListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
