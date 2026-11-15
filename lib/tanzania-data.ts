export interface KilimanjaroRoute {
  id: string;
  name: string;
  nickname: string;
  days: number;
  distanceKm: number;
  successRate: number;
  difficulty: "Moderate" | "Challenging" | "Expedition";
  approach: string;
  accommodation: string;
  summary: string;
  highlights: string[];
  /** SVG normalized (x: 0..600, y: 20..180 where smaller y = higher altitude) */
  elevationProfile: {
    day: string;
    camp: string;
    altitudeM: number;
    x: number;
    y: number;
  }[];
}

export interface NationalPark {
  slug: string;
  name: string;
  swahiliName: string;
  region: "Northern Circuit" | "Alpine Frontier" | "Southern Wild" | "Western Frontier" | "Indian Ocean";
  coordinates: string;
  area: string;
  elevation: string;
  bestWindow: string;
  tagline: string;
  description: string;
  wildlife: string[];
  image: string;
  secondaryImage?: string;
  shaderColorA: [number, number, number];
  shaderColorB: [number, number, number];
}

export interface ExpeditionItinerary {
  id: string;
  title: string;
  days: number;
  tier: "Signature" | "Private Fly-In" | "Summit & Bush";
  startingFromUsd: number;
  routeSummary: string;
  parks: string[];
  highlight: string;
  image: string;
}

export interface MigrationSeason {
  months: string;
  phase: string;
  zone: string;
  kilimanjaroCondition: string;
  narrative: string;
  image: string;
}

export const KILIMANJARO_ZONES = [
  {
    zone: "01 · Montane Rainforest",
    altitude: "1,800 – 2,800 m",
    climate: "Humid · Colobus monkeys, moss-draped figs & giant ferns",
    detail: "Morning mist rises through ancient podocarpus trees as you trace red volcanic mud trails out of Lemosho or Machame gates.",
  },
  {
    zone: "02 · Heather & Moorland",
    altitude: "2,800 – 4,000 m",
    climate: "Crisp · Giant lobelia, senecio groundsels & Shira ridges",
    detail: "The canopy opens above the cloud deck, revealing sweeping panoramas across the Shira Plateau and Kenya's plains.",
  },
  {
    zone: "03 · Alpine Semi-Desert",
    altitude: "4,000 – 5,000 m",
    climate: "Stark · Volcanic scree, Lava Tower & lunar obsidian boulders",
    detail: "Following the 'climb high, sleep low' rule up to Lava Tower (4,630 m) prepares red blood cells for summit night.",
  },
  {
    zone: "04 · Arctic Summit Zone",
    altitude: "5,000 – 5,895 m",
    climate: "Sub-zero · Furtwängler Glacier, Stella Point & Uhuru Peak",
    detail: "By headlamp beneath equatorial stars, ascend the crater rim to witness dawn ignite the ancient ice walls of Kibo.",
  },
];

export const KILIMANJARO_ROUTES: KilimanjaroRoute[] = [
  {
    id: "lemosho",
    name: "Lemosho Route",
    nickname: "The Scenic Wilderness Traverse",
    days: 8,
    distanceKm: 70,
    successRate: 94,
    difficulty: "Challenging",
    approach: "West (Londorossi Gate)",
    accommodation: "Private Expedition Canvas Tents",
    summary:
      "Crosses the untouched Shira Plateau before joining the southern circuit with an ideal climb-high, sleep-low acclimatization arc.",
    highlights: [
      "Highest scenic diversity across five ecological zones",
      "Low trail traffic for the first three days",
      "Day-4 acclimatization push past Lava Tower (4,630 m)",
    ],
    elevationProfile: [
      { day: "D1", camp: "Mti Mkubwa", altitudeM: 2650, x: 40, y: 150 },
      { day: "D2", camp: "Shira 1", altitudeM: 3505, x: 115, y: 120 },
      { day: "D3", camp: "Shira 2", altitudeM: 3850, x: 190, y: 108 },
      { day: "D4", camp: "Lava Tower → Barranco", altitudeM: 4630, x: 265, y: 76 },
      { day: "D5", camp: "Karanga", altitudeM: 3995, x: 340, y: 102 },
      { day: "D6", camp: "Barafu Base", altitudeM: 4673, x: 415, y: 74 },
      { day: "D7", camp: "Uhuru Peak", altitudeM: 5895, x: 495, y: 24 },
      { day: "D8", camp: "Mweka Gate", altitudeM: 1640, x: 565, y: 174 },
    ],
  },
  {
    id: "northern-circuit",
    name: "Northern Circuit",
    nickname: "The 360° Quiet Frontier",
    days: 9,
    distanceKm: 90,
    successRate: 96,
    difficulty: "Expedition",
    approach: "West → North → East",
    accommodation: "Full-Service Expedition Camp",
    summary:
      "Kilimanjaro's longest and quietest itinerary. Circles almost the entire massif with nearly 360-degree views toward Kenya and Mawenzi.",
    highlights: [
      "96% summit success with 9 full days of gradual adaptation",
      "Remote northern camps far from main southern crowds",
      "Sweeping views of the Saddle and Mawenzi spires",
    ],
    elevationProfile: [
      { day: "D1", camp: "Mti Mkubwa", altitudeM: 2650, x: 35, y: 150 },
      { day: "D2", camp: "Shira 1", altitudeM: 3505, x: 100, y: 120 },
      { day: "D3", camp: "Shira 2", altitudeM: 3850, x: 165, y: 108 },
      { day: "D4", camp: "Moir Hut", altitudeM: 4200, x: 230, y: 92 },
      { day: "D5", camp: "Buffalo Camp", altitudeM: 4020, x: 295, y: 100 },
      { day: "D6", camp: "Third Cave", altitudeM: 3870, x: 360, y: 106 },
      { day: "D7", camp: "School Hut", altitudeM: 4750, x: 430, y: 70 },
      { day: "D8", camp: "Uhuru Peak", altitudeM: 5895, x: 500, y: 24 },
      { day: "D9", camp: "Mweka Exit", altitudeM: 1640, x: 565, y: 174 },
    ],
  },
  {
    id: "machame",
    name: "Machame Route",
    nickname: "The Dramatic Southern Ridge",
    days: 7,
    distanceKm: 62,
    successRate: 88,
    difficulty: "Challenging",
    approach: "South (Machame Gate)",
    accommodation: "Expedition Tented Camps",
    summary:
      "Steep, exhilarating ridgelines culminating in the Barranco Wall scramble and views beneath Kilimanjaro's shimmering Southern Icefields.",
    highlights: [
      "Iconic Barranco Wall rock scramble at sunrise",
      "Ideal 7-day cadence for strong hikers",
      "Classic glacier views approaching Stella Point",
    ],
    elevationProfile: [
      { day: "D1", camp: "Machame Camp", altitudeM: 2835, x: 40, y: 144 },
      { day: "D2", camp: "Shira Cave", altitudeM: 3750, x: 125, y: 112 },
      { day: "D3", camp: "Lava Tower → Barranco", altitudeM: 4630, x: 215, y: 76 },
      { day: "D4", camp: "Karanga Valley", altitudeM: 3995, x: 305, y: 102 },
      { day: "D5", camp: "Barafu Camp", altitudeM: 4673, x: 395, y: 74 },
      { day: "D6", camp: "Uhuru Peak", altitudeM: 5895, x: 485, y: 24 },
      { day: "D7", camp: "Mweka Exit", altitudeM: 1640, x: 565, y: 174 },
    ],
  },
  {
    id: "rongai",
    name: "Rongai Route",
    nickname: "The Northern Rain-Shadow Trail",
    days: 7,
    distanceKm: 72,
    successRate: 85,
    difficulty: "Moderate",
    approach: "North (Nale Moru Gate)",
    accommodation: "Expedition Tented Camps",
    summary:
      "The only trail approaching from the Kenyan border side—significantly drier even during transitional rains, with views of jagged Mawenzi Peak.",
    highlights: [
      "Lowest rainfall exposure on the mountain",
      "Frequent wildlife sightings along northern forest edge",
      "Gradual ascent across the lunar Saddle to Kibo",
    ],
    elevationProfile: [
      { day: "D1", camp: "Simba Camp", altitudeM: 2625, x: 40, y: 152 },
      { day: "D2", camp: "Second Cave", altitudeM: 3450, x: 125, y: 122 },
      { day: "D3", camp: "Kikelewa", altitudeM: 3600, x: 215, y: 116 },
      { day: "D4", camp: "Mawenzi Tarn", altitudeM: 4315, x: 305, y: 88 },
      { day: "D5", camp: "Kibo Hut", altitudeM: 4720, x: 395, y: 72 },
      { day: "D6", camp: "Uhuru Peak", altitudeM: 5895, x: 485, y: 24 },
      { day: "D7", camp: "Marangu Gate", altitudeM: 1860, x: 565, y: 170 },
    ],
  },
  {
    id: "marangu",
    name: "Marangu Route",
    nickname: "The Historic Hut Trail",
    days: 6,
    distanceKm: 60,
    successRate: 74,
    difficulty: "Moderate",
    approach: "Southeast (Marangu Gate)",
    accommodation: "Permanent A-Frame Mountain Huts",
    summary:
      "Kilimanjaro's oldest established trail and the only route offering solar-lit alpine dormitories instead of canvas tents.",
    highlights: [
      "Permanent wooden A-frame huts with dining halls",
      "Steady, well-graded footpath ideal during wet months",
      "Includes extra acclimatization day at Horombo Hut (3,720 m)",
    ],
    elevationProfile: [
      { day: "D1", camp: "Mandara Hut", altitudeM: 2720, x: 45, y: 148 },
      { day: "D2", camp: "Horombo Hut", altitudeM: 3720, x: 148, y: 112 },
      { day: "D3", camp: "Zebra Rocks Acclim.", altitudeM: 4020, x: 252, y: 100 },
      { day: "D4", camp: "Kibo Hut", altitudeM: 4703, x: 356, y: 72 },
      { day: "D5", camp: "Uhuru Peak", altitudeM: 5895, x: 465, y: 24 },
      { day: "D6", camp: "Marangu Gate", altitudeM: 1860, x: 565, y: 170 },
    ],
  },
];

export const NATIONAL_PARKS: NationalPark[] = [
  {
    slug: "serengeti",
    name: "Serengeti National Park",
    swahiliName: "Siringet · Endless Plains",
    region: "Northern Circuit",
    coordinates: "2°19′S 34°50′E",
    area: "14,763 km²",
    elevation: "920 – 1,850 m",
    bestWindow: "Jun – Oct & Jan – Mar",
    tagline: "The stage of Earth's greatest terrestrial migration.",
    description:
      "Two million wildebeest, zebra, and Thomson's gazelle pulse across golden acacia savannahs and granite kopjes—shadowed by high-density lion prides, cheetahs, and river-crossing Nile crocodiles.",
    wildlife: ["African Lion", "Great Migration", "Cheetah", "Leopard", "Spotted Hyena"],
    image: "/images/serengeti-migration-river.jpg",
    secondaryImage: "/images/serengeti-lions.jpg",
    shaderColorA: [0.08, 0.16, 0.11],
    shaderColorB: [0.76, 0.52, 0.25],
  },
  {
    slug: "kilimanjaro",
    name: "Mount Kilimanjaro",
    swahiliName: "Kilima Njaro · Mountain of Greatness",
    region: "Alpine Frontier",
    coordinates: "3°04′S 37°21′E",
    area: "1,688 km²",
    elevation: "1,820 – 5,895 m",
    bestWindow: "Jan – Mar & Jun – Oct",
    tagline: "Africa's solitary snow-crowned roof rising straight from the equator.",
    description:
      "A dormant three-cone stratovolcano (Kibo, Mawenzi, Shira) spanning tropical cloud forest to hanging glaciers. Our KPAP-certified Chagga mountain crews average 94%+ summit success on 8–9 day traverses.",
    wildlife: ["Black-and-White Colobus", "Abbott's Duiker", "Crowned Eagle", "Eland"],
    image: "/images/kilimanjaro-summit-dawn.jpg",
    secondaryImage: "/images/kilimanjaro-panorama.jpg",
    shaderColorA: [0.05, 0.12, 0.10],
    shaderColorB: [0.46, 0.67, 0.58],
  },
  {
    slug: "ngorongoro",
    name: "Ngorongoro Crater",
    swahiliName: "Hifadhi ya Ngorongoro",
    region: "Northern Circuit",
    coordinates: "3°09′S 35°35′E",
    area: "8,292 km²",
    elevation: "1,700 – 2,286 m",
    bestWindow: "Year-round",
    tagline: "A sunken volcanic Eden sheltering 25,000 animals inside 610-meter walls.",
    description:
      "Descend through mist-shrouded Lerai fever-tree forests onto the 260 km² caldera floor, one of Africa's finest strongholds for endangered black rhinoceros, tusker bull elephants, and soda-lake flamingos.",
    wildlife: ["Black Rhino", "Tusker Elephant", "Lion Pride", "Lesser Flamingo"],
    image: "/images/ngorongoro-luxury-camp.jpg",
    secondaryImage: "/images/ngorongoro-crater.jpg",
    shaderColorA: [0.06, 0.15, 0.11],
    shaderColorB: [0.28, 0.58, 0.42],
  },
  {
    slug: "tarangire",
    name: "Tarangire National Park",
    swahiliName: "Mto Tarangire · River of Baobabs",
    region: "Northern Circuit",
    coordinates: "3°50′S 36°00′E",
    area: "2,850 km²",
    elevation: "1,100 m",
    bestWindow: "Jul – Nov",
    tagline: "Millennia-old baobab cathedrals & 300-strong elephant matriarchies.",
    description:
      "When northern waterholes dry up, the Tarangire River becomes a magnet for staggering elephant herds, fringe-eared oryx, and over 550 bird species beneath towering Adansonia baobabs.",
    wildlife: ["Elephant Super-Herds", "Fringe-Eared Oryx", "Tree-Climbing Lion", "Baobab Canopy"],
    image: "/images/tarangire-baobabs-sunset.jpg",
    secondaryImage: "/images/tarangire-elephants.jpg",
    shaderColorA: [0.11, 0.10, 0.08],
    shaderColorB: [0.85, 0.45, 0.22],
  },
  {
    slug: "ruaha",
    name: "Ruaha National Park",
    swahiliName: "Hifadhi ya Ruaha",
    region: "Southern Wild",
    coordinates: "7°30′S 34°54′E",
    area: "20,226 km²",
    elevation: "750 – 1,868 m",
    bestWindow: "Jun – Nov",
    tagline: "Untamed southern wilderness with 10% of the world's remaining lions.",
    description:
      "Vast, raw, and wonderfully empty. Fly directly from Arusha or Dar es Salaam to track endangered African wild dogs, sable antelope, and baobab-perched leopards along the sand rivers of central Tanzania.",
    wildlife: ["African Wild Dog", "Leopard", "Greater & Lesser Kudu", "Sable Antelope"],
    image: "/images/ruaha-leopard-acacia.jpg",
    shaderColorA: [0.10, 0.09, 0.07],
    shaderColorB: [0.74, 0.53, 0.28],
  },
  {
    slug: "mahale",
    name: "Mahale Mountains & Tanganyika",
    swahiliName: "Milima ya Mahale",
    region: "Western Frontier",
    coordinates: "6°07′S 29°46′E",
    area: "1,650 km²",
    elevation: "773 – 2,462 m",
    bestWindow: "May – Oct",
    tagline: "Wild chimpanzees in misty emerald peaks above Africa's clearest inland sea.",
    description:
      "Accessible only by bush flight and traditional wooden dhow across Lake Tanganyika. Hike vine-draped forest ravines to spend hushed mornings among habituated wild Mimikire chimpanzees, then swim in turquoise bays.",
    wildlife: ["Eastern Chimpanzee", "Red Colobus", "Tanganyika Cichlids", "Fish Eagle"],
    image: "/images/mahale-tanganyika-mist.jpg",
    shaderColorA: [0.04, 0.14, 0.13],
    shaderColorB: [0.22, 0.64, 0.58],
  },
  {
    slug: "zanzibar",
    name: "Zanzibar Archipelago",
    swahiliName: "Unguja & Pemba",
    region: "Indian Ocean",
    coordinates: "6°09′S 39°12′E",
    area: "2,461 km²",
    elevation: "0 – 120 m",
    bestWindow: "Jun – Oct & Dec – Feb",
    tagline: "Swahili spice heritage, coral lagoons, and lateen-sail sunsets after the bush.",
    description:
      "Trade trekking poles and dust for warm Indian Ocean currents. Wander UNESCO Stone Town's carved teak doors, dive Mnemba Atoll, and unwind on Nungwi's powder-white sands.",
    wildlife: ["Hawksbill Sea Turtle", "Spinner Dolphin", "Red Colobus (Jozani)", "Coral Reefs"],
    image: "/images/zanzibar-nungwi.jpg",
    secondaryImage: "/images/zanzibar-reef.jpg",
    shaderColorA: [0.03, 0.13, 0.16],
    shaderColorB: [0.18, 0.72, 0.76],
  },
];

export const EXPEDITION_ITINERARIES: ExpeditionItinerary[] = [
  {
    id: "summit-serengeti",
    title: "Summit to Savannah: Kilimanjaro Lemosho & Serengeti",
    days: 14,
    tier: "Summit & Bush",
    startingFromUsd: 6850,
    routeSummary: "Moshi → Lemosho 8-Day → Ngorongoro Crater → Central Serengeti",
    parks: ["Kilimanjaro", "Ngorongoro", "Serengeti"],
    highlight: "Post-summit recovery lodge in Karatu before flying straight to Serengeti kopjes.",
    image: "/images/kilimanjaro-summit-dawn.jpg",
  },
  {
    id: "northern-circuit-luxury",
    title: "The Great Northern Circuit Private Land Cruiser",
    days: 9,
    tier: "Signature",
    startingFromUsd: 5400,
    routeSummary: "Arusha → Tarangire → Ngorongoro Rim → Serengeti Mara River",
    parks: ["Tarangire", "Ngorongoro", "Serengeti"],
    highlight: "Custom extended 4x4 cruiser with photographic beanbags, fridge & dedicated naturalist.",
    image: "/images/serengeti-migration-river.jpg",
  },
  {
    id: "southern-western-frontier",
    title: "Wild Frontier: Ruaha Big Cats & Mahale Chimps",
    days: 11,
    tier: "Private Fly-In",
    startingFromUsd: 9200,
    routeSummary: "Dar es Salaam → Ruaha Sand Rivers → Lake Tanganyika Dhow → Mahale",
    parks: ["Ruaha", "Mahale Mountains"],
    highlight: "99% crowd-free southern and western circuit via private Cessna Grand Caravan.",
    image: "/images/mahale-tanganyika-mist.jpg",
  },
  {
    id: "bush-to-reef",
    title: "Crater, Plains & Zanzibar Reef Escape",
    days: 10,
    tier: "Signature",
    startingFromUsd: 5950,
    routeSummary: "Tarangire Baobabs → Ngorongoro → Serengeti → Nungwi & Mnemba",
    parks: ["Tarangire", "Ngorongoro", "Serengeti", "Zanzibar"],
    highlight: "Seamless bush-to-beach flight from Seronera airstrip straight to Zanzibar turquoise reefs.",
    image: "/images/zanzibar-nungwi.jpg",
  },
];

export const MIGRATION_SEASONS: MigrationSeason[] = [
  {
    months: "Jan – Mar",
    phase: "Ndutu Calving & Alpine Clearings",
    zone: "Southern Serengeti & Ndutu Plains",
    kilimanjaroCondition: "Dry, luminous summit mornings (80% clear visibility)",
    narrative:
      "Over 500,000 wildebeest calves are born across mineral-rich volcanic short grass plains—triggering breathtaking predator action alongside Kilimanjaro's crisp dry climbing window.",
    image: "/images/serengeti-lions.jpg",
  },
  {
    months: "Apr – May",
    phase: "The Emerald Green Season",
    zone: "Central Serengeti & Ngorongoro Highlands",
    kilimanjaroCondition: "Rongai Northern approach sheltered in rain-shadow",
    narrative:
      "Afternoon showers transform the savannah into luminous emerald velvet. Photographer-favorite dramatic storm clouds, migratory birds, and whisper-quiet crater floors.",
    image: "/images/ngorongoro-crater.jpg",
  },
  {
    months: "Jun – Oct",
    phase: "Grumeti & Mara River Crossings",
    zone: "Western Corridor, Northern Serengeti & Tarangire",
    kilimanjaroCondition: "Prime Peak Climbing Season · Cold, dry & cloudless",
    narrative:
      "Thunderous river crossings at the Mara River coincide with Tarangire's massive dry-season elephant congregations and Tanzania's golden peak Kilimanjaro trekking months.",
    image: "/images/serengeti-migration-river.jpg",
  },
  {
    months: "Nov – Dec",
    phase: "Short Rains & Southern Return",
    zone: "Seronera Kopjes, Ruaha & Zanzibar",
    kilimanjaroCondition: "Quiet trails, dramatic mist & snowcaps after night flurries",
    narrative:
      "Herds sweep south on the scent of fresh grass while Zanzibar enjoys balmy trade winds and Ruaha's baobabs leaf out into vivid green canopies.",
    image: "/images/tarangire-baobabs-sunset.jpg",
  },
];
