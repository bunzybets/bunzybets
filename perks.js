// BunzyBets Perk System — included in all game pages

const PERKS = {
  beer:     { emoji:'🍺', name:'Beer',     color:'rgba(255,180,50,0.8)' },
  mushrooms:{ emoji:'🍄', name:'Mushrooms',color:'rgba(180,80,255,0.8)' },
  coffee:   { emoji:'☕', name:'Coffee',   color:'rgba(160,100,40,0.8)' },
  wine:     { emoji:'🍷', name:'Wine',     color:'rgba(180,20,60,0.8)'  },
  adderall: { emoji:'💊', name:'Adderall', color:'rgba(0,180,255,0.8)'  },
  whiskey:  { emoji:'🥃', name:'Whiskey',  color:'rgba(200,100,20,0.8)' },
  weed:     { emoji:'🌿', name:'Weed',     color:'rgba(40,180,80,0.8)'  },
  cocaine:  { emoji:'❄️', name:'Cocaine',  color:'rgba(200,230,255,0.9)'},
};

function getActivePerk() {
  try { return JSON.parse(localStorage.getItem('bunzy_perk')) || null; }
  catch { return null; }
}

function consumePerkRound() {
  const p = getActivePerk();
  if (!p) return null;
  p.roundsLeft--;
  if (p.roundsLeft <= 0) {
    localStorage.removeItem('bunzy_perk');
    showPerkToast(`${p.emoji} ${p.name} wore off!`);
    updatePerkBadge();
    return null;
  }
  localStorage.setItem('bunzy_perk', JSON.stringify(p));
  updatePerkBadge();
  return p;
}

function hasPerk(id) {
  const p = getActivePerk();
  return p && p.id === id;
}

function updatePerkBadge() {
  const badge = document.getElementById('active-perk-badge');
  if (!badge) return;
  const p = getActivePerk();
  if (p) {
    badge.style.display = 'block';
    badge.textContent = `${p.emoji} ${p.name.toUpperCase()} — ${p.roundsLeft} rounds left`;
  } else {
    badge.style.display = 'none';
  }
}

function showPerkToast(msg) {
  let toast = document.getElementById('perk-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'perk-toast';
    toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a0a3a;border:1px solid rgba(224,64,251,0.4);color:#e8f0ff;padding:14px 28px;border-radius:10px;font-family:Exo 2,sans-serif;font-size:0.9rem;opacity:0;transition:all 0.3s;z-index:999;pointer-events:none;white-space:nowrap;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3000);
}

// Apply perk modifiers to winnings
function applyWinPerk(amount, perk) {
  if (!perk) return amount;
  switch(perk.id) {
    case 'beer':    return amount * 1.10;
    case 'whiskey': return amount * 1.50;
    case 'cocaine': return amount * 3.0;
    case 'wine':    return Math.random() < 0.5 ? amount * 2 : amount;
    case 'weed':    return amount; // weed's guarantee is handled separately
    default:        return amount;
  }
}

// Apply perk modifiers to bet
function applyBetPerk(bet, perk) {
  if (!perk) return bet;
  switch(perk.id) {
    case 'beer':    return bet + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5 + 1);
    case 'whiskey': return Math.floor(bet * 1.5);
    case 'cocaine': return bet * 2;
    default:        return bet;
  }
}

// Mushroom glitch effect on a numeric display element
function maybeMushroomGlitch(elementId, realValue, fakeMin, fakeMax) {
  if (!hasPerk('mushrooms')) return;
  if (Math.random() > 0.3) return; // 30% chance per render
  const el = document.getElementById(elementId);
  if (!el) return;
  const fake = (fakeMin + Math.random() * (fakeMax - fakeMin)).toFixed(2);
  const original = el.textContent;
  el.style.color = '#e040fb';
  el.textContent = typeof realValue === 'string' ? fake + realValue.replace(/[0-9.]/g,'') : fake;
  setTimeout(() => {
    el.textContent = original;
    el.style.color = '';
  }, 180);
}

// Coffee speed multiplier
function getAnimSpeed() {
  return hasPerk('coffee') ? 0.33 : 1;
}

// Blackjack hint for Adderall
function getBlackjackHint(playerTotal, dealerUpcard) {
  if (!hasPerk('adderall')) return null;
  if (playerTotal >= 17) return 'STAND';
  if (playerTotal <= 11) return 'HIT';
  if (playerTotal === 12 && dealerUpcard >= 4 && dealerUpcard <= 6) return 'STAND';
  if (playerTotal >= 13 && playerTotal <= 16 && dealerUpcard >= 2 && dealerUpcard <= 6) return 'STAND';
  return 'HIT';
}

// Weed guarantee — returns bet amount if player would have lost
function weedGuarantee(won, bet, roundNumber) {
  if (!hasPerk('weed')) return 0;
  if (!won && roundNumber % 5 === 0) return bet; // every 5th round get bet back
  return 0;
}

// Mushroom body high — pulse colors on page
function startMushroomVibes() {
  if (!hasPerk('mushrooms')) return;
  let hue = 0;
  const interval = setInterval(() => {
    if (!hasPerk('mushrooms')) { clearInterval(interval); document.body.style.filter = ''; return; }
    hue = (hue + 2) % 360;
    document.body.style.filter = `hue-rotate(${hue * 0.3}deg) saturate(1.2)`;
  }, 100);
}

// Init badge on page load
document.addEventListener('DOMContentLoaded', () => {
  updatePerkBadge();
  startMushroomVibes();
});

// Broke check — redirect to alien intervention page
function checkBroke() {
  const bal = parseFloat(localStorage.getItem('bunzy_balance') || 0);
  if (bal <= 0) {
    localStorage.setItem('bunzy_balance', '0');
    setTimeout(() => window.location.href = 'broke.html', 800);
    return true;
  }
  return false;
}
