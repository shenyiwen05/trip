
import { Trip, DayItinerary } from './types';

const TOKYO_ITINERARY: DayItinerary[] = [
  {
    date: "2024-05-10",
    dayLabel: "Day 1: Arrival & Vibe",
    activities: [
      {
        id: "a1",
        time_range: "09:00 - 10:30",
        title: "Morning Brew @ Cloud",
        category: "food",
        vibe_color: "bg-orange-300",
        text_color: "text-orange-950",
        image_url: "https://picsum.photos/id/1060/800/600",
        description: "Start the trip with the famous cloud latte. The aesthetic here is pure white and wood.",
        user_note: "Must try the honey latte!",
        blocks: [
            { id: "b1", type: "text", content: "The coffee aroma hit me as soon as I walked in. ☕️" },
            { id: "b2", type: "text", content: "It's a bit pricey, but the atmosphere is unmatched." }
        ],
        media: []
      },
      {
        id: "a2",
        time_range: "11:00 - 13:00",
        title: "Modern Art Walk",
        category: "spot",
        vibe_color: "bg-sky-300",
        text_color: "text-sky-950",
        image_url: "https://picsum.photos/id/1047/800/600",
        description: "A gentle stroll through the contemporary district. Look for the blue sculpture.",
        user_note: "",
        blocks: [],
        media: []
      }
    ]
  },
  {
    date: "2024-05-11",
    dayLabel: "Day 2: City Colors",
    activities: [
      {
        id: "b1",
        time_range: "10:00 - 12:00",
        title: "Pink Park Picnic",
        category: "spot",
        vibe_color: "bg-rose-300",
        text_color: "text-rose-950",
        image_url: "https://picsum.photos/id/326/800/600",
        description: "Cherry blossoms might be late, but the vibe is eternal pink. Rent a mat nearby.",
        user_note: "",
        blocks: [
            { id: "b3", type: "text", content: "Remember to bring a portable speaker!" }
        ],
        media: []
      }
    ]
  }
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'tokyo',
    title: 'Tokyo Trip',
    dates: 'May 10 - May 12',
    coverUrl: 'https://picsum.photos/id/1060/800/600',
    vibeColor: 'bg-rose-200',
    itinerary: TOKYO_ITINERARY
  },
  {
    id: 'shanghai',
    title: 'Shanghai Weekend',
    dates: 'Jun 05 - Jun 07',
    coverUrl: 'https://picsum.photos/id/1047/800/600',
    vibeColor: 'bg-sky-200',
    itinerary: []
  }
];
