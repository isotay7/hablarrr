// The "Fe" path: men of the Bible, one at a time, in Bible order.
//
// Only references live here. The scripture itself (World English Bible and
// Reina-Valera 1909, both public domain) is pulled verbatim into texts.json by
// scripts/faith-texts.ts, so nothing is typed from memory. Never paste text
// from copyrighted translations (RVR1960, NVI, NIV, ESV…).
//
// Refs look like "GEN 2:7-8,15-17" or "GEN 45:3-5; 50:19-21" (one book per ref).

export interface FaithVerse {
  ref: string;
  /** Part of the Spanish verse to keep, when the whole verse is long. Must appear in it exactly. */
  es?: string;
  /** Matching part of the English verse. */
  en?: string;
  /** Plain modern Spanish, when the 1909 wording is old. Written for this app. */
  simple?: string;
}

export interface FaithDay {
  title: string;
  read: string;
  /** 4–6 short, factual sentences. No sermon. */
  facts: string[];
  question: string;
  verse?: FaithVerse;
}

export interface FaithRecap {
  timeline: string[];
  strengths: string[];
  failures: string[];
  verse: FaithVerse;
}

export interface Man {
  id: string;
  name: string;
  /** Spanish name, for the badge. */
  es: string;
  /** Rough period, shown on the timeline. */
  era: string;
  days: FaithDay[];
  recap: FaithRecap;
}

export const MEN: Man[] = [
  {
    id: "adan",
    name: "Adam",
    es: "Adán",
    era: "The beginning",
    days: [
      {
        title: "Formed from the dust",
        read: "GEN 2:7-8,15-17",
        facts: [
          "Genesis tells creation twice: chapter 1 is the wide view, and chapter 2 zooms in on the first man.",
          "In Hebrew, adam means “human,” and it sounds like adamah, “ground.” His name ties him to the soil he was made from.",
          "Before there was a wife, a sin, or a failure, God gave Adam a job: to cultivate and keep the garden. Work is part of the design, not a punishment.",
          "The Hebrew word for “keep” (shamar) also means to guard or protect.",
          "He was also given one clear limit. The command came before Eve was formed, so she most likely heard it from him.",
        ],
        question: "Why do you think God gave the man work and a limit before giving him anything else?",
        verse: {
          ref: "GEN 2:15",
          simple: "Dios puso al hombre en el jardín de Edén para que lo trabajara y lo cuidara.",
        },
      },
      {
        title: "The first failure",
        read: "GEN 3:6-12",
        facts: [
          "The serpent spoke to Eve, but verse 6 says her husband was “with her.” Adam was there the whole time.",
          "He said nothing, and he ate when she handed him the fruit.",
          "Their first reactions were shame and hiding: fig leaves, then hiding among the trees.",
          "God’s question “Where are you?” isn’t a request for information. It invites Adam to step out and answer for himself.",
          "Adam blamed the woman, and even God: “The woman whom you gave to be with me.”",
          "Character: passive when it mattered most, then quick to shift the blame.",
        ],
        question: "What is the difference between Adam’s silence in verse 6 and his words in verse 12?",
        verse: {
          ref: "GEN 3:9",
          simple: "Dios llamó al hombre y le preguntó: ¿Dónde estás?",
        },
      },
      {
        title: "Consequences and mercy",
        read: "GEN 3:17-21",
        facts: [
          "The ground is cursed, but work stays. Now it comes with sweat, thorns, and frustration.",
          "“You are dust, and you shall return to dust” echoes how he was made in chapter 2.",
          "Right after the judgment, Adam names his wife Eve, which sounds like the Hebrew word for “life.” It is a statement of hope that life would go on.",
          "God himself made garments of skin and clothed them, replacing their fig leaves.",
          "Adam lived 930 years (Genesis 5:5). Through his son Seth runs the family line to Noah.",
        ],
        question: "What does it show about God that he clothed them right after announcing the consequences?",
        verse: {
          ref: "GEN 3:21",
          simple: "Dios hizo ropa de pieles para Adán y su esposa, y los vistió.",
        },
      },
    ],
    recap: {
      timeline: [
        "Formed from the dust and placed in Eden (Genesis 2)",
        "Given work, one command, and the job of naming the animals",
        "Ate the forbidden fruit with Eve (Genesis 3)",
        "Sent out of the garden",
        "Father of Cain, Abel, and Seth",
        "Died at 930 (Genesis 5:5)",
      ],
      strengths: [
        "Trusted with real responsibility from the start",
        "Named his wife “life” in hope, right after the fall",
      ],
      failures: ["Stayed silent while his wife was deceived", "Blamed her, and God, instead of owning it"],
      verse: { ref: "GEN 2:15" },
    },
  },
  {
    id: "noe",
    name: "Noah",
    es: "Noé",
    era: "The ancient world",
    days: [
      {
        title: "Righteous in a violent world",
        read: "GEN 6:8-9,11-14,22",
        facts: [
          "Genesis says the earth was “filled with violence.” The problem wasn’t only private sin but how people treated each other.",
          "Noah is called righteous and blameless “among the people of his time.” Measured against his generation, he stood out.",
          "“Noah walked with God” is the same phrase used of Enoch, his great-grandfather (Genesis 5:24).",
          "The ark was about 450 feet long, 75 wide, and 45 high: a box built to float, not a ship built to sail.",
          "Verse 22 says he did everything God commanded. It was a long project, built before any rain fell.",
        ],
        question: "What does it take to keep doing the right thing for years when almost no one around you is?",
        verse: { ref: "GEN 6:22", simple: "Noé hizo todo lo que Dios le mandó." },
      },
      {
        title: "The altar and the rainbow",
        read: "GEN 8:18-22; 9:12-13",
        facts: [
          "Noah and his family were in the ark for about a year (Genesis 7:11 to 8:14).",
          "His first act on dry ground was to build an altar and worship, before he built anything for himself.",
          "God promised never again to destroy all life with a flood, while saying plainly that the human heart is still “evil from his youth.”",
          "The rainbow is the sign of the covenant. The promise is made with every living creature, not just with Noah.",
          "The Hebrew word for rainbow is the same word as a warrior’s bow. Some readers see God hanging up his weapon.",
        ],
        question: "Why would God make a promise like this knowing people hadn’t changed?",
        verse: {
          ref: "GEN 9:13",
          simple: "Pongo mi arcoíris en las nubes como señal de mi promesa con la tierra.",
        },
      },
      {
        title: "The fall after the flood",
        read: "GEN 9:20-24",
        facts: [
          "After the flood, Noah became a farmer and planted the first vineyard mentioned in the Bible.",
          "He got drunk and lay uncovered in his tent.",
          "His son Ham saw him and told his brothers. Shem and Japheth walked in backward with a garment to cover their father without looking.",
          "The Bible records this plainly: the man who came through the flood fell in his own home.",
          "The curse that follows falls on Canaan, Ham’s son. It was later misused to justify slavery, but the text says nothing about skin color.",
        ],
        question: "Why do you think the Bible tells this story right after Noah’s greatest moment?",
      },
    ],
    recap: {
      timeline: [
        "Born ten generations after Adam (Genesis 5)",
        "Found favor with God in a violent age (Genesis 6:8)",
        "Built the ark and brought his family of eight through the flood",
        "Built an altar; received the rainbow covenant",
        "Planted a vineyard and got drunk",
        "Died at 950 (Genesis 9:29)",
      ],
      strengths: ["Obedience over a long, unseen project", "Worship came first after the rescue"],
      failures: ["Drunkenness that shamed him in front of his sons"],
      verse: { ref: "GEN 6:22" },
    },
  },
  {
    id: "abraham",
    name: "Abraham",
    es: "Abraham",
    era: "About 2000 BC",
    days: [
      {
        title: "Go",
        read: "GEN 12:1-5",
        facts: [
          "Abram came from Ur, a major city in southern Mesopotamia, and was living in Haran when the call came.",
          "He was 75 years old.",
          "Leaving your father’s household in that world meant leaving protection, inheritance, and identity.",
          "The promise had three parts: land, descendants, and a blessing for “all the families of the earth.”",
          "He went without knowing where he was going (Hebrews 11:8).",
        ],
        question: "Why is leaving the familiar so hard, even when the call is clear?",
        verse: {
          ref: "GEN 12:2",
          simple: "Haré de ti una gran nación. Te bendeciré, haré famoso tu nombre y serás una bendición.",
        },
      },
      {
        title: "The lie in Egypt",
        read: "GEN 12:10-13,17-19",
        facts: [
          "A famine drove Abram to Egypt, right after the great promise.",
          "Afraid he would be killed over his beautiful wife, he told Sarai to say she was his sister.",
          "It was a half-truth: she was his half-sister (Genesis 20:12). It still put her in danger.",
          "Pharaoh took Sarai into his house, and Abram grew rich from it.",
          "A pagan king ended up rebuking the man of faith. Abram later told the same lie again (Genesis 20).",
        ],
        question: "Why do you think fear made a man of faith protect himself at his wife’s expense?",
      },
      {
        title: "He believed",
        read: "GEN 15:1-6",
        facts: [
          "Years had passed with no child.",
          "Abram raised it honestly: his heir would be a servant, Eliezer of Damascus. That was a known legal arrangement for childless men at the time.",
          "God took him outside to look at the stars.",
          "Verse 6 is one of the most quoted lines in the New Testament (Romans 4:3, Galatians 3:6, James 2:23).",
          "He was counted righteous for trusting God, before any law and before circumcision. His honest question was not treated as unbelief.",
        ],
        question: "Is there a difference between doubting God and bringing him an honest question?",
        verse: { ref: "GEN 15:6", simple: "Abram le creyó a Dios, y Dios lo consideró justo." },
      },
      {
        title: "Hagar",
        read: "GEN 16:1-6",
        facts: [
          "After ten years in Canaan with no child, Sarai offered her Egyptian servant Hagar. Ancient contracts show this was a known custom.",
          "“Abram listened to the voice of Sarai” echoes Adam in Genesis 3:17.",
          "When conflict came, Abram stepped back: “Behold, your maid is in your hand. Do to her whatever is good in your eyes.”",
          "Hagar was mistreated and fled. God met her in the wilderness, and she called him “a God who sees” (16:13).",
          "Ishmael was born when Abram was 86.",
        ],
        question: "Where does waiting on God end and taking matters into your own hands begin?",
      },
      {
        title: "The test on the mountain",
        read: "GEN 22:1-2,7-8,11-13",
        facts: [
          "Isaac was born when Abraham was 100. He was the son the whole promise rested on.",
          "Child sacrifice was practiced in the religions around him. This story ends with God stopping it.",
          "Moriah is the same place where Solomon later built the temple (2 Chronicles 3:1).",
          "Isaac carried the wood up the mountain. He was likely a young man, not a small child.",
          "Abraham named the place “Yahweh Will Provide.” Hebrews 11:19 says he reasoned that God could raise the dead.",
        ],
        question: "What do you think was going through Abraham’s mind when Isaac asked, “Where is the lamb?”",
        verse: {
          ref: "GEN 22:8",
          es: "Dios se proveerá de cordero para el holocausto, hijo mío.",
          en: "God will provide himself the lamb for a burnt offering, my son.",
          simple: "Dios mismo nos dará el cordero, hijo mío.",
        },
      },
    ],
    recap: {
      timeline: [
        "Left Haran at 75 (Genesis 12)",
        "Lied about Sarai in Egypt",
        "Covenant under the stars (Genesis 15)",
        "Ishmael born through Hagar when Abram was 86",
        "Renamed Abraham, “father of many” (Genesis 17)",
        "Isaac born when he was 100 (Genesis 21)",
        "Tested on Mount Moriah (Genesis 22)",
        "Died at 175 (Genesis 25:7)",
      ],
      strengths: [
        "Went without knowing where",
        "Believed a promise for decades",
        "Generous: let his nephew Lot choose the better land (Genesis 13)",
      ],
      failures: [
        "Lied twice about his wife out of fear",
        "Took a shortcut with Hagar, then stepped back when she was mistreated",
      ],
      verse: { ref: "GEN 15:6" },
    },
  },
  {
    id: "jose",
    name: "Joseph",
    es: "José",
    era: "About 1900 BC",
    days: [
      {
        title: "The favorite son",
        read: "GEN 37:3-8",
        facts: [
          "Jacob loved Joseph most: he was the son of his old age and of Rachel, his favorite wife.",
          "The special robe marked Joseph as favored, possibly as heir. It wasn’t clothing for work in the fields.",
          "Joseph had already brought a bad report about his brothers to their father (37:2).",
          "At 17, he told them his dreams of them bowing down to him. They hated him more.",
          "Favoritism ran in the family: Isaac had favored Esau, and Rebekah had favored Jacob.",
        ],
        question: "What part did each person in this family play in the trouble that was coming?",
      },
      {
        title: "Sold",
        read: "GEN 37:23-28",
        facts: [
          "His brothers stripped off the robe and threw him into an empty pit.",
          "Reuben, the oldest, planned to rescue him later (37:22).",
          "Judah suggested selling him instead of killing him: “he is our brother, our flesh.”",
          "Twenty pieces of silver was about the going price of a young slave then.",
          "They dipped the robe in goat’s blood and let their father believe Joseph was dead.",
        ],
        question: "How do you think the brothers lived with this secret for the next twenty years?",
      },
      {
        title: "Faithful when no one was watching",
        read: "GEN 39:2-4,8-10",
        facts: [
          "Potiphar was captain of Pharaoh’s guard. Joseph, a foreign slave, ended up running his whole household.",
          "The chapter keeps repeating one line: “Yahweh was with Joseph.”",
          "Potiphar’s wife pressed him day after day. He refused out of loyalty to his master and “sin against God.”",
          "He ran, leaving his garment in her hand. For the second time, his clothing was used to lie about him.",
          "He was thrown into prison, and even there “Yahweh was with Joseph” (39:21).",
        ],
        question: "Joseph did the right thing and still ended up in prison. What does that say about why he did it?",
        verse: {
          ref: "GEN 39:9",
          es: "¿cómo, pues, haría yo este grande mal, y pecaría contra Dios?",
          en: "How then can I do this great wickedness, and sin against God?",
          simple: "¿Cómo voy a hacer algo tan malo y pecar contra Dios?",
        },
      },
      {
        title: "From prison to palace",
        read: "GEN 41:14-16,38-41",
        facts: [
          "Two full years passed after the cupbearer forgot him (41:1).",
          "Joseph shaved before seeing Pharaoh. Egyptians were clean-shaven; Hebrews wore beards.",
          "His first words: “It isn’t in me. God will give Pharaoh an answer of peace.”",
          "He didn’t just explain the dreams. He proposed a plan to store grain for the famine.",
          "He was made second only to Pharaoh at 30 (41:46), about 13 years after he was sold.",
        ],
        question: "Why do you think Joseph refused to take credit in front of the most powerful man in the world?",
        verse: {
          ref: "GEN 41:16",
          simple: "José le respondió a Faraón: No soy yo. Dios le dará una buena respuesta.",
        },
      },
      {
        title: "Meant for evil, used for good",
        read: "GEN 45:3-5; 50:19-21",
        facts: [
          "His brothers came to Egypt to buy grain and didn’t recognize him.",
          "He tested them. Judah, the one who had suggested selling him, offered himself as a slave in place of Benjamin (44:33).",
          "Joseph wept so loudly that the Egyptians heard it.",
          "After their father died, the brothers feared revenge. Joseph answered, “Don’t be afraid, for am I in the place of God?”",
          "He forgave without pretending it hadn’t happened: “You meant evil against me, but God meant it for good.” Then he provided for their families.",
        ],
        question: "Joseph named the wrong done to him and forgave it anyway. Why do both parts matter?",
        verse: {
          ref: "GEN 50:20",
          es: "Vosotros pensasteis mal sobre mí, mas Dios lo encaminó á bien",
          en: "As for you, you meant evil against me, but God meant it for good",
          simple: "Ustedes quisieron hacerme daño, pero Dios lo convirtió en algo bueno.",
        },
      },
    ],
    recap: {
      timeline: [
        "Jacob’s favorite son; dreams at 17 (Genesis 37)",
        "Sold by his brothers into slavery",
        "Ran Potiphar’s house; falsely accused; imprisoned (Genesis 39)",
        "Interpreted Pharaoh’s dreams; made ruler at 30 (Genesis 41)",
        "Saved Egypt and his family from famine",
        "Forgave his brothers (Genesis 45, 50)",
        "Died at 110 (Genesis 50:26)",
      ],
      strengths: [
        "Integrity under temptation",
        "Did excellent work wherever he was put, even as a slave and a prisoner",
        "Forgave the people who hurt him most",
      ],
      failures: [
        "As a young man, proud and tactless with his brothers",
        "As ruler, took the Egyptians’ land and freedom in exchange for food (Genesis 47:20-21)",
      ],
      verse: { ref: "GEN 50:20" },
    },
  },
  {
    id: "moises",
    name: "Moses",
    es: "Moisés",
    era: "About 1400–1250 BC",
    days: [
      {
        title: "A killing and an exile",
        read: "EXO 2:11-15",
        facts: [
          "Moses was raised in Pharaoh’s palace, but he knew he was a Hebrew.",
          "He saw an Egyptian beating a Hebrew. He looked both ways, killed the man, and hid the body in the sand.",
          "The next day a Hebrew threw it back at him: “Who made you a prince and a judge over us?”",
          "He fled to Midian and spent about 40 years as a shepherd (Acts 7:23-30).",
          "He had a real sense of justice, and he tried to act on it in his own way, by his own strength.",
        ],
        question: "Moses wanted to do something right. What went wrong?",
      },
      {
        title: "The burning bush",
        read: "EXO 3:10-14",
        facts: [
          "Moses was about 80 (Exodus 7:7), tending sheep near Mount Horeb, also called Sinai.",
          "He objected five times: who am I, what is your name, they won’t believe me, I’m not a good speaker, send someone else.",
          "God’s answer to “Who am I?” was not a speech about Moses. It was “Certainly I will be with you.”",
          "“I AM WHO I AM” is the root of God’s personal name, Yahweh. The 1909 Spanish renders it “YO SOY EL QUE SOY.”",
        ],
        question: "Why do you think God answered “Who am I?” with “I will be with you”?",
        verse: {
          ref: "EXO 3:14",
          es: "YO SOY EL QUE SOY.",
          en: "I AM WHO I AM",
          simple: "Dios le dijo a Moisés: Yo soy el que soy.",
        },
      },
      {
        title: "The sea",
        read: "EXO 14:13-16,21-22",
        facts: [
          "The ten plagues were aimed at the gods of Egypt (Exodus 12:12).",
          "Trapped between the sea and Pharaoh’s army, the people panicked and said they would rather have stayed slaves.",
          "Moses told them, “Stand still, and see the salvation of Yahweh.”",
          "Then God told Moses to stop crying out and tell the people to move forward.",
          "A strong east wind blew all night to open the way.",
        ],
        question: "When is it time to stand still, and when is it time to move forward?",
        verse: {
          ref: "EXO 14:14",
          simple: "El Señor peleará por ustedes; ustedes quédense tranquilos.",
        },
      },
      {
        title: "Too much for one man",
        read: "EXO 18:13-18,21",
        facts: [
          "Jethro, his father-in-law, was a priest of Midian, an outsider.",
          "He watched Moses judge disputes from morning to evening and said, “The thing that you do is not good.”",
          "His advice: choose capable, honest men who fear God and hate bribes, and share the load.",
          "Moses listened and did it.",
          "Numbers 12:3 calls him more humble than anyone on earth. Here, that looks like taking advice.",
        ],
        question: "Why is it hard for a leader to accept that he can’t carry everything himself?",
      },
      {
        title: "Striking the rock",
        read: "NUM 20:7-12",
        facts: [
          "This happens near the end of the 40 years, right after his sister Miriam died (20:1).",
          "God told Moses to speak to the rock. Instead, in anger, he struck it twice and said, “Shall we bring water out of this rock for you?”",
          "Water came anyway. God provided for the people even when Moses disobeyed.",
          "The consequence: Moses would not lead them into the land.",
          "He saw it from Mount Nebo and died at 120 (Deuteronomy 34). No later prophet knew God “face to face” like he did.",
        ],
        question: "Why did one moment of anger cost so much for a man who had been faithful for decades?",
        verse: {
          ref: "DEU 34:10",
          simple: "Nunca más hubo en Israel un profeta como Moisés, que conocía a Dios cara a cara.",
        },
      },
    ],
    recap: {
      timeline: [
        "Born under Pharaoh’s order to kill Hebrew boys; raised in the palace",
        "Killed an Egyptian at 40 and fled to Midian",
        "The burning bush at 80 (Exodus 3)",
        "The plagues and the Exodus",
        "Received the Ten Commandments at Sinai",
        "Led Israel 40 years in the wilderness",
        "Struck the rock; barred from the land (Numbers 20)",
        "Died at 120 on Mount Nebo (Deuteronomy 34)",
      ],
      strengths: [
        "Humble enough to take advice",
        "Pleaded with God for the people again and again",
        "Endured 40 hard years of leading complainers",
      ],
      failures: [
        "Anger: the killing in Egypt, the broken tablets, the rock",
        "Made excuse after excuse at the burning bush",
      ],
      verse: { ref: "EXO 33:11", es: "Y hablaba Jehová á Moisés cara á cara, como habla cualquiera á su compañero.", en: "Yahweh spoke to Moses face to face, as a man speaks to his friend." },
    },
  },
  {
    id: "josue",
    name: "Joshua",
    es: "Josué",
    era: "After Moses",
    days: [
      {
        title: "Strong and courageous",
        read: "JOS 1:5-9",
        facts: [
          "Joshua had been Moses’ assistant since his youth (Numbers 11:28): decades as the second man.",
          "Forty years earlier, he and Caleb were the only two of twelve spies who trusted God (Numbers 14).",
          "God tells him “be strong and courageous” three times in this one chapter.",
          "The courage is tied to keeping God’s law day and night, not to personality.",
          "His name means “Yahweh saves.” In Hebrew it is the same name as Jesus (Yeshua).",
        ],
        question: "Where does real courage come from, according to this passage?",
        verse: {
          ref: "JOS 1:9",
          simple: "Sé fuerte y valiente. No tengas miedo ni te desanimes, porque el Señor tu Dios estará contigo dondequiera que vayas.",
        },
      },
      {
        title: "Jericho",
        read: "JOS 6:1-5,20",
        facts: [
          "Jericho is one of the oldest known cities in the world.",
          "The plan made no military sense: march around it silently for six days, then seven times on the seventh.",
          "The priests carried the ark in the middle. The battle was framed as God’s, not Israel’s.",
          "Rahab, the Canaanite woman who hid the spies, was spared with her family (6:25).",
          "She appears later in the family line of David and of Jesus (Matthew 1:5).",
        ],
        question: "Why do you think God gave Joshua a plan that looked foolish?",
      },
      {
        title: "Me and my house",
        read: "JOS 24:14-15,29",
        facts: [
          "Joshua made mistakes. He sent troops to Ai without asking God and lost (Joshua 7).",
          "He made a treaty with the Gibeonites after being fooled, because they “didn’t ask counsel from Yahweh’s mouth” (9:14).",
          "At 110, he gathered Israel at Shechem, where Abraham had built his first altar in the land.",
          "He laid out a choice, then made his own decision public.",
          "Israel served Yahweh for as long as Joshua lived (24:31).",
        ],
        question: "Why does it matter that Joshua said “me and my house” and not just “me”?",
        verse: {
          ref: "JOS 24:15",
          es: "yo y mi casa serviremos á Jehová.",
          en: "as for me and my house, we will serve Yahweh.",
          simple: "Yo y mi familia serviremos al Señor.",
        },
      },
    ],
    recap: {
      timeline: [
        "Moses’ assistant; led the battle against Amalek (Exodus 17)",
        "One of two faithful spies (Numbers 14)",
        "Took over after Moses died",
        "Led Israel across the Jordan",
        "Jericho fell (Joshua 6)",
        "Lost at Ai; fooled by the Gibeonites",
        "Divided the land among the tribes",
        "Farewell at Shechem; died at 110",
      ],
      strengths: [
        "Decades of faithfulness as the number two",
        "Courage grounded in God’s word",
        "Led his own household by example",
      ],
      failures: ["Acted without asking God, at Ai and with the Gibeonites"],
      verse: { ref: "JOS 1:9" },
    },
  },
  {
    id: "gedeon",
    name: "Gideon",
    es: "Gedeón",
    era: "The judges, about 1100s BC",
    days: [
      {
        title: "Mighty man of valor",
        read: "JDG 6:11-16",
        facts: [
          "For seven years, Midianite raiders came at harvest time and stripped the land. Israelites hid in caves.",
          "Threshing is done in the open wind. Gideon was threshing in a winepress, a pit, so he was hiding.",
          "The angel called him “mighty man of valor” while he was hiding.",
          "Gideon said his clan was the weakest in Manasseh and he was the least in his family.",
          "His first job was tearing down his father’s altar to Baal. He did it at night, because he was afraid (6:27).",
        ],
        question: "Why would God call a man “mighty” while he was hiding?",
        verse: {
          ref: "JDG 6:12",
          es: "Jehová es contigo, varón esforzado.",
          en: "Yahweh is with you, you mighty man of valor!",
          simple: "El Señor está contigo, hombre valiente.",
        },
      },
      {
        title: "Three hundred men",
        read: "JDG 7:2-3,7",
        facts: [
          "Before this, Gideon asked for a sign with a fleece, and then for a second one. God answered both (6:36-40).",
          "The army was cut from 32,000 to 10,000, then to 300, so Israel couldn’t say, “My own hand has saved me.”",
          "Their weapons were trumpets, clay jars, and torches. In the confusion, the Midianites turned on each other.",
          "God also let Gideon overhear a soldier’s dream in the enemy camp, because he was still afraid (7:10-15).",
        ],
        question: "God kept meeting Gideon’s fear instead of scolding it. What do you make of that?",
      },
      {
        title: "The gold ephod",
        read: "JDG 8:22-27",
        facts: [
          "After the victory, Israel asked him to rule as king. He refused: “Yahweh shall rule over you.”",
          "In the same breath, he asked for their gold earrings and made an ephod, a priestly garment.",
          "Israel worshiped it, and it became a snare to Gideon and his family.",
          "He had many wives and 70 sons. One son, Abimelech, later killed 69 of his brothers to seize power (Judges 9).",
          "A strong start can still end in a slow drift.",
        ],
        question: "How can a man say the right words, like “God shall rule,” and still drift?",
        verse: {
          ref: "JDG 8:23",
          es: "Jehová será vuestro Señor.",
          en: "Yahweh shall rule over you.",
          simple: "El Señor será quien los gobierne.",
        },
      },
    ],
    recap: {
      timeline: [
        "Threshing wheat in hiding during the Midianite raids",
        "Called “mighty man of valor” (Judges 6)",
        "Tore down his father’s Baal altar at night",
        "Asked for signs with the fleece",
        "Defeated Midian with 300 men (Judges 7)",
        "Refused to be king",
        "Made the gold ephod that Israel worshiped",
        "Forty years of peace in his lifetime (8:28)",
      ],
      strengths: [
        "Obeyed even while afraid",
        "Honest about his weakness",
        "Turned down the crown",
      ],
      failures: [
        "Kept asking for more signs",
        "The gold ephod led Israel back into idolatry",
        "A divided household that turned violent after he died",
      ],
      verse: { ref: "JDG 6:12", es: "Jehová es contigo, varón esforzado.", en: "Yahweh is with you, you mighty man of valor!" },
    },
  },
  {
    id: "booz",
    name: "Boaz",
    es: "Booz",
    era: "The judges, about 1100 BC",
    days: [
      {
        title: "A worthy man",
        read: "RUT 2:4,8-12",
        facts: [
          "Naomi, a widow, came home to Bethlehem with Ruth, her widowed daughter-in-law from Moab.",
          "God’s law let the poor glean the grain left behind in the fields (Leviticus 19:9-10).",
          "Boaz greeted his workers with “Yahweh be with you,” and they blessed him back.",
          "He told his men to leave Ruth alone, gave her water, and had extra grain left for her.",
          "Moabites were old enemies of Israel. He had heard how loyal she was to Naomi, and he honored it.",
        ],
        question: "What do the small details, like his greeting and the water, tell you about Boaz?",
        verse: {
          ref: "RUT 2:12",
          simple: "Que el Señor te pague por lo que has hecho, porque has venido a refugiarte bajo sus alas.",
        },
      },
      {
        title: "At the threshing floor",
        read: "RUT 3:8-13",
        facts: [
          "Naomi sent Ruth to Boaz at night. Asking him to spread his garment over her was a marriage proposal.",
          "It echoes his own words in chapter 2 about refuge under God’s “wings.” In Hebrew, the word for wing and for the corner of a garment is the same.",
          "Boaz was older. He praised her for not going after younger men.",
          "He called her “a worthy woman,” the same phrase used of him (2:1).",
          "There was a closer relative with the first right. Boaz refused to cut corners, protected her reputation, and sent her home before dawn.",
        ],
        question: "Boaz had every chance to take a shortcut. Why do you think he didn’t?",
        verse: {
          ref: "RUT 3:11",
          es: "toda la puerta de mi pueblo sabe que eres mujer virtuosa.",
          en: "all the city of my people knows that you are a worthy woman.",
          simple: "Todo mi pueblo sabe que eres una mujer de valor.",
        },
      },
      {
        title: "The redeemer",
        read: "RUT 4:9-10,13-17",
        facts: [
          "Legal business happened at the city gate, with ten elders as witnesses.",
          "The closer relative wanted the land, but backed out when it came with Ruth. It would have cost him.",
          "Boaz took on the cost. He was the go’el, the kinsman-redeemer: a relative who buys back land or family.",
          "Their son Obed was the grandfather of King David.",
          "Matthew 1:5 names Boaz’s mother as Rahab, the Canaanite woman from Jericho.",
        ],
        question: "What does it look like for a man to take on a cost so someone else is protected?",
      },
    ],
    recap: {
      timeline: [
        "A landowner in Bethlehem in the days of the judges",
        "Welcomed Ruth, a foreigner, into his field",
        "Protected and provided for her",
        "Answered her proposal honorably at the threshing floor",
        "Redeemed the land and married Ruth at the city gate",
        "Great-grandfather of King David",
      ],
      strengths: [
        "Kindness to an outsider",
        "Integrity in how things were done, not just what",
        "Generous with his own resources",
      ],
      failures: ["None are recorded. The book shows him only over a few weeks of his life."],
      verse: { ref: "RUT 2:12" },
    },
  },
  {
    id: "david",
    name: "David",
    es: "David",
    era: "About 1000 BC",
    days: [
      {
        title: "The youngest son",
        read: "1SA 16:6-7,11-13",
        facts: [
          "Samuel was sent to Bethlehem to anoint a king from Jesse’s sons.",
          "The oldest, Eliab, looked the part. God said, “Man looks at the outward appearance, but Yahweh looks at the heart.”",
          "David was out with the sheep. He hadn’t even been invited.",
          "He was probably a teenager. He didn’t become king until he was 30 (2 Samuel 5:4), many years later.",
        ],
        question: "What do people usually judge a man by? What does God look at instead?",
        verse: {
          ref: "1SA 16:7",
          es: "el hombre mira lo que está delante de sus ojos, mas Jehová mira el corazón.",
          en: "man looks at the outward appearance, but Yahweh looks at the heart.",
          simple: "La gente mira la apariencia, pero Dios mira el corazón.",
        },
      },
      {
        title: "Goliath",
        read: "1SA 17:45-47,49",
        facts: [
          "David had only been sent to bring food to his brothers at the front.",
          "The standard Hebrew text makes Goliath over nine feet tall; some old manuscripts say about six foot nine. Either way, a giant.",
          "Slingers were real soldiers in that world, accurate and deadly (Judges 20:16).",
          "Saul’s armor didn’t fit, so David went as he was.",
          "What moved him was that Goliath “defied the armies of the living God.”",
        ],
        question: "David fought with what he knew, not with Saul’s armor. Why does that matter?",
        verse: {
          ref: "1SA 17:47",
          es: "de Jehová es la guerra",
          en: "the battle is Yahweh’s",
          simple: "La batalla es del Señor.",
        },
      },
      {
        title: "Sparing Saul",
        read: "1SA 24:3-7",
        facts: [
          "King Saul hunted David for years.",
          "In a cave near En Gedi, Saul walked in alone, right where David and his men were hiding.",
          "His men said this was “the day” Yahweh had spoken of. David only cut off the corner of Saul’s robe, and even that troubled his conscience.",
          "He refused to harm “Yahweh’s anointed” and held his men back.",
          "Afterward he called Saul “my father” (24:11). He chose to wait for God’s timing instead of taking the throne by force.",
        ],
        question: "Why is it so hard to wait when the shortcut is right in front of you?",
      },
      {
        title: "You are the man",
        read: "2SA 11:1-4; 12:7,13",
        facts: [
          "It was the season when kings went to war, and David stayed home.",
          "He saw, he asked, he sent, he took.",
          "Uriah, Bathsheba’s husband, was one of David’s own elite soldiers (2 Samuel 23:39). David tried to cover up the pregnancy, then had Uriah killed.",
          "The prophet Nathan told a story about a stolen lamb, then said, “You are the man.”",
          "David didn’t defend himself: “I have sinned against Yahweh.” The consequences in his family were still severe.",
        ],
        question: "What makes it so hard to say “I have sinned” without adding an excuse?",
        verse: {
          ref: "2SA 12:13",
          es: "Pequé contra Jehová.",
          en: "I have sinned against Yahweh.",
          simple: "He pecado contra el Señor.",
        },
      },
      {
        title: "A clean heart",
        read: "PSA 51:10-13",
        facts: [
          "Psalm 51’s heading ties it to the time Nathan confronted David.",
          "“Create in me a clean heart” uses bara, the same word as Genesis 1:1. In the Bible, only God is the subject of it.",
          "He didn’t ask God to fix his image. He asked for a new heart.",
          "He was called a man after God’s own heart (1 Samuel 13:14, Acts 13:22). Not because he was perfect, but because he kept coming back.",
          "He also failed as a father. When his son Amnon raped his daughter Tamar, David was angry but did nothing (2 Samuel 13:21).",
        ],
        question: "What is the difference between being sorry you got caught and asking for a clean heart?",
        verse: {
          ref: "PSA 51:10",
          simple: "Dios mío, crea en mí un corazón limpio y dame un espíritu nuevo y firme.",
        },
      },
    ],
    recap: {
      timeline: [
        "Shepherd boy in Bethlehem",
        "Anointed by Samuel (1 Samuel 16)",
        "Killed Goliath (1 Samuel 17)",
        "Years on the run from Saul; spared his life twice",
        "King at 30; made Jerusalem the capital",
        "Bathsheba and the death of Uriah (2 Samuel 11)",
        "His son Absalom’s rebellion",
        "Died after 40 years as king",
      ],
      strengths: [
        "Courage rooted in trust",
        "Restraint toward Saul",
        "Honest worship: many of the Psalms",
        "Quick, open repentance",
      ],
      failures: ["Adultery, and a murder to cover it up", "Passive as a father when his children needed justice"],
      verse: { ref: "1SA 16:7", es: "el hombre mira lo que está delante de sus ojos, mas Jehová mira el corazón.", en: "man looks at the outward appearance, but Yahweh looks at the heart." },
    },
  },
  {
    id: "salomon",
    name: "Solomon",
    es: "Salomón",
    era: "About 970–930 BC",
    days: [
      {
        title: "Ask for wisdom",
        read: "1KI 3:5,7-12",
        facts: [
          "Solomon was young, the son of David and Bathsheba, and newly king.",
          "God appeared to him in a dream at Gibeon and said, “Ask for what I should give you.”",
          "He admitted, “I am just a little child. I don’t know how to go out or come in.”",
          "He asked for “an understanding heart,” literally a listening heart, to judge the people well.",
          "God was pleased he hadn’t asked for long life, riches, or revenge, and gave him riches and honor too.",
        ],
        question: "If you could ask God for one thing as a man, what would it be, and why?",
        verse: {
          ref: "1KI 3:9",
          es: "Da pues á tu siervo corazón dócil para juzgar á tu pueblo, para discernir entre lo bueno y lo malo",
          en: "Give your servant therefore an understanding heart to judge your people, that I may discern between good and evil",
          simple: "Dame un corazón que escuche, para gobernar a tu pueblo y distinguir entre el bien y el mal.",
        },
      },
      {
        title: "Two mothers",
        read: "1KI 3:23-28",
        facts: [
          "Two women, both prostitutes, brought a case straight to the king. Even people at the bottom could get a hearing.",
          "Each said the living baby was hers. There were no witnesses.",
          "Solomon called for a sword to split the child. The real mother gave him up rather than see him die.",
          "Her compassion revealed the truth.",
          "The people respected the king because they saw that God’s wisdom was in him.",
        ],
        question: "Solomon looked for love to find the truth. What does that teach about judging people?",
      },
      {
        title: "The temple",
        read: "1KI 8:22-23,27-28",
        facts: [
          "The temple took seven years to build (6:38), on Mount Moriah, where Abraham had been tested.",
          "In his prayer, Solomon admitted that even the highest heaven can’t contain God, “how much less this house.”",
          "He stood with his hands raised, then knelt (8:54).",
          "It was built partly with forced labor (5:13). The heavy burden on the people later helped split the kingdom.",
        ],
        question: "Why would a king who built God a house say that no house could hold him?",
        verse: {
          ref: "1KI 8:27",
          es: "He aquí que los cielos, los cielos de los cielos, no te pueden contener",
          en: "Behold, heaven and the heaven of heavens can’t contain you",
          simple: "Ni el cielo más alto puede contenerte.",
        },
      },
      {
        title: "A divided heart",
        read: "1KI 11:1-4,9",
        facts: [
          "He had 700 wives and 300 concubines, many from political alliances with other nations.",
          "Deuteronomy 17:16-17 told kings not to multiply horses, wives, or gold. Solomon did all three.",
          "“When Solomon was old, his wives turned away his heart.” It was a slow drift, not one dramatic fall.",
          "He built places of worship for foreign gods, including Molech.",
          "After his death, the kingdom split in two.",
        ],
        question: "How does a wise man end up going against what he knows? What does slow drift look like?",
      },
    ],
    recap: {
      timeline: [
        "Son of David and Bathsheba",
        "Asked for wisdom at Gibeon (1 Kings 3)",
        "Judged between the two mothers",
        "Built the temple in seven years",
        "Wealth, fame, and the visit of the queen of Sheba",
        "His many wives turned his heart to other gods",
        "Reigned 40 years; the kingdom split after his death",
      ],
      strengths: [
        "Asked humbly for wisdom",
        "Justice that protected the vulnerable",
        "Builder, and writer of many proverbs (1 Kings 4:32)",
      ],
      failures: [
        "Compromised with his wives’ idols",
        "Ignored the law’s limits on kings",
        "Put heavy forced labor on his own people",
      ],
      verse: { ref: "PRO 3:5" },
    },
  },
  {
    id: "elias",
    name: "Elijah",
    es: "Elías",
    era: "About 860 BC",
    days: [
      {
        title: "Drought and a widow",
        read: "1KI 17:1,9-14",
        facts: [
          "King Ahab and Queen Jezebel promoted Baal, the storm god who was supposed to bring the rain.",
          "So a drought announced by Yahweh’s prophet was a direct challenge to Baal.",
          "God sent Elijah to Zarephath in Sidon, Jezebel’s home region and Baal’s own territory.",
          "The widow was about to make her last meal for herself and her son. Elijah asked her to feed him first.",
          "Jesus pointed to this story in Luke 4:25-26.",
        ],
        question: "What did it cost the widow to trust a stranger’s word about God?",
        verse: {
          ref: "1KI 17:14",
          es: "La tinaja de la harina no escaseará, ni se disminuirá la botija del aceite",
          en: "The jar of meal will not run out, and the jar of oil will not fail",
          simple: "No se acabará la harina de la tinaja ni el aceite de la botella.",
        },
      },
      {
        title: "Fire on Mount Carmel",
        read: "1KI 18:21,36-39",
        facts: [
          "It was Elijah alone against 450 prophets of Baal.",
          "“How long will you waver between the two sides?” Literally, how long will you limp between two opinions.",
          "Earlier he mocked them: maybe Baal is busy, on a trip, or asleep (18:27).",
          "In the middle of a drought, he had the altar soaked with water three times.",
          "His prayer was short. The people fell on their faces: “Yahweh, he is God!”",
        ],
        question: "What does “limping between two opinions” look like in a man’s life today?",
        verse: {
          ref: "1KI 18:21",
          es: "¿Hasta cuándo claudicaréis vosotros entre dos pensamientos?",
          en: "How long will you waver between the two sides?",
          simple: "¿Hasta cuándo van a dudar entre dos opiniones?",
        },
      },
      {
        title: "Under the broom tree",
        read: "1KI 19:3-8",
        facts: [
          "Right after Carmel, Jezebel threatened to kill him, and he ran.",
          "He went a day past Beersheba into the desert, alone, and asked to die: “I am not better than my fathers.”",
          "God’s first answer was not a lecture. It was sleep and food, twice.",
          "Then he walked 40 days to Horeb, the mountain of Moses.",
          "Exhaustion after a big win is real, and God dealt with Elijah’s body first.",
        ],
        question: "Why do you think a low point came right after Elijah’s biggest victory?",
        verse: {
          ref: "1KI 19:7",
          es: "Levántate, come: porque gran camino te resta.",
          en: "Arise and eat, because the journey is too great for you.",
          simple: "Levántate y come, porque todavía te queda un largo camino.",
        },
      },
      {
        title: "A gentle whisper",
        read: "1KI 19:11-13,18",
        facts: [
          "A great wind, then an earthquake, then a fire. God was not in any of them.",
          "Then came “a still small voice,” in Hebrew something like the sound of a thin silence.",
          "Twice Elijah said, “I, even I only, am left.” He was wrong: 7,000 had not bowed to Baal.",
          "God gave him new work, including anointing Elisha to follow him.",
          "He was taken up in a whirlwind (2 Kings 2:11) and later appeared with Moses beside Jesus (Matthew 17).",
        ],
        question: "Why do people in a dark season so often believe they are the only ones left?",
        verse: {
          ref: "1KI 19:12",
          es: "Y tras el fuego un silbo apacible y delicado.",
          en: "After the fire, there was a still small voice.",
          simple: "Después del fuego se oyó un susurro suave y tranquilo.",
        },
      },
    ],
    recap: {
      timeline: [
        "Announced a drought to King Ahab (1 Kings 17)",
        "Fed by ravens, then by the widow of Zarephath",
        "Fire from heaven on Mount Carmel (1 Kings 18)",
        "Fled from Jezebel; asked to die",
        "Met God in a quiet voice at Horeb (1 Kings 19)",
        "Called Elisha to follow him",
        "Taken up in a whirlwind (2 Kings 2)",
      ],
      strengths: ["Bold, even when standing alone", "Prayed with confidence (James 5:17)", "Obeyed strange instructions"],
      failures: ["Despair and self-pity after a great victory", "Believed he was the only faithful one left"],
      verse: { ref: "JAM 5:17" },
    },
  },
  {
    id: "nehemias",
    name: "Nehemiah",
    es: "Nehemías",
    era: "About 445 BC",
    days: [
      {
        title: "He wept, then he prayed",
        read: "NEH 1:3-4; 2:4-5",
        facts: [
          "Nehemiah was cupbearer to the Persian king Artaxerxes, a trusted job that included guarding the king against poison.",
          "Jerusalem’s walls were broken down. A city without walls was defenseless and disgraced.",
          "He mourned, fasted, and prayed for days. In his prayer he confessed “we,” including himself and his father’s house (1:6).",
          "When the king asked what he wanted, he prayed a quick prayer before answering (2:4).",
          "Then he asked for specific things: time off, letters, and timber. Prayer and planning went together.",
        ],
        question: "Nehemiah prayed and also made a detailed plan. How do those two fit together?",
        verse: {
          ref: "NEH 2:4",
          es: "Entonces oré al Dios de los cielos",
          en: "So I prayed to the God of heaven.",
          simple: "Entonces le oré al Dios del cielo.",
        },
      },
      {
        title: "Sword in one hand",
        read: "NEH 4:14-18",
        facts: [
          "His opponents, Sanballat and Tobiah, mocked the work, then plotted an attack.",
          "He had families build the sections of wall nearest their own homes.",
          "Half the men worked while the other half stood guard. The builders wore swords as they worked.",
          "He told them to remember the Lord and fight for their brothers, sons, daughters, wives, and houses.",
          "The wall was finished in 52 days (6:15).",
        ],
        question: "Nehemiah gave men something specific to protect. Why does that help them stand firm?",
        verse: {
          ref: "NEH 4:14",
          es: "acordaos del Señor grande y terrible, y pelead por vuestros hermanos, por vuestros hijos y por vuestras hijas, por vuestras mujeres y por vuestras casas.",
          en: "Remember the Lord, who is great and awesome, and fight for your brothers, your sons, your daughters, your wives, and your houses.",
          simple: "Acuérdense del Señor, grande y poderoso, y luchen por sus hermanos, sus hijos, sus hijas, sus esposas y sus casas.",
        },
      },
      {
        title: "Fixing what was unfair",
        read: "NEH 5:6-10",
        facts: [
          "During the work, poor families were mortgaging fields and selling their children to pay debts to wealthier Jews.",
          "Nehemiah was “very angry,” but he thought it over before he acted (5:7).",
          "He confronted the nobles publicly and got them to stop charging interest and give back the land.",
          "For his 12 years as governor, he never took the governor’s food allowance (5:14-15).",
          "He also had a hot temper: years later he struck men and pulled out their hair (13:25).",
        ],
        question: "Nehemiah got angry and then took time to think. What does that pause change?",
      },
    ],
    recap: {
      timeline: [
        "Cupbearer to King Artaxerxes of Persia",
        "Heard about Jerusalem’s broken walls; fasted and prayed",
        "Received leave and letters from the king",
        "Inspected the walls at night",
        "Rebuilt them in 52 days despite threats",
        "Ended the exploitation of the poor",
        "Governor for 12 years; later reforms (Nehemiah 13)",
      ],
      strengths: ["Prayer joined to careful planning", "Led by example", "Clean hands with money and power"],
      failures: ["A harsh, physical temper (13:25)"],
      verse: { ref: "NEH 8:10", es: "el gozo de Jehová es vuestra fortaleza.", en: "the joy of Yahweh is your strength." },
    },
  },
  {
    id: "daniel",
    name: "Daniel",
    es: "Daniel",
    era: "About 605–530 BC",
    days: [
      {
        title: "He made up his mind",
        read: "DAN 1:8,11-15",
        facts: [
          "Daniel was taken from Jerusalem to Babylon as a teenager around 605 BC.",
          "He was trained for three years in Babylon’s language and literature and given a Babylonian name, Belteshazzar.",
          "He accepted the new name and the education, but he drew the line at the king’s food, likely because of God’s food laws or because it had been offered to idols.",
          "He “purposed in his heart”: he decided ahead of time.",
          "He asked respectfully and offered a 10-day test instead of making a scene.",
        ],
        question: "Daniel picked his line carefully. How do you tell which hills are worth standing on?",
        verse: {
          ref: "DAN 1:8",
          es: "Y Daniel propuso en su corazón de no contaminarse",
          en: "But Daniel purposed in his heart that he would not defile himself",
          simple: "Daniel decidió en su corazón no contaminarse.",
        },
      },
      {
        title: "The God who reveals secrets",
        read: "DAN 2:17-20,27-28",
        facts: [
          "King Nebuchadnezzar demanded that his wise men tell him his dream and its meaning, or die.",
          "Daniel asked for time and went home to pray with his three friends.",
          "When the answer came, he praised God before he went to the king.",
          "He told the king that no wise man could do this, “but there is a God in heaven who reveals secrets.”",
          "He took no credit for himself.",
        ],
        question: "Under pressure, Daniel’s first move was to gather friends to pray. Who would you call?",
        verse: {
          ref: "DAN 2:28",
          es: "Mas hay un Dios en los cielos, el cual revela los misterios",
          en: "but there is a God in heaven who reveals secrets",
          simple: "Pero hay un Dios en el cielo que revela los secretos.",
        },
      },
      {
        title: "Three times a day",
        read: "DAN 6:3-5,10",
        facts: [
          "Decades later, now an old man, Daniel was serving the Persian king Darius.",
          "His rivals looked for corruption or negligence and found none.",
          "So they went after his faith, with a law banning prayer to anyone but the king for 30 days.",
          "He kept praying three times a day toward Jerusalem, with his windows open, “as he did before.”",
          "He didn’t change his routine, neither to hide it nor to make a show of it.",
        ],
        question: "Daniel’s habit was already in place before the test came. Why does that matter?",
        verse: {
          ref: "DAN 6:10",
          es: "hincábase de rodillas tres veces al día, y oraba, y confesaba delante de su Dios, como lo solía hacer antes.",
          en: "he kneeled on his knees three times a day, and prayed, and gave thanks before his God, as he did before.",
          simple: "Se arrodillaba tres veces al día para orar y dar gracias a Dios, como siempre lo había hecho.",
        },
      },
      {
        title: "The lions’ den",
        read: "DAN 6:16,19-22",
        facts: [
          "Darius tried all day to save Daniel, but a law of the Medes and Persians couldn’t be changed.",
          "The king spent the night without food or sleep.",
          "Daniel’s first words from the den were respectful: “O king, live forever!”",
          "No injury was found on him, “because he had trusted in his God” (6:23).",
          "His accusers were thrown to the lions, along with their families: the harsh justice of that empire (6:24).",
        ],
        question: "Daniel stayed respectful toward the man who had sentenced him. What does that show?",
        verse: {
          ref: "DAN 6:22",
          es: "El Dios mío envió su ángel, el cual cerró la boca de los leones",
          en: "My God has sent his angel, and has shut the lions’ mouths",
          simple: "Mi Dios mandó a su ángel y cerró la boca de los leones.",
        },
      },
    ],
    recap: {
      timeline: [
        "Taken to Babylon as a teenager (about 605 BC)",
        "Refused the king’s food (Daniel 1)",
        "Told and explained Nebuchadnezzar’s dream (Daniel 2)",
        "Read the writing on the wall for Belshazzar (Daniel 5)",
        "Served under Darius; thrown to the lions (Daniel 6)",
        "Visions and prayers for his people (Daniel 7–12)",
        "Served through about 70 years of exile",
      ],
      strengths: ["Consistent habits of prayer", "Respectful to rulers without compromising", "Gave God the credit"],
      failures: ["None are recorded. In prayer he confessed his own sins with his people’s (9:20)."],
      verse: { ref: "DAN 1:8", es: "Y Daniel propuso en su corazón de no contaminarse", en: "But Daniel purposed in his heart that he would not defile himself" },
    },
  },
  {
    id: "jose-maria",
    name: "Joseph, husband of Mary",
    es: "José, esposo de María",
    era: "About 5 BC",
    days: [
      {
        title: "A righteous man",
        read: "MAT 1:18-21",
        facts: [
          "Betrothal was a legal bond. Ending it took a divorce.",
          "Mary was pregnant, and the child wasn’t his. The law allowed public shame, or worse (Deuteronomy 22).",
          "Joseph planned to end it quietly. He was righteous and merciful at the same time.",
          "He was a tekton, a builder or craftsman, from Nazareth, a small village.",
          "The angel called him “son of David.” Through Joseph, Jesus was legally in David’s line.",
        ],
        question: "Joseph wanted to do what was right without humiliating anyone. Where does that balance come from?",
        verse: {
          ref: "MAT 1:20",
          es: "José, hijo de David, no temas de recibir á María tu mujer",
          en: "Joseph, son of David, don’t be afraid to take to yourself Mary as your wife",
          simple: "José, hijo de David, no tengas miedo de recibir a María como tu esposa.",
        },
      },
      {
        title: "He got up",
        read: "MAT 1:24-25; 2:13-15",
        facts: [
          "Joseph never speaks a single recorded word in the Bible. Every scene shows him acting.",
          "When he woke up, he did what the angel commanded.",
          "He named the child Jesus. Naming him was how a father claimed a son as his own.",
          "He fled to Egypt by night with his wife and the child. Egypt had large Jewish communities at the time.",
        ],
        question: "Joseph is remembered for what he did, not what he said. What would that look like for you?",
        verse: {
          ref: "MAT 1:24",
          es: "hizo como el ángel del Señor le había mandado",
          en: "did as the angel of the Lord commanded him",
          simple: "José hizo lo que el ángel del Señor le había mandado.",
        },
      },
      {
        title: "Raising Jesus",
        read: "LUK 2:41-43,48-51",
        facts: [
          "The family went to Jerusalem every year for Passover, about 80 miles each way on foot.",
          "Families traveled in large groups, which is how they went a full day without noticing Jesus was missing.",
          "Mary said, “Your father and I were anxiously looking for you.” Jesus answered that he had to be in “my Father’s house.”",
          "He then went home with them and was “subject to them.”",
          "Joseph disappears from the story after this. He likely died before Jesus began his public work.",
        ],
        question: "What do you think Joseph gave Jesus as a father in those quiet Nazareth years?",
        verse: {
          ref: "LUK 2:52",
          simple: "Jesús seguía creciendo en sabiduría y en estatura, y Dios y la gente lo querían cada vez más.",
        },
      },
    ],
    recap: {
      timeline: [
        "A descendant of David; a craftsman in Nazareth",
        "Engaged to Mary",
        "Planned a quiet divorce; obeyed the angel and married her",
        "Jesus born in Bethlehem",
        "Fled to Egypt by night; later settled in Nazareth",
        "The Passover trip when Jesus was 12",
        "Not mentioned again",
      ],
      strengths: ["Righteous and merciful", "Obeyed immediately", "Protected and provided for his family"],
      failures: ["None are recorded. Like any parent, he once lost track of his son for a day."],
      verse: { ref: "MAT 1:24", es: "hizo como el ángel del Señor le había mandado", en: "did as the angel of the Lord commanded him" },
    },
  },
  {
    id: "juan",
    name: "John the Baptist",
    es: "Juan el Bautista",
    era: "About AD 28",
    days: [
      {
        title: "A voice in the wilderness",
        read: "MAT 3:1-6",
        facts: [
          "John was the son of a priest, Zechariah, and a relative of Jesus (Luke 1).",
          "He preached in the Judean wilderness near the Jordan River.",
          "His camel’s hair and leather belt matched the description of Elijah (2 Kings 1:8).",
          "His message quoted Isaiah 40:3: prepare the way of the Lord.",
          "Asking Jews to be baptized said that being born into the right family wasn’t enough. Each person had to turn back to God.",
        ],
        question: "John’s whole message was “turn around.” What does repentance look like in daily life?",
        verse: {
          ref: "MAT 3:2",
          simple: "Arrepiéntanse, porque el reino de los cielos está cerca.",
        },
      },
      {
        title: "He must increase",
        read: "JOH 3:26-30",
        facts: [
          "John’s disciples were upset: the crowds were leaving John for Jesus.",
          "John compared himself to the bridegroom’s friend, the best man, whose joy is seeing the groom happy.",
          "“He must increase, but I must decrease.”",
          "There was no envy in his answer.",
          "Jesus later said no one born of women was greater than John (Matthew 11:11).",
        ],
        question: "Why is it hard for a man to be glad when someone else gets the spotlight?",
        verse: { ref: "JOH 3:30", simple: "Él tiene que crecer, y yo tengo que hacerme menos." },
      },
      {
        title: "Doubt in prison",
        read: "MAT 11:2-6,11",
        facts: [
          "Herod Antipas jailed John for condemning his marriage to his brother’s wife, Herodias (Matthew 14:3-4).",
          "From prison, John sent a question: “Are you he who comes, or should we look for another?”",
          "Even John had doubts.",
          "Jesus didn’t scold him. He pointed to what was happening: the blind see, the lame walk. Then he praised John publicly.",
          "John was later beheaded at Herod’s birthday party (Matthew 14).",
        ],
        question: "Jesus answered John’s doubt with evidence, not a rebuke. What does that say about honest questions?",
        verse: {
          ref: "MAT 11:6",
          simple: "Dichoso el que no pierde la fe por causa de mí.",
        },
      },
    ],
    recap: {
      timeline: [
        "Born to Zechariah and Elizabeth in their old age",
        "Lived in the wilderness",
        "Preached repentance and baptized at the Jordan",
        "Baptized Jesus",
        "Pointed his own followers to Jesus",
        "Imprisoned by Herod Antipas",
        "Sent his question from prison; beheaded",
      ],
      strengths: ["Told the truth to powerful men", "Humility without envy", "A simple, focused life"],
      failures: ["None are recorded. He had honest doubts in prison."],
      verse: { ref: "JOH 3:30" },
    },
  },
  {
    id: "jesus",
    name: "Jesus",
    es: "Jesús",
    era: "About 4 BC – AD 30",
    days: [
      {
        title: "Tempted",
        read: "MAT 4:1-4,8-10",
        facts: [
          "This came right after his baptism: 40 days of fasting in the wilderness, echoing Israel’s 40 years.",
          "The temptations went after real needs: bread for hunger, a spectacle to prove himself, and power without the cross.",
          "Each answer quotes Deuteronomy, chapters 6 to 8.",
          "Hebrews 4:15 says he was tempted in every way, yet without sin.",
        ],
        question: "Jesus answered temptation with words he already knew. What does that suggest?",
        verse: {
          ref: "MAT 4:4",
          es: "No con solo el pan vivirá el hombre, mas con toda palabra que sale de la boca de Dios.",
          en: "Man shall not live by bread alone, but by every word that proceeds out of God’s mouth.",
          simple: "No solo de pan vive el hombre, sino de toda palabra que sale de la boca de Dios.",
        },
      },
      {
        title: "Ordinary men",
        read: "MAR 1:16-20",
        facts: [
          "Simon, Andrew, James, and John were fishermen in family businesses on the Sea of Galilee. Zebedee had hired workers.",
          "Usually students chose their rabbi. Jesus chose his own followers.",
          "“Come after me, and I will make you into fishers for men.”",
          "They left their nets, and James and John left their father in the boat.",
          "Jesus himself had worked as a craftsman until about 30 (Mark 6:3, Luke 3:23).",
        ],
        question: "Why do you think Jesus chose working men instead of religious experts?",
        verse: {
          ref: "MAR 1:17",
          simple: "Síganme, y yo los haré pescadores de personas.",
        },
      },
      {
        title: "The towel",
        read: "JOH 13:3-5,12-15",
        facts: [
          "Washing feet was a servant’s job. Roads were dusty and people wore sandals.",
          "It was the night before his death.",
          "John says he did it knowing “the Father had given all things into his hands.” He served from security, not insecurity.",
          "Peter objected at first (13:8).",
          "Afterward, Jesus said: “I have given you an example.”",
        ],
        question: "Jesus knew exactly who he was, and then he picked up a towel. How are those two connected?",
        verse: {
          ref: "JOH 13:15",
          simple: "Les he dado el ejemplo, para que hagan lo mismo que yo hice con ustedes.",
        },
      },
      {
        title: "Gethsemane",
        read: "MAT 26:36-41",
        facts: [
          "Gethsemane was an olive grove. Its name means “oil press.”",
          "Jesus said his soul was “exceedingly sorrowful, even to death.”",
          "He asked his closest friends to stay awake with him. They fell asleep.",
          "He prayed honestly to be spared, then said, “not what I desire, but what you desire.”",
          "Luke adds that his sweat fell like drops of blood (Luke 22:44).",
        ],
        question: "Jesus was honest about what he wanted and still surrendered it. What does that look like for a man?",
        verse: {
          ref: "MAT 26:41",
          es: "el espíritu á la verdad está presto, mas la carne enferma.",
          en: "The spirit indeed is willing, but the flesh is weak.",
          simple: "El espíritu quiere hacer lo correcto, pero el cuerpo es débil.",
        },
      },
      {
        title: "He is risen",
        read: "LUK 24:1-7",
        facts: [
          "Crucifixion was Rome’s most shameful form of execution. He died on a Friday and was buried before the Sabbath began.",
          "Women were the first witnesses. Their testimony counted for little in that culture, an odd detail to make up.",
          "The angels asked, “Why do you seek the living among the dead?”",
          "Paul later wrote that the risen Jesus appeared to more than 500 people at once (1 Corinthians 15:6).",
        ],
        question: "If the resurrection is true, what changes for an ordinary man?",
        verse: {
          ref: "LUK 24:6",
          es: "No está aquí, mas ha resucitado",
          en: "He isn’t here, but is risen.",
          simple: "No está aquí. ¡Ha resucitado!",
        },
      },
    ],
    recap: {
      timeline: [
        "Born in Bethlehem (about 4 BC)",
        "Raised in Nazareth; worked as a craftsman",
        "Baptized by John at about 30",
        "Tempted 40 days in the wilderness",
        "About three years of teaching and healing",
        "Washed his disciples’ feet",
        "Crucified in Jerusalem under Pontius Pilate",
        "Rose on the third day",
      ],
      strengths: [
        "Strength under control",
        "Served the people he led",
        "Honest in prayer, and obedient to the end",
      ],
      failures: ["None. Scripture says he was tempted in every way, yet without sin (Hebrews 4:15)."],
      verse: { ref: "MAR 10:45" },
    },
  },
  {
    id: "pedro",
    name: "Peter",
    es: "Pedro",
    era: "AD 30s–60s",
    days: [
      {
        title: "Walking on water",
        read: "MAT 14:25-31",
        facts: [
          "The “fourth watch” was between 3 and 6 in the morning. They had been rowing against the wind all night.",
          "Only Peter asked to step out of the boat.",
          "He walked, then saw the wind, got scared, and started to sink.",
          "His prayer was three words: “Lord, save me!”",
          "Jesus caught him immediately, then asked, “You of little faith, why did you doubt?”",
        ],
        question: "Peter sank, but he was also the only one who got out of the boat. Which part do you remember?",
        verse: {
          ref: "MAT 14:31",
          es: "Oh hombre de poca fe, ¿por qué dudaste?",
          en: "You of little faith, why did you doubt?",
          simple: "Hombre de poca fe, ¿por qué dudaste?",
        },
      },
      {
        title: "The rock, then the rebuke",
        read: "MAT 16:15-18,21-23",
        facts: [
          "This happened at Caesarea Philippi, a city known for its pagan shrines.",
          "Peter answered for the group: “You are the Christ, the Son of the living God.”",
          "Jesus called him Peter, Petros, which means “rock.”",
          "Minutes later, Peter tried to talk Jesus out of the cross. Jesus said, “Get behind me, Satan!”",
          "Same man, same day: inspired insight, then human thinking.",
        ],
        question: "How can a man be right about God one minute and badly wrong the next?",
        verse: {
          ref: "MAT 16:16",
          simple: "Pedro respondió: Tú eres el Cristo, el Hijo del Dios vivo.",
        },
      },
      {
        title: "Three denials",
        read: "LUK 22:54-62",
        facts: [
          "Hours earlier, Peter had promised to go to prison and death with Jesus (22:33).",
          "He followed “from a distance” into the high priest’s courtyard.",
          "He denied knowing Jesus three times. The first was to a servant girl.",
          "The rooster crowed, and “The Lord turned and looked at Peter.” Only Luke records that look.",
          "Peter went out and wept bitterly.",
        ],
        question: "What do you think Peter saw in that look?",
      },
      {
        title: "Do you love me?",
        read: "JOH 21:15-17",
        facts: [
          "After the resurrection, by the Sea of Galilee, Jesus made breakfast over a charcoal fire.",
          "The word for charcoal fire appears only here and at the fire where Peter denied him (John 18:18).",
          "Three questions match the three denials.",
          "Each answer came with a job: feed my sheep.",
          "Jesus didn’t shame him. He restored him and gave him work to do.",
        ],
        question: "Why do you think Jesus gave Peter a job instead of just forgiving him?",
        verse: {
          ref: "JOH 21:17",
          es: "Señor, tú sabes todas las cosas; tú sabes que te amo.",
          en: "Lord, you know everything. You know that I have affection for you.",
          simple: "Señor, tú lo sabes todo; tú sabes que te quiero.",
        },
      },
      {
        title: "Bold",
        read: "ACT 2:14,36-38,41",
        facts: [
          "About seven weeks after denying Jesus to a servant girl, Peter stood up in public in Jerusalem and preached.",
          "About 3,000 people were baptized that day.",
          "Later, the leaders noticed that Peter and John were uneducated, ordinary men, and that they had been with Jesus (4:13).",
          "He still had failures ahead. Paul confronted him for pulling away from Gentile believers (Galatians 2:11-14).",
          "Early tradition says he was crucified in Rome in the 60s AD.",
        ],
        question: "What changed in Peter between the courtyard and this day?",
        verse: {
          ref: "ACT 2:38",
          es: "Arrepentíos, y bautícese cada uno de vosotros en el nombre de Jesucristo para perdón de los pecados",
          en: "Repent and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of sins",
          simple: "Arrepiéntanse, y cada uno de ustedes bautícese en el nombre de Jesucristo para el perdón de sus pecados.",
        },
      },
    ],
    recap: {
      timeline: [
        "A married fisherman in Capernaum (Mark 1:30)",
        "Called by Jesus to fish for people",
        "Walked on water, then sank",
        "Confessed Jesus as the Christ",
        "Denied him three times",
        "Restored by the Sea of Galilee (John 21)",
        "Preached at Pentecost; led the church in Jerusalem",
        "Wrote two letters; died in Rome, by tradition",
      ],
      strengths: ["First to step out", "Honest, wears his heart on his sleeve", "Bold after being restored"],
      failures: ["Impulsive words", "Denied Jesus under pressure", "Hypocrisy toward Gentile believers at Antioch"],
      verse: { ref: "1PE 5:7" },
    },
  },
  {
    id: "pablo",
    name: "Paul",
    es: "Pablo",
    era: "AD 30s–60s",
    days: [
      {
        title: "The persecutor",
        read: "ACT 9:1-6",
        facts: [
          "Saul was a Pharisee from Tarsus, trained under the respected teacher Gamaliel (22:3), and a Roman citizen.",
          "He had approved of the stoning of Stephen (8:1).",
          "He was on his way to arrest believers in Damascus, about 150 miles from Jerusalem.",
          "Jesus asked, “Why do you persecute me?” He took the attacks on his followers personally.",
          "Saul was blind for three days afterward (9:9).",
        ],
        question: "Saul was sincere and completely wrong. How can a man be both?",
        verse: {
          ref: "ACT 9:5",
          es: "Yo soy Jesús á quien tú persigues",
          en: "I am Jesus, whom you are persecuting.",
          simple: "Yo soy Jesús, a quien tú persigues.",
        },
      },
      {
        title: "Brother Saul",
        read: "ACT 9:10-11,13-15,17-18",
        facts: [
          "Ananias, a believer in Damascus, was afraid. He knew Saul’s reputation.",
          "He went anyway, put his hands on him, and called him “Brother Saul.”",
          "Something like scales fell from Saul’s eyes, and he was baptized.",
          "The believers in Jerusalem didn’t trust him at first. Barnabas vouched for him (9:26-27).",
          "He spent about three years, partly in Arabia, before he went up to Jerusalem (Galatians 1:17-18).",
        ],
        question: "Who has been an Ananias or a Barnabas for someone you know: the first to trust them?",
      },
      {
        title: "A thorn in the flesh",
        read: "2CO 12:7-10",
        facts: [
          "Paul never says what the “thorn” was. Guesses include an eye problem, an illness, or constant opposition.",
          "He asked God three times to take it away. The answer was no.",
          "The answer: “My grace is sufficient for you, for my power is made perfect in weakness.”",
          "In 2 Corinthians 11 he lists what he endured: beatings, a stoning, three shipwrecks, hunger, and cold.",
        ],
        question: "What would it mean to see a weakness as a place for God’s strength instead of a thing to hide?",
        verse: {
          ref: "2CO 12:9",
          es: "Bástate mi gracia; porque mi potencia en la flaqueza se perfecciona.",
          en: "My grace is sufficient for you, for my power is made perfect in weakness.",
          simple: "Mi gracia es todo lo que necesitas, porque mi poder se muestra mejor en la debilidad.",
        },
      },
      {
        title: "Content",
        read: "PHI 4:11-13",
        facts: [
          "Paul wrote this from custody, likely house arrest in Rome.",
          "“I have learned” to be content. It didn’t come naturally; he learned it.",
          "The church in Philippi had sent him money when he was in need.",
          "Verse 13 is often quoted for sports. In context it’s about getting through hunger and plenty alike.",
          "He often worked as a tentmaker to support himself (Acts 18:3).",
        ],
        question: "Paul learned contentment. What would you have to learn to be content right now?",
        verse: {
          ref: "PHI 4:13",
          simple: "Todo lo puedo hacer con la fuerza que Cristo me da.",
        },
      },
      {
        title: "Finished the race",
        read: "2TI 4:6-8,16-17",
        facts: [
          "This is likely his last letter, written from prison in Rome while he expected to be executed.",
          "Roman citizens weren’t crucified. Early tradition says he was beheaded under Nero in the 60s AD.",
          "Everyone deserted him at his first hearing. He wrote, “May it not be held against them.”",
          "Years earlier, he and Barnabas split over John Mark (Acts 15:39). In this letter he asks for Mark: “he is useful to me” (4:11).",
        ],
        question: "Paul’s last letter includes making peace with Mark. Why does finishing well include relationships?",
        verse: {
          ref: "2TI 4:7",
          simple: "He peleado la buena batalla, he terminado la carrera y me he mantenido fiel.",
        },
      },
    ],
    recap: {
      timeline: [
        "Born in Tarsus, a Roman citizen",
        "Trained as a Pharisee under Gamaliel",
        "Persecuted the church; approved Stephen’s death",
        "Met Jesus on the road to Damascus (Acts 9)",
        "Three long missionary journeys",
        "Wrote 13 New Testament letters, by tradition",
        "Arrested in Jerusalem and sent to Rome",
        "Executed in Rome, by tradition",
      ],
      strengths: ["Total commitment", "Endurance through suffering", "Mentored younger men like Timothy"],
      failures: [
        "Violently persecuted believers",
        "A sharp split with Barnabas",
        "Called himself the worst of sinners (1 Timothy 1:15)",
      ],
      verse: { ref: "GAL 2:20" },
    },
  },
];

export interface FaithDayRef {
  man: Man;
  manIndex: number;
  dayIndex: number;
  day: FaithDay;
  /** "adan-1" */
  id: string;
  /** Position in the whole path, from 0. */
  n: number;
}

/** Every day in order, with ids like "adan-1". */
export const FAITH_DAYS: FaithDayRef[] = MEN.flatMap((man, manIndex) =>
  man.days.map((day, dayIndex) => ({ man, manIndex, dayIndex, day, id: `${man.id}-${dayIndex + 1}`, n: 0 })),
).map((d, n) => ({ ...d, n }));

export function faithDay(id: string): FaithDayRef | undefined {
  return FAITH_DAYS.find((d) => d.id === id);
}

export function manById(id: string): Man | undefined {
  return MEN.find((m) => m.id === id);
}

/** Book code → names, for showing references. */
export const BOOKS: Record<string, { en: string; es: string }> = {
  GEN: { en: "Genesis", es: "Génesis" },
  EXO: { en: "Exodus", es: "Éxodo" },
  NUM: { en: "Numbers", es: "Números" },
  DEU: { en: "Deuteronomy", es: "Deuteronomio" },
  JOS: { en: "Joshua", es: "Josué" },
  JDG: { en: "Judges", es: "Jueces" },
  RUT: { en: "Ruth", es: "Rut" },
  "1SA": { en: "1 Samuel", es: "1 Samuel" },
  "2SA": { en: "2 Samuel", es: "2 Samuel" },
  "1KI": { en: "1 Kings", es: "1 Reyes" },
  NEH: { en: "Nehemiah", es: "Nehemías" },
  PSA: { en: "Psalm", es: "Salmo" },
  PRO: { en: "Proverbs", es: "Proverbios" },
  DAN: { en: "Daniel", es: "Daniel" },
  MAT: { en: "Matthew", es: "Mateo" },
  MAR: { en: "Mark", es: "Marcos" },
  LUK: { en: "Luke", es: "Lucas" },
  JOH: { en: "John", es: "Juan" },
  ACT: { en: "Acts", es: "Hechos" },
  "2CO": { en: "2 Corinthians", es: "2 Corintios" },
  GAL: { en: "Galatians", es: "Gálatas" },
  PHI: { en: "Philippians", es: "Filipenses" },
  "2TI": { en: "2 Timothy", es: "2 Timoteo" },
  JAM: { en: "James", es: "Santiago" },
  "1PE": { en: "1 Peter", es: "1 Pedro" },
};

/** "GEN 2:7-8,15-17" → "Genesis 2:7-8, 15-17". */
export function refLabel(ref: string, lang: "en" | "es" = "en"): string {
  const sp = ref.indexOf(" ");
  const book = BOOKS[ref.slice(0, sp)];
  const rest = ref
    .slice(sp + 1)
    .replace(/,/g, ", ")
    .replace(/-/g, "–");
  return `${book ? book[lang] : ref.slice(0, sp)} ${rest}`;
}

/** Expands a ref into verse keys like "GEN 2:7". */
export function expandRef(ref: string): string[] {
  const sp = ref.indexOf(" ");
  const book = ref.slice(0, sp);
  const out: string[] = [];
  for (const part of ref.slice(sp + 1).split(";")) {
    const [ch, verses] = part.trim().split(":");
    for (const range of verses.split(",")) {
      const [a, b] = range.split("-").map(Number);
      for (let v = a; v <= (b || a); v++) out.push(`${book} ${ch}:${v}`);
    }
  }
  return out;
}
