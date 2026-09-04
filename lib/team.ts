// Team data for the KingdomTradeX "one Body" page.
// Pastors are modelled as an ongoing, editable roster: add new shepherds to
// the `pastors` array and they flow into the Flock rail automatically.
// (The page also renders a dashed "+ shepherd being added" ghost card so the
// section always reads as growing, not fixed at two or three.)

// Team data for the KingdomTradeX "Constellation of the Body" page.
// Theme: "He determines the number of the stars and calls them each by name"
// (Psalm 147:4). Each member is a star; the pastors are gold stars, the
// builders are cyan stars, all connected to the Bright Morning Star.

export type Star = {
  name: string;
  role: string;
  glyph: string;
  // position on the constellation sky, in percentages (0-100)
  x: number;
  y: number;
  kind: "builder" | "pastor";
  avatar?: string;
  line?: string;
  verse?: { text: string; ref: string };
  word?: string;
  ministry?: string;
};

export const morningStar = {
  title: "The Bright Morning Star",
  verse: "I am the root and the descendant of David, the bright morning star. — Revelation 22:16",
  sub: "Every star in this sky is named, known and held. So are you.",
};

export const stars: Star[] = [
  { name: "David Okonkwo", role: "Founder & Vision", glyph: "✦", x: 20, y: 26, kind: "builder", avatar: "/avatars/david.jpg",
    line: "Builds with the conviction that wealth is a trust, not a trophy, and that technology should serve wisdom.",
    verse: { text: "For where your treasure is, there your heart will be also.", ref: "Matthew 6:21" } },
  { name: "Miriam Cohen", role: "Head of Stewardship", glyph: "❖", x: 40, y: 16, kind: "builder", avatar: "/avatars/miriam.jpg",
    line: "Keeps the platform honest, clear and faithful to every promise we make to the people who trust us.",
    verse: { text: "Moreover, it is required in stewards that one be found faithful.", ref: "1 Corinthians 4:2" } },
  { name: "James Whitfield", role: "Lead AI Engineer", glyph: "⚙", x: 62, y: 20, kind: "builder", avatar: "/avatars/james.jpg",
    line: "Designs the models that trade with discipline rather than hype, so growth is pursued with patience.",
    verse: { text: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" } },
  { name: "Grace Mensah", role: "Risk & Compliance", glyph: "⚖", x: 80, y: 30, kind: "builder", avatar: "/avatars/grace.jpg",
    line: "Guards the principal and makes sure profit is the only thing that ever leaves your pocket.",
    verse: { text: "The wise store up choice food and olive oil, but fools gulp theirs down.", ref: "Proverbs 21:20" } },
  { name: "Pastor Samuel Adeyemi", role: "Senior Chaplain", glyph: "✝", x: 30, y: 58, kind: "pastor", avatar: "/avatars/samuel.jpg",
    ministry: "Prayer & Discernment",
    word: "Covers the platform in prayer and keeps our counsel rooted in scripture rather than in profit alone." },
  { name: "Pastor Ruth Becci", role: "Teaching Pastor", glyph: "✝", x: 52, y: 66, kind: "pastor", avatar: "/avatars/ruth.jpg",
    ministry: "Stewardship & Generosity",
    word: "Reminds us that wealth is a tool for the Kingdom, not a master, and that generosity is the truest yield." },
  { name: "Pastor Daniel Kim", role: "Market Chaplain", glyph: "✝", x: 72, y: 56, kind: "pastor", avatar: "/avatars/daniel.jpg",
    ministry: "Ethics & Integrity",
    word: "Ensures every automated decision honours the dignity of the member and the quiet call to do what is right." },
];

// Editable, ongoing roster of shepherds for the Flock rail.
export const pastors: { name: string; role: string; ministry: string; glyph: string; word: string; avatar: string }[] = [
  { name: "Pastor Samuel Adeyemi", role: "Senior Chaplain", ministry: "Prayer & Discernment", glyph: "✝", avatar: "/avatars/samuel.jpg",
    word: "Covers the platform in prayer and keeps our counsel rooted in scripture rather than in profit alone." },
  { name: "Pastor Ruth Becci", role: "Teaching Pastor", ministry: "Stewardship & Generosity", glyph: "✝", avatar: "/avatars/ruth.jpg",
    word: "Reminds us that wealth is a tool for the Kingdom, not a master, and that generosity is the truest yield." },
  { name: "Pastor Daniel Kim", role: "Market Chaplain", ministry: "Ethics & Integrity", glyph: "✝", avatar: "/avatars/daniel.jpg",
    word: "Ensures every automated decision honours the dignity of the member and the quiet call to do what is right." },
];

export const scriptureWall = [
  { text: "Now you are the body of Christ, and each one of you is a part of it.", ref: "1 Corinthians 12:27", size: "lg" },
  { text: "As each has received a gift, use it to serve one another, as good stewards of God's varied grace.", ref: "1 Peter 4:10", size: "sm" },
  { text: "For we are God's fellow workers. You are God's field, God's building.", ref: "1 Corinthians 3:9", size: "sm" },
  { text: "Iron sharpens iron, and one man sharpens another.", ref: "Proverbs 27:17", size: "sm" },
  { text: "Let us consider how to stir up one another to love and good works.", ref: "Hebrews 10:24", size: "sm" },
  { text: "In Christ we, though many, form one body, and each member belongs to all the others.", ref: "Romans 12:5", size: "lg" },
];

export const ribbon = [
  "He determines the number of the stars and calls them each by name. — Psalm 147:4",
  "Now you are the body of Christ, and each one of you is a part of it. — 1 Corinthians 12:27",
  "As each has received a gift, use it to serve one another. — 1 Peter 4:10",
  "Two are better than one, because they have a good reward for their toil. — Ecclesiastes 4:9",
  "How good and pleasant it is when brothers dwell in unity! — Psalm 133:1",
];

export const orbitGlyphs = ["✦", "❖", "⚙", "⚖", "✚", "◈", "❂", "✠"];
