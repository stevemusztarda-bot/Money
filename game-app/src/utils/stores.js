// Okładka gry: dla gier Steam budowana z appid (nie trzymamy URL w danych),
// dla pozostałych (mobile/Nintendo) używamy zapisanego adresu.
export function imageUrl(game) {
  if (game.image) return game.image;
  if (game.steam) return `https://cdn.akamai.steamstatic.com/steam/apps/${game.steam}/header.jpg`;
  return '';
}

// Buduje listę oficjalnych sklepów dla gry z jej pól (steam/cs/appStoreUrl).
// Trzymane w aplikacji, a nie w danych — dzięki temu plik z grami jest mniejszy.
export function buildStores(game) {
  const q = encodeURIComponent(game.title);
  const out = [];
  if (game.platform.includes('pc')) {
    if (game.steam) out.push({ name: 'Steam', url: `https://store.steampowered.com/app/${game.steam}/` });
    out.push({ name: 'Epic Games', url: `https://store.epicgames.com/pl/browse?q=${q}&sortBy=relevancy&sortDir=DESC&count=40` });
  }
  if (game.platform.includes('console')) {
    const cs = game.cs || ['ps', 'xbox'];
    if (cs.includes('ps')) out.push({ name: 'PlayStation Store', url: `https://store.playstation.com/pl-pl/search/${q}` });
    if (cs.includes('xbox')) out.push({ name: 'Xbox', url: `https://www.xbox.com/pl-PL/Search/Results?q=${q}` });
    if (cs.includes('nintendo')) out.push({ name: 'Nintendo eShop', url: `https://www.nintendo.com/us/search/?q=${q}&cat=gme` });
  }
  if (game.platform.includes('mobile')) {
    out.push({ name: 'App Store', url: game.appStoreUrl || `https://www.apple.com/pl/search/${q}` });
    out.push({ name: 'Google Play', url: `https://play.google.com/store/search?q=${q}&c=apps` });
  }
  return out;
}
