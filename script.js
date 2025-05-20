// Конвертер SteamID64 → SteamID32
function toSteamID32(steamID64) {
  return (BigInt(steamID64) - 76561197960265728n);
}

// Конвертер rank_tier в текст ранга
function convertRank(rankTier) {
  if (!rankTier) return "Unranked";
  
  const tiers = {
    10: "Herald", 20: "Guardian", 30: "Crusader",
    40: "Archon", 50: "Legend", 60: "Ancient",
    70: "Divine", 80: "Immortal"
  };
  
  const rank = Math.floor(rankTier / 10) * 10;
  const star = rankTier % 10;
  
  return tiers[rank] + (star > 0 ? ` ${star}` : "");
}

// Получение ранга
async function fetchPlayerRank(steamID64) {
  try {
    const steamID32 = toSteamID32(steamID64);
    const response = await fetch(`https://api.opendota.com/api/players/${steamID32}`);
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    return convertRank(data.rank_tier);
  } catch (error) {
    console.error("Ошибка получения ранга:", error);
    return "Error";
  }
}

// Обновление рангов всех игроков
async function updateAllRanks() {
  const playerElements = document.querySelectorAll('.player');
  
  for (const playerElement of playerElements) {
    try {
      const steamID64 = playerElement.dataset.steamid;
      const rankElement = playerElement.querySelector('.rank-value');
      
      if (steamID64 && rankElement) {
        rankElement.textContent = "Loading...";
        const rank = await fetchPlayerRank(steamID64);
        rankElement.textContent = rank;
        rankElement.dataset.rank = rank; // Для цветового оформления
      }
    } catch (error) {
      console.error("Ошибка обновления ранга:", error);
    }
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  updateAllRanks();
  
  // Кнопка "Наверх"
  const backToTopButton = document.createElement('div');
  backToTopButton.className = 'back-to-top';
  backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTopButton);

  window.addEventListener('scroll', () => {
    backToTopButton.classList.toggle('active', window.scrollY > 300);
  });

  backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});