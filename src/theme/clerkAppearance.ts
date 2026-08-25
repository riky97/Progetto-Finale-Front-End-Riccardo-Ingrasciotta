import type { Appearance } from "@clerk/types";
import { VERMILION } from "./antdTheme";

/**
 * Clerk's components ship a rounded, light, Inter-flavoured look that would
 * read as a bolted-on SaaS widget against the eyecatch design. Clerk exposes
 * two escape hatches: `variables` (its own design tokens) and `elements`
 * (per-part class/style overrides). Both are used here so the sign-in card,
 * the user menu and the avatar button all sit on the same ink ground with the
 * same vermilion accent as everything else.
 *
 * Values are the tokens from `src/styles/tokens.css`, hard-coded because
 * Clerk's `variables` are passed to its own runtime and never see the page's
 * CSS custom properties. Keep them in sync with that file — it is the source
 * of truth.
 */

const INK = "#0b0b0c";
const INK_RAISE = "#141417";
const INK_LINE = "#26262b";
const PAPER = "#ede6d8";
const SUMI = "#8b857a";

const FONT_BODY = '"Body", system-ui, sans-serif';
const FONT_UTILITY = '"Utility", ui-monospace, monospace';
const FONT_DISPLAY = '"Display", "Helvetica Neue", sans-serif';

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: VERMILION,
    colorBackground: INK_RAISE,
    colorText: PAPER,
    colorTextSecondary: SUMI,
    colorTextOnPrimaryBackground: INK,
    colorInputBackground: INK,
    colorInputText: PAPER,
    colorDanger: VERMILION,
    colorSuccess: "#5ba85a",
    colorWarning: "#e8a33d",
    fontFamily: FONT_BODY,
    fontFamilyButtons: FONT_UTILITY,
    // The app has no rounded corners anywhere; neither should Clerk.
    borderRadius: "0",
  },
  elements: {
    // The auth card is the same raised ink panel as the sidebar, hairlined
    // rather than shadowed — the design uses offset slabs, not drop shadows.
    card: {
      backgroundColor: INK_RAISE,
      border: `1px solid ${INK_LINE}`,
      boxShadow: "none",
    },
    headerTitle: {
      fontFamily: FONT_DISPLAY,
      textTransform: "uppercase",
      letterSpacing: "-0.01em",
    },
    headerSubtitle: { color: SUMI },
    // Primary action reads as the vermilion slab: ink type, flat, uppercase.
    formButtonPrimary: {
      backgroundColor: VERMILION,
      color: INK,
      fontFamily: FONT_UTILITY,
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      boxShadow: "none",
      "&:hover": { backgroundColor: "#8f2410", color: PAPER },
      "&:focus": { boxShadow: `0 0 0 2px ${INK}, 0 0 0 4px ${VERMILION}` },
    },
    socialButtonsBlockButton: {
      borderColor: INK_LINE,
      color: PAPER,
      "&:hover": { borderColor: VERMILION, color: VERMILION },
    },
    formFieldInput: {
      backgroundColor: INK,
      borderColor: INK_LINE,
      color: PAPER,
    },
    formFieldLabel: {
      fontFamily: FONT_UTILITY,
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      fontSize: "0.78rem",
      color: SUMI,
    },
    dividerLine: { backgroundColor: INK_LINE },
    dividerText: { color: SUMI },
    footerActionLink: {
      color: VERMILION,
      "&:hover": { color: VERMILION, textDecoration: "underline" },
    },
    identityPreviewEditButton: { color: VERMILION },
    // The avatar in the sidebar: a hard square with a vermilion hairline, so
    // it matches the sheared-slab language instead of floating as a circle.
    userButtonAvatarBox: {
      width: "30px",
      height: "30px",
      borderRadius: "0",
      border: `1px solid ${VERMILION}`,
    },
    userButtonAvatarImage: { borderRadius: "0" },
    userButtonPopoverCard: {
      backgroundColor: INK_RAISE,
      border: `1px solid ${INK_LINE}`,
      boxShadow: "none",
    },
    userButtonPopoverActionButton: {
      color: PAPER,
      fontFamily: FONT_UTILITY,
      textTransform: "uppercase",
      letterSpacing: "0.14em",
      fontSize: "0.78rem",
      "&:hover": { backgroundColor: "rgba(226, 67, 31, 0.12)", color: VERMILION },
    },
    userButtonPopoverActionButtonIcon: { color: SUMI },
    userButtonPopoverFooter: { display: "none" },
    userPreviewMainIdentifier: { color: PAPER, fontFamily: FONT_DISPLAY },
    userPreviewSecondaryIdentifier: { color: SUMI },
  },
};
