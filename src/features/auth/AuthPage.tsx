import { SignIn, SignUp } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import Eyecatch from "@/components/Eyecatch";

interface AuthPageProps {
  mode: "sign-in" | "sign-up";
}

/**
 * Sign-in and sign-up as full routes rather than modals.
 *
 * Every other surface in this app is one page per route — the URL *is* the
 * state (see the routing note in CLAUDE.md), and a modal would be the only
 * screen that isn't linkable or back/forward-safe. Routed Clerk components
 * also own their own multi-step flows (verification codes, factor two, the
 * "check your email" screen) as sub-paths, which is why the route table
 * mounts these under a `/*` splat.
 *
 * `?redirect_url=` carries where the user was headed, so the "sign in to see
 * this" states on `/favorites` and `/watched` return them there afterwards.
 */
export default function AuthPage({ mode }: AuthPageProps) {
  const { search } = useLocation();
  const redirectUrl = new URLSearchParams(search).get("redirect_url") ?? "/";

  return (
    <>
      <Eyecatch title={mode === "sign-in" ? "Sign in" : "Create account"} />

      <div className="auth-page">
        {mode === "sign-in" ? (
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl={redirectUrl}
          />
        ) : (
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl={redirectUrl}
          />
        )}
      </div>
    </>
  );
}
