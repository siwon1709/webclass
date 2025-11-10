// 데모 데이터 (이미지 URL은 자유로 교체)
const PLACES = [
  // ...existing data...
  {
    id:"p39", type:"food", city:"제주",
    name:"제주 고등어구이",
    rating:4.6, reviews:890, popular:86, recent:20250919,
    address:"제주시 연동 123-45",
    price:"15,000~25,000원",
    signature:{ name:"제주 고등어구이 정식", price:"18,000원" },
    tags:["고등어구이","제주","로컬맛집","생선구이"],
    desc:"제주 근해에서 잡은 고등어로만 요리하는 맛집.",
    img:"https://images.unsplash.com/photo-1580476262798-bddd9f4b7369",
    map:{lat:33.486, lng:126.485}
  },
  {
    id:"p40", type:"food", city:"제주",
    name:"제주 고등어구이 분점",
    rating:4.5, reviews:420, popular:82, recent:20251020,
    address:"제주시 조천읍 해안로 88",
    price:"14,000~22,000원",
    signature:{ name:"고등어구이 정식", price:"16,000원" },
    tags:["고등어구이","제주","분점","생선구이"],
    desc:"본점 스타일을 계승한 분점. 가성비 좋은 정식 메뉴가 인기입니다.",
    img:"https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?q=80&w=1200&auto=format&fit=crop",
    map:{lat:33.512, lng:126.726}
  }
];

// --- 추가: 연령대별 선호 데이터 보장 (존재하지 않으면 결정적 생성) ---
function deterministicSeed(str){
  let s=0; for(let i=0;i<str.length;i++) s = (s*31 + str.charCodeAt(i))|0; return Math.abs(s);
}
function genAgeDist(place){
  // 반환: { "10s":n, "20s":n, "30s":n, "40s":n, "50s":n } 합이 100
  const seed = deterministicSeed(place.id || place.name || Math.random().toString());
  // 기본값은 인기(popular)와 평점으로 가중치 적용
  const base = Math.max(1, place.popular || 50);
  const r = (seed % 100) / 100;
  // 간단 분배
  const a = Math.floor(10 + (seed % 30)); // 10대
  const b = Math.floor(15 + ((seed>>2) % 40)); // 20대
  const c = Math.floor(20 + ((seed>>4) % 30)); // 30대
  const d = Math.floor(10 + ((seed>>6) % 25)); // 40대
  const e = Math.floor(5 + ((seed>>8) % 20)); // 50대+
  const arr = [a,b,c,d,e];
  const sum = arr.reduce((s,x)=>s+x,0) || 1;
  return {
    "10s": Math.round((a/sum)*100),
    "20s": Math.round((b/sum)*100),
    "30s": Math.round((c/sum)*100),
    "40s": Math.round((d/sum)*100),
    "50s": Math.round((e/sum)*100)
  };
}
// 보장: 모든 장소에 popByAge 프로퍼티가 있도록 함
PLACES.forEach(p=>{
  if(!p.popByAge){
    p.popByAge = genAgeDist(p);
  }
  // --- 요리 종류(cuisine) 추론(없으면 설정) ---
  if(!p.cuisine){
    const tags = ((p.tags||[]).join(" ") + " " + (p.name||"") + " " + (p.desc||"")).toLowerCase();
    const is = s => tags.includes(s);
    if(is("국밥")||is("한정식")||is("파전")||is("밀면")||is("멸치")||is("고등어")||is("국수")||is("오뎅")||is("갈비")||is("곱창")||is("한식")) p.cuisine = "korean";
    else if(is("스시")||is("초밥")||is("오마카세")||is("멸치")&&is("국")) p.cuisine = "japanese";
    else if(is("스테이크")||is("파스타")||is("피자")||is("타코")||is("멕시코")||is("양식")||is("퓨전")) p.cuisine = "western";
    else if(is("중식")||is("차이나")||is("중화")||is("짬뽕")||is("짜장")||is("중화요리")) p.cuisine = "chinese";
    else if(is("퓨전")||is("퓨전요리")) p.cuisine = "fusion";
    else p.cuisine = "other";
  }
});

// 상태 (연령대 필터 추가 및 요리 종류)
const state = {
  query:"",
  city:"",
  sort:"popular",
  filter:"all",
  age:"",
  cuisine:"", // 추가
  favorites: new Set(JSON.parse(localStorage.getItem("favorites")||"[]"))
};

// 유틸
const fmt = n => n.toLocaleString("ko-KR");
const score = p => ({
  popular: -p.popular,
  rating: -p.rating,
  recent: -p.recent
});

// 렌더
const grid = document.getElementById("grid");
const empty = document.getElementById("empty");

function render(){
  const q = state.query.trim().toLowerCase();
  let list = PLACES.filter(p=>{
    const passesFilter = state.filter==="all" || p.type===state.filter || (state.filter==="budget" && (p.price||"").match(/[0-9]/) && /6,?000|7,?000|8,?000|만원|저렴|가성비/.test(p.price));
    const passesCity = !state.city || p.city===state.city;
    const passesCuisine = !state.cuisine || p.cuisine===state.cuisine;
    const text = [p.name,p.address,p.price,(p.tags||[]).join(" "),p.city,p.desc].join(" ").toLowerCase();
    const passesQuery = !q || text.includes(q);
    return passesFilter && passesCity && passesCuisine && passesQuery;
  });

  // 연령대 선택 시 해당 연령대 선호도 기준으로 우선 정렬
  if(state.age){
    list.sort((a,b)=> (b.popByAge?.[state.age]||0) - (a.popByAge?.[state.age]||0));
  } else {
    list.sort((a,b)=> score(a)[state.sort] - score(b)[state.sort]);
  }

  grid.innerHTML = "";
  if(list.length===0){
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for(const p of list){
    const el = document.createElement("article");
    el.className="card";
    el.innerHTML = `
      <div class="thumb">
        <img alt="${p.name}" src="${p.img}">
        <span class="badge">★ ${p.rating.toFixed(1)} · 리뷰 ${fmt(p.reviews)}</span>
      </div>
      <div class="card-body">
        <div class="title">${p.name}</div>
        <div class="meta">
          <span>${p.city}</span>
          <span>·</span>
          <span>${p.address||"주소 정보 없음"}</span>
          <span>·</span>
          <span class="pill" style="font-weight:600">${( {korean:"한식", western:"양식", chinese:"중식", japanese:"일식", fusion:"퓨전", other:"기타"}[p.cuisine] ) || p.cuisine}</span>
        </div>
        <div class="tags">
          ${(p.tags||[]).slice(0,4).map(t=>`<span class="tag">${t}</span>`).join("")}
        </div>
        <div class="card-actions">
          <button class="btn btn-primary" data-open="${p.id}">자세히 보기</button>
          <button class="btn btn-like" data-fav="${p.id}">
            ${state.favorites.has(p.id) ? "즐겨찾기 해제" : "즐겨찾기"}
          </button>
        </div>
        <div style="margin-top:10px" class="pill">연령대 선호: 10대 ${p.popByAge["10s"]}% · 20대 ${p.popByAge["20s"]}% · 30대 ${p.popByAge["30s"]}%</div>
      </div>
    `;
    grid.appendChild(el);
  }
}

// 이벤트: 검색/필터/정렬 (요리 종류 추가)
document.getElementById("q").addEventListener("input", e => { state.query = e.target.value; render(); });
document.getElementById("city").addEventListener("change", e => { state.city = e.target.value; render(); });
document.getElementById("cuisine").addEventListener("change", e => { state.cuisine = e.target.value; render(); });
document.getElementById("sort").addEventListener("change", e => { state.sort = e.target.value; render(); });
document.getElementById("clear").addEventListener("click", ()=>{
  state.query=""; state.city=""; state.sort="popular"; state.filter="all";
  state.age = "";
  state.cuisine = ""; // 요리 종류 초기화
  document.getElementById("q").value="";
  document.getElementById("city").value="";
  document.getElementById("cuisine").value = ""; // UI 초기화
  document.getElementById("ageFilter").value = "";
  document.getElementById("sort").value="popular";
  document.querySelectorAll(".chip").forEach(ch=>ch.classList.toggle("active", ch.dataset.filter==="all"));
  render();
});

// 카테고리 칩
document.querySelectorAll(".chip").forEach(chip=>{
  chip.addEventListener("click", ()=>{
    document.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    state.filter = chip.dataset.filter;
    render();
  });
});

// 델리게이션: 카드 버튼
grid.addEventListener("click", e=>{
  const openId = e.target.closest("button")?.dataset?.open;
  const favId = e.target.closest("button")?.dataset?.fav;
  if(openId){ openModal(openId); }
  if(favId){
    if(state.favorites.has(favId)) state.favorites.delete(favId);
    else state.favorites.add(favId);
    localStorage.setItem("favorites", JSON.stringify([...state.favorites]));
    render();
  }
});

// 즐겨찾기 보기
document.getElementById("showFavorites").addEventListener("click", ()=>{
  const ids = new Set(state.favorites);
  const favs = PLACES.filter(p=>ids.has(p.id));
  if(favs.length===0){
    alert("즐겨찾기가 비어 있습니다. 마음에 드는 장소를 추가해 보세요!");
    return;
  }
  // 임시: 현재 필터/검색 조건 무시하고 즐겨찾기만 표시
  const prev = { ...state };
  state.query=""; state.city=""; state.filter="all";
  document.getElementById("q").value="";
  document.getElementById("city").value="";
  document.querySelectorAll(".chip").forEach(ch=>ch.classList.toggle("active", ch.dataset.filter==="all"));
  // 커스텀 렌더
  grid.innerHTML="";
  empty.hidden = true;
  favs.forEach(p=>{
    const el = document.createElement("article");
    el.className="card";
    el.innerHTML = `
      <div class="thumb">
        <img alt="${p.name}" src="${p.img}">
        <span class="badge">★ ${p.rating.toFixed(1)} · 리뷰 ${fmt(p.reviews)}</span>
      </div>
      <div class="card-body">
        <div class="title">${p.name} <span class="pill">· 즐겨찾기</span></div>
        <div class="meta"><span>${p.city}</span><span>·</span><span>${p.address||"주소 정보 없음"}</span></div>
        <div class="tags">${(p.tags||[]).slice(0,4).map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        <div class="card-actions">
          <button class="btn btn-primary" data-open="${p.id}">자세히 보기</button>
          <button class="btn btn-like" data-fav="${p.id}">즐겨찾기 해제</button>
        </div>
      </div>
    `;
    grid.appendChild(el);
  });
});

// 모달
const backdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const modalTags = document.getElementById("modalTags");
const modalMap = document.getElementById("modalMap");
function openModal(id){
  const p = PLACES.find(x=>x.id===id);
  if(!p) return;
  modalTitle.textContent = p.name;

  // 공통 정보
  let infoHtml = `
    <div style="display:grid;gap:12px;grid-template-columns:180px 1fr;align-items:start">
      <img src="${p.img}" alt="${p.name}" style="width:100%;height:120px;object-fit:cover;border-radius:12px;border:1px solid var(--border)">
      <div>
        <div class="pill">도시: ${p.city} · 카테고리: ${label(p.type)}</div>
        <div class="pill">요리 종류: ${( {korean:"한식", western:"양식", chinese:"중식", japanese:"일식", fusion:"퓨전", other:"기타"}[p.cuisine] ) || p.cuisine}</div>
        <div class="pill">평점: ★ ${p.rating.toFixed(1)} (리뷰 ${fmt(p.reviews)})</div>
        <div class="pill">주소: ${p.address||"정보 없음"}</div>
        <hr class="modal-divider">
  `;

  if(p.type === "food"){
    // 대표 메뉴 3가지 및 가격 표시
    const menus = genMenus(p);
    infoHtml += `<div class="menu-title">대표 메뉴:</div><ul class="menu-list" style="margin-top:8px">`;
    menus.forEach(m=>{
      const priceText = (typeof m.price === 'number' || (m.price && /^\d/.test(m.price))) ? fmtWon(parseInt(String(m.price).replace(/[^0-9]/g,''),10)) : (m.price || (extractNumbers(p.price)[0] ? fmtWon(extractNumbers(p.price)[0]) : "정보 없음"));
      infoHtml += `<li class="menu-item">${m.name} — <strong>${priceText}</strong></li>`;
    });
    infoHtml += `</ul>`;
    // 구분선 아래에 가격대 표시하도록 순서 변경
    infoHtml += `<hr class="modal-divider">`;
    infoHtml += `<div class="pill" style="margin-top:8px">가격대: ${p.price||"정보 없음"}</div>`;
  } else {
    // 관광명소 등: 입장료 표시 (우선 p.entranceFee, 없으면 숫자 포함 p.price, 없으면 무료)
    const entrance = p.entranceFee || (extractNumbers(p.price).length ? p.price : ( (p.price && /무료/.test(p.price)) ? '무료' : null ));
    infoHtml += `<div class="pill">입장료: ${entrance || "무료"}</div>`;
    infoHtml += `<div class="pill">가격/요금 정보: ${p.price||"정보 없음"}</div>`;
  }

  infoHtml += `<p style="margin-top:8px">${p.desc||""}</p></div></div>`;

  modalContent.innerHTML = infoHtml;
  modalTags.innerHTML = (p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("");
  // 간단 지도 임베드
  modalMap.innerHTML = `
    <iframe title="지도" width="100%" height="300" style="border:0" loading="lazy"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${p.map.lng-0.01}%2C${p.map.lat-0.01}%2C${p.map.lng+0.01}%2C${p.map.lat+0.01}&layer=mapnik&marker=${p.map.lat}%2C${p.map.lng}">
    </iframe>
  `;
  backdrop.style.display="flex";
  backdrop.setAttribute("aria-hidden","false");
}
document.getElementById("modalClose").addEventListener("click", closeModal);
backdrop.addEventListener("click", e=>{ if(e.target===backdrop) closeModal(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeModal(); });
function closeModal(){
  backdrop.style.display="none";
  backdrop.setAttribute("aria-hidden","true");
}
function label(type){
  return ({food:"맛집", sight:"관광명소", cafe:"카페", night:"야경/포인트"}[type]) || type;
}

// 다크 모드
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");
if(savedTheme) root.setAttribute("data-theme", savedTheme);
document.getElementById("toggleTheme").addEventListener("click", ()=>{
  const next = root.getAttribute("data-theme")==="dark" ? "" : "dark";
  if(next) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
  localStorage.setItem("theme", next);
});

// 제안 폼 (데모)
document.getElementById("suggestForm").addEventListener("submit", e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const id = "user_"+Date.now();
  PLACES.push({
    id, type:(data.category||"").trim()==="야경/포인트"?"night":(data.category||"").trim(),
    city:(data.city||"").trim(), name:(data.name||"").trim(),
    rating:4.0, reviews:1, popular:50, recent:+new Date().toISOString().slice(0,10).replaceAll("-",""),
    address:data.address||"", price:data.price||"",
    tags:(data.tags||"").split(",").map(s=>s.trim()).filter(Boolean),
    desc:data.desc||"",
    img:"https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?q=80&w=1200&auto=format&fit=crop",
    map:{lat:35.1796,lng:129.0756}
  });
  document.getElementById("suggestToast").textContent = "제안이 로컬에 추가되었습니다. 목록에서 검색해 확인하세요.";
  e.target.reset();
  render();
  setTimeout(()=> document.getElementById("suggestToast").textContent="", 3500);
});

// 이벤트: 연령대 선택 추가
document.getElementById("ageFilter").addEventListener("change", e=>{
  state.age = e.target.value;
  render();
});

// --- 유틸: 문자열에서 숫자(원 단위) 추출 및 포맷 ---
function extractNumbers(str){
  if(!str) return [];
  const m = str.toString().match(/\d{1,3}(?:,\d{3})*/g);
  return (m||[]).map(s=>parseInt(s.replace(/,/g,''),10)).filter(Boolean);
}
function fmtWon(n){
  return n.toLocaleString('ko-KR') + '원';
}

// --- 유틸: 대표 메뉴 생성 (결정적) ---
function genMenus(place){
  // 우선 signature가 있으면 첫 항목으로 사용
  const menus = [];
  if(place.signature && place.signature.name){
    menus.push({ name: place.signature.name, price: place.signature.price || (place.signature.price===0? '무료' : null) });
  }
  // 기준 가격 산출 (평균 혹은 기본)
  const nums = extractNumbers(place.price);
  const base = nums.length ? Math.round(nums.reduce((a,b)=>a+b,0)/nums.length) : 15000;
  // deterministic seed from id/name
  const seed = deterministicSeed(place.id || place.name || JSON.stringify(place));
  // 후보 메뉴명(태그/키워드 기반) 간단 생성
  const tags = (place.tags||[]).slice(0,3);
  const defaults = [
    tags[0] ? `${tags[0]} 정식` : '모둠 정식',
    tags[1] ? `${tags[1]} 세트` : '특선 메뉴',
    '오늘의 스페셜'
  ];
  for(let i=0;i<3 && menus.length<3;i++){
    const name = defaults[i];
    // 가격은 base에 약간의 변동
    const variance = ((seed >> (i*3)) % 6000) - 3000; // -3000 ~ +3000
    const price = Math.max(1000, base + variance);
    menus.push({ name, price: fmtWon(price) });
  }
  // ensure 3 items
  return menus.slice(0,3);
}

// 초기 렌더
render();

// 필터 메뉴 토글 및 마우스 위치 기준 표시
document.addEventListener("DOMContentLoaded", ()=>{
  const filterBtn = document.getElementById("filterBtn");
  const filterMenu = document.getElementById("filterMenu");
  const applyBtn = document.getElementById("applyFilters");
  const closeBtn = document.getElementById("closeFilters");

  if(filterBtn && filterMenu){
    const closeMenu = ()=>{ 
      filterMenu.hidden = true; 
      filterBtn.setAttribute("aria-expanded","false"); 
      // 초기화할 경우 inline 위치 제거
      filterMenu.style.left = "";
      filterMenu.style.top = "";
      filterMenu.style.position = "";
    };
    const openMenuAt = (x,y)=>{
      // position fixed로 화면 기준 배치
      filterMenu.style.position = "fixed";
      // 잠깐 표시해서 offsetWidth/Height 계산 가능하게 함
      filterMenu.hidden = false;
      filterBtn.setAttribute("aria-expanded","true");

      const OFFSET = 8;
      let left = x + OFFSET;
      let top = y - (filterMenu.offsetHeight / 2); // 마우스 수직 중앙 정렬 시도

      // 화면 우측/좌측/상하 경계 보정
      const maxLeft = window.innerWidth - filterMenu.offsetWidth - OFFSET;
      if(left > maxLeft) left = Math.max(OFFSET, maxLeft);
      if(left < OFFSET) left = OFFSET;

      if(top + filterMenu.offsetHeight > window.innerHeight - OFFSET){
        top = window.innerHeight - filterMenu.offsetHeight - OFFSET;
      }
      if(top < OFFSET) top = OFFSET;

      filterMenu.style.left = `${left}px`;
      filterMenu.style.top = `${top}px`;
    };

    filterBtn.addEventListener("click", e=>{
      e.stopPropagation();
      if(filterMenu.hidden){
        // 마우스 좌표를 사용해 메뉴를 버튼 클릭 위치 우측에 표시
        openMenuAt(e.clientX, e.clientY);
      } else {
        closeMenu();
      }
    });

    // 내부 클릭 시 전파 중단
    filterMenu.addEventListener("click", e=> e.stopPropagation());
    // 외부 클릭으로 닫기
    document.addEventListener("click", ()=> closeMenu());
    // ESC로 닫기
    document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeMenu(); });

    // apply/close 버튼
    if(applyBtn) applyBtn.addEventListener("click", ()=>{ 
      // change 이벤트 트리거로 상태 업데이트
      const ev = new Event('change',{bubbles:true});
      document.getElementById("sort")?.dispatchEvent(ev);
      document.getElementById("city")?.dispatchEvent(ev);
      document.getElementById("cuisine")?.dispatchEvent(ev);
      document.getElementById("ageFilter")?.dispatchEvent(ev);
      closeMenu();
    });
    if(closeBtn) closeBtn.addEventListener("click", ()=> closeMenu());
  }
});
