/**
 * UNDERDOG CITY — shared canon data layer.
 *
 * Every string in this file is sourced from docs/underdog-city-brief.md and
 * docs/songbook/*.txt. Those files are the absolute source of truth; do not
 * invent copy here. Surfaces import from this module instead of re-typing
 * lore so the canon stays consistent across all five experiences.
 */

export const BRAND = {
  artist: "Underdog City",
  album: "Throne at the Bottom",
  label: "Cenotaph Records",
  releaseDateISO: "2026-07-31T00:00:00-04:00",
  releaseDateDisplay: "07.31.2026",
  fanCommunity: "The Underdogs",
  manifesto:
    "We all rule down here. There's only one rule in Underdog City: turn that shit up loud.",
  emailHook: "Now Accepting Tenants in Underdog City.",
  taglines: [
    "We all rule down here.",
    "Now accepting tenants.",
    "Throne at the bottom.",
  ],
  thesis:
    "The world throws people away. Down here, the broken discover that broken things hold the most power — and build a kingdom out of everything that was discarded.",
} as const;

export const WORLD = {
  halo: {
    name: "THE HALO",
    description:
      "Gleaming elite ring above. Run by the Sainted, who decide who has worth. Cold, self-righteous, redemption-as-product.",
  },
  city: {
    name: "UNDERDOG CITY",
    description:
      "The sprawl below where the Dropped land. Grimy, surreal, neon-and-garbage. Misfit-run districts.",
  },
  drop: {
    name: "THE DROP",
    description: "When the Halo deems you worthless, you're cast down.",
  },
  kintsugi: {
    name: "KINTSUGI",
    rule: "Hit absolute bottom + survive the break → gold runs through the fracture → you gild: a power tied to the exact wound that broke you. Your damage is your weapon.",
    cost: "Each use spreads the gold; burn out and you shatter (death) or go hollow and ascend — becoming a husk the Halo reclaims as one of the Sainted. Salvation is the real horror.",
    visual:
      "Cracked skin lit with molten gold; crown motif on those who've accepted their fracture.",
  },
} as const;

export interface Track {
  n: number;
  title: string;
  slug: string;
  role: string;
  hook: string;
  /** Style descriptors from the songbook STYLE box, verbatim. */
  style: string;
  /** A short set of verbatim lyric lines chosen for display. */
  lines: string[];
  /** Approx BPM when the style box states one. */
  bpm?: number;
}

export const TRACKS: Track[] = [
  {
    n: 1,
    title: "Villain",
    slug: "villain",
    role: "Accept-the-villain-role anthem.",
    hook: "You want a monster? I'll sit for the portrait… I'm the villain in your story.",
    style:
      "nu metal, rap rock, aggressive hip-hop beats, distorted guitars, turntable scratches, fast rap vocals, soaring shouted chorus, low-fi bridge, halftime breakdown, explosive drum fills, syncopated riff stabs, sidechain punch, gated reverb snare, crowd chant hooks, villain energy, high energy, dramatic escalation, call-and-response gang vocals",
    lines: [
      "You want a monster? I'll sit for the portrait,",
      "I'm the villain in your story, hope it brings you glory!",
      "Took the crown of thorns and I turned it into gold!",
      "Yeah, I'm the bad guy, and it's a better view!",
      "Villain era started. Don't look back",
    ],
  },
  {
    n: 2,
    title: "Down Here",
    slug: "down-here",
    role: "The Underdog City anthem.",
    hook: "You call it rock bottom / I call it a throne.",
    style:
      "nu metal, rap metal, 140 BPM, snarled baritone lead, gang chant hooks, drop C seven-string riffs, palm-muted chugs, 808 sub drops, turntable scratches, clipped snare, tight low end, half-time breakdown, anthem lift, confrontational swagger, vinyl crackle, mono verse, wide chorus, saturated bass, snare crack, spoken bridge",
    lines: [
      "You think I'm sinking, but I learned to breathe down here",
      "You call it rock bottom / I call it a view",
      "I'm the king of this dirt and the dirt here stays",
      "I dug the grave you wished on me / and put a throne in it instead",
      "You came down here to bury me / You should've brought a bigger shovel",
    ],
    bpm: 140,
  },
  {
    n: 3,
    title: "Who TF",
    slug: "who-tf",
    role: "Territorial defiance banger.",
    hook: "I built this house with my own two hands.",
    style:
      "nu metal, rap metal, 142 BPM, shouted male vocals, gang chant hooks, downtuned seven-string riffs, pinch harmonic chugs, turntable scratches, 808 sub layer, punchy kick snare, parallel compression, clipped guitar bus, arena plate reverb, stereo delay throws, half-time breakdown, aggressive chorus lift",
    lines: [
      "I built this house with my own two hands",
      "Who the fuck you think you talkin' to?",
      "This is my time now / There's nothin' left for me to lose",
      "I built this shit on my own / So fuck outta my face",
    ],
    bpm: 142,
  },
  {
    n: 4,
    title: "Chaos",
    slug: "chaos",
    role: "Embracing the storm.",
    hook: "I thrive in the chaos, the doubt, the sink or swim.",
    style:
      "Dark Sensual Alternative R&B-Metal, Slow-Burning Seductive Groove, Downtuned Guitars Over Smooth Atmospheric Production, Trip-Hop Drums, Deep Sub Bass, Breathy Intimate Male Verses Building To A Hypnotic Belted Chorus, Layered Harmonies, Sinful Brooding And Cinematic",
    lines: [
      "In my hell I find the freedom, in the sin I find the Eden.",
      "What you call a breakdown is the only way I'm breathing.",
      "I THRIVE IN THE CHAOS, THE DOUBT, THE SINK OR SWIM —",
      "gave the storm a place to live / and built a throne on shaking ground",
      "YOU CALL IT A MESS — I CALL IT A THRONE —",
    ],
  },
  {
    n: 5,
    title: "Stupid Little Bitch",
    slug: "stupid-little-bitch",
    role: "Toxic-ex kiss-off banger.",
    hook: "She said I was a narcissist, I said that was rich.",
    style:
      "rap metal, nu metal, baritone snarled lead, gang chant backing vocals, clean sung pre chorus, bass led hook, drop C guitars, palm muted chugs, clipped snare, 808 sub drops, distorted guitar riff, tight low end, half time groove, angry catharsis, confrontational swagger",
    lines: [
      "She said I was a narcissist, I said that was rich",
      "Never thought I could ever hate someone / But then I met you",
    ],
  },
  {
    n: 6,
    title: "Lights Go Low",
    slug: "lights-go-low",
    role: "Seductive counter-gospel.",
    hook: "We're all sinners when the lights go low.",
    style:
      "Dark sensual alternative R&B-metal, slow-burning seductive groove, downtuned guitars over smooth atmospheric production, trip-hop drums, deep sub bass, breathy intimate male verses building to a hypnotic belted chorus, layered harmonies, sinful brooding and cinematic",
    lines: [
      "You came down here with your hands still clean",
      "We're all sinners when the lights go low",
      "Lay your halo down, let your shadow show",
      "Heaven's overrated / Halos never fit",
      "We were always made for the beautiful and the bottomless —",
    ],
  },
  {
    n: 7,
    title: "No Saints",
    slug: "no-saints",
    role: "Rejection-of-salvation anthem.",
    hook: "No saints, no savior, no grave.",
    style:
      "Nu-metal, rap-metal, mid-tempo aggressive, downtuned chugging guitars, heavy syncopated drums, deep bass, rapped/spoken male verses with anthemic clean chant chorus, gang vocals and group chants, polished modern production, arena energy, dark and cathartic",
    lines: [
      "They sent a preacher to the gutter where I sleep",
      "Told me grace is free but redemption ain't cheap",
      "I made a home inside the flame —",
      "No saints, no savior, no grave",
      "They want a martyr, I'ma give 'em a crown",
    ],
  },
  {
    n: 8,
    title: "Upbeat Gospel",
    slug: "upbeat-gospel",
    role: "Spinning pain into performance — bright hook over dark lyric.",
    hook: "I am spinning the pain into an upbeat gospel.",
    style:
      "mid-tempo, 2000s alternative metal, melodic metalcore, nu-metal, post-grunge, heavy distorted riffs, scratchy male vocals, soaring clean chorus, atmospheric synths, dramatic, catchy, angst",
    lines: [
      "I am dancing on the basement floor",
      "I am spinning the pain into an upbeat gospel",
      "Make it a rhythm. Make it a habit. Make it a symptom.",
      "Are you entertained by the way I spin?",
      "I carved out my chest just to give you the drumbeat.",
    ],
  },
  {
    n: 9,
    title: "The Old Song",
    slug: "the-old-song",
    role: "Trap-metal rage; the lone outsider.",
    hook: "The sun won't rise in the land of the unwritten.",
    style:
      "Aggressive Trap-Metal, Rage Beat, Distorted 808s, Downtuned Guitar Riffs, Industrial Hi-Hats, Half-Time Breakdowns, Reverberant Shouted-To-Melodic Vocals, Dark Menacing And Cinematic",
    lines: [
      "A long road ahead of me / No friends with me",
      "Under a single streetlight where I want the world to remember me",
      "The enemy's the best friend that's ever been to me",
      "The sun won't rise in the land of the unwritten",
    ],
  },
  {
    n: 10,
    title: "The Truth",
    slug: "the-truth",
    role: "The confession/lie thread.",
    hook: "The truth nails me to the floor… a white lie might be the only way to set me free.",
    style:
      "nu metal, rap metal, spoken intro, baritone lead vocals, gang chant chorus, distorted drop-tuned guitars, fuzz bass, sub-bass punch, turntable scratches, glitch percussion, compressed drums, gated snare, tape saturation, plate reverb, stereo widening, mid-tempo groove, halftime breakdown, claustrophobic dread, anthemic hook",
    lines: [
      "They say the truth will set you free / But it won't help me",
      "The truth / It nails me to the floor",
      "A white lie / Might be the only way to set me free",
      "I guess I can't be honest anymore",
    ],
  },
  {
    n: 11,
    title: "Parasitic Love",
    slug: "parasitic-love",
    role: "Toxic-devotion R&B-metal.",
    hook: "You keep me / but you let me die.",
    style:
      "Dark Sensual Alternative R&B-Metal, Slow-Burning Seductive Groove, Downtuned Guitars Over Smooth Atmospheric Production, Trip-Hop Drums, Deep Sub Bass, Breathy Intimate Male Verses Building To A Hypnotic Belted Chorus, Layered Harmonies, Haunting And Cinematic",
    lines: [
      "You're a parasite / With your empty eyes",
      "You consume me / You drain me dry",
      "You keep me / But you let me die",
      "Parasitic love / All-consuming",
    ],
  },
  {
    n: 12,
    title: "Came Back Wrong",
    slug: "came-back-wrong",
    role: "The origin — death at the bottom and the return.",
    hook: "Say hello to what's left.",
    style:
      "2000s alternative metal, melodic metalcore, nu metal, post-grunge, 142 BPM, heavy distorted drop-tuned riffs, palm-muted chugs, scratchy baritone lead, soaring catchy clean chorus, gang chant shouts, atmospheric synth pads, 808 sub, half-time breakdown, dramatic, catchy, angsty, cathartic",
    lines: [
      "Six feet of silence — I learned every inch of it",
      "The dirt spit me back out / And I came back alone",
      "I came back wrong / Not the one you put away",
      "You said goodbye to who I was — / Say hello to what's left",
      "You don't get to bury what won't stay down",
    ],
    bpm: 142,
  },
  {
    n: 13,
    title: "Throne At The Bottom",
    slug: "throne-at-the-bottom",
    role: "Title track.",
    hook: "King of the orphans… I got a throne at the bottom and I'm sittin' on top of it.",
    style:
      "nu metal, rap metal, 92 BPM, distorted bass melody, drop tuned rhythm guitars, turntable scratches, gang chant hooks, projected male rap vocals, harmonized chorus leads, half-time snare, sub-bass layer, parallel compression, saturated drum bus, megaphone ad libs, anthemic defiance, dark swagger",
    lines: [
      "In a world where kings and queens / They rule from their coffins",
      "I'm a bottom feeder / King of the orphans",
      "I got a throne at the bottom / And I'm sittin' on top of it",
      "Long live the underdog",
    ],
    bpm: 92,
  },
  {
    n: 14,
    title: "Apathy vs. Agony",
    slug: "apathy-vs-agony",
    role: "Numbness vs. pain.",
    hook: "At least I still feel hurt.",
    style:
      "alternative metal, melodic metalcore, 142 BPM, drop-tuned seven-string riffs, palm-muted chugs, scratchy baritone lead, soaring clean chorus, gang chant shouts, atmospheric synth pads, 808 sub-bass, sidechain compression, plate reverb, bright major chorus, half-time breakdown, syncopated stop-start riffs, cathartic angst, dark lyric / bright hook",
    lines: [
      "I guess it could be worse",
      "At least I still feel hurt",
      "One day I won't feel a thing / No high, no low, just quiet",
      "And that's the part that scares me / So I'll take it",
    ],
    bpm: 142,
  },
];

/**
 * The locked Season-1 prologue, verbatim from the brief (Appendix A).
 * Paragraph array preserves the original breaks for staged rendering.
 */
export const PROLOGUE: string[] = [
  "I've got maybe a minute of blood left in me, and I'm going to waste it on a lie.",
  '"Run," I tell her. "I\'m fine. Go."',
  "I'm not fine. I'm flat on my back in a service corridor sixty levels under the Halo, and the warmth spreading beneath me is the last warm thing I'm ever going to feel. We both know it. But she doesn't move — she never does what she's told — so I say it again, uglier this time, because ugly is the only thing that's ever made her listen.",
  '"Go. Before the bell stops ringing."',
  "High above us, muffled through a mile of steel and money, the Halo is ringing its victory bell. Clean. Bright. The sound they make when they've decided a problem's been solved. Right now, somewhere up there in all that light, a man with very clean boots is being handed a medal for what he just did to me. By morning the whole city will have the story. The monster crawled up out of the dark. The hero put it down. Sleep well.",
  "The man with the clean boots is already gone. He didn't even stay to watch me fall. That's the part that should make me angry, and it does — but anger costs blood, and I'm running low.",
  "She's crying. She's got both hands pressed to the hole in me like she can keep the life inside with her fingers. She can't. She knows she can't. She's doing it anyway. That's her whole problem, right there. That's exactly why I'd do it again.",
  '"Listen to me." My voice is going wrong now — thick, far away, like it belongs to someone in the next room. "They think you died down here too. Keep it that way."',
  "She says my name. I feel it more than hear it. It lands somewhere in my chest and cracks straight down the middle.",
  "I made her a promise once. I can't remember the words anymore, only the weight of them, only the look on her face when I said them. I told her that whatever they turned me into — whatever the world saw when it looked at me — I would never be the monster she could see.",
  "I'm about to break that promise. I can feel it coming the way you feel a storm in your teeth.",
  "She takes my hand. Presses something into it — small, hard, warm from her grip — and folds my fingers shut around it like a secret she's trusting me to keep alive when she can't. I try to look at it. My eyes won't go where I send them.",
  '"Hold on," she whispers. "Please. Just hold on."',
  "I want to. God help me, I want to.",
  "The cold comes up through the warm. The corridor lights slide from gold to white to gone. The last thing left in the world is her face, and even that's pulling away from me now, the edges blurring, the name behind it dissolving like a word said too many times—",
  "—and then there's nothing.",
  "And the nothing is almost a mercy.",
  "So that's it, I think. That's dying. Smaller than I expected.",
  "I'm wrong.",
  "Here's what nobody tells you about the bottom: it isn't the end of the fall. It's just the floor of the place they're allowed to throw you. And some of what lands down there doesn't have the decency to stay dead.",
  "Something moves behind my ribs. Something that wasn't there a minute ago.",
  "Something gold. And patient. And very, very angry.",
  "I don't remember my name. I don't remember her face — only that there was a her, that she mattered more than my own life did, that I spent the last of myself trying to keep her breathing. I don't remember the promise. My hand is open and empty and I can't remember what was in it, only that losing it hurts worse than the dying did.",
  "But I remember the bell.",
  "I remember the clean, bright sound of a whole city celebrating the hero who murdered me.",
  "My eyes open in the dark.",
  "Fine.",
  "They want a monster?",
  "I'll be the best one they ever made.",
];

/** Milliseconds until release; negative once the album is out. */
export function msUntilRelease(now: number): number {
  return new Date(BRAND.releaseDateISO).getTime() - now;
}

/** Real outbound links supplied by the artist. Never invent entries here. */
export const LINKS = {
  /** DistroKid HyperFollow — presave / notify for the album. */
  presave: "https://distrokid.com/hyperfollow/underdogcity/throne-at-the-bottom/",
} as const;

export const SOCIALS = [
  { name: "YouTube", handle: "@underdogcity", url: "https://youtube.com/@underdogcity" },
  { name: "TikTok", handle: "@underdog.city", url: "https://www.tiktok.com/@underdog.city" },
  {
    name: "Instagram",
    handle: "@underdogcitymusic",
    url: "https://www.instagram.com/underdogcitymusic",
  },
  {
    name: "Facebook",
    handle: "Underdog City",
    url: "https://www.facebook.com/share/19KPHvgWcZ/",
  },
] as const;

/**
 * Authored one-line arc tie-ins connecting each track to the story world.
 * Derived from each track's canon role/hook/lyrics + the brief's beats —
 * creative connective tissue, not new lore.
 */
export const TRACK_ARCS: Record<string, string> = {
  villain:
    "The acceptance. The city already wrote him down as the monster — this is him sitting for the portrait.",
  "down-here":
    "The anthem of the sprawl. Rock bottom renamed as a throne, by the Dropped who learned to breathe there.",
  "who-tf":
    "Territory. A house built with two hands out of everything the Halo threw away — and defended.",
  chaos:
    "The storm given a place to live. What the Halo calls a breakdown is how the bottom breathes.",
  "stupid-little-bitch":
    "A kiss-off from the wreckage — the rage that outlives a love that wanted you buried.",
  "lights-go-low":
    "The counter-gospel. Someone comes down from the Halo with clean hands, and the dark makes its offer.",
  "no-saints":
    "Salvation refused. The Sainted send a preacher to the gutter; the gutter sends him home.",
  "upbeat-gospel":
    "Pain spun into performance — throwing a party in the wreckage so the shadows have something to watch.",
  "the-old-song":
    "The lone outsider under a single streetlight, at war with the thoughts that never get along.",
  "the-truth":
    "The confession thread. The truth nails him to the floor — and a white lie might be the only way out.",
  "parasitic-love":
    "Toxic devotion — kept alive and left to die by the same hands.",
  "came-back-wrong":
    "The origin. Chapter Zero — death at the bottom, and what climbed back out of it.",
  "throne-at-the-bottom":
    "The claim. King of the orphans, landlord of the discarded — a throne built exactly where they threw him.",
  "apathy-vs-agony":
    "The cost. Numbness is the real enemy down here; the hurt is proof he still feels.",
};

export interface Chapter {
  n: number;
  title: string;
  slug: string;
  status: "live" | "forthcoming";
  /** Chapter 0's teaser is its verbatim opening line; forthcoming teasers are spoiler-safe summaries of documented beats. */
  teaser: string;
  /** Track that scores this chapter, when the tie is canon-strong. */
  trackSlug?: string;
}

/**
 * The Serial. Chapter 0 is the locked prologue (PROLOGUE above), live now.
 * Forthcoming chapters are seeded from the brief's documented story beats —
 * no dates are promised until real ones exist.
 */
export const CHAPTERS: Chapter[] = [
  {
    n: 0,
    title: "Came Back Wrong",
    slug: "came-back-wrong",
    status: "live",
    teaser:
      "I've got maybe a minute of blood left in me, and I'm going to waste it on a lie.",
    trackSlug: "came-back-wrong",
  },
  {
    n: 1,
    title: "The Bell",
    slug: "the-bell",
    status: "forthcoming",
    teaser:
      "High above the sprawl, the Halo rings its victory bell — clean, bright, and celebrating the wrong man.",
    trackSlug: "villain",
  },
  {
    n: 2,
    title: "Now Accepting Tenants",
    slug: "now-accepting-tenants",
    status: "forthcoming",
    teaser:
      "The landlord-king of misfits opens his doors: the unwanted get a home, a crown, and exactly one rule.",
    trackSlug: "throne-at-the-bottom",
  },
  {
    n: 3,
    title: "The Empty Hand",
    slug: "the-empty-hand",
    status: "forthcoming",
    teaser:
      "Something was pressed into his hand before the dark took him. It mattered more than dying. It's gone.",
    trackSlug: "the-truth",
  },
  {
    n: 4,
    title: "The Thread",
    slug: "the-thread",
    status: "forthcoming",
    teaser:
      "Down from the Halo, not a true believer — she was handed the villain's story and told to believe it. She keeps pulling at the one thread that doesn't fit.",
    trackSlug: "lights-go-low",
  },
  {
    n: 5,
    title: "The Unmasking",
    slug: "the-unmasking",
    status: "forthcoming",
    teaser:
      "A mask comes off — not as proof of innocence, but as an act of trust with no safety net.",
    trackSlug: "apathy-vs-agony",
  },
];
