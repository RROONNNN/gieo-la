#!/bin/bash
# Mở Chrome với remote debugging port 9222
# Dùng trước khi chạy "Next.js: attach Chrome (với extensions)" trong VS Code

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -f "$CHROME" ]; then
  echo "Không tìm thấy Chrome tại: $CHROME"
  exit 1
fi

# Kiểm tra nếu port 9222 đã được dùng
if lsof -Pi :9222 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "✅ Chrome đã đang chạy với remote debugging port 9222"
  echo "   Bạn có thể chạy 'Next.js: attach Chrome' ngay bây giờ."
else
  echo "🚀 Đang mở Chrome với remote debugging port 9222..."
  "$CHROME" --remote-debugging-port=9222 "http://localhost:3000" &
  echo "✅ Chrome đã mở. Bây giờ chạy 'Next.js: attach Chrome' trong VS Code."
fi
