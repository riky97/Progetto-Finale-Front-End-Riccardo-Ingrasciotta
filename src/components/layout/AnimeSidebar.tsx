import { Layout, Menu } from "antd";
import { EyeOutlined, HomeFilled, SearchOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { sectionKeyForPath } from "@/shared/useSection";

const { Sider } = Layout;

const NAV = [
  { key: "home", to: "/", label: "Home", icon: <HomeFilled /> },
  { key: "genre", to: "/genre", label: "Genre", icon: <EyeOutlined /> },
  { key: "search", to: "/search", label: "Search", icon: <SearchOutlined /> },
];

interface AnimeSidebarProps {
  isMobile: boolean;
}

/**
 * Desktop: a fixed left rail. Mobile: a bottom bar of icons.
 * The selected key comes from the router, not `localStorage.getItem("path")`,
 * so it stays correct through back/forward navigation.
 */
export default function AnimeSidebar({ isMobile }: AnimeSidebarProps) {
  const { pathname } = useLocation();
  const active = sectionKeyForPath(pathname);

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
        items={NAV.map((item) => ({
          key: item.key,
          label: (
            <Link to={item.to} aria-label={item.label}>
              {isMobile ? item.icon : item.label}
            </Link>
          ),
        }))}
      />

      {!isMobile ? (
        <span className="sidebar__kana" aria-hidden="true">
          アニメリスト
        </span>
      ) : null}
    </Sider>
  );
}
