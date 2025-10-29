import { useQuery } from '@tanstack/react-query';

async function fetchLearningProgress() {
  const res = await fetch(`/api/v2/learningProgress`);

  if (!res.ok) {
    throw new Error('학습 진행 상황을 가져오는데 실패했습니다.');
  }

  return res.json();
}

export const useLearningProgress = () => {
  return useQuery({
    queryKey: ['learningProgress'],
    queryFn: fetchLearningProgress,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });
};
