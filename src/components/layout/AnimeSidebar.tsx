import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { Layout, Menu } from "antd";
import {
  CheckSquareOutlined,
  EyeOutlined,
  HeartFilled,
  HomeFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { sectionKeyForPath } from "@/shared/useSection";

const { Sider } = Layout;

const NAV = [
  { key: "home", to: "/", label: "Home", icon: <HomeFilled /> },
  { key: "genre", to: "/genre", label: "Genre", icon: <EyeOutlined /> },
  { key: "search", to: "/search", label: "Search", icon: <SearchOutlined /> },
];

/** Only meaningful with a session behind them, so they're gated on one. */
const LIBRARY_NAV = [
  {
    key: "favorites",
    to: "/favorites",
    label: "Favourites",
    icon: <HeartFilled />,
  },
  {
    key: "watched",
    to: "/watched",
    label: "Watched",
    icon: <CheckSquareOutlined />,
  },
];

interface AnimeSidebarProps {
  isMobile: boolean;
}

/**
 * Desktop: a fixed left rail. Mobile: a bottom bar of icons.
 * The selected key comes from the router, not `localStorage.getItem("path")`,
 * so it stays correct through back/forward navigation.
 *
 * The library links are appended to the same `<Menu>` rather than wrapped in
 * `<SignedIn>` — antd's Menu wants one flat `items` array (the mobile rail
 * lays it out as a single row of equal-width cells), so the gate here reads
 * the session with `useAuth` instead. `<SignedIn>/<SignedOut>` still drive the
 * auth block below, where they can wrap markup freely.
 */
export default function AnimeSidebar({ isMobile }: AnimeSidebarProps) {
  const { pathname } = useLocation();
  const { isSignedIn } = useAuth();
  const active = sectionKeyForPath(pathname);

  const items = (isSignedIn ? [...NAV, ...LIBRARY_NAV] : NAV).map((item) => ({
    key: item.key,
    label: (
      <Link to={item.to} aria-label={item.label}>
        {isMobile ? item.icon : item.label}
      </Link>
    ),
  }));

  return (
    <Sider
      className={isMobile ? "rail" : "sidebar"}
      width={isMobile ? undefined : 208}
      theme="dark"
    >
      {!isMobile ? (
        <Link className="sidebar__logo" to="/">
          ANIME
          <em>LIST</em>
        </Link>
      ) : null}

      <Menu
        mode={isMobile ? "horizontal" : "inline"}
        selectedKeys={[active]}
        items={items}
        // The rail lays its items out with `flex: 1` in CSS, so antd's
        // rc-overflow measuring has nothing useful to measure — left on, it
        // collapses the whole bar into a "···" the moment the auth cell takes
        // width beside it.
        disabledOverflow={isMobile}
      />

      {/* Kana before the auth block, so the rail reads nav → atmosphere →
          account rather than having the slab land on top of the kana. */}
      {!isMobile ? (
        <span className="sidebar__kana" aria-hidden="true">
          アニメリスト
        </span>
      ) : null}

      <div className="sidebar__auth">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link className="sidebar__signin" to="/sign-in">
            <span>Sign in</span>
          </Link>
        </SignedOut>
      </div>
    </Sider>
  );
}
