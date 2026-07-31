import { ConfigProvider } from "antd";

/**
 * Ant Design v4 theming.
 *
 * v4 has no design-token API (that arrived in v5). What it does have, since
 * 4.17, is a CSS-variable build: importing `antd/dist/antd.variable.min.css`
 * and calling `ConfigProvider.config()` rewrites antd's own custom properties
 * at runtime. That is the supported v4 equivalent of a theme config, and it is
 * why the app imports the `.variable` stylesheet rather than `antd.css`.
 *
 * Anything v4 cannot express as a variable (surfaces, type, the dark ground)
 * lives in `src/styles/antd-overrides.css` as one deliberate layer, rather
 * than the per-component override files this project used to carry.
 */
export const VERMILION = "#e2431f";

export function configureAntdTheme(): void {
  ConfigProvider.config({
    theme: {
      primaryColor: VERMILION,
      errorColor: "#e2431f",
      warningColor: "#e8a33d",
      successColor: "#5ba85a",
      infoColor: VERMILION,
    },
  });
}
