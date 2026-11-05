/* ============================================================
   家庭同步：用「家庭代碼」把多台裝置的小朋友資料存到 Supabase
   資料表 profiles：id text PK, family text, name text, avatar text,
                    data jsonb, updated_at timestamptz
   ============================================================ */
const SYNC = {
  enabled: ()=>!!(SYNC_CONFIG.url&&SYNC_CONFIG.key),
  family: ()=>localStorage.getItem("kidsIsland_family")||"",
  setFamily(c){c=(c||"").trim().toUpperCase();if(c)localStorage.setItem("kidsIsland_family",c);else localStorage.removeItem("kidsIsland_family")},
  status:"off", lastErr:"", timer:null, busy:false,
  genCode(){const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";for(let i=0;i<8;i++)s+=a[Math.floor(Math.random()*a.length)];return s.slice(0,4)+"-"+s.slice(4)},
  headers(){const h={"apikey":SYNC_CONFIG.key,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal"};if(/^eyJ/.test(SYNC_CONFIG.key))h["Authorization"]="Bearer "+SYNC_CONFIG.key;return h},
  url(q){return `${SYNC_CONFIG.url.replace(/\/$/,"")}/rest/v1/${SYNC_CONFIG.table}${q||""}`},
  async pullAll(){
    if(!this.enabled()||!this.family())return null;
    const r=await fetch(this.url(`?family=eq.${encodeURIComponent(this.family())}&select=id,name,avatar,data,updated_at`),{headers:this.headers()});
    if(!r.ok)throw new Error("pull "+r.status);
    return r.json();
  },
  async push(profile,data){
    if(!this.enabled()||!this.family())return;
    const body=[{id:profile.id,family:this.family(),name:profile.name,avatar:profile.avatar,data,updated_at:new Date().toISOString()}];
    const r=await fetch(this.url(),{method:"POST",headers:this.headers(),body:JSON.stringify(body)});
    if(!r.ok)throw new Error("push "+r.status);
  },
  async remove(id){
    if(!this.enabled()||!this.family())return;
    await fetch(this.url(`?id=eq.${encodeURIComponent(id)}&family=eq.${encodeURIComponent(this.family())}`),{method:"DELETE",headers:this.headers()});
  },
  /* 把雲端資料合併進本機：雲端較新則覆蓋本機 */
  async syncDown(){
    if(!this.enabled()||!this.family())return false;
    this.status="syncing";
    try{
      const rows=await this.pullAll();
      for(const row of rows||[]){
        const local=PF.list.find(p=>p.id===row.id);
        const localData=lsGet(KEY+"_"+row.id);
        const localTime=localData&&localData._t?localData._t:0;
        const cloudTime=Date.parse(row.updated_at)||0;
        if(!local){PF.list.push({id:row.id,name:row.name,avatar:row.avatar,created:today()});lsSet(KEY+"_"+row.id,Object.assign({},row.data,{_t:cloudTime}))}
        else if(cloudTime>localTime){local.name=row.name;local.avatar=row.avatar;lsSet(KEY+"_"+row.id,Object.assign({},row.data,{_t:cloudTime}))}
      }
      lsSet(PKEY,PF);
      this.status="ok";this.lastErr="";return true;
    }catch(e){this.status="error";this.lastErr=String(e.message||e);return false}
  },
  /* 本機所有小朋友都上傳（用在剛加入家庭代碼時） */
  async syncUpAll(){
    if(!this.enabled()||!this.family())return;
    for(const p of PF.list){const d=lsGet(KEY+"_"+p.id);if(d)await this.push(p,d).catch(()=>{})}
  },
  /* 延遲上傳目前小朋友（save() 時呼叫） */
  schedule(){
    if(!this.enabled()||!this.family()||!curProfile())return;
    clearTimeout(this.timer);
    this.timer=setTimeout(async()=>{
      const p=curProfile();if(!p)return;
      try{await this.push(p,S);this.status="ok";this.lastErr=""}catch(e){this.status="error";this.lastErr=String(e.message||e)}
      updateSyncBadge();
    },1500);
  },
};
function updateSyncBadge(){const b=document.getElementById("syncBtn");if(!b)return;
  if(!SYNC.enabled()){b.style.display="none";return}
  b.style.display="";const f=SYNC.family();
  b.textContent=!f?"☁️ 未同步":SYNC.status==="error"?"☁️ ⚠️":SYNC.status==="syncing"?"☁️ …":"☁️ ✓";
  b.title=!f?"尚未加入家庭代碼":SYNC.status==="error"?"同步失敗："+SYNC.lastErr:"家庭代碼 "+f;
}
function openSync(){
  if(!SYNC.enabled()){modal(`<h2>☁️ 家庭同步</h2><p>這個網站還沒有設定雲端資料庫，目前只能在這台裝置儲存。</p>`);return}
  const f=SYNC.family();
  modal(`<h2>☁️ 家庭同步</h2>
  ${f?`<p>這台裝置已加入家庭代碼：</p><div class="codebox" id="codeBox">${f}</div>
    <p class="muted" style="font-size:13px">在其他手機、平板或電腦打開網站，輸入同一個代碼，就能看到同樣的小朋友和進度。代碼請只給家人。</p>
    <div class="row"><button class="btn-ghost btn-sm" onclick="copyCode('${f}')">📋 複製代碼</button><button class="btn-ghost btn-sm" onclick="resyncNow()">🔄 立即同步</button><button class="btn-ghost btn-sm" style="color:var(--bad)" onclick="leaveFamily()">離開家庭（只影響這台裝置）</button></div>
    <p class="muted" style="font-size:12px;margin-top:10px">狀態：${SYNC.status==="error"?"⚠️ 同步失敗："+esc(SYNC.lastErr):"✓ 正常"}</p>`
  :`<p>建立一個<b>家庭代碼</b>，或輸入其他裝置上已經建立的代碼，所有小朋友的進度就會在裝置之間同步。</p>
    <div class="row"><button class="btn-pri" onclick="createFamily()">✨ 建立新的家庭代碼</button></div>
    <p style="margin-top:14px"><b>已經有代碼？</b></p>
    <div class="row"><input id="famIn" placeholder="例如 AB3K-7PQX" maxlength="9" style="border:2px solid var(--line);border-radius:10px;padding:8px 12px;font-size:16px;font-family:var(--num);text-transform:uppercase;letter-spacing:1px"><button class="btn-ghost" onclick="joinFamily($('famIn').value)">加入</button></div>
    <p class="muted" style="font-size:12px;margin-top:10px">加入後，這台裝置現有的小朋友也會一起上傳到雲端。</p>`}`);
}
function copyCode(c){try{navigator.clipboard.writeText(c).then(()=>toast("已複製家庭代碼"),()=>toast(c))}catch(e){toast(c)}}
async function createFamily(){const c=SYNC.genCode();SYNC.setFamily(c);toast("正在上傳…");await SYNC.syncUpAll();SYNC.status="ok";updateSyncBadge();openSync();confetti(40)}
async function joinFamily(v){v=(v||"").trim().toUpperCase().replace(/[^A-Z0-9-]/g,"");if(v.length<8){toast("代碼格式不對");return}
  SYNC.setFamily(v);toast("正在同步…");await SYNC.syncUpAll();const ok=await SYNC.syncDown();updateSyncBadge();
  if(!ok){toast("同步失敗："+SYNC.lastErr);SYNC.setFamily("");openSync();return}
  toast("已加入家庭 "+v);closeModal();if(PF.current)loadProfile(PF.current);hud();loginScreen()}
async function resyncNow(){toast("同步中…");if(curProfile()){try{await SYNC.push(curProfile(),S)}catch(e){}}const ok=await SYNC.syncDown();if(ok&&PF.current){loadProfile(PF.current);hud()}updateSyncBadge();toast(ok?"同步完成":"同步失敗："+SYNC.lastErr);openSync()}
function leaveFamily(){SYNC.setFamily("");SYNC.status="off";updateSyncBadge();closeModal();toast("已離開家庭同步（本機資料保留）")}
