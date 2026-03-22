import { useEffect, useState, useRef } from "react";

/**
 * Hook to detect cheating (tab switch or blur)
 * Calls onCheat callback once when violations exceed limit
 */
const useAntiCheat = (onCheat, limit = 3) => {
  const [violations, setViolations] = useState(0);
  const triggeredRef = useRef(false); 
  const isAwayRef = useRef(false); // Tracks if the user is currently "out of bounds"

  useEffect(() => {
    const incrementViolation = () => {
      // Only increment if we haven't already logged this specific exit session
      if (!isAwayRef.current) {
        isAwayRef.current = true;
        setViolations((prev) => prev + 1);
      }
    };

    const resetAwayStatus = () => {
      // User is back, allow the next violation to be counted
      isAwayRef.current = false;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        incrementViolation();
      } else {
        resetAwayStatus();
      }
    };

    const handleBlur = () => {
      incrementViolation();
    };

    const handleFocus = () => {
      resetAwayStatus();
    };

    // Listeners for leaving
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    
    // Listeners for returning (to reset the gate)
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    if (violations >= limit && !triggeredRef.current) {
      triggeredRef.current = true;

      // Small delay to ensure state updates and avoids race conditions
      setTimeout(async () => {
        alert(
          "⚠️ SECURITY BREACH: Multiple tab switches detected. Your exam is being submitted automatically."
        );
        
        if (typeof onCheat === "function") {
          try {
            await onCheat(); 
          } catch (err) {
            console.error("Auto-submit failed:", err);
            alert("Critical Error: Manual submission required. Please contact the proctor.");
          }
        }
      }, 100);
    }
  }, [violations, limit, onCheat]);

  return violations;
};

export default useAntiCheat;