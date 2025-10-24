import ClientMyPage from '@/components/mypage/ClientMyPage';

// 공식 예제들이 대부분 async function을 씀. 이유는 TypeScript 타입 추론과 displayName (디버깅 시 이름) 때문에.
// const로 하면 스택트레이스에서 함수 이름이 익명으로 보이거나 최적화가 덜 되는 경우가 있었음.

const MyPage = () => {
  return (
    <div className="min-h-screen to-blue-50 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex justify-between items-end">
          <h1 className="title mb-3">마이페이지</h1>
          {/* TODO: 계정 정보 뭘 수정할지 확인 */}
          {/* <Button
            variant="outline"
            className="flex items-center space-x-2"
            asChild
          >
            <Link href="/mypage/settings">
              <Settings className="w-4 h-4" />
              <span>계정 정보 수정</span>
            </Link>
          </Button> */}
        </div>
        <ClientMyPage />
      </div>
    </div>
  );
};

export default MyPage;
