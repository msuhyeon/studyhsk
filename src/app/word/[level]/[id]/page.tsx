import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import HanziWriter from '@/components/HanziWriter';

type Props = {
  params: {
    id: string;
  };
};

const WordDetail = async ({ params }: Props) => {
  const { id } = params;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('words').select('*').eq('id', id);

  if (error || !data || data.length === 0) {
    console.error(error);
    return <div>에러 발생</div>;
  }

  const word = data[0].word.split('');

  return (
    <Card className="w-full">
      <CardHeader>HSK {data[0].level}급</CardHeader>
      <CardContent className="text-center">
        <div className="flex justify-end">
          <button className="cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"sdf
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          </button>
        </div>

        <div>
          {/* <h3 className="font-semibold text-2xl">{data[0].word}</h3> */}
          <h3 className="font-semibold text-2xl ">
            {word.map((character: string, index: number) => (
              <HanziWriter character={character} key={index} />
            ))}
            {/* <HanziWriter characters={character} /> */}
          </h3>
          <span className="text-neutral-400">[{data[0].pinyin}]</span>
        </div>
        <p>{data[0].meaning}</p>
      </CardContent>
    </Card>
  );
};

export default WordDetail;
