import { useAuth } from "../hooks/useAuth";
import { logout } from "../firebase";
import { Link } from "react-router-dom";
import { Menu, Sun, Moon, Settings, User, LogOut, Globe } from "lucide-react";
import { useDrawer } from "../contexts/DrawerContext";
import { useTheme } from "../contexts/ThemeContext";

interface HeaderProps {
  showMenuButton?: boolean;
}

export const Header = ({ showMenuButton = false }: HeaderProps) => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { setIsDrawerOpen } = useDrawer();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("auto");
    } else {
      setTheme("light");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 왼쪽: 로고 및 메뉴 버튼 */}
          <div className="flex items-center space-x-4">
            {showMenuButton && (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-accent-500 rounded-xl flex items-center justify-center shadow-soft">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold gradient-text">북마클</h1>
            </Link>
          </div>

          {/* 오른쪽: 사용자 메뉴 및 테마 토글 */}
          <div className="flex items-center space-x-2">
            {/* 테마 토글 */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm"
              aria-label="테마 변경"
              title={`현재: ${
                theme === "light"
                  ? "라이트"
                  : theme === "dark"
                  ? "다크"
                  : "자동"
              } 모드`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : theme === "dark" ? (
                <Globe className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* 사용자 메뉴 */}
            {user && (
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all duration-200 hover:scale-110 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm">
                  <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full flex items-center justify-center shadow-soft">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.email}
                  </span>
                </button>
              </div>
            )}

            {/* 설정 링크 */}
            <Link
              to="/settings"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm"
              aria-label="설정"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* 로그아웃 버튼 */}
            {user && (
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl transition-all duration-200 hover:scale-110 hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm"
                aria-label="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
