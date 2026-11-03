"use strict";
/* Backstabplomacy — local-first Diplomacy engine + PWA UI.
   Design notes: original code; classic rules structure; simplified
   retreat/build handling is documented in README (auto-retreat to a
   legal vacant province or disband; winter auto-build for bots,
   guided auto-build for the human with a log entry). */
const $ = s => document.querySelector(s);
const POWERS = ["England","France","Germany","Italy","Austria","Russia","Turkey"];
const COLORS = {England:"#4f83cc",France:"#3556a8",Germany:"#b8a888",Italy:"#3da35d",Austria:"#d64545",Russia:"#8e6cc8",Turkey:"#39a7bd",neutral:"#d8d3c3",Armenia:"#e07b2a","Kingdom of Armenia":"#e07b2a",Georgia:"#c94f6d",Azerbaijan:"#3aa6a0",Persia:"#2e9e5b","Sasanian Persia":"#2e9e5b",Greece:"#5b8dd9","Byzantine Empire":"#7a4fa3",Rome:"#c0392b","Kingdom of Iberia":"#d4a017","Caucasian Albania":"#6a994e",Egypt:"#d9b23a"};
let ACTIVE=[...POWERS];
const FALLBACK_COLORS=["#e07b2a","#c94f6d","#3aa6a0","#2e9e5b","#5b8dd9","#7a4fa3","#c0392b","#d4a017","#6a994e","#d9b23a"];
let PROV = {}; let BORDERS = {};
function loadData(data){
  PROV = {}; data.provinces.forEach(p=>PROV[p.id]=p);
  BORDERS = {}; data.provinces.forEach(p=>BORDERS[p.id]=p.borders);
  window._starts = data.startingUnits; window._winSC = data.winSupplyCenters||18;
  const keys=data.startingUnits?Object.keys(data.startingUnits):[]; if(keys.length) ACTIVE=keys;
  ACTIVE.forEach((pw,i)=>{ if(!COLORS[pw]) COLORS[pw]=FALLBACK_COLORS[i%FALLBACK_COLORS.length]; });
}
loadData(window.DIP_DATA);

let uid = 1;
function newGame(){
  const units=[]; const owners={};
  Object.values(PROV).forEach(p=>{ if(p.supplyCenter) owners[p.id]=p.home||null; });
  for(const [power,list] of Object.entries(window._starts)) list.forEach(u=>units.push({id:uid++,power,type:u.unit,prov:u.prov}));
  return {year:1901,season:"Spring",units,owners,orders:{},press:[],log:["Spring 1901 — the chancelleries of Europe open. Good luck, and trust no one."],winner:null};
}
let S = newGame();
let me = "England";           // power currently controlled at this device
let selectedUnit = null;      // unit id selected on map
let user = JSON.parse(localStorage.getItem("bb_user")||"null");
let settings = Object.assign({aiEnabled:false,aiBase:"https://api.openai.com/v1",aiModel:"gpt-4o-mini",aiKey:"",googleClientId:"",pushEnabled:false,lines:true,labels:true}, JSON.parse(localStorage.getItem("bb_settings")||"{}"));

/* ---------- persistence (saved progress + orders, per user) ---------- */
function saveKey(){ return "bb_save_"+(user?(user.sub||user.email||user.name):"guest"); }
function save(){ localStorage.setItem(saveKey(), JSON.stringify({S,me})); localStorage.setItem("bb_settings",JSON.stringify(settings)); }
function load(){ try{ const raw=localStorage.getItem(saveKey()); if(raw){ const d=JSON.parse(raw); S=d.S; me=d.me||me; uid=Math.max(1,...S.units.map(u=>u.id))+1; return true; } }catch(e){} return false; }

/* ---------- map ---------- */
const X = lon => (lon+12)*(1000/56);          // lon -12..44
const Y = lat => (71-lat)*(680/39);           // lat 71..32
const LAND = [
 [[-5,50],[-3,52.5],[-5.5,55],[-3,58.6],[-0.5,57.5],[0.5,54],[1.4,51.3],[-1.2,50.7]], // Britain
 [[-10.3,51.8],[-6,52],[-5.4,54.3],[-8,55.2],[-10.2,54]], // Ireland
 [[5,58],[4.8,60],[9,59],[17,59],[20.5,60],[23,63],[24,65.5],[20,69.5],[13,68],[10,64],[5.5,61.5]], // Scandinavia
 [[-9,37],[-9.4,43],[-2,43.7],[-1.2,45.9],[-4.7,48.4],[-0.6,49.6],[1.8,50.9],[5,53.3],[8,54.1],[9.5,57],[17,55.8],[20,55],[23.5,57.5],[21,59.5],[24.5,59.5],[27,59.8],[29.5,62],[27,65],[29,68.5],[31,70.2],[42,68],[41.5,60],[39,54],[41,50],[38.5,46.5],[34,45],[32.5,44],[28.5,41],[27.5,39.5],[23,36.4],[21.5,37],[19,40],[15.5,40],[15.8,38.2],[13,43.8],[9,44.2],[7.5,43.9],[3.2,42.4],[2.8,41.5],[0,39],[-1,37.5],[-5.5,36]], // mainland
 [[7.8,44],[10.5,44.2],[13.5,41.5],[15.8,38],[18.2,40],[16.2,41.2],[14,42],[12.2,43.9]], // Italy
 [[26,40.5],[29.5,36.5],[36,36],[35.8,38.5],[41.5,41],[39,41.5],[32.5,42],[27,41.8]], // Anatolia
 [[-9.8,29],[-9,32.5],[-5.5,35],[0,35.5],[9.8,37],[11,33.8],[19.8,32],[19.8,29.5]] // North Africa
];
function renderMap(){
  const svg=$("#map"); let h="";
  // Dynamic projection from the loaded map's real lat/lon bounds — custom maps (Caucasus, Empires) frame themselves.
  const ps=Object.values(PROV); const lo0=Math.min(...ps.map(p=>p.lon))-3, lo1=Math.max(...ps.map(p=>p.lon))+3, la0=Math.min(...ps.map(p=>p.lat))-2, la1=Math.max(...ps.map(p=>p.lat))+2;
  const X=lon=>(lon-lo0)/(lo1-lo0)*1000, Y=lat=>(la1-lat)/(la1-la0)*680; window._X=X; window._Y=Y;
  const isClassic=!!PROV["LON"]&&!!PROV["NAO"];
  if(isClassic) LAND.forEach(poly=>{ h+=`<polygon points="${poly.map(([lo,la])=>X(lo).toFixed(1)+","+Y(la).toFixed(1)).join(" ")}" fill="#e9dfc4" stroke="#b7a87f" stroke-width="1.5" opacity="0.95"/>`; });
  if(settings.lines) for(const p of Object.values(PROV)) for(const b of p.borders) if(p.id<b){ const q=PROV[b]; h+=`<line x1="${X(p.lon)}" y1="${Y(p.lat)}" x2="${X(q.lon)}" y2="${Y(q.lat)}" stroke="rgba(20,40,70,.16)" stroke-width="1"/>`; }
  const hl = selectedUnit!=null ? legalTargets(unitById(selectedUnit)) : [];
  for(const p of Object.values(PROV)){
    const owner=p.supplyCenter?S.owners[p.id]:null;
    const fill=p.type==="sea"?"#6ea8cf":(owner?COLORS[owner||"neutral"]:"#ddd6bf");
    const unit=S.units.find(u=>u.prov===p.id);
    h+=`<g class="prov ${hl.includes(p.id)?"hl":""}" data-prov="${p.id}">
      <circle class="main" cx="${X(p.lon)}" cy="${Y(p.lat)}" r="${p.supplyCenter?15:10}" fill="${fill}" opacity="${p.type==="sea"?0.75:0.96}"/>
      ${p.supplyCenter?`<text x="${X(p.lon)}" y="${Y(p.lat)-16}" style="font-size:12px;text-anchor:middle">★</text>`:""}
      <text x="${X(p.lon)}" y="${Y(p.lat)+4}">${p.id}</text>
      ${settings.labels?`<text class="lbl" x="${X(p.lon)}" y="${Y(p.lat)+(p.supplyCenter?27:21)}">${p.name.length>16?p.name.slice(0,15)+"…":p.name}</text>`:""}
      ${unit?`<text class="unit" x="${X(p.lon)+15}" y="${Y(p.lat)-8}">${unit.type==="A"?"♟":"⚓"}</text>
      <text x="${X(p.lon)+15}" y="${Y(p.lat)+22}" style="font-size:9px;text-anchor:middle;font-weight:700" fill="${COLORS[unit.power]}">${unit.power.slice(0,3).toUpperCase()} ${unit.type}</text>`:""}
    </g>`;
  }
  svg.innerHTML=h;
  svg.querySelectorAll(".prov").forEach(g=>g.addEventListener("click",()=>onProvClick(g.dataset.prov)));
  renderScore(); renderOrders(); $("#phaseLabel").textContent=`${S.season} ${S.year} — Orders${S.winner?" — "+S.winner+" wins!":""}`;
  $("#playingAs").textContent=`· You control ${me}`; $("#powerSelect").value=me;
}
function unitById(id){ return S.units.find(u=>u.id===id); }
function renderScore(){
  const counts=ACTIVE.map(p=>[p,Object.values(S.owners).filter(o=>o===p).length]).sort((a,b)=>b[1]-a[1]);
  $("#scoreboard").innerHTML=counts.map(([p,n])=>`<span class="score" style="background:${COLORS[p]}">${p}: ${n} ★${p===me?" (you)":""}</span>`).join("")+`<span class="score" style="background:#ddd">Win at ${window._winSC} ★</span>`;
}
/* ---------- toast + system notification ---------- */
let toastTimer=null;
function toast(msg,ok=false){ const t=$("#toast"); if(!t) return; t.textContent=msg; t.classList.toggle("ok",ok); t.classList.remove("hidden"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.add("hidden"),6500); }
async function forceNotify(title,body){ // used for invalid orders: fires even if routine push toggle is off, as long as the browser granted permission
  try{ if(!("Notification" in window)||Notification.permission!=="granted") return;
    if("serviceWorker" in navigator){ const reg=await navigator.serviceWorker.ready; if(reg.showNotification) return reg.showNotification(title,{body,icon:"icons/icon-192.png"}); }
    new Notification(title,{body}); }catch(e){} }
/* ---------- PRE-SUBMIT ORDER VALIDATION (invalid-move alerts) ---------- */
function validateOrders(controlledOnly=true){
  const errors=[],warnings=[];
  const mine=S.units.filter(u=>!controlledOnly||u.power===me);
  const destCount={};
  mine.forEach(u=>{ const o=S.orders[u.id]; if(!o||o.type==="hold") return;
    const label=`${u.type==="A"?"Army":"Fleet"} in ${u.prov} (${PROV[u.prov].name})`;
    if(o.type==="move"){
      if(!o.target){ errors.push({unit:u.id,msg:`❌ ${label}: Move chosen but no destination selected. Pick a target province before submitting.`}); return; }
      if(!PROV[o.target]){ errors.push({unit:u.id,msg:`❌ ${label}: destination ${o.target} does not exist on this map.`}); return; }
      if(!(BORDERS[u.prov]||[]).includes(o.target)){ errors.push({unit:u.id,msg:`❌ ${label}: ${o.target} is not next to ${u.prov} — units move one province at a time (or need a Convoy). This order would fail.`}); return; }
      if(!canEnter(u,o.target)){ errors.push({unit:u.id,msg:`❌ ${label}: ${u.type==="A"?"Armies cannot enter the sea":"Fleets cannot enter inland provinces"} — ${o.target} (${PROV[o.target].type}) is illegal for this unit.`}); return; }
      destCount[o.target]=(destCount[o.target]||0)+1;
      const occ=unitAt(o.target); if(occ&&occ.power===me&&(S.orders[occ.id]?.type!=="move")) warnings.push(`⚠️ ${label}: ${o.target} is occupied by your own unit which isn't moving away — that move will bounce.`);
    }
    if(o.type==="support"){
      if(!o.supported){ errors.push({unit:u.id,msg:`❌ ${label}: Support chosen but no unit selected to support. Choose whose move/hold you are supporting.`}); return; }
      const sup=unitById(o.supported); if(!sup){ errors.push({unit:u.id,msg:`❌ ${label}: the unit you chose to support no longer exists.`}); return; }
      if(o.target){ if(!(BORDERS[u.prov]||[]).includes(o.target)) errors.push({unit:u.id,msg:`❌ ${label}: you can only support a move INTO a province you could move into yourself — ${o.target} is not adjacent to ${u.prov}.`});
        else if(!canEnter(u,o.target)) errors.push({unit:u.id,msg:`❌ ${label}: you cannot support into ${o.target} because your unit could not enter it (${PROV[o.target].type}).`});
        const supOrder=S.orders[sup.id]; if(supOrder&&supOrder.type==="move"&&supOrder.target&&supOrder.target!==o.target) warnings.push(`⚠️ ${label}: you are supporting ${sup.power} ${sup.type} ${sup.prov} into ${o.target}, but that unit is actually ordered to ${supOrder.target} — the support will not count.`);
        if(!supOrder||supOrder.type!=="move") warnings.push(`⚠️ ${label}: supporting a move into ${o.target}, but ${sup.power} ${sup.type} ${sup.prov} has no Move order there — support of a hold needs the target left blank.`);
      } else { if(!(BORDERS[u.prov]||[]).includes(sup.prov)) errors.push({unit:u.id,msg:`❌ ${label}: to support ${sup.prov} holding, you must be next to it — ${sup.prov} is not adjacent to ${u.prov}.`}); }
    }
    if(o.type==="convoy"){
      if(u.type!=="F") errors.push({unit:u.id,msg:`❌ ${label}: only Fleets can Convoy — and only Fleets sitting in a sea province.`});
      else if(PROV[u.prov].type!=="sea") errors.push({unit:u.id,msg:`❌ ${label}: a Fleet in a coastal province cannot convoy. Convoy fleets must be in a sea province (yours is in ${u.prov}, a coast).`});
      if(!o.supported) errors.push({unit:u.id,msg:`❌ ${label}: Convoy chosen but no Army selected to convoy.`});
      else { const a=unitById(o.supported); if(a&&a.type!=="A") errors.push({unit:u.id,msg:`❌ ${label}: convoys carry Armies only — the selected unit is a Fleet.`});
        if(a&&!(BORDERS[u.prov]||[]).includes(a.prov)) errors.push({unit:u.id,msg:`❌ ${label}: your fleet must be next to the army it convoys — ${a.prov} is not adjacent to ${u.prov}.`}); }
      if(!o.target) errors.push({unit:u.id,msg:`❌ ${label}: Convoy chosen but no destination coast selected.`});
      else if(o.target&&!(BORDERS[u.prov]||[]).includes(o.target)) warnings.push(`⚠️ ${label}: the destination ${o.target} is not next to your fleet — a convoy chain through other fleets would be needed, and every fleet in the chain needs a matching Convoy order.`);
    }
  });
  Object.entries(destCount).forEach(([t,n])=>{ if(n>1) warnings.push(`⚠️ ${n} of your units are moving into ${t} — your own units will bounce each other there. Only one can enter.`); });
  return {errors,warnings};
}
function showValidation(announce=false){
  const {errors,warnings}=validateOrders(); const box=$("#validationBox"); if(!box) return {errors,warnings};
  const invalidIds=new Set(errors.map(e=>e.unit));
  document.querySelectorAll(".order-row").forEach(r=>{ const sel=r.querySelector("select"); });
  document.querySelectorAll("#ordersList .order-row").forEach((row,i)=>{ const mine=S.units.filter(u=>u.power===me); if(mine[i]) row.classList.toggle("invalid",invalidIds.has(mine[i].id)); });
  if(errors.length){ box.className="validation error"; box.textContent=`🚫 ${errors.length} invalid order${errors.length>1?"s":""} — fix before submitting:\n`+errors.map(e=>e.msg).join("\n")+(warnings.length?"\n"+warnings.join("\n"):"");
    if(announce){ toast(`🚫 Invalid order${errors.length>1?"s":""} — turn NOT submitted. ${errors[0].msg}`); forceNotify("🚫 Invalid Diplomacy order — not submitted",errors[0].msg); } }
  else if(warnings.length){ box.className="validation warn"; box.textContent="Orders are legal, but check these warnings:\n"+warnings.join("\n"); }
  else { box.className="validation ok"; box.textContent="✅ All orders are legal and ready to submit."; if(announce) toast("✅ All orders are legal and ready to submit.",true); }
  return {errors,warnings};
}
function unitAt(prov){ return S.units.find(u=>u.prov===prov); }
function canEnter(unit,prov){ const t=PROV[prov].type; if(unit.type==="A") return t!=="sea"; return t!=="land"; }
function legalTargets(unit){ if(!unit) return []; return BORDERS[unit.prov].filter(b=>canEnter(unit,b)); }
function onProvClick(prov){
  const p=PROV[prov], unit=unitAt(prov);
  if(selectedUnit!=null){ const u=unitById(selectedUnit);
    if(u && legalTargets(u).includes(prov)){ S.orders[u.id]={type:"move",target:prov}; logLine(`Order set: ${u.power} ${u.type} ${u.prov} → ${prov}`); selectedUnit=null; save(); renderMap(); showValidation(false); showInfo(p,unit); return; }
    if(u && prov!==u.prov && !(unit&&unit.power===me)){ const why=!(BORDERS[u.prov]||[]).includes(prov)?`${prov} is not next to ${u.prov} — units move one province at a time (or need a Convoy by sea).`:`${u.type==="A"?"Armies cannot enter the sea":"Fleets cannot enter inland provinces"} — ${prov} is illegal for this ${u.type==="A"?"Army":"Fleet"}.`;
      toast(`🚫 Invalid move: ${u.type} ${u.prov} → ${prov}. ${why}`); forceNotify("🚫 Invalid move",`${u.prov} → ${prov}: ${why}`); showInfo(p,unit); return; } }
  if(unit && unit.power===me){ selectedUnit=unit.id; } else selectedUnit=null;
  showInfo(p,unit); renderMap();
}
function showInfo(p,unit){
  const owner=p.supplyCenter?(S.owners[p.id]||"Neutral"):"—";
  $("#selectedInfo").innerHTML=`<b>${p.name} (${p.id})</b> · ${p.type}${p.supplyCenter?" · ★ Supply centre, owner: "+owner:""} · borders: ${p.borders.join(", ")}${unit?`<br>Unit here: <b style="color:${COLORS[unit.power]}">${unit.power} ${unit.type==="A"?"Army ♟":"Fleet ⚓"}</b>${unit.power===me?" — tap a highlighted neighbour to move, or set a detailed order on the right.":""}`:""}`;
}

/* ---------- orders UI ---------- */
function renderOrders(){
  const box=$("#ordersList"); if(!box) return;
  const mine=S.units.filter(u=>u.power===me);
  box.innerHTML=mine.map(u=>{ const o=S.orders[u.id]||{type:"hold"};
    const targets=legalTargets(u);
    const others=S.units.filter(x=>x.id!==u.id);
    return `<div class="order-row"><b style="color:${COLORS[u.power]}">${u.type==="A"?"♟ Army":"⚓ Fleet"} — ${PROV[u.prov].name} (${u.prov})</b>
    <select data-u="${u.id}" data-f="type">
      ${["hold","move","support","convoy"].map(t=>`<option ${o.type===t?"selected":""} value="${t}">${t[0].toUpperCase()+t.slice(1)}</option>`).join("")}
    </select>
    <select data-u="${u.id}" data-f="target"><option value="">— target —</option>${targets.map(t=>`<option ${o.target===t?"selected":""} value="${t}">${t} ${PROV[t].name}</option>`).join("")}</select>
    <select data-u="${u.id}" data-f="supported"><option value="">— unit supported / convoyed (for Support/Convoy) —</option>${others.map(x=>`<option ${o.supported===x.id?"selected":""} value="${x.id}">${x.power} ${x.type} ${x.prov}${x.id===u.id?"":""}</option>`).join("")}</select></div>`; }).join("") || "<p class='small'>No units left — you're eliminated in this game. Start a new game.</p>";
  box.querySelectorAll("select").forEach(sel=>sel.addEventListener("change",()=>{
    const id=+sel.dataset.u, f=sel.dataset.f; S.orders[id]=S.orders[id]||{type:"hold"};
    S.orders[id][f]=f==="supported"?(sel.value?+sel.value:undefined):sel.value; save(); showValidation(false); trackOrders();
    const u=unitById(id), o=S.orders[id];
    if(o.type==="move"&&!o.target) hintFlash(`Pick a target province for ${u.prov}'s move.`);
    if(o.type==="support"&&o.supported){ const sup=unitById(o.supported); if(sup&&!o.target) hintFlash(`Support set — also choose the target province the supported unit is moving to (or leave blank to support it holding).`); }
  }));
}
function logLine(s){ S.log.unshift(`${S.season} ${S.year}: ${s}`); S.log=S.log.slice(0,80); $("#log").textContent=S.log.join("\n"); }

/* ---------- bots ---------- */
function botOrders(power){
  for(const u of S.units.filter(x=>x.power===power)){
    const targets=legalTargets(u).filter(t=>{ const occ=unitAt(t); return !occ||occ.power!==power; });
    const scTargets=targets.filter(t=>PROV[t].supplyCenter&&S.owners[t]!==power);
    const r=Math.random();
    if(scTargets.length&&r<0.65) S.orders[u.id]={type:"move",target:scTargets[0]};
    else if(targets.length&&r<0.45) S.orders[u.id]={type:"move",target:targets[Math.floor(Math.random()*targets.length)]};
    else S.orders[u.id]={type:"hold"};
  }
}

/* ---------- adjudication (classic structure, simplified retreats) ---------- */
function resolveTurn(){
  if(S.winner) return;
  // PRE-SUBMIT GATE: invalid orders block submission and alert the player first.
  const v=showValidation(true);
  if(v.errors.length){ document.querySelector('[data-tab="orders"]').click(); logLine(`🚫 Turn NOT submitted — ${v.errors.length} invalid order(s) must be fixed first.`); $("#log").textContent=S.log.join("\n"); return; }
  const scBefore=Object.values(S.owners).filter(o=>o===me).length; const cleanTurn=!v.warnings.length;
  if(v.warnings.length&&!confirm("Your orders are legal, but there are warnings:\n\n"+v.warnings.join("\n")+"\n\nSubmit anyway?")) return;
  ACTIVE.filter(p=>p!==me).forEach(botOrders);
  const orders={}; S.units.forEach(u=>orders[u.id]=S.orders[u.id]||{type:"hold"});
  // support cut: supporter attacked from a province other than its support target
  const cut=new Set();
  for(const u of S.units){ const o=orders[u.id]; if(o.type!=="move") continue;
    for(const v of S.units){ const vo=orders[v.id]; if(vo.type==="support"&&v.prov!==o.target&&u.prov!==undefined){ /* attacker u moves into supporter v */ }
      if(vo.type==="support"&&o.target===v.prov&&u.prov!==(vo.target||"")) cut.add(v.id); } }
  function strengthMove(u){ const o=orders[u.id]; let s=1; for(const v of S.units){ const vo=orders[v.id]; if(vo.type==="support"&&vo.supported===u.id&&vo.target===o.target&&!cut.has(v.id)&&legalTargets(v).includes(o.target)) s++; } return s; }
  function strengthHold(u){ let s=1; for(const v of S.units){ const vo=orders[v.id]; if(vo.type==="support"&&vo.supported===u.id&&!vo.target&&!cut.has(v.id)) s++; } return s; }
  // iterate: a move succeeds if it beats the defender (if defender stays) and all rival moves
  const moves=S.units.filter(u=>orders[u.id].type==="move");
  const destGroups={}; moves.forEach(u=>{(destGroups[orders[u.id].target]=destGroups[orders[u.id].target]||[]).push(u);});
  const successful=new Set();
  for(const [dest,group] of Object.entries(destGroups)){
    group.sort((a,b)=>strengthMove(b)-strengthMove(a));
    const top=group[0]; if(group.length>1&&strengthMove(group[1])===strengthMove(top)) continue; // bounce tie
    const defender=unitAt(dest);
    if(!defender){ successful.add(top.id); continue; }
    if(defender.id===top.id) continue;
    const defOrder=orders[defender.id];
    if(defOrder.type==="move"&&orders[defender.id].target===top.prov){ continue; } // head-to-head swap never happens; both bounce (simplified)
    const defStrength=(defOrder.type==="move")?1:strengthHold(defender);
    if(strengthMove(top)>defStrength) successful.add(top.id);
  }
  // head-to-head: stronger attacker can still win in full rules; v1 treats equal-or-less as bounce and logs it — see README limits.
  const dislodged=[];
  for(const u of [...successful]){ const mover=unitById(u); const dest=orders[u].target; const defender=unitAt(dest);
    if(defender&&defender.id!==mover.id) dislodged.push(defender);
  }
  const oldProv={}; S.units.forEach(u=>oldProv[u.id]=u.prov);
  successful.forEach(id=>{ const u=unitById(id); u.prov=orders[id].target; logLine(`${u.power} ${u.type} ${oldProv[id]} → ${u.prov} succeeds.`); });
  moves.filter(u=>!successful.has(u.id)&&orders[u.id].type==="move").forEach(u=>logLine(`${u.power} ${u.type} ${u.prov} → ${orders[u.id].target} bounces.`));
  // retreats: auto-retreat to vacant adjacent legal province, else disband
  for(const d of dislodged){ if(successful.has(d.id)) continue; // it moved away itself (rare in this model)
    const opts=BORDERS[d.prov].filter(p=>canEnter(d,p)&&!unitAt(p)&&p!==oldProv[[...successful].find(id=>orders[id].target===d.prov)]);
    if(opts.length){ const from=d.prov; d.prov=opts[0]; logLine(`${d.power} ${d.type} dislodged from ${from}, retreats to ${opts[0]}.`); }
    else { S.units=S.units.filter(x=>x.id!==d.id); logLine(`${d.power} ${d.type} in ${d.prov} dislodged with no retreat — disbanded.`); } }
  // season flow
  if(S.season==="Spring"){ S.season="Fall"; }
  else { // end of Fall: capture SCs, builds/disbands, win check
    S.units.forEach(u=>{ if(PROV[u.prov].supplyCenter) S.owners[u.prov]=u.power; });
    for(const power of ACTIVE){
      const scs=Object.entries(S.owners).filter(([,o])=>o===power).length;
      let mine=S.units.filter(u=>u.power===power);
      if(scs>=window._winSC){ S.winner=power; logLine(`🏆 ${power} controls ${scs} centres and wins the game!`); notify("Game over",`${power} wins with ${scs} supply centres.`); }
      while(mine.length>scs){ const dead=mine.pop(); S.units=S.units.filter(x=>x.id!==dead.id); logLine(`${power} disbands ${dead.type} ${dead.prov} (more units than centres).`); mine=S.units.filter(u=>u.power===power); }
      if(mine.length<scs){ const homes=Object.values(PROV).filter(p=>p.home===power&&S.owners[p.id]===power&&!unitAt(p.id));
        for(const h of homes){ if(S.units.filter(u=>u.power===power).length>=scs) break;
          const type=(h.id==="STP"||h.id==="EDI"||h.id==="LON"||h.id==="BRE"||h.id==="KIE"||h.id==="NAP"||h.id==="TRI"||h.id==="ANK"||h.id==="SEV")?"F":"A";
          const nt=canEnter({type},h.id)?type:"A"; S.units.push({id:uid++,power,type:nt,prov:h.id}); logLine(`${power} builds ${nt} in ${h.id}.`); } }
    }
    S.season="Spring"; S.year++;
  }
  S.orders={}; selectedUnit=null; save(); renderMap(); $("#log").textContent=S.log.join("\n"); renderHints();
  unlock("first-turn"); if(cleanTurn) unlock("clean-sheet");
  const scAfter=Object.values(S.owners).filter(o=>o===me).length;
  if(scAfter>scBefore){ unlock("capture"); const tt=loadTrophies(); if(tt.pressSent>0) unlock("backstab"); }
  if(scAfter>=5) unlock("five-sc"); if(scAfter>=10) unlock("ten-sc");
  if(S.winner===me) unlock("win"); if(S.year>=1902) unlock("year"); if(S.year>=1906) unlock("marathon"); renderTrophies();
  notify("Turn resolved",`${S.season} ${S.year} orders are ready to enter.`);
}

/* ---------- hints (offline, rule-based) ---------- */
function computeHints(){
  const hints=[]; const mine=S.units.filter(u=>u.power===me);
  if(!mine.length) return ["You have no units left in this game — start a New game to play again."];
  mine.forEach(u=>{ const o=S.orders[u.id];
    if(!o) hints.push(`⚠️ ${u.type} in ${u.prov} has no order yet — unordered units just Hold and waste the turn.`);
    const tg=legalTargets(u);
    const freeSC=tg.filter(t=>PROV[t].supplyCenter&&S.owners[t]!==me&&!unitAt(t));
    if(freeSC.length) hints.push(`★ ${u.type} ${u.prov} can walk into an unoccupied supply centre: ${freeSC.join(", ")}${S.season==="Fall"?" — in Fall that centre becomes yours at year end.":" — occupy it in Fall to own it."}`);
    const enemySC=tg.filter(t=>PROV[t].supplyCenter&&unitAt(t)&&unitAt(t).power!==me);
    enemySC.forEach(t=>{ const helpers=mine.filter(x=>x.id!==u.id&&legalTargets(x).includes(t));
      hints.push(`⚔️ Attacking ${t} alone is strength 1 vs 1 — it will bounce. ${helpers.length?`Ask ${helpers.map(h=>h.type+" "+h.prov).join(" / ")} to Support the move for strength 2.`:"No unit of yours can support it yet — get a second unit next to "+t+" first, or pick another target."}`); });
    if(PROV[u.prov].supplyCenter&&S.owners[u.prov]===me&&S.season==="Fall") hints.push(`🛡️ ${u.prov} is your supply centre in Fall — leaving it empty risks losing it if an enemy walks in. Consider Holding, or be sure nobody can reach it.`);
  });
  // support opportunities
  for(const a of mine) for(const b of mine) if(a.id!==b.id){ const common=legalTargets(a).filter(t=>t===b.prov); if(common.length) hints.push(`🤝 Your ${a.type} in ${a.prov} can Support your ${b.type} holding in ${b.prov} — supported holds are very hard to dislodge.`); }
  const scCount=Object.values(S.owners).filter(o=>o===me).length;
  hints.push(`📊 You own ${scCount} of 34 centres; 18 wins. You have ${mine.length} units. ${S.season==="Fall"?"Centres change hands at the end of Fall — plan captures now.":"Spring is for positioning; Fall is when centres are taken."}`);
  const leaders=ACTIVE.map(p=>[p,Object.values(S.owners).filter(o=>o===p).length]).sort((a,b)=>b[1]-a[1])[0];
  if(leaders[0]!==me) hints.push(`👀 ${leaders[0]} leads with ${leaders[1]} centres. Diplomacy hint: the table usually stops a runaway leader — use Press to build that coalition.`);
  return [...new Set(hints)].slice(0,10);
}
function renderHints(){ $("#hintsBox").innerHTML=computeHints().map(h=>`<div>${h}</div>`).join(""); }
function hintFlash(s){ $("#hintsBox").innerHTML=`<div>${s}</div>`+computeHints().map(h=>`<div>${h}</div>`).join(""); document.querySelector('[data-tab="hints"]').click(); }

/* ---------- OpenAI-compatible endpoint ---------- */
async function aiChat(system,userText){
  if(!settings.aiEnabled) throw new Error("AI is not enabled — turn it on in AI & Settings.");
  if(!settings.aiBase) throw new Error("Set an endpoint Base URL in AI & Settings first (or use the offline fallback).");
  const base=settings.aiBase.replace(/\/$/,"");
  const res=await fetch(base+"/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",...(settings.aiKey?{"Authorization":"Bearer "+settings.aiKey}:{})},
    body:JSON.stringify({model:settings.aiModel||"gpt-4o-mini",messages:[{role:"system",content:system},{role:"user",content:userText}],temperature:0.8})});
  if(!res.ok) throw new Error("Endpoint returned "+res.status);
  const j=await res.json(); return j.choices?.[0]?.message?.content?.trim()||"";
}
function offlinePersona(power,text){
  const p=window.PERSONAS[power]||{openers:["Friends —"],closers:["— sent with honour."]}; const opener=p.openers[Math.floor(Math.random()*p.openers.length)];
  const closer=p.closers[Math.floor(Math.random()*p.closers.length)];
  return `${opener} ${text} ${closer}`;
}
async function rewritePersona(){
  const power=$("#personaSelect").value, text=$("#pressText").value.trim(); if(!text) return;
  const p=window.PERSONAS[power]; $("#personaStatus").textContent="Rewriting…";
  try{ if(settings.aiEnabled&&settings.aiBase){ const out=await aiChat(
      `You rewrite Diplomacy game press (negotiation messages) in character. Persona: ${p.system||("a proud, theatrical envoy of "+power+" with local idioms and warmth")} HARD RULES: stay in English; preserve the exact meaning, every province name, number, offer and condition; do not add new promises or threats; keep it light-hearted and fairly short. Return only the rewritten message.`, text);
      $("#pressText").value=out||text; $("#personaStatus").textContent="✨ Rewritten by your AI endpoint in character as "+p.name+". Read it before sending — you own every word you send."; }
    else { $("#pressText").value=offlinePersona(power,text); $("#personaStatus").textContent="🎭 Offline persona styliser used (no AI endpoint enabled). Enable one in Settings for a full AI rewrite as "+p.name+"."; }
  }catch(e){ $("#pressText").value=offlinePersona(power,text); $("#personaStatus").textContent="AI endpoint failed ("+e.message+") — offline persona styliser used instead."; }
}
function boardSummary(){
  const lines=ACTIVE.map(p=>{ const scs=Object.entries(S.owners).filter(([,o])=>o===p).map(([k])=>k);
    const us=S.units.filter(u=>u.power===p).map(u=>`${u.type} ${u.prov}`).join(", ");
    return `${p}: ${scs.length} centres [${scs.join(" ")}]; units: ${us||"none"}`; });
  return `${S.season} ${S.year}. I play ${me}. Full board:\n`+lines.join("\n")+`\nMy current orders: `+JSON.stringify(Object.fromEntries(S.units.filter(u=>u.power===me).map(u=>[u.prov,S.orders[u.id]||"hold"])));
}
async function askAI(){
  document.querySelector('[data-tab="hints"]').click();
  if(!(settings.aiEnabled&&settings.aiBase)){ hintFlash("🤖 AI Strategist needs an endpoint — none is enabled, so here are the full offline hints instead. Add any OpenAI-compatible endpoint in AI & Settings to unlock tailored AI advice."); return; }
  unlock("ai"); $("#hintsBox").innerHTML="<div>🤖 Consulting your AI Strategist…</div>";
  try{ const out=await aiChat("You are an expert Diplomacy (the board game) strategist coaching a player. Give concrete, honest advice for THIS position: 3-5 specific order suggestions with province names, one diplomatic move to make in press, and one risk to watch. No generic filler. Remember: strength is 1+supports, equal strength bounces, centres change hands after Fall, 18 centres wins.", boardSummary());
    $("#hintsBox").innerHTML=`<div><b>🤖 AI Strategist:</b><br>${out.replace(/\n/g,"<br>")}</div>`+computeHints().map(h=>`<div>${h}</div>`).join("");
  }catch(e){ $("#hintsBox").innerHTML=`<div>AI endpoint failed (${e.message}) — offline hints instead:</div>`+computeHints().map(h=>`<div>${h}</div>`).join(""); }
}

/* ---------- custom maps & variants ---------- */
window.DIP_CLASSIC = JSON.parse(JSON.stringify(window.DIP_DATA));
function validateVariantData(v){
  const errs=[]; const terr=v.territories||v.Territories;
  if(!terr||!Array.isArray(terr)||!terr.length) return ["No territories array — a map needs at least one territory."];
  const ids=new Set(terr.map(x=>x.id||x.ID||x.abbreviation));
  terr.forEach(x=>{ const id=x.id||x.ID||x.abbreviation; if(!id) errs.push("A territory is missing its id.");
    (x.borders||x.neighbours||x.neighbors||[]).forEach(b=>{ if(!ids.has(b)) errs.push(`Territory ${id} borders unknown territory ${b}.`); }); });
  if(!terr.some(x=>x.supplyCenter??x.isSupplyCenter??x.SC)) errs.push("No supply centres marked — the map needs at least one supplyCenter:true territory.");
  const starts=v.startingUnits||v.starts; if(!starts||!Object.keys(starts).length) errs.push("No startingUnits — say where each power's first Armies/Fleets start.");
  else Object.values(starts).flat().forEach(u=>{ if(!ids.has(u.prov)) errs.push(`A starting unit sits in unknown territory ${u.prov}.`); });
  return errs;
}
function normaliseVariant(v){
  const terr=v.territories||v.Territories;
  return {provinces:terr.map(x=>({id:x.id||x.ID||x.abbreviation,name:x.name||x.Name||x.id,type:(x.type||x.Type||"coast").toLowerCase().replace("inland","land"),supplyCenter:!!(x.supplyCenter??x.isSupplyCenter??x.SC),home:x.home||x.homePower||null,lat:x.lat??x.latitude??50,lon:x.lon??x.longitude??10,borders:x.borders||x.neighbours||x.neighbors||[]})),
    startingUnits:v.startingUnits||v.starts, winSupplyCenters:v.winSupplyCenters||18};
}
function loadVariantData(raw,label){
  const errs=validateVariantData(raw);
  if(errs.length){ $("#variantStatus").textContent="❌ Custom map NOT loaded:\n"+errs.join("\n"); toast("🚫 Invalid custom map — not loaded. "+errs[0]); forceNotify("🚫 Invalid custom map",errs[0]); return false; }
  const data=normaliseVariant(raw); const wi=$("#winScInput"); if(wi) wi.value=data.winSupplyCenters;
  loadData(data); if(!ACTIVE.includes(me)) me=ACTIVE[0]; S=newGame(); selectedUnit=null; if(window._syncPowers) window._syncPowers(); save(); renderMap(); renderPress(); renderHints(); $("#log").textContent=S.log.join("\n");
  $("#variantStatus").textContent=`✅ Map loaded: ${label} — ${data.provinces.length} territories, ${data.provinces.filter(p=>p.supplyCenter).length} centres, ${data.winSupplyCenters} to win. New game started.`;
  toast(`🗺️ Map loaded: ${label}. New game started.`,true); trackMap(label); return true;
}
function buildAnkara(){ // vDiplomacy's Ankara Crescent rule-twist, per its published description
  const v=JSON.parse(JSON.stringify(window.DIP_CLASSIC)); const provs=v.provinces;
  const seas=provs.filter(p=>p.type==="sea").map(p=>p.id);
  const nonSCLand=provs.filter(p=>p.type!=="sea"&&!p.supplyCenter).map(p=>p.id);
  const nonSCCoast=provs.filter(p=>p.type==="coast"&&!p.supplyCenter).map(p=>p.id);
  provs.forEach(p=>{ const extra=new Set(p.borders);
    if(p.type==="sea"){ seas.forEach(s=>{if(s!==p.id)extra.add(s)}); nonSCCoast.forEach(c=>extra.add(c)); }
    if(p.type!=="sea"&&!p.supplyCenter){ nonSCLand.forEach(l=>{if(l!==p.id)extra.add(l)}); if(p.type==="coast") seas.forEach(s=>extra.add(s)); }
    p.borders=[...extra]; });
  return {variant:"Ankara Crescent",territories:provs,startingUnits:v.startingUnits,winSupplyCenters:18};
}
function buildSprint(){ // original fast teaching map: western Europe, 3 powers
  const keep=["NAO","IRI","ENG","MAO","NTH","CLY","EDI","LVP","YOR","WAL","LON","BRE","PIC","PAR","BUR","GAS","SPA","POR","BEL","HOL","HEL","DEN","KIE","RUH"];
  const provs=window.DIP_CLASSIC.provinces.filter(p=>keep.includes(p.id)).map(p=>({...p,borders:p.borders.filter(b=>keep.includes(b))}));
  return {variant:"Western Sprint",territories:provs,startingUnits:{"England":window.DIP_CLASSIC.startingUnits.England,"France":window.DIP_CLASSIC.startingUnits.France,"Germany":window.DIP_CLASSIC.startingUnits.Germany},winSupplyCenters:7};
}


/* ---------- trophies, XP, levels, streaks ---------- */
function trophyKey(){ return "bb_trophies_"+(user?(user.sub||user.email||user.name):"guest"); }
function loadTrophies(){ try{ return JSON.parse(localStorage.getItem(trophyKey())||"null")||{unlocked:{},days:[],pressSent:0}; }catch(e){ return {unlocked:{},days:[],pressSent:0}; } }
function saveTrophies(t){ localStorage.setItem(trophyKey(),JSON.stringify(t)); }
function xpOf(t){ return window.TROPHIES.filter(x=>t.unlocked[x.id]).reduce((a,x)=>a+x.xp,0); }
function unlock(id){
  const t=loadTrophies(); if(t.unlocked[id]) return; const def=window.TROPHIES.find(x=>x.id===id); if(!def) return;
  t.unlocked[id]=new Date().toISOString().slice(0,10); saveTrophies(t);
  toast(`🏆 Trophy unlocked: ${def.emoji} ${def.name} (+${def.xp} XP) — ${def.desc}`,true);
  forceNotify("🏆 Trophy unlocked: "+def.name, def.desc);
  logLine(`🏆 Trophy unlocked: ${def.emoji} ${def.name} (+${def.xp} XP)`); const lg=$("#log"); if(lg) lg.textContent=S.log.join("\n");
  renderTrophies();
}
function renderTrophies(){
  const t=loadTrophies(); const xp=xpOf(t);
  let level=window.LEVELS[0], next=null; for(let i=0;i<window.LEVELS.length;i++){ if(xp>=window.LEVELS[i][0]){ level=window.LEVELS[i]; next=window.LEVELS[i+1]||null; } }
  const chip=$("#xpChip"); if(chip) chip.textContent=`🏆 ${xp} XP · ${level[1]} · 🔥 ${t.days.length} day${t.days.length===1?"":"s"} played`;
  const box=$("#levelBox"); if(box){ const pct=next?Math.min(100,Math.round((xp-level[0])/(next[0]-level[0])*100)):100;
    box.innerHTML=`<b>${level[1]}</b> — ${xp} XP ${next?`· ${next[0]-xp} XP to ${next[1]}`:"· highest rank!"}<div class="progress"><i style="width:${pct}%"></i></div><span class="small">${Object.keys(t.unlocked).length} of ${window.TROPHIES.length} trophies · played on ${t.days.length} day(s): ${t.days.slice(-7).join(", ")||"today is day one"}</span>`; }
  const grid=$("#trophyGrid"); if(grid) grid.innerHTML=window.TROPHIES.map(x=>{ const un=t.unlocked[x.id];
    return `<div class="trophy ${un?"unlocked":"locked"}"><div class="t-emoji">${x.emoji}</div><b>${x.name}</b> · ${x.xp} XP<br>${x.desc}${un?`<br><span style="color:var(--gold)">Unlocked ${un}</span>`:""}</div>`; }).join("");
  const gt=$("#gtTip"); if(gt){ const day=Math.floor(Date.now()/86400000); gt.innerHTML="<b>Game theory, in one breath:</b><br>"+window.GT_TIPS[day%window.GT_TIPS.length]; }
}
function trackDay(){ const t=loadTrophies(); const today=new Date().toISOString().slice(0,10);
  if(t.days.length&&!t.days.includes(today)) unlock("second-dawn");
  if(!t.days.includes(today)){ t.days.push(today); saveTrophies(t); } renderTrophies(); }
function trackMap(label){ unlock("cartographer"); if(/Caucasus/i.test(label)) unlock("caucasus"); if(/Crossroads/i.test(label)) unlock("empires"); }
function trackOrders(){ const mine=S.units.filter(u=>u.power===me); if(!mine.length) return;
  if(mine.some(u=>S.orders[u.id])) unlock("first-order");
  if(mine.every(u=>S.orders[u.id])) unlock("all-orders");
  if(mine.some(u=>S.orders[u.id]?.type==="support")) unlock("support");
  if(mine.some(u=>S.orders[u.id]?.type==="convoy")) unlock("convoy"); }

/* ---------- press ---------- */
function renderPress(){
  $("#pressTo").innerHTML=ACTIVE.filter(p=>p!==me).map(p=>`<option>${p}</option>`).join("")+`<option>Everyone (public)</option>`;
  $("#personaSelect").innerHTML=ACTIVE.map(p=>`<option ${p===me?"selected":""}>${p}</option>`).join("");
  renderPersonaCard(); $("#pressLog").textContent=S.press.map(m=>`${m.from} → ${m.to}: ${m.text}`).join("\n\n")||"No press yet. Diplomacy is won in this tab — say hello, propose a support, set a trap.";
}
function renderPersonaCard(){ const p=window.PERSONAS[$("#personaSelect").value]||{emoji:"🎭",name:"The "+$("#personaSelect").value+" Envoy",archetype:"A dignified envoy of "+$("#personaSelect").value+", speaking with local pride and theatrical flair.",idioms:["with honour","by the old stories"],openers:["Friends —"],closers:["In honour, "+$("#personaSelect").value+"."]}; $("#personaCard").innerHTML=`${p.emoji} <b>${p.name}</b><br>${p.archetype}<br><span class="small">Flavours: ${p.idioms.join(" · ")}</span>`; }

/* ---------- notifications / PWA ---------- */
async function notify(title,body){
  if(!settings.pushEnabled) return;
  try{ if("serviceWorker" in navigator){ const reg=await navigator.serviceWorker.ready; if(Notification.permission==="granted"&&reg.showNotification) return reg.showNotification(title,{body,icon:"icons/icon-192.png",badge:"icons/icon-192.png"}); }
    if(Notification.permission==="granted") new Notification(title,{body}); }catch(e){}
}
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredInstall=e; $("#installBtn").classList.remove("hidden"); });
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(()=>{});

/* ---------- Google sign-in ---------- */
function applyUser(){ const av=localStorage.getItem("bb_avatar_"+(user?(user.sub||user.email):"guest"))||(user&&user.picture)||"";
  $("#userBadge").innerHTML=(av?`<img src="${av}" alt="" style="width:20px;height:20px;border-radius:50%;vertical-align:-5px"> `:"👤 ")+(user?`${user.name} (${user.email})`:"Guest");
  const prev=$("#avatarPreview"); if(prev&&av) prev.src=av; $("#signOut").classList.toggle("hidden",!user); $("#googleBtn").classList.toggle("hidden",!!user); $("#demoSignIn").classList.toggle("hidden",!!user); }
function initGoogle(){
  const cid=settings.googleClientId;
  if(cid&&window.google&&google.accounts&&google.accounts.id){
    google.accounts.id.initialize({client_id:cid,callback:resp=>{
      try{ const payload=JSON.parse(atob(resp.credential.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
        user={name:payload.name,email:payload.email,sub:payload.sub,picture:payload.picture}; localStorage.setItem("bb_user",JSON.stringify(user)); applyUser(); setTimeout(()=>unlock("account"),50); load(); renderMap(); renderPress(); $("#log").textContent=S.log.join("\n"); alert("Signed in as "+user.email+" — your saves on this device are now keyed to your Google profile."); }
      catch(e){ alert("Google sign-in returned an unreadable credential."); } }});
    $("#googleBtn").onclick=()=>google.accounts.id.prompt();
  } else {
    $("#googleBtn").onclick=()=>alert("Real Google Sign-In needs a Client ID: paste your Google OAuth Web Client ID in AI & Settings → Google Sign-In (free in Google Cloud Console). Or use Demo sign-in to try the full saved-profile flow right now — that's exactly how Backstabbr-style Google login behaves once configured.");
  }
}

/* ---------- wire up ---------- */
function init(){
  const ps=$("#powerSelect"); window._syncPowers=()=>{ ps.innerHTML=ACTIVE.map(p=>`<option>${p}</option>`).join(""); ps.value=me; }; window._syncPowers();
  load(); applyUser();
  $("#powerSelect").value=me;
  ps.addEventListener("change",()=>{ me=ps.value; selectedUnit=null; save(); renderMap(); renderPress(); renderHints(); });
  document.querySelectorAll(".tabs button").forEach(b=>b.addEventListener("click",()=>{
    document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active")); b.classList.add("active");
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active")); $("#tab-"+b.dataset.tab).classList.add("active"); }));
  $("#resolveBtn").onclick=resolveTurn; $("#newGameBtn").onclick=()=>{ if(confirm("Start a new game? Current game will be replaced.")){ S=newGame(); uid=1000; save(); renderMap(); renderPress(); renderHints(); $("#log").textContent=S.log.join("\n"); } };
  $("#hintBtn").onclick=()=>{ unlock("strategist"); renderHints(); document.querySelector('[data-tab="hints"]').click(); };
  $("#aiHintBtn").onclick=askAI; $("#saveBtn").onclick=()=>{ save(); alert("Saved. Your game, orders and press are stored on this device"+(user?" under "+user.email:" as guest")+"."); };
  $("#exportBtn").onclick=()=>{ const blob=new Blob([localStorage.getItem(saveKey())||"{}"],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="backstabber-save.json"; a.click(); };
  $("#importFile").addEventListener("change",e=>{ const f=e.target.files[0]; if(!f) return; f.text().then(t=>{ localStorage.setItem(saveKey(),t); load(); renderMap(); renderPress(); $("#log").textContent=S.log.join("\n"); }); });
  $("#toggleLines").onclick=e=>{ settings.lines=!settings.lines; e.target.textContent="Adjacency lines: "+(settings.lines?"on":"off"); save(); renderMap(); };
  $("#toggleLabels").onclick=e=>{ settings.labels=!settings.labels; e.target.textContent="Labels: "+(settings.labels?"on":"off"); save(); renderMap(); };
  $("#personaSelect").addEventListener("change",renderPersonaCard);
  $("#personaBtn").onclick=async()=>{ await rewritePersona(); if($("#pressText").value.trim()) unlock("persona"); };
  $("#sendPress").onclick=()=>{ const text=$("#pressText").value.trim(); if(!text) return; const to=$("#pressTo").value;
    const pledge=$("#pressPledge")?.checked; const shown=pledge?"🤝 PUBLIC PLEDGE: "+text:text;
    S.press.unshift({from:pledge?me+" (pledged publicly)":me,to:pledge?"Everyone (public)":to,text:shown}); $("#pressText").value=""; if($("#pressPledge")) $("#pressPledge").checked=false; save(); renderPress();
    { const tt=loadTrophies(); tt.pressSent=(tt.pressSent||0)+1; saveTrophies(tt); } unlock("first-press"); if(pledge) unlock("pledge");
    if(to!=="Everyone (public)") setTimeout(()=>{ S.press.unshift({from:to,to:me,text:botReply(to)}); save(); renderPress(); notify("New press from "+to,"A reply arrived in the Press tab."); },900); };
  $("#demoSignIn").onclick=()=>{ user={name:"Guest Diplomat",email:"guest@example.com",sub:"demo-guest"}; localStorage.setItem("bb_user",JSON.stringify(user)); applyUser(); load(); renderMap(); renderPress(); unlock("account"); alert("Demo sign-in complete — saves are now stored under this profile on this device, exactly as with Google sign-in."); };
  $("#signOut").onclick=()=>{ save(); user=null; localStorage.removeItem("bb_user"); applyUser(); load(); renderMap(); renderPress(); };
  $("#installBtn").onclick=async()=>{ if(deferredInstall){ deferredInstall.prompt(); deferredInstall=null; } };
  $("#notifyBtn").onclick=async()=>{ if(!("Notification" in window)) return alert("This browser doesn't support notifications.");
    const perm=await Notification.requestPermission(); settings.pushEnabled=perm==="granted"; $("#pushEnabled").checked=settings.pushEnabled; save();
    alert(perm==="granted"?"Notifications enabled — you'll get turn and press alerts on this device (and in the installed Android app).":"Notifications were not granted."); if(perm==="granted") notify("Backstabplomacy","Notifications are on. No centre will fall silently. 🗡️"); };
  $("#testNotify").onclick=()=>notify("Backstabplomacy — test","🔔 This is how turn reminders and press alerts will look.");
  $("#remindBtn").onclick=()=>{ alert("Demo reminder set for 10 seconds from now."); setTimeout(()=>notify("⏰ Orders reminder","Your Diplomacy orders phase is waiting — check the map!"),10000); };
  // settings fields
  const bind=(id,key,type="value")=>{ const el=$(id); el[type==="check"?"checked":"value"]=settings[key]; el.addEventListener("change",()=>{ settings[key]=type==="check"?el.checked:el.value; save(); if(id==="#googleClientId") initGoogle(); }); };
  bind("#aiEnabled","aiEnabled","check"); bind("#aiBase","aiBase"); bind("#aiModel","aiModel"); bind("#aiKey","aiKey"); bind("#googleClientId","googleClientId"); bind("#pushEnabled","pushEnabled","check");
  $("#aiTest").onclick=async()=>{ $("#aiStatus").textContent="Testing…"; try{ const out=await aiChat("You are a test endpoint. Reply with the single word READY.","ping"); $("#aiStatus").textContent="✅ Endpoint works — model replied: "+out.slice(0,40); }catch(e){ $("#aiStatus").textContent="❌ "+e.message+" (check URL/model/key — offline features still work)"; } };
  $("#variantFile").addEventListener("change",e=>{ const f=e.target.files[0]; if(!f) return; f.text().then(t=>{ try{ loadVariantData(JSON.parse(t),f.name); }catch(err){ $("#variantStatus").textContent="❌ Couldn't parse that file as JSON: "+err.message; toast("🚫 Invalid custom map file — not valid JSON."); forceNotify("🚫 Invalid custom map","That file is not valid JSON."); } }); });
  $("#validateBtn").onclick=()=>{ const v=showValidation(true); if(!v.errors.length&&!v.warnings.length) toast("✅ All orders are legal and ready to submit.",true); };
  $("#applyMapBtn").onclick=()=>{ const which=$("#mapSelect").value;
    if(!confirm("Load this map and start a NEW game on it? Your current game will be replaced.")) return;
    if(which==="classic") loadVariantData({territories:window.DIP_CLASSIC.provinces,startingUnits:window.DIP_CLASSIC.startingUnits,winSupplyCenters:18},"Classic — Europe 1901");
    else if(which==="ankara") loadVariantData(buildAnkara(),"Ankara Crescent");
    else if(which==="sprint") loadVariantData(buildSprint(),"Western Sprint (teaching map)");
    else if(which==="caucasus"||which==="empires"){ $("#variantStatus").textContent="Loading map…";
      fetch("variants/"+which+".json").then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
      .then(v=>loadVariantData(v, which==="caucasus"?"Caucasus & Caspian":"Empires of the Crossroads"))
      .catch(e=>{ $("#variantStatus").textContent="❌ Couldn't load variants/"+which+".json ("+e.message+") — if you opened this page as a local file, serve it over http instead."; toast("🚫 Map failed to load: "+e.message); }); } };
  $("#downloadMapBtn").onclick=()=>{ const out={variant:"Exported from Backstabplomacy",territories:Object.values(PROV),startingUnits:window._starts,winSupplyCenters:window._winSC};
    const blob=new Blob([JSON.stringify(out,null,1)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="custom-diplomacy-map.json"; a.click(); };
  $("#loadCustomMapBtn").onclick=()=>{ const t=$("#customMapText").value.trim(); if(!t) return toast("Paste a custom map JSON first.");
    try{ loadVariantData(JSON.parse(t),"Pasted custom map"); }catch(err){ $("#variantStatus").textContent="❌ Pasted map is not valid JSON: "+err.message; toast("🚫 Invalid custom map — not valid JSON."); forceNotify("🚫 Invalid custom map","Pasted map is not valid JSON."); } };
  $("#avatarFile").addEventListener("change",e=>{ const f=e.target.files[0]; if(!f) return; const img=new Image();
    img.onload=()=>{ const c=document.createElement("canvas"); const sc=128/Math.max(img.width,img.height); c.width=img.width*sc; c.height=img.height*sc; c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      localStorage.setItem("bb_avatar_"+(user?(user.sub||user.email):"guest"),c.toDataURL("image/jpeg",0.85)); applyUser(); unlock("photo"); toast("📸 Profile photo saved — looking imperial.",true); };
    img.src=URL.createObjectURL(f); });
  renderMap(); renderPress(); renderHints(); showValidation(false); trackDay(); $("#log").textContent=S.log.join("\n"); initGoogle();
}
function botReply(from){
  const lines={England:"I say — received, old chap. London will consider it over tea and reply before the phase ends.",France:"Mon ami! A delicious proposal. Paris is listening — let us add a little sauce and talk terms.",Germany:"Your message is received with great pleasure. Precisely noted, every word. Berlin shall respond… in due course.",Italy:"Amico mio! Music to my ears. Rome sings back soon — keep your fleet where I can see it, eh?",Austria:"My dear friend, Vienna has waltzed around your idea once and likes the tempo. More after coffee.",Russia:"Your words are placed on the board, comrade. The Tsar moves slowly — but he moves.",Turkey:"My friend, the tea is poured and your proposal is being weighed like spice. Constantinople will answer."};
  return lines[from]||"Received. We will reply before the deadline.";
}
document.addEventListener("DOMContentLoaded",init);
