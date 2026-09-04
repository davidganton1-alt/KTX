export type Verse = { text: string; ref: string };

export const VERSES: Verse[] = [
  { text: "For where your treasure is, there your heart will be also.", ref: "Matthew 6:21" },
  { text: "The Lord gives wisdom; from his mouth come knowledge and understanding.", ref: "Proverbs 2:6" },
  { text: "Be faithful with the little things, and you will be trusted with much.", ref: "Luke 16:10" },
  { text: "Honour the Lord with your wealth, with the firstfruits of all your crops.", ref: "Proverbs 3:9" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  { text: "The wise store up choice food and olive oil, but fools gulp theirs down.", ref: "Proverbs 21:20" },
  { text: "Do not be deceived: God cannot be mocked. A man reaps what he sows.", ref: "Galatians 6:7" },
  { text: "A good person leaves an inheritance for their children's children.", ref: "Proverbs 13:22" },
  { text: "In all your ways submit to him, and he will make your paths straight.", ref: "Proverbs 3:6" },
  { text: "The blessing of the Lord brings wealth, without painful toil for it.", ref: "Proverbs 10:22" },
  { text: "Stewards of the manifold grace of God.", ref: "1 Peter 4:10" },
  { text: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" },
];

export function verseOfTheDay(): Verse {
  const day = Math.floor(Date.now() / 86400000);
  return VERSES[day % VERSES.length];
}

export function randomVerse(): Verse {
  return VERSES[Math.floor(Math.random() * VERSES.length)];
}
