const emphasizedEase = [0.22, 1, 0.36, 1];
const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 };

export const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: emphasizedEase } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: emphasizedEase } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

export const softFade = {
  hidden: { opacity: 0, scale: 0.985, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.34, ease: emphasizedEase } },
  exit: { opacity: 0, scale: 0.99, transition: { duration: 0.18 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: spring },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.18 } },
};

export const slideIn = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.36, ease: emphasizedEase } },
  exit: { opacity: 0, x: 16, transition: { duration: 0.2 } },
};

export const drawerMotion = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { duration: 0.34, ease: emphasizedEase } },
  exit: { x: "100%", transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } },
};

export const modalMotion = scaleIn;

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
};

export const staggerItem = fadeUp;
export const buttonPress = { scale: 0.975 };
export const heartPop = { scale: [1, 1.34, 0.92, 1], transition: { duration: 0.46, ease: emphasizedEase } };
export const counterBounce = { y: [0, -5, 2, 0], scale: [1, 1.12, 1], transition: { duration: 0.42 } };
export const skeletonFade = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } };
export const pageTransition = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: emphasizedEase } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

export const viewportOnce = { once: true, amount: 0.16 };

export const cardHover = {
  rest: { y: 0 },
  hover: { y: -6, transition: { duration: 0.24, ease: emphasizedEase } },
};

export const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};
