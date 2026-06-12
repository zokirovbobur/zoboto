/* ============================================================
   FINPORT BLOG — data & content
   ============================================================ */

/* ---------- i18n: UI chrome strings ---------- */
const I18N = {
  uz:{
    nav:{articles:"Maqolalar",islamic:"Islomiy moliya",calc:"Kalkulyatorlar",glossary:"Lug‘at",tests:"Testlar",about:"Biz haqimizda"},
    search_ph:"Mavzu qidiring: murabaha, kredit, omonat, zakat…",
    hero_title:"Moliyani tushunarli tilda o‘rganing",
    hero_sub:"Islomiy moliya, odatiy bank mahsulotlari va shaxsiy moliyaviy savodxonlik bo‘yicha sodda qo‘llanmalar.",
    cta1:"Islomiy bankdan boshlash",cta2:"Moliyaviy savodxonlik testi",cta3:"Kalkulyatorlar",
    featured_cmp:"Islomiy bank vs Odatiy bank",
    odatiy:"Odatiy bank",islamic_bank:"Islomiy bank",
    cat_title:"Mavzular bo‘yicha o‘rganing",
    cat_sub:"O‘zingizni qiziqtirgan yo‘nalishni tanlang.",
    path_title:"Boshlovchilar uchun yo‘l xaritasi",
    path_sub:"5 bosqichda Islomiy moliyaning asoslarini tushunib oling.",
    continue:"Davom etish",start:"Boshlash",
    articles_title:"So‘nggi maqolalar",articles_sub:"Ekspertlar ko‘rib chiqqan amaliy qo‘llanmalar.",
    view_all:"Barchasini ko‘rish",
    cmp_title:"Islomiy bank vs Odatiy bank",
    cmp_sub:"Asosiy farqlarni bitta jadvalda solishtiring.",
    tools_title:"Kalkulyatorlar va vositalar",
    tools_sub:"Bir necha soniyada o‘z holatingizni baholang.",
    calc:"Hisoblash",check:"Tekshirish",
    news_title:"Haftalik moliyaviy bilimlar",
    news_sub:"Har hafta Islomiy moliya va shaxsiy moliya bo‘yicha sodda qo‘llanmalar.",
    subscribe:"Obuna bo‘lish",
    reviewed:"Ekspert ko‘rib chiqqan",
    min_read:"daqiqa o‘qish",
    levels:{1:"Boshlang‘ich",2:"O‘rta",3:"Professional"},
    found_error:"Xato topdingizmi?",
    disclaimer:"Ushbu material faqat ta’limiy maqsadda tayyorlangan. Bu fatvo, yuridik maslahat yoki shaxsiy moliyaviy tavsiya emas. Qaror qabul qilishdan oldin malakali mutaxassis bilan maslahatlashing.",
  },
  ru:{
    nav:{articles:"Статьи",islamic:"Исламские финансы",calc:"Калькуляторы",glossary:"Глоссарий",tests:"Тесты",about:"О нас"},
    search_ph:"Поиск темы: мурабаха, кредит, депозит, закят…",
    hero_title:"Изучайте финансы простым языком",
    hero_sub:"Понятные руководства по исламским финансам, банковским продуктам и личной финансовой грамотности.",
    cta1:"Начать с исламского банка",cta2:"Тест на фин. грамотность",cta3:"Калькуляторы",
    featured_cmp:"Исламский банк vs Обычный банк",
    odatiy:"Обычный банк",islamic_bank:"Исламский банк",
    cat_title:"Учитесь по темам",cat_sub:"Выберите интересующее направление.",
    path_title:"Дорожная карта для начинающих",path_sub:"Освойте основы исламских финансов за 5 шагов.",
    continue:"Продолжить",start:"Начать",
    articles_title:"Последние статьи",articles_sub:"Практические руководства, проверенные экспертами.",
    view_all:"Смотреть все",
    cmp_title:"Исламский банк vs Обычный банк",cmp_sub:"Сравните ключевые различия в одной таблице.",
    tools_title:"Калькуляторы и инструменты",tools_sub:"Оцените своё положение за секунды.",
    calc:"Рассчитать",check:"Проверить",
    news_title:"Еженедельные финансовые знания",news_sub:"Каждую неделю — простые руководства по финансам.",
    subscribe:"Подписаться",
    reviewed:"Проверено экспертом",min_read:"мин чтения",
    levels:{1:"Начальный",2:"Средний",3:"Профи"},
    found_error:"Нашли ошибку?",
    disclaimer:"Материал подготовлен исключительно в образовательных целях. Это не фетва, не юридическая и не персональная финансовая консультация. Перед принятием решения проконсультируйтесь со специалистом.",
  },
  en:{
    nav:{articles:"Articles",islamic:"Islamic finance",calc:"Calculators",glossary:"Glossary",tests:"Quizzes",about:"About"},
    search_ph:"Search a topic: murabaha, credit, deposit, zakat…",
    hero_title:"Learn finance in plain language",
    hero_sub:"Simple guides to Islamic finance, conventional banking products and personal financial literacy.",
    cta1:"Start with Islamic banking",cta2:"Financial literacy quiz",cta3:"Calculators",
    featured_cmp:"Islamic bank vs Conventional bank",
    odatiy:"Conventional bank",islamic_bank:"Islamic bank",
    cat_title:"Learn by topic",cat_sub:"Pick the direction that interests you.",
    path_title:"Beginner roadmap",path_sub:"Grasp the foundations of Islamic finance in 5 steps.",
    continue:"Continue",start:"Start",
    articles_title:"Latest articles",articles_sub:"Practical, expert-reviewed guides.",
    view_all:"View all",
    cmp_title:"Islamic bank vs Conventional bank",cmp_sub:"Compare the key differences in one table.",
    tools_title:"Calculators & tools",tools_sub:"Assess your situation in seconds.",
    calc:"Calculate",check:"Check",
    news_title:"Weekly financial knowledge",news_sub:"Simple finance guides every week.",
    subscribe:"Subscribe",
    reviewed:"Expert reviewed",min_read:"min read",
    levels:{1:"Beginner",2:"Intermediate",3:"Pro"},
    found_error:"Found an error?",
    disclaimer:"This material is for educational purposes only. It is not a fatwa, legal or personal financial advice. Consult a qualified professional before making decisions.",
  }
};

/* ---------- categories ---------- */
const CATEGORIES = [
  {id:"asoslar", icon:"book",    title:"Islomiy moliya asoslari", desc:"Riba, gharar, halol daromad — asosiy tushunchalar.", count:18, tone:"emerald"},
  {id:"vs",      icon:"scale",   title:"Islomiy bank vs odatiy bank", desc:"Modellar, farqlar va amaliy misollar.", count:12, tone:"navy"},
  {id:"kredit",  icon:"card",    title:"Kredit va qarzlar", desc:"Qarz, foiz yuki va halol muqobillar.", count:14, tone:"emerald"},
  {id:"omonat",  icon:"piggy",   title:"Omonat va jamg‘arma", desc:"Depozit, foyda taqsimoti va xavf.", count:9, tone:"navy"},
  {id:"budjet",  icon:"wallet",  title:"Budjet va shaxsiy moliya", desc:"50/30/20, rejalashtirish va jamg‘arish.", count:16, tone:"emerald"},
  {id:"tolov",   icon:"phone",   title:"To‘lovlar va kartalar", desc:"Kartalar, o‘tkazmalar va to‘lov ilovalari.", count:11, tone:"navy"},
  {id:"xavf",    icon:"shield",  title:"Moliyaviy xavfsizlik", desc:"Firibgarlik, piramidalar va himoya.", count:13, tone:"emerald"},
  {id:"biznes",  icon:"briefcase",title:"Biznes moliyasi", desc:"Shariatga muvofiq moliyalashtirish.", count:10, tone:"navy"},
  {id:"invest",  icon:"chart",   title:"Investitsiya va sukuk", desc:"Sukuk, aksiya va halol investitsiya.", count:8, tone:"emerald"},
  {id:"lugat",   icon:"hash",    title:"Lug‘at", desc:"Atamalar oddiy tilda izohlangan.", count:42, tone:"navy"},
];

/* ---------- learning path ---------- */
const PATH = [
  {n:1, title:"Riba nima va bank foizi bilan qanday bog‘liq?", time:7, done:true},
  {n:2, title:"Islomiy bank qanday ishlaydi?", time:9, done:true},
  {n:3, title:"Murabaha, Ijara, Musharaka farqi", time:11, done:false},
  {n:4, title:"Odatiy kredit va Islomiy moliyalashtirishni solishtirish", time:8, done:false},
  {n:5, title:"Qaror qilishdan oldin nimalarni tekshirish kerak?", time:6, done:false},
];

/* ---------- articles ---------- */
const ARTICLES = [
  {id:"7-farq", cat:"vs", catLabel:"Islomiy bank vs odatiy bank", level:3, time:9, reviewed:true,
   title:"Islomiy bank va odatiy bank: 7 ta asosiy farq",
   summary:"Daromad modeli, aktivga bog‘liqlik va risk taqsimoti — ikki tizimni yonma-yon solishtiramiz.",
   tag:"Tahlil"},
  {id:"murabaha", cat:"asoslar", catLabel:"Islomiy moliya asoslari", level:2, time:7, reviewed:true,
   title:"Murabaha oddiy kreditdan nimasi bilan farq qiladi?",
   summary:"Savdoga asoslangan moliyalashtirish qanday ishlaydi va u qachon mantiqan to‘g‘ri keladi.",
   tag:"Mahsulot"},
  {id:"omonat", cat:"omonat", catLabel:"Omonat va jamg‘arma", level:2, time:8, reviewed:true,
   title:"Omonat halolmi? Foiz, foyda va risk tushunchasi",
   summary:"Kafolatlangan foiz va taqsimlanadigan foyda o‘rtasidagi farqni amaliy misollarda ko‘ramiz.",
   tag:"Tushuncha"},
  {id:"ijara", cat:"asoslar", catLabel:"Islomiy moliya asoslari", level:2, time:6, reviewed:true,
   title:"Ijara — Islomiy lizing qanday ishlaydi?",
   summary:"Aktivni ijaraga olish modeli, mulk huquqi va to‘lov tartibi haqida sodda qo‘llanma.",
   tag:"Mahsulot"},
  {id:"sukuk", cat:"invest", catLabel:"Investitsiya va sukuk", level:3, time:10, reviewed:true,
   title:"Sukuk nima? Obligatsiyadan farqi",
   summary:"Aktivga asoslangan sertifikat va qarz obligatsiyasi qanday farq qiladi.",
   tag:"Investitsiya"},
  {id:"piramida", cat:"xavf", catLabel:"Moliyaviy xavfsizlik", level:1, time:5, reviewed:true,
   title:"Moliyaviy piramidalardan qanday saqlanish kerak?",
   summary:"Firibgarlik belgilari va pulingizni himoya qilishning 6 qoidasi.",
   tag:"Xavfsizlik"},
  {id:"budjet", cat:"budjet", catLabel:"Budjet va shaxsiy moliya", level:1, time:6, reviewed:false,
   title:"Oilaviy budjetni 50/30/20 usulida tuzish",
   summary:"Daromadingizni ehtiyoj, istak va jamg‘armaga taqsimlashning oddiy formulasi.",
   tag:"Amaliyot"},
  {id:"10-savol", cat:"kredit", catLabel:"Kredit va qarzlar", level:1, time:6, reviewed:true,
   title:"Qarz olishdan oldin 10 ta savol",
   summary:"Shartnomani imzolashdan oldin o‘zingizga berishingiz kerak bo‘lgan savollar.",
   tag:"Cheklist"},
];

/* ---------- comparison module ---------- */
const CMP_TABS = [
  {id:"shaxs", label:"Jismoniy shaxs uchun"},
  {id:"biznes", label:"Biznes uchun"},
  {id:"invest", label:"Investitsiya uchun"},
];
const CMP_DATA = {
  shaxs:[
    {k:"Daromad modeli", c:"Pulni qarzga berib, foiz olish", i:"Savdo, ijara yoki sheriklikdan foyda", note:"Islomiy bank real aktiv yoki bitim orqali daromad oladi"},
    {k:"Foiz / foyda", c:"Oldindan belgilangan foiz (%)", i:"Kelishilgan ustama yoki taqsimlanadigan foyda", note:"Foyda aniq bitimga bog‘lanadi, kafolatlanmaydi"},
    {k:"Aktivga bog‘liqlik", c:"Shart emas", i:"Har bir bitim aktivga asoslanadi", note:"Mavjud mol yoki xizmat bo‘lishi shart"},
    {k:"Risk taqsimoti", c:"Asosan mijozda", i:"Bank va mijoz o‘rtasida taqsimlanadi", note:"Risk birgalikda ko‘tariladi"},
    {k:"Shartnoma turi", c:"Qarz shartnomasi", i:"Savdo / ijara / sheriklik shartnomasi", note:"Bitim turi mahsulotga qarab o‘zgaradi"},
    {k:"Kechiktirilgan to‘lov", c:"Penya foiz sifatida o‘sadi", i:"Jarima xayriyaga yo‘naltiriladi", note:"Bank kechikishdan foyda olmaydi"},
    {k:"Nazorat", c:"Ichki risk siyosati", i:"Shariat kengashi (Shariah board)", note:"Mustaqil diniy-moliyaviy nazorat"},
    {k:"Mijoz uchun asosiy savol", c:"Foiz stavkasi qancha?", i:"Bitim qaysi aktivga asoslangan?", note:"Mahsulotning tuzilishini so‘rang"},
  ],
  biznes:[
    {k:"Daromad modeli", c:"Kredit liniyasi bo‘yicha foiz", i:"Murabaha yoki musharaka asosida foyda", note:"Loyiha foydasi asosida hamkorlik mumkin"},
    {k:"Foiz / foyda", c:"Yillik foiz stavkasi", i:"Foyda ulushi yoki ustama narx", note:"Musharakada zarar ham taqsimlanadi"},
    {k:"Aktivga bog‘liqlik", c:"Garov talab qilinadi", i:"Moliyalashtirish aktiv yoki ulushga bog‘liq", note:"Bank biznesga real sherik bo‘lishi mumkin"},
    {k:"Risk taqsimoti", c:"Tadbirkorda", i:"Sheriklikda bank ham ko‘taradi", note:"Musharaka/mudaraba risk birga"},
    {k:"Shartnoma turi", c:"Kredit shartnomasi", i:"Murabaha / Musharaka / Mudaraba", note:"Ehtiyojga qarab tanlanadi"},
    {k:"Kechiktirilgan to‘lov", c:"Jarima foizi", i:"Jarima daromadga qo‘shilmaydi", note:"Shaffof jarima siyosati"},
    {k:"Nazorat", c:"Bank riski qo‘mitasi", i:"Shariat kengashi + audit", note:"Qo‘shimcha muvofiqlik tekshiruvi"},
    {k:"Mijoz uchun asosiy savol", c:"Effektiv stavka qancha?", i:"Foyda qanday taqsimlanadi?", note:"Hamkorlik shartlarini aniqlang"},
  ],
  invest:[
    {k:"Daromad modeli", c:"Foizli obligatsiya / depozit", i:"Sukuk — aktiv ulushidan daromad", note:"Sukuk egasi aktivga ulushdor"},
    {k:"Foiz / foyda", c:"Kupon foizi kafolatlangan", i:"Daromad aktiv natijasiga bog‘liq", note:"Kafolatlangan daromad bo‘lmasligi mumkin"},
    {k:"Aktivga bog‘liqlik", c:"Emitent qarziga bog‘liq", i:"Aniq aktiv yoki loyihaga bog‘liq", note:"Aktiv mavjudligi shart"},
    {k:"Risk taqsimoti", c:"Kredit riski investorda", i:"Aktiv riski taqsimlanadi", note:"Risk aktiv bilan bog‘liq"},
    {k:"Shartnoma turi", c:"Qarz qog‘ozi", i:"Ulushga asoslangan sertifikat", note:"Sukuk turlari farq qiladi"},
    {k:"Kechiktirilgan to‘lov", c:"Default foizi", i:"Tartibga solingan mexanizm", note:"Shariatga muvofiq qayta tuzilish"},
    {k:"Nazorat", c:"Reyting agentliklari", i:"Shariat kengashi + reyting", note:"Ikki bosqichli baholash"},
    {k:"Mijoz uchun asosiy savol", c:"Daromadlilik (YTM) qancha?", i:"Qaysi aktiv daromad keltiradi?", note:"Aktiv tuzilmasini o‘rganing"},
  ],
};

/* ---------- tools / calculators ---------- */
const TOOLS = [
  {id:"health", icon:"heart", title:"Moliyaviy sog‘liq testi", desc:"5 daqiqada moliyaviy holatingizni baholang.", cta:"check", kind:"score"},
  {id:"budget", icon:"wallet", title:"Budjet kalkulyatori", desc:"Daromadni 50/30/20 bo‘yicha taqsimlang.", cta:"calc", kind:"budget"},
  {id:"debt", icon:"scale", title:"Qarz yukini hisoblash", desc:"Oylik to‘lov daromadning necha foizini oladi.", cta:"calc", kind:"debt"},
  {id:"mura", icon:"swap", title:"Murabaha vs kredit solishtirish", desc:"Ikki moliyalashtirishni yonma-yon ko‘ring.", cta:"calc", kind:"mura"},
  {id:"zakat", icon:"coins", title:"Zakat kalkulyatori", desc:"Nisob va zakat miqdorini hisoblang.", cta:"calc", kind:"zakat"},
  {id:"goal", icon:"target", title:"Omonat maqsadi kalkulyatori", desc:"Maqsadga qancha vaqtda yetasiz.", cta:"calc", kind:"goal"},
  {id:"checklist", icon:"check2", title:"Shartnoma tekshiruv checklist’i", desc:"Imzolashdan oldin 8 ta nuqtani tekshiring.", cta:"check", kind:"check"},
];

/* ---------- glossary ---------- */
const GLOSSARY = [
  {term:"Riba", def:"Qarzdan oldindan belgilangan ortiqcha to‘lov (sudxo‘rlik foizi).", ex:"100 birlik berib, 110 birlik qaytarishni shart qilish — riba.", related:["7-farq","murabaha"]},
  {term:"Gharar", def:"Shartnomadagi haddan tashqari noaniqlik yoki noma’lumlik.", ex:"Narxi yoki muddati aniqlanmagan bitim — gharar.", related:["7-farq"]},
  {term:"Maysir", def:"Qimor — natijasi tasodifga bog‘liq daromad.", ex:"Lotereya yoki tikish orqali daromad — maysir.", related:["piramida"]},
  {term:"Murabaha", def:"Bank molni sotib olib, ustama narx bilan bo‘lib to‘lashga sotadi.", ex:"Bank telefonni 10 mln’ga olib, 11 mln’ga sizga sotadi.", related:["murabaha","7-farq"]},
  {term:"Ijara", def:"Aktivni belgilangan haq evaziga ijaraga berish.", ex:"Bank avtomobilni olib, oylik ijara haqiga beradi.", related:["ijara"]},
  {term:"Musharaka", def:"Sheriklik: foyda kelishuv bo‘yicha, zarar ulushga qarab taqsimlanadi.", ex:"Bank va tadbirkor birga kapital qo‘yib, foydani bo‘lishadi.", related:["7-farq"]},
  {term:"Mudaraba", def:"Bir tomon kapital, ikkinchisi mehnat qo‘yadigan sheriklik.", ex:"Investor pul beradi, tadbirkor boshqaradi, foyda bo‘linadi.", related:["omonat"]},
  {term:"Sukuk", def:"Aktivga ulushni tasdiqlovchi Islomiy moliyaviy sertifikat.", ex:"Loyihaga ulush sotib olib, daromaddan ulush olasiz.", related:["sukuk"]},
  {term:"Takaful", def:"O‘zaro yordamga asoslangan Islomiy sug‘urta modeli.", ex:"Ishtirokchilar fondga badal qo‘shib, zararni qoplashadi.", related:[]},
  {term:"Zakat", def:"Nisobdan oshgan boylikdan yiliga 2.5% beriladigan majburiy sadaqa.", ex:"Jamg‘armangiz nisobdan oshsa, 2.5% zakat beriladi.", related:[]},
  {term:"Shariat kengashi", def:"Mahsulotlar muvofiqligini nazorat qiluvchi mustaqil organ.", ex:"Yangi mahsulotni kengash tasdiqlaydi.", related:["7-farq"]},
  {term:"Profit-sharing", def:"Foydani oldindan kelishilgan nisbatda taqsimlash.", ex:"Foyda 60/40 nisbatda bo‘linadi.", related:["omonat"]},
  {term:"Asset-backed", def:"Har bir bitim real aktivga asoslanishi tamoyili.", ex:"Moliyalashtirish ortida real mol yoki xizmat turadi.", related:["sukuk","7-farq"]},
];

/* ---------- article body (detail page) ---------- */
const ARTICLE_BODY = {
  toc:[
    {id:"s1", t:"Qisqacha xulosa"},
    {id:"s2", t:"1. Daromad modeli"},
    {id:"s3", t:"2. Foiz va foyda"},
    {id:"s4", t:"3. Aktivga bog‘liqlik"},
    {id:"s5", t:"4. Risk taqsimoti"},
    {id:"s6", t:"5–7. Shartnoma, nazorat, kechikish"},
    {id:"s7", t:"Tez-tez so‘raladigan savollar"},
  ],
  takeaways:[
    "Odatiy bank pulni qarzga berib foiz oladi; Islomiy bank esa savdo, ijara yoki sheriklikdan foyda oladi.",
    "Islomiy moliyada har bir bitim real aktivga bog‘lanadi.",
    "Risk faqat mijozda emas, bank bilan ham taqsimlanadi.",
    "Mahsulotni Shariat kengashi mustaqil ravishda nazorat qiladi.",
  ],
  faq:[
    {q:"Islomiy bankda umuman foyda yo‘qmi?", a:"Bor, lekin u foiz emas. Foyda savdo ustamasi (murabaha), ijara haqi yoki sheriklik foydasi sifatida shakllanadi va aniq bitimga bog‘lanadi."},
    {q:"Omonatdan daromad olsam bo‘ladimi?", a:"Ha. Islomiy bankda omonat ko‘pincha mudaraba asosida ishlaydi — bank pulingizni halol bitimlarga joylaydi va foydani kelishilgan nisbatda taqsimlaydi. Daromad kafolatlanmaydi."},
    {q:"Murabaha oddiy kreditdan qimmatroqmi?", a:"Har doim emas. Murabahada ustama oldindan belgilanadi va o‘zgarmaydi; oddiy kreditda esa effektiv stavka va qo‘shimcha to‘lovlar yakuniy narxni oshirishi mumkin. Har ikkalasini solishtirib ko‘ring."},
    {q:"Bu maqola fatvomi?", a:"Yo‘q. Bu faqat ta’limiy material. Aniq diniy hukm uchun malakali ulamoga, moliyaviy qaror uchun mutaxassisga murojaat qiling."},
  ],
  related:["murabaha","omonat","ijara"],
};

Object.assign(window,{I18N,CATEGORIES,PATH,ARTICLES,CMP_TABS,CMP_DATA,TOOLS,GLOSSARY,ARTICLE_BODY});
