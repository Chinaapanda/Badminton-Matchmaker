#!/usr/bin/env bash
# สร้างโปรเจกต TipTap per-page demo บน Desktop (Mac / Linux)
# รันบนเครื่องคุณ: bash create-desktop-tiptap-demo.sh

set -euo pipefail

PROJECT_NAME="tiptap-per-page-demo"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SOURCE_DIR:-$SCRIPT_DIR/desktop-tiptap-template}"

# Desktop path: Mac/Linux ใช้ ~/Desktop
if [[ -n "${DESKTOP_DIR:-}" ]]; then
  DESKTOP="$DESKTOP_DIR"
elif [[ -d "$HOME/Desktop" ]]; then
  DESKTOP="$HOME/Desktop"
elif [[ -d "$HOME/桌面" ]]; then
  DESKTOP="$HOME/桌面"
else
  DESKTOP="$HOME/Desktop"
  mkdir -p "$DESKTOP"
fi

TARGET="$DESKTOP/$PROJECT_NAME"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "ไม่พบ template: $SOURCE_DIR"
  exit 1
fi

echo "→ สร้างโปรเจกตที่: $TARGET"

copy_template() {
  mkdir -p "$TARGET"
  if command -v rsync >/dev/null 2>&1; then
    rsync -a --exclude node_modules --exclude dist "$SOURCE_DIR/" "$TARGET/"
  else
    find "$TARGET" -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} + 2>/dev/null || true
    for item in "$SOURCE_DIR"/* "$SOURCE_DIR"/.[!.]*; do
      base="$(basename "$item")"
      [[ "$base" == "node_modules" || "$base" == "dist" ]] && continue
      [[ -e "$item" ]] || continue
      cp -R "$item" "$TARGET/"
    done
  fi
}

mkdir -p "$DESKTOP"
if [[ -d "$TARGET" ]]; then
  echo "  โฟลเดอร์มีอยู่แล้ว — อัปเดตไฟล์"
fi
copy_template

cd "$TARGET"
echo "→ npm install ..."
npm install

echo ""
echo "เสร็จแล้ว"
echo "  โฟลเดอร์: $TARGET"
echo "  รัน dev:   cd \"$TARGET\" && npm run dev"
echo "  เปิด:      http://localhost:5173"
