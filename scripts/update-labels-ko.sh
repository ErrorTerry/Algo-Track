#!/usr/bin/env bash
set -euo pipefail

# 현재 연결된 레포 자동 감지
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

echo "업데이트할 레포: $REPO"
echo "라벨 설명을 한국어로 변경 중입니다..."

# area (작업 영역)
gh label edit "area:frontend"  --description "프론트엔드 관련 작업"  -R "$REPO" || true
gh label edit "area:backend"   --description "백엔드 관련 작업"     -R "$REPO" || true
gh label edit "area:fullstack" --description "프론트엔드 + 백엔드 연동 작업" -R "$REPO" || true
gh label edit "area:infra"     --description "CI/CD, 서버, 인프라 관련 작업" -R "$REPO" || true
gh label edit "area:docs"      --description "문서 작성 또는 문서화 관련 작업" -R "$REPO" || true

# type (작업 유형)
gh label edit "type:bug"       --description "버그 수정"             -R "$REPO" || true
gh label edit "type:feature"   --description "새로운 기능 추가"       -R "$REPO" || true
gh label edit "type:refactor"  --description "코드 리팩토링"          -R "$REPO" || true
gh label edit "type:chore"     --description "유지보수, 빌드 설정 등 단순 작업" -R "$REPO" || true
gh label edit "type:test"      --description "테스트 코드 관련 작업"   -R "$REPO" || true
gh label edit "type:question"  --description "질문 또는 논의가 필요한 항목" -R "$REPO" || true

# priority (우선순위)
gh label edit "priority:critical" --description "가장 긴급한 문제 (즉시 대응 필요)" -R "$REPO" || true
gh label edit "priority:high"     --description "중요도가 높은 항목 (빠른 처리 권장)" -R "$REPO" || true
gh label edit "priority:medium"   --description "보통 수준의 우선순위" -R "$REPO" || true
gh label edit "priority:low"      --description "낮은 우선순위 (추후 처리 가능)" -R "$REPO" || true

# status (상태)
gh label edit "status:blocked"       --description "다른 작업에 막혀 진행 불가" -R "$REPO" || true
gh label edit "status:needs-triage"  --description "분류 필요 (아직 검토 안 됨)" -R "$REPO" || true

echo "✅ 모든 라벨 설명이 한국어로 업데이트되었습니다!"
