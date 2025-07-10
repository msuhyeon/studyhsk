# HSKPass
HSK 단어를 체계적으로 학습하고 반복 복습을 통해 장기 기억에 도움을 주는 웹 기반 학습 플랫폼입니다.


## 🚀 1단계 목표 (MVP)

### ✅ 구현 기능

- **급수별 단어 리스트 조회**
  - GNB에서 급수를 선택하여 해당 급수에 포함된 단어 리스트를 보여줍니다.
  - 각 단어는 `한자`, `병음`, `뜻`으로 구성됩니다.

- **단어 상세 페이지**
  - 단어를 구성하는 **각 한자의 의미**를 확인할 수 있습니다.
  - 표시 항목: 한자, 병음, 뜻 

- **퀴즈 기능**
  - 선택한 급수의 단어 중 랜덤하게 문제를 출제합니다.
  - 문제는 `한자`, `병음과 뜻`을 맞히는 객관식 문제입니다.
  - 정오답 여부를 실시간으로 확인할 수 있습니다.
  - 틀린 문제는 로컬에서 임시 저장 (2단계에서 DB 저장 연동 예정)

- **구글 로그인 기능**
  - Supabase OAuth를 이용한 간편 회원가입/로그인 구현

## 📅 2단계 목표 (추가 기능 개발)

- **마이페이지 & 오답 복습 기능**
  - 사용자의 퀴즈 결과를 저장하고, 날짜별로 복습할 수 있습니다.
  - 찜한 단어, 학습 통계, 정답률 등도 함께 표시됩니다.

## 🧱 데이터베이스 구조 (Supabase) 설계 중

![supabase-schema-boyeiqhgxffayaxqheds](https://github.com/user-attachments/assets/e224ce94-227e-4e86-bd1a-35eaf05b47bf)


## 🛠 기술 스택

- **Frontend**: Next.js, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **기타 도구**:
  - 한자 획순 애니메이션: HanziWriter
  - 병음 발음 재생 기능(https://pinyin-word-api.vercel.app)

