import type { Dict } from './en'
// Assamese UI dictionary. Core screens are translated for this
// prototype pass; flagged in ARCHITECTURE.md as needing fluent-speaker
// review before any real deployment. Verified personal names/facts are
// never auto-translated.
export const as: Dict = {
  appName: 'YAADRI',
  tagline: 'আপোনাৰ ব্যক্তিগত স্মৃতি সহায়ক (কাল্পনিক ডেমো)',
  nav: { home: 'গৃহ', capsules: 'স্মৃতি কেপ্সুল', teach: 'YAADRI ক শিকাওক', graph: 'স্মৃতি গ্ৰাফ', games: 'খেল', reminders: 'সোঁৱৰণী', dashboard: 'ডেশ্ব’ৰ্ড', copilot: 'কোপাইলট' },
  role: { caregiver: 'যত্নকাৰী', patient: 'ৰোগী', switch: 'ভূমিকা সলনি কৰক (কেৱল ডেমো, প্ৰমাণীকৰণ নহয়)' },
  common: { save: 'ছেভ কৰক', cancel: 'বাতিল কৰক', delete: 'মচক', edit: 'সম্পাদনা কৰক', verify: 'সত্যাপন কৰক', archive: 'আৰ্কাইভ', loading: 'লোড হৈ আছে…', empty: 'ইয়াত এতিয়ালৈকে একো নাই।', error: 'কিবা ভুল হ\'ল।', retry: 'পুনৰ চেষ্টা কৰক', confirm: 'নিশ্চিত কৰক', reject: 'নাকচ কৰক', correct: 'শুদ্ধ কৰক', back: 'পিছলৈ', restart: 'পুনৰাম্ভ কৰক', exit: 'বাহিৰ ওলাওক', start: 'আৰম্ভ কৰক', continueLabel: 'অব্যাহত ৰাখক' },
  capsules: {
    title: 'স্মৃতি কেপ্সুল', newCapsule: 'নতুন কেপ্সুল', storyLabel: 'কাহিনী', photoLabel: 'ফটো', audioLabel: 'কণ্ঠধ্বনি ৰেকৰ্ডিং (বৈকল্পিক)',
    unverifiedNotice: 'খচৰা — এতিয়াও ৰোগীক দেখুওৱা বা খেলত ব্যৱহাৰ কৰা হোৱা নাই।', verifiedNotice: 'সত্যাপিত',
    uploadAudioFallback: 'অডিঅ\' ফাইল আপল\'ড কৰক (উপলব্ধ হ\'লে মাইক্ৰ\'ফ\'ন ৰেকৰ্ডিং ব্যৱহাৰ কৰা হয়)',
    micPermissionDenied: 'মাইক্ৰ\'ফ\'নৰ অনুমতি নাকচ কৰা হৈছে। আপুনি তথাপি এটা অডিঅ\' ফাইল আপল\'ড কৰিব পাৰে।',
  },
  teach: {
    title: 'YAADRI ক মোৰ বিষয়ে শিকাওক', pasteStory: 'এটা পাৰিয়াল কাহিনী পেষ্ট কৰক', extract: 'উলিয়াওক', reviewTitle: 'পৰামৰ্শ পৰ্যালোচনা কৰক',
    ambiguous: 'স্পষ্টকৈ বুজা নাযায় — অনুগ্ৰহ কৰি হাতেৰে সুমুৱাওক।', nothingAutoVerified: 'একো স্বয়ংক্ৰিয়ভাৱে সত্যাপিত নহয়।',
  },
  graph: { title: 'জীৱন্ত স্মৃতি গ্ৰাফ', listView: 'তালিকা দৃশ্য', graphView: 'গ্ৰাফ দৃশ্য', selectPrompt: 'সম্পৰ্কিত সত্যাপিত স্মৃতি চাবলৈ এজন ব্যক্তি, স্থান, বা ঘটনা বাছক।' },
  games: {
    faceName: { title: 'মুখ-নাম স্মৰণ', prompt: 'এওঁ কোন?' },
    connect: { title: 'স্মৃতি সংযোগ কৰক', prompt: 'দুটা সম্পৰ্কিত কাৰ্ড মিলাবলৈ স্পৰ্শ কৰক।' },
    puzzle: { title: 'স্মৃতি পাজল', prompt: 'এটা টুকুৰা স্পৰ্শ কৰক, তাৰ পিছত ই ক\'ত যাব লাগে সেয়া স্পৰ্শ কৰক।' },
    needMoreContent: 'এই খেল খেলিবলৈ পৰ্যাপ্ত সত্যাপিত স্মৃতি নাই। প্ৰথমে অধিক কেপ্সুল যোগ আৰু সত্যাপন কৰক।',
  },
  rescue: {
    level1: 'প্ৰসংগ ইংগিত', level2: 'সম্পৰ্ক ইংগিত', level3: 'সম্পৰ্কিত স্মৃতি', level4: 'চিনাকি কণ্ঠস্বৰ', level5: 'মৃদু প্ৰকাশ',
    unavailable: 'এই স্মৃতিৰ বাবে এতিয়াও উপলব্ধ নাই।', tryAgain: 'ঠিক আছে — আহক এটা ইংগিত চেষ্টা কৰোঁ।', needHelp: 'মোক সহায় লাগে',
  },
  reminders: { title: 'সোঁৱৰণী', addReminder: 'সোঁৱৰণী যোগ কৰক', today: 'আজিৰ সোঁৱৰণী', noneToday: 'আজি কোনো সোঁৱৰণী নাই।', snooze: 'পিছলৈ ৰাখক', markDone: 'সম্পূৰ্ণ চিহ্নিত কৰক', offlineNote: 'সোঁৱৰণীবোৰ অফলাইনত ছেভ কৰা তথ্যৰ পৰা কাম কৰে। ব্ৰাউজাৰ বন্ধ থাকিলে পটভূমি এলাৰ্মৰ নিশ্চয়তা নাই।' },
  dashboard: { title: 'যত্নকাৰী ডেশ্ব\'ৰ্ড', recentSessions: 'শেহতীয়া ছেছন', completionRate: 'সম্পূৰ্ণতা', cueUse: 'ইংগিত ব্যৱহাৰ', neededMoreHelp: 'অধিক সহায়ৰ প্ৰয়োজন হৈছিল', filterDays: 'সময় সীমা', noData: 'এই সময় সীমাৰ বাবে এতিয়ালৈকে কোনো কাৰ্যকলাপ লিপিবদ্ধ হোৱা নাই।' },
  copilot: { title: 'কোপাইলট', placeholder: 'যেনে "এই সপ্তাহত শান্তি কেনেকুৱা আছিল?"', ruleBasedTag: 'নিয়ম-আধাৰিত সাৰাংশ', aiTag: 'বৈকল্পিক AI-শব্দিত সাৰাংশ', unsupported: 'মই সাপ্তাহিক কাৰ্যকলাপ, ইংগিতৰ ব্যৱহাৰ, আৰু সম্পূৰ্ণ হোৱা কাৰ্যকলাপৰ বিষয়ে প্ৰশ্নৰ উত্তৰ দিব পাৰোঁ। সেইটো মিলাব নোৱাৰিলোঁ — পৰামৰ্শিত প্ৰশ্ন এটা চেষ্টা কৰক।' },
  privacy: { exportData: 'মোৰ তথ্য ৰপ্তানি কৰক', deleteData: 'স্থানীয় তথ্য মচক', resetDemo: 'স্থানীয় ডেমো তথ্য ৰিছেট কৰক', consentNote: 'এইটো এটা কাল্পনিক স্থানীয় ডেমো। তথ্য কেৱল এই ব্ৰাউজাৰত সংৰক্ষিত হয়।' },
}
