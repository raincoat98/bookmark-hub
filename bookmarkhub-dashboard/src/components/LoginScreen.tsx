import { useState } from "react";
import { loginWithGoogle, loginWithEmail, signupWithEmail } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import ExtensionBridge from "./ExtensionBridge";

export const LoginScreen = () => {
  const { loading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // 폼 데이터
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleLogin = async () => {
    try {
      setFormLoading(true);
      await loginWithGoogle();
    } catch (error: unknown) {
      if ((error as any).code === "auth/popup-closed-by-user") {
        toast.error("로그인이 취소되었습니다.");
      } else if ((error as any).code === "auth/popup-blocked") {
        toast.error("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
      } else if ((error as any).code === "auth/cancelled-popup-request") {
        toast.error("로그인 요청이 취소되었습니다.");
      } else {
        console.error("Google login error:", error);
        toast.error("Google 로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      // 가입 로직
      if (formData.password !== formData.confirmPassword) {
        toast.error("비밀번호가 일치하지 않습니다.");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("비밀번호는 최소 6자 이상이어야 합니다.");
        return;
      }

      try {
        setFormLoading(true);
        await signupWithEmail(
          formData.email,
          formData.password,
          formData.displayName
        );
        toast.success("가입이 완료되었습니다!");
      } catch (error: unknown) {
        if ((error as any).code === "auth/email-already-in-use") {
          toast.error("이미 가입된 이메일입니다. 로그인해주세요.");
          // 로그인 모드로 전환
          setIsSignup(false);
          // 비밀번호만 초기화
          setFormData((prev) => ({
            ...prev,
            password: "",
            confirmPassword: "",
          }));
        } else if ((error as any).code === "auth/weak-password") {
          toast.error("비밀번호는 최소 6자 이상이어야 합니다.");
        } else if ((error as any).code === "auth/invalid-email") {
          toast.error("올바른 이메일 형식이 아닙니다.");
        } else if ((error as any).code === "auth/operation-not-allowed") {
          toast.error("이메일/비밀번호 가입이 비활성화되어 있습니다.");
        } else {
          console.error("Signup error:", error);
          toast.error("가입 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
      } finally {
        setFormLoading(false);
      }
    } else {
      // 로그인 로직
      try {
        setFormLoading(true);
        await loginWithEmail(formData.email, formData.password);
      } catch (error: unknown) {
        if ((error as any).code === "auth/user-not-found") {
          toast.error("등록되지 않은 이메일입니다. 가입해주세요.");
          // 가입 모드로 전환
          setIsSignup(true);
        } else if ((error as any).code === "auth/wrong-password") {
          toast.error("비밀번호가 올바르지 않습니다.");
          // 비밀번호만 초기화
          setFormData((prev) => ({
            ...prev,
            password: "",
          }));
        } else if ((error as any).code === "auth/invalid-email") {
          toast.error("올바른 이메일 형식이 아닙니다.");
        } else if ((error as any).code === "auth/too-many-requests") {
          toast.error(
            "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요."
          );
        } else if ((error as any).code === "auth/user-disabled") {
          toast.error("비활성화된 계정입니다.");
        } else {
          console.error("Login error:", error);
          toast.error("로그인에 실패했습니다. 다시 시도해주세요.");
        }
      } finally {
        setFormLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ExtensionBridge />
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-brand-100 to-accent-100 dark:from-gray-900 dark:via-brand-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="card p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {isSignup ? "가입하기" : "로그인"}
              </h2>
            </div>

            {/* 이메일/비밀번호 폼 */}
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              {isSignup && (
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    사용자명
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    required={isSignup}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="사용자명을 입력하세요"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              {isSignup && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={isSignup}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="w-full btn-primary flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span>{isSignup ? "가입하기" : "로그인"}</span>
                )}
              </button>
            </form>

            {/* 구분선 */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                  또는
                </span>
              </div>
            </div>

            {/* Google 로그인 버튼 */}
            <button
              onClick={handleGoogleLogin}
              disabled={formLoading}
              className="w-full btn-primary flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google로 {isSignup ? "가입" : "로그인"}</span>
            </button>

            {/* 모드 전환 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isSignup ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}
                <button
                  onClick={toggleMode}
                  className="ml-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                >
                  {isSignup ? "로그인" : "가입하기"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
