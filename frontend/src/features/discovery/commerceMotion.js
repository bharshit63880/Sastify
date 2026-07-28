export const CART_TARGET_SELECTOR = "[data-cart-target]";

export const runFlyingCart = ({
  sourceElement,
  imageUrl,
  reducedMotion = false,
  documentRef = typeof document !== "undefined" ? document : null,
}) => {
  if (reducedMotion || !documentRef || !sourceElement || !imageUrl) return Promise.resolve(false);
  const target = documentRef.querySelector(CART_TARGET_SELECTOR);
  if (!target || typeof sourceElement.getBoundingClientRect !== "function") return Promise.resolve(false);
  const sourceRect = sourceElement.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (!sourceRect.width || !targetRect.width) return Promise.resolve(false);

  const clone = documentRef.createElement("img");
  clone.src = imageUrl;
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    position: "fixed",
    zIndex: "650",
    left: `${sourceRect.left}px`,
    top: `${sourceRect.top}px`,
    width: `${Math.min(sourceRect.width, 96)}px`,
    height: `${Math.min(sourceRect.height, 112)}px`,
    objectFit: "cover",
    borderRadius: "18px",
    pointerEvents: "none",
    boxShadow: "0 18px 45px rgba(7, 11, 28, .28)",
  });
  documentRef.body.appendChild(clone);

  const dx = targetRect.left + targetRect.width / 2 - sourceRect.left - Math.min(sourceRect.width, 96) / 2;
  const dy = targetRect.top + targetRect.height / 2 - sourceRect.top - Math.min(sourceRect.height, 112) / 2;
  if (typeof clone.animate !== "function") {
    clone.remove();
    return Promise.resolve(false);
  }

  const animation = clone.animate(
    [
      { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
      { transform: `translate3d(${dx * .48}px,${dy * .25 - 80}px,0) scale(.72)`, opacity: .92, offset: .55 },
      { transform: `translate3d(${dx}px,${dy}px,0) scale(.16)`, opacity: 0 },
    ],
    { duration: 680, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
  );

  return animation.finished
    .then(() => true)
    .catch(() => false)
    .finally(() => clone.remove());
};
