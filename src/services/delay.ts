let errorRate = 0;

export function setErrorRate(rate: number): void {
  errorRate = Math.max(0, Math.min(1, rate));
}

export function getErrorRate(): number {
  return errorRate;
}

export function simulatedFetch<T>(
  fn: () => T,
  signal?: AbortSignal,
): Promise<T> {
  const delayMs = 50 + Math.random() * 50;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      if (Math.random() < errorRate) {
        reject(new Error('Simulated server error (500)'));
        return;
      }

      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, delayMs);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}
