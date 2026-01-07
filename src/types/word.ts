export type WordText = {
  id: string;
  text: string;
};

export type WordData = {
  id: string;
  word: string;
  pinyin: string;
  meaning: string;
  part_of_speech: string;
  examples: ExampleType[];
  word_relations: RelationWordType[];
  is_bookmarked?: boolean;
};

export type ExampleType = {
  sentence: string;
  meaning: string;
  pinyin: string;
  context: string;
};

type RelationType = 'synonym' | 'antonym';

export type RelationWordType = {
  word: string;
  meaning: string;
  pinyin: string;
  relation_type?: RelationType;
};

export type WordDetailProps = {
  wordId: string;
  initialData: WordData;
};
