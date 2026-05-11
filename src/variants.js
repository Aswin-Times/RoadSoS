export const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.3, ease: "easeOut" } 
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

export const cardItem = {
  hidden: { y: 12, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export const dropIn = {
  hidden: { y: -20, scale: 0.8, opacity: 0 },
  visible: { 
    y: 0, 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 25
    } 
  }
};

export const bottomSheetSpring = {
  hidden: { y: "100%" },
  visible: { 
    y: "0%",
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 30
    } 
  },
  exit: {
    y: "100%",
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};
