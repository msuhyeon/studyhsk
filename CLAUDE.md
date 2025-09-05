# HSKPass - Claude Code Configuration

## 프로젝트 개요

HSK 단어를 체계적으로 학습하고 반복 복습을 통해 장기 기억에 도움을 주는 웹 기반 학습 플랫폼

## 기술 스택

- **Frontend**: Next.js 15.3.3 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS 4.1.8, shadcn/ui 컴포넌트
- **Backend**: Supabase (PostgreSQL, 인증)
- **상태관리**: Zustand
- **데이터 페칭**: TanStack Query
- **특수 라이브러리**: HanziWriter (한자 애니메이션)

## 스크립트 명령어

- **개발 서버**: `npm run dev` (포트: 8080)
- **빌드**: `npm run build`
- **린트**: `npm run lint`
- **프로덕션 실행**: `npm start`

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 엔드포인트
│   ├── level/             # HSK 급수별 단어 목록
│   ├── word/              # 단어 상세 페이지
│   ├── quiz/              # 퀴즈 기능
│   └── mypage/            # 개인 페이지
├── components/
│   ├── ui/                # shadcn/ui 재사용 컴포넌트
│   ├── quiz/              # 퀴즈 관련 컴포넌트
│   ├── word/              # 단어 관련 컴포넌트
│   └── mypage/            # 마이페이지 컴포넌트
├── lib/
│   └── supabase/          # 데이터베이스 연결 설정
└── store/                 # Zustand 상태 관리
```

## 코딩 컨벤션

- TypeScript 엄격 모드 사용
- 함수형 컴포넌트와 React Hooks 사용
- shadcn/ui 컴포넌트 스타일 가이드 준수
- TailwindCSS 클래스명 사용
- ESLint 규칙 준수

## 데이터베이스 구조

- **words**: HSK 단어 데이터
- **word_characters**: 한자별 상세 정보
- **quiz_sessions**: 퀴즈 시도 기록
- **user_quiz_answers**: 문항별 응답 데이터
- **bookmarks**: 사용자 북마크

## 환경 설정

- Supabase URL 및 API 키 필요
- Google OAuth 설정 필요
- Next.js 환경변수 사용

## 주요 기능

1. HSK 1-6급 단어 학습
2. 한자 획순 애니메이션
3. 객관식 퀴즈 시스템
4. 개인별 북마크 및 학습 기록
5. Google 로그인 연동

## 작업 시 주의사항

- 코드 수정 후 반드시 `npm run lint` 실행
- shadcn/ui 컴포넌트 우선 사용
- Supabase 클라이언트는 기존 설정 재사용
- 한자 관련 기능 수정 시 HanziWriter 라이브러리 고려
