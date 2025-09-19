import { useState } from "react";
import { loginWithGoogle, logout } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import EmailLogin from "./EmailLogin";
import EmailSignup from "./EmailSignup";

type AuthMode = "buttons" | "email-login" | "email-signup";

export default function AuthButtons() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("buttons");

  if (loading) return <p>로딩중...</p>;

  if (!user) {
    // 이메일 로그인 모드
    if (authMode === "email-login") {
      return (
        <div className="max-w-lg mx-auto p-5">
          <EmailLogin
            onSuccess={() => setAuthMode("buttons")}
            onSwitchToSignup={() => setAuthMode("email-signup")}
          />
          <div className="text-center mt-4">
            <button
              onClick={() => setAuthMode("buttons")}
              className="bg-none border-none text-gray-600 cursor-pointer text-sm"
            >
              ← 다른 로그인 방법
            </button>
          </div>
        </div>
      );
    }

    // 회원가입 모드
    if (authMode === "email-signup") {
      return (
        <div className="max-w-lg mx-auto p-5">
          <EmailSignup
            onSuccess={() => setAuthMode("buttons")}
            onSwitchToLogin={() => setAuthMode("email-login")}
          />
          <div className="text-center mt-4">
            <button
              onClick={() => setAuthMode("buttons")}
              className="bg-none border-none text-gray-600 cursor-pointer text-sm"
            >
              ← 다른 로그인 방법
            </button>
          </div>
        </div>
      );
    }

    // 기본 로그인 버튼들
    return (
      <div className="text-center max-w-md mx-auto">
        <h3 className="mb-6 text-xl font-semibold">🔐 로그인</h3>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => loginWithGoogle().catch((e) => alert(e.message))}
            className="p-3 bg-blue-600 text-white border-none rounded-lg text-base font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            🔍 Google로 로그인
          </button>

          <button
            onClick={() => setAuthMode("email-login")}
            className="p-3 bg-blue-700 text-white border-none rounded-lg text-base font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
          >
            📧 이메일로 로그인
          </button>

          <button
            onClick={() => setAuthMode("email-signup")}
            className="p-3 bg-green-600 text-white border-none rounded-lg text-base font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            ✨ 회원가입
          </button>
        </div>
      </div>
    );
  }

  // 로그인된 사용자 UI
  return (
    <div className="flex gap-3 items-center">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt="avatar"
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold">
          {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
        </div>
      )}
      <span className="text-gray-900 dark:text-white">
        {user.displayName ?? user.email}
      </span>
      <button
        onClick={() => logout().catch((e) => alert(e.message))}
        className="px-3 py-1.5 bg-red-600 text-white border-none rounded cursor-pointer hover:bg-red-700 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}
