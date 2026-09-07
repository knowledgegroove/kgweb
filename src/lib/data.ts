export const site = {
  name: "Knowledge Groove",
  founder: "Ishaan Garg",
  tagline: "Where curiosity meets insight.",
  email: "ishaangarg2705@gmail.com",
  spotifyShow: "https://open.spotify.com/show/5GgvbJT6WznJCmIX6OeEGy",
};

export type Episode = {
  title: string;
  description: string;
  date: string;
  duration: string;
};

export const episodes: Episode[] = [
  {
    title: "Singapore's Economic Miracle Explained",
    description:
      "In 1965, Singapore was a small nation with no natural resources and an uncertain future. Today it's one of the richest, most advanced countries on Earth. We trace the reforms that made it happen.",
    date: "Aug 17",
    duration: "12 min 54 sec",
  },
  {
    title: "The European Union Explained: War to Unity",
    description:
      "After World War II, Europe lay in ruins. This episode explores how visionary leaders turned devastation into unity — from the Schuman Plan to the euro.",
    date: "Nov 26, 2025",
    duration: "7 min 45 sec",
  },
  {
    title: "The Rise of NVIDIA: From Graphics to the World's Most Valuable Company",
    description:
      "Once a Silicon Valley startup with $40,000 in capital, NVIDIA became the backbone of the AI era. The bold risks and innovations behind its rise.",
    date: "Sep 27, 2025",
    duration: "7 min 22 sec",
  },
  {
    title: "The U.S. Interstate System: America's Most Powerful Infrastructure",
    description:
      "From a flawed 1919 Army convoy to Eisenhower's Cold War vision — how the interstate highway system reshaped travel, commerce, and communities.",
    date: "Aug 23, 2025",
    duration: "7 min 8 sec",
  },
  {
    title: "The Vietnam War Explained: Politics, Protest, and Power",
    description:
      "Our 50th episode. A Cold War effort to stop communism became one of history's most divisive conflicts — its roots, realities, and consequences.",
    date: "Aug 4, 2025",
    duration: "7 min 5 sec",
  },
  {
    title: "The Great Fire of London: Flames That Changed Everything",
    description:
      "In 1666, a small spark in a London bakery ignited one of the most devastating fires in the city's history — and reshaped it for good.",
    date: "Jul 4, 2025",
    duration: "3 min 53 sec",
  },
];

export type Workshop = {
  title: string;
  summary: string;
  points: string[];
  icon: "brain" | "chat";
};

export const workshops: Workshop[] = [
  {
    title: "AI Workshops",
    summary:
      "Hands-on sessions that demystify artificial intelligence — from how large language models actually work to using AI tools responsibly and effectively.",
    points: [
      "Core AI & machine learning concepts, explained simply",
      "Live, hands-on practice with real AI tools",
      "Responsible and effective use of AI in school and life",
    ],
    icon: "brain",
  },
  {
    title: "English Proficiency Workshops",
    summary:
      "Practical workshops focused on building confident communication — reading, writing, and speaking skills that translate directly to the classroom and beyond.",
    points: [
      "Structured reading comprehension and vocabulary building",
      "Writing clarity: essays, summaries, and everyday communication",
      "Speaking confidence through guided practice",
    ],
    icon: "chat",
  },
];

export type Project = {
  name: string;
  description: string;
  tags: string[];
  /** Live site or repo link — omit until a real URL is available. */
  href?: string;
};

export const projects: Project[] = [
  {
    name: "Stock Market Analyzer",
    description:
      "A tool for exploring and analyzing stock market data — surfacing trends and metrics to help make sense of market movement at a glance.",
    tags: ["Finance", "Data Analysis"],
  },
  {
    name: "Home Analyzer",
    description:
      "An analyzer built to break down home and property data, helping compare listings and understand value with clearer, structured insight.",
    tags: ["Real Estate", "Data Tools"],
  },
];

export const about = {
  school: "Dougherty Valley High School",
  interests: ["Tennis", "Math", "Physics", "Community Service"],
  bio: "Ishaan Garg is a high schooler at Dougherty Valley High School and the founder of Knowledge Groove. Outside of building, he plays competitive tennis and is drawn to the logic of math and physics — the same instinct for finding the underlying pattern that shapes how he approaches every project. He's also active in serving his local community, which is part of why Knowledge Groove exists: to make useful knowledge more accessible to the people around him.",
};
