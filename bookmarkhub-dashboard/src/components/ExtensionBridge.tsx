import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../firebase";

interface ExtensionBridgeProps {
  extensionId?: string;
}

// Chrome Extension API 타입 선언
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: any,
          callback?: (response: any) => void
        ) => void;
        lastError?: { message: string };
      };
    };
  }
}

export default function ExtensionBridge({}: ExtensionBridgeProps) {
  const { user } = useAuth();
  const [isFromExtension, setIsFromExtension] = useState(false);

  useEffect(() => {
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get("source");
    const extId = urlParams.get("extensionId");

    if (source === "extension" && extId) {
      setIsFromExtension(true);

      // 이미 로그인된 상태라면 Extension에 알림하고 자동으로 돌아가기
      if (user) {
        sendToExtension(extId, "LOGIN_SUCCESS", user);
        // 1초 후 자동으로 창 닫기
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    }
  }, [user]);

  const sendToExtension = (extensionId: string, type: string, data?: any) => {
    if (typeof window !== "undefined" && window.chrome?.runtime) {
      window.chrome.runtime.sendMessage(
        extensionId,
        {
          type,
          user: data
            ? {
                uid: data.uid,
                email: data.email,
                displayName: data.displayName,
                photoURL: data.photoURL,
              }
            : undefined,
        },
        (response: any) => {
          if (window.chrome?.runtime?.lastError) {
            console.error(
              "Extension communication error:",
              window.chrome.runtime.lastError
            );
          } else {
            console.log("Extension response:", response);
          }
        }
      );
    }
  };

  const handleBackToExtension = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const extId = urlParams.get("extensionId");

    if (extId && user) {
      sendToExtension(extId, "LOGIN_SUCCESS", user);
    }

    // Extension으로 돌아가기
    window.close(); // 탭이 Extension에 의해 열린 경우 닫기
  };

  const handleLogoutAndReturn = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const extId = urlParams.get("extensionId");

    try {
      await logout();

      if (extId) {
        sendToExtension(extId, "LOGOUT_SUCCESS");
      }

      window.close();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isFromExtension) {
    return null; // Extension에서 온 요청이 아니면 렌더링하지 않음
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-50 dark:bg-blue-900/20 p-3 border-b border-blue-200 dark:border-blue-800 z-50 text-center">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <span className="text-sm text-blue-700 dark:text-blue-300">
          🔌 Chrome Extension에서 접속됨
        </span>

        <div className="flex gap-2">
          {user ? (
            <>
              <button
                onClick={handleBackToExtension}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border-none rounded text-xs cursor-pointer transition-colors"
              >
                Extension으로 돌아가기
              </button>
              <button
                onClick={handleLogoutAndReturn}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white border-none rounded text-xs cursor-pointer transition-colors"
              >
                로그아웃 후 돌아가기
              </button>
            </>
          ) : (
            <span className="text-xs text-blue-700 dark:text-blue-300">
              로그인 후 자동으로 Extension으로 돌아갑니다
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
