/* ============================================================
   英語特訓營：聽力 + 文法（題目全部自編或由程式組合產生）
   每個產生器回傳 [題目, [正解, 誤1, 誤2, 誤3], 解說, 標籤, 要念的英文, 完整句]
   ============================================================ */
const EN_pick=a=>a[Math.floor(Math.random()*a.length)];
const EN_shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function EN_o4(ans,cands,fill){ans=String(ans);const s=[];for(const c of EN_shuf(cands||[])){const v=String(c);if(v&&v!==ans&&!s.includes(v))s.push(v)}
  for(const f of EN_shuf(fill||["none","nothing","not"])){if(s.length>=3)break;if(f!==ans&&!s.includes(f))s.push(f)}return [ans,...s.slice(0,3)]}
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const subQ=p=>/^(You|He|She|We|They)$/.test(p.s)?p.s.toLowerCase():p.s.replace(/^My /,"your ").replace(/^The /,"the ");

/* ---------- 共用字庫 ---------- */
const EN_P=[
  {s:"I",be:"am",was:"was",pos:"my",obj:"me",mine:"mine",zh:"我",t3:false},
  {s:"You",be:"are",was:"were",pos:"your",obj:"you",mine:"yours",zh:"你",t3:false},
  {s:"He",be:"is",was:"was",pos:"his",obj:"him",mine:"his",zh:"他",t3:true},
  {s:"She",be:"is",was:"was",pos:"her",obj:"her",mine:"hers",zh:"她",t3:true},
  {s:"We",be:"are",was:"were",pos:"our",obj:"us",mine:"ours",zh:"我們",t3:false},
  {s:"They",be:"are",was:"were",pos:"their",obj:"them",mine:"theirs",zh:"他們",t3:false},
  {s:"Tom",be:"is",was:"was",zh:"Tom",t3:true},
  {s:"My sister",be:"is",was:"was",zh:"我姊姊",t3:true},
  {s:"Amy and I",be:"are",was:"were",zh:"Amy 和我",t3:false},
  {s:"The students",be:"are",was:"were",zh:"學生們",t3:false},
];
const EN_V=[
  ["play","plays","playing","played","basketball","打籃球"],["eat","eats","eating","ate","breakfast","吃早餐"],
  ["go","goes","going","went","to school","去上學"],["swim","swims","swimming","swam","in the pool","在泳池游泳"],
  ["watch","watches","watching","watched","TV","看電視"],["study","studies","studying","studied","English","讀英文"],
  ["write","writes","writing","wrote","a letter","寫信"],["drink","drinks","drinking","drank","milk","喝牛奶"],
  ["ride","rides","riding","rode","a bike","騎腳踏車"],["sing","sings","singing","sang","a song","唱歌"],
  ["make","makes","making","made","a cake","做蛋糕"],["have","has","having","had","lunch","吃午餐"],
  ["fly","flies","flying","flew","a kite","放風箏"],["do","does","doing","did","homework","寫功課"],
  ["cook","cooks","cooking","cooked","dinner","煮晚餐"],["wash","washes","washing","washed","the dishes","洗碗"],
  ["draw","draws","drawing","drew","a picture","畫圖"],["buy","buys","buying","bought","some fruit","買水果"],
  ["run","runs","running","ran","in the park","在公園跑步"],["clean","cleans","cleaning","cleaned","the room","打掃房間"],
  ["take","takes","taking","took","a bus","搭公車"],["visit","visits","visiting","visited","Grandma","拜訪奶奶"],
  ["practice","practices","practicing","practiced","the piano","練鋼琴"],["see","sees","seeing","saw","a movie","看電影"],
];
const EN_TIME={
  pres:[["every day","每天"],["every morning","每天早上"],["after school","放學後"],["on Sundays","每個星期日"]],
  prog:[["now","現在"],["right now","此刻"]],
  past:[["yesterday","昨天"],["last night","昨晚"],["last Sunday","上個星期日"],["two days ago","兩天前"]],
  fut:[["tomorrow","明天"],["next Sunday","下個星期日"],["next week","下星期"]],
};
const vf=(p,v,t)=>t==="pres"?(p.t3?v[1]:v[0]):t==="prog"?`${p.be} ${v[2]}`:t==="past"?v[3]:`will ${v[0]}`;
const sent=(p,form,v,tm)=>`${p.s} ${form} ${v[4]} ${tm}.`;

/* ---------- 單字（聽單字、拼字） ---------- */
const EN_W={
  1:"cat dog pig bird fish duck cow egg apple banana milk book pen bag desk chair red blue green yellow pink black white mom dad sun hat cake ball doll kite bus car door bed cup".split(" "),
  3:"teacher student classroom library kitchen bedroom bathroom hamburger sandwich noodles juice water rainy sunny cloudy windy Monday Tuesday Wednesday Thursday Friday Saturday Sunday basketball baseball soccer piano guitar elephant tiger monkey rabbit lion zebra eraser ruler pencil marker sweater jacket shorts socks shoes hungry thirsty tired happy angry orange grape lemon pizza".split(" "),
  4:"January February March April June July August September October November December weekend morning afternoon evening bicycle taxi train scooter subway breakfast lunch dinner shirt skirt dress summer winter spring autumn season yesterday".split(" "),
  5:"birthday museum hospital supermarket bookstore restaurant station vegetable dessert delicious expensive beautiful interesting dangerous favorite vacation homework weather umbrella dictionary science history music subject sweet sour salty spicy celebrate festival".split(" "),
  6:"exercise healthy medicine headache fever stomachache family grandparents cousin neighbor fresh market farmer chicken carrot potato tomato strawberry watermelon ancient computer telephone television different fireworks".split(" "),
};
const wordsFor=g=>{let w=[...EN_W[1]];for(const k of [3,4,5,6])if(k<=g)w=w.concat(EN_W[k]);return [...new Set(w)]};

/* ---------- 聽力：句子 [英文, 中文, 年級] ---------- */
const EN_SENT=[
 ["Good morning.","早安。",1],["How are you?","你好嗎？",1],["What's your name?","你叫什麼名字？",1],["How old are you?","你幾歲？",1],
 ["Stand up, please.","請起立。",1],["Sit down, please.","請坐下。",1],["Open your book.","打開你的書。",1],["Close the door.","關上門。",1],
 ["I like apples.","我喜歡蘋果。",1],["This is my pen.","這是我的筆。",1],["I have a red bag.","我有一個紅色的包包。",1],["See you tomorrow.","明天見。",1],
 ["Line up, please.","請排隊。",2],["Be quiet, please.","請安靜。",2],["I'm eight years old.","我八歲。",2],["It's a big elephant.","那是一隻大象。",2],
 ["What day is it today?","今天星期幾？",3],["What time is it?","現在幾點？",3],["It's time for lunch.","吃午餐的時間到了。",3],["How's the weather?","天氣如何？",3],
 ["It's rainy and cold.","下雨又很冷。",3],["Where is my eraser?","我的橡皮擦在哪裡？",3],["It's under the desk.","它在書桌下面。",3],["Can you swim?","你會游泳嗎？",3],
 ["What are you doing?","你正在做什麼？",3],["I'm reading a book.","我正在看書。",3],["She is playing the piano.","她正在彈鋼琴。",3],["Are you thirsty?","你口渴嗎？",3],
 ["Do you want some pizza?","你想要一些披薩嗎？",3],["I want a hamburger.","我想要一個漢堡。",3],["Where's my hat?","我的帽子在哪裡？",3],["Wash your hands.","去洗手。",3],
 ["Where are you from?","你來自哪裡？",4],["I'm from Taiwan.","我來自台灣。",4],["How do you go to school?","你怎麼去上學？",4],["I go to school on foot.","我走路上學。",4],
 ["He goes to school by bus.","他搭公車上學。",4],["What do you do on weekends?","你週末都做什麼？",4],["She plays badminton on Saturdays.","她每週六打羽毛球。",4],
 ["What time do you get up?","你幾點起床？",4],["I get up at six thirty.","我六點半起床。",4],["Where were you yesterday?","你昨天在哪裡？",4],["I was at the library.","我在圖書館。",4],
 ["What did you do last night?","你昨晚做了什麼？",4],["I watched a movie.","我看了一部電影。",4],["How much is the T-shirt?","這件T恤多少錢？",4],["How many apples do you want?","你要幾顆蘋果？",4],
 ["What's your favorite season?","你最喜歡哪個季節？",4],["I like winter. It's cool.","我喜歡冬天，很涼爽。",4],["Would you like some tea?","你想要喝點茶嗎？",4],["Whose cap is that?","那是誰的帽子？",4],
 ["Where did you go last weekend?","你上週末去了哪裡？",5],["I went to the beach with my family.","我和家人去了海邊。",5],["I'd like a piece of cake.","我想要一塊蛋糕。",5],
 ["When is your birthday?","你的生日是什麼時候？",5],["It's on April tenth.","在四月十日。",5],["The tea shop is across from the bank.","飲料店在銀行對面。",5],
 ["How does the mochi taste?","麻糬吃起來如何？",5],["It tastes sweet.","它吃起來甜甜的。",5],["We will visit Yilan next week.","我們下星期會去宜蘭。",5],
 ["What are you going to do this weekend?","你這個週末要做什麼？",5],["I have a headache.","我頭痛。",6],["You should drink more water.","你應該多喝水。",6],
 ["I exercise three times a week.","我一週運動三次。",6],["My brother is taller than me.","我哥哥比我高。",6],["People didn't have phones long ago.","很久以前人們沒有手機。",6],
 ["We celebrate the New Year with fireworks.","我們用煙火慶祝新年。",6],["Fresh fruit is good for you.","新鮮水果對你有益。",6],["My grandparents live in Tainan.","我的祖父母住在台南。",6],
 ["What did you do on the weekend?","你週末做了什麼？",6],["Get well soon!","祝你早日康復！",6],["Soccer is my favorite sport.","足球是我最喜歡的運動。",6],
];
/* ---------- 聽力：問句與回答 [問, 答, 類型, 年級] ---------- */
const EN_QA=[
 ["How are you?","I'm fine, thank you.","how",1],["What's your name?","My name is Ben.","name",1],["How old are you?","I'm ten years old.","age",1],
 ["What color is it?","It's green.","color",1],["What's this?","It's a ruler.","what",1],["Thank you very much.","You're welcome.","thanks",2],["I'm sorry.","That's OK.","sorry",2],
 ["Do you like bananas?","Yes, I do.","do",2],["Is this your book?","No, it isn't.","be",2],["What time is it?","It's eight o'clock.","time",3],
 ["What day is it today?","It's Friday.","day",3],["How's the weather today?","It's sunny.","weather",3],["Where is the cat?","It's on the sofa.","where",3],
 ["Can you ride a bike?","Yes, I can.","can",3],["What are you doing?","I'm doing my homework.","doing",3],["Are you thirsty?","Yes. I want some water.","feel",3],
 ["Where are you from?","I'm from Japan.","from",4],["How do you go to school?","By MRT.","howgo",4],["What do you do on weekends?","I go swimming.","weekend",4],
 ["Whose cap is this?","It's Amy's.","whose",4],["How many books do you have?","I have five.","howmany",4],["Where were you yesterday?","I was at home.","wherepast",4],
 ["What did you do last night?","I played video games.","past",4],["How much is this pen?","It's thirty dollars.","price",4],["Would you like some juice?","Yes, please.","would",4],
 ["What's your favorite season?","I like spring.","season",4],["Where did you go last Sunday?","I went to the zoo.","wherewent",5],["When is your birthday?","It's on May fifth.","when",5],
 ["What would you like to drink?","I'd like a glass of milk.","drink",5],["How does it taste?","It's sour.","taste",5],["What will you do tomorrow?","I will clean my room.","will",5],
 ["What's wrong?","I have a cold.","wrong",6],["How often do you exercise?","Twice a week.","often",6],["Why are you late?","Because I missed the bus.","why",6],
 ["Who is taller, you or Tom?","Tom is taller.","compare",6],["Did you have fun at the party?","Yes, I did.","did",5],["What's your favorite food?","Fried rice.","fav",4],
];
/* ---------- 聽力：短對話 [台詞, 問題, 正解, 誤選, 年級] ---------- */
const EN_DLG=[
 [["What are you doing, Sam?","I'm making a card for my mom."],"Sam 正在做什麼？","做卡片",["做蛋糕","寫功課","畫圖"],3],
 [["What's the weather like today?","It's rainy. Don't forget your umbrella."],"今天天氣如何？","下雨",["晴天","下雪","颳大風"],3],
 [["Where's my hat?","It's behind the door."],"帽子在哪裡？","門後面",["門前面","桌子下面","床上"],3],
 [["Are you hungry?","No, I'm not. But I'm thirsty."],"他覺得怎麼樣？","口渴",["肚子餓","很累","很冷"],3],
 [["Where are you from, Ken?","I'm from Korea. My friend Mia is from Canada."],"Mia 來自哪裡？","加拿大",["韓國","日本","美國"],4],
 [["How does your brother go to school?","He goes to school by bike."],"哥哥怎麼上學？","騎腳踏車",["走路","搭公車","搭捷運"],4],
 [["What time do you get up?","I get up at six thirty."],"他幾點起床？","6:30",["6:13","7:30","6:00"],4],
 [["Is this your pencil case?","No, it's not mine. It's Lucy's."],"鉛筆盒是誰的？","Lucy 的",["說話的人的","老師的","不知道"],4],
 [["Where were you last night?","I was at my grandma's house."],"他昨晚在哪裡？","奶奶家",["圖書館","學校","公園"],4],
 [["What did you do yesterday, Ben?","I played baseball with my dad."],"Ben 昨天和誰打棒球？","爸爸",["媽媽","哥哥","老師"],4],
 [["How much are the socks?","They're eighty dollars."],"襪子多少錢？","80 元",["18 元","88 元","800 元"],4],
 [["How many students are there in your class?","There are twenty-eight students."],"班上有幾位學生？","28 位",["20 位","82 位","18 位"],4],
 [["What's your favorite season?","Summer. I can go swimming."],"他最喜歡哪個季節？","夏天",["春天","秋天","冬天"],4],
 [["Can I help you?","Yes. How much is this cap?","It's one hundred and fifty dollars."],"帽子多少錢？","150 元",["115 元","50 元","105 元"],5],
 [["Where did you go last weekend?","I went to the night market and ate stinky tofu."],"他在夜市吃了什麼？","臭豆腐",["牛肉麵","珍珠奶茶","雞排"],5],
 [["What would you like to drink?","I'd like two glasses of orange juice, please."],"他點了什麼？","兩杯柳橙汁",["一杯柳橙汁","兩杯牛奶","兩瓶水"],5],
 [["When is your birthday?","It's on July fourth. I'm going to have a party."],"生日是幾月幾日？","7 月 4 日",["6 月 4 日","7 月 14 日","4 月 7 日"],5],
 [["Excuse me, where is the tea shop?","Go straight. It's between the bank and the bookstore."],"飲料店在哪裡？","銀行和書店中間",["銀行對面","書店後面","學校裡面"],5],
 [["How does the lemon cake taste?","It's a little sour, but I like it."],"檸檬蛋糕吃起來如何？","有點酸",["很甜","很鹹","很辣"],5],
 [["What will we do in Yilan?","We will ride bikes and eat ice cream."],"他們在宜蘭會做什麼？","騎腳踏車",["游泳","爬山","看電影"],5],
 [["You look tired. What's wrong?","I have a stomachache. I ate too much ice cream."],"他哪裡不舒服？","肚子痛",["頭痛","牙痛","發燒"],6],
 [["Who is taller, Mike or Peter?","Peter is taller than Mike, but Mike runs faster."],"誰跑得比較快？","Mike",["Peter","兩個一樣","沒有說"],6],
 [["How often do you play basketball?","I play three times a week."],"他一週打幾次籃球？","三次",["兩次","一次","每天"],6],
 [["How do you go to school?","I usually walk, but today I took a taxi because it was raining."],"他今天怎麼去上學？","搭計程車",["走路","騎腳踏車","搭公車"],6],
 [["What did people use long ago?","They used candles. Today we use lamps."],"很久以前人們用什麼照明？","蠟燭",["電燈","手電筒","太陽能燈"],6],
 [["What do you need for the soup?","Some carrots, two potatoes, and a little salt."],"煮湯需要幾顆馬鈴薯？","兩顆",["一顆","三顆","不需要"],6],
 [["How do you celebrate the Lunar New Year?","We eat dinner together and get red envelopes."],"他們過年會拿到什麼？","紅包",["月餅","粽子","禮物卡"],6],
 [["Are you OK? You look pale.","I have a fever. I need to see a doctor."],"他需要做什麼？","去看醫生",["去上學","去運動","去睡覺"],6],
];
/* ---------- 聽音辨字 ---------- */
const EN_PAIR=[["ship","sheep"],["bed","bad"],["pen","pan"],["cat","cut"],["hat","hot"],["fan","van"],["light","right"],["three","tree"],["thirteen","thirty"],
 ["fourteen","forty"],["fifteen","fifty"],["sixteen","sixty"],["eighteen","eighty"],["walk","work"],["sit","seat"],["live","leave"],["bag","back"],["mouse","mouth"],
 ["glass","grass"],["cap","cup"],["coat","goat"],["pig","big"],["vest","best"],["long","wrong"],["think","sink"],["full","fool"],["fly","fry"],["hill","heel"]];

/* ---------- 聽力產生器 ---------- */
const nearG=(pool,g,gi)=>{const p=pool.filter(x=>x[gi]<=g),q=p.filter(x=>x[gi]>=g-2);return [p,q.length?q:p]};
function L_word(g){const w=wordsFor(g),a=EN_pick(w);const near=w.filter(x=>x!==a&&x[0]===a[0]);return ["🔊 仔細聽，你聽到哪一個字？",EN_o4(a,EN_shuf(near).slice(0,2).concat(EN_shuf(w).slice(0,5))),`聽到的是「${a}」`,"L-word",a]}
function L_sent(g){const [pool,near]=nearG(EN_SENT,g,2),it=EN_pick(near);
  return ["🔊 聽句子，選出正確的意思",EN_o4(it[1],pool.map(x=>x[1])),`${it[0]} ＝ ${it[1]}`,"L-sent",it[0]]}
function L_resp(g){const [pool,near]=nearG(EN_QA,g,3),it=EN_pick(near);
  return ["🔊 聽問句，選出最適合的回答",EN_o4(it[1],pool.filter(x=>x[2]!==it[2]).map(x=>x[1])),`問：${it[0]}　答：${it[1]}`,"L-resp",it[0]]}
const TEENTY={13:30,14:40,15:50,16:60,17:70,18:80,19:90,30:13,40:14,50:15,60:16,70:17,80:18,90:19};
const pad2=n=>n<10?"0"+n:""+n;
function L_num(g){const k=Math.random();
  if(k<.34){const x=+EN_pick(Object.keys(TEENTY)),h=g>=4?EN_pick([0,0,100,200]):0,v=h+x,p=h+TEENTY[x];
    return ["🔊 聽價錢，多少錢？",EN_o4("$"+v,["$"+p,"$"+(v+1),"$"+(h+100+x),"$"+(p+1)]),`It's ${v} dollars. 注意 -teen（重音在後）和 -ty（重音在前）`,"L-num",`It's ${v} dollars.`]}
  if(k<.7){const h=Math.floor(Math.random()*12)+1,m=EN_pick([5,10,15,20,30,40,45,50]),t=`${h}:${pad2(m)}`;
    const swap=TEENTY[m]?`${h}:${pad2(TEENTY[m])}`:`${h}:${pad2(m+10)}`,spoken=`It's ${h}:${pad2(m)}.`;
    return ["🔊 聽時間，現在幾點？",EN_o4(t,[swap,`${h%12+1}:${pad2(m)}`,`${h===1?12:h-1}:${pad2(m)}`,`${h}:${pad2(60-m)}`]),spoken,"L-num",spoken]}
  const n=Math.floor(Math.random()*(g>=5?90:40))+10;
  return ["🔊 聽數字，選出聽到的數",EN_o4(String(n),[String(TEENTY[n]||n+10),String(n+1),String((n%10)*10+Math.floor(n/10)),String(n-1)]),`聽到 ${n}`,"L-num",String(n)]}
function L_pair(g){const p=EN_pick(EN_PAIR),a=EN_pick(p),o=p[0]===a?p[1]:p[0];const others=EN_shuf(EN_PAIR.filter(x=>x!==p)).slice(0,3).map(x=>EN_pick(x));
  return ["🔊 聽仔細！這兩個字很像，你聽到哪一個？",[a,o,...others.slice(0,2)],`聽到「${a}」，容易和「${o}」搞混`,"L-pair",a]}
function misspell(w){const v="aeiou",out=new Set();let guard=0;while(out.size<5&&guard++<80){const i=1+Math.floor(Math.random()*Math.max(1,w.length-2)),k=Math.random();let m;
  if(k<.3)m=w.slice(0,i)+w.slice(i+1);else if(k<.55)m=w.slice(0,i)+w[i]+w.slice(i);else if(k<.8&&i<w.length-1)m=w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2);
  else{const idx=[...w].map((c,x)=>x>0&&v.includes(c)?x:-1).filter(x=>x>0);if(!idx.length)continue;const j=EN_pick(idx);m=w.slice(0,j)+EN_pick([...v].filter(c=>c!==w[j]))+w.slice(j+1)}
  if(m&&m!==w)out.add(m)}return [...out]}
function L_spell(g){const w=wordsFor(g).filter(x=>x.length>=4),a=EN_pick(w);return ["🔊 聽單字，哪一個拼字是正確的？",EN_o4(a,misspell(a),[a+"e",a.slice(0,-1)]),`正確拼法：${a}`,"L-spell",a]}
function L_dlg(g){const [,near]=nearG(EN_DLG,g,4),it=EN_pick(near);
  return [`🎧 聽對話回答：${it[1]}`,[it[2],...it[3]],it[0].join(" / "),"L-dlg",it[0].join(" | ")]}
function L_cloze(g){const p=EN_pick(EN_P),v=EN_pick(EN_V),ts=g>=5?["pres","prog","past","fut"]:["pres","prog","past"],t=EN_pick(ts),tm=EN_pick(EN_TIME[t]);
  const ans=vf(p,v,t),full=sent(p,ans,v,tm[0]);
  return [`🔊 聽句子，空格裡是什麼？\n${p.s} ___ ${v[4]} ${tm[0]}.`,EN_o4(ans,ts.filter(x=>x!==t).map(x=>vf(p,v,x)).concat([v[0],v[1],v[2]])),`${full}（${tm[1]}）`,"L-cloze",full,full]}

/* ---------- 文法產生器 ---------- */
const ADJ=[["happy","很開心"],["hungry","肚子餓"],["tired","很累"],["sad","很難過"],["busy","很忙"],["thirsty","口渴"],["sleepy","想睡"],["cold","很冷"],["at home","在家"],["in the classroom","在教室"]];
function G_be(g){const p=EN_pick(EN_P),a=EN_pick(ADJ);
  if(g>=3&&Math.random()<.35){const q=cap(p.be),sub=subQ(p);
    return [`___ ${sub} ${a[0]}?`,EN_o4(q,["Am","Is","Are","Do"]),`主詞是 ${sub}，問句用 ${q}`,"G-be","",`${q} ${sub} ${a[0]}?`]}
  return [`${p.s} ___ ${a[0]}.（${p.zh}${a[1]}）`,EN_o4(p.be,["am","is","are","be"]),`I 用 am；he/she/it 和單數名詞用 is；you/we/they 和複數用 are。${p.s} → ${p.be}`,"G-be","",`${p.s} ${p.be} ${a[0]}.`]}
const PL=[["box","boxes"],["bus","buses"],["watch","watches"],["dish","dishes"],["baby","babies"],["city","cities"],["leaf","leaves"],["knife","knives"],["child","children"],["man","men"],["woman","women"],["foot","feet"],["tooth","teeth"],["mouse","mice"],["tomato","tomatoes"],["potato","potatoes"],["toy","toys"],["boy","boys"],["fish","fish"],["sheep","sheep"],["dress","dresses"],["peach","peaches"],["family","families"],["strawberry","strawberries"],["book","books"],["key","keys"]];
function G_plural(g){const [s,p]=EN_pick(PL);return [`one ${s} → three ___`,EN_o4(p,[s+"s",s+"es",s.replace(/y$/,"ies"),s.replace(/fe?$/,"ves"),s],[s+"ies",s+"en"]),`${s} 的複數是 ${p}`,"G-plural","",`three ${p}`]}
const NOUN_SP=[["cat","cats"],["book","books"],["pencil","pencils"],["shoe","shoes"],["cookie","cookies"],["ball","balls"]];
function G_this(g){const n=EN_pick(NOUN_SP),near=Math.random()<.5,pl=Math.random()<.5,ans=near?(pl?"These":"This"):(pl?"Those":"That");
  return [`（${near?"👉 近的":"👉 遠的"}，${pl?"好幾個":"一個"}）___ ${pl?"are":"is"} my ${pl?n[1]:n[0]}.`,EN_o4(ans,["This","That","These","Those"]),"近的單數 this、複數 these；遠的單數 that、複數 those","G-this","",`${ans} ${pl?"are":"is"} my ${pl?n[1]:n[0]}.`]}
const AN=[["apple",1],["egg",1],["orange",1],["umbrella",1],["elephant",1],["eraser",1],["ice cream",1],["owl",1],["book",0],["banana",0],["pen",0],["dog",0],["uniform",0],["cake",0],["hour",1],["ruler",0]];
function G_aan(g){const [n,v]=EN_pick(g<5?AN.filter(x=>x[0]!=="hour"&&x[0]!=="uniform"):AN);const ans=v?"an":"a";
  return [`I have ___ ${n}.`,EN_o4(ans,["a","an","two","many"]),n==="hour"?"hour 的 h 不發音，開頭是母音，用 an":n==="uniform"?"uniform 開頭念 /ju/，是子音，用 a":"母音開頭（a e i o u 的音）用 an，其他用 a","G-aan","",`I have ${ans} ${n}.`]}
const PREP=[["in","裡面"],["on","上面"],["under","下面"],["behind","後面"],["next to","旁邊"],["in front of","前面"]];
const PLACE=[["box","盒子"],["desk","書桌"],["bed","床"],["chair","椅子"],["sofa","沙發"],["door","門"]];
const THINGS=["The ball","The cat","My bag","The dog","Your cap","The book"];
const PREP5=[["The bank is ___ the park.","across from","銀行在公園對面"],["The tea shop is ___ the bank and the school.","between","飲料店在銀行和學校之間"],["The bus stop is ___ the hospital.","in front of","公車站在醫院前面"],["The MRT station is ___ the bookstore.","next to","捷運站在書店旁邊"]];
function G_prep(g){if(g>=5&&Math.random()<.35){const it=EN_pick(PREP5);
    return [`${it[0]}（${it[2]}）`,EN_o4(it[1],["across from","between","behind","under","in"]),`${it[2]}：${it[1]}`,"G-prep","",it[0].replace("___",it[1])]}
  const [pp,zh]=EN_pick(PREP),[pl,pzh]=EN_pick(PLACE),t=EN_pick(THINGS);
  return [`${t} is ___ the ${pl}.（在${pzh}${zh}）`,EN_o4(pp,PREP.map(x=>x[0])),`${zh} ＝ ${pp}`,"G-prep","",`${t} is ${pp} the ${pl}.`]}
function G_can(g){const p=EN_pick(EN_P),v=EN_pick(EN_V);return [`${p.s} can ___ ${v[4]}.`,EN_o4(v[0],[v[1],v[2],v[3],"to "+v[0]]),"can 後面一定接原形動詞，不加 s、ing、ed","G-can","",`${p.s} can ${v[0]} ${v[4]}.`]}
function G_have(g){const p=EN_pick(EN_P),n=EN_pick(["a dog","two sisters","a new bike","many friends","a red cap"]),a=p.t3?"has":"have";
  return [`${p.s} ___ ${n}.`,EN_o4(a,["have","has","is","are"]),"I/you/we/they 用 have；he/she/it 和單數名詞用 has","G-have","",`${p.s} ${a} ${n}.`]}
function G_prog(g){const p=EN_pick(EN_P),v=EN_pick(EN_V),ans=`${p.be} ${v[2]}`;const wrongBe=EN_pick(["am","is","are"].filter(x=>x!==p.be));
  if(Math.random()<.3)return [`What are you doing? — I ___ ${v[4]}.`,EN_o4(`am ${v[2]}`,[v[0],`am ${v[0]}`,`is ${v[2]}`,v[2]]),"現在進行式＝ am/is/are＋動詞ing","G-prog","",`I am ${v[2]} ${v[4]}.`];
  return [`Look! ${p.s} ___ ${v[4]} now.`,EN_o4(ans,[p.t3?v[1]:v[0],v[2],`${wrongBe} ${v[2]}`,`${p.be} ${v[0]}`]),`看到 Look! / now → 現在進行式：${p.s} ${ans}`,"G-prog","",`Look! ${p.s} ${ans} ${v[4]} now.`]}
const WH=[["___ is my eraser? — It's in your pencil case.","Where"],["___ is the girl in red? — She's my cousin.","Who"],["___ old is your brother? — He's twelve.","How"],
 ["___ do you like summer? — Because I can swim.","Why"],["___ bike is this? — It's Ken's.","Whose"],["___ is your birthday? — It's in June.","When"],
 ["___ do you want, juice or tea? — Juice, please.","Which",["What"]],["___ many cats do you have? — Three.","How"],["___ much is the pen? — It's 20 dollars.","How"],
 ["___ are you doing? — I'm cooking.","What"],["___ color is your bag? — It's purple.","What",["Which"]],["___ day is it today? — It's Sunday.","What",["Which"]],
 ["___ is the weather today? — It's windy.","How"],["___ do you go to school? — By bus.","How"],["___ were you yesterday? — I was at the beach.","Where"],
 ["___ did you buy? — I bought a comic book.","What"],["___ is taller, Tom or Ben? — Ben is.","Who",["Which"]],["___ often do you read? — Every night.","How"],
 ["___ are you from? — I'm from Taiwan.","Where"],["___ time do you get up? — At six thirty.","What"]];
function G_wh(g){const it=EN_pick(WH),ex=it[2]||[];return [it[0],EN_o4(it[1],["What","Where","Who","When","Why","How","Whose","Which"].filter(x=>!ex.includes(x))),"看回答找線索：地點→Where、人→Who、時間→When、原因→Why、方法/狀態→How、誰的→Whose","G-wh","",it[0].replace("___",it[1])]}
const IMP=[["___ quiet, please.","Be",["Is","Are","Am"]],["Don't ___ in the classroom.","run",["runs","running","ran"]],["___ careful! The floor is wet.","Be",["Is","Are","Being"]],
 ["Please ___ the window.","open",["opens","opening","opened"]],["Let's ___ to the zoo.","go",["goes","going","went"]],["Don't ___ late again.","be",["is","are","being"]],
 ["___ your hands before lunch.","Wash",["Washes","Washing","Washed"]],["Let's ___ soccer after school.","play",["plays","playing","played"]]];
function G_imp(g){const it=EN_pick(IMP);return [it[0],[it[1],...it[2]],"祈使句（命令、請求）和 Let's、Don't 後面都用原形動詞","G-imp","",it[0].replace("___",it[1])]}
function G_like(g){const v=EN_pick(EN_V.filter(x=>!["have","get","take","do","see","visit"].includes(x[0])));
  if(Math.random()<.5)return [`I like ___ ${v[4]}.（${v[0]}）`,EN_o4(v[2],[v[0],v[1],v[3]]),"like 後面接動詞時用 V-ing（或 to V），這題選 V-ing","G-like","",`I like ${v[2]} ${v[4]}.`];
  return [`I want ___ ${v[4]}.（${v[0]}）`,EN_o4("to "+v[0],[v[0],v[2],v[1]]),"want 後面接 to＋原形動詞：want to go","G-like","",`I want to ${v[0]} ${v[4]}.`]}
function G_pron(g){const p=EN_pick(EN_P.slice(0,6)),k=Math.random(),pool=[p.s==="I"?"I":p.s.toLowerCase(),p.pos,p.obj,p.mine],fill=["him","his","they","its","it","we","me","us"];
  if(k<.4)return [`This is ___ bag.（${p.zh}的）`,EN_o4(p.pos,pool,fill),"名詞前面用所有格：my/your/his/her/our/their","G-pron","",`This is ${p.pos} bag.`];
  if(k<.7)return [`Please help ___.（${p.zh}）`,EN_o4(p.obj,pool,fill),"動詞後面用受格：me/you/him/her/us/them","G-pron","",`Please help ${p.obj}.`];
  return [`The red pencil is ___.（${p.zh}的）`,EN_o4(p.mine,pool,fill),"後面沒有名詞時用所有代名詞：mine/yours/his/hers/ours/theirs","G-pron","",`The red pencil is ${p.mine}.`]}
function G_pres(g){const p=EN_pick(EN_P),v=EN_pick(EN_V),tm=EN_pick(EN_TIME.pres),k=Math.random();
  if(k<.25){const a=p.t3?"Does":"Do",sub=subQ(p);return [`___ ${sub} ${v[0]} ${v[4]} ${tm[0]}?`,EN_o4(a,["Do","Does","Is","Are"]),"問句：he/she/it 和單數名詞用 Does，其他用 Do；後面動詞用原形","G-pres","",`${a} ${sub} ${v[0]} ${v[4]} ${tm[0]}?`]}
  if(k<.45){const a=p.t3?"doesn't":"don't";return [`${p.s} ___ ${v[0]} ${v[4]} ${tm[0]}.（不）`,EN_o4(a,["don't","doesn't","isn't","aren't"]),"否定：he/she/it 用 doesn't，其他用 don't；後面動詞用原形","G-pres","",`${p.s} ${a} ${v[0]} ${v[4]} ${tm[0]}.`]}
  const a=p.t3?v[1]:v[0];return [`${p.s} ___ ${v[4]} ${tm[0]}.（${v[0]}）`,EN_o4(a,[v[0],v[1],v[2],v[3]]),`${tm[1]}→現在簡單式。主詞${p.t3?"是第三人稱單數，動詞加 s/es":"不是第三人稱單數，用原形"}：${a}`,"G-pres","",`${p.s} ${a} ${v[4]} ${tm[0]}.`]}
function G_pastbe(g){const p=EN_pick(EN_P),a=EN_pick(ADJ),tm=EN_pick(EN_TIME.past);
  if(Math.random()<.35){const q=cap(p.was),sub=subQ(p);return [`___ ${sub} ${a[0]} ${tm[0]}?`,EN_o4(q,["Was","Were","Is","Are"]),"過去的問句：I/he/she/it 用 Was，you/we/they 用 Were","G-pastbe","",`${q} ${sub} ${a[0]} ${tm[0]}?`]}
  return [`${p.s} ___ ${a[0]} ${tm[0]}.`,EN_o4(p.was,["was","were","is","are"]),`看到 ${tm[0]}（${tm[1]}）→ 過去式。am/is → was，are → were`,"G-pastbe","",`${p.s} ${p.was} ${a[0]} ${tm[0]}.`]}
function G_past(g){const p=EN_pick(EN_P),v=EN_pick(EN_V),tm=EN_pick(EN_TIME.past),k=Math.random();
  if(k<.25){const sub=subQ(p);return [`Did ${sub} ___ ${v[4]} ${tm[0]}?`,EN_o4(v[0],[v[3],v[1],v[2]]),"Did 問句：Did 已經表示過去，後面動詞用原形","G-past","",`Did ${sub} ${v[0]} ${v[4]} ${tm[0]}?`]}
  if(k<.4)return [`${p.s} didn't ___ ${v[4]} ${tm[0]}.`,EN_o4(v[0],[v[3],v[1],v[2]]),"didn't 後面接原形動詞","G-past","",`${p.s} didn't ${v[0]} ${v[4]} ${tm[0]}.`];
  const reg=v[3]===v[0]+"ed"||v[3]===v[0]+"d"||v[3]===v[0].slice(0,-1)+"ied";
  return [`${p.s} ___ ${v[4]} ${tm[0]}.（${v[0]}）`,EN_o4(v[3],[v[0],v[1],v[2],v[0]+"ed"]),`${tm[1]}→過去式：${v[0]} → ${v[3]}${reg?"（規則變化）":"（不規則變化，要背）"}`,"G-past","",`${p.s} ${v[3]} ${v[4]} ${tm[0]}.`]}
const MUCH=[["How ___ apples are there? — Ten.","many",["much","old","long"]],["How ___ water do you drink every day?","much",["many","old","often"]],
 ["How ___ is the cake? — It's 80 dollars.","much",["many","old","long"]],["How ___ are the shoes? — They're 900 dollars.","much",["many","old","tall"]],
 ["How ___ students are in the gym?","many",["much","old","long"]],["There isn't ___ milk in the fridge.","any",["some","many","a"]],
 ["Do you have ___ brothers?","any",["much","a","an"]],["We need ___ eggs to make a cake.","some",["any","much","an"]],["She doesn't have ___ money.","much",["many","a","few"]],
 ["Would you like ___ cookies?","some",["any","much","a"]],["How ___ books did you read?","many",["much","old","long"]]];
function G_much(g){const it=EN_pick(MUCH);return [it[0],[it[1],...it[2]],"可數名詞（apples）用 many，不可數（water、milk、money）和問價錢用 much；肯定句、請求用 some，否定句和問句用 any","G-much","",it[0].replace("___",it[1])]}
const TPREP=[["I get up ___ 6:30.","at"],["We have music class ___ Tuesday.","on"],["My birthday is ___ August.","in"],["I read books ___ night.","at"],["She plays tennis ___ the afternoon.","in"],
 ["The party is ___ May 5th.","on"],["It's very cold ___ winter.","in"],["Let's meet ___ noon.","at"],["He was born ___ 2016.","in"],["We don't go to school ___ Saturdays.","on"]];
function G_tprep(g){const it=EN_pick(TPREP);return [it[0],EN_o4(it[1],["at","on","in","for"]),"時間介系詞：at＋幾點/noon/night；on＋星期/日期；in＋月份/季節/年/早上下午","G-tprep","",it[0].replace("___",it[1])]}
const ORD=["Where is your school?","I am good at drawing.","She is reading a comic book.","My father goes to work by car.","Can you play the guitar?","There are two cats under the bed.",
 "What time do you get up?","We are going to the park.","He doesn't like carrots.","How much is this skirt?","Whose shoes are these?","Did you go to the zoo last week?",
 "Tom is taller than his brother.","I will visit my grandma tomorrow.","Where were you last night?","What did you eat for lunch?"];
const PROPER=["I","Tom","Amy","Ben"];
const fmtWords=(ws,end)=>ws.map((w,i)=>i===0?cap(w):w).join(" ")+end;
function G_order(g){const pool=g>=5?ORD:ORD.filter(s=>!/will|taller/.test(s)),s=EN_pick(pool),end=s.slice(-1),ws=s.slice(0,-1).split(" ").map((w,i)=>i===0&&!PROPER.includes(w)?w.toLowerCase():w);
  const right=fmtWords(ws,end),wr=new Set();let guard=0;while(wr.size<3&&guard++<120){const a=[...ws],i=Math.floor(Math.random()*(a.length-1)),j=Math.random()<.6?i+1:Math.floor(Math.random()*a.length);if(Math.min(i,j)===0&&Math.max(i,j)===1)continue;[a[i],a[j]]=[a[j],a[i]];const t=fmtWords(a,end);if(t!==right)wr.add(t)}
  return ["哪一句的順序是對的？",[right,...wr],`正確：${right}`,"G-order","",right]}
function G_future(g){const p=EN_pick(EN_P),v=EN_pick(EN_V),tm=EN_pick(EN_TIME.fut);
  if(Math.random()<.5)return [`${p.s} will ___ ${v[4]} ${tm[0]}.`,EN_o4(v[0],[v[1],v[2],v[3]]),"will 後面接原形動詞","G-future","",`${p.s} will ${v[0]} ${v[4]} ${tm[0]}.`];
  return [`${p.s} ___ going to ${v[0]} ${v[4]} ${tm[0]}.`,EN_o4(p.be,["am","is","are","will"]),`be going to：主詞 ${p.s} 搭配 ${p.be}`,"G-future","",`${p.s} ${p.be} going to ${v[0]} ${v[4]} ${tm[0]}.`]}
const FREQ=[["always","總是（100%）"],["usually","通常（約 80%）"],["often","常常（約 60%）"],["sometimes","有時候（約 40%）"],["never","從不（0%）"]];
const FREQ_S=[["I ___ brush my teeth before bed.","always"],["He ___ eats vegetables. He hates them.","never"],["We ___ go to the beach in summer.","often"],["She ___ takes the MRT to school.","usually"],["I ___ play video games on Sundays.","sometimes"]];
const FREQ_POS=[["He is always happy.",["He always is happy.","Always he is happy.","He is happy always always."]],["I usually walk to school.",["I walk usually to school.","Usually I walk school to.","I walk to usually school."]],
 ["She never eats breakfast.",["She eats never breakfast.","She eats breakfast never never.","Never she eats breakfast never."]],["They are often late.",["They often are late.","They are late often often.","Often are they late."]]];
function G_freq(g){if(g>=6&&Math.random()<.3){const it=EN_pick(FREQ_POS);return ["哪一句頻率副詞的位置正確？",[it[0],...it[1]],"頻率副詞放在 be 動詞後面、一般動詞前面","G-freq","",it[0]]}
  const it=EN_pick(FREQ_S),zh=FREQ.find(x=>x[0]===it[1])[1];return [`${it[0]}（${zh}）`,EN_o4(it[1],FREQ.map(x=>x[0])),"always 100% > usually > often > sometimes > never 0%","G-freq","",it[0].replace("___",it[1])]}
const CMP=[["tall","taller","tallest","高"],["big","bigger","biggest","大"],["small","smaller","smallest","小"],["fast","faster","fastest","快"],["long","longer","longest","長"],
 ["happy","happier","happiest","快樂"],["heavy","heavier","heaviest","重"],["hot","hotter","hottest","熱"],["young","younger","youngest","年輕"],["old","older","oldest","老"],
 ["good","better","best","好"],["bad","worse","worst","糟"],["beautiful","more beautiful","most beautiful","漂亮"],["interesting","more interesting","most interesting","有趣"],["expensive","more expensive","most expensive","貴"]];
function G_comp(g){const c=EN_pick(CMP);
  if(Math.random()<.55){const s=`${EN_pick(["Ben","Tom","My dog","This book","The red car"])} is ___ than ${EN_pick(["Amy","yours","that one","my cat"])}.`;
    return [`${s}（比較${c[3]}）`,EN_o4(c[1],[c[0],c[2],"more "+c[1],c[0]+"er"]),"兩個比較用比較級＋than：-er 或 more＋形容詞；good→better、bad→worse","G-comp","",s.replace("___",c[1])]}
  const s=`It is the ___ ${EN_pick(["one","day","picture","story"])} of all.`;
  return [`${s}（最${c[3]}）`,EN_o4(c[2],[c[0],c[1],"most "+c[2],c[0]+"est"]),"三個以上比較用 the＋最高級：-est 或 most＋形容詞；good→best","G-comp","",s.replace("___",c[2])]}
function G_tense(g){const p=EN_pick(EN_P),v=EN_pick(EN_V),t=EN_pick(["pres","prog","past","fut"]),tm=EN_pick(EN_TIME[t]),ans=vf(p,v,t);
  const nm={pres:"現在簡單式（習慣）",prog:"現在進行式（正在）",past:"過去式",fut:"未來式"};
  return [`${p.s} ___ ${v[4]} ${tm[0]}.`,EN_o4(ans,["pres","prog","past","fut"].filter(x=>x!==t).map(x=>vf(p,v,x))),`時間線索「${tm[0]}」＝${tm[1]} → ${nm[t]}`,"G-tense","",sent(p,ans,v,tm[0])]}
function G_error(g){const p=EN_pick(EN_P.filter(x=>x.t3)),v=EN_pick(EN_V.filter(x=>x[0]!==x[3])),t=EN_pick(["pres","past","prog"]),tm=EN_pick(EN_TIME[t]),ok=sent(p,vf(p,v,t),v,tm[0]);
  const bad=[sent(p,v[0],v,tm[0]),sent(p,`is ${v[0]}`,v,tm[0]),sent(p,v[2],v,tm[0]),sent(p,`will ${v[1]}`,v,tm[0]),sent(p,`didn't ${v[3]}`,v,tm[0])].filter(x=>x!==ok);
  return ["哪一句英文是正確的？",EN_o4(ok,bad),`正確：${ok}`,"G-error","",ok]}

/* ---------- 章節清單 ---------- */
const ENG_CH=[
 {k:"L-word",n:"🎧 聽單字",g:1,f:L_word,note:"按 🔊 聽，注意開頭和結尾的音。聽不清楚就再聽一次，也可以切換 🐢 慢速。"},
 {k:"L-sent",n:"🎧 聽句子懂意思",g:2,f:L_sent,note:"先抓關鍵字：What/Where/When 開頭是問句；聽到 like、want、have 想想是喜歡、想要、擁有。"},
 {k:"L-resp",n:"🎧 聽問句選回答",g:2,f:L_resp,note:"回答要配合問句：How old→年齡、Where→地點、What time→時間、Can you→Yes, I can、Did you→Yes, I did。"},
 {k:"L-num",n:"🎧 聽數字時間價錢",g:3,f:L_num,note:"最容易聽錯的是 -teen 和 -ty：fifteen（15，重音在後面 teen）、fifty（50，重音在前面 fif）。時間 7:15 念 seven fifteen。"},
 {k:"L-pair",n:"🎧 聽音辨字",g:3,f:L_pair,note:"長短母音：ship 短 / sheep 長；bed 嘴巴小 / bad 嘴巴大；three 舌頭在牙齒間 / tree 沒有。"},
 {k:"L-spell",n:"🎧 聽音拼字",g:3,f:L_spell,note:"一邊聽一邊拆音節：ba-na-na、Sat-ur-day。注意不發音的字母和雙寫字母。"},
 {k:"L-dlg",n:"🎧 聽短對話",g:3,f:L_dlg,note:"先看清楚中文問題要找什麼（地點？時間？誰？），再專心聽那個部分。對話有兩個人，聲音高低不同。"},
 {k:"L-cloze",n:"🎧 聽句子填空",g:4,f:L_cloze,note:"聽完整句子，注意動詞的樣子：有沒有 s、ing、ed，還有 yesterday、now、tomorrow 這些時間詞。"},
 {k:"G-be",n:"✏️ be 動詞 am/is/are",g:1,f:G_be,note:"I am／You are／He, She, It is／We, They are。單數名詞（Tom、my sister）用 is，複數（Amy and I）用 are。"},
 {k:"G-plural",n:"✏️ 名詞單複數",g:2,f:G_plural,note:"一般加 s；s, x, sh, ch 結尾加 es；子音+y 改 ies；f/fe 改 ves。不規則：child→children、man→men、foot→feet、tooth→teeth、mouse→mice、fish→fish。"},
 {k:"G-this",n:"✏️ this / that / these / those",g:2,f:G_this,note:"近：this（一個）、these（多個）。遠：that（一個）、those（多個）。these/those 後面用 are。"},
 {k:"G-aan",n:"✏️ a 和 an",g:2,f:G_aan,note:"看的是「發音」：母音音開頭用 an（an apple、an hour）；子音音開頭用 a（a book、a uniform）。"},
 {k:"G-prep",n:"✏️ 位置介系詞",g:2,f:G_prep,note:"in 裡面、on 上面、under 下面、behind 後面、next to 旁邊、in front of 前面、across from 對面、between A and B 在 A 和 B 之間。"},
 {k:"G-can",n:"✏️ can 會、能",g:3,f:G_can,note:"can＋原形動詞：She can swim.（不是 swims）問句 Can you…? 回答 Yes, I can. / No, I can't."},
 {k:"G-have",n:"✏️ have / has",g:3,f:G_have,note:"I/You/We/They have；He/She/It has。Tom has a dog."},
 {k:"G-prog",n:"✏️ 現在進行式",g:3,f:G_prog,note:"am/is/are＋V-ing 表示「正在」。run→running、swim→swimming（雙寫）、make→making（去 e）。"},
 {k:"G-wh",n:"✏️ 疑問詞",g:3,f:G_wh,note:"What 什麼、Where 哪裡、Who 誰、When 何時、Why 為什麼、How 如何、Whose 誰的、Which 哪一個。How many 幾個、How much 多少錢/多少量、How old 幾歲。"},
 {k:"G-imp",n:"✏️ 祈使句 Let's / Don't",g:3,f:G_imp,note:"祈使句直接用原形動詞開頭：Open the door. Be quiet. 不要做：Don't＋原形。一起做：Let's＋原形。"},
 {k:"G-like",n:"✏️ like V-ing / want to V",g:3,f:G_like,note:"喜歡做某事：like＋V-ing（I like swimming）。想要做某事：want to＋原形（I want to go home）。"},
 {k:"G-pron",n:"✏️ 代名詞與所有格",g:4,f:G_pron,note:"主格 I/he/she/we/they；受格 me/him/her/us/them；所有格 my/his/her/our/their＋名詞；所有代名詞 mine/his/hers/ours/theirs（後面不接名詞）。"},
 {k:"G-pres",n:"✏️ 現在簡單式（第三人稱 s）",g:4,f:G_pres,note:"習慣、每天做的事用現在簡單式。he/she/it 動詞加 s：plays、goes、watches、studies、has。問句 Does he…?／否定 He doesn't…，後面都用原形。"},
 {k:"G-pastbe",n:"✏️ 過去式 was / were",g:4,f:G_pastbe,note:"am、is 的過去式是 was；are 的過去式是 were。Where were you yesterday? — I was at home."},
 {k:"G-past",n:"✏️ 一般動詞過去式",g:4,f:G_past,note:"規則：加 ed（played、watched、studied）。不規則要背：go→went、eat→ate、see→saw、buy→bought、have→had、do→did、make→made、take→took。Did 問句、didn't 後面用原形。"},
 {k:"G-much",n:"✏️ How much / many、some / any",g:4,f:G_much,note:"可數名詞（apples、books）用 many；不可數（water、milk、money）用 much；問價錢 How much is/are…？肯定句用 some，否定句和問句用 any。"},
 {k:"G-tprep",n:"✏️ 時間介系詞 at/on/in",g:4,f:G_tprep,note:"at＋時刻（at 7:00、at noon、at night）；on＋星期、日期（on Monday、on May 5th）；in＋月份、季節、年、上午下午（in July、in winter、in the morning）。"},
 {k:"G-order",n:"✏️ 句子重組",g:4,f:G_order,note:"英文句子順序：主詞＋動詞＋受詞＋地點＋時間。問句把 be 動詞、助動詞（do、does、did、can）放到主詞前面。"},
 {k:"G-future",n:"✏️ 未來式 will / be going to",g:5,f:G_future,note:"will＋原形：I will call you. be going to＋原形：She is going to visit Yilan. 時間線索：tomorrow、next week、this weekend。"},
 {k:"G-tense",n:"✏️ 看時間詞選時態",g:5,f:G_tense,note:"every day → 現在簡單式；now、Look! → 現在進行式；yesterday、last、ago → 過去式；tomorrow、next → 未來式。"},
 {k:"G-error",n:"✏️ 找出正確的句子",g:5,f:G_error,note:"檢查三件事：主詞是不是第三人稱單數？時間詞是哪個時態？be 動詞後面接 V-ing、助動詞（will、didn't、can）後面接原形。"},
 {k:"G-freq",n:"✏️ 頻率副詞",g:6,f:G_freq,note:"always（總是）> usually（通常）> often（常常）> sometimes（有時）> never（從不）。放在一般動詞前面、be 動詞後面：I usually walk. He is always happy."},
 {k:"G-comp",n:"✏️ 比較級與最高級",g:6,f:G_comp,note:"兩個比：-er＋than（taller than）；三個以上：the＋-est（the tallest）。長的字用 more/most：more beautiful。不規則：good→better→best、bad→worse→worst。"},
];
const engChapters=g=>ENG_CH.filter(c=>c.g<=g);
for(const c of ENG_CH)NOTES[c.k]=c.note;
