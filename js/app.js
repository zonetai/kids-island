/* ============================================================
   知識島探險隊 — 遊戲邏輯
   ============================================================ */
const KEY="kidsIsland_v1";
const QPER=5, BOSS_N=8, DAILY_GOAL=3, DAILY_REWARD=30, DRAW_COST=20;
const today=(o=0)=>new Date(Date.now()-o*864e5).toLocaleDateString("sv");
const FRESH=()=>({v:3,coin:0,star:0,streak:0,last:"",prog:{},cards:[],sound:true,music:false,avatar:"🧒",owned:["🧒","👧"],theme:"sun",themes:["sun"],
  items:{potion:0,shield:0,hint:0},lastGrade:0,daily:{d:"",n:0,claimed:false},wrongs:[],played:0,right:0,stats:{},seen:{},ach:[],
  best:{combo:0,coins:0,daily:0,practice:0},notesRead:{},pendingShield:"",history:{}});
/* ---------- 多人檔案 ---------- */
const PKEY="kidsIsland_profiles";
const lsGet=(k)=>{try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let PF=lsGet(PKEY)||{list:[],current:""};
/* 舊版單人資料 → 轉成第一位小朋友 */
if(!PF.list.length&&lsGet(KEY)){const id="p"+Date.now();PF.list.push({id,name:"小冒險家",avatar:(lsGet(KEY).avatar)||"🧒",created:today()});lsSet(KEY+"_"+id,lsGet(KEY));localStorage.removeItem(KEY);lsSet(PKEY,PF)}
let S=FRESH();
function normalize(S){
  if(S.stickers){S.cards=[...new Set([...(S.cards||[]),...S.stickers.filter(e=>CARDS.some(c=>c.e===e))])];delete S.stickers}
  for(const k in S.prog){const p=S.prog[k];if(Array.isArray(p))S.prog[k]={c:[p[0]||0,p[1]||0],boss:p[2]||0,full:false}}
  S.items=Object.assign({potion:0,shield:0,hint:0},S.items||{});S.best=Object.assign({combo:0,coins:0,daily:0,practice:0},S.best||{});
  if(!S.daily||S.daily.d!==today())S.daily={d:today(),n:0,claimed:false};
  return S;
}
function curProfile(){return PF.list.find(p=>p.id===PF.current)}
function loadProfile(id){const p=PF.list.find(x=>x.id===id);if(!p)return false;PF.current=id;lsSet(PKEY,PF);S=normalize(Object.assign(FRESH(),lsGet(KEY+"_"+id)||{}));S.avatar=p.avatar;S.name=p.name;return true}
const save=()=>{const p=curProfile();if(!p)return;p.avatar=S.avatar;S._t=Date.now();lsSet(PKEY,PF);lsSet(KEY+"_"+p.id,S);SYNC.schedule()};
function profileStars(id){const d=lsGet(KEY+"_"+id);return d?(d.star||0):0}
function addProfile(name,avatar){name=(name||"").trim().slice(0,10);if(!name){toast("請先輸入名字");return}if(PF.list.length>=8){toast("最多 8 位小朋友");return}const id="p"+Date.now();PF.list.push({id,name,avatar,created:today()});lsSet(PKEY,PF);loadProfile(id);save();hud();sfx("win");confetti(60);toast(`歡迎 ${avatar} ${name}！`);home()}
function deleteProfile(id){PF.list=PF.list.filter(p=>p.id!==id);localStorage.removeItem(KEY+"_"+id);SYNC.remove(id).catch(()=>{});if(PF.current===id)PF.current="";lsSet(PKEY,PF);closeModal();if(!PF.current)loginScreen();else home()}
function renameProfile(){const n=($("pfName").value||"").trim().slice(0,10);if(!n){toast("名字不能空白");return}const p=curProfile();p.name=n;S.name=n;save();hud();closeModal();toast("已改名為 "+n);home()}
let loginAv="🧒";
function loginScreen(){
  Q=null;$("story").style.display="none";closeModal();
  const avs=["🧒","👧","👦","🧑","🐱","🐶","🐰","🦊","🐼","🐯","🦁","🐸","🦄","🐲","🤖","👑"];
  app.innerHTML=`<div class="login rise"><div class="big">🏝️</div><h1>誰要來冒險？</h1><p class="sub">每位小朋友有自己的進度、星星和金幣。點自己的名字開始！</p>
    <div class="pfs">${PF.list.map(p=>`<button class="pf" onclick="loadProfile('${p.id}');hud();home();sfx('coin')"><span class="e">${p.avatar}</span><b>${esc(p.name)}</b><small>⭐ ${profileStars(p.id)}</small></button>`).join("")}
      <div class="pf new"><span class="e" id="loginAv">${loginAv}</span><input id="newName" maxlength="10" placeholder="輸入名字" onkeydown="if(event.key==='Enter')addProfile(this.value,loginAv)">
        <div class="avpick">${avs.map(a=>`<button class="${a===loginAv?"on":""}" onclick="loginAv='${a}';[...this.parentElement.children].forEach(b=>b.classList.remove('on'));this.classList.add('on');$('loginAv').textContent='${a}'">${a}</button>`).join("")}</div>
        <button class="btn-pri" onclick="addProfile($('newName').value,loginAv)">➕ 新增小朋友</button></div></div>
    ${SYNC.enabled()?`<div class="syncbar"><span>${SYNC.family()?`☁️ 家庭同步已開啟（${SYNC.family()}）${SYNC.status==="error"?" ⚠️ 連線失敗":""}`:"☁️ 想在手機、平板上也看到同樣的進度？"}</span><button class="btn-ghost btn-sm" onclick="openSync()">${SYNC.family()?"管理同步":"設定家庭同步"}</button></div>`
      :`<p class="muted" style="font-size:12px;margin-top:16px">資料只存在這台裝置的瀏覽器裡。</p>`}</div>`;
  document.querySelector(".brand small").textContent="國小全科闖關";
}
function openSwitch(){modal(`<h2>🔁 切換小朋友</h2><div class="pfs small">${PF.list.map(p=>`<button class="pf ${p.id===PF.current?"on":""}" onclick="closeModal();loadProfile('${p.id}');hud();home();sfx('coin')"><span class="e">${p.avatar}</span><b>${esc(p.name)}</b><small>⭐ ${profileStars(p.id)}</small></button>`).join("")}</div>
  <p style="margin-top:12px"><button class="btn-ghost" onclick="closeModal();loginScreen()">➕ 新增小朋友</button></p>`)}
const app=document.getElementById("app");
const $=id=>document.getElementById(id);
const pk=(g,s)=>`${g}-${s}`;
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=R(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

/* ---------- 章節 / 進度 ---------- */
function chapters(g,s){
  if(s==="math")return MATH_CH_NAME[g].map((n,i)=>({name:n,tag:MATH_CH[g][i],t:i}));
  const tags=[];for(const q of BANK[s][g])if(!tags.includes(q[3]))tags.push(q[3]);
  const ch=tags.map(t=>({name:t,tag:t}));
  if(s==="english")ch.push({name:"聽力",tag:"聽力",listen:true});
  return ch;
}
function prog(g,s){const k=pk(g,s);if(!S.prog[k])S.prog[k]={c:[],boss:0,full:false};const p=S.prog[k];const n=chapters(g,s).length;while(p.c.length<n)p.c.push(0);return p}
const chStars=(g,s,i)=>prog(g,s).c[i]||0;
const bossStars=(g,s)=>prog(g,s).boss||0;
const subjStars=(g,s)=>{const p=prog(g,s);return p.c.reduce((a,b)=>a+b,0)+p.boss};
const subjMax=(g,s)=>(chapters(g,s).length+1)*3;
const chUnlocked=(g,s,i)=>i===0||chStars(g,s,i-1)>0;
const bossUnlocked=(g,s)=>prog(g,s).c.every(x=>x>0);
const gradeStars=g=>SUBJ_BY_GRADE(g).reduce((n,s)=>n+subjStars(g,s),0);
const gradeMax=g=>SUBJ_BY_GRADE(g).reduce((n,s)=>n+subjMax(g,s),0);

/* ---------- 出題 ---------- */
function listenPool(g){const w=[];for(const q of BANK.english[g]){const a=q[1][0];if(/^[a-z]{3,}$/i.test(a)&&!w.includes(a))w.push(a)}return w}
function listenQ(g,word){const pool=listenPool(g).filter(x=>x!==word);const d=shuffle(pool).slice(0,3);while(d.length<3)d.push(["cat","dog","sun","red"][d.length]);return ["🔊 仔細聽，你聽到哪一個字？",[word,...d],`聽到的是「${word}」`, "聽力", word]}
function buildQs(g,s,ch,n,hard){
  let qs=[];
  if(s==="math"){const ts=ch?[ch.t]:[0,1,2];qs=Array.from({length:n},(_,i)=>mathQ(g,ts[i%ts.length],hard))}
  else if(ch&&ch.listen){const w=shuffle(listenPool(g));qs=Array.from({length:n},(_,i)=>listenQ(g,w[i%w.length]))}
  else{
    let pool=BANK[s][g];
    if(ch)pool=pool.filter(q=>q[3]===ch.tag);
    qs=shuffle(pool).slice(0,n);
    if(!ch&&s==="english"){const w=shuffle(listenPool(g));qs=qs.slice(0,n-2).concat([listenQ(g,w[0]),listenQ(g,w[1])])}
    while(qs.length<n)qs.push(pool[R(0,pool.length-1)]);
  }
  return shuffle(qs).map(([q,o,e,tag,lw])=>({q,ans:o[0],opts:shuffle(o),e,tag,lw}));
}

/* ---------- HUD / 音效 / 特效 ---------- */
function hud(){$("sCoin").textContent=S.coin;$("sStar").textContent=S.star;$("sStreak").textContent=S.streak;$("avBtn").textContent=S.avatar;document.querySelector(".brand small").textContent=S.name?`${S.name} 的冒險`:"國小全科闖關";
  $("sndBtn").textContent=S.sound?"🔊":"🔇";$("sndBtn").classList.toggle("off",!S.sound);$("musBtn").classList.toggle("off",!S.music);applyTheme()}
function bump(id){const el=$(id).parentElement;el.classList.remove("bump");void el.offsetWidth;el.classList.add("bump")}
function applyTheme(){const t=THEMES.find(x=>x.k===S.theme)||THEMES[0];document.body.style.setProperty("--bg",t.base);document.body.style.setProperty("--bgimg",t.bg);document.body.classList.toggle("dark",!!t.dark)}
let ac;
function tone(f,t0,d,type="triangle",g=.12){const o=ac.createOscillator(),v=ac.createGain();o.type=type;o.frequency.value=f;o.connect(v);v.connect(ac.destination);const t=ac.currentTime+t0;v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.001,t+d);o.start(t);o.stop(t+d)}
function sfx(k){if(!S.sound)return;try{ac=ac||new AudioContext();if(ac.state==="suspended")ac.resume();
  if(k==="ok"){tone(660,0,.15);tone(880,.12,.22)}
  else if(k==="bad"){tone(220,0,.3,"sawtooth",.07)}
  else if(k==="win"){[523,659,784,1047].forEach((f,i)=>tone(f,i*.12,.35))}
  else if(k==="boss"){[392,330,262,196].forEach((f,i)=>tone(f,i*.15,.4,"square",.06))}
  else if(k==="coin"){tone(1200,0,.08,"square",.05);tone(1700,.08,.14,"square",.05)}
  else if(k==="combo"){tone(880,0,.1);tone(1100,.08,.1);tone(1320,.16,.2)}
  else if(k==="draw"){[600,800,1000,1300,1600].forEach((f,i)=>tone(f,i*.07,.2,"sine",.08))}}catch(e){}}
let musTimer=null;
const MELODY=[523,659,784,659,523,587,698,587,659,784,880,784,659,523,587,440];
function toggleMusic(){S.music=!S.music;save();hud();if(S.music)startMusic();else stopMusic()}
function startMusic(){try{ac=ac||new AudioContext();if(ac.state==="suspended")ac.resume();stopMusic();let i=0;musTimer=setInterval(()=>{if(!S.music)return;tone(MELODY[i%MELODY.length],0,.28,"triangle",.035);tone(MELODY[i%MELODY.length]/2,0,.28,"sine",.02);i++},300)}catch(e){}}
function stopMusic(){if(musTimer){clearInterval(musTimer);musTimer=null}}
function toggleSound(){S.sound=!S.sound;save();hud();if(S.sound)sfx("ok")}
function toggleFull(){try{if(!document.fullscreenElement)document.documentElement.requestFullscreen();else document.exitFullscreen()}catch(e){toast("此裝置不支援全螢幕")}}
function say(text,lang="en-US"){if(!("speechSynthesis" in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=.85;speechSynthesis.speak(u)}catch(e){}}
function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
function confetti(n=90){const cols=["#ff8a3d","#ffc861","#3bb273","#4fb3ff","#e5484d","#b388ff"];for(let i=0;i<n;i++){const d=document.createElement("i");d.className="cf";d.style.cssText=`left:${Math.random()*100}vw;background:${cols[i%6]};animation-duration:${1.8+Math.random()*1.6}s;animation-delay:${Math.random()*.7}s;transform:rotate(${Math.random()*360}deg)`;document.body.appendChild(d);setTimeout(()=>d.remove(),4000)}}
function addCoins(n){S.coin+=n;S.best.coins+=n;bump("sCoin")}
function touchStreak(){const d=today();if(S.last===d)return;S.streak=S.last===today(1)?S.streak+1:1;S.last=d}
function logHistory(){const d=today();S.history[d]=(S.history[d]||0)+1;const keys=Object.keys(S.history).sort();while(keys.length>30)delete S.history[keys.shift()]}
function checkAch(){let got=0;for(const a of ACHIEVEMENTS){if(!S.ach.includes(a.k)&&a.t(S)){S.ach.push(a.k);S.coin+=10;S.best.coins+=10;got++;setTimeout(()=>toast(`🏅 成就達成：${a.n}！+10 🪙`),400*got)}}if(got){save();hud()}}

/* ---------- 首頁 ---------- */
function missionHTML(){
  const d=S.daily,done=d.n>=DAILY_GOAL;
  return `<div class="mission ${done?"ok":""}"><span style="font-size:30px">🎯</span>
    <div class="t">今日任務：通關 ${DAILY_GOAL} 關<small>${d.claimed?"✅ 今天完成了，明天再來！":done?"任務完成！快領獎勵":"任何科目，拿到至少 1 顆星就算通關"}</small></div>
    <div class="prog"><i style="width:${Math.min(d.n,DAILY_GOAL)/DAILY_GOAL*100}%"></i></div><b>${Math.min(d.n,DAILY_GOAL)}/${DAILY_GOAL}</b>
    ${done&&!d.claimed?`<button class="btn-pri" onclick="claimDaily()">領取 🪙 ${DAILY_REWARD}</button>`:""}</div>`;
}
function claimDaily(){if(S.daily.n<DAILY_GOAL||S.daily.claimed)return;S.daily.claimed=true;S.best.daily++;addCoins(DAILY_REWARD);save();hud();sfx("coin");confetti(50);toast(`🎯 任務完成！獲得 ${DAILY_REWARD} 金幣`);checkAch();home()}
function home(){
  Q=null;location.hash="";
  const LG=GRADES[S.lastGrade-1];
  app.innerHTML=`<div class="hero rise"><div class="big">🏝️</div><div><h1>歡迎回來，${S.avatar} ${esc(S.name||"小冒險家")}！</h1><p>選一座年級島，闖過每個科目世界，打敗魔王收集星星！</p></div>
    <div class="acts"><button class="btn-ghost" onclick="openPractice()">🎯 自由練習</button><button class="btn-ghost" onclick="openWrongs()">📒 錯題本${S.wrongs.length?`（${S.wrongs.length}）`:""}</button><button class="btn-ghost" onclick="openAch()">🏅 成就 ${S.ach.length}/${ACHIEVEMENTS.length}</button></div></div>
  ${LG?`<button class="cont rise" onclick="grade(${LG.g})"><span class="e">${LG.emo}</span><span>▶ 繼續冒險：${LG.name}・${LG.place}<small>上次玩到這裡</small></span></button>`:""}
  ${missionHTML()}
  <div class="grid g3">${GRADES.map((G,i)=>{
    const subs=SUBJ_BY_GRADE(G.g),tot=gradeMax(G.g),got=gradeStars(G.g),full=got===tot;
    return `<button class="card grade-card rise ${full?"done":""}" style="--gc:${G.color};animation-delay:${i*.06}s" onclick="grade(${G.g})">
      ${full?`<span class="ribbon">全部通關</span>`:""}
      <div class="big">${G.emo}</div><h3>${G.name}・${G.place}</h3><p>⭐ ${got} / ${tot}</p>
      <div class="prog" style="margin-top:6px"><i style="width:${got/tot*100}%"></i></div>
      <div class="tags">${subs.map(s=>`<span class="tag">${SUBJECTS[s].emo} ${SUBJECTS[s].name}</span>`).join("")}</div></button>`}).join("")}</div>`;
}

/* ---------- 年級頁 ---------- */
function grade(g){
  Q=null;location.hash="g"+g;S.lastGrade=g;save();
  const G=GRADES[g-1];
  app.innerHTML=`<button class="back" onclick="home()">⬅ 全部年級</button>
  <h1>${G.emo} ${G.name}・${G.place}</h1><p class="sub">每個科目是一個世界，沿著路線闖關，最後挑戰魔王！</p>
  <div class="grid g3">${SUBJ_BY_GRADE(g).map((s,i)=>{
    const X=SUBJECTS[s],got=subjStars(g,s),max=subjMax(g,s),p=Math.round(got/max*100),ch=chapters(g,s),done=prog(g,s).c.filter(x=>x>0).length;
    return `<div class="card subj rise" style="--sc:${X.color};animation-delay:${i*.06}s"><div class="ring" style="--p:${p}"><span>${p}%</span></div>
      <div class="emo">${X.emo}</div><h3>${X.name}</h3><div class="world">${X.world}　${X.npc} ${X.npcName}</div>
      <div class="prog"><i style="width:${p}%"></i></div>
      <p class="muted" style="margin:0;font-size:13px">關卡 ${done}/${ch.length}　${bossStars(g,s)?"👑 魔王已擊敗":"👑 魔王未擊敗"}　★ ${got}/${max}</p>
      <div class="go"><button class="btn-pri" onclick="world(${g},'${s}')">${got?"繼續冒險 ➜":"▶ 開始冒險"}</button></div></div>`}).join("")}</div>`;
}

/* ---------- 科目世界（關卡路線） ---------- */
function world(g,s){
  Q=null;location.hash=`g${g}-${s}`;S.lastGrade=g;save();
  const X=SUBJECTS[s],G=GRADES[g-1],ch=chapters(g,s),p=prog(g,s);
  if(!S.seen[s]){S.seen[s]=true;save();showStory(X,()=>world(g,s));return}
  const nextI=ch.findIndex((c,i)=>chUnlocked(g,s,i)&&chStars(g,s,i)<3);
  const bossNext=nextI<0&&bossUnlocked(g,s)&&bossStars(g,s)<3;
  app.innerHTML=`<button class="back" onclick="grade(${g})">⬅ ${G.name}</button>
  <div class="world" style="--wbg:${X.bg};--accent:${X.color}">
    <div class="whead"><div class="npc">${X.npc}</div><div><h1>${X.emo} ${X.world}</h1><p>${G.name}${X.name}・${X.npcName}陪你闖關　★ ${subjStars(g,s)}/${subjMax(g,s)}</p></div>
      <div class="acts"><button class="btn-ghost btn-sm" onclick="showStory(SUBJECTS['${s}'])">💬 故事</button><button class="btn-ghost btn-sm" onclick="openPractice(${g},'${s}')">🎯 練習</button><button class="btn-ghost btn-sm" onclick="openParents('${g}-${s}')">👪 家長</button></div></div>
    <div class="trail">
      <div class="node start"><div class="orb">🚩</div><div class="info"><h4>出發點</h4><p>${X.story[1]}</p><button class="btn-ghost btn-sm" onclick="showStory(SUBJECTS['${s}'])">💬 聽${X.npcName}說</button></div></div>
      ${ch.map((c,i)=>{const st=chStars(g,s,i),un=chUnlocked(g,s,i),k=`${g}-${s}-${i}`,read=S.notesRead[k];
        return `<div class="node ${un?"":"lock"} ${i===nextI?"next":""} ${st===3?"done":""}"><div class="orb">${un?(st===3?"🏆":c.listen?"🎧":"📘"):"🔒"}<span class="num">${i+1}</span><span class="st">${"★".repeat(st)}${"☆".repeat(3-st)}</span></div>
        <div class="info"><h4>${c.name}${c.listen?" <span class='tag'>聽發音選字</span>":""}</h4><p>${un?`${QPER} 題・3 顆愛心${read?"・📖 已讀攻略":""}`:"先在上一關拿到 1 顆星"}</p>
        <div class="row"><button class="btn-ghost btn-sm" onclick="openNotes('${s}','${c.tag}','${k}')">📖 攻略本</button><button class="btn-pri btn-sm" ${un?"":"disabled"} onclick="play(${g},'${s}',${i})">${st?"再挑戰":"▶ 開始"}</button></div></div></div>`}).join("")}
      <div class="node boss ${bossUnlocked(g,s)?"":"lock"} ${bossNext?"next":""}"><div class="orb">${bossUnlocked(g,s)?(bossStars(g,s)?"🏰":"👾"):"🔒"}<span class="st">${"★".repeat(bossStars(g,s))}${"☆".repeat(3-bossStars(g,s))}</span></div>
        <div class="info"><h4>👑 魔王城</h4><p>${bossUnlocked(g,s)?`${BOSS_N} 題混合挑戰，金幣加倍！`:"所有關卡都拿到星星才能挑戰"}</p><button class="btn-pri boss btn-sm" ${bossUnlocked(g,s)?"":"disabled"} onclick="play(${g},'${s}','boss')">${bossStars(g,s)?"再戰魔王":"⚔️ 挑戰魔王"}</button></div></div>
    </div></div>`;
}
function showStory(X,after){
  let i=0;const box=$("story");
  const draw=()=>{box.innerHTML=`<div class="box"><div class="face">${X.npc}</div><div class="txt">${X.story[i]}<small>${X.npcName}　・　點一下繼續（${i+1}/${X.story.length}）</small></div></div>`};
  box.style.display="flex";draw();
  box.onclick=()=>{i++;if(i>=X.story.length){box.style.display="none";box.onclick=null;if(after)after()}else draw()};
}
function openNotes(s,tag,k){
  const n=NOTES[tag]||"這個單元的重點就在題目的解說裡，答錯時記得仔細看喔！";
  const first=k&&!S.notesRead[k];
  modal(`<h2>📖 攻略本・${tag}</h2><div style="background:#fff6dd;border-radius:14px;padding:14px;font-size:16px;line-height:1.7">${n}</div>
    ${k?`<p class="muted" style="font-size:13px">${first?"🛡️ 第一次讀完攻略本，下一次挑戰這關會獲得一個護盾（答錯一次不扣愛心）！":"你已經讀過這一關的攻略本了。多讀幾次也不錯！"}</p>`:""}`);
  if(first){S.notesRead[k]=true;S.pendingShield=k;save()}
}

/* ---------- 闖關 ---------- */
let Q=null;
function play(g,s,ci,practice){
  const ch=chapters(g,s),boss=ci==="boss",c=boss?null:ch[ci];
  const n=practice?999:boss?BOSS_N:QPER;
  const qs=practice?buildQs(g,s,c,12,false):buildQs(g,s,c,n,boss);
  Q={g,s,ci,boss,c,n:practice?qs.length:n,qs,i:0,right:0,hearts:3,combo:0,maxCombo:0,bonus:0,wrong:[],shield:false,practice:!!practice,pr:0,pn:0};
  const k=`${g}-${s}-${ci}`;
  if(!practice&&S.pendingShield===k){Q.shield=true;S.pendingShield="";save();toast("🛡️ 攻略本護盾啟動！")}
  sfx(boss?"boss":"coin");
  ask();
}
function ask(){
  const X=SUBJECTS[Q.s],it=Q.qs[Q.i],boss=Q.boss;
  const cheers=boss?["👾 魔王關！題目比較多，穩穩答！","魔王在看著你，別緊張～","你比魔王聰明多了！","快破關了，堅持住！","剩幾題了，衝啊！","魔王開始冒汗了！","魔王快撐不住了！","最後一擊！"]
                   :["加油！你一定可以！","仔細想一想喔～","慢慢來，不用急！","這題考驗你的觀察力！","最後衝刺！"];
  const enOnly=Q.s==="english"&&!it.lw?(it.q.match(/[A-Za-z][A-Za-z ,'?.!_]+/g)||[]).join(" ").replace(/_+/g,"blank"):"";
  const title=Q.practice?`自由練習・${Q.c?Q.c.name:"綜合"}`:boss?"👑 魔王城":`第 ${Q.ci+1} 關・${Q.c.name}`;
  app.innerHTML=`<div class="quiz ${boss?"boss":""}">
    <div class="qhead"><button class="back" onclick="${Q.practice?"openPractice()":`world(${Q.g},'${Q.s}')`}">⬅ 離開</button>
      <span>${X.emo} ${title}　${Q.practice?`答對 ${Q.pr}/${Q.pn}`:`${Q.i+1}/${Q.n}`}</span>
      ${Q.practice?"":`<span class="items"><span class="hearts" id="hearts">${"❤️".repeat(Q.hearts)}${"🤍".repeat(Math.max(0,3-Q.hearts))}</span>${Q.shield?`<span class="shield" id="shieldTag">🛡️</span>`:""}
        <button onclick="usePotion()" ${S.items.potion&&Q.hearts<5?"":"disabled"} title="愛心藥水">🧪${S.items.potion}</button><button onclick="useHint()" ${S.items.hint?"":"disabled"} id="hintBtn" title="提示卡">💡${S.items.hint}</button></span>`}</div>
    ${Q.practice?"":`<div class="prog" style="margin-bottom:14px"><i style="width:${Q.i/Q.n*100}%"></i></div>`}
    <div class="npc"><div class="face">${boss?"👾":X.npc}</div><div class="bubble"><b>${boss?"魔王":X.npcName}：</b>${cheers[Q.i%cheers.length]}</div></div>
    <div class="qcard">
      ${Q.combo>=2?`<div class="combo">🔥 COMBO x${Q.combo}</div>`:""}
      ${it.lw?`<button class="speak big" onclick="say('${it.lw}')">🔊 再聽一次</button>`:enOnly?`<button class="speak" onclick="say('${enOnly.replace(/'/g,"\\'")}')">🔊 聽發音</button>`:""}
      <div class="qtext ${it.q.length>40?"small":""}">${esc(it.q)}</div>
      <div class="opts">${it.opts.map((o,k)=>`<button class="opt" data-k="${k}"><span class="k">${k+1}</span>${esc(o)}</button>`).join("")}</div>
      <div class="explain" id="ex"></div>
    </div>
    <p class="hint">💡 電腦可按數字鍵 1–4 作答，Enter 下一題</p></div>`;
  app.querySelectorAll(".opt").forEach(b=>b.onclick=()=>pick(b));
  if(it.lw)setTimeout(()=>say(it.lw),300);
}
function usePotion(){if(!Q||!S.items.potion||Q.hearts>=5)return;S.items.potion--;Q.hearts++;save();sfx("coin");const h=$("hearts");if(h)h.textContent="❤️".repeat(Q.hearts)+"🤍".repeat(Math.max(0,3-Q.hearts));ask()}
function useHint(){if(!Q||!S.items.hint)return;const it=Q.qs[Q.i];const wrong=[...app.querySelectorAll(".opt")].filter(b=>!b.disabled&&it.opts[+b.dataset.k]!==it.ans&&!b.classList.contains("gone"));if(!wrong.length)return;S.items.hint--;save();const b=wrong[R(0,wrong.length-1)];b.classList.add("gone");b.disabled=true;$("hintBtn").textContent="💡"+S.items.hint;$("hintBtn").disabled=!S.items.hint;sfx("coin")}
function pick(btn){
  const it=Q.qs[Q.i],k=+btn.dataset.k,ok=it.opts[k]===it.ans;
  app.querySelectorAll(".opt").forEach(b=>{b.disabled=true;if(it.opts[+b.dataset.k]===it.ans)b.classList.add("right")});
  let extra="";
  const st=S.stats[pk(Q.g,Q.s)]=S.stats[pk(Q.g,Q.s)]||{p:0,r:0};
  if(Q.practice){Q.pn++;if(ok){Q.pr++;S.best.practice++}}else{st.p++;if(ok)st.r++}
  if(ok){
    Q.right++;Q.combo++;Q.maxCombo=Math.max(Q.maxCombo,Q.combo);
    if(Q.combo>=2&&!Q.practice){const b=Q.combo-1;Q.bonus+=b;extra=`<span class="bonus">+${b} 🪙 連擊！</span>`;sfx("combo")}else sfx("ok");
  }else{
    btn.classList.add("wrong");Q.combo=0;sfx("bad");
    Q.wrong.push({q:it.q,a:it.ans,s:Q.s,g:Q.g,tag:it.tag});
    if(!Q.practice){
      if(Q.shield){Q.shield=false;extra=`<span class="bonus" style="color:#2a9d8f">🛡️ 護盾擋下了！</span>`;const sh=$("shieldTag");if(sh)sh.remove()}
      else{Q.hearts--;const h=$("hearts");h.textContent="❤️".repeat(Q.hearts)+"🤍".repeat(Math.max(0,3-Q.hearts));h.classList.add("hit")}
    }
  }
  if(Q.s==="english"&&/^[A-Za-z]/.test(it.ans))say(it.ans);
  const last=!Q.practice&&(Q.hearts<=0||Q.i===Q.n-1);
  const ex=$("ex");ex.style.display="block";
  ex.innerHTML=`${extra}${ok?"✅ 答對了！":"❌ 正確答案是「"+esc(it.ans)+"」"} ${it.e?"<br>💡 "+esc(it.e):""}
    <div style="margin-top:10px;text-align:right"><button class="btn-pri" id="nx">${last?"看結果 🏁":"下一題 ➜"}</button></div>`;
  $("nx").onclick=()=>{if(last)finish();else{Q.i++;if(Q.practice&&Q.i>=Q.qs.length){Q.qs=Q.qs.concat(buildQs(Q.g,Q.s,Q.c,12,false))}ask()}};
  if(!ok&&!Q.practice&&Q.hearts<=0)toast("💔 愛心用完了…先看看結果吧");
  save();
}
function finish(){
  const pct=Q.right/Q.n,stars=Q.hearts<=0?0:pct===1?3:pct>=.8?2:pct>=.6?1:0;
  const p=prog(Q.g,Q.s);const old=Q.boss?p.boss:p.c[Q.ci];const gain=Math.max(0,stars-old);
  if(Q.boss)p.boss=Math.max(p.boss,stars);else p.c[Q.ci]=Math.max(p.c[Q.ci],stars);
  const wasFull=p.full;p.full=p.c.every(x=>x===3)&&p.boss===3;
  const bossBonus=Q.boss?Q.right*2+stars*3:0;
  const coins=Q.right*2+stars*3+Q.bonus+bossBonus;
  addCoins(coins);S.star+=gain;S.played++;S.right+=Q.right;S.best.combo=Math.max(S.best.combo,Q.maxCombo);
  if(stars>0)S.daily.n++;
  S.wrongs=[...Q.wrong,...S.wrongs].slice(0,60);
  touchStreak();logHistory();save();hud();
  const X=SUBJECTS[Q.s];
  const msg=stars===3?(Q.boss?"你打敗魔王了！太強了！":"太厲害了！全部答對！"):stars>=1?"做得很好！再挑戰拿滿星吧！":"沒關係，每次練習都在進步！";
  const ch=chapters(Q.g,Q.s);
  const nextCh=!Q.boss&&stars>0&&Q.ci<ch.length-1;
  const canBoss=!Q.boss&&stars>0&&bossUnlocked(Q.g,Q.s)&&!nextCh;
  const dailyDone=S.daily.n>=DAILY_GOAL&&!S.daily.claimed;
  app.innerHTML=`<div class="quiz center result card rise">
    <div class="big">${stars===3?(Q.boss?"🏰":"🏆"):stars?"🎉":"💪"}</div>
    <h2>${[0,1,2].map(i=>`<span class="star" style="animation-delay:${.2+i*.25}s">${i<stars?"⭐":"☆"}</span>`).join("")}</h2>
    <p style="font-size:18px">${X.npc} ${msg}</p>
    ${p.full&&!wasFull?`<p style="color:var(--gold);font-weight:900;font-size:18px">🏆 ${GRADES[Q.g-1].name}${X.name}全部滿星！科目大師！</p>`:""}
    <p>答對 <b>${Q.right}</b> / ${Q.n} 題${Q.maxCombo>=2?`　🔥 最高連擊 <b>${Q.maxCombo}</b>`:""}</p>
    <p class="coins">獲得 🪙 <b>${coins}</b> <span class="muted" style="font-size:13px;font-family:var(--font)">（答題 ${Q.right*2}${stars?` + 星星 ${stars*3}`:""}${Q.bonus?` + 連擊 ${Q.bonus}`:""}${bossBonus?` + 魔王加倍 ${bossBonus}`:""}）</span></p>
    ${gain?`<p style="color:#e9a400;font-weight:800">✨ 新獲得 ${gain} 顆星！</p>`:""}
    ${dailyDone?`<p><button class="btn-pri" onclick="claimDaily()">🎯 今日任務完成！領取 🪙 ${DAILY_REWARD}</button></p>`:S.daily.n<DAILY_GOAL?`<p class="muted" style="font-size:14px">🎯 今日任務 ${S.daily.n}/${DAILY_GOAL}</p>`:""}
    ${Q.wrong.length?`<div class="wrongs"><b>📒 錯題回顧</b>${Q.wrong.map(w=>`<div>${esc(w.q.replace(/\n/g," "))}<br>✅ ${esc(w.a)}</div>`).join("")}</div>`:""}
    <div class="row" style="justify-content:center;margin-top:16px">
      <button class="btn-ghost" onclick="play(${Q.g},'${Q.s}',${Q.boss?"'boss'":Q.ci})">🔁 再玩一次</button>
      ${nextCh?`<button class="btn-pri" onclick="play(${Q.g},'${Q.s}',${Q.ci+1})">下一關 ➜</button>`:""}
      ${canBoss?`<button class="btn-pri boss" onclick="play(${Q.g},'${Q.s}','boss')">⚔️ 挑戰魔王</button>`:""}
      <button class="btn-ghost" onclick="world(${Q.g},'${Q.s}')">🗺️ 回到地圖</button>
      <button class="btn-ghost" onclick="share(${Q.right},${Q.n},${stars})">📣 分享成績</button>
    </div></div>`;
  if(stars>=2){confetti(stars===3?130:60);sfx("win")}else if(stars===1)sfx("ok");
  checkAch();
}
function share(r,n,st){const t=`我在「知識島探險隊」${GRADES[Q.g-1].name}${SUBJECTS[Q.s].name}${Q.boss?"魔王城":"第"+(Q.ci+1)+"關"} 答對 ${r}/${n} 題，拿到 ${"⭐".repeat(st)||"☆"}！${location.href.split("#")[0]}`;try{navigator.clipboard.writeText(t).then(()=>toast("已複製成績，貼給爸媽看吧！"),()=>toast(t))}catch(e){toast(t)}}

/* ---------- 自由練習 ---------- */
let P={g:0,s:"",ci:-1};
function openPractice(g,s){
  Q=null;if(g)P.g=g;if(s)P.s=s;if(!P.g)P.g=S.lastGrade||1;if(!SUBJ_BY_GRADE(P.g).includes(P.s))P.s=SUBJ_BY_GRADE(P.g)[0];
  const ch=chapters(P.g,P.s);if(P.ci>=ch.length)P.ci=-1;
  app.innerHTML=`<button class="back" onclick="home()">⬅ 首頁</button><h1>🎯 自由練習</h1><p class="sub">沒有愛心限制、不計星星，想練多久就練多久。英語可以練「聽力」！</p>
  <div class="card"><p><b>年級</b></p><div class="chips">${GRADES.map(G=>`<button class="chip ${P.g===G.g?"on":""}" onclick="P.ci=-1;openPractice(${G.g})">${G.emo} ${G.name}</button>`).join("")}</div>
  <p><b>科目</b></p><div class="chips">${SUBJ_BY_GRADE(P.g).map(x=>`<button class="chip ${P.s===x?"on":""}" onclick="P.ci=-1;openPractice(${P.g},'${x}')">${SUBJECTS[x].emo} ${SUBJECTS[x].name}</button>`).join("")}</div>
  <p><b>單元</b></p><div class="chips"><button class="chip ${P.ci<0?"on":""}" onclick="P.ci=-1;openPractice()">全部混合</button>${ch.map((c,i)=>`<button class="chip ${P.ci===i?"on":""}" onclick="P.ci=${i};openPractice()">${c.listen?"🎧 ":""}${c.name}</button>`).join("")}</div>
  <p style="margin-top:18px"><button class="btn-pri" onclick="play(P.g,P.s,P.ci<0?'mix':P.ci,true)">▶ 開始練習</button>　<span class="muted" style="font-size:13px">練習答對累計：${S.best.practice} 題</span></p></div>`;
}

/* ---------- 鍵盤 ---------- */
document.addEventListener("keydown",e=>{
  if($("story").style.display==="flex"){$("story").click();return}
  if($("modalBg").style.display==="flex"){if(e.key==="Escape")closeModal();return}
  const nx=$("nx");if((e.key==="Enter"||e.key===" ")&&nx){e.preventDefault();nx.click();return}
  const opts=[...app.querySelectorAll(".opt")];const k=+e.key;
  if(opts.length&&k>=1&&k<=opts.length&&!opts[k-1].disabled)opts[k-1].click();
});

/* ---------- 彈窗 ---------- */
function modal(html){$("modal").innerHTML=html+`<div style="text-align:right;margin-top:16px"><button class="btn-ghost" onclick="closeModal()">關閉</button></div>`;$("modalBg").style.display="flex"}
function closeModal(){$("modalBg").style.display="none"}
function shopHead(tab){return `<h2>🎁 獎勵商店 <span class="muted" style="font-size:14px">金幣 🪙 <b>${S.coin}</b></span></h2>
  <div class="tabs">${[["card","🎴 抽卡"],["album","📚 卡冊"],["item","🧪 道具"],["avatar","🧑 角色"],["theme","🎨 主題"]].map(([k,n])=>`<button class="${tab===k?"on":""}" onclick="openShop('${k}')">${n}</button>`).join("")}</div>`}
function openShop(tab="card",drew){
  const h=shopHead(tab);
  if(tab==="card"){
    modal(`${h}<div class="drawbox">${drew?`<div class="got">${drew.e}</div><p><b>${drew.n}</b>　${["","普通","✨ 稀有","🌟 傳說"][drew.r]}${drew.isNew?"　🎉 新卡片！":"　（重複，退回 5 🪙）"}</p>`:`<div style="font-size:56px">🎴</div><p>每次 ${DRAW_COST} 🪙，有機會抽到稀有或傳說卡片！</p>`}
      <button class="btn-pri" onclick="draw()" ${S.coin<DRAW_COST?"disabled":""}>🎁 抽一張（${DRAW_COST} 🪙）</button></div>
      <p class="muted" style="font-size:13px">機率：普通 65%・稀有 27%・傳說 8%。收集進度 ${S.cards.length}/${CARDS.length}，重複卡片退回 5 金幣。</p>`);
  }else if(tab==="album"){
    modal(`${h}<p>收集：<b>${S.cards.length}</b>/${CARDS.length}${S.cards.length===CARDS.length?" 🏆 全部集滿！":""}</p>
      <div class="cards">${CARDS.map(c=>{const have=S.cards.includes(c.e);return `<div class="cd r${c.r} ${have?"have":""} ${drew&&drew.e===c.e?"new":""}"><span class="e">${c.e}</span>${have?c.n:"？？？"}<span class="r">${["","普通","稀有","傳說"][c.r]}</span></div>`}).join("")}</div>`);
  }else if(tab==="item"){
    modal(`${h}${ITEMS.map(it=>`<div class="item"><span class="e">${it.e}</span><div class="d"><b>${it.n}</b>　<span class="tag">擁有 ${S.items[it.k]}</span><small>${it.d}</small></div><button class="btn-pri btn-sm" onclick="buyItem('${it.k}')" ${S.coin<it.c?"disabled":""}>🪙 ${it.c}</button></div>`).join("")}
      <p class="muted" style="font-size:13px">道具在闖關畫面右上角使用。讀攻略本也能免費獲得一次護盾！</p>`);
  }else if(tab==="avatar"){
    modal(`${h}<p>用金幣解鎖新角色，當作你的頭像！</p><div class="cards">${AVATARS.map(a=>{const own=S.owned.includes(a.e),on=S.avatar===a.e;
      return `<div class="av ${on?"on":""}"><span class="e">${a.e}</span>${on?`<b style="font-size:12px;color:var(--pri-d)">使用中</b>`:own?`<button onclick="useAv('${a.e}')">使用</button>`:`<button onclick="buyAv('${a.e}')" ${S.coin<a.c?"disabled":""}>🪙 ${a.c}</button>`}</div>`}).join("")}</div>`);
  }else{
    modal(`${h}<p>換一個島嶼主題背景！</p><div class="themes">${THEMES.map(t=>{const own=S.themes.includes(t.k),on=S.theme===t.k;
      return `<div class="th ${on?"on":""}" onclick="${own?`useTheme('${t.k}')`:`buyTheme('${t.k}')`}"><div class="pv" style="background:${t.base};background-image:${t.bg}"></div>${t.n}<br><small class="muted">${on?"使用中":own?"點擊使用":`🪙 ${t.c}`}</small></div>`}).join("")}</div>`);
  }
}
function draw(){if(S.coin<DRAW_COST)return;S.coin-=DRAW_COST;const roll=Math.random();const r=roll<.08?3:roll<.35?2:1;const pool=CARDS.filter(c=>c.r===r);const c=pool[R(0,pool.length-1)];const isNew=!S.cards.includes(c.e);if(isNew)S.cards.push(c.e);else S.coin+=5;save();hud();sfx(isNew?(r===3?"win":"draw"):"coin");if(r===3&&isNew)confetti(80);checkAch();openShop("card",{...c,isNew})}
function buyItem(k){const it=ITEMS.find(x=>x.k===k);if(!it||S.coin<it.c)return;S.coin-=it.c;S.items[k]++;save();hud();sfx("coin");openShop("item")}
function useAv(e){S.avatar=e;save();hud();openShop("avatar")}
function buyAv(e){const a=AVATARS.find(x=>x.e===e);if(!a||S.coin<a.c||S.owned.includes(e))return;S.coin-=a.c;S.owned.push(e);S.avatar=e;save();hud();sfx("win");confetti(40);openShop("avatar")}
function useTheme(k){S.theme=k;save();hud();openShop("theme")}
function buyTheme(k){const t=THEMES.find(x=>x.k===k);if(!t||S.coin<t.c)return;S.coin-=t.c;S.themes.push(k);S.theme=k;save();hud();sfx("win");openShop("theme")}
function openWrongs(){
  if(!S.wrongs.length){modal(`<h2>📒 錯題本</h2><p>目前沒有錯題，太棒了！去闖關或練習吧。</p>`);return}
  modal(`<h2>📒 錯題本</h2><p class="muted" style="font-size:14px">最近答錯的題目，複習一下再去挑戰！</p>
   <div class="wrongs" style="max-width:none">${S.wrongs.map(w=>`<div><span class="tag">${GRADES[w.g-1].name} ${SUBJECTS[w.s].name}${w.tag?"・"+w.tag:""}</span> ${esc(w.q.replace(/\n/g," "))}<br>✅ ${esc(w.a)}</div>`).join("")}</div>
   <p style="margin-top:10px"><button class="btn-ghost" onclick="S.wrongs=[];save();closeModal();home()">🧹 清空錯題本</button></p>`);
}
function openAch(){modal(`<h2>🏅 成就 <span class="muted" style="font-size:14px">${S.ach.length}/${ACHIEVEMENTS.length}</span></h2><p class="muted" style="font-size:13px">每達成一個成就可得 10 金幣。</p>
  <div class="ach">${ACHIEVEMENTS.map(a=>`<div class="ac ${S.ach.includes(a.k)?"on":""}"><span class="e">${S.ach.includes(a.k)?a.e:"🔒"}</span><div><b>${a.n}</b><small>${a.d}</small></div></div>`).join("")}</div>`)}
function openProfile(){
  const acc=S.played?Math.round(S.right/Math.max(1,Object.values(S.stats).reduce((a,b)=>a+b.p,0))*100):0;
  modal(`<h2>${S.avatar} ${esc(S.name||"")} 的冒險檔案</h2>
  <div class="row" style="margin-bottom:10px"><input id="pfName" maxlength="10" value="${esc(S.name||"")}" style="border:2px solid var(--line);border-radius:10px;padding:8px 12px;font-size:15px;font-family:inherit"><button class="btn-ghost btn-sm" onclick="renameProfile()">✏️ 改名字</button><button class="btn-ghost btn-sm" onclick="openSwitch()">🔁 切換小朋友</button>${SYNC.enabled()?`<button class="btn-ghost btn-sm" onclick="openSync()">☁️ 家庭同步</button>`:""}</div>
  <div class="grid g2"><div class="card"><b style="font-size:26px">⭐ ${S.star}</b><br><small class="muted">收集星星</small></div><div class="card"><b style="font-size:26px">🪙 ${S.coin}</b><br><small class="muted">目前金幣</small></div>
  <div class="card"><b style="font-size:26px">🔥 ${S.streak}</b><br><small class="muted">連續天數</small></div><div class="card"><b style="font-size:26px">${acc}%</b><br><small class="muted">闖關正確率</small></div></div>
  <p>完成關卡 <b>${S.played}</b> 次・累積答對 <b>${S.right}</b> 題・卡片 <b>${S.cards.length}</b>/${CARDS.length}・成就 <b>${S.ach.length}</b>/${ACHIEVEMENTS.length}・最高連擊 <b>${S.best.combo}</b></p>
  <div class="row"><button class="btn-ghost" onclick="openShop('avatar')">🧑 更換角色</button><button class="btn-ghost" onclick="openAch()">🏅 成就</button><button class="btn-ghost" onclick="openParents()">👪 家長報表</button></div>`);
}
function openParents(focus){
  const rows=[];for(const G of GRADES)for(const s of SUBJ_BY_GRADE(G.g)){const st=S.stats[pk(G.g,s)];if(!st&&!focus)continue;if(focus&&pk(G.g,s)!==focus)continue;const got=subjStars(G.g,s),max=subjMax(G.g,s);rows.push(`<tr><td>${G.name}</td><td>${SUBJECTS[s].emo} ${SUBJECTS[s].name}</td><td>${st?st.p:0}</td><td>${st&&st.p?Math.round(st.r/st.p*100)+"%":"－"}</td><td>${got}/${max}</td></tr>`)}
  const cnt={};for(const w of S.wrongs){const k=`${SUBJECTS[w.s].name}・${w.tag||"綜合"}`;cnt[k]=(cnt[k]||0)+1}
  const weak=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const days=[6,5,4,3,2,1,0].map(o=>({d:today(o),n:S.history[today(o)]||0}));const mx=Math.max(1,...days.map(x=>x.n));
  modal(`<h2>👪 家長專區</h2>
  <p><b>最近 7 天完成關卡數</b></p><div class="bars">${days.map(x=>`<div style="height:${x.n/mx*100}%" title="${x.d}：${x.n} 關"><span>${x.d.slice(5)}</span></div>`).join("")}</div><br>
  <p><b>各科學習紀錄</b></p>${rows.length?`<table class="rep"><tr><th>年級</th><th>科目</th><th>答題數</th><th>正確率</th><th>星星</th></tr>${rows.join("")}</table>`:`<p class="muted">還沒有闖關紀錄。</p>`}
  <p style="margin-top:12px"><b>需要加強的單元</b>（依最近錯題統計）</p>${weak.length?`<div class="chips">${weak.map(([k,n])=>`<span class="chip">${k} ×${n}</span>`).join("")}</div>`:`<p class="muted">目前沒有錯題。</p>`}
  <details style="margin-top:14px"><summary style="cursor:pointer;font-weight:700">📘 網站設計說明</summary><ul style="font-size:14px;line-height:1.7">
   <li>結構：年級島 → 科目世界 → 單元關卡（每關 5 題）→ 魔王城（8 題混合）。前一關拿到星星才解鎖下一關，全部單元有星才能挑戰魔王。</li>
   <li>每關 3 顆愛心，答錯扣一顆；依答對率得 0–3 顆星。連續答對有連擊加分；魔王關金幣加倍。</li>
   <li>攻略本：每個單元有重點整理，第一次讀完可得一次護盾，鼓勵孩子先學再練。</li>
   <li>每日任務（一天通關 3 關）與連續天數，鼓勵每天 10–15 分鐘。</li>
   <li>自由練習：不限愛心、可指定單元；英語有「聽力」練習（瀏覽器語音朗讀）。</li>
   <li>金幣只能在站內抽卡、買道具、角色與主題，不涉及任何付費。數學題目依年級隨機產生。</li>
   <li>紀錄只存在這台裝置的瀏覽器，不會上傳。建議答錯時陪孩子看 💡 解說，並用「錯題本」複習。</li></ul></details>`);
}
function resetAll(){const p=curProfile();if(!p)return;modal(`<h2>🔄 重設 ${p.avatar} ${esc(p.name)} 的進度</h2><p>確定要清除這位小朋友的所有進度、金幣、卡片與成就嗎？（其他小朋友不受影響）</p>
  <div class="row"><button class="btn-pri" onclick="doReset()">確定清除進度</button><button class="btn-ghost" style="color:var(--bad)" onclick="deleteProfile('${p.id}')">🗑️ 刪除這位小朋友</button></div>`)}
function doReset(){const p=curProfile();S=FRESH();S.name=p.name;S.avatar=p.avatar;S.daily.d=today();save();closeModal();hud();home()}

/* ---------- 啟動 ---------- */
function route(){const m=location.hash.match(/^#g(\d)(?:-(\w+))?$/);if(m&&m[2]&&SUBJECTS[m[2]])world(+m[1],m[2]);else if(m)grade(+m[1]);else home()}
(async()=>{
  if(SYNC.enabled()&&SYNC.family()){app.innerHTML=`<p class="center" style="margin-top:60px;font-size:20px">☁️ 正在同步家庭資料…</p>`;await SYNC.syncDown()}
  if(PF.current&&loadProfile(PF.current)){hud();route()}else{PF.current="";hud();loginScreen()}
  updateSyncBadge();
})();
window.addEventListener("hashchange",()=>{if(Q||!PF.current)return;const m=location.hash.match(/^#g(\d)(?:-(\w+))?$/);if(m&&m[2]&&SUBJECTS[m[2]])world(+m[1],m[2]);else if(m)grade(+m[1]);else if(!location.hash)home()});
