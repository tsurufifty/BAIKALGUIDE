/**
 * Demo content for first-run seeding (ru + en).
 * Places are real locations in Buryatia; artists are demo placeholders
 * to avoid attributing invented facts to real performers.
 */

type Block = { type: 'paragraph'; children: { type: 'text'; text: string }[] };
const p = (text: string): Block[] => [{ type: 'paragraph', children: [{ type: 'text', text }] }];

export interface GeoPoint {
  label?: string;
  longitude: number;
  latitude: number;
  zoom?: number;
}

export interface LocaleFields {
  title: string;
  description: Block[];
}

export interface LocationSeed {
  key: string;
  category: 'nature' | 'culture' | 'gastronomy' | 'viewpoint' | 'lodging' | 'transport' | 'other';
  coordinates: GeoPoint;
  ru: LocaleFields;
  en: LocaleFields;
}

export interface RouteSeed {
  key: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'all_year';
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert';
  activityType: 'active' | 'culture' | 'nature' | 'gastronomy' | 'relax';
  durationDays: number;
  price: number;
  coordinates: GeoPoint[];
  locationKeys: string[];
  ru: LocaleFields & { duration: string; logistics: Block[] };
  en: LocaleFields & { duration: string; logistics: Block[] };
}

export interface EventSeed {
  key: string;
  date: string;
  locationKey: string;
  coordinates: GeoPoint;
  ru: LocaleFields & { venue: string };
  en: LocaleFields & { venue: string };
}

export interface ArtistSeed {
  key: string;
  ru: { name: string; genre: string; biography: Block[] };
  en: { name: string; genre: string; biography: Block[] };
}

export interface ArticleSeed {
  key: string;
  category: 'interview' | 'selection' | 'review' | 'news' | 'story';
  publishedDate: string;
  artistKeys: string[];
  ru: { title: string; excerpt: string; content: Block[] };
  en: { title: string; excerpt: string; content: Block[] };
}

export const locations: LocationSeed[] = [
  {
    key: 'ivolginsky-datsan',
    category: 'culture',
    coordinates: { label: 'Иволгинский дацан', longitude: 107.276, latitude: 51.75, zoom: 13 },
    ru: {
      title: 'Иволгинский дацан',
      description: p('Главный буддийский монастырь России и резиденция Пандито Хамбо-ламы, недалеко от Улан-Удэ.'),
    },
    en: {
      title: 'Ivolginsky Datsan',
      description: p('The main Buddhist monastery in Russia and residence of the Pandito Khambo Lama, near Ulan-Ude.'),
    },
  },
  {
    key: 'svyatoy-nos',
    category: 'viewpoint',
    coordinates: { label: 'Полуостров Святой Нос', longitude: 108.78, latitude: 53.66, zoom: 10 },
    ru: {
      title: 'Полуостров Святой Нос',
      description: p('Крупнейший полуостров Байкала в составе Забайкальского национального парка с панорамными видами.'),
    },
    en: {
      title: 'Svyatoy Nos Peninsula',
      description: p('The largest peninsula on Lake Baikal, part of Zabaikalsky National Park, with panoramic views.'),
    },
  },
  {
    key: 'chivyrkuy-bay',
    category: 'nature',
    coordinates: { label: 'Чивыркуйский залив', longitude: 109.02, latitude: 53.8, zoom: 10 },
    ru: {
      title: 'Чивыркуйский залив',
      description: p('Тёплый мелководный залив Байкала с островами и термальными источниками Змеёвой бухты.'),
    },
    en: {
      title: 'Chivyrkuy Bay',
      description: p('A warm, shallow bay of Lake Baikal with islands and the hot springs of Zmeyovaya Bay.'),
    },
  },
];

export const routes: RouteSeed[] = [
  {
    key: 'datsan-trail',
    season: 'all_year',
    difficulty: 'easy',
    activityType: 'culture',
    durationDays: 1,
    price: 2500,
    coordinates: [{ label: 'Старт: Улан-Удэ', longitude: 107.584, latitude: 51.834, zoom: 11 }],
    locationKeys: ['ivolginsky-datsan'],
    ru: {
      title: 'Дорога к дацанам',
      duration: '1 день',
      description: p('Однодневный культурный маршрут по буддийским храмам близ Улан-Удэ с посещением Иволгинского дацана.'),
      logistics: p('Старт из Улан-Удэ. До Иволгинского дацана — маршрутка №130 от центрального рынка (~40 мин) или такси. Возьмите наличные, головной убор и закрытую одежду для посещения храмов.'),
    },
    en: {
      title: 'The Datsan Trail',
      duration: '1 day',
      description: p('A one-day cultural route to Buddhist temples near Ulan-Ude, including the Ivolginsky Datsan.'),
      logistics: p('Start from Ulan-Ude. Reach the Ivolginsky Datsan by marshrutka #130 from the central market (~40 min) or by taxi. Bring cash, a head covering and modest clothing for the temples.'),
    },
  },
  {
    key: 'svyatoy-nos-trek',
    season: 'summer',
    difficulty: 'hard',
    activityType: 'active',
    durationDays: 4,
    price: 18000,
    coordinates: [
      { label: 'Святой Нос', longitude: 108.78, latitude: 53.66, zoom: 10 },
      { label: 'Чивыркуйский залив', longitude: 109.02, latitude: 53.8, zoom: 10 },
    ],
    locationKeys: ['svyatoy-nos', 'chivyrkuy-bay'],
    ru: {
      title: 'Трек по Святому Носу и Чивыркую',
      duration: '4 дня',
      description: p('Многодневный поход по хребту Святого Носа с выходом к Чивыркуйскому заливу и горячим источникам.'),
      logistics: p('Заброска из Усть-Баргузина: переправа через перешеек, далее тропа на хребет. Нужны регистрация в Забайкальском нацпарке, треккинговые ботинки, палатка и запас воды. Связь на маршруте нестабильна.'),
    },
    en: {
      title: 'Svyatoy Nos & Chivyrkuy Trek',
      duration: '4 days',
      description: p('A multi-day trek across the Svyatoy Nos ridge down to Chivyrkuy Bay and its hot springs.'),
      logistics: p('Access from Ust-Barguzin: cross the isthmus, then take the ridge trail. You need a Zabaikalsky National Park permit, trekking boots, a tent and a water supply. Mobile coverage is patchy along the route.'),
    },
  },
];

export const events: EventSeed[] = [
  {
    key: 'surkharban',
    date: '2026-07-04T10:00:00.000Z',
    locationKey: 'ivolginsky-datsan',
    coordinates: { label: 'Улан-Удэ', longitude: 107.584, latitude: 51.834, zoom: 11 },
    ru: {
      title: 'Сурхарбан',
      venue: 'Ипподром, Улан-Удэ',
      description: p('Традиционный бурятский праздник с тремя играми мужей: стрельбой из лука, борьбой и конными скачками.'),
    },
    en: {
      title: 'Surkharban',
      venue: 'Hippodrome, Ulan-Ude',
      description: p('A traditional Buryat festival featuring the three games of men: archery, wrestling and horse racing.'),
    },
  },
  {
    key: 'voice-of-nomads',
    date: '2026-08-15T16:00:00.000Z',
    locationKey: 'ivolginsky-datsan',
    coordinates: { label: 'Улан-Удэ', longitude: 107.584, latitude: 51.834, zoom: 11 },
    ru: {
      title: 'Голос кочевников',
      venue: 'Этнографический музей, Улан-Удэ',
      description: p('Международный фестиваль этнической музыки под открытым небом с артистами со всего мира.'),
    },
    en: {
      title: 'Voice of Nomads',
      venue: 'Ethnographic Museum, Ulan-Ude',
      description: p('An open-air international world-music festival featuring artists from across the globe.'),
    },
  },
];

export const artists: ArtistSeed[] = [
  {
    key: 'ayan',
    ru: { name: 'Аян', genre: 'этно-электроника', biography: p('Демо-исполнитель: сочетает бурятские мелодии с современным электронным звучанием.') },
    en: { name: 'Ayan', genre: 'ethno-electronica', biography: p('Demo artist: blends Buryat melodies with a modern electronic sound.') },
  },
  {
    key: 'tengeri',
    ru: { name: 'Тэнгэри', genre: 'горловое пение / фьюжн', biography: p('Демо-исполнитель: фьюжн горлового пения и живых инструментов.') },
    en: { name: 'Tengeri', genre: 'throat singing / fusion', biography: p('Demo artist: a fusion of throat singing and live instruments.') },
  },
];

export const articles: ArticleSeed[] = [
  {
    key: 'interview-ayan',
    category: 'interview',
    publishedDate: '2026-05-01T09:00:00.000Z',
    artistKeys: ['ayan'],
    ru: {
      title: 'Интервью: звук степи в наушниках',
      excerpt: 'Разговор о том, как древние мелодии звучат в электронной обработке.',
      content: p('Демо-статья для проверки музыкального блога. Здесь будет полное интервью с артистом.'),
    },
    en: {
      title: 'Interview: the sound of the steppe in your headphones',
      excerpt: 'A conversation about how ancient melodies sound in electronic form.',
      content: p('Demo article to test the music blog. The full interview with the artist goes here.'),
    },
  },
  {
    key: 'selection-summer',
    category: 'selection',
    publishedDate: '2026-05-20T09:00:00.000Z',
    artistKeys: ['ayan', 'tengeri'],
    ru: {
      title: 'Подборка: что слушать летом на Байкале',
      excerpt: 'Пять треков для дороги вдоль берега.',
      content: p('Демо-подборка для проверки раздела. Здесь будет плейлист и описания.'),
    },
    en: {
      title: 'Selection: a Baikal summer playlist',
      excerpt: 'Five tracks for the road along the shore.',
      content: p('Demo selection to test the section. The playlist and notes go here.'),
    },
  },
];
