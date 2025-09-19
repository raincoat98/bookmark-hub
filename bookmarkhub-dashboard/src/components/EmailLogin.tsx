import { useState } from "react";
import { loginWithEmail, resetPassword } from "../firebase";

interface EmailLoginProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export default function EmailLogin({
  onSuccess,
  onSwitchToSignup,
}: EmailLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginWithEmail(email, password);
      onSuccess?.();
    } catch (err: unknown) {
      console.error("로그인 실패:", err);
      setError(getErrorMessage((err as any).code));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("비밀번호 재설정을 위해 이메일을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      console.error("비밀번호 재설정 실패:", err);
      setError(getErrorMessage((err as any).code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/user-not-found":
        return "등록되지 않은 이메일입니다.";
      case "auth/wrong-password":
        return "잘못된 비밀번호입니다.";
      case "auth/invalid-email":
        return "유효하지 않은 이메일 형식입니다.";
      case "auth/user-disabled":
        return "비활성화된 계정입니다.";
      case "auth/too-many-requests":
        return "너무 많은 시도로 인해 일시적으로 차단되었습니다.";
      default:
        return "로그인 중 오류가 발생했습니다.";
    }
  };

  if (resetSent) {
    return (
      <div className="text-center p-5">
        <h3 className="text-lg font-semibold mb-4">
          📧 비밀번호 재설정 이메일 전송됨
        </h3>
        <p className="mb-2">
          <strong>{email}</strong>으로 비밀번호 재설정 링크를 전송했습니다.
        </p>
        <p className="text-sm text-gray-600 mb-4">
          이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.
        </p>
        <button
          onClick={() => setResetSent(false)}
          className="px-4 py-2 bg-blue-700 text-white border-none rounded cursor-pointer mt-4"
        >
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h3 className="text-center mb-6 text-lg font-semibold">
        📧 이메일 로그인
      </h3>

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="email" className="block mb-2 font-medium">
          이메일
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full p-3 border border-gray-300 rounded text-base box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="example@email.com"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block mb-2 font-medium">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="w-full p-3 border border-gray-300 rounded text-base box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="비밀번호를 입력하세요"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim() || !password.trim()}
        className="w-full p-3 bg-blue-700 text-white border-none rounded text-base font-medium cursor-pointer mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={loading}
          className="bg-none border-none text-blue-700 cursor-pointer underline mr-4"
        >
          비밀번호 찾기
        </button>

        {onSwitchToSignup && (
          <button
            type="button"
            onClick={onSwitchToSignup}
            disabled={loading}
            className="bg-none border-none text-blue-700 cursor-pointer underline"
          >
            회원가입
          </button>
        )}
      </div>
    </form>
  );
}
