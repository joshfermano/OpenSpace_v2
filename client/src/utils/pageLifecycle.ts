export const initPageLifecycleEvents = () => {
  window.sessionStorage.setItem('initialPageLoadTime', String(Date.now()));
  let isTabSwitching = false;

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      isTabSwitching = true;
    } else if (document.visibilityState === 'visible') {
      isTabSwitching = false;

      // Store the time when tab became visible again (for timing-based features)
      window.sessionStorage.setItem('tabLastVisible', String(Date.now()));
    }
  };

  // Handle before unload to distinguish between actual page navigation and tab switching
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    // Only prompt if there's unsaved form data
    const hasUnsavedData = Object.keys(sessionStorage).some((key) =>
      key.startsWith('form_')
    );

    if (hasUnsavedData && !isTabSwitching) {
      // Standard way to show a confirmation dialog before leaving
      const message =
        'You have unsaved changes. Are you sure you want to leave?';
      event.preventDefault();
      event.returnValue = message;
      return message;
    }
  };

  // Register event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return a cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};
