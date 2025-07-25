import { useAuth } from "../hooks/useAuth";

export const LoginScreen = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-accent-100 dark:from-gray-900 dark:via-brand-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            북마클
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            북마크를 체계적으로 관리하세요
          </p>
        </div>

        <div className="card p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              로그인
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Google 계정으로 로그인하여 시작하세요
            </p>
          </div>

          <button
            onClick={login}
            className="w-full btn-primary flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google로 로그인</span>
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              로그인하면 북마크를 저장하고 관리할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
