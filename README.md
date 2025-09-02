# HSKPass

HSK 단어를 체계적으로 학습하고 반복 복습을 통해 장기 기억에 도움을 주는 웹 기반 학습 플랫폼입니다.

## 주요 기능

### 단어 학습 시스템

- HSK 1급부터 6급까지 급수별 단어 리스트 제공
- 한자, 병음, 뜻으로 구성된 체계적인 단어 정보
- 한자 획순 애니메이션을 통한 시각적 학습
- 병음 발음 재생 기능
- 개인 즐겨찾기를 통한 맞춤형 단어 관리

### 퀴즈 시스템

- 급수별 랜덤 문제 출제
- 의미 맞히기 객관식 문제
- 실시간 정답/오답 피드백
- 타이머를 통한 집중력 향상
- 퀴즈 결과 자동 저장 및 통계 제공

### 개인화 기능

- Google 계정을 통한 간편 로그인
- 퀴즈 히스토리 및 학습 통계
- 개인별 북마크 관리
- 사용자 맞춤 설정

## 기술 스택

### Frontend

- Next.js 15.3.3 (App Router, React 19)
- TypeScript
- TailwindCSS 4.1.8
- shadcn/ui

### Backend & Database

- Supabase (PostgreSQL, 인증)
- Google OAuth 연동

### 라이브러리

- Zustand (상태 관리)
- TanStack Query (데이터 페칭)
- HanziWriter (한자 애니메이션)
<!-- - Recharts (통계 차트) -->

## 프로젝트 구조

```
src/
├── app/
│   ├── api/              # API 엔드포인트
│   ├── level/            # 급수별 단어 목록
│   ├── word/             # 단어 상세 페이지
│   ├── quiz/             # 퀴즈 기능
│   └── mypage/           # 개인 페이지
├── components/
│   ├── ui/               # 재사용 UI 컴포넌트
│   ├── quiz/             # 퀴즈 관련 컴포넌트
│   ├── word/             # 단어 관련 컴포넌트
│   └── mypage/           # 마이페이지 컴포넌트
└── lib/
    └── supabase/         # 데이터베이스 연결
```

## 데이터베이스

### 주요 테이블

- **words**: HSK 단어 데이터
- **word_characters**: 한자별 상세 정보
- **quiz_attempts**: 퀴즈 시도 기록
- **quiz_responses**: 문항별 응답 데이터
- **bookmarks**: 사용자 북마크

## 설치 및 실행

### 개발 환경 설정

```bash
npm install
npm run dev
```
