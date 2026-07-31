import "@testing-library/jest-dom";

// `OnAirHero` reads matchMedia to honour prefers-reduced-motion, and Radix
// reads it too; jsdom does not implement it.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0)) as unknown as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame = ((id: number) =>
    clearTimeout(id)) as unknown as typeof window.cancelAnimationFrame;
}
