export interface DeckInterface {
  id: number;
  title: string;
  created_at: string;
  cards?: { count: number }[];
  deck_likes?: { count: number }[];
}

export interface CardInterface {
  front: string;
  back: string;
}
