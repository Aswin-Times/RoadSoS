// Global Motion System Variants (Framer Motion)
export const pageTransition = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

export const cardEntrance = {
  hidden: { y: 12, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1, 
    transition: { ease: "easeOut", duration: 0.3 } 
  }
};

export const cardItem = cardEntrance;

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

export const bottomSheetSpring = {
  hidden: { y: '100%' },
  show: { 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 30 } 
  },
  exit: { 
    y: '100%', 
    transition: { ease: "easeInOut", duration: 0.2 } 
  }
};
