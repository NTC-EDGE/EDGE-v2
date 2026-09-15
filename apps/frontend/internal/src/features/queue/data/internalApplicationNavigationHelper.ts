type QueueApplicationListener = (appId: string) => void;

let pendingQueueApplicationId: string | null = null;
const listeners = new Set<QueueApplicationListener>();

export function openQueueApplication(appId: string): void {
  pendingQueueApplicationId = appId;
  for (const listener of listeners) {
    listener(appId);
  }
}

export function consumePendingQueueApplication(): string | null {
  const id = pendingQueueApplicationId;
  pendingQueueApplicationId = null;
  return id;
}

export function subscribeToQueueApplication(listener: QueueApplicationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
