#!/bin/bash

# 통합 개발 서버 실행 스크립트
# 사용법: ./dev.sh [프로젝트] [포트번호]
# 프로젝트: signin-popup, my-app, my-extension, all (기본값)

set -e  # 에러 발생 시 스크립트 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 배너 출력
echo -e "${BLUE}"
echo "🖥️  통합 개발 서버 스크립트"
echo "========================="
echo -e "${NC}"

# 프로젝트 및 포트 파라미터 처리
PROJECT="${1:-signin-popup}"
PORT="${2:-8000}"

# 첫 번째 파라미터가 숫자면 포트로 간주
if [[ "$1" =~ ^[0-9]+$ ]]; then
    PROJECT="signin-popup"
    PORT="$1"
fi

log_info "실행 대상: $PROJECT"
log_info "사용할 포트: $PORT"

# 루트 디렉토리 저장
ROOT_DIR=$(pwd)

# 포트 사용 중인지 확인하는 함수
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "포트 $port가 이미 사용 중입니다!"
        
        # 사용 중인 프로세스 정보 표시
        PROCESS_INFO=$(lsof -Pi :$port -sTCP:LISTEN)
        echo -e "${YELLOW}현재 사용 중인 프로세스:${NC}"
        echo "$PROCESS_INFO"
        
        # 사용자에게 선택 옵션 제공
        echo ""
        echo "다음 중 선택하세요:"
        echo "1. 다른 포트 사용"
        echo "2. 기존 프로세스 종료 후 계속"
        echo "3. 종료"
        
        read -p "선택 (1-3): " -n 1 -r
        echo
        
        case $REPLY in
            1)
                # 사용 가능한 포트 찾기
                NEW_PORT=$((port + 1))
                while lsof -Pi :$NEW_PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
                    NEW_PORT=$((NEW_PORT + 1))
                done
                PORT=$NEW_PORT
                log_info "새로운 포트로 변경: $PORT"
                ;;
            2)
                # 기존 프로세스 종료
                PID=$(lsof -ti :$port)
                if [ ! -z "$PID" ]; then
                    kill $PID
                    log_success "포트 $port의 프로세스를 종료했습니다"
                    sleep 1
                fi
                ;;
            3)
                log_info "스크립트를 종료합니다"
                exit 0
                ;;
            *)
                log_error "잘못된 선택입니다"
                exit 1
                ;;
        esac
    fi
}

# SignIn Popup 개발 서버 함수
dev_signin_popup() {
    log_info "📱 SignIn Popup 개발 서버 시작..."
    
    if [ ! -d "signin-popup" ]; then
        log_error "signin-popup 디렉토리가 없습니다!"
        return 1
    fi
    
    cd signin-popup
    
    # 필수 파일 확인
    REQUIRED_FILES=("index.html" "signInWithPopup.js")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "필수 파일이 없습니다: $file"
            cd "$ROOT_DIR"
            return 1
        fi
    done
    
    # Python3 설치 확인
    if ! command -v python3 &> /dev/null; then
        log_error "Python3이 설치되지 않았습니다!"
        log_info "Python3을 설치한 후 다시 시도하세요"
        cd "$ROOT_DIR"
        return 1
    fi
    
    # 포트 확인
    check_port $PORT
    
    # 서버 시작
    log_success "SignIn Popup 개발 서버를 시작합니다..."
    echo ""
    echo -e "${GREEN}🌐 서버 URL: ${BLUE}http://localhost:$PORT${NC}"
    echo -e "${GREEN}📁 서빙 디렉토리: ${BLUE}$(pwd)${NC}"
    echo ""
    echo -e "${YELLOW}서버를 중지하려면 Ctrl+C를 누르세요${NC}"
    echo ""
    
    # 브라우저 자동 열기 옵션
    if command -v open &> /dev/null; then
        read -p "브라우저에서 자동으로 열까요? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sleep 2 && open "http://localhost:$PORT" &
            log_success "브라우저에서 사이트를 열었습니다"
        fi
    fi
    
    # Python HTTP 서버 시작
    python3 -m http.server $PORT
}

# BookmarkHub Dashboard 개발 서버 함수
dev_bookmarkhub_dashboard() {
    log_info "⚛️  BookmarkHub Dashboard 개발 서버 시작..."
    
    if [ ! -d "bookmarkhub-dashboard" ]; then
        log_error "bookmarkhub-dashboard 디렉토리가 없습니다!"
        return 1
    fi
    
    cd bookmarkhub-dashboard
    
    # package.json 확인
    if [ ! -f "package.json" ]; then
        log_error "package.json이 없습니다!"
        cd "$ROOT_DIR"
        return 1
    fi
    
    # 의존성 설치
    if [ ! -d "node_modules" ]; then
        log_info "의존성 설치 중..."
        npm install
    fi
    
    # 포트 환경변수 설정
    export PORT=$PORT
    
    log_success "BookmarkHub Dashboard 개발 서버를 시작합니다..."
    echo ""
    echo -e "${GREEN}🌐 예상 서버 URL: ${BLUE}http://localhost:$PORT${NC}"
    echo -e "${GREEN}📁 프로젝트 디렉토리: ${BLUE}$(pwd)${NC}"
    echo ""
    echo -e "${YELLOW}서버를 중지하려면 Ctrl+C를 누르세요${NC}"
    echo ""
    
    # Vite 개발 서버 시작
    npm run dev -- --port $PORT --host
}

# Chrome Extension 개발 서버 함수 (Live Server)
dev_my_extension() {
    log_info "🧩 Chrome Extension 개발 환경 준비..."
    
    if [ ! -d "my-extension" ]; then
        log_error "my-extension 디렉토리가 없습니다!"
        return 1
    fi
    
    cd my-extension
    
    # manifest.json 확인
    if [ ! -f "manifest.json" ]; then
        log_error "manifest.json이 없습니다!"
        cd "$ROOT_DIR"
        return 1
    fi
    
    log_success "Chrome Extension 파일들을 확인했습니다"
    echo ""
    echo -e "${GREEN}📁 Extension 디렉토리: ${BLUE}$(pwd)${NC}"
    echo ""
    echo -e "${YELLOW}Chrome Extension 개발 방법:${NC}"
    echo "1. Chrome에서 chrome://extensions/ 열기"
    echo "2. '개발자 모드' 활성화"
    echo "3. '압축해제된 확장 프로그램을 로드합니다' 클릭"
    echo "4. 이 디렉토리 선택: $(pwd)"
    echo ""
    echo "파일을 수정한 후 Chrome에서 확장 프로그램을 새로고침하세요."
    echo ""
    
    # 파일 변경 감시 (선택사항)
    if command -v fswatch &> /dev/null; then
        log_info "파일 변경 감시를 시작합니다..."
        echo -e "${YELLOW}파일이 변경되면 알림을 표시합니다${NC}"
        echo -e "${YELLOW}감시를 중지하려면 Ctrl+C를 누르세요${NC}"
        echo ""
        
        fswatch -o . | while read f; do
            echo "$(date '+%H:%M:%S') - 파일이 변경되었습니다. Chrome에서 확장 프로그램을 새로고침하세요."
        done
    else
        log_info "파일 변경 감시를 원한다면 fswatch를 설치하세요: brew install fswatch"
        echo ""
        read -p "계속하려면 Enter를 누르세요..."
    fi
}

# 모든 프로젝트 개발 서버 실행 (병렬)
dev_all() {
    log_info "🚀 모든 프로젝트 개발 서버 시작..."
    echo ""
    echo -e "${YELLOW}여러 서버를 병렬로 실행합니다:${NC}"
    echo "- SignIn Popup: http://localhost:8000"
    echo "- BookmarkHub Dashboard: http://localhost:3000" 
    echo "- Extension: Chrome Extension 로드 안내"
    echo ""
    
    # 백그라운드에서 각 서버 실행
    (
        echo "SignIn Popup 서버 시작..."
        cd signin-popup && python3 -m http.server 8000
    ) &
    
    (
        echo "BookmarkHub Dashboard 서버 시작..."
        cd bookmarkhub-dashboard && npm run dev -- --port 3000 --host
    ) &
    
    # Chrome Extension 안내
    (
        sleep 2
        echo ""
        echo -e "${GREEN}Chrome Extension 개발 안내:${NC}"
        echo "chrome://extensions/에서 개발자 모드 활성화 후"
        echo "my-extension 디렉토리를 로드하세요"
    ) &
    
    # 모든 백그라운드 프로세스 대기
    wait
}

# 메인 개발 서버 로직
case $PROJECT in
    "signin-popup")
        dev_signin_popup
        ;;
    "bookmarkhub-dashboard")
        dev_bookmarkhub_dashboard
        ;;
    "my-extension")
        dev_my_extension
        ;;
    "all")
        dev_all
        ;;
    *)
        log_error "알 수 없는 프로젝트: $PROJECT"
        log_info "사용 가능한 프로젝트: signin-popup, bookmarkhub-dashboard, my-extension, all"
        exit 1
        ;;
esac

cd "$ROOT_DIR"