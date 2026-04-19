import { NextResponse } from 'next/server';
import { getCached, setCache } from '@/lib/cache';

const HADITH_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// Daily hadith collection from Al-Hadith API alternatives
const DAILY_HADITHS = [
  {
    textAr: "إنَّما الأعمالُ بالنِّيَّاتِ، وإنَّما لكُلِّ امرئٍ ما نَوى",
    textEn: "Actions are judged by intentions, and everyone will be rewarded according to what they intended.",
    narrator: "عمر بن الخطاب رضي الله عنه",
    source: "صحيح البخاري",
    grade: "صحيح",
  },
  {
    textAr: "مَن كَانَ يُؤْمِنُ بِاللَّهِ واليَومِ الآخِرِ فَلْيَقُلْ خَيْرًا أوْ لِيَصْمُتْ",
    textEn: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    narrator: "أبو هريرة رضي الله عنه",
    source: "صحيح البخاري ومسلم",
    grade: "صحيح",
  },
  {
    textAr: "لا يُؤْمِنُ أحَدُكُمْ حتَّى يُحِبَّ لأخِيهِ ما يُحِبُّ لِنَفْسِهِ",
    textEn: "None of you truly believes until he loves for his brother what he loves for himself.",
    narrator: "أنس بن مالك رضي الله عنه",
    source: "صحيح البخاري ومسلم",
    grade: "صحيح",
  },
  {
    textAr: "الطُّهُورُ شَطْرُ الإيمانِ، والحَمْدُ لِلَّهِ تَمْلأُ المِيزانَ، وسُبحانَ اللَّهِ والحَمْدُ لِلَّهِ تَمْلآنِ ما بيْنَ السَّماوَيْنِ والأرْضِ",
    textEn: "Purity is half of faith, and Alhamdulillah fills the scale, and SubhanAllah and Alhamdulillah fill what is between the heavens and the earth.",
    narrator: "أبو هريرة رضي الله عنه",
    source: "صحيح مسلم",
    grade: "صحيح",
  },
  {
    textAr: "الإسْلامُ أنْ تَشْهَدَ أنْ لا إلَهَ إلَّا اللَّهُ وأنَّ مُحَمَّدًا رَسولُ اللَّهِ، وتُقيمَ الصَّلاةَ، وتُؤْتِيَ الزَّكاةَ، وتَصُومَ رَمَضانَ، وتَحُجَّ البيتَ",
    textEn: "Islam is to testify that there is no god but Allah and Muhammad is His messenger, to establish prayer, to pay zakat, to fast Ramadan, and to perform Hajj if able.",
    narrator: "عبدالله بن عمر رضي الله عنهما",
    source: "صحيح مسلم",
    grade: "صحيح",
  },
  {
    textAr: "خَيْرُكُمْ مَن تَعَلَّمَ القُرْآنَ وعَلَّمَهُ",
    textEn: "The best among you are those who learn the Quran and teach it.",
    narrator: "عثمان بن عفان رضي الله عنه",
    source: "صحيح البخاري",
    grade: "صحيح",
  },
  {
    textAr: "الدُّعاءُ هو العِبادَةُ",
    textEn: "Supplication (dua) is the essence of worship.",
    narrator: "النعمان بن بشير رضي الله عنه",
    source: "صحيح الترمذي",
    grade: "صحيح",
  },
  {
    textAr: "مَن سَلَكَ طَرِيقًا يَلْتَمِسُ فيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إلى الجَنَّةِ",
    textEn: "Whoever travels a path seeking knowledge, Allah will make easy for him a path to Paradise.",
    narrator: "أبو هريرة رضي الله عنه",
    source: "صحيح مسلم",
    grade: "صحيح",
  },
  {
    textAr: "لا تَحاسَدُوا، ولا تَناجَشُوا، ولا تَباغَضُوا، ولا تَدابَرُوا، وكُونُوا عِبادَ اللَّهِ إخوانًا",
    textEn: "Do not envy one another, do not hate one another, do not turn your backs on one another. Rather, be servants of Allah as brothers.",
    narrator: "أبو هريرة رضي الله عنه",
    source: "صحيح البخاري ومسلم",
    grade: "صحيح",
  },
  {
    textAr: "المُسْلِمُ مَن سَلِمَ المُسْلِمُونَ مِن لِسانِهِ ويَدِهِ",
    textEn: "A Muslim is the one from whose tongue and hands other Muslims are safe.",
    narrator: "عبدالله بن عمرو رضي الله عنهما",
    source: "صحيح البخاري",
    grade: "صحيح",
  },
  {
    textAr: "إنَّ اللَّهَ لا يَنْظُرُ إلى صُوَرِكُمْ وأَمْوالِكُمْ، ولَكِنْ يَنْظُرُ إلى قُلُوبِكُمْ وأَعْمالِكُمْ",
    textEn: "Indeed, Allah does not look at your appearances or your wealth, but rather He looks at your hearts and your deeds.",
    narrator: "أبو هريرة رضي الله عنه",
    source: "صحيح مسلم",
    grade: "صحيح",
  },
  {
    textAr: "قُلْ آمَنْتُ باللَّهِ ثُمَّ اسْتَقِمْ",
    textEn: "Say: I believe in Allah, then be steadfast.",
    narrator: "سفيان بن عبدالله الثقفي رضي الله عنه",
    source: "صحيح مسلم",
    grade: "صحيح",
  },
  {
    textAr: "الكَلِماتُ الطَّيِّباتِ صَدَقَةٌ",
    textEn: "Good words are a form of charity.",
    narrator: "أبو هريرة رضي الله عنه",
    source: "صحيح البخاري ومسلم",
    grade: "صحيح",
  },
  {
    textAr: "اتَّقِ اللَّهَ حَيْثُما كُنْتَ، وأَتْبِعِ السَّيِّئَةَ الحَسَنَةَ تَمْحُها، وخالِقِ النَّاسَ بخُلُقٍ حَسَنٍ",
    textEn: "Fear Allah wherever you are, follow a bad deed with a good deed and it will wipe it out, and treat people with good character.",
    narrator: "أبو ذر الغفاري رضي الله عنه",
    source: "صحيح الترمذي",
    grade: "حسن صحيح",
  },
  {
    textAr: "مَن صَلَّى عَلَيَّ صَلاةً واحدةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا",
    textEn: "Whoever sends one blessing upon me, Allah will send ten blessings upon him.",
    narrator: "أبو هريرة رضي الله عنه",
    source: "صحيح مسلم",
    grade: "صحيح",
  },
  {
    textAr: "Acquaint yourselves with Allah in times of prosperity, He will know you in times of adversity",
    textEn: "تعرَّف إلى الله في الرخاء يعرفك في الشدة",
    narrator: "ابن عباس رضي الله عنهما",
    source: "المستدرك",
    grade: "حسن",
  },
  {
    textAr: "إِنَّ اللَّهَ كَتَبَ الإحْسانَ على كُلِّ شَيْءٍ",
    textEn: "Indeed, Allah has prescribed excellence (ihsan) in everything.",
    narrator: "شريح بن هانئ رضي الله عنه",
    source: "صحيح مسلم",
    grade: "صحيح",
  },
  {
    textAr: "المُؤْمِنُ القَوِيُّ خَيْرٌ وأَحَبُّ إلى اللَّهِ مِنَ المُؤْمِنِ الضَّعِيفِ وفي كُلٍّ خَيْرٌ",
    textEn: "The strong believer is better and more beloved to Allah than the weak believer, while there is good in both.",
    narrator: "أبو هريرة رضي الله عنه",
    source: "صحيح مسلم",
    grade: "صحيح",
  },
  {
    textAr: "إنَّ اللَّهَ معَ الصَّابِرِينَ",
    textEn: "Indeed, Allah is with the patient.",
    narrator: "صهيب بن سنان رضي الله عنه",
    source: "صحيح البخاري ومسلم",
    grade: "صحيح",
  },
  {
    textAr: "مَن صامَ رَمَضانَ إيمانًا واحْتِسابًا غُفِرَ لَهُ ما تَقَدَّمَ مِن ذَنْبِهِ",
    textEn: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.",
    narrator: "أبو هريرة رضي الله عنه",
    source: "صحيح البخاري ومسلم",
    grade: "صحيح",
  },
  {
    textAr: "مَن جَدَّدَ تَوبَةً غُفِرَ لَهُ",
    textEn: "Whoever renews his repentance, his sins will be forgiven.",
    narrator: "الحسن البصري رحمه الله",
    source: "صحيح الجامع",
    grade: "صحيح",
  },
];

// Hadith collection data
const HADITH_COLLECTIONS = [
  {
    id: 1,
    nameAr: "صحيح البخاري",
    nameEn: "Sahih Al-Bukhari",
    hadithsCount: 7285,
    description: "أصح كتب الحديث النبوي",
  },
  {
    id: 2,
    nameAr: "صحيح مسلم",
    nameEn: "Sahih Muslim",
    hadithsCount: 5362,
    description: "أحد الصحيحين",
  },
  {
    id: 3,
    nameAr: "سنن الترمذي",
    nameEn: "Sunan At-Tirmidhi",
    hadithsCount: 3956,
    description: "من كتب السنن المشهورة",
  },
  {
    id: 4,
    nameAr: "سنن أبي داود",
    nameEn: "Sunan Abi Dawud",
    hadithsCount: 5274,
    description: "من أمهات كتب السنن",
  },
  {
    id: 5,
    nameAr: "سنن النسائي",
    nameEn: "Sunan An-Nasa'i",
    hadithsCount: 5758,
    description: "المجتبى من السنن",
  },
  {
    id: 6,
    nameAr: "سنن ابن ماجه",
    nameEn: "Sunan Ibn Majah",
    hadithsCount: 4341,
    description: "أحد كتب السنن الستة",
  },
];

export async function GET() {
  try {
    // Get daily hadith based on day of year (rotates daily)
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hadithIndex = dayOfYear % DAILY_HADITHS.length;
    const dailyHadith = DAILY_HADITHS[hadithIndex];

    return NextResponse.json({
      daily: dailyHadith,
      collections: HADITH_COLLECTIONS,
      totalHadiths: DAILY_HADITHS.length,
    });
  } catch (error) {
    console.error('Hadith API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hadith data.' },
      { status: 500 }
    );
  }
}
