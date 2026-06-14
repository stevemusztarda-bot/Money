// Prosty system tłumaczeń UI (bez zależności). Dane gier zostają jak ze Steam.
export const LANGUAGES = [
  { id: 'pl', label: 'Polski', flag: '🇵🇱' },
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
];

const DICT = {
  'app.subtitle': {
    pl: 'Znajdź idealną grę dla siebie w kilka sekund',
    en: 'Find your perfect game in seconds',
    de: 'Finde dein perfektes Spiel in Sekunden',
    es: 'Encuentra tu juego perfecto en segundos',
    ru: 'Найди идеальную игру за секунды',
    fr: 'Trouve ton jeu parfait en quelques secondes',
  },
  'nav.finder': { pl: 'Znajdź grę', en: 'Find a game', de: 'Spiel finden', es: 'Buscar juego', ru: 'Найти игру', fr: 'Trouver un jeu' },
  'nav.deals': { pl: 'Promocje', en: 'Deals', de: 'Angebote', es: 'Ofertas', ru: 'Акции', fr: 'Promotions' },
  'nav.premieres': { pl: 'Premiery', en: 'Premieres', de: 'Neuheiten', es: 'Estrenos', ru: 'Премьеры', fr: 'Sorties' },
  'nav.my': { pl: 'Moje', en: 'Mine', de: 'Meins', es: 'Lo mío', ru: 'Моё', fr: 'Mes jeux' },
  'nav.settings': { pl: 'Ustawienia', en: 'Settings', de: 'Einstellungen', es: 'Ajustes', ru: 'Настройки', fr: 'Réglages' },

  'wizard.platform.title': { pl: 'Na czym grasz?', en: 'What do you play on?', de: 'Worauf spielst du?', es: '¿En qué juegas?', ru: 'На чём играешь?', fr: 'Sur quoi joues-tu ?' },
  'wizard.budget.title': { pl: 'Jaki masz budżet?', en: "What's your budget?", de: 'Wie hoch ist dein Budget?', es: '¿Cuál es tu presupuesto?', ru: 'Какой у тебя бюджет?', fr: 'Quel est ton budget ?' },
  'wizard.genre.title': { pl: 'Co lubisz grać?', en: 'What do you like to play?', de: 'Was spielst du gern?', es: '¿Qué te gusta jugar?', ru: 'Во что любишь играть?', fr: 'À quoi aimes-tu jouer ?' },
  'wizard.back': { pl: 'Wstecz', en: 'Back', de: 'Zurück', es: 'Atrás', ru: 'Назад', fr: 'Retour' },
  'wizard.next': { pl: 'Dalej', en: 'Next', de: 'Weiter', es: 'Siguiente', ru: 'Далее', fr: 'Suivant' },
  'wizard.show': { pl: 'Pokaż gry 🎮', en: 'Show games 🎮', de: 'Spiele zeigen 🎮', es: 'Ver juegos 🎮', ru: 'Показать игры 🎮', fr: 'Voir les jeux 🎮' },

  'results.title': { pl: 'Twoje rekomendacje', en: 'Your recommendations', de: 'Deine Empfehlungen', es: 'Tus recomendaciones', ru: 'Твои рекомендации', fr: 'Tes recommandations' },
  'results.found': { pl: 'Znaleziono', en: 'Found', de: 'Gefunden', es: 'Encontrado', ru: 'Найдено', fr: 'Trouvé' },
  'results.search': { pl: 'Szukaj po nazwie lub tagu…', en: 'Search by name or tag…', de: 'Nach Name oder Tag suchen…', es: 'Buscar por nombre o etiqueta…', ru: 'Поиск по названию или тегу…', fr: 'Rechercher par nom ou tag…' },
  'results.sort': { pl: 'Sortuj:', en: 'Sort:', de: 'Sortieren:', es: 'Ordenar:', ru: 'Сортировка:', fr: 'Trier :' },
  'results.free': { pl: '🆓 Darmowe', en: '🆓 Free', de: '🆓 Gratis', es: '🆓 Gratis', ru: '🆓 Бесплатные', fr: '🆓 Gratuit' },
  'results.fav': { pl: '❤️ Ulubione', en: '❤️ Favorites', de: '❤️ Favoriten', es: '❤️ Favoritos', ru: '❤️ Избранное', fr: '❤️ Favoris' },
  'results.restart': { pl: 'Zacznij od nowa', en: 'Start over', de: 'Neu starten', es: 'Empezar de nuevo', ru: 'Начать заново', fr: 'Recommencer' },
  'results.more': { pl: 'Pokaż więcej', en: 'Show more', de: 'Mehr anzeigen', es: 'Ver más', ru: 'Показать ещё', fr: 'Voir plus' },
  'results.empty': { pl: 'Brak wyników', en: 'No results', de: 'Keine Ergebnisse', es: 'Sin resultados', ru: 'Ничего не найдено', fr: 'Aucun résultat' },

  'card.buy': { pl: 'Gdzie kupić', en: 'Where to buy', de: 'Wo kaufen', es: 'Dónde comprar', ru: 'Где купить', fr: 'Où acheter' },
  'card.free': { pl: 'Darmowa', en: 'Free', de: 'Gratis', es: 'Gratis', ru: 'Бесплатно', fr: 'Gratuit' },

  'my.title': { pl: 'Moje gry i opinie', en: 'My games & reviews', de: 'Meine Spiele & Rezensionen', es: 'Mis juegos y reseñas', ru: 'Мои игры и отзывы', fr: 'Mes jeux et avis' },
  'my.liked': { pl: 'Polubione gry', en: 'Liked games', de: 'Gemochte Spiele', es: 'Juegos que te gustan', ru: 'Понравившиеся игры', fr: 'Jeux aimés' },
  'my.reviews': { pl: 'Moje opinie', en: 'My reviews', de: 'Meine Rezensionen', es: 'Mis reseñas', ru: 'Мои отзывы', fr: 'Mes avis' },
  'my.empty.liked': { pl: 'Brak polubionych gier — kliknij serduszko na karcie.', en: 'No liked games yet — tap the heart on a card.', de: 'Noch keine Spiele — tippe auf das Herz.', es: 'Aún no hay juegos — toca el corazón.', ru: 'Пока пусто — нажми сердечко на карточке.', fr: "Aucun jeu — touche le cœur sur une carte." },
  'my.empty.reviews': { pl: 'Nie dodałeś jeszcze żadnej opinii.', en: "You haven't written any reviews yet.", de: 'Du hast noch keine Rezension geschrieben.', es: 'Aún no has escrito reseñas.', ru: 'Вы ещё не оставили отзывов.', fr: "Tu n'as pas encore écrit d'avis." },

  'settings.title': { pl: 'Ustawienia', en: 'Settings', de: 'Einstellungen', es: 'Ajustes', ru: 'Настройки', fr: 'Réglages' },
  'settings.language': { pl: 'Język', en: 'Language', de: 'Sprache', es: 'Idioma', ru: 'Язык', fr: 'Langue' },
  'settings.accent': { pl: 'Kolor motywu', en: 'Accent color', de: 'Akzentfarbe', es: 'Color de acento', ru: 'Цвет акцента', fr: "Couleur d'accent" },
  'settings.profile': { pl: 'Profil', en: 'Profile', de: 'Profil', es: 'Perfil', ru: 'Профиль', fr: 'Profil' },
  'settings.nick': { pl: 'Twój nick', en: 'Your nickname', de: 'Dein Nickname', es: 'Tu apodo', ru: 'Твой ник', fr: 'Ton pseudo' },
  'settings.avatar': { pl: 'Awatar', en: 'Avatar', de: 'Avatar', es: 'Avatar', ru: 'Аватар', fr: 'Avatar' },

  'review.your': { pl: 'Twoja opinia', en: 'Your review', de: 'Deine Rezension', es: 'Tu reseña', ru: 'Твой отзыв', fr: 'Ton avis' },
  'review.placeholder': { pl: 'Napisz, co myślisz o tej grze…', en: 'Write what you think about this game…', de: 'Schreibe deine Meinung…', es: 'Escribe tu opinión…', ru: 'Напиши своё мнение…', fr: 'Écris ton avis…' },
  'review.save': { pl: 'Zapisz opinię', en: 'Save review', de: 'Speichern', es: 'Guardar', ru: 'Сохранить', fr: 'Enregistrer' },
  'review.steam': { pl: 'Opinie graczy (Steam)', en: 'Player reviews (Steam)', de: 'Spielerbewertungen (Steam)', es: 'Reseñas (Steam)', ru: 'Отзывы игроков (Steam)', fr: 'Avis des joueurs (Steam)' },

  'notif.title': { pl: 'Promocje na Twoje gry', en: 'Deals on your games', de: 'Angebote für deine Spiele', es: 'Ofertas en tus juegos', ru: 'Акции на твои игры', fr: 'Promos sur tes jeux' },
  'notif.empty': { pl: 'Brak promocji na ulubione gry. Dodaj gry do ulubionych ❤️', en: 'No deals on your favorites yet. Add games with ❤️', de: 'Keine Angebote. Füge Favoriten mit ❤️ hinzu', es: 'Sin ofertas. Añade favoritos con ❤️', ru: 'Акций нет. Добавь игры в избранное ❤️', fr: 'Aucune promo. Ajoute des favoris ❤️' },
};

export function translate(lang, key) {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang] || entry.en || entry.pl || key;
}
