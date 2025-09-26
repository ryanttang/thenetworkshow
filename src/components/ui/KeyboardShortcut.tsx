"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function KeyboardShortcut() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const sessionRef = useRef({ session, status });
  const routerRef = useRef(router);

  // Keep refs updated
  useEffect(() => {
    sessionRef.current = { session, status };
    routerRef.current = router;
  }, [session, status, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if backtick key is pressed (key code 192 or key === '`')
      if (event.key === '`' || event.keyCode === 192) {
        // Prevent default behavior
        event.preventDefault();
        
        // Get current session status at the time of key press
        const { session: currentSession, status: currentStatus } = sessionRef.current;
        const currentRouter = routerRef.current;
        
        // Only navigate if user is authenticated
        if (currentStatus === "authenticated" && currentSession?.user) {
          currentRouter.push("/dashboard");
        } else {
          // If not authenticated, redirect to sign in
          currentRouter.push("/signin");
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array - only run once

  // This component doesn't render anything
  return null;
}
