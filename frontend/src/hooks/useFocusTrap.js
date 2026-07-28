import { useEffect } from "react";

const selector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export const useFocusTrap = (ref, active, { initialFocusRef, restoreFocus = true } = {}) => {
  useEffect(() => {
    if (!active) return undefined;
    const previous = document.activeElement;
    const container = ref.current;
    const focusables = () => Array.from(container?.querySelectorAll(selector) || []).filter((node) => !node.hasAttribute("hidden"));
    const target = initialFocusRef?.current || focusables()[0] || container;
    window.requestAnimationFrame(() => target?.focus?.());
    const onKeyDown = (event) => {
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (!nodes.length) {
        event.preventDefault();
        container?.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    container?.addEventListener("keydown", onKeyDown);
    return () => {
      container?.removeEventListener("keydown", onKeyDown);
      if (restoreFocus && previous?.focus) window.requestAnimationFrame(() => previous.focus());
    };
  }, [active, initialFocusRef, ref, restoreFocus]);
};
