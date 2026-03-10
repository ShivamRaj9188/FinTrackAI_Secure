// Smooth scroll utility functions

export const scrollToTop = (behavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: behavior
  });
};

export const scrollToElement = (elementId, offset = 80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

export const scrollToPosition = (position, behavior = 'smooth') => {
  window.scrollTo({
    top: position,
    left: 0,
    behavior: behavior
  });
};

// Smooth scroll to section by class name
export const scrollToSection = (sectionClass, offset = 80) => {
  const element = document.querySelector(`.${sectionClass}`);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Check if element is in viewport
export const isElementInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Smooth scroll with animation frame for better performance
export const smoothScrollTo = (targetY, duration = 1000) => {
  const startY = window.pageYOffset;
  const difference = targetY - startY;
  const startTime = performance.now();

  const step = (currentTime) => {
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Easing function for smooth animation
    const ease = progress < 0.5 
      ? 4 * progress * progress * progress 
      : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
    
    window.scrollTo(0, startY + difference * ease);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(step);
    }
  };
  
  requestAnimationFrame(step);
};
