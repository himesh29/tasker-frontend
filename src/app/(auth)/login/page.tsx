"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: {
              credential?: string;
            }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;

          prompt: (
            momentListener?: (notification: {
              isNotDisplayed?: () => boolean;
              isSkippedMoment?: () => boolean;
              isDismissedMoment?: () => boolean;
              getNotDisplayedReason?: () => string;
              getSkippedReason?: () => string;
              getDismissedReason?: () => string;
            }) => void
          ) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { loginGoogle, loginGuest } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleInitialized = useRef(false);

  /**
   * Complete login after Google gives us an ID token.
   */
  const completeGoogleLogin = useCallback(
    async (idToken: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await loginGoogle(idToken);
        router.push("/tasks");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Google login failed."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [loginGoogle, router]
  );

  /**
   * Initialize Google Identity Services exactly once.
   */
  const initializeGoogle = useCallback(() => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError(
        "Google login isn't configured. NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing."
      );
      return;
    }

    if (googleInitialized.current) {
      return;
    }

    if (!window.google?.accounts?.id) {
      return;
    }

    googleInitialized.current = true;

    window.google.accounts.id.initialize({
      client_id: clientId,

      /**
       * Google returns the ID token here.
       */
      callback: (response) => {
        if (!response.credential) {
          setIsLoading(false);
          setError(
            "Google did not return a credential. Please try again."
          );
          return;
        }

        void completeGoogleLogin(response.credential);
      },

      auto_select: false,

      cancel_on_tap_outside: false,

      /**
       * Allow current Google/FedCM behavior.
       */
      use_fedcm_for_prompt: true,
    });

    setGoogleReady(true);
  }, [completeGoogleLogin]);

  /**
   * Load Google Identity Services once.
   */
  useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError(
        "Google login isn't configured. NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing."
      );
      return;
    }

    /**
     * GIS is already available.
     */
    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    /**
     * Check if another component already added the script.
     */
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      const handleLoad = () => {
        initializeGoogle();
      };

      existingScript.addEventListener("load", handleLoad);

      return () => {
        existingScript.removeEventListener(
          "load",
          handleLoad
        );
      };
    }

    /**
     * Add Google GIS script.
     */
    const script = document.createElement("script");

    script.src =
      "https://accounts.google.com/gsi/client";

    script.async = true;
    script.defer = true;

    script.onload = () => {
      initializeGoogle();
    };

    script.onerror = () => {
      setError(
        "Google Sign-In could not be loaded. Please check your internet connection and try again."
      );
    };

    document.head.appendChild(script);
  }, [initializeGoogle]);

  /**
   * Guest login.
   */
  async function handleGuest() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await loginGuest();
      router.push("/tasks");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Guest login failed."
      );
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Custom Google button.
   *
   * IMPORTANT:
   * We do NOT initialize Google here.
   *
   * Google was initialized once in useEffect().
   */
  function handleGoogle() {
    if (isLoading) {
      return;
    }

    setError(null);

    if (!googleReady) {
      setError(
        "Google Sign-In hasn't loaded yet. Please try again in a moment."
      );
      return;
    }

    if (!window.google?.accounts?.id) {
      setError(
        "Google Sign-In is unavailable. Please refresh the page and try again."
      );
      return;
    }

    setIsLoading(true);

    /**
     * Start Google authentication.
     *
     * We intentionally do NOT call initialize() here.
     */
    window.google.accounts.id.prompt((notification) => {
      /**
       * These are informational states.
       *
       * Do not display the old:
       *
       * "Google sign-in was dismissed or blocked..."
       *
       * message here.
       */
      if (
        notification.isNotDisplayed?.() ||
        notification.isSkippedMoment?.() ||
        notification.isDismissedMoment?.()
      ) {
        setIsLoading(false);
      }
    });
  }

  return (
    <div className="min-h-screen w-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              width="40"
              height="40"
              rx="8"
              fill="#000000"
            />

            <path
              d="M20 10L11 26L20 30L29 26L20 10Z"
              stroke="#FFFFFF"
              strokeWidth="2.3"
              strokeLinejoin="round"
            />

            <path
              d="M20 10V30"
              stroke="#FFFFFF"
              strokeWidth="2.3"
              strokeLinecap="round"
            />
          </svg>

          <span className="text-[15px] font-bold text-neutral-900">
            Pyramid
          </span>
        </div>

        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-7 w-full shadow-sm">

          <h1 className="text-[18px] font-bold text-center text-neutral-900 mb-1">
            Let&apos;s get back on track
          </h1>

          <p className="text-[13px] text-center text-neutral-500 mb-5">
            Enter your email below to login to your account.
          </p>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-2 rounded-md bg-red-50 p-2 text-[11px] text-red-600"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">

            {/* Guest */}
            <button
              type="button"
              onClick={handleGuest}
              disabled={isLoading}
              className="flex items-center justify-center w-full h-10 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {isLoading
                ? "Loading..."
                : "Continue as Guest"}
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isLoading}
              className="flex items-center justify-center w-full h-10 bg-white border border-neutral-300 text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-50 transition-colors relative disabled:opacity-50"
            >
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#111"
                />

                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#111"
                />

                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#111"
                />

                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#111"
                />
              </svg>

              {isLoading
                ? "Loading..."
                : "Login with Google"}
            </button>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-4 text-[11px] text-neutral-400 text-center leading-relaxed">
          By clicking continue, you agree to
          <br />

          our{" "}
          <Link
            href="/terms"
            className="text-neutral-500 underline hover:text-neutral-700"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-neutral-500 underline hover:text-neutral-700"
          >
            Privacy
          </Link>

          <br />

          <Link
            href="/privacy"
            className="text-neutral-500 underline hover:text-neutral-700"
          >
            Policy
          </Link>
        </p>

      </div>
    </div>
  );
}
