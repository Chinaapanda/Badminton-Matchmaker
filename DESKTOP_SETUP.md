# สร้างโปรเจกตบน Desktop (Mac / Windows)

Agent **ไม่สามารถเขียนไฟล์ลง Desktop บน Mac/PC ของคุณโดยตรง** — ให้รันสคริปต์นี้ **บนเครื่อง desktop** เอง

## Mac / Linux

1. Clone หรือ pull repo นี้
2. รัน:

```bash
cd /path/to/Badminton-Matchmaker
bash scripts/create-desktop-tiptap-demo.sh
```

โปรเจกตจะอยู่ที่:

**`~/Desktop/tiptap-per-page-demo`**

3. รัน dev server:

```bash
cd ~/Desktop/tiptap-per-page-demo
npm run dev
```

เปิด http://localhost:5173

## Windows (PowerShell)

```powershell
cd C:\path\to\Badminton-Matchmaker
$env:DESKTOP_DIR = [Environment]::GetFolderPath("Desktop")
bash scripts/create-desktop-tiptap-demo.sh
```

(ต้องมี Git Bash หรือ WSL)

## สร้างด้วยมือ (ไม่ใช้สคริปต์)

```bash
cp -R scripts/desktop-tiptap-template ~/Desktop/tiptap-per-page-demo
cd ~/Desktop/tiptap-per-page-demo
npm install
npm run dev
```
