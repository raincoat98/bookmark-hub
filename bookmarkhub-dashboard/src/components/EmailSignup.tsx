import { useState } from "react";
import { signupWithEmail } from "../firebase";

interface EmailSignupProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function EmailSignup({
  onSuccess,
  onSwitchToLogin,
}: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = (): string | null => {
    if (!email.trim()) return "이메일을 입력해주세요.";
    if (!password.trim()) return "비밀번호를 입력해주세요.";
    if (password.length < 6) return "비밀번호는 최소 6자 이상이어야 합니다.";
    if (password !== confirmPassword) return "비밀번호가 일치하지 않습니다.";
    if (!displayName.trim()) return "이름을 입력해주세요.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signupWithEmail(email, password, displayName);
      onSuccess?.();
    } catch (err: unknown) {
      console.error("회원가입 실패:", err);
      setError(getErrorMessage((err as any).code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/email-already-in-use":
        return "이미 사용 중인 이메일입니다.";
      case "auth/invalid-email":
        return "유효하지 않은 이메일 형식입니다.";
      case "auth/operation-not-allowed":
        return "이메일/비밀번호 회원가입이 비활성화되어 있습니다.";
      case "auth/weak-password":
        return "비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용하세요.";
      default:
        return "회원가입 중 오류가 발생했습니다.";
    }
  };

  const getPasswordStrength = (
    password: string
  ): { strength: string; color: string } => {
    if (password.length === 0) return { strength: "", color: "" };
    if (password.length < 6) return { strength: "약함", color: "#f44336" };
    if (password.length < 8) return { strength: "보통", color: "#ff9800" };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: "보통", color: "#ff9800" };
    }
    return { strength: "강함", color: "#4caf50" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <h3 className="text-center mb-6 text-lg font-semibold">✨ 회원가입</h3>

      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="displayName" className="block mb-2 font-medium">
          이름
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          disabled={loading}
          className="w-full p-3 border border-gray-300 rounded text-base box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="홍길동"
        />
      </div>

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
          placeholder="최소 6자 이상"
        />
        {password && (
          <div
            className="text-xs mt-1"
            style={{ color: passwordStrength.color }}
          >
            비밀번호 강도: {passwordStrength.strength}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block mb-2 font-medium">
          비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          className={`w-full p-3 border rounded text-base box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            confirmPassword && password !== confirmPassword
              ? "border-red-500"
              : "border-gray-300"
          }`}
          placeholder="비밀번호를 다시 입력하세요"
        />
        {confirmPassword && password !== confirmPassword && (
          <div className="text-xs mt-1 text-red-500">
            비밀번호가 일치하지 않습니다
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={
          loading || !email.trim() || !password.trim() || !displayName.trim()
        }
        className="w-full p-3 bg-green-600 text-white border-none rounded text-base font-medium cursor-pointer mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "회원가입 중..." : "회원가입"}
      </button>

      <div className="text-center text-sm">
        이미 계정이 있으신가요?{" "}
        {onSwitchToLogin && (
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={loading}
            className="bg-none border-none text-blue-700 cursor-pointer underline"
          >
            로그인
          </button>
        )}
      </div>
    </form>
  );
}
