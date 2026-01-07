
export type Category = 'food' | 'spot' | 'transport' | 'chill';

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
}

export type BlockType = 'text' | 'image';

export interface CanvasBlock {
  id: string;
  type: BlockType;
  content?: string; // For text blocks
  url?: string;     // For image blocks
}

export interface Activity {
  id: string;
  time_range: string;
  title: string;
  location?: string;
  category: Category;
  vibe_color: string;
  text_color: string;
  image_url: string;
  description: string;
  user_note: string; // Kept for backward compat, but UI will prefer blocks
  blocks: CanvasBlock[]; // New: The Digital Canvas Data
  media: MediaItem[]; // Kept for backward compat
}

export interface DayItinerary {
  date: string;
  dayLabel: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  title: string;
  dates: string;
  coverUrl: string;
  vibeColor: string;
  itinerary: DayItinerary[];
}
