#!/bin/bash

echo "🚀 빠른 Rate Limit 테스트를 위한 설정 변경"
echo "===================================="

# 1. 개발 환경 설정
export TESTING=true

# 2. 서버 재시작 (기존 메모리 카운터 리셋)
echo "📍 서버를 재시작하여 Rate Limit 카운터를 리셋합니다..."
echo "현재 실행 중인 서버를 중지하고 다음 명령어로 재시작하세요:"
echo ""
echo "TESTING=true uvicorn app.main:app --reload --port 10402"
echo ""

# 3. 테스트 스크립트
cat > quick_rate_test.sh << 'EOF'
#!/bin/bash
echo "🧪 빠른 Rate Limit 테스트 (1분 기준)"
echo "============================="

echo "📧 비밀번호 재설정 Rate Limit 테스트 (10회/분):"
for i in {1..12}; do
  echo -n "시도 $i: "
  response=$(curl -s -w "%{http_code}" -X POST "http://localhost:10402/api/auth/password-reset/request" \
       -H "Content-Type: application/json" \
       -d '{"email": "test@aumc.ac.kr"}')
  
  status_code="${response: -3}"
  echo "Status $status_code"
  
  if [ "$status_code" = "429" ]; then
    echo "🚫 Rate Limit 도달! (${i}번째 시도에서)"
    echo "✅ 테스트 성공: Rate Limiting이 정상 작동합니다"
    break
  fi
  
  sleep 1  # 1초 간격
done

echo ""
echo "🔐 로그인 Rate Limit 테스트 (30회/분):"
for i in {1..35}; do
  echo -n "시도 $i: "
  response=$(curl -s -w "%{http_code}" -X POST "http://localhost:10402/api/auth/login" \
       -H "Content-Type: application/json" \
       -d '{"email": "test@aumc.ac.kr", "password": "wrong"}')
  
  status_code="${response: -3}"
  echo "Status $status_code"
  
  if [ "$status_code" = "429" ]; then
    echo "🚫 Rate Limit 도달! (${i}번째 시도에서)"
    echo "✅ 테스트 성공: Rate Limiting이 정상 작동합니다"
    break
  fi
  
  # 빠르게 테스트하기 위해 sleep 시간 단축
  [ $((i % 10)) -eq 0 ] && sleep 1
done

echo ""
echo "⏰ 1분 후 카운터가 자동으로 리셋됩니다"
echo "🔄 즉시 리셋하려면 서버를 재시작하세요"
EOF

chmod +x quick_rate_test.sh

echo "📝 사용 방법:"
echo "1. 서버 중지 (Ctrl+C)"
echo "2. 다음 명령어로 서버 재시작:"
echo "   TESTING=true uvicorn app.main:app --reload --port 10402"
echo "3. 새 터미널에서 테스트 실행:"
echo "   ./quick_rate_test.sh"
echo ""
echo "💡 테스트 완료 후 프로덕션 모드로 되돌리려면:"
echo "   일반 명령어로 서버 재시작 (TESTING 환경변수 제거)"