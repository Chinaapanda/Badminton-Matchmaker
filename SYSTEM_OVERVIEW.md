# 🏸 Badminton Matchmaker - System Overview

เอกสารอธิบายระบบทั้งหมดของ Badminton Matchmaker อย่างละเอียด

---

## 📋 ภาพรวมระบบทั้งหมด

### 1. 🔐 **Authentication & User Management System**
ระบบจัดการผู้ใช้และการยืนยันตัวตน

**Features:**
- **Register/Login**: สมัครสมาชิกและเข้าสู่ระบบด้วย Email/Password
- **Session Management**: ใช้ Supabase Auth สำหรับจัดการ session
- **Auto Profile Creation**: สร้าง profile อัตโนมัติเมื่อ user ลงทะเบียน (ผ่าน database trigger)
- **Role-based Access**: มี 2 roles
  - `user` - ผู้ใช้ทั่วไป
  - `admin` - ผู้ดูแลระบบ

**Database:**
- `auth.users` - Supabase auth table
- `profiles` table - เก็บข้อมูลเพิ่มเติม (display_name, avatar, ELO, wins, losses, role, is_banned)

**Related Files:**
- [src/lib/api/auth.ts](src/lib/api/auth.ts)
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)
- [src/app/login/page.tsx](src/app/login/page.tsx)
- [src/app/register/page.tsx](src/app/register/page.tsx)

---

### 2. 👤 **Profile Management System**
ระบบจัดการโปรไฟล์ส่วนตัว

**Features:**
- **Edit Display Name**: แก้ไขชื่อที่แสดง
- **Avatar Upload**: อัปโหลดรูปโปรไฟล์ไปยัง Supabase Storage (bucket: `avatars`)
- **View Stats**: ดูสถิติ (ELO, Wins, Losses) แบบ read-only
- **Account Menu**: เมนูผู้ใช้ใน header พร้อม avatar และ dropdown

**API Functions:**
- `updateProfile()` - อัปเดตข้อมูลโปรไฟล์
- `uploadAvatar()` - อัปโหลดรูปภาพ
- `fetchAllProfiles()` - ดึงข้อมูลผู้ใช้ทั้งหมด (admin)

**Related Files:**
- [src/lib/api/profiles.ts](src/lib/api/profiles.ts)
- [src/app/profile/page.tsx](src/app/profile/page.tsx)

---

### 3. 🎮 **Player Roster Management System**
ระบบจัดการรายชื่อผู้เล่นสำหรับการจับคู่

**Features:**
- **Add Player (2 วิธี)**:
  1. **พิมพ์ชื่อใหม่โดยตรง** → สร้าง guest player
  2. **เลือกจาก registered users** → เลือกจากคนที่สมัครแล้ว (👤+ button)
- **Toggle Active/Inactive**: เปิด/ปิดสถานะพร้อมเล่น
- **Remove Player**: ลบผู้เล่นออกจาก roster
- **Player Stats Display**: แสดง Games Played, ELO

**Search Feature** (ใหม่!):
- ค้นหาผู้ใช้ที่ลงทะเบียนตามชื่อหรืออีเมล
- กรองผู้เล่นที่อยู่ใน roster แล้วออกไปอัตโนมัติ
- เลือกผู้เล่นพร้อม ELO และ stats

**Database:**
- `players` table - roster ของผู้เล่น (แยกจาก profiles)

**API Functions:**
- `fetchPlayers()` - ดึงรายชื่อผู้เล่นทั้งหมด
- `addPlayer()` - เพิ่มผู้เล่นใหม่
- `addPlayerFromProfile()` - เพิ่มผู้เล่นจาก profile
- `updatePlayerStats()` - อัปเดต ELO, wins, losses
- `deletePlayer()` - ลบผู้เล่น

**Related Files:**
- [src/lib/api/players.ts](src/lib/api/players.ts)
- [src/components/players/PlayerRoster.tsx](src/components/players/PlayerRoster.tsx)
- [src/components/players/PlayerSearchModal.tsx](src/components/players/PlayerSearchModal.tsx)

---

### 4. 🏆 **Matchmaking System**
ระบบจับคู่ผู้เล่นอัจฉริยะ (Core Feature)

**Features:**
- **Smart Pairing Algorithm**: จับคู่ตาม ELO เพื่อความสมดุล
- **Randomness Control**: ปรับระดับความสุ่ม (0-1)
- **Multi-Court Support**: รองรับหลายสนาม
- **Sitting Out Management**: จัดการคนนั่งพัก
- **Rest Round Tracking**: ติดตามการพักของแต่ละคน

**Configuration:**
- จำนวนสนาม (Courts)
- ระดับความสุ่ม (Randomness Level)

**Match Result Recording:**
- บันทึกผลแพ้/ชนะ
- อัพเดต ELO อัตโนมัติ (ELO rating system)
- อัพเดต wins/losses ของผู้เล่น
- Auto-generate match ใหม่สำหรับสนามที่จบแล้ว

**ELO System:**
- ชนะ: +32 ELO
- แพ้: -32 ELO
- Initial ELO: 1200

**Related Files:**
- [src/lib/matchmaker-instance.ts](src/lib/matchmaker-instance.ts)
- [src/lib/matchmaker.ts](src/lib/matchmaker.ts)

---

### 5. 🎯 **Round & Match Management**
ระบบจัดการรอบการแข่งขัน

**Features:**
- **Generate Round**: สร้างรอบการแข่งขันใหม่
- **Match List Display**: แสดงรายการแมตช์แยกตามสนาม
- **Finish Match**: บันทึกผลการแข่งขัน
  - เลือกทีมชนะ (Team 1 หรือ Team 2)
  - ระบุคะแนน (optional)
- **Round History**: ดูประวัติการแข่งขันย้อนหลัง
- **Players Sitting Out**: แสดงคนที่นั่งพักในรอบนั้น

**Match Result Modal:**
- เลือกทีมชนะ
- กรอกคะแนน (Score)
- Auto-update stats หลังบันทึกผล

**Related Files:**
- [src/components/rounds/MatchList.tsx](src/components/rounds/MatchList.tsx)
- [src/components/rounds/MatchResultModal.tsx](src/components/rounds/MatchResultModal.tsx)

---

### 6. 📊 **Ranking & Leaderboard System**
ระบบจัดอันดับผู้เล่น

**Features:**
- **ELO-based Ranking**: จัดอันดับตาม ELO
- **Player Statistics**:
  - ELO Rating
  - Total Games
  - Wins / Losses
  - Win Rate (%)
- **Real-time Updates**: อัปเดตอันดับทันทีหลังบันทึกผล

**Related Files:**
- [src/components/ranking/Leaderboard.tsx](src/components/ranking/Leaderboard.tsx)

---

### 7. ⚙️ **Settings & Configuration**
ระบบตั้งค่า

**Features:**
- **Court Settings**: ตั้งค่าจำนวนสนาม
- **Randomness Level**: ปรับความสุ่มในการจับคู่
- **LINE Notify Token**: ตั้งค่า token สำหรับส่งแจ้งเตือน
- **Reset Options**:
  - Reset Game Only - รีเซ็ตเฉพาะเกม เก็บผู้เล่นไว้
  - Reset All - รีเซ็ตทุกอย่าง

**Persistence:**
- LocalStorage สำหรับเก็บ configuration
- Supabase สำหรับเก็บ player data

**Related Files:**
- [src/components/settings/SettingsPanel.tsx](src/components/settings/SettingsPanel.tsx)

---

### 8. 📱 **LINE Notification System**
ระบบแจ้งเตือนผ่าน LINE

**Features:**
- **Send Match Notifications**: ส่งรายการแมตช์ผ่าน LINE Notify
- **Automatic Message Formatting**:
  - แสดงรายการแข่งขันแต่ละสนาม
  - แสดงคนที่นั่งพัก
- **Token Configuration**: ตั้งค่า LINE Notify token ใน Settings

**API:**
- `/api/notify` - endpoint สำหรับส่ง LINE notification

**Related Files:**
- [src/app/api/notify/route.ts](src/app/api/notify/route.ts)

---

### 9. 👑 **Admin Dashboard**
ระบบจัดการสำหรับ Admin (เฉพาะ role = admin)

**Features:**
- **User Management**:
  - ดูรายชื่อผู้ใช้ทั้งหมด
  - Ban/Unban users
  - ลบผู้ใช้
  - อัปเดต display name
- **Manual ELO Adjustment**: ปรับ ELO ด้วยตัวเอง
- **View All Stats**: ดูสถิติผู้ใช้ทั้งหมด
- **Protected Route**: เข้าได้เฉพาะ admin เท่านั้น

**Database Policies:**
- Admin สามารถ update/delete profiles ได้ทั้งหมด
- User ทั่วไปแก้ไขได้เฉพาะของตัวเอง

**Related Files:**
- [src/app/admin/page.tsx](src/app/admin/page.tsx)

---

### 10. 🔍 **Player Search & Select**
ระบบค้นหาและเลือกผู้เล่นจาก Registered Users

**Features:**
- **Search by Name/Email**: ค้นหาแบบ case-insensitive
- **Real-time Filtering**: กรองขณะพิมพ์
- **Auto-exclude Existing Players**: กรองคนที่อยู่ใน roster แล้ว
- **Stats Import**: นำ ELO และ stats จาก profile มาใช้
- **Beautiful Modal UI**: UI สวยงามพร้อม avatar display

**API Functions:**
- `searchProfiles()` - ค้นหา profiles ตาม query

**Related Files:**
- [src/components/players/PlayerSearchModal.tsx](src/components/players/PlayerSearchModal.tsx)
- [src/lib/api/profiles.ts](src/lib/api/profiles.ts)

---

## 🗄️ **Database Schema**

### Tables:

#### 1. `profiles`
ข้อมูลผู้ใช้ที่ลงทะเบียน
```sql
- id: uuid (PK, FK to auth.users)
- email: text
- display_name: text
- role: text ('user' | 'admin')
- is_banned: boolean
- elo: integer (default: 1200)
- wins: integer (default: 0)
- losses: integer (default: 0)
- avatar_url: text
- created_at: timestamp
```

#### 2. `players`
Roster ผู้เล่น (guest + registered)
```sql
- id: uuid (PK)
- name: text
- elo: integer (default: 1200)
- wins: integer (default: 0)
- losses: integer (default: 0)
- created_by: uuid (FK to auth.users)
- created_at: timestamp
```

#### 3. `sessions`
Game sessions (สำหรับอนาคต)
```sql
- id: uuid (PK)
- name: text
- court_count: integer
- randomness_level: float
- is_active: boolean
- created_by: uuid (FK to profiles)
- created_at: timestamp
```

#### 4. `session_players`
ผู้เล่นใน session (สำหรับอนาคต)
```sql
- id: uuid (PK)
- session_id: uuid (FK to sessions)
- player_id: uuid (FK to profiles)
- is_active: boolean
- joined_at: timestamp
```

#### 5. `matches`
บันทึกการแข่งขัน (สำหรับอนาคต)
```sql
- id: uuid (PK)
- session_id: uuid (FK to sessions)
- court_number: integer
- winner_team: integer (1 or 2)
- score: text
- created_at: timestamp
- finished_at: timestamp
```

#### 6. `match_players`
ผู้เล่นในแมตช์ (สำหรับอนาคต)
```sql
- id: uuid (PK)
- match_id: uuid (FK to matches)
- player_id: uuid (FK to profiles)
- team: integer (1 or 2)
- created_at: timestamp
```

### Storage Buckets:
- **`avatars`** - เก็บรูปโปรไฟล์ผู้ใช้

### Row Level Security (RLS) Policies:

**Profiles:**
- ทุกคนดูได้ (SELECT)
- แก้ไขได้เฉพาะของตัวเอง (UPDATE)
- Admin แก้ไขทุกคนได้ (UPDATE, DELETE)

**Players:**
- ทุกคนดูได้ (SELECT)
- เจ้าของแก้ไข/ลบได้ (UPDATE, DELETE)

---

## 🎨 **UI/UX Features**

### Design System:
- **Dark Mode Theme**: ธีมสีเข้มสวยงาม (zinc-950 background)
- **Color Palette**:
  - Primary: Emerald (emerald-500, emerald-600)
  - Secondary: Blue (blue-500, blue-600)
  - Danger: Red (red-400, red-500)
  - Accent: Purple (purple-400) สำหรับ admin features
- **Typography**: System fonts พร้อม font-sans

### UI Components:
- **Responsive Design**: รองรับทุกขนาดหน้าจอ (mobile, tablet, desktop)
- **Tab Navigation**: แท็บสำหรับ Players, Rounds, Ranking, Settings
- **Animations**: 
  - Fade-in effects
  - Slide-in animations
  - Hover transitions
- **Loading States**: Spinners และ loading indicators
- **Error Handling**: Error messages พร้อม dismiss button
- **Modals**: 
  - Match result modal
  - Player search modal
  - Backdrop blur effects
- **User Menu**: Dropdown menu พร้อม avatar display

### Accessibility:
- Keyboard navigation support
- Focus states
- Semantic HTML
- ARIA labels (ควรเพิ่มเติมในอนาคต)

---

## 🔧 **Technical Stack**

### Frontend:
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: React 18
- **State Management**: React hooks (useState, useEffect, useContext)

### Backend:
- **BaaS**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Security**: Row Level Security (RLS)

### Development:
- **Package Manager**: pnpm
- **Node Version**: 20.x
- **Build Tool**: Next.js built-in (Turbopack/Webpack)

### State Management:
- **Local State**: React useState/useEffect
- **Global State**: React Context (AuthContext)
- **Matchmaker State**: Singleton instance pattern
- **Persistence**: 
  - LocalStorage (matchmaker data, config)
  - Supabase (user data, players)

### API Structure:
```
/lib/api/
├── auth.ts         # Authentication functions
├── profiles.ts     # Profile management
└── players.ts      # Player management

/lib/
├── supabase.ts         # Supabase client
├── matchmaker.ts       # Matchmaker class
└── matchmaker-instance.ts  # Singleton instance

/app/api/
└── notify/route.ts # LINE Notify API
```

---

## 🚀 **Workflow ปกติของการใช้งาน**

### 1. Setup (ครั้งแรก)
1. สมัครสมาชิก/Login เข้าระบบ
2. แก้ไขโปรไฟล์ (ชื่อ, รูปภาพ)
3. ตั้งค่าจำนวนสนามใน Settings
4. ตั้งค่า LINE Notify Token (ถ้าต้องการ)

### 2. เริ่มเซสชั่นใหม่
1. **Add Players**:
   - วิธีที่ 1: พิมพ์ชื่อผู้เล่นใหม่ (guest)
   - วิธีที่ 2: คลิก 👤+ เพื่อเลือกจาก registered users
2. **Toggle Active Status**: เลือกผู้ที่มาเล่นจริง

### 3. จับคู่และเล่น
1. กด "Generate Round" เพื่อจับคู่
2. (Optional) ส่งแจ้งเตือนผ่าน LINE
3. เล่นตามแมตช์ที่จับคู่

### 4. บันทึกผล
1. เมื่อแมตช์จบ คลิก "Finish" ที่แมตช์นั้น
2. เลือกทีมชนะ (Team 1 หรือ Team 2)
3. กรอกคะแนน (optional)
4. กด "Save Result"
5. ระบบจะ:
   - อัพเดต ELO ของผู้เล่นทั้ง 4
   - อัพเดต wins/losses
   - สร้างแมตช์ใหม่ให้สนามนั้นทันที
   - บันทึกลง Supabase

### 5. วนซ้ำ
- เล่นแมตช์ใหม่ที่ถูก generate
- บันทึกผลเมื่อจบ
- ทำซ้ำจนจบเซสชั่น

### 6. ตรวจสอบผล
- ดู **Ranking** tab เพื่อดูอันดับ
- ดู **Rounds** tab เพื่อดูประวัติ

### 7. Admin Tasks (สำหรับ Admin)
- ไปที่ Admin Dashboard
- จัดการผู้ใช้ (ban/unban/delete)
- ปรับ ELO ด้วยตัวเอง (ถ้าจำเป็น)

---

## 📁 **Project Structure**

```
badminton/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/notify/        # LINE Notify API
│   │   ├── login/             # Login page
│   │   ├── profile/           # Profile page
│   │   ├── register/          # Register page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page (main app)
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── players/
│   │   │   ├── PlayerRoster.tsx
│   │   │   └── PlayerSearchModal.tsx
│   │   ├── ranking/
│   │   │   └── Leaderboard.tsx
│   │   ├── rounds/
│   │   │   ├── MatchList.tsx
│   │   │   └── MatchResultModal.tsx
│   │   └── settings/
│   │       └── SettingsPanel.tsx
│   │
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx
│   │
│   ├── lib/                   # Libraries & utilities
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── players.ts
│   │   │   └── profiles.ts
│   │   ├── matchmaker.ts
│   │   ├── matchmaker-instance.ts
│   │   └── supabase.ts
│   │
│   └── types/                 # TypeScript types
│       └── index.ts
│
├── supabase/
│   └── migrations/            # Database migrations
│       ├── 20250120_initial_schema.sql
│       ├── 20251120204515_add_role_and_ban_fields.sql
│       └── 20251120205043_convert_role_to_enum.sql
│
├── .env.local                 # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

---

## 🔐 **Environment Variables**

สร้างไฟล์ `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🚧 **Future Enhancements**

### Planned Features:
1. **Session Management**:
   - สร้างและจัดการ sessions ที่แยกกันชัดเจน
   - ดู session history
   - Export session results

2. **Match History**:
   - บันทึกแมตช์ลง database
   - ดูประวัติการแข่งขันของแต่ละคน
   - Statistics & Analytics

3. **Advanced Matchmaking**:
   - Custom pairing rules
   - Partner preferences
   - Avoid recent opponents

4. **Tournament Mode**:
   - Swiss system
   - Knockout brackets
   - Round-robin

5. **Mobile App**:
   - React Native version
   - Push notifications

6. **Social Features**:
   - Player profiles with photos
   - Friend system
   - Comments & reactions

---

## 📝 **Development Notes**

### การรัน Local Development:
```bash
pnpm install
pnpm dev
```

### Database Migrations:
```bash
# ดู migration status
supabase db status

# รัน migrations
supabase db push

# สร้าง migration ใหม่
supabase migration new migration_name
```

### Deployment:
- Frontend: Vercel (แนะนำ)
- Database: Supabase Cloud

---

## 🐛 **Known Issues & Limitations**

### Current Limitations:
1. **LocalStorage Dependency**: 
   - Matchmaker state เก็บใน localStorage
   - ข้อมูลจะหายถ้า clear browser data
   - ควรใช้ Supabase sessions แทน

2. **No Real-time Sync**:
   - ไม่มี real-time updates ระหว่าง users
   - ควรใช้ Supabase Realtime

3. **Limited Admin Features**:
   - Admin ไม่มี dashboard สำหรับดู analytics
   - ไม่มี audit logs

4. **No Mobile Optimization**:
   - Responsive แต่ไม่ได้ optimize เต็มที่สำหรับ mobile

### Bugs to Fix:
- [ ] Handle edge cases when players < 4
- [ ] Better error messages
- [ ] Loading states consistency
- [ ] Image optimization for avatars

---

## 👥 **Contributing**

หากต้องการพัฒนาต่อ:
1. สร้าง feature branch
2. ทำการแก้ไข
3. Test ให้ครบถ้วน
4. Create pull request

---

## 📄 **License**

Private project - ไม่ระบุ license

---

**Last Updated**: 2025-11-21  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
