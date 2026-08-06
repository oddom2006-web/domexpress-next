// src/locales/km.ts
// Must contain the exact same keys as en.ts (TypeScript will error if one is missing).
import type { TranslationKey } from './en';

export const km: Record<TranslationKey, string> = {
  // homepage
  'homepage.platform':    "វេទិការដឹកជញ្ជូន",
  'homepage.callUs':      "ទូរស័ព្ទមកយើង",
  'homepage.signIn':      "ចូលគណនី →",

  // homepage — nav
  'homepage.nav.home':     "ទំព័រដើម",
  'homepage.nav.about':    "អំពីយើង",
  'homepage.nav.services': "សេវាកម្ម",
  'homepage.nav.features': "លក្ខណៈពិសេស",
  'homepage.nav.story':    "ប្រវត្តិយើង",
  'homepage.nav.contact':  "ទំនាក់ទំនង",

  // homepage — hero
  'homepage.hero.badge':        "ដៃគូដឹកជញ្ជូនដែលទុកចិត្តរបស់កម្ពុជា",
  'homepage.hero.title1':       "ទៅគ្រប់",
  'homepage.hero.title2':       "ទិសដៅ",
  'homepage.hero.desc':         "សេវាដឹកជញ្ជូនលឿន ទុកចិត្តបាន និងមានវិជ្ជាជីវៈទូទាំងកម្ពុជា។",
  'homepage.hero.tagline':      "សេវាលឿន គិតដល់ DOM EXPRESS។",
  'homepage.hero.joinUs':       "ចូលរួមឥឡូវនេះ",
  'homepage.hero.bookDelivery': "កក់ការដឹកជញ្ជូន",
  'homepage.hero.branches':     "សាខា",
  'homepage.hero.support':      "ជំនួយ",
  'homepage.hero.onTime':       "ត្រូវពេលវេលា",
  'homepage.hero.pill1Title':   "តាមដានពេលវេលាជាក់ស្តែង",
  'homepage.hero.pill1Sub':     "ដឹងថាកញ្ចប់អ្នកនៅឯណា",
  'homepage.hero.pill2Title':   "ពីទ្វារដល់ទ្វារ",
  'homepage.hero.pill2Sub':     "ដឹកយក និងដឹកជញ្ជូន",
  'homepage.hero.pill3Title':   "សុវត្ថិភាព និងសុវត្ថិភាព",
  'homepage.hero.pill3Sub':     "ការការពារកញ្ចប់",

  // homepage — about
  'homepage.about.label':    "ហេតុអ្វីជ្រើសរើសយើង",
  'homepage.about.title':    "ការដឹកជញ្ជូនលឿនរហ័ស មិនដែលខកខាន",
  'homepage.about.yearsExp': "ឆ្នាំបទពិសោធន៍",
  'homepage.about.text':     "យើងមានមោទនភាពក្នុងការបម្រើអតិថិជនរបស់យើងដោយសុវត្ថិភាព — ជាមួយនឹងចំណង់ចំណូលចិត្ត ព្រោះ",
  'homepage.about.quote':    "time pe pahuchna bhi ek kala hai.",
  'homepage.about.check1':   "តាមដានពេលវេលាជាក់ស្តែង — ដឹងច្បាស់ថាកញ្ចប់របស់អ្នកនៅឯណានៅគ្រប់ដំណាក់កាល។",
  'homepage.about.check2':   "សេវាកម្មផ្តោតលើអតិថិជន — យើងផ្តល់ជូននូវទំនុកចិត្ត និងភាពជឿជាក់ មិនមែនគ្រាន់តែកញ្ចប់ប៉ុណ្ណោះទេ។",
  'homepage.about.check3':   "គ្របដណ្តប់ទូទាំងប្រទេស — ពីទីក្រុងដល់ជនបទ គ្មានទីតាំងណាឆ្ងាយពេកឡើយ។",
  'homepage.about.check4':   "តម្លៃសមរម្យ គ្មានការគិតថ្លៃលាក់កំបាំង — កំណត់តម្លៃត្រឹមត្រូវជានិច្ច។",
  'homepage.about.check5':   "គុណភាព និងវិជ្ជាជីវៈក្នុងរាល់ចលនាដែលយើងធ្វើ។",
  'homepage.about.explore':  "មើលសេវាកម្ម",

  // homepage — services
  'homepage.services.label':   "សេវាកម្មរបស់យើង",
  'homepage.services.title':   "ទុកចិត្តលើសេវាកម្មរបស់យើង",
  'homepage.services.text':    "នៅ DOM EXPRESS ការទុកចិត្តមិនត្រឹមតែទទួលបានប៉ុណ្ណោះទេ — វាត្រូវបានផ្តល់ជូនជាមួយកញ្ចប់ទំនិញនីមួយៗ។ ល្បឿន សុវត្ថិភាព និងភាពស្មោះត្រង់ដល់មាត់ទ្វារអ្នក។",
  'homepage.services.s1Title': "ដឹកជញ្ជូនពេញឡាន (FTL)",
  'homepage.services.s1Desc':  "ឡានទាំងមូលកក់សម្រាប់អតិថិជនម្នាក់ — លឿនជាង សុវត្ថិភាពជាង ដឹកផ្ទាល់ពីទីតាំងទទួលដល់ទីតាំងបញ្ជូនដោយគ្មានឈប់។",
  'homepage.services.s2Title': "ដឹកជញ្ជូនផ្នែក (LTL)",
  'homepage.services.s2Desc':  "ផ្សំទំនិញពីអតិថិជនច្រើននាក់ក្នុងឡានតែមួយ — សន្សំសំចៃថ្លៃសម្រាប់ការដឹកជញ្ជូនតូចៗ។",
  'homepage.services.s3Title': "ដឹកជញ្ជូនចុងក្រោយ",
  'homepage.services.s3Desc':  "ជំហានចុងក្រោយពីឃ្លាំងដល់មាត់ទ្វារ — ល្អសម្រាប់ពាណិជ្ជកម្មអេឡិចត្រូនិក និងការដឹកជញ្ជូនលក់រាយរហ័ស។",
  'homepage.services.s4Title': "ទំនិញធ្ងន់",
  'homepage.services.s4Desc':  "ទំនិញធំ និងធ្ងន់ដូចជាម៉ាស៊ីនផលិតកម្ម — ឡានពិសេស អាជ្ញាប័ណ្ណ និងអ្នកជំនាញ។",
  'homepage.services.s5Title': "ដឹកជញ្ជូនដល់ផ្ទះ",
  'homepage.services.s5Desc':  "ទទួលពីអ្នកផ្ញើ ដឹកជញ្ជូនផ្ទាល់ដល់អ្នកទទួល — គ្មានការឆ្លងកាត់ឃ្លាំង។",
  'homepage.services.s6Title': "សេវាឡានក្រុមហ៊ុន",
  'homepage.services.s6Desc':  "ឡានកិច្ចសន្យាឧទ្ទិសដល់អ្នក — គ្រប់គ្រងផ្លូវធ្វើដំណើរ ពេលវេលា និងម៉ាកយីហោពេញលេញ។",

  // homepage — features
  'homepage.features.label':    "ការប៉ាន់ស្មាន",
  'homepage.features.title':    "ដំណោះស្រាយចម្រុះជាច្រើន",
  'homepage.features.text':     "DOM EXPRESS ផ្តល់ជូនឧបករណ៍បត់បែនដើម្បីឆ្លើយតបនឹងតម្រូវការគម្រោងចម្រុះ — ចាប់ពីការព្យាករណ៍ពេលវេលា ការគ្រប់គ្រងធនធាន រហូតដល់ការគ្រប់គ្រងចំណាយ។",
  'homepage.features.getQuote': "សុំតម្លៃ →",
  'homepage.features.f1Num':    "ដំណោះស្រាយ",
  'homepage.features.f1Title':  "ដំណោះស្រាយ និងឯកទេស",
  'homepage.features.f1Desc':   "យើងធ្វើឱ្យខ្សែសង្វាក់ផ្គត់ផ្គង់របស់អ្នកប្រសើរឡើង ដើម្បីផ្តល់ជូនសេវាកម្មល្អបំផុត — ពីដើមដល់ចប់។",
  'homepage.features.f2Num':    "ឃ្លាំង",
  'homepage.features.f2Title':  "ឃ្លាំងច្រើនទីតាំង",
  'homepage.features.f2Desc':   "ទីតាំងទទួល និងបញ្ជូនច្រើនកន្លែងទូទាំងកម្ពុជា — ភាពងាយស្រួលគ្រប់ជំហាន។",
  'homepage.features.f3Num':    "តាមដាន",
  'homepage.features.f3Title':  "តាមដានយ៉ាងងាយស្រួល",
  'homepage.features.f3Desc':   "លេខតាមដានតែមួយគត់សម្រាប់ដំណើរទាំងមូលរបស់អ្នក — ដឹងទីតាំងកញ្ចប់របស់អ្នកជាក់ស្តែងគ្រប់ពេល។",

  // homepage — owner / gallery
  'homepage.owner.label':    "អំពីម្ចាស់",
  'homepage.owner.text':     "ជាមួយបទពិសោធន៍ជាងមួយទសវត្សរ៍ក្នុងវិស័យដឹកជញ្ជូន ម្ចាស់របស់យើងបានកសាងក្រុមឡានដ៏រឹងមាំ និងគ្រប់គ្រងអតិថិជនធំៗយ៉ាងស្ទាត់ជំនាញ។ ភាពវៃឆ្លាតក្នុងអាជីវកម្ម ការតស៊ូធ្វើការ — ស្មោះត្រង់ ជឿទុកចិត្តបាន និងធ្វើការជានិច្ច ប៉ុន្តែនៅតែសាមញ្ញ និងងាយចូលទៅជិត។ លោកជានាយកដែលធ្វើការឱ្យសម្រេចជាក់ស្តែង។",
  'homepage.gallery.ceo':    "នាយកប្រតិបត្តិរបស់យើង",
  'homepage.gallery.dept':   "នាយកដ្ឋាន EXPRESS",
  'homepage.gallery.g2Name': "ពិធីសម្ពោធសាខាថ្មី",
  'homepage.gallery.g3Name': "ពិធីសម្ពោធតុកតុកថ្មី",
  'homepage.gallery.g4Name': "ពិធីសម្ពោធរថយន្តថ្មី",
  'homepage.gallery.g5Name': "ស្តុកទំនិញឃ្លាំង",
  'homepage.gallery.g6Name': "ពិធីសម្ពោធឡានដឹកទំនិញថ្មី",

  // homepage — CTA band
  'homepage.cta.title':   "កក់ឡាន — គ្របដណ្តប់ទូទាំងកម្ពុជា",
  'homepage.cta.sub':     "សម្រង់តម្លៃលឿន · ការដឹកជញ្ជូនទុកចិត្តបាន · សេវាកម្មគួរទុកចិត្ត · ជំនួយ ២៤/៧",
  'homepage.cta.bookNow': "កក់ឥឡូវនេះ →",

  // homepage — contact
  'homepage.contact.label':               "ទាក់ទងមកយើង",
  'homepage.contact.title':               "ទំនាក់ទំនងមកយើង",
  'homepage.contact.address':             "អាសយដ្ឋាន",
  'homepage.contact.addressVal':          "ភូមិទី១០ សង្កាត់បឹងកក់ទី១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ",
  'homepage.contact.phone':               "ទូរស័ព្ទ",
  'homepage.contact.email':               "អ៊ីមែល",
  'homepage.contact.followUs':            "តាមដានយើង",
  'homepage.contact.formTitle':           "ផ្ញើសារ",
  'homepage.contact.yourName':            "ឈ្មោះរបស់អ្នក",
  'homepage.contact.phoneLabel':          "លេខទូរស័ព្ទ",
  'homepage.contact.emailLabel':          "អាសយដ្ឋានអ៊ីមែល",
  'homepage.contact.messageLabel':        "សារ",
  'homepage.contact.messagePlaceholder':  "សូមប្រាប់យើងអំពីតម្រូវការដឹកជញ្ជូនរបស់អ្នក…",
  'homepage.contact.sent':                "✓ បានផ្ញើសារ!",
  'homepage.contact.sending':             "កំពុងផ្ញើ…",
  'homepage.contact.send':                "ផ្ញើសារ →",

  // homepage — footer
  'homepage.footer.tagline':        "ភស្តុភារដែលទុកចិត្តរបស់កម្ពុជា",
  'homepage.footer.desc':           "ភូមិទី១០ សង្កាត់បឹងកក់ទី១ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ។ សេវាដឹកជញ្ជូនលឿន និងទុកចិត្តបានទូទាំងកម្ពុជា — សេវាកម្ម ២៤/៧។",
  'homepage.footer.quickLinks':     "តំណភ្ជាប់រហ័ស",
  'homepage.footer.aboutUs':        "អំពីយើង",
  'homepage.footer.servicesLink':   "សេវាកម្ម",
  'homepage.footer.ourStory':       "ប្រវត្តិយើង",
  'homepage.footer.contactUs':      "ទំនាក់ទំនងមកយើង",
  'homepage.footer.platform':       "វេទិកា",
  'homepage.footer.trackShipment':  "តាមដានការដឹកជញ្ជូន",
  'homepage.footer.customerPortal': "វិបផតថលអតិថិជន",
  'homepage.footer.driverPortal':   "វិបផតថលអ្នកបើកបរ",
  'homepage.footer.privacyPolicy':  "គោលការណ៍ភាពឯកជន",
  'homepage.footer.terms':          "លក្ខខណ្ឌប្រើប្រាស់",
  'homepage.footer.ourBranches':    "សាខារបស់យើង",
  'homepage.footer.copyright':      "© ២០២៦ DOM EXPRESS។ រក្សាសិទ្ធិគ្រប់យ៉ាងដោយ",

  // ── Nav ──
  'nav.dashboard':     'ផ្ទាំងគ្រប់គ្រង',
  'nav.orders':        'បញ្ជាទិញ',
  'nav.newOrder':      'បញ្ជាទិញថ្មី',
  'nav.tracking':      'តាមដាន',
  'nav.notifications': 'ការជូនដំណឹង',
  'nav.branches':      'សាខា',
  'nav.drivers':       'គ្រប់គ្រងអ្នកបើកបរ',
  'nav.customers':     'អតិថិជន',
  'nav.reports':       'របាយការណ៍',
  'nav.settings':      'ការកំណត់',
  'nav.deliveries':    'ការដឹកជញ្ជូនរបស់ខ្ញុំ',
  'nav.history':       'ប្រវត្តិ',
  'nav.profile':       'ប្រវត្តិរូប',

  // ── Common ──
  'common.signOut':  'ចាកចេញ',
  'common.save':     'រក្សាទុក',
  'common.cancel':   'បោះបង់',
  'common.submit':   'ដាក់ស្នើ',
  'common.loading':  'កំពុងផ្ទុក...',
  'common.search':   'ស្វែងរក',
  'common.noData':   'រកមិនឃើញទិន្នន័យ',
  'common.edit':     'កែសម្រួល',
  'common.delete':   'លុប',
  'common.approve':  'អនុម័ត',
  'common.reject':   'បដិសេធ',
  'common.assign':   'ចាត់តាំង',
  'common.status':   'ស្ថានភាព',
  'common.actions':  'សកម្មភាព',
  'common.close':    'បិទ',

  // ── Auth ──
  'auth.login':       'ចូលគណនី',
  'auth.register':    'ចុះឈ្មោះ',
  'auth.email':       'អ៊ីមែល',
  'auth.password':    'ពាក្យសម្ងាត់',
  'auth.name':        'ឈ្មោះពេញ',
  'auth.phone':       'លេខទូរស័ព្ទ',
  'auth.platform':    "វេទិការដឹកជញ្ជូន",
  'auth.loginBtn':    'ចូល',
  'auth.loginBtn..':    'កំពុងចូល...',
  'auth.registerBtn': 'បង្កើតគណនី',
  'auth.fullNamePlaceholder': 'ឈ្មោះពេញរបស់អ្នក',
  'auth.emailPlaceholder': 'អ៊ីមែលរបស់អ្នក',
  'auth.phonePlaceholder': 'លេខទូរសព្ទរបស់អ្នក',
  'auth.passwordPlaceholder': 'ពាក្យសម្ងាត់របស់អ្នក',
  'auth.registerBtn..': 'កំពុងបង្កើត…',
  'auth.welcome':     'ស្វាគមន៍មកកាន់ DOM Express។ក្រុមហ៊ុមដឹកជញ្ជូនឈានមុខគេនៅកម្ពុជា។',
  'auth.loginBtnLoading':     "កំពុងចូល…",
  'auth.registerBtnLoading':  "កំពុងបង្កើតគណនី…",
  // ភ្លេចពាក្យសម្ងាត់ និងចូលគណនីតាម Google
  'auth.forgot.link':         "ភ្លេចពាក្យសម្ងាត់?",
  'auth.forgot.instructions': "បញ្ចូលអ៊ីមែលរបស់អ្នក ហើយយើងនឹងផ្ញើតំណភ្ជាប់ដើម្បីកំណត់ពាក្យសម្ងាត់ឡើងវិញ។",
  'auth.forgot.sendLink':     "ផ្ញើតំណភ្ជាប់កំណត់ឡើងវិញ",
  'auth.forgot.sending':      "កំពុងផ្ញើ…",
  'auth.forgot.sentMessage':  "ប្រសិនបើមានគណនីសម្រាប់អ៊ីមែលនោះ តំណភ្ជាប់កំណត់ឡើងវិញកំពុងផ្ញើទៅ។ សូមពិនិត្យប្រអប់សំបុត្ររបស់អ្នក (និងប្រអប់សារឥតបានការ)។",
  'auth.forgot.backToLogin':  "ត្រឡប់ទៅការចូលគណនី",
  'auth.orContinueWith':      "ឬបន្តជាមួយ",
  'auth.google':              "បន្តជាមួយ Google",
  'auth.loggingIn': "កំពុងចូលគណនី…",

  // ── Toggles ──
  'toggle.lightMode': 'ពន្លឺ',
  'toggle.darkMode':  'ងងឹត',
  'toggle.language':  'English',

// admin — nav
  'admin.nav.inventory': "ស្តុកឃ្លាំង",
  'admin.nav.dashboard': "ផ្ទាំងគ្រប់គ្រង",
  'admin.nav.orders':    "គ្រប់គ្រងបញ្ជាទិញ",
  'admin.nav.drivers':   "គ្រប់គ្រងអ្នកបើកបរ",
  'admin.nav.customers': "អតិថិជន",
  'admin.nav.assign':    "ចាត់តាំងការដឹកជញ្ជូន",
  'admin.nav.branches':  "សាខា",
  'admin.nav.tracking':  "គ្រប់គ្រងតាមដាន",
  'admin.nav.reports':   "របាយការណ៍",
  'admin.nav.profile':   "ប្រវត្តិរូប",

  // admin — page titles/subtitles
  'admin.pgTitle.branches': "គ្រប់គ្រងសាខា",
  'admin.pgTitle.tracking': "គ្រប់គ្រងការតាមដាន",
  'admin.pgSub.inventory':  "កញ្ចប់ដែលកំពុងនៅសាខានីមួយៗ",
  'admin.pgSub.dashboard':  "ទិដ្ឋភាពទូទៅប្រព័ន្ធ",
  'admin.pgSub.orders':     "មើល អនុម័ត និងគ្រប់គ្រងបញ្ជាទិញទាំងអស់",
  'admin.pgSub.drivers':    "បន្ថែម កែសម្រួល និងគ្រប់គ្រងអ្នកបើកបរ",
  'admin.pgSub.customers':  "អតិថិជនដែលបានចុះឈ្មោះទាំងអស់",
  'admin.pgSub.assign':     "ចាត់តាំងបញ្ជាទិញដែលបានអនុម័តទៅអ្នកបើកបរ",
  'admin.pgSub.branches':   "គ្រប់គ្រងសាខាដឹកជញ្ជូន",
  'admin.pgSub.tracking':   "ធ្វើបច្ចុប្បន្នភាពស្ថានភាពបញ្ជាទិញផ្ទាល់",
  'admin.pgSub.reports':    "វិភាគ និងស្ថិតិការដឹកជញ្ជូន",
  'admin.pgSub.profile':    "ព័ត៌មានគណនីអ្នកគ្រប់គ្រង",

  // admin — modal titles
  'admin.modal.order':       "បញ្ជាទិញ",
  'admin.modal.editOrder':   "កែសម្រួលបញ្ជាទិញ",
  'admin.modal.addDriver':   "បន្ថែមអ្នកបើកបរ",
  'admin.modal.editDriver':  "កែសម្រួលអ្នកបើកបរ",
  'admin.modal.addBranch':   "បន្ថែមសាខា",
  'admin.modal.editBranch':  "កែសម្រួលសាខា",
  'admin.modal.editProfile': "កែសម្រួលប្រវត្តិរូប",

  // admin — stat cards
  'admin.stat.customers':    "អតិថិជន",
  'admin.stat.drivers':      "អ្នកបើកបរ",
  'admin.stat.totalOrders':  "បញ្ជាទិញសរុប",
  'admin.stat.pending':      "កំពុងរង់ចាំ",
  'admin.stat.delivered':    "បានដឹកជញ្ជូន",
  'admin.stat.revenue':      "ចំណូល",
  'admin.stat.failed':       "បរាជ័យ",
  'admin.stat.successRate':  "អត្រាជោគជ័យ",
  'admin.stat.inWarehouse':    "នៅក្នុងឃ្លាំង",
  'admin.stat.readyToDispatch':"ត្រៀមរួចរាល់ដើម្បីបញ្ជូន",
  'admin.stat.returned':       "បានត្រឡប់មកវិញ",

  // admin — card titles
  'admin.card.ordersTrend':          "និន្នាការបញ្ជាទិញ",
  'admin.chart.orders':              "បញ្ជាទិញ",
  'admin.card.recentOrders':         "បញ្ជាទិញថ្មីៗ",
  'admin.card.allOrders':            "បញ្ជាទិញទាំងអស់",
  'admin.card.customerManagement':   "គ្រប់គ្រងអតិថិជន",
  'admin.card.assignDriverToOrder':  "ចាត់តាំងអ្នកបើកបរទៅបញ្ជាទិញ",
  'admin.card.assignedOrders':       "បញ្ជាទិញដែលបានចាត់តាំង",
  'admin.card.updateTracking':       "ធ្វើបច្ចុប្បន្នភាពស្ថានភាពតាមដាន",
  'admin.card.statusBreakdown':      "ការបំបែកតាមស្ថានភាព",
  'admin.card.byBranch':             "តាមសាខា",
  'admin.card.adminProfile':         "ប្រវត្តិរូបអ្នកគ្រប់គ្រង",

  // admin — table headers
  'admin.th.id':        "លេខសម្គាល់",
  'admin.th.orderId':   "លេខបញ្ជាទិញ",
  'admin.th.customer':  "អតិថិជន",
  'admin.th.receiver':  "អ្នកទទួល",
  'admin.th.branch':    "សាខា",
  'admin.th.driver':    "អ្នកបើកបរ",
  'admin.th.date':      "កាលបរិច្ឆេទ",
  'admin.th.name':      "ឈ្មោះ",
  'admin.th.vehicle':   "យានជំនិះ",
  'admin.th.email':     "អ៊ីមែល",
  'admin.th.phone':     "ទូរស័ព្ទ",
  'admin.th.address':   "អាសយដ្ឋាន",
  'admin.th.orders':    "បញ្ជាទិញ",
  'admin.th.updated':   "បានធ្វើបច្ចុប្បន្នភាព",
  'admin.th.tracking':  "លេខតាមដាន",
  'admin.th.current':   "បច្ចុប្បន្ន",
  'admin.th.newStatus': "ស្ថានភាពថ្មី",
  'admin.th.total':     "សរុប",
  'admin.th.rate':      "អត្រា",
  'admin.th.waiting':   "កំពុងរង់ចាំ",
  'admin.th.today':     "ថ្ងៃនេះ",

  // admin — buttons
  'admin.btn.view':          "មើល",
  'admin.btn.activate':      "ធ្វើឱ្យសកម្ម",
  'admin.btn.deactivate':    "បិទសកម្មភាព",
  'admin.btn.assignDriver':  "ចាត់តាំងអ្នកបើកបរ",

  // admin — empty states
  'admin.empty.noDrivers':      "គ្មានអ្នកបើកបរ",
  'admin.empty.noDriversYet':   "មិនទាន់មានអ្នកបើកបរនៅឡើយទេ",
  'admin.empty.noOrders':       "គ្មានបញ្ជាទិញ",
  'admin.empty.noCustomersYet': "មិនទាន់មានអតិថិជននៅឡើយទេ",
  'admin.empty.noAssignedYet':  "មិនទាន់មានបញ្ជាទិញដែលបានចាត់តាំងនៅឡើយទេ",
  'admin.empty.noBranchesYet':  "មិនទាន់មានសាខានៅឡើយទេ។ ចុច + បន្ថែមសាខា ដើម្បីបង្កើតមួយ។",
  'admin.empty.noActiveOrders': "គ្មានបញ្ជាទិញសកម្ម",
  'admin.empty.noApprovedOrders': "គ្មានបញ្ជាទិញដែលបានអនុម័តកំពុងរង់ចាំចាត់តាំង",
  'admin.empty.warehouseEmpty':   "មិនមានអ្វីនៅក្នុងឃ្លាំងឥឡូវនេះទេ",

  // admin — search placeholders
  'admin.search.orders':    "ស្វែងរកបញ្ជាទិញ…",
  'admin.search.customers': "ស្វែងរកអតិថិជន…",

  // admin — form fields
  'admin.field.receiverName': "ឈ្មោះអ្នកទទួល",
  'admin.field.packageType':  "ប្រភេទកញ្ចប់",
  'admin.field.fullName':     "ឈ្មោះពេញ",
  'admin.field.password':     "ពាក្យសម្ងាត់",
  'admin.field.branchName':   "ឈ្មោះសាខា",
  'admin.field.selectOrder':  "ជ្រើសរើសបញ្ជាទិញ",
  'admin.field.selectDriver': "ជ្រើសរើសអ្នកបើកបរ",
  'admin.field.chooseOrder':  "ជ្រើសរើសបញ្ជាទិញ…",
  'admin.field.chooseDriver': "ជ្រើសរើសអ្នកបើកបរ…",
  'admin.field.select':       "ជ្រើសរើស…",
  'admin.field.allBranches':  "គ្រប់សាខាទាំងអស់",
  'admin.field.selected':     "បានជ្រើសរើស",

  // admin — hint text (Assign Delivery page)
  'admin.hint.prefix':        "មានតែ",
  'admin.hint.approvedWord':  "ដែលបានអនុម័ត",
  'admin.hint.suffix':        "ប៉ុណ្ណោះទើបបង្ហាញនៅទីនេះ។",
  'admin.hint.bulkSuffix':    "ជ្រើសរើសច្រើនដើម្បីចាត់តាំងទាំងអស់ទៅអ្នកបើកបរតែម្នាក់ក្នុងពេលតែមួយ។",

  // admin — profile
  'admin.profile.badge': "អ្នកគ្រប់គ្រង",

  // customer — nav / page subtitles
  'customer.nav.createOrder': "បង្កើតបញ្ជាទិញ",
  'customer.nav.myOrders':    "បញ្ជាទិញរបស់ខ្ញុំ",
  'customer.nav.track':       "តាមដានកញ្ចប់",
  'customer.pgSub.welcome':      "សូមស្វាគមន៍មកវិញ",
  'customer.pgSub.createOrder':  "បំពេញព័ត៌មានលម្អិតការដឹកជញ្ជូនរបស់អ្នក",
  'customer.pgSub.myOrders':     "មើល និងតាមដានបញ្ជាទិញទាំងអស់របស់អ្នក",
  'customer.pgSub.track':        "ស្វែងរកតាមលេខតាមដាន",
  'customer.pgSub.notifications':"ការជូនដំណឹងថ្មីៗរបស់អ្នក",
  'customer.pgSub.profile':      "ព័ត៌មានគណនីរបស់អ្នក",

  // customer — stat cards
  'customer.stat.inTransit': "កំពុងដឹកជញ្ជូន",

  // customer — buttons
  'customer.btn.newOrder':    "បញ្ជាទិញថ្មី",
  'customer.btn.submitOrder': "ដាក់ស្នើបញ្ជាទិញ",
  'customer.btn.track':       "តាមដាន",

  // customer — card titles
  'customer.card.newDeliveryOrder': "បញ្ជាទិញដឹកជញ្ជូនថ្មី",
  'customer.card.myProfile':        "ប្រវត្តិរូបរបស់ខ្ញុំ",

  // customer — empty states
  'customer.empty.noOrdersYet':   "មិនទាន់មានបញ្ជាទិញនៅឡើយទេ",
  'customer.empty.noOrdersFound': "រកមិនឃើញបញ្ជាទិញ",
  'customer.empty.noNotifsYet':   "មិនទាន់មានការជូនដំណឹងនៅឡើយទេ",

  // customer — create order form
  'customer.field.senderName':     "ឈ្មោះអ្នកផ្ញើ",
  'customer.field.receiverPhone':  "លេខទូរស័ព្ទអ្នកទទួល",
  'customer.field.selectBranch':   "ជ្រើសរើសសាខា…",
  'customer.field.deliveryAddress':"អាសយដ្ឋានដឹកជញ្ជូន",
  'customer.field.weight':         "ទម្ងន់ (គីឡូក្រាម)",

  // customer — track section
  'customer.track.title':          "តាមដានកញ្ចប់របស់អ្នក",
  'customer.track.placeholder':    "បញ្ចូលលេខតាមដាន ឬលេខបញ្ជាទិញ…",
  'customer.track.notFoundPrefix': "រកមិនឃើញបញ្ជាទិញសម្រាប់",
  'customer.track.notAssigned':    "មិនទាន់ចាត់តាំង",
  'customer.track.package':        "កញ្ចប់",
  'customer.track.historyLabel':   "ប្រវត្តិតាមដាន",

  // customer — order detail (shared with admin's order-view modal)
  'customer.detail.trackingId': "លេខតាមដាន",
  'customer.detail.sender':     "អ្នកផ្ញើ",
  'customer.detail.created':    "បានបង្កើត",

  // customer — profile
  'customer.profile.badge': "អតិថិជន",
  // ទាញយកវិក្កយបត្រ
  'customer.invoice.download': "ទាញយកវិក្កយបត្រ",
  'customer.location.togglePin':    "កំណត់ទីតាំងជាក់លាក់លើផែនទី (ស្រេចចិត្ត)",
  'customer.location.hidePins':     "លាក់ផែនទី",
  'customer.location.senderPin':    "ទីតាំងទទួល​កញ្ចប់",
  'customer.location.receiverPin':  "ទីតាំងប្រគល់ជូន",
  'customer.location.useMyLocation':"ប្រើទីតាំងបច្ចុប្បន្នរបស់ខ្ញុំ",

  // driver — nav / page subtitles
  'driver.nav.history':      "ប្រវត្តិការដឹកជញ្ជូន",
  'driver.pgSub.dashboard':  "ទិដ្ឋភាពទូទៅការដឹកជញ្ជូនរបស់អ្នក",
  'driver.pgSub.deliveries': "ការដឹកជញ្ជូនសកម្មដែលបានចាត់តាំងឱ្យអ្នក",
  'driver.pgSub.history':    "ការដឹកជញ្ជូនដែលអ្នកបានបញ្ចប់",
  'driver.pgSub.profile':    "ប្រវត្តិរូបអ្នកបើកបររបស់អ្នក",

  // driver — stat cards
  'driver.stat.totalAssigned': "សរុបបានចាត់តាំង",
  'driver.stat.completed':     "បានបញ្ចប់",
  'driver.stat.active':        "សកម្ម",

  // driver — card titles
  'driver.card.activeDeliveries':   "ការដឹកជញ្ជូនសកម្ម",
  'driver.card.myActiveDeliveries': "ការដឹកជញ្ជូនសកម្មរបស់ខ្ញុំ",
  'driver.card.driverProfile':      "ប្រវត្តិរូបអ្នកបើកបរ",

  // driver — table headers
  'driver.th.action':      "សកម្មភាព",
  'driver.th.deliveredAt': "ដឹកជញ្ជូនកាលពី",

  // driver — buttons
  'driver.btn.refresh':      "ផ្ទុកឡើងវិញ",
  'driver.btn.updateStatus': "ធ្វើបច្ចុប្បន្នភាពស្ថានភាព",
  'driver.btn.saveChanges':  "រក្សាទុកការផ្លាស់ប្តូរ",

  // driver — empty states
  'driver.empty.noActiveDeliveries': "គ្មានការដឹកជញ្ជូនសកម្ម",
  'driver.empty.noCompletedYet':     "មិនទាន់មានការដឹកជញ្ជូនបញ្ចប់នៅឡើយទេ",

  // driver — update-status modal
  'driver.modal.updatePrefix':  "ធ្វើបច្ចុប្បន្នភាព",
  'driver.modal.currentStatus': "ស្ថានភាពបច្ចុប្បន្ន",
  'driver.modal.deliveryInfo':  "ព័ត៌មានការដឹកជញ្ជូន",
  'driver.field.note':          "កំណត់ចំណាំ (ស្រេចចិត្ត)",
  'driver.field.notePlaceholder': "ឧ. អតិថិជនមិននៅផ្ទះ ទុកនៅច្រកទ្វារ…",

  // driver — profile
  'driver.profile.badge':     "អ្នកបើកបរ",
  'driver.field.vehicleType': "ប្រភេទយានជំនិះ",
  'driver.field.selectDash':  "— ជ្រើសរើស —",
  'driver.mini.inProgress':   "កំពុងដំណើរការ",

  // driver — delivery history badge
  'driver.history.deliveredSuffix': "បានដឹកជញ្ជូន",
  // driver — ផ្លូវដែលបានស្នើ (ការប៉ាន់ស្មានបន្ទាត់ត្រង់ ដោយបែងចែកតាមសាខាទិសដៅ)
  'driver.btn.suggestedRoute':     "ផ្លូវដែលបានស្នើ",
  'driver.route.estimatedTotal':   "ចម្ងាយផ្លូវប៉ាន់ស្មាន",
  'driver.route.leg':              "ចម្ងាយ",
  'driver.route.sameStop':         "ចំណតដដែល",
  'driver.route.straightLineNote': "ការប៉ាន់ស្មានបន្ទាត់ត្រង់ បែងចែកតាមសាខាទិសដៅ — មិនមែនផ្លូវពិតតាមថ្នល់ទេ។",
  'driver.route.noCoordsNote':     "សាខាមួយចំនួនមិនទាន់មានទីតាំង ដូច្នេះមិនអាចរៀបតាមចម្ងាយបានទេឥឡូវនេះ។",

  // ការទូទាត់ (កត់ត្រាតែប៉ុណ្ណោះ — មិនគិតលុយពិតទេ)
  'customer.payment.title':         "វិធីទូទាត់",
  'customer.payment.cod':           "បង់ប្រាក់ពេលទទួល",
  'customer.payment.codDesc':       "បង់ប្រាក់ដល់អ្នកបើកបរនៅពេលកញ្ចប់មកដល់",
  'customer.payment.qr':            "ស្កេន QR ដើម្បីបង់ប្រាក់",
  'customer.payment.qrDesc':        "បង់តាមកម្មវិធីធនាគារ/Bakong",
  'customer.payment.qrInstructions':"ស្កេនកូដនេះជាមួយកម្មវិធីធនាគាររបស់អ្នកដើម្បីផ្ទេរប្រាក់ថ្លៃដឹកជញ្ជូន រួចរក្សាទុកបង្កាន់ដៃរបស់អ្នកសម្រាប់ជាឯកសារយោង។",
  'customer.payment.card':          "បង់ដោយកាត",
  'customer.payment.cardDesc':      "រៀបចំជាមួយក្រុមការងាររបស់យើង",
  'customer.payment.cardNote':      "ការបង់ប្រាក់តាមកាតនឹងត្រូវរៀបចំដោយផ្ទាល់ជាមួយក្រុមការងាររបស់យើងនៅពេលបញ្ជាទិញរបស់អ្នកត្រូវបានបញ្ជាក់។ យើងមិនប្រមូលព័ត៌មានកាតតាមអនឡាញទេ។",

  'admin.th.payment':          "ការទូទាត់",
  'admin.payment.paid':        "បានបង់ប្រាក់",
  'admin.payment.unpaid':      "មិនទាន់បង់ប្រាក់",
  'admin.payment.togglePaid':  "ចុចដើម្បីប្តូរស្ថានភាពបានបង់/មិនទាន់បង់",

  // តម្លៃ (ទម្ងន់ + ចម្ងាយរវាងសាខាអ្នកផ្ញើ/អ្នកទទួល)
  'customer.field.senderBranch':   "សាខាអ្នកផ្ញើ",
  'customer.field.receiverBranch': "សាខាអ្នកទទួល",
  'customer.price.estimated':          "តម្លៃប៉ាន់ស្មាន",
  'customer.price.total':              "តម្លៃ",
  'customer.price.distanceUnavailable':"អត្រាទំហំថេរ — មិនទាន់កំណត់ទីតាំងសាខាទេ",

  'customer.payment.codAmountPrefix':  "ត្រៀមលុយ",
  'customer.payment.codAmountSuffix':  "សម្រាប់អ្នកបើកបរនៅពេលមកដល់។",
  'customer.payment.qrAmountPrefix':   "ចំនួនទឹកប្រាក់ត្រូវផ្ទេរ៖",
  'customer.payment.cardAmountPrefix': "ចំនួនទឹកប្រាក់ត្រូវបង់៖",

  // admin — កូអរដោនេសាខា (ប្រើសម្រាប់គណនាតម្លៃតាមចម្ងាយ)
  'admin.field.latitude':      "រយៈទទឹង",
  'admin.field.longitude':     "រយៈបណ្តោយ",
  'admin.field.coordsSet':     "បានកំណត់ទីតាំង",
  'admin.field.coordsMissing': "មិនទាន់កំណត់ទីតាំង — តម្លៃតាមចម្ងាយនឹងមិនអនុវត្តទេ",
  'admin.hint.coordsOptional': "មិនចាំបាច់ទេ ប៉ុន្តែត្រូវការសម្រាប់គណនាតម្លៃតាមចម្ងាយរវាងសាខានេះ និងសាខាផ្សេងទៀត។ ទុកចន្លោះទទេដើម្បីប្រើអត្រាទំហំថេរសម្រាប់បញ្ជាទិញពាក់ព័ន្ធនឹងសាខានេះ។",

  // ប្រភេទសេវាដឹកជញ្ជូន (ដឹកផ្ទាល់ ទល់នឹង ដាក់នៅសាខាដើម្បីរួមផ្សំ)
  'customer.service.title':             "ប្រភេទដឹកជញ្ជូន",
  'customer.service.direct':            "ដឹកជញ្ជូនផ្ទាល់",
  'customer.service.directDesc':        "អ្នកបើកបរទទួល និងដឹកជញ្ជូនផ្ទាល់ដល់អ្នកទទួល — លឿនជាង តម្លៃខ្ពស់ជាង",
  'customer.service.consolidated':      "ដាក់នៅសាខា",
  'customer.service.consolidatedDesc':  "នាំកញ្ចប់មកសាខាដោយខ្លួនឯង — តម្លៃថោកជាង រួមផ្សំជាមួយបញ្ជាទិញផ្សេងទៀត",
  'customer.service.consolidatedNote':  "អ្នកនឹងត្រូវនាំកញ្ចប់មកដាក់នៅសាខាអ្នកផ្ញើដែលអ្នកបានជ្រើសរើស។ យើងនឹងរួមផ្សំវាជាមួយបញ្ជាទិញផ្សេងទៀតដែលទៅទិសដៅដូចគ្នា។",

  'admin.field.allServiceTypes': "គ្រប់ប្រភេទដឹកជញ្ជូន",

  // employee — nav / page subtitles
  'employee.nav.incoming':    "កញ្ចប់កំពុងមកដល់",
  'employee.nav.pickup':      "ត្រៀមរួចរាល់សម្រាប់ទទួល",
  'employee.nav.lookup':      "ស្វែងរកនៅកន្លែងទទួលភ្ញៀវ",
  'employee.nav.create':      "បង្កើតបញ្ជាទិញនៅមុខតុ",
  'employee.pgSub.dashboard': "ទិដ្ឋភាពទូទៅសាខា",
  'employee.pgSub.incoming':  "កញ្ចប់កំពុងធ្វើដំណើរមកសាខារបស់អ្នក",
  'employee.pgSub.pickup':    "បានមកដល់ — កំពុងរង់ចាំអតិថិជនមកយក",
  'employee.pgSub.lookup':    "ស្វែងរកកញ្ចប់របស់អតិថិជន",
  'employee.pgSub.create':    "បញ្ចូលបញ្ជាទិញសម្រាប់អតិថិជននៅមុខតុ",
  'employee.pgSub.profile':   "គណនីបុគ្គលិករបស់អ្នក",

  // employee — dashboard stats
  'employee.stat.incoming':     "កំពុងមកដល់",
  'employee.stat.readyPickup':  "ត្រៀមរួចរាល់សម្រាប់ទទួល",
  'employee.stat.handedToday':  "បានប្រគល់ថ្ងៃនេះ",
  'employee.stat.createdToday': "បញ្ជាទិញបានបង្កើតថ្ងៃនេះ",

  // employee — card titles
  'employee.card.incoming':    "កញ្ចប់កំពុងមកដល់",
  'employee.card.readyPickup': "ត្រៀមរួចរាល់សម្រាប់ទទួល",
  'employee.card.lookup':      "ស្វែងរកកញ្ចប់",
  'employee.card.createOrder': "បញ្ជាទិញថ្មីនៅមុខតុ",
  'employee.card.profile':     "ប្រវត្តិរូបបុគ្គលិក",

  // employee — mark arrived
  'employee.btn.markArrived':     "កត់ត្រាថាបានមកដល់",
  'employee.btn.confirmArrived':  "បញ្ជាក់ការមកដល់",
  'employee.modal.markArrived':   "កត់ត្រាថាបានមកដល់",
  'employee.hint.markArrived':    "នេះនឹងជូនដំណឹងអតិថិជនថាកញ្ចប់របស់ពួកគេត្រៀមរួចរាល់សម្រាប់មកយកនៅសាខានេះ។",
  'admin.field.locationTag':            "ធ្នើ / ទីតាំង",
  'admin.field.locationTagPlaceholder': "ឧ. ធ្នើ A3",

  // employee — handover
  'employee.btn.handOver':        "ប្រគល់ជូន",
  'employee.btn.confirmHandover': "បញ្ជាក់ការប្រគល់ជូន",
  'employee.modal.handover':      "ប្រគល់ជូនអតិថិជន",
  'employee.field.collectedCod':  "បានទទួលប្រាក់ —",
  'employee.field.handoverNotePlaceholder': "ឧ. ទទួលដោយអ្នកទទួលដោយផ្ទាល់",

  // employee — lookup
  'employee.lookup.placeholder': "ស្វែងរកតាមលេខបញ្ជាទិញ លេខតាមដាន ឈ្មោះ ឬលេខទូរស័ព្ទ…",
  'employee.lookup.prompt':      "ចាប់ផ្តើមវាយអក្សរដើម្បីស្វែងរកបញ្ជាទិញរបស់សាខានេះ",
  'employee.lookup.noResults':   "រកមិនឃើញបញ្ជាទិញដែលត្រូវគ្នា",

  // employee — create walk-in order
  'employee.field.customer':        "អតិថិជន",
  'employee.field.searchExisting':  "ស្វែងរកគណនីមានស្រាប់",
  'employee.field.guestEntry':      "ភ្ញៀវ (គ្មានគណនី)",
  'employee.field.searchPlaceholder': "ស្វែងរកតាមឈ្មោះ ឬលេខទូរស័ព្ទ…",
  'employee.field.guestName':       "ឈ្មោះអតិថិជន",
  'employee.field.guestPhone':      "លេខទូរស័ព្ទអតិថិជន",
  'employee.field.collectedNow':    "បានទទួលប្រាក់ឥឡូវនេះ",
  'employee.btn.createOrder':       "បង្កើតបញ្ជាទិញ",

  // employee — empty states
  'employee.empty.noneIncoming': "គ្មានកញ្ចប់កំពុងមកសាខានេះទេឥឡូវនេះ",
  'employee.empty.noneReady':    "គ្មានអ្វីកំពុងរង់ចាំការទទួលឥឡូវនេះទេ",

  // employee — profile
  'employee.profile.badge': "បុគ្គលិកសាខា",

  // admin — employee management
  'admin.nav.employees':        "បុគ្គលិកសាខា",
  'admin.pgSub.employees':      "គ្រប់គ្រងគណនីបុគ្គលិកសម្រាប់សាខានីមួយៗ",
  'admin.modal.addEmployee':    "បន្ថែមបុគ្គលិក",
  'admin.modal.editEmployee':   "កែសម្រួលបុគ្គលិក",
  'admin.empty.noEmployeesYet': "មិនទាន់មានបុគ្គលិកសាខានៅឡើយទេ",
};