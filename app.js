const routes=[
 {id:'A',name:'완만한 우회 경로',time:8,distance:520,score:92,status:'추천',badge:'',direction:'120m 앞 자유공원남로 방면 좌회전',note:'🌱 계단 없는 완만한 안전 우회로',conditions:[['✓ 계단 없음'],['✓ 완만한 경사'],['✓ 보행 공간 확보'],['△ 일부 노면 불균형','bad']]},
 {id:'B',name:'빠른 우회 경로',time:6,distance:430,score:73,status:'주의 필요',badge:'warn',direction:'80m 앞 차이나타운로 방면 우회전',note:'⚠️ 급경사 주의 구간 포함',conditions:[['✓ 계단 없음'],['⚠ 급경사 존재','bad'],['✓ 턱 없음'],['✓ 보행 공간 있음']]},
 {id:'C',name:'기존 최단 경로',time:5,distance:350,score:45,status:'이동 어려움',badge:'hard',direction:'직진 방향 계단 진입',note:'⛔ 계단 35단 진입 불가',conditions:[['⚠ 계단 존재','bad'],['⚠ 좁은 보행 공간','bad'],['✓ 턱 없음']]}
];

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const scrim=$('#scrim');
const sheet=$('#obstacleSheet');
const info=$('#infoSheet');
const panel=$('#routePanel');
const navHud=$('#navHud');
const mainTopbar=$('#mainTopbar');
const navBottomCard=$('#navBottomCard');
const userLiveLoc=$('#userLiveLoc');

let isNavigating = false;
let navTimer = null;

function overlay(target){
  [sheet, info, panel].forEach(x=>x && x.classList.remove('show'));
  if(target) target.classList.add('show');
  scrim.classList.add('show');
}

function closeOverlay(){
  [sheet, info].forEach(x=>x && x.classList.remove('show'));
  scrim.classList.remove('show');
}

function showObstacle(){
  if(isNavigating) return;
  overlay(sheet);
}

// Basic Buttons
$('#stairsMarker').onclick = showObstacle;
$('#checkBtn').onclick = showObstacle;
$('#infoBtn').onclick = () => overlay(info);
scrim.onclick = closeOverlay;
$$('[data-close]').forEach(b => b.onclick = closeOverlay);
$('#closeRoutes').onclick = () => panel.classList.remove('show');

// Render Route Cards
function renderRoutes() {
  $('#routeList').innerHTML = routes.map(r=>`
    <article class="route-card ${r.id==='A'?'selected':''}" data-card="${r.id}">
      <div class="route-title">
        <b>Route ${r.id} · ${r.name}</b>
        <span class="badge ${r.badge}">${r.status}</span>
      </div>
      <div class="score">
        <strong>${r.score}</strong><span>점</span>
        <small>· ${r.time}분 · ${r.distance}m</small>
      </div>
      <div class="conditions">
        ${r.conditions.map(c=>`<span class="${c[1]||''}">${c[0]}</span>`).join('')}
      </div>
      <button class="${r.id==='A'?'primary':'secondary'}" data-select="${r.id}">
        ${r.id==='A'?'이 경로로 안내 시작 →':'경로 선택'}
      </button>
    </article>
  `).join('');

  $$('[data-select]').forEach(b => b.onclick = () => startNavigation(b.dataset.select));
}
renderRoutes();

// Select & Start Navigation
function startNavigation(id) {
  const selected = routes.find(r => r.id === id) || routes[0];

  // Route path visual update
  $$('.route').forEach(p => p.classList.toggle('active', p.dataset.route === id));
  
  // Close panels
  panel.classList.remove('show');
  $('#heroCard').style.display = 'none';
  $('#mapLegend').style.display = 'none';

  // Enter Navigation Mode
  isNavigating = true;
  mainTopbar.style.display = 'none';
  navHud.classList.add('show');
  navBottomCard.classList.add('show');
  userLiveLoc.classList.add('show');

  // Fill HUD data
  $('#navNextTurn').textContent = selected.direction;
  $('#navConditionNote').textContent = selected.note;
  $('#navRemainTime').textContent = `${selected.time}분`;
  $('#navRemainDist').textContent = `(${selected.distance}m)`;

  if(selected.id === 'A') {
    $('.nav-turn-icon').textContent = '↰';
    $('.safe-badge').textContent = '✓ 안전 경로 A 주행 중';
    $('.safe-badge').className = 'safe-badge';
  } else if(selected.id === 'B') {
    $('.nav-turn-icon').textContent = '↱';
    $('.safe-badge').textContent = '⚠️ 주의 경로 B 주행 중';
    $('.safe-badge').className = 'safe-badge warn-mode';
  } else {
    $('.nav-turn-icon').textContent = '↑';
    $('.safe-badge').textContent = '⛔ 위험 최단 경로 C';
    $('.safe-badge').className = 'safe-badge hard-mode';
  }

  showToast(`Route ${selected.id} 안내를 시작합니다.`);
  animateUserMovement(selected.id);
}

// Animate User Position on Selected Route
function animateUserMovement(routeId) {
  if (navTimer) clearInterval(navTimer);
  let step = 0;
  
  // Route A keypoints
  const waypointsA = [
    { left: '21%', top: '82%' },
    { left: '16%', top: '65%' },
    { left: '24%', top: '48%' },
    { left: '42%', top: '32%' },
    { left: '60%', top: '20%' },
    { left: '72%', top: '10%' }
  ];

  navTimer = setInterval(() => {
    if (!isNavigating) {
      clearInterval(navTimer);
      return;
    }
    step = (step + 1) % waypointsA.length;
    const pt = waypointsA[step];
    userLiveLoc.style.left = pt.left;
    userLiveLoc.style.top = pt.top;
  }, 2200);
}

// Quit Navigation Mode
$('#quitNavBtn').onclick = () => {
  isNavigating = false;
  if(navTimer) clearInterval(navTimer);
  
  navHud.classList.remove('show');
  navBottomCard.classList.remove('show');
  userLiveLoc.classList.remove('show');
  mainTopbar.style.display = 'flex';
  $('#heroCard').style.display = 'block';
  $('#mapLegend').style.display = 'block';

  // Reset to original state
  $$('.route').forEach(p => p.classList.toggle('active', p.dataset.route === 'C'));
  userLiveLoc.style.left = '21%';
  userLiveLoc.style.top = '82%';
  showToast('경로 안내를 종료했습니다.');
};

// Detour Button
$('#detourBtn').onclick = () => {
  closeOverlay();
  const loading = $('#loading');
  $('#loadingTitle').innerHTML = '접근 가능한 다른 경로를<br>확인하고 있습니다…';
  $('#loadingSub').textContent = '계단 · 경사 · 턱 · 보행 환경 분석';
  loading.classList.add('show');
  setTimeout(() => {
    loading.classList.remove('show');
    $('#heroCard').style.display = 'none';
    panel.classList.add('show');
    // Pre-highlight Route A
    $$('.route').forEach(p => p.classList.toggle('active', p.dataset.route === 'A'));
  }, 750);
};

// Toast
function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}


