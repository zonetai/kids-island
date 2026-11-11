/* ============================================================
   教材設定：學校版本、學期、題型
   CUR["4-math-上"] = [{id, n, note, qs:[[題目,[選項],解說,題型,英文朗讀?]] 或 gen(hard)}]
   單元名稱依學校課程計畫；題目全部自編。
   ============================================================ */
const CUR={};
function CUR_ADD(key,units){CUR[key]=(CUR[key]||[]).concat(units)}
const CUR_ALT={}; // CUR_ALT["4-math-上"]["康軒"] = [{n, use:[單元id...]}]
function CUR_ALT_ADD(key,ver,units){(CUR_ALT[key]=CUR_ALT[key]||{})[ver]=units}

/* 敦化國小 115 學年度教科書版本（學校課程計畫「教科書版本一覽表」） */
const SCHOOLS={
  "敦化國小":{
    1:{chinese:"康軒",math:"翰林",life:"南一",english:"康軒"},
    2:{chinese:"康軒",math:"康軒",life:"翰林",english:"翰林"},
    3:{chinese:"康軒",math:"南一",social:"康軒",science:"康軒",english:"翰林"},
    4:{chinese:"康軒",math:"南一",social:"康軒",science:"康軒",english:"翰林"},
    5:{chinese:"南一",math:"康軒",social:"翰林",science:"康軒",english:"翰林"},
    6:{chinese:"康軒",math:"康軒",social:"康軒",science:"翰林",english:"敦煌"},
  }
};
const VER_NAME={english:{"翰林":"翰林 Here We Go","康軒":"康軒","敦煌":"敦煌 Explore Our World","何嘉仁":"何嘉仁"}};
const VERSIONS={chinese:["康軒","南一","翰林"],math:["康軒","南一","翰林"],social:["康軒","南一","翰林"],science:["康軒","南一","翰林"],life:["康軒","南一","翰林"],english:["翰林","康軒","何嘉仁","敦煌"]};
const QTYPES=[["觀念","💡 觀念"],["計算","🔢 計算"],["應用","🧩 應用題"],["字詞","✍️ 字詞"],["句型","🔗 句型"],["修辭","🎨 修辭"],["閱讀","📖 閱讀"],["單字","🔤 單字"],["文法","✏️ 文法"],["聽力","🎧 聽力"],["對話","💬 對話"]];
const verLabel=(s,v)=>(VER_NAME[s]&&VER_NAME[s][v])||v;
const autoSem=()=>{const m=new Date().getMonth()+1;return m>=8||m===1?"上":"下"};

/* 英語特訓營（聽力＋文法） */
SUBJECTS.engx={emo:"🎧",name:"英語特訓營",world:"聽說特訓營",npc:"🦉",npcName:"貓頭鷹教練 Hoot",color:"#5b5bd6",bg:"linear-gradient(160deg,#eef0ff,#d9dcff)",
  story:["Hi! 我是貓頭鷹教練 Hoot，專門幫大家練英文耳朵和文法。","這裡每一站都是一種聽力或文法，順序不限，哪裡弱就練哪裡。","按「🎯 弱點加強」，我會自動挑你最常錯的地方出題。Let's go!"]};
