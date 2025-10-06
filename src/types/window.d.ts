// Ambient types for cilantro-site BaseHeader interactions

// Ambient Window augmentation for BaseHeader interactions
declare global {
  interface Window {
    smoothScroll: (href: string) => void;
    openMobile: () => void;
    closeMobile: () => void;
    toggleMobile: () => void;
  }
}

export {};