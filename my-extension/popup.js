// DOM 요소들 가져오기
const $btn = document.getElementById("login");
const $user = document.getElementById("user");
const $mainContent = document.getElementById("mainContent");
const $loginGuide = document.getElementById("loginGuide");
const $signOutButton = document.getElementById("signOutButton");
const $currentPageUrl = document.getElementById("currentPageUrl");
const $quickModeCheckbox = document.getElementById("quickModeCheckbox");

// 로그인 버튼 클릭 이벤트
$btn.addEventListener("click", async () => {
  // React 앱으로 리다이렉트하여 로그인 처리
  const loginUrl = `https://bookmarkhub-5ea6c.web.app?source=extension&extensionId=${chrome.runtime.id}`;
  chrome.tabs.create({ url: loginUrl });

  // 팝업 창 닫기
  window.close();
});

// 새로운 로그아웃 버튼 클릭 이벤트
if ($signOutButton) {
  $signOutButton.addEventListener("click", async () => {
    try {
      const result = await chrome.runtime.sendMessage({ type: "LOGOUT" });
      if (result?.error) {
        console.error("Storage API 에러:", result.error);
        return;
      }
      if (result?.success) {
        showLoginUI();
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  });
}

// 로그인 UI 표시
function showLoginUI() {
  $user.innerHTML = "";
  $btn.style.display = "flex";
  if ($mainContent) $mainContent.style.display = "none";
  if ($loginGuide) $loginGuide.style.display = "block";
  if ($signOutButton) $signOutButton.style.display = "none";
}

// 로그인 후 UI 표시
function showMainContent() {
  $btn.style.display = "none";
  if ($mainContent) $mainContent.style.display = "block";
  if ($loginGuide) $loginGuide.style.display = "none";
  if ($signOutButton) $signOutButton.style.display = "block";

  // 현재 페이지 URL 가져오기
  getCurrentPageUrl();

  // 빠른 실행 모드 상태 로드
  loadQuickModeState();
}

// 사용자 인증 상태 확인
async function refreshUser() {
  try {
    const result = await chrome.runtime.sendMessage({ type: "GET_AUTH_STATE" });
    if (result?.error) {
      console.error("Storage API 에러:", result.error);
      return;
    }
    if (result?.user) {
      renderUser(result.user);
    } else {
      showLoginUI();
    }
  } catch (error) {
    console.error("인증 상태 확인 에러:", error);
    showLoginUI();
  }
}

// 사용자 정보 렌더링
function renderUser(user) {
  // 사용자 정보 표시
  $user.innerHTML = `
    <div class="flex items-center">
      <img src="${user.photoURL || ""}" 
           class="w-6 h-6 rounded-full mr-2" 
           onerror="this.style.display='none'">
      <span class="text-sm font-medium text-gray-700">
        ${user.displayName || user.email}
      </span>
    </div>`;

  // 메인 콘텐츠 표시
  showMainContent();
}

// 현재 페이지 URL 가져오기
async function getCurrentPageUrl() {
  try {
    // 현재 활성 탭 정보 가져오기
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.url && $currentPageUrl) {
      // URL 표시 (최대 50자로 제한)
      const displayUrl =
        tab.url.length > 50 ? tab.url.substring(0, 47) + "..." : tab.url;
      $currentPageUrl.textContent = displayUrl;
      $currentPageUrl.title = tab.url; // 전체 URL을 툴팁으로 표시

      // 전역 변수로 저장 (나중에 북마크 저장시 사용)
      window.currentPageData = {
        url: tab.url,
        title: tab.title || tab.url,
        favIconUrl: tab.favIconUrl,
      };
    }
  } catch (error) {
    console.error("현재 페이지 URL 가져오기 실패:", error);
    if ($currentPageUrl) {
      $currentPageUrl.textContent = "URL을 가져올 수 없습니다";
    }
  }
}

// 빠른 실행 모드 상태 로드
async function loadQuickModeState() {
  try {
    const result = await chrome.storage.local.get(["quickMode"]);
    const isQuickMode = result.quickMode || false;
    if ($quickModeCheckbox) {
      $quickModeCheckbox.checked = isQuickMode;
    }
  } catch (error) {
    console.error("빠른 실행 모드 상태 로드 실패:", error);
  }
}

// 빠른 실행 모드 체크박스 이벤트
if ($quickModeCheckbox) {
  $quickModeCheckbox.addEventListener("change", async (e) => {
    try {
      const isChecked = e.target.checked;
      await chrome.storage.local.set({ quickMode: isChecked });
      console.log(`빠른 실행 모드 ${isChecked ? "활성화" : "비활성화"}`);
    } catch (error) {
      console.error("빠른 실행 모드 설정 실패:", error);
      // 실패시 체크박스 상태 되돌리기
      e.target.checked = !e.target.checked;
    }
  });
}

// 페이지 로드시 사용자 상태 확인
refreshUser();
