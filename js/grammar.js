/* SiteTalk — categories, grammar lessons, 30-day plan.
 * Grammar lesson format:
 *  forms: [formula, Bangla note]
 *  ex:    "English|Bangla"   (all examples are from site work)
 *  qz:    "question|opt1~opt2~opt3|correctIndex|explanation"
 */
window.SITE_DATA = window.SITE_DATA || {};

window.SITE_DATA.cats = [
  {id:"A", t:"Daily Site Communication", tb:"প্রতিদিনের সাইট কমিউনিকেশন", d:"রিপোর্ট, কাজের আলোচনা, অগ্রগতি, অনুমতি"},
  {id:"B", t:"Mechanical Fabrication", tb:"মেকানিক্যাল ফ্যাব্রিকেশন", d:"ম্যাটেরিয়াল, কাটিং, ওয়েল্ডিং, ফিট-আপ, ড্রয়িং, নজল, ডাক্ট"},
  {id:"C", t:"Inspection & Quality Control", tb:"ইন্সপেকশন ও কোয়ালিটি কন্ট্রোল", d:"RFI, প্রস্তুতি, মিসম্যাচ, ডিফেক্ট, রি-ইন্সপেকশন"},
  {id:"D", t:"Installation & Maintenance", tb:"ইনস্টলেশন ও মেইনটেন্যান্স", d:"পাম্প, বেয়ারিং, অ্যালাইনমেন্ট, বোল্ট টর্ক, PM"},
  {id:"E", t:"Safety Communication", tb:"সেফটি কমিউনিকেশন", d:"TBT, পারমিট, PPE, লিফটিং, স্ক্যাফোল্ড, নিয়ার মিস, স্টপ ওয়ার্ক"},
  {id:"F", t:"Problem Solving & Professional Talk", tb:"সমস্যা সমাধান ও পেশাদার কথা", d:"সমস্যা জানানো, সময় চাওয়া, ক্লারিফিকেশন, মিটিং"}
];

window.SITE_DATA.speakers = {
  Y:["You","আপনি"], S:["Supervisor","সুপারভাইজার"], Q:["QC Inspector","QC ইন্সপেক্টর"],
  E:["Engineer","ইঞ্জিনিয়ার"], SO:["Safety Officer","সেফটি অফিসার"], F:["Fitter","ফিটার"],
  W:["Welder","ওয়েল্ডার"], K:["Storekeeper","স্টোরকিপার"], R:["Rigger","রিগার"], P:["Planning Manager","প্ল্যানিং ম্যানেজার"]
};

window.SITE_DATA.grammar = [
{id:"g1",t:"Sentence structure",tb:"বাক্যের গঠন (S + V + O)",
intro:"বাংলায় verb বাক্যের শেষে আসে: “আমি ড্রয়িং চেক করি।” ইংরেজিতে verb বসে subject-এর ঠিক পরে: “I check the drawing.” এই একটা নিয়ম মনে রাখলেই অর্ধেক ভুল কমে যায়।",
forms:[["Subject + Verb + Object","কে + কী করে + কী/কাকে"],["Subject + Verb + Object + Place + Time","স্থান আগে, সময় শেষে"]],
ex:["I check the drawing.|আমি ড্রয়িং চেক করি।","The welder welds the joint.|ওয়েল্ডার জয়েন্ট ওয়েল্ড করে।","We need a crane.|আমাদের একটা ক্রেন লাগবে।","We will install the pump in Area 3 tomorrow.|আমরা আগামীকাল এরিয়া ৩-এ পাম্প বসাব।","The fitter cut the pipe yesterday.|ফিটার গতকাল পাইপ কেটেছে।"],
tip:"বাংলা থেকে অনুবাদের সময় আগে ঠিক করুন — কে (subject)? কী করে (verb)? তারপর বাকিটা।",
qz:["সঠিক ক্রম কোনটি?|I the drawing check.~I check the drawing.~Check I the drawing.|1|Subject + Verb + Object।","“আমরা কাল সকালে পাম্প বসাব।”|We will install the pump tomorrow morning.~We tomorrow morning pump install.~Tomorrow we pump will install.|0|সময় সাধারণত শেষে।","“ওয়েল্ডার জয়েন্ট ওয়েল্ড করে।”|The welder the joint welds.~The welder welds the joint.~Welds the welder the joint.|1|Verb subject-এর পরে।"]},

{id:"g2",t:"Am / Is / Are",tb:"Am, Is, Are — বর্তমান অবস্থা",
intro:"কেউ বা কিছু এখন কেমন আছে, কোথায় আছে বলতে am/is/are ব্যবহার হয়। এগুলো “হয় / আছে” অর্থ দেয়।",
forms:[["I + am","আমি"],["He / She / It / একবচন + is","সে, এটা, একটা জিনিস"],["We / You / They / বহুবচন + are","আমরা, তোমরা, তারা, অনেক জিনিস"],["Negative: am not / is not (isn't) / are not (aren't)","না-বাচক"]],
ex:["I am ready.|আমি প্রস্তুত।","The pump is in the workshop.|পাম্পটি ওয়ার্কশপে আছে।","The bolts are loose.|বোল্টগুলো ঢিলা।","The scaffold is not safe.|স্ক্যাফোল্ডটি নিরাপদ নয়।","Are the rods dry?|রডগুলো কি শুকনো?"],
tip:"verb (work, go, check) থাকলে সাধারণত am/is/are লাগে না: “I work here” — “I am work here” ভুল।",
qz:["The flange ___ damaged.|am~is~are|1|একবচন → is।","The welders ___ ready.|is~are~am|1|বহুবচন → are।","“আমি এই কোম্পানিতে কাজ করি।”|I am work in this company.~I work in this company.~I am working this company.|1|verb থাকলে am লাগে না।"]},

{id:"g3",t:"Was / Were",tb:"Was, Were — অতীত অবস্থা",
intro:"অতীতে কেমন ছিল বা কোথায় ছিল বলতে was/were। am/is → was, are → were।",
forms:[["I / He / She / It / একবচন + was","ছিল (একবচন)"],["We / You / They / বহুবচন + were","ছিল (বহুবচন)"],["Negative: wasn't / weren't","ছিল না"]],
ex:["The crane was late.|ক্রেন দেরিতে এসেছিল।","The readings were within tolerance.|রিডিংগুলো টলারেন্সের মধ্যে ছিল।","I was on night shift yesterday.|আমি গতকাল নাইট শিফটে ছিলাম।","There was no toe board.|কোনো টো বোর্ড ছিল না।","Were the slings checked?|স্লিংগুলো কি চেক করা হয়েছিল?"],
tip:"রিপোর্ট দেওয়ার সময় “আগে কেমন ছিল” → was/were, “এখন কেমন আছে” → is/are: “The offset was 0.35. Now it is 0.03.”",
qz:["The gaskets ___ in the store yesterday.|was~were~is|1|বহুবচন অতীত → were।","There ___ an open hole near the pump.|were~was~are|1|একবচন অতীত → was।","Before correction, the offset ___ 0.35 mm.|is~was~were|1|অতীত একবচন → was।"]},

{id:"g4",t:"Present Simple with Do / Does",tb:"Present Simple — Do, Does",
intro:"নিয়মিত কাজ, স্থায়ী তথ্য বা অভ্যাস বলতে Present Simple। He/She/It হলে verb-এ -s/-es যোগ হয়। প্রশ্ন ও না-বাচকে do/does লাগে।",
forms:[["I / We / You / They + verb","I check, we work"],["He / She / It + verb-s","he checks, it works, the drawing says"],["Do / Does + subject + verb?","প্রশ্ন (does থাকলে verb-এ -s থাকে না)"],["don't / doesn't + verb","না-বাচক"]],
ex:["We start work at 6 AM.|আমরা সকাল ৬টায় কাজ শুরু করি।","The QC inspector checks every joint.|QC ইন্সপেক্টর প্রতিটি জয়েন্ট চেক করেন।","Does this pump need a new seal?|এই পাম্পে কি নতুন সিল লাগবে?","The store doesn't have the gaskets.|স্টোরে গ্যাসকেট নেই।","Do you understand the drawing?|তুমি কি ড্রয়িং বুঝতে পারছ?"],
tip:"Does থাকলে মূল verb-এ আর -s দেবেন না: “Does it need?” — “Does it needs?” ভুল।",
qz:["The welder ___ the WPS.|follow~follows~following|1|একবচন → -s।","___ the motor need grease?|Do~Does~Is|1|একবচন → Does।","Does this joint ___ RT?|needs~need~needed|1|Does + মূল রূপ।"]},

{id:"g5",t:"Present Continuous",tb:"Present Continuous — এখন চলছে",
intro:"এই মুহূর্তে যে কাজ চলছে তা বলতে: am/is/are + verb-ing। প্রগ্রেস রিপোর্টে সবচেয়ে বেশি লাগে।",
forms:[["am / is / are + verb-ing","করছি / করছে"],["am not / isn't / aren't + verb-ing","করছে না"],["Am / Is / Are + subject + verb-ing?","করছে কি?"]],
ex:["We are fitting the fifth support now.|আমরা এখন পঞ্চম সাপোর্টটি ফিট করছি।","The motor is making noise.|মোটরে শব্দ হচ্ছে।","The welding machine is not working.|ওয়েল্ডিং মেশিন কাজ করছে না।","Are they grinding the bevel?|তারা কি বেভেল গ্রাইন্ড করছে?","I am waiting for the QC inspector.|আমি QC ইন্সপেক্টরের জন্য অপেক্ষা করছি।"],
tip:"am/is/are বাদ দেবেন না: “We fitting” ভুল, “We are fitting” সঠিক।",
qz:["The crane ___ lifting the spool now.|is~are~am|0|একবচন → is।","We ___ for the permit.|waiting~are waiting~are wait|1|are + verb-ing।","The pump is not ___.|work~working~works|1|is not + verb-ing।"]},

{id:"g6",t:"Past Simple with Did",tb:"Past Simple — Did",
intro:"অতীতে শেষ হওয়া কাজ বলতে verb-এর দ্বিতীয় রূপ (V2)। প্রশ্ন ও না-বাচকে did, আর তখন verb থাকে মূল রূপে।",
forms:[["Subject + V2","checked, cut, found, came"],["Did + subject + verb?","প্রশ্ন (verb মূল রূপে)"],["did not (didn't) + verb","করিনি"],["Common irregular V2","come → came, find → found, fall → fell, cut → cut, take → took, go → went, give → gave"]],
ex:["I checked the heat number.|আমি হিট নম্বর চেক করেছি।","The crane came two hours late.|ক্রেন দুই ঘণ্টা দেরিতে এসেছে।","Did you inform QC?|তুমি কি QC-কে জানিয়েছ?","We didn't get the gaskets.|আমরা গ্যাসকেট পাইনি।","A pipe piece fell from the second level.|দ্বিতীয় লেভেল থেকে একটি পাইপের টুকরো পড়েছে।"],
tip:"did একবার, V2 একবার — দুটো একসাথে নয়: “Did you checked?” ভুল, “Did you check?” সঠিক।",
qz:["Did you ___ the slings?|checked~check~checking|1|Did + মূল রূপ।","Yesterday we ___ the pump.|install~installed~did installed|1|অতীত → V2।","We ___ the drawing yesterday.|didn't get~didn't got~not get|0|didn't + মূল রূপ।"]},

{id:"g7",t:"Have / Has / Had",tb:"Have, Has, Had ও Present Perfect",
intro:"have/has দুটি কাজে লাগে: (১) কারো কিছু আছে বলতে, (২) Present Perfect — কাজটা এইমাত্র/ইতিমধ্যে শেষ হয়েছে বলতে (have/has + V3)। অতীতে had।",
forms:[["I / We / You / They + have","আছে"],["He / She / It + has","আছে (একবচন)"],["have / has + V3","করেছি / করেছে (ফল এখনো আছে)"],["had","ছিল / করেছিল (অতীত)"]],
ex:["I have the latest drawing.|আমার কাছে সর্বশেষ ড্রয়িং আছে।","This plate has deep rust.|এই প্লেটে গভীর মরিচা আছে।","We have installed four supports.|আমরা চারটি সাপোর্ট বসিয়েছি।","Has the permit been signed?|পারমিট কি সই হয়েছে?","We had a problem with the crane yesterday.|গতকাল ক্রেন নিয়ে আমাদের সমস্যা ছিল।"],
tip:"“আছে” মানে সবসময় have নয়: জায়গায় কিছু থাকলে “There is/are” — “There is a crack.”",
qz:["The pump ___ a seal leak.|have~has~having|1|একবচন → has।","We have ___ the job.|finish~finished~finishing|1|have + V3।","___ the welder finished the root pass?|Have~Has~Is|1|একবচন → Has।"]},

{id:"g8",t:"Will and Going to",tb:"Will ও Going to — ভবিষ্যৎ",
intro:"will: এখনই সিদ্ধান্ত নেওয়া বা প্রতিশ্রুতি — “I will call QC.” going to: আগে থেকে ঠিক করা পরিকল্পনা — “We are going to start hydrotest next week.”",
forms:[["will + verb","করব (সিদ্ধান্ত/প্রতিশ্রুতি)"],["am / is / are + going to + verb","করতে যাচ্ছি (পরিকল্পনা)"],["will not (won't) + verb","করব না"]],
ex:["I will send the photos now.|আমি এখনই ছবি পাঠাব।","We will finish by 3 PM.|আমরা ৩টার মধ্যে শেষ করব।","We are going to lift the skid tomorrow.|আমরা কাল স্কিডটি তুলতে যাচ্ছি।","The crane won't come today.|ক্রেন আজ আসবে না।","Are you going to work overtime?|তুমি কি ওভারটাইম করবে?"],
tip:"will-এর পরে verb-এ কিছু যোগ হয় না: “will sending / will sent” ভুল।",
qz:["OK sir, I ___ call the electrician now.|will~going~am will|0|তাৎক্ষণিক সিদ্ধান্ত → will।","We are going ___ start the hydrotest next week.|to~for~will|0|going to + verb।","I will ___ the report.|sending~send~sent|1|will + মূল রূপ।"]},

{id:"g9",t:"Can, Could, Should, Would, Must",tb:"Can, Could, Should, Would, Must",
intro:"এগুলোকে modal verb বলে। এদের পরে সবসময় verb-এর মূল রূপ বসে, to বসে না, -s/-ing যোগ হয় না।",
forms:[["can","পারা / অনুমতি — Can I use the grinder?"],["could","ভদ্র অনুরোধ / সম্ভাবনা — Could you repeat, please?"],["should","উচিত / পরামর্শ — We should replace the bearing."],["would","ভদ্র ইচ্ছা — I would like to request an inspection."],["must","অবশ্যই — You must wear a harness."]],
ex:["Can we start the lift?|আমরা কি লিফট শুরু করতে পারি?","Could you check this joint, please?|দয়া করে এই জয়েন্টটি চেক করবেন?","You should check the disc first.|তোমার আগে ডিস্ক চেক করা উচিত।","I would like to extend the permit.|আমি পারমিটটি বাড়াতে চাই।","Everyone must attend the toolbox talk.|সবাইকে অবশ্যই টুলবক্স টকে থাকতে হবে।"],
tip:"Supervisor বা Engineer-কে অনুরোধ করতে Can-এর চেয়ে Could বেশি ভদ্র শোনায়।",
qz:["We should ___ the bearing.|to replace~replace~replacing|1|modal + মূল রূপ।","সবচেয়ে ভদ্র অনুরোধ কোনটি?|Check this.~Could you check this, please?~You check this.|1|Could you ..., please?","You must ___ a harness.|wear~to wear~wearing|0|must + মূল রূপ।"]},

{id:"g10",t:"Yes / No questions",tb:"প্রশ্ন তৈরি (Yes/No Question)",
intro:"বাংলায় শুধু “কি” যোগ করলেই প্রশ্ন হয়। ইংরেজিতে সাহায্যকারী verb (is/are/do/does/did/can/will) বাক্যের শুরুতে নিয়ে আসতে হয়।",
forms:[["Is / Are + subject + ...?","Is the area clean?"],["Do / Does / Did + subject + verb?","Do we need a crane?"],["Can / Will / Should + subject + verb?","Can you come at 10?"]],
ex:["Is the permit ready?|পারমিট কি প্রস্তুত?","Are the bolts tight?|বোল্টগুলো কি টাইট?","Do we need preheat?|প্রি-হিট লাগবে কি?","Did you inform the supervisor?|তুমি কি সুপারভাইজারকে জানিয়েছ?","Can I take one helper?|আমি কি একজন হেল্পার নিতে পারি?"],
tip:"সাইটে অনেকে বলেন “You checked?” — বোঝা যায়, কিন্তু Engineer বা QC-এর সাথে “Did you check?” বলুন।",
qz:["___ the pump isolated?|Does~Is~Do|1|অবস্থা → Is।","___ you check the level?|Did~Was~Are|0|অতীত কাজ → Did।","“আমাদের কি ক্রেন লাগবে?”|We need crane?~Do we need a crane?~Are we need a crane?|1|Do + subject + verb।"]},

{id:"g11",t:"WH questions",tb:"WH প্রশ্ন (What, Where, When, Why, How)",
intro:"তথ্য জানতে WH শব্দ শুরুতে, তারপর সাহায্যকারী verb, তারপর subject।",
forms:[["WH + is/are + subject?","Where is the spool?"],["WH + do/does/did + subject + verb?","What does this symbol mean?"],["How + adjective / How much / How many","How deep / How much time / How many joints"],["What = কী, Which = কোনটি, Where = কোথায়, When = কখন, Why = কেন, Who = কে, How = কীভাবে/কত","প্রশ্ন শব্দের অর্থ"]],
ex:["What is the torque value?|টর্ক ভ্যালু কত?","Which drawing should I follow?|কোন ড্রয়িং অনুসরণ করব?","Where is the fire extinguisher?|অগ্নিনির্বাপক যন্ত্রটি কোথায়?","When will the gaskets arrive?|গ্যাসকেট কখন আসবে?","How many joints are rejected?|কতগুলো জয়েন্ট রিজেক্ট হয়েছে?"],
tip:"প্রশ্ন শব্দ শেষে বসাবেন না: “Torque is how much?” → “What is the torque?”",
qz:["___ is the bevel angle?|What~Where~Who|0|কত/কী → What।","Why ___ it fall?|did~was~is|0|অতীত কাজের কারণ → did।","How ___ time do you need?|many~much~long|1|time গণনা করা যায় না → much।"]},

{id:"g12",t:"Prepositions",tb:"Prepositions — in, on, at, under, between ...",
intro:"স্থান ও সময় বোঝাতে ছোট শব্দগুলো খুব গুরুত্বপূর্ণ। সাইটে সবচেয়ে বেশি লাগে এগুলো।",
forms:[["in","ভেতরে / মাসে — in the shop, in December"],["on","উপরে / দিনে — on the pipe rack, on Monday"],["at","নির্দিষ্ট স্থান/সময় — at the gate, at 10 o'clock"],["under / above / between / near / next to","নিচে / উপরে / মাঝে / কাছে / পাশে"],["from ... to ... / by / until","থেকে ... পর্যন্ত / মধ্যে / পর্যন্ত"]],
ex:["The spool is in bay number 2.|স্পুলটি ২ নম্বর বে-তে।","The welder is on the scaffold.|ওয়েল্ডার স্ক্যাফোল্ডের ওপরে।","Come at 10 o'clock.|১০টায় আসুন।","Nobody stands under the load.|লোডের নিচে কেউ দাঁড়াবে না।","Put the gasket between the flanges.|ফ্ল্যাঞ্জের মাঝে গ্যাসকেট দাও।","We will finish by 3 PM.|আমরা ৩টার মধ্যে শেষ করব।"],
tip:"by = নির্দিষ্ট সময়ের মধ্যে (deadline), until = ওই সময় পর্যন্ত চলবে। “Finish by 5” / “The permit is valid until 5.”",
qz:["The pump is ___ the workshop.|on~in~at|1|ভেতরে → in।","The gaskets will come ___ Thursday.|in~on~at|1|দিনের আগে on।","Put a shim ___ the base plate. (নিচে)|under~on~between|0|নিচে → under।"]},

{id:"g13",t:"Common speaking patterns",tb:"সাইটে কাজে লাগা কমন প্যাটার্ন",
intro:"এই প্যাটার্নগুলো মুখস্থ করলে প্রায় যেকোনো পরিস্থিতিতে দ্রুত বাক্য বানাতে পারবেন। শুধু শেষের অংশটা বদলান।",
forms:[["I need ... / I need to ...","আমার ... লাগবে / করতে হবে"],["Could you ..., please?","দয়া করে ... করবেন?"],["There is ... / There are ...","... আছে"],["Let me ... ","আমি ... করি (অনুমতি নিয়ে)"],["I think ... / In my opinion ...","আমার মনে হয় / আমার মতে"],["Should I ...? / Do you want me to ...?","আমি কি ... করব?"]],
ex:["I need a new disc.|আমার একটা নতুন ডিস্ক লাগবে।","Could you sign the permit, please?|দয়া করে পারমিটে সই করবেন?","There are two defects on this joint.|এই জয়েন্টে দুটি ডিফেক্ট আছে।","Let me check the drawing.|আমি ড্রয়িংটা দেখে নিই।","I think the bearing is damaged.|আমার মনে হয় বেয়ারিং নষ্ট।","Do you want me to call QC?|আপনি কি চান আমি QC-কে ডাকি?"],
tip:"প্রতিদিন একটি প্যাটার্ন বেছে নিয়ে কাজের মধ্যে ৫ বার ব্যবহার করুন।",
qz:["“আমি ড্রয়িংটা দেখে নিই।”|Let me check the drawing.~Let I check drawing.~Me check the drawing let.|0|Let me + verb।","___ two cracks on the weld.|There is~There are~It has|1|বহুবচন → There are।","“আপনি কি চান আমি QC-কে ডাকি?”|You want I call QC?~Do you want me to call QC?~Are you want me call QC?|1|Do you want me to + verb?"]}
];

/* 30-day program: beginner → professional.
 * Each day: 1 conversation (scenario id) + grammar lesson + 10 vocab + 5 sentences + 5-min speaking + quiz.
 * Vocab/sentences are derived from the day's scenario so everything stays consistent. */
window.SITE_DATA.plan = [
 {d:1,s:"a1",g:"g1"},{d:2,s:"a2",g:"g1"},{d:3,s:"a5",g:"g2"},{d:4,s:"e1",g:"g2"},{d:5,s:"e3",g:"g3"},
 {d:6,s:"b1",g:"g3"},{d:7,s:"a3",g:"g4"},{d:8,s:"f1",g:"g4"},{d:9,s:"b2",g:"g5"},{d:10,s:"c1",g:"g5"},
 {d:11,s:"e2",g:"g6"},{d:12,s:"f5",g:"g6"},{d:13,s:"f2",g:"g7"},{d:14,s:"a4",g:"g7"},{d:15,s:"b4",g:"g8"},
 {d:16,s:"c2",g:"g8"},{d:17,s:"b3",g:"g9"},{d:18,s:"e4",g:"g9"},{d:19,s:"c3",g:"g10"},{d:20,s:"b5",g:"g10"},
 {d:21,s:"c4",g:"g11"},{d:22,s:"e6",g:"g11"},{d:23,s:"d1",g:"g12"},{d:24,s:"b6",g:"g12"},{d:25,s:"c5",g:"g13"},
 {d:26,s:"d2",g:"g13"},{d:27,s:"f3",g:"g5"},{d:28,s:"e7",g:"g6"},{d:29,s:"f4",g:"g9"},{d:30,s:"f7",g:"g11"}
];
