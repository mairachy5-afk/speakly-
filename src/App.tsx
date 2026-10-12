import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AudioContext: any;
    webkitAudioContext: any;
  }
}

// SNR Historical Trend Line Chart Component using Recharts
function SnrTrendChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mu)', fontSize: '13px' }}>
        এখনো কোনো হিস্টোরিক্যাল SNR টেস্ট নেই। ওপরে "Background Noise Test শুরু করুন" চেপে টেস্ট করুন।
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 210 }}>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={data} margin={{ top: 12, right: 24, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 40]} stroke="#94A3B8" fontSize={11} tickLine={false} unit="dB" />
          <Tooltip
            contentStyle={{
              background: '#111A30',
              borderColor: 'rgba(148, 163, 184, 0.25)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(val: any) => [`+${val} dB`, 'Signal-to-Noise Ratio']}
          />
          <ReferenceLine
            y={20}
            stroke="#00C98D"
            strokeDasharray="4 4"
            label={{ value: 'Excellent (20dB)', fill: '#00C98D', fontSize: 10, position: 'insideTopRight' }}
          />
          <ReferenceLine
            y={12}
            stroke="#F59E0B"
            strokeDasharray="4 4"
            label={{ value: 'Good (12dB)', fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }}
          />
          <Line
            type="monotone"
            dataKey="snr"
            stroke="#00D9A0"
            strokeWidth={3}
            dot={{ fill: '#00C98D', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#7C5CFF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Toast Notification Utility (Non-blocking, iframe-safe)
    const toast = (msg: string, duration = 2400) => {
      const el = document.getElementById('toast');
      if (el) {
        el.textContent = msg;
        el.style.display = 'block';
        clearTimeout((el as any)._timer);
        (el as any)._timer = setTimeout(() => {
          el.style.display = 'none';
        }, duration);
      }
    };

    // Shared AudioContext Singleton
    let sharedAudioCtx: AudioContext | null = null;
    const getAudioContext = () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
        sharedAudioCtx = new AC();
      }
      if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume().catch(() => {});
      }
      return sharedAudioCtx;
    };

    // Safely speak text using SpeechSynthesis
    const say = (text: string, rate = 0.9) => {
      if (!window.speechSynthesis) return;
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = rate;
        speechSynthesis.speak(u);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    };

    const esc = (x: any) =>
      String(x == null ? '' : x)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const ea = (x: any) =>
      String(x == null ? '' : x)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;');

    const LOGO = (s = 30) =>
      `<svg width="${s}" height="${s}" viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="14" fill="#0D1428"/><rect x="9" y="19" width="6" height="10" rx="3" fill="#00D9A0"/><rect x="18" y="11" width="6" height="26" rx="3" fill="#00C98D"/><rect x="27" y="15" width="6" height="18" rx="3" fill="#7C5CFF"/><rect x="36" y="21" width="5" height="6" rx="2.5" fill="#7C5CFF"/></svg>`;

    // Localization strings
    const D: Record<string, Record<string, string>> = {
      en: {
        home: 'Home', speak: 'Speak', pron: 'Pronunciation Lab', vocab: 'Vocabulary', stories: 'Stories',
        prog: 'Progress', me: 'Profile', learn: 'Learn', practice: 'Practice', track: 'Track',
        hi: 'Good Evening', sub: 'Ready to improve your English today?', cont: 'Continue Learning',
        goal: "Today's Goal", start: 'Start Speaking', topics: 'Choose a topic', tap: 'Tap to speak',
        stop: 'Stop', comm: 'Communication', coach: 'AI Coach', owner: 'Owner Panel', live: 'Live Talk',
        levels: 'Levels', mist: 'My Mistakes', shadow: 'Shadowing', ptips: 'Pronunciation Tips',
        dquiz: 'Daily Quiz', grammar: 'Grammar Library', meeting: 'Client Meeting AI', pro: 'Professional',
        ielts: 'IELTS', sim: 'Meeting Simulator', hesit: 'Confidence Training', toolkit: 'Communication Toolkit',
        ird: 'Reading', ilis: 'Listening', iwr: 'Writing', isp: 'Speaking', ivoc: 'IELTS Vocabulary'
      },
      bn: {
        home: 'হোম', speak: 'বলুন', pron: 'উচ্চারণ ল্যাব', vocab: 'শব্দভান্ডার', stories: 'গল্প',
        prog: 'অগ্রগতি', me: 'প্রোফাইল', learn: 'শিখুন', practice: 'অনুশীলন', track: 'ট্র্যাক',
        hi: 'শুভ সন্ধ্যা', sub: 'আজ ইংরেজি আরও ভালো করতে প্রস্তুত?', cont: 'শেখা চালিয়ে যান',
        goal: 'আজকের লক্ষ্য', start: 'বলা শুরু করুন', topics: 'বিষয় বেছে নিন', tap: 'বলতে ট্যাপ করুন',
        stop: 'থামান', comm: 'যোগাযোগ', coach: 'এআই কোচ', owner: 'ওনার প্যানেল', live: 'লাইভ টক',
        levels: 'লেভেল', mist: 'আমার ভুল', shadow: 'শ্যাডোইং', ptips: 'উচ্চারণ টিপস',
        dquiz: 'দৈনিক কুইজ', grammar: 'গ্রামার লাইব্রেরি', meeting: 'ক্লায়েন্ট মিটিং এআই', pro: 'পেশাদার',
        ielts: 'আইইএলটিএস', sim: 'মিটিং সিমুলেটর', hesit: 'আত্মবিশ্বাস প্রশিক্ষণ', toolkit: 'কমিউনিকেশন টুলকিট',
        ird: 'রিডিং', ilis: 'লিসনিং', iwr: 'রাইটিং', isp: 'স্পিকিং', ivoc: 'আইইএলটিএস শব্দ'
      }
    };

    // State
    let S: any = {
      lang: 'en',
      view: 'land',
      name: 'Learner',
      goal: 5,
      budget: 15,
      level: 0,
      lvl: 0,
      gl: 'Speaking',
      xp: 0,
      days: {},
      saved: {},
      box: {},
      done: {},
      sess: 0,
      scores: [],
      theme: 'auto',
      mb: [],
      tot: {},
      ach: {},
      mdone: {},
      hist: {},
      start: new Date().toISOString().slice(0, 10),
      sp: {},
      gdone: {},
      sessions: [],
      quiz: {},
      tdone: {},
      lp: {},
      micGain: 1.0,
      autoCheckOnStartup: false,
      audioConstraints: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      snrHistory: [
        { id: Date.now() - 86400000 * 2, time: 'Day -2', date: 'Oct 09', snr: 14, noise: -38, signal: -24, verdict: 'Good SNR' },
        { id: Date.now() - 86400000, time: 'Yesterday', date: 'Oct 10', snr: 18, noise: -41, signal: -23, verdict: 'Good SNR' },
      ],
      cmp: { role: 'freelancer', client: '', project: 'Web & Digital Services', facts: '', tone: 'friendly', len: 'detailed' },
      phr: [],
      ht: { done: {}, log: [], conf: [] },
      ie: { type: 'academic', target: 7, exam: '', daily: 60, mode: 'practice', hist: [], saved: {} },
    };

    try {
      const savedState = localStorage.getItem('spk2');
      if (savedState) Object.assign(S, JSON.parse(savedState));
    } catch (e) {}

    const t = (k: string) => (D[S.lang] && D[S.lang][k]) || k;
    const save = () => {
      S.updated = Date.now();
      try {
        localStorage.setItem('spk2', JSON.stringify(S));
      } catch (e) {}
    };

    const ds = (d: Date) =>
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0');

    const LV = ['Foundations', 'Everyday Life', 'Conversation', 'Professional', 'Fluency', 'Mastery'];
    const TH = [0, 300, 800, 1600, 3000];
    const lvl = () => {
      let l = 0;
      TH.forEach((x, i) => {
        if (S.xp >= x) l = i;
      });
      return l;
    };
    const lvName = (i: number) => S.fin ? 'Fluency Master' : LV[Math.min(Math.floor((i || 0) / 5), 5)] || 'Foundations';

    const addXP = (min: number, xp: number) => {
      const k = ds(new Date());
      S.days[k] = (S.days[k] || 0) + min;
      S.xp += xp;
      save();
      if (xp > 0) toast('+' + xp + ' XP ⭐');
    };
    const streak = () => {
      let d = new Date(), n = 0;
      if (!S.days[ds(d)]) d.setDate(d.getDate() - 1);
      while (S.days[ds(d)]) {
        n++;
        d.setDate(d.getDate() - 1);
      }
      return n;
    };

    // Core Words
    const WORDS: Array<[string, string, string, string, string, string, string, string]> = [
      ['persevere', 'pɜːrsɪˈvɪr', 'Verb', 'অধ্যবসায় করা', 'Business', 'Beginner', 'To continue despite difficulty.', 'If you persevere with daily practice, your fluency will improve.'],
      ['negotiate', 'nɪˈɡoʊʃieɪt', 'Verb', 'দরকষাকষি করা', 'Office', 'Intermediate', 'To discuss to reach an agreement.', 'I will negotiate a better salary.'],
      ['comfortable', 'ˈkʌmftərbəl', 'Adjective', 'আরামদায়ক', 'Daily', 'Beginner', 'Making you feel relaxed.', 'This chair is very comfortable.'],
      ['entrepreneur', 'ˌɒntrəprəˈnɜːr', 'Noun', 'উদ্যোক্তা', 'Office', 'Advanced', 'A person who starts a business.', 'She is a young entrepreneur.'],
      ['confident', 'ˈkɒnfɪdənt', 'Adjective', 'আত্মবিশ্বাসী', 'Emotions', 'Beginner', 'Sure of yourself.', 'He felt confident before the interview.'],
      ['break the ice', '', 'Idiom', 'জড়তা কাটানো', 'Idioms', 'Intermediate', 'To start a conversation.', 'A joke helped me break the ice.'],
      ['analyze', 'ˈænəlaɪz', 'Verb', 'বিশ্লেষণ করা', 'Academic', 'Advanced', 'To examine in detail.', 'Please analyze the data.'],
      ['grateful', 'ˈɡreɪtfəl', 'Adjective', 'কৃতজ্ঞ', 'Emotions', 'Beginner', 'Feeling thankful.', 'I am grateful for your help.'],
      ['achieve', 'əˈtʃiːv', 'Verb', 'অর্জন করা', 'Verbs', 'Beginner', 'To succeed in reaching a goal.', 'You can achieve fluency.'],
      ['vegetable', 'ˈvedʒtəbəl', 'Noun', 'সবজি', 'Daily', 'Beginner', 'A plant eaten as food.', 'I bought fresh vegetables.'],
      ['articulate', 'ɑːrˈtɪkjəleɪt', 'Verb', 'স্পষ্টভাবে প্রকাশ করা', 'Professional', 'Intermediate', 'To express ideas clearly.', 'She was able to articulate her vision for the project.'],
      ['collaborate', 'kəˈlæbəreɪt', 'Verb', 'একত্রে কাজ করা', 'Business', 'Beginner', 'To work jointly on a task.', 'We collaborate with international clients regularly.'],
    ];

    const SYL: Record<string, string[]> = {
      entrepreneur: ['on', 'tre', 'pre', 'neur'],
      comfortable: ['KUMF', 'ter', 'bul'],
      vegetable: ['VEJ', 'tuh', 'bul'],
      persevere: ['per', 'suh', 'VEER'],
      articulate: ['ar', 'TIK', 'yuh', 'layt'],
    };

    const PT = [
      { id: 'vb', t: 'V vs B', w: [['very', 'berry'], ['vest', 'best'], ['vote', 'boat'], ['van', 'ban']], tip: 'V: উপরের দাঁত নিচের ঠোঁট হালকা ছুঁয়ে বাতাস ছাড়ুন (কম্পন অনুভব করুন)। B: দুই ঠোঁট বন্ধ করে হঠাৎ খুলুন।' },
      { id: 'fp', t: 'F vs P', w: [['fan', 'pan'], ['fine', 'pine'], ['fast', 'past'], ['coffee', 'copy']], tip: 'F: উপরের দাঁত নিচের ঠোঁটে লাগিয়ে বাতাস ছাড়ুন। P: দুই ঠোঁট বন্ধ করে ফুঁ দিয়ে খুলুন।' },
      { id: 'wv', t: 'W vs V', w: [['west', 'vest'], ['wine', 'vine'], ['worse', 'verse'], ['wet', 'vet']], tip: 'W: ঠোঁট গোল করে "উ" থেকে শুরু, দাঁত লাগবে না। V: উপরের দাঁত নিচের ঠোঁটে লাগে।' },
      { id: 'th', t: 'TH sound', w: [['think', 'sink'], ['three', 'tree'], ['thank', 'tank'], ['thin', 'tin']], tip: 'জিভের ডগা দুই দাঁতের মাঝে হালকা রেখে বাতাস ছাড়ুন। "ত/থ/দ" নয়।' },
      { id: 'sh', t: 'S vs SH', w: [['see', 'she'], ['sip', 'ship'], ['sell', 'shell'], ['seat', 'sheet']], tip: 'S: দাঁত কাছাকাছি, জিভ সামনে। SH: ঠোঁট একটু গোল করে জিভ পেছনে টেনে নিন।' },
      { id: 'zj', t: 'Z sound', w: [['zoo'], ['zero'], ['zebra'], ['busy']], tip: 'Z এ গলার কম্পন থাকে ("জ" নয়)। দাঁত কাছাকাছি রেখে "জ্জ্" শব্দ করুন।' },
      { id: 'r', t: 'R sound', w: [['ready'], ['right'], ['around'], ['very']], tip: 'জিভ তালুতে না ছুঁয়ে পেছনে কুঁচকে নিন; বাংলা "র" এর মতো ঝাপটা নয়।' },
      { id: 'end', t: 'Word endings', w: [['worked'], ['helped'], ['asked'], ['walked']], tip: 'শেষের -ed এখানে "t" ধ্বনি: worked = ওয়ার্কট। শব্দের শেষ ধ্বনি গিলে ফেলবেন না।' },
    ];

    const STORY: Array<[string, string, string, string[], Record<string, string>]> = [
      ['A New Beginning', 'একটি নতুন শুরু', 'Beginner', ['Rahim moved to a new city for work.', 'On the first day, he felt nervous but excited.', 'He smiled at his neighbor and said hello.'], { nervous: 'নার্ভাস', excited: 'উত্তেজিত', neighbor: 'প্রতিবেশী' }],
      ['The First English Conversation', 'প্রথম ইংরেজি কথোপকথন', 'Beginner', ['Mina met a tourist at the bus stop.', 'She took a deep breath and asked if she could help.', 'The tourist smiled, and they talked for five minutes.'], { tourist: 'পর্যটক', breath: 'শ্বাস' }],
      ['The First Client', 'প্রথম ক্লায়েন্ট', 'Elementary', ['Arif received his first message from a client.', 'He read the requirements carefully and replied politely.', 'Two days later, he delivered the project and received a good review.'], { requirements: 'চাহিদা', delivered: 'জমা দিল', review: 'রিভিউ' }],
      ['The Journey to Success', 'সাফল্যের পথে', 'Intermediate', ['Every morning, Lina practiced speaking English for thirty minutes.', 'At first, she made many mistakes, but she never gave up.', 'After six months, she gave a presentation without any fear.'], { presentation: 'উপস্থাপনা', fear: 'ভয়' }],
      ["The Freelancer's Challenge", 'ফ্রিল্যান্সারের চ্যালেঞ্জ', 'Advanced', ['A client asked Sabbir to finish a large task in one day.', 'He explained honestly that quality work needs more time and suggested a realistic schedule.', 'The client appreciated his honesty and agreed.'], { realistic: 'বাস্তবসম্মত', appreciated: 'প্রশংসা করল', honesty: 'সততা' }],
    ];

    const TOP = [
      ['Career', 'Career & Work', 'My Career Goals & Aspirations', 'আপনার ক্যারিয়ারের লক্ষ্য নিয়ে বলুন', 'Easy', 2],
      ['Daily', 'Daily Life', 'A Typical Productive Day in My Life', 'আপনার একটি কর্মব্যস্ত দিনের কথা', 'Easy', 2],
      ['Opinion', 'Opinion & Tech', 'Is Artificial Intelligence Good for Humanity?', 'এআই কি মানবজাতির জন্য ভালো?', 'Hard', 3],
      ['Travel', 'Travel & Story', 'A Memorable Place I Visited', 'স্মরণীয় একটি জায়গার গল্প', 'Medium', 3],
      ['Interview', 'Interview Prep', 'Self Introduction in a Job Interview', 'ইন্টারভিউতে নিজের পরিচয়', 'Medium', 2],
      ['Client', 'Client Discussion', 'Explaining Project Timeline & Expectations', 'ক্লায়েন্টের সাথে সময়সীমা ও পরিকল্পনা নিয়ে কথা', 'Medium', 2],
      ['Open', 'Open Mic', 'Free Speaking', 'নিজের পছন্দের যেকোনো বিষয়ে', 'Easy', 1],
    ];

    const IRR: Record<string, string> = { go: 'went', come: 'came', eat: 'ate', see: 'saw', buy: 'bought', take: 'took', meet: 'met', get: 'got', do: 'did', have: 'had', write: 'wrote', speak: 'spoke', make: 'made', give: 'gave', run: 'ran', say: 'said', tell: 'told' };
    const PASTM = /\b(yesterday|last (night|week|month|year|time)|\w+ ago|in 20\d\d)\b/i;
    const MODP = /\b(does|did|do|can|could|will|would|should|must|may|might|to|let|make|not)\b/i;
    const S3 = (w: string) => ({ go: 'goes', do: 'does', have: 'has', "don't": "doesn't" }[w.toLowerCase()] || (/(s|sh|ch|x|z)$/.test(w) ? w + 'es' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's'));

    const GR = [
      { re: /\b(I|we|they|you|he|she)\s+(go|come|eat|see|buy|take|meet|get|do|have|write|speak|make|give|run|say|tell)\b/gi, fix: (m: any, _pre: any, se: any) => PASTM.test(se) ? m[1] + ' ' + (IRR[m[2].toLowerCase()] || m[2]) : null, bn: "অতীত সময়ের বাক্যে verb-এর past form হয়।" },
      { re: /\b(he|she|it)\s+(go|do|have|don't|want|like|need|work|live|play|speak|eat|come|know|study|think)\b/gi, fix: (m: any, pre: any, se: any) => MODP.test(pre) || PASTM.test(se) ? null : m[1] + ' ' + S3(m[2]), bn: "he/she/it এর সাথে verb এ -s/-es যোগ হয়।" },
      { re: /\bI am agree\b/gi, fix: () => 'I agree', bn: "agree নিজেই ক্রিয়া, am লাগে না।" },
      { re: /\bmore (better|easier|faster|bigger)\b/gi, fix: (m: any) => m[1], bn: "এই শব্দ নিজেই তুলনামূলক রূপ; more লাগে না।" },
      { re: /\b(I|we|they|you)\s+has\b/gi, fix: (m: any) => m[1] + ' have', bn: "I/we/you/they এর সাথে have হয়।" },
      { re: /\b(he|she|it)\s+have\b/gi, fix: (m: any, pre: any) => MODP.test(pre) ? null : m[1] + ' has', bn: "he/she/it এর সাথে has হয়।" },
      { re: /\bI am (student|teacher|engineer|doctor|developer|designer)\b/gi, fix: (m: any) => 'I am a ' + m[1], bn: "পেশার আগে a/an বসে।" },
      { re: /\bI am (\d+) years\b/gi, fix: (m: any) => 'I am ' + m[1] + ' years old', bn: "বয়স বোঝাতে 'I am ... years old' হয়।" },
      { re: /\bI have (\d+) years\b/gi, fix: (m: any) => 'I am ' + m[1] + ' years old', bn: "বয়স বোঝাতে I am ... years old, I have নয়।" },
      { re: /\b(um+|uh+|erm|er|hmm+)\b,?\s*/gi, fix: () => '', bn: "ফিলার শব্দ; স্বাভাবিক নিঃশ্বাস নিন।" },
    ];

    const gcheck = (text: string) => {
      const hits: any[] = [];
      for (const R of GR) {
        const re = new RegExp(R.re.source, R.re.flags.includes('g') ? R.re.flags : R.re.flags + 'g');
        let m;
        while ((m = re.exec(text))) {
          if (!m[0].length) {
            re.lastIndex++;
            continue;
          }
          const fx = typeof R.fix === 'function' ? R.fix(m, text.slice(0, m.index), text.slice(m.index)) : R.fix;
          if (fx == null) continue;
          hits.push({ s: m.index, e: m.index + m[0].length, bad: m[0], good: fx, bn: R.bn });
        }
      }
      hits.sort((x, y) => x.s - y.s);
      let corr = '', p = 0;
      hits.forEach(h => {
        corr += text.slice(p, h.s) + h.good;
        p = h.e;
      });
      corr += text.slice(p);
      return { hits, corr: corr.replace(/\s{2,}/g, ' ').trim() };
    };

    const gview = (text: string) => {
      const g = gcheck(text);
      if (!g.hits.length) return `<div>${esc(text)}</div><div class="mu">✓ কোনো ব্যাকরণগত সাধারণ ভুল পাওয়া যায়নি</div>`;
      return `<div>${esc(text)}</div><div class="fix" style="border-color:var(--pr)"><b>✅ Corrected:</b> ${esc(g.corr)} ${g.hits.map((h: any) => `<div class="mu">• <s>${esc(h.bad)}</s> → <b>${esc(h.good)}</b> — ${h.bn}</div>`).join('')}</div>`;
    };

    const norm = (x: string) => (x || '').toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean);
    const lcs = (a: string[], b: string[]) => {
      const n = a.length, m = b.length;
      const L = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
      for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
          L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
        }
      }
      return L[0][0];
    };

    // State model
    let st: any = {
      phase: 'pick',
      topic: TOP[0],
      txt: '',
      interim: '',
      t0: 0,
      conf: [],
      pw: 'entrepreneur',
      pres: null,
      sid: null,
      sres: null,
      sru: '',
      rec: null,
      dictatingTarget: null,
      activeStream: null,
      micErr: null,
      micWarnX: false,
      chat: [
        { role: 'assistant', content: 'Hello! I am your Speakly English Coach. Ask me any English grammar or speaking question, or practice talking!' }
      ],
      busy: 0,
      unl: 0,
      of: { prov: 'server', model: 'gemini-3.8-flash', key: '', base: '', tier: 'free' },
      cm: { on: 0, rec: null, txt: '', interim: '', items: [], auto: 1, big: 0, lang: 'en-US', sum: '', err: '' },
      sm: { on: 0, scn: 'discovery', pers: 'friendly', diff: 'medium', lvl: 'intermediate', log: [], turn: 0, rep: null },
      hz: { stage: 0, q: '', a: '', alt: '', txt: '', res: null, rec: null },
      tk: { tab: 'templates', sel: 'intro', txt: '', b2e: '', mode: 'Freelancing' },
      is: { phase: 'menu', part: 1, items: [], qi: 0, qs: [], topic: '', notes: '' },
      mc: {
        res: [],
        run: 0,
        lvl: 0,
        txt: '',
        done: 0,
        liveWaveform: false,
        quickChecking: false,
        quickCheckProgress: 0,
        startupCheck: null as { tested: boolean; success: boolean; level: number; lowLevel?: boolean; msg: string; time: string } | null,
        noiseTest: {
          running: false,
          step: 'idle',
          countdown: 0,
          noiseRms: 0,
          noiseDb: 0,
          signalRms: 0,
          signalDb: 0,
          snrDb: 0,
          verdict: '',
          verdictColor: '',
          msg: '',
        },
      },
    };

    const MICMSG: Record<string, string> = {
      'not-allowed': 'মাইক্রোফোনের অনুমতি বন্ধ আছে। ব্রাউজার বারে 🔒 বা ক্যামেরা/মাইক আইকন চেপে Allow দিন।',
      'service-not-allowed': 'ব্রাউজার স্পিচ রিকগনিশন সার্ভিস এই পেজে ব্লক করেছে। অন্য ব্রাউজার বা ট্যাবে পরীক্ষা করুন।',
      'no-speech': 'কিছুক্ষণ কোনো কথা শোনা যায়নি। স্পষ্ট করে বলুন বা আবার চেষ্টা করুন।',
      'audio-capture': 'মাইক্রোফোন অন্য কোনো অ্যাপ ব্যবহার করছে বা সংযুক্ত নেই। অন্যান্য কল বা রেকর্ডিং অ্যাপ বন্ধ করুন।',
      network: 'স্পিচ-টু-টেক্সট ইন্টারনেট সংযোগ দরকার। আপনার ইন্টারনেট কানেকশন পরীক্ষা করুন।',
      unsupported: 'এই ব্রাউজারে ভয়েস রিকগনিশন সুবিধা নেই। Chrome ব্যবহার করতে পারেন।',
      start: 'মাইক্রোফোন চালু করা যায়নি। অনুগ্রহ করে রিফ্রেশ করে আবার চেষ্টা করুন।',
    };

    const micFail = (code: string) => {
      if (code === 'aborted' || code === 'no-speech') {
        toast(MICMSG[code] || 'কথা শোনা যায়নি, আবার চেষ্টা করুন');
        return;
      }
      st.micErr = { code, msg: MICMSG[code] || ('মাইক ত্রুটি: ' + code) };
      toast(st.micErr.msg, 3500);
    };

    const micBanner = () => {
      if (st.micErr) {
        return `<div class="card fix" role="alert" style="border-color:var(--rd)"><b>🎤 মাইক সমস্যা</b><div style="margin:4px 0">${esc(st.micErr.msg)}</div><div class="row"><button class="btn s p" data-a="go" data-v="miccheck">Mic Check চালান</button><button class="btn s" data-a="micx">✕ বন্ধ</button></div></div>`;
      }
      return '';
    };

    // Quick Startup / On-Demand Microphone Level Test
    let quickCheckInterval: any = null;
    let quickCheckStream: MediaStream | null = null;

    const stopQuickCheck = () => {
      if (quickCheckInterval) {
        clearInterval(quickCheckInterval);
        quickCheckInterval = null;
      }
      if (quickCheckStream) {
        try {
          quickCheckStream.getTracks().forEach(t => t.stop());
        } catch (e) {}
        quickCheckStream = null;
      }
      if (st && st.mc) {
        st.mc.quickChecking = false;
      }
    };

    const runQuickStartupMicCheck = async (isAutoStartup = false) => {
      const mc = st.mc;
      if (mc.quickChecking) return;
      stopQuickCheck();

      mc.quickChecking = true;
      mc.quickCheckProgress = 0;
      if (isAutoStartup) {
        toast('⚡ Auto-check on Startup: মাইক পরীক্ষা চলছে… (শব্দ বা কথা বলুন)', 2600);
      } else {
        toast('⚡ কুইক মাইক টেস্ট চলছে… মাইক্রোফোনে কথা বলুন', 2200);
      }
      R();

      let stream: MediaStream | null = null;
      try {
        const constraints: MediaTrackConstraints = {
          echoCancellation: Boolean(S.audioConstraints?.echoCancellation ?? true),
          noiseSuppression: Boolean(S.audioConstraints?.noiseSuppression ?? true),
          autoGainControl: Boolean(S.audioConstraints?.autoGainControl ?? true),
        };
        stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
        quickCheckStream = stream;
      } catch (err: any) {
        mc.quickChecking = false;
        mc.startupCheck = {
          tested: true,
          success: false,
          level: 0,
          msg: 'মাইক্রোফোনের অনুমতি মেলেনি বা হার্ডওয়্যার ব্লক আছে (' + (err.name || 'Error') + ')।',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        micFail(err.name || 'not-allowed');
        R();
        return;
      }

      const ctx = getAudioContext();
      if (!ctx || !stream) {
        mc.quickChecking = false;
        if (stream) {
          try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
        }
        quickCheckStream = null;
        R();
        return;
      }

      const source = ctx.createMediaStreamSource(stream);
      const gainNode = ctx.createGain();
      gainNode.gain.value = S.micGain || 1.0;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(gainNode);
      gainNode.connect(analyser);

      const data = new Uint8Array(analyser.fftSize);
      let peakRms = 0;
      let samplesCount = 0;
      let totalRms = 0;

      const startTime = Date.now();
      const testDuration = 2200; // 2.2 seconds quick test

      quickCheckInterval = setInterval(() => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        if (rms > peakRms) peakRms = rms;
        totalRms += rms;
        samplesCount++;

        const elapsed = Date.now() - startTime;
        mc.quickCheckProgress = Math.min(100, Math.round((elapsed / testDuration) * 100));
        mc.lvl = Math.min(100, Math.round(rms * 180));

        const bar = document.getElementById('mcbar');
        if (bar) bar.style.width = mc.lvl + '%';

        if (elapsed >= testDuration) {
          clearInterval(quickCheckInterval);
          quickCheckInterval = null;

          if (quickCheckStream) {
            try { quickCheckStream.getTracks().forEach(t => t.stop()); } catch (e) {}
            quickCheckStream = null;
          }

          const peakPercent = Math.min(100, Math.round(peakRms * 160));
          const avgPercent = samplesCount ? Math.min(100, Math.round((totalRms / samplesCount) * 160)) : 0;
          mc.quickChecking = false;
          mc.quickCheckProgress = 100;
          mc.lvl = peakPercent;

          const isSoundDetected = peakPercent >= 8 || avgPercent >= 4;
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if (isSoundDetected) {
            mc.startupCheck = {
              tested: true,
              success: true,
              level: peakPercent,
              lowLevel: peakPercent < 15,
              msg: peakPercent >= 15
                ? `মাইক্রোফোন সম্পূর্ণ প্রস্তুত ও সক্রিয়! ইনপুট লেভেল: ${peakPercent}% (স্বাভাবিক)`
                : `মাইক্রোফোন সংযুক্ত, তবে ইনপুট লেভেল কিছুটা কম (${peakPercent}%)। Gain স্লাইডার বাড়াতে পারেন।`,
              time: timeStr,
            };
            toast(`✅ স্টার্টআপ মাইক টেস্ট: মাইক সফলভাবে সংযুক্ত! ইনপুট: ${peakPercent}%`, 3000);
          } else {
            mc.startupCheck = {
              tested: true,
              success: true,
              level: peakPercent,
              lowLevel: true,
              msg: `মাইক্রোফোন সংযুক্ত রয়েছে কিন্তু কোনো কথা বা অডিও ইনপুট পাওয়া যায়নি (${peakPercent}%)। মাইক আনমিউট আছে কিনা পরীক্ষা করুন।`,
              time: timeStr,
            };
            toast(`⚠️ স্টার্টআপ মাইক টেস্ট: কোনো সাউন্ড ইনপুট পাওয়া যায়নি (${peakPercent}%)। মাইক আনমিউট আছে কিনা দেখুন।`, 3600);
          }
          R();
        }
      }, 60);
    };

    // Waveform Monitor State & Gain Pipeline
    let waveStream: MediaStream | null = null;
    let waveAnalyser: AnalyserNode | null = null;
    let waveGainNode: GainNode | null = null;
    let waveAnimId: number | null = null;

    const stopWaveformMonitor = () => {
      if (waveAnimId != null) {
        cancelAnimationFrame(waveAnimId);
        waveAnimId = null;
      }
      if (waveStream) {
        try {
          waveStream.getTracks().forEach(t => t.stop());
        } catch (e) {}
        waveStream = null;
      }
      waveAnalyser = null;
      waveGainNode = null;
      if (st && st.mc) st.mc.liveWaveform = false;
    };

    const startWaveformMonitor = async (existingStream?: MediaStream) => {
      try {
        if (st && st.mc) st.mc.liveWaveform = true;
        if (!existingStream && (!waveStream || !waveStream.active)) {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const constraints: MediaTrackConstraints = {
              echoCancellation: Boolean(S.audioConstraints?.echoCancellation ?? true),
              noiseSuppression: Boolean(S.audioConstraints?.noiseSuppression ?? true),
              autoGainControl: Boolean(S.audioConstraints?.autoGainControl ?? true),
            };
            waveStream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
          }
        } else if (existingStream) {
          waveStream = existingStream;
        }

        const ctx = getAudioContext();
        if (ctx && waveStream) {
          const source = ctx.createMediaStreamSource(waveStream);
          const gainNode = ctx.createGain();
          gainNode.gain.value = S.micGain || 1.0;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 1024;

          source.connect(gainNode);
          gainNode.connect(analyser);

          waveGainNode = gainNode;
          waveAnalyser = analyser;
        }

        renderWaveLoop();
      } catch (err: any) {
        console.warn('Failed to start waveform monitor:', err);
        if (st && st.mc) st.mc.liveWaveform = false;
        micFail(err.name || 'not-allowed');
        R();
      }
    };

    const renderWaveLoop = () => {
      if (waveAnimId != null) cancelAnimationFrame(waveAnimId);

      const draw = () => {
        const canvas = document.getElementById('mc-waveform-canvas') as HTMLCanvasElement;
        if (!canvas) {
          waveAnimId = null;
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const desiredWidth = Math.round(rect.width * dpr) || 600;
        const desiredHeight = Math.round(rect.height * dpr) || 150;

        if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
          canvas.width = desiredWidth;
          canvas.height = desiredHeight;
        }

        const width = canvas.width;
        const height = canvas.height;

        // Canvas Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#090F20');
        bgGrad.addColorStop(1, '#05091A');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.moveTo(0, height * 0.25);
        ctx.lineTo(width, height * 0.25);
        ctx.moveTo(0, height * 0.75);
        ctx.lineTo(width, height * 0.75);
        ctx.stroke();

        if (waveAnalyser) {
          const bufferLength = waveAnalyser.fftSize;
          const timeData = new Uint8Array(bufferLength);
          const freqData = new Uint8Array(waveAnalyser.frequencyBinCount);
          waveAnalyser.getByteTimeDomainData(timeData);
          waveAnalyser.getByteFrequencyData(freqData);

          // Subtle background spectral bars
          const barCount = 48;
          const barWidth = width / barCount;
          for (let i = 0; i < barCount; i++) {
            const freqIdx = Math.floor((i / barCount) * freqData.length);
            const value = freqData[freqIdx] / 255;
            const barHeight = value * (height * 0.45);
            const x = i * barWidth;
            const y = height - barHeight;

            const barGrad = ctx.createLinearGradient(0, height, 0, y);
            barGrad.addColorStop(0, 'rgba(124, 92, 255, 0.05)');
            barGrad.addColorStop(1, 'rgba(0, 201, 141, 0.24)');
            ctx.fillStyle = barGrad;
            ctx.fillRect(x + 1 * dpr, y, barWidth - 2 * dpr, barHeight);
          }

          // Glowing time-domain waveform line
          const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
          waveGrad.addColorStop(0, '#00C98D');
          waveGrad.addColorStop(0.5, '#00D9A0');
          waveGrad.addColorStop(1, '#7C5CFF');

          ctx.strokeStyle = waveGrad;
          ctx.lineWidth = 2.5 * dpr;
          ctx.shadowColor = 'rgba(0, 217, 160, 0.6)';
          ctx.shadowBlur = 8 * dpr;
          ctx.beginPath();

          const sliceWidth = width / (bufferLength * 0.5);
          let x = 0;

          for (let i = 0; i < bufferLength * 0.5; i++) {
            const v = timeData[i] / 128.0;
            const y = (v * height) / 2;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.stroke();
          ctx.shadowBlur = 0;

          // Live RMS and dB
          let sumSquares = 0;
          for (let i = 0; i < timeData.length; i++) {
            const val = (timeData[i] - 128) / 128;
            sumSquares += val * val;
          }
          const rms = Math.sqrt(sumSquares / timeData.length);
          const percent = Math.min(100, Math.round(rms * 350));
          const db = Math.max(-60, Math.round(20 * Math.log10(Math.max(0.0001, rms))));

          if (st && st.mc) st.mc.lvl = percent;
          const bar = document.getElementById('mcbar');
          if (bar) bar.style.width = percent + '%';

          // Canvas HUD text
          ctx.fillStyle = 'rgba(232, 237, 247, 0.95)';
          ctx.font = `600 ${12 * dpr}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillText(`Input Signal: ${percent}% (${db} dB)`, 14 * dpr, 24 * dpr);

          ctx.fillStyle = percent > 12 ? '#00D9A0' : 'rgba(148, 163, 184, 0.8)';
          const statusText = percent > 12 ? '● Capturing Audio' : '○ Ambient Silence';
          ctx.fillText(statusText, width - 140 * dpr, 24 * dpr);
        } else {
          // Idle line
          ctx.strokeStyle = 'rgba(0, 201, 141, 0.35)';
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
          ctx.font = `500 ${12 * dpr}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillText('Waveform Monitor Idle — Click "লাইভ ওয়েভফর্ম চালু করুন" or Test to start', 14 * dpr, 24 * dpr);
        }

        waveAnimId = requestAnimationFrame(draw);
      };

      waveAnimId = requestAnimationFrame(draw);
    };

    // Primary Voice Listener with error resilience
    const listen = (cb: (finalText: string, confidences: number[], error: any) => void, live = false) => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        micFail('unsupported');
        return null;
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const audioConstraints: MediaTrackConstraints = {
          echoCancellation: Boolean(S.audioConstraints?.echoCancellation ?? true),
          noiseSuppression: Boolean(S.audioConstraints?.noiseSuppression ?? true),
          autoGainControl: Boolean(S.audioConstraints?.autoGainControl ?? true),
        };
        navigator.mediaDevices
          .getUserMedia({ audio: audioConstraints })
          .then(stream => {
            stream.getTracks().forEach(t => t.stop());
          })
          .catch(err => {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              micFail('not-allowed');
            }
          });
      }

      const r = new SR();
      r.lang = 'en-US';
      r.interimResults = true;
      r.continuous = Boolean(live);

      let fin = '';
      let cf: number[] = [];
      let lastErr: any = null;

      r.onresult = (e: any) => {
        let text = '';
        cf = [];
        for (let i = 0; i < e.results.length; i++) {
          text += e.results[i][0].transcript + ' ';
          cf.push(e.results[i][0].confidence || 0.85);
        }
        fin = text.trim();
        st.micErr = null;
        if (live) {
          const l = document.getElementById('live') || document.getElementById('cmlive');
          if (l) l.textContent = fin;
        }
      };

      r.onerror = (ev: any) => {
        lastErr = ev.error;
        if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
          micFail(ev.error);
        }
      };

      r.onend = () => {
        cb(fin, cf, lastErr);
      };

      try {
        r.start();
      } catch (e) {
        micFail('start');
        return null;
      }

      return r;
    };

    // Universal In-Line Dictation System for ANY input (Solves "mic is missing in some sections & solve it different way")
    let activeDictateSR: any = null;
    let activeDictateMediaRec: MediaRecorder | null = null;
    let activeDictateChunks: Blob[] = [];

    const stopDictate = () => {
      if (activeDictateSR) {
        try { activeDictateSR.stop(); } catch (e) {}
        activeDictateSR = null;
      }
      if (activeDictateMediaRec && activeDictateMediaRec.state !== 'inactive') {
        try { activeDictateMediaRec.stop(); } catch (e) {}
        activeDictateMediaRec = null;
      }
      st.dictatingTarget = null;
      R();
    };

    const startMediaRecorderFallback = async (targetId: string) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast('এই ডিভাইসে মাইক্রোফোন রেকর্ড সাপোর্ট নেই');
        st.dictatingTarget = null;
        R();
        return;
      }

      try {
        const audioConstraints: MediaTrackConstraints = {
          echoCancellation: Boolean(S.audioConstraints?.echoCancellation ?? true),
          noiseSuppression: Boolean(S.audioConstraints?.noiseSuppression ?? true),
          autoGainControl: Boolean(S.audioConstraints?.autoGainControl ?? true),
        };
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        const mediaRecorder = new MediaRecorder(stream);
        activeDictateMediaRec = mediaRecorder;
        activeDictateChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) activeDictateChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          if (activeDictateChunks.length === 0) return;
          toast('⏳ অডিও বিশ্লেষণ ও ট্রান্সক্রাইব হচ্ছে…', 2200);

          const audioBlob = new Blob(activeDictateChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64data = (reader.result as string)?.split(',')[1];
            if (base64data) {
              try {
                const resp = await fetch('/api/ai/transcribe', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ audioBase64: base64data, mimeType: mediaRecorder.mimeType || 'audio/webm' }),
                });
                if (resp.ok) {
                  const data = await resp.json();
                  if (data.text) {
                    const target = document.getElementById(targetId) as (HTMLInputElement | HTMLTextAreaElement);
                    if (target) {
                      target.value = (target.value ? (target.value.trim() + ' ') : '') + data.text;
                    }
                    toast('✓ কথা যুক্ত হয়েছে!');
                  }
                }
              } catch (e) {
                toast('ট্রান্সক্রিপশন সার্ভিস সাড়া দেয়নি');
              }
            }
          };
          reader.readAsDataURL(audioBlob);
        };

        mediaRecorder.start();
      } catch (err: any) {
        micFail(err.name || 'not-allowed');
        st.dictatingTarget = null;
        R();
      }
    };

    // Client Meeting AI: Continuous Recognition Engine with Safe Restart
    const cmListen = () => {
      const cm = st.cm;
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        cm.err = 'এই ব্রাউজারে ভয়েস রিকগনিশন নেই — Chrome ব্যবহার করুন।';
        R();
        return;
      }

      cm.on = 1;
      cm.err = '';

      const startNewRecognition = () => {
        if (!cm.on) return;
        try {
          const r = new SR();
          r.lang = cm.lang || 'en-US';
          r.continuous = true;
          r.interimResults = true;

          r.onresult = (e: any) => {
            if (window.speechSynthesis && speechSynthesis.speaking) return;

            let fin = '';
            let it = '';
            for (let i = e.resultIndex; i < e.results.length; i++) {
              const text = e.results[i][0].transcript;
              if (e.results[i].isFinal) fin += text + ' ';
              else it += text;
            }

            if (fin) {
              cm.txt = (cm.txt + ' ' + fin).trim();
              clearTimeout(cm._t);
              cm._t = setTimeout(() => {
                if (cm.auto && cm.txt.trim().length > 6) {
                  cmReply(cm.txt);
                }
              }, 1400);
            }
            cm.interim = it;
            const l = document.getElementById('cmlive');
            if (l) l.textContent = (cm.txt + ' ' + it).trim() || 'শুনছি…';
          };

          r.onerror = (ev: any) => {
            if (ev.error === 'no-speech' || ev.error === 'aborted') return;
            if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(ev.error)) {
              cm.on = 0;
              cm.rec = null;
              micFail(ev.error);
            }
            R();
          };

          r.onend = () => {
            if (cm.on) {
              setTimeout(() => {
                if (cm.on) startNewRecognition();
              }, 200);
            }
          };

          cm.rec = r;
          r.start();
        } catch (err) {
          console.warn('Continuous recognition error:', err);
        }
      };

      startNewRecognition();
      R();
    };

    // Client Meeting Reply Generator
    const cmReply = async (queryText?: string) => {
      const cm = st.cm;
      const q = String(queryText || cm.txt).trim();
      if (!q) return;

      cm.txt = '';
      cm.interim = '';
      cm.err = '';

      const item: any = {
        q,
        src: 'template',
        ts: Date.now(),
        pend: 1,
        gist: 'ক্লায়েন্টের প্রশ্ন বোঝা হচ্ছে…',
        reply: `Thank you for asking about "${q}". I understand what you need. Let me review the scope and provide you with a full proposal by tomorrow. Does that work for you?`,
        short: 'I will review this and give you a clear update shortly.',
        formal: 'Thank you for your inquiry; I will review the specifications and respond with a formal update.',
        ask: 'Could you share any specific deadline or budget range for this?',
        need: '',
      };
      cm.items.unshift(item);
      R();

      try {
        const prompt = `You are Speakly Meeting Assistant for a professional client call. The client just asked: "${q}". 
Tone: ${S.cmp.tone || 'friendly'}. Context: role is "${S.cmp.role || 'freelancer'}", project is "${S.cmp.project || 'web development'}".
Return a JSON object with:
- "gist": One line explanation in Bengali of what the client wants
- "reply": Natural spoken English reply (3-5 clear sentences)
- "short": One sentence concise version
- "formal": Polite formal version
- "ask": Good follow-up question to ask the client
- "need": Bengali note on any project-specific details the user should personalize (e.g. price/date)`;

        const res = await callAI([{ role: 'user', content: prompt }]);
        try {
          const parsed = JSON.parse(res.replace(/^```json/, '').replace(/```$/, '').trim());
          Object.assign(item, parsed, { src: 'ai', pend: 0 });
        } catch {
          item.reply = res;
          item.pend = 0;
        }
      } catch (err: any) {
        item.pend = 0;
        item.need = 'AI সংযোগে সমস্যা হয়েছে — টেমপ্লেট উত্তর ব্যবহার করতে পারেন।';
      }
      R();
    };

    // Unified Server-Side AI Caller
    const callAI = async (messages: Array<{ role: string; content: string }>, systemInstruction?: string) => {
      try {
        const resp = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, systemInstruction }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.text) return data.text;
        }
      } catch (e) {
        console.warn('Server AI endpoint error, trying custom key fallback:', e);
      }

      const c = st.of;
      if (c && c.key) {
        const m = c.model || 'gemini-2.5-flash';
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(c.key)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction || 'You are an English coach.' }] },
              contents: messages.map(x => ({ role: x.role === 'user' ? 'user' : 'model', parts: [{ text: x.content }] })),
            }),
          }
        );
        const j = await r.json();
        if (j.candidates && j.candidates[0]?.content?.parts?.[0]?.text) {
          return j.candidates[0].content.parts[0].text;
        }
      }

      throw new Error('AI সার্ভিস প্রস্তুত নয়। অনুগ্রহ করে ইন্টারনেট কানেকশন বা সার্ভার কী নিশ্চিত করুন।');
    };

    const analyze2 = (txt: string, secs: number | null, conf: number | null) => {
      const w = norm(txt);
      const n = w.length;
      const fil = w.filter(x => ['um', 'uh', 'er', 'erm', 'hmm'].includes(x)).length;
      const rep = w.filter((x, i) => i && x === w[i - 1]).length;
      const errs = gcheck(txt).hits.filter(h => !/ফিলার/.test(h.bn));
      const uniq = new Set(w).size / Math.max(n, 1);
      const c = (x: number) => Math.max(0, Math.min(100, Math.round(x)));
      const wpm = secs && secs > 0 ? Math.round(n / (secs / 60)) : null;

      return {
        n,
        fil,
        rep,
        errs,
        dur: secs,
        wpm,
        pron: conf != null ? c(conf * 100) : 85,
        flu: wpm != null ? c(100 - Math.abs(wpm - 120) * 0.4 - fil * 5) : 82,
        gram: c(100 - errs.length * 15),
        voc: c(45 + uniq * 55 + Math.min(n, 50) / 5),
      };
    };

    // Dedicated React Root for Recharts SNR Historical Chart
    let snrChartRoot: any = null;
    const mountSnrChart = () => {
      const chartEl = document.getElementById('mc-snr-chart-root');
      if (!chartEl) return;
      if (!snrChartRoot) {
        snrChartRoot = createRoot(chartEl);
      }
      snrChartRoot.render(<SnrTrendChart data={S.snrHistory || []} />);
    };

    // Render Function
    const R = () => {
      const el = document.getElementById('app');
      if (!el) return;
      el.innerHTML = renderView();
      if (S.view === 'miccheck') {
        renderWaveLoop();
        setTimeout(mountSnrChart, 50);
      }
    };

    // View generation
    const renderView = () => {
      const v = S.view;
      if (v === 'land') {
        return `
          <div class="land">
            <div class="top">
              <div class="logo" style="padding:0">${LOGO(36)}Speakly</div>
              <span class="sp"></span>
              <button class="btn s" data-a="lang">${S.lang === 'en' ? 'EN | বাংলা' : 'বাংলা | EN'}</button>
              <button class="btn s p" data-a="go" data-v="home">Dashboard</button>
            </div>
            <div class="card hero" style="padding:36px 24px;margin-top:20px">
              <span class="pill">AI English gym · বাংলাভাষীদের জন্য</span>
              <h1 style="margin:14px 0">Speak English With Real Confidence.</h1>
              <p style="max-width:580px;color:var(--t2)">Practice everyday speaking, fix grammar mistakes, prepare for client meetings, and master IELTS with an empathetic coach. ব্যাখ্যা বাংলায়, অনুশীলন ইংরেজিতে।</p>
              <div class="row">
                <button class="btn p" data-a="go" data-v="speak">🎙️ Start Speaking Free</button>
                <button class="btn" data-a="go" data-v="meeting">🤝 Client Meeting AI</button>
                <button class="btn" data-a="go" data-v="miccheck">🎤 Mic Check &amp; Diagnostics</button>
              </div>
              <div class="wave on" style="margin-top:24px">${'<i></i>'.repeat(24)}</div>
            </div>
            <div class="g2">
              <div class="card h" style="cursor:pointer" data-a="go" data-v="speak">
                <div style="font-size:32px">🎙️</div>
                <h3>AI Speaking Lab</h3>
                <p class="mu">যেকোনো বিষয়ে কথা বলুন। WPM, উচ্চারণ স্পষ্টতা এবং বাংলা ব্যাখ্যাসহ ভুল সংশোধন পান।</p>
              </div>
              <div class="card h" style="cursor:pointer" data-a="go" data-v="meeting">
                <div style="font-size:32px">🤝</div>
                <h3>Client Meeting AI</h3>
                <p class="mu">ক্লায়েন্টের ইংরেজি শুনে বাংলা অর্থ, শর্ট/ফর্মাল উত্তর এবং কথা বলার চাঙ্কস তৈরি করে।</p>
              </div>
              <div class="card h" style="cursor:pointer" data-a="go" data-v="sim">
                <div style="font-size:32px">🎭</div>
                <h3>Meeting Simulator</h3>
                <p class="mu">১৪টি বাস্তব দৃশ্যে বন্ধুত্বপূর্ণ বা কড়া আন্তর্জাতিক ক্লায়েন্টের সাথে কণ্ঠ দিয়ে রোলপ্লে করুন।</p>
              </div>
              <div class="card h" style="cursor:pointer" data-a="go" data-v="ielts">
                <div style="font-size:32px">🎓</div>
                <h3>IELTS Preparation</h3>
                <p class="mu">Academic & General Reading, Listening, Task 1/2 Writing এবং Speaking পরীক্ষা।</p>
              </div>
            </div>
          </div>
        `;
      }

      // Sidebar
      const side = `
        <aside>
          <div class="logo" data-a="go" data-v="land">${LOGO(34)}Speakly</div>
          <div class="grp">PROFESSIONAL</div>
          <button class="ni ${v === 'meeting' ? 'on' : ''}" data-a="go" data-v="meeting"><span>🤝</span>${t('meeting')}</button>
          <button class="ni ${v === 'sim' ? 'on' : ''}" data-a="go" data-v="sim"><span>🎭</span>${t('sim')}</button>
          <button class="ni ${v === 'hesit' ? 'on' : ''}" data-a="go" data-v="hesit"><span>💪</span>${t('hesit')}</button>
          <button class="ni ${v === 'toolkit' ? 'on' : ''}" data-a="go" data-v="toolkit"><span>🧰</span>${t('toolkit')}</button>
          
          <div class="grp">SPEAKING & PRACTICE</div>
          <button class="ni ${v === 'home' ? 'on' : ''}" data-a="go" data-v="home"><span>🏠</span>${t('home')}</button>
          <button class="ni ${v === 'speak' ? 'on' : ''}" data-a="go" data-v="speak"><span>🎙️</span>${t('speak')}</button>
          <button class="ni ${v === 'coach' ? 'on' : ''}" data-a="go" data-v="coach"><span>🤖</span>${t('coach')}</button>
          <button class="ni ${v === 'comm' ? 'on' : ''}" data-a="go" data-v="comm"><span>💬</span>${t('comm')}</button>
          <button class="ni ${v === 'live' ? 'on' : ''}" data-a="go" data-v="live"><span>🗣️</span>${t('live')}</button>
          <button class="ni ${v === 'pron' ? 'on' : ''}" data-a="go" data-v="pron"><span>🔊</span>${t('pron')}</button>
          <button class="ni ${v === 'ptips' ? 'on' : ''}" data-a="go" data-v="ptips"><span>🅱️</span>${t('ptips')}</button>
          <button class="ni ${v === 'shadow' ? 'on' : ''}" data-a="go" data-v="shadow"><span>🔁</span>${t('shadow')}</button>
          
          <div class="grp">LEARN & MASTER</div>
          <button class="ni ${v === 'stories' ? 'on' : ''}" data-a="go" data-v="stories"><span>📖</span>${t('stories')}</button>
          <button class="ni ${v === 'vocab' ? 'on' : ''}" data-a="go" data-v="vocab"><span>📚</span>${t('vocab')}</button>
          <button class="ni ${v === 'grammar' ? 'on' : ''}" data-a="go" data-v="grammar"><span>📘</span>${t('grammar')}</button>
          <button class="ni ${v === 'mist' ? 'on' : ''}" data-a="go" data-v="mist"><span>📓</span>${t('mist')}</button>
          <button class="ni ${v === 'dquiz' ? 'on' : ''}" data-a="go" data-v="dquiz"><span>❓</span>${t('dquiz')}</button>
          <button class="ni ${v === 'ielts' ? 'on' : ''}" data-a="go" data-v="ielts"><span>🎓</span>${t('ielts')}</button>
          
          <div class="grp">SETTINGS & TEST</div>
          <button class="ni ${v === 'miccheck' ? 'on' : ''}" data-a="go" data-v="miccheck"><span>🎤</span>Mic Check</button>
          <button class="ni ${v === 'prog' ? 'on' : ''}" data-a="go" data-v="prog"><span>📈</span>${t('prog')}</button>
          <button class="ni ${v === 'me' ? 'on' : ''}" data-a="go" data-v="me"><span>👤</span>${t('me')}</button>
        </aside>
      `;

      const top = `
        <div class="top">
          <span class="pill">🔥 ${streak()} Days</span>
          <span class="pill">⭐ ${S.xp} XP</span>
          <span class="pill">L${lvl() + 1}: ${lvName(S.lvl)}</span>
          ${
            st.mc?.quickChecking
              ? `<span class="pill" style="background:rgba(124,92,255,0.22);color:var(--ac)">⚡ Testing Mic ${st.mc.quickCheckProgress}%</span>`
              : st.mc?.startupCheck?.tested
              ? `<span class="pill" style="cursor:pointer;background:${st.mc.startupCheck.success && !st.mc.startupCheck.lowLevel ? 'rgba(0,201,141,0.18)' : 'rgba(245,158,11,0.18)'};color:${st.mc.startupCheck.success && !st.mc.startupCheck.lowLevel ? 'var(--pr2)' : 'var(--am)'}" data-a="go" data-v="miccheck" title="${esc(st.mc.startupCheck.msg)}">🎤 ${st.mc.startupCheck.success ? `${st.mc.startupCheck.level}%` : 'Err'}</span>`
              : ''
          }
          <span class="sp"></span>
          <button class="btn s" data-a="go" data-v="miccheck">🎤 Mic Check</button>
          <button class="btn s" data-a="lang">${S.lang === 'en' ? 'EN | বাংলা' : 'বাংলা | EN'}</button>
        </div>
      `;

      const bottomNav = `
        <nav id="bn" aria-label="Main Navigation">
          <button class="${v === 'home' ? 'on' : ''}" data-a="go" data-v="home"><b>🏠</b>Home</button>
          <button class="${v === 'meeting' ? 'on' : ''}" data-a="go" data-v="meeting"><b>🤝</b>Meeting</button>
          <button class="${v === 'speak' ? 'on' : ''} mic" data-a="go" data-v="speak"><b>🎙️</b></button>
          <button class="${v === 'coach' ? 'on' : ''}" data-a="go" data-v="coach"><b>🤖</b>Coach</button>
          <button class="${v === 'miccheck' ? 'on' : ''}" data-a="go" data-v="miccheck"><b>🎤</b>Mic</button>
        </nav>
      `;

      let content = '';

      // View 1: Home
      if (v === 'home') {
        content = `
          <h1>${t('hi')}, ${esc(S.name)} 👋</h1>
          <p class="mu">${t('sub')}</p>
          <div class="card hero">
            <h2>Speak English Daily with AI Feedback</h2>
            <p style="color:var(--t2)">Practice everyday speaking, fix mistakes, and build fluency. ব্যাখ্যা বাংলায়, অনুশীলন ইংরেজিতে।</p>
            <div class="row">
              <button class="btn p" data-a="go" data-v="speak">🎙️ ${t('start')}</button>
              <button class="btn" data-a="go" data-v="meeting">🤝 Client Meeting AI</button>
              <button class="btn" data-a="go" data-v="miccheck">🎤 Mic Diagnostics</button>
            </div>
          </div>
          <div class="g2">
            <div class="card">
              <h3>Today's Speaking Topic</h3>
              <p><b>${TOP[0][2]}</b></p>
              <div class="mu">${TOP[0][3]}</div>
              <button class="btn s p" style="margin-top:10px" data-a="go" data-v="speak">Start Speaking</button>
            </div>
            <div class="card">
              <h3>Quick Status</h3>
              <div class="g" style="grid-template-columns:1fr 1fr">
                <div class="stat">🔥<b>${streak()}</b>Streak</div>
                <div class="stat">⭐<b>${S.xp}</b>XP</div>
              </div>
            </div>
          </div>
          <h2>Interactive Tools</h2>
          <div class="g2">
            <div class="card h" style="cursor:pointer" data-a="go" data-v="meeting">
              <b>🤝 Client Meeting AI</b>
              <div class="mu">ক্লায়েন্টের কথা শুনে দ্রুত ও আত্মবিশ্বাসী উত্তর তৈরি</div>
            </div>
            <div class="card h" style="cursor:pointer" data-a="go" data-v="coach">
              <b>🤖 AI Coach (ভয়েস ডিকটেশনসহ)</b>
              <div class="mu">যেকোনো প্রশ্ন করুন মুখে বলে বা লিখে</div>
            </div>
            <div class="card h" style="cursor:pointer" data-a="go" data-v="sim">
              <b>🎭 Meeting Simulator</b>
              <div class="mu">AI ক্লায়েন্টের সাথে কণ্ঠ দিয়ে রোলপ্লে করুন</div>
            </div>
            <div class="card h" style="cursor:pointer" data-a="go" data-v="toolkit">
              <b>🧰 Communication Toolkit</b>
              <div class="mu">ইমেইল, প্রপোজাল ও বাংলা→ইংরেজি ট্রান্সলেটর</div>
            </div>
          </div>
        `;
      }
      // View 2: Speak Lab
      else if (v === 'speak') {
        if (st.phase === 'pick') {
          content = `
            <h1>Speak on Any Topic</h1>
            <p class="mu">Choose a topic, tap the microphone, and speak freely in English.</p>
            <div class="g2">
              ${TOP.map(
                (item, idx) => `
                <div class="card h" style="cursor:pointer" data-a="topic" data-v="${idx}">
                  <span class="pill">${item[1]}</span>
                  <h3 style="margin-top:8px">${item[2]}</h3>
                  <div class="mu">${item[3]}</div>
                  <div class="mu">${item[4]} · ~${item[5]} min</div>
                </div>
              `
              ).join('')}
            </div>
          `;
        } else if (st.phase === 'rec') {
          content = `
            <div class="card" style="text-align:center">
              <span class="pill">${st.topic[1]}</span>
              <h2 style="margin-top:8px">${st.topic[2]}</h2>
              <div class="mu">${st.topic[3]}</div>
              <div class="wave ${st.rec ? 'on' : ''}" style="margin:20px 0">${'<i></i>'.repeat(20)}</div>
              <button class="micb ${st.rec ? 'rec' : ''}" data-a="mic" aria-label="Microphone">
                ${st.rec ? '⏹' : '🎤'}
              </button>
              <p style="margin-top:12px"><b>${st.rec ? 'Recording active... Tap ⏹ to finish' : 'Tap 🎤 to start speaking'}</b></p>
              <div class="stat" id="live" style="text-align:left;min-height:64px;margin-top:12px">
                ${esc(st.txt) || '<span class="mu">আপনার বক্তব্য এখানে সরাসরি দেখা যাবে…</span>'}
              </div>
              <div class="row" style="margin-top:10px">
                <textarea id="man" rows="2" placeholder="মাইক ছাড়া সরাসরি টাইপ করতে বা ভয়েস দেখতে…" style="flex:1">${esc(st.txt)}</textarea>
                <button class="btn ${st.dictatingTarget === 'man' ? 'p rec' : ''}" data-a="dictate" data-v="man" title="Speak into textarea">🎤</button>
              </div>
              <div class="row" style="justify-content:center;margin-top:14px">
                <button class="btn p" data-a="done">Analyze &amp; Feedback</button>
                <button class="btn" data-a="back">Change Topic</button>
              </div>
            </div>
          `;
        } else if (st.phase === 'res') {
          const a = st.res;
          content = `
            <h1>Your Speaking Feedback</h1>
            <div class="g" style="margin-bottom:14px">
              <div class="stat"><span class="mu">Speech Clarity</span><b class="sc3">${a.pron}%</b></div>
              <div class="stat"><span class="mu">Fluency Score</span><b class="sc3">${a.flu}%</b></div>
              <div class="stat"><span class="mu">Grammar Score</span><b class="sc3">${a.gram}%</b></div>
              <div class="stat"><span class="mu">Vocabulary Diversity</span><b class="sc3">${a.voc}%</b></div>
            </div>
            <div class="card">
              <h3>What You Said</h3>
              ${gview(st.txt)}
              <div class="mu" style="margin-top:8px">Total: ${a.n} words ${a.wpm ? `· ${a.wpm} WPM` : ''} · Fillers: ${a.fil}</div>
            </div>
            <div class="row">
              <button class="btn p" data-a="back">Speak Again</button>
              <button class="btn" data-a="go" data-v="mist">View Mistakes</button>
            </div>
          `;
        }
      }
      // View 3: Client Meeting AI
      else if (v === 'meeting') {
        const cm = st.cm;
        const it = cm.items[0];
        content = `
          <h1>🤝 Client Meeting AI</h1>
          <p class="mu">ক্লায়েন্টের ইংরেজি শুনে বাংলা অর্থ, শর্ট/ফর্মাল উত্তর এবং কথা বলার সঠিক বাক্য পান।</p>
          <div class="card">
            <div class="row">
              <button class="btn p" style="min-height:56px;font-size:17px;flex:1" data-a="cmlisten">
                ${cm.on ? '⏹ শোনা বন্ধ করুন' : '🎧 ক্লায়েন্টের কথা শুনুন'}
              </button>
            </div>
            <p class="mu" style="margin:8px 0">${cm.on ? '🔴 মাইক চালু আছে — ক্লায়েন্ট কথা বললে এখানে ট্রান্সক্রিপ্ট ও সাজেশন তৈরি হবে।' : 'অনলাইন কলে স্পিকারে ক্লায়েন্টের কথা থাকলে মাইক ধরতে পারে; অথবা নিচে টাইপ/বলুন।'}</p>
            <div class="stat" id="cmlive" style="text-align:left;min-height:48px;font-style:italic">
              ${esc(cm.txt || cm.interim) || 'ক্লায়েন্ট যা বলবে এখানে সরাসরি দেখা যাবে…'}
            </div>
            <div class="row" style="margin-top:10px">
              <input id="cmin" placeholder="অথবা ক্লায়েন্টের প্রশ্ন এখানে লিখুন বা মাইকে বলুন..." style="flex:1" />
              <button class="btn ${st.dictatingTarget === 'cmin' ? 'p rec' : ''}" data-a="dictate" data-v="cmin" title="Speak to type query">🎤</button>
              <button class="btn p" data-a="cmgen">উত্তর তৈরি</button>
            </div>
            <div class="row" style="margin-top:10px">
              <button class="btn s" data-a="go" data-v="miccheck">🎤 Mic Check</button>
              <button class="btn s" data-a="cmclear">🗑 Clear</button>
            </div>
          </div>
          ${
            it
              ? `
            <div class="card" style="border-color:var(--pr)">
              <div class="row">
                <span class="pill">${it.src === 'ai' ? '🤖 AI উত্তর' : '⚡ দ্রুত টেমপ্লেট'}</span>
                ${it.pend ? `<span class="mu">⏳ AI উত্তর তৈরি করছে…</span>` : ''}
              </div>
              <p class="mu" style="margin:8px 0 2px">🇧🇩 ক্লায়েন্টের কথা: <b>${esc(it.gist || '')}</b></p>
              <p class="mu" style="margin:0 0 8px">"${esc(it.q)}"</p>
              <div style="font-size:20px;font-weight:700;line-height:1.5;margin:8px 0;color:var(--pr2)">
                ${esc(it.reply)}
              </div>
              <div class="row">
                <button class="btn p s" data-a="say" data-v="${ea(it.reply)}">🔊 শুনুন</button>
                <button class="btn s" data-a="cmcopy" data-v="0|reply">📋 Copy</button>
              </div>
              ${it.short ? `<div class="fix" style="margin-top:10px"><b>সংক্ষিপ্ত সংস্করণ:</b> ${esc(it.short)}</div>` : ''}
              ${it.ask ? `<div class="fix"><b>পাল্টা প্রশ্ন:</b> ${esc(it.ask)}</div>` : ''}
            </div>
          `
              : ''
          }
        `;
      }
      // View 4: Mic Check & Diagnostics
      else if (v === 'miccheck') {
        const mc = st.mc;
        const nt = mc.noiseTest || {};
        content = `
          <h1>🎤 Microphone Check &amp; Diagnostics</h1>
          <p class="mu">মাইক্রোফোন, রিয়েল-টাইম অডিও ওয়েভফর্ম, গেইন স্লাইডার এবং ব্যাকগ্রাউন্ড নয়েজ (SNR) পরীক্ষা করুন।</p>
          
          <!-- 1. Real-Time Audio Waveform Canvas Visualizer -->
          <div class="card">
            <div class="row">
              <h3 style="margin:0">🌊 রিয়েল-টাইম অডিও ওয়েভফর্ম (Canvas API Visualizer)</h3>
              <span class="sp"></span>
              <button class="btn s ${mc.liveWaveform ? 'p' : ''}" data-a="mctogglelive">
                ${mc.liveWaveform ? '⏹ লাইভ মনিটর বন্ধ' : '▶ লাইভ ওয়েভফর্ম চালু করুন'}
              </button>
            </div>
            <p class="mu" style="margin-top:6px">মাইকের কাছে কথা বলুন বা ফুঁ দিন—ক্যানভাসে সরাসরি টাইম-ডোমেইন ওয়েভফর্ম ও স্পেকট্রাম অ্যানিমেশন দেখা যাবে।</p>
            <canvas id="mc-waveform-canvas" width="600" height="150" style="width:100%;height:150px;border-radius:14px;background:#090F20;border:1px solid var(--br);display:block;margin:12px 0;"></canvas>
            <div class="row" style="font-size:12px;color:var(--mu)">
              <span>লেভেল ইন্ডিকেটর:</span>
              <div class="bar" style="flex:1;height:12px"><i id="mcbar" style="width:${mc.lvl}%"></i></div>
              <span style="min-width:35px;text-align:right">${mc.lvl}%</span>
            </div>
          </div>

          <!-- 2. Input Gain Slider, Startup Settings & Hardware Constraints -->
          <div class="card">
            <div class="row">
              <h3 style="margin:0">🎛️ মাইক্রোফোন ইনপুট গেইন (Input Gain Volume)</h3>
              <span class="sp"></span>
              <span class="pill" style="background:var(--s3);color:var(--pr2)">
                <b id="gain-label">${(S.micGain || 1.0).toFixed(1)}x</b>
                ${(S.micGain || 1.0) > 1.2 ? ' (Boosted)' : (S.micGain || 1.0) < 0.9 ? ' (Reduced)' : ' (Normal)'}
              </span>
            </div>
            <p class="mu" style="margin-top:6px">ডায়াগনস্টিক বা কথা বলার আগে মাইকের ভলিউম নরমাল বা সফটওয়্যার বুস্ট করতে এই স্লাইডার পরিবর্তন করুন:</p>
            <div class="row" style="margin-top:8px;align-items:center">
              <span class="mu" style="font-size:12px">0.5x</span>
              <input type="range" id="mcgain" min="0.5" max="3.0" step="0.1" value="${S.micGain || 1.0}" style="flex:1" />
              <span class="mu" style="font-size:12px">3.0x</span>
            </div>

            <!-- Auto-check on Startup Setting -->
            <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--br)">
              <div class="row" style="align-items:center">
                <div>
                  <h4 style="margin:0;display:flex;align-items:center;gap:6px">
                    <span>⚡</span> Auto-check on Startup (স্টার্টআপে স্বয়ংক্রিয় মাইক পরীক্ষা)
                  </h4>
                  <p class="mu" style="margin:4px 0 0;font-size:12px">অ্যাপ ওপেন করার সাথে সাথে স্বয়ংক্রিয়ভাবে দ্রুত মাইক্রোফোন ইনপুট লেভেল টেস্ট চালাবে।</p>
                </div>
                <span class="sp"></span>
                <label class="chip ${S.autoCheckOnStartup ? 'on' : ''}" style="cursor:pointer;font-weight:700">
                  <input type="checkbox" data-a="toggleautocheck" ${S.autoCheckOnStartup ? 'checked' : ''} style="margin-right:6px" />
                  ${S.autoCheckOnStartup ? 'চালু (Enabled)' : 'বন্ধ (Disabled)'}
                </label>
              </div>

              <div class="row" style="margin-top:10px;align-items:center">
                <button class="btn s ${mc.quickChecking ? 'p' : ''}" data-a="mcquickcheck" ${mc.quickChecking ? 'disabled' : ''}>
                  ${mc.quickChecking ? `⏳ দ্রুত টেস্ট চলছে (${mc.quickCheckProgress}%)…` : '⚡ কুইক ইনপুট লেভেল টেস্ট চালান (Quick Test)'}
                </button>
                ${
                  mc.quickChecking
                    ? `
                  <div class="bar" style="flex:1;height:8px;max-width:140px"><i style="width:${mc.quickCheckProgress}%;background:var(--ac)"></i></div>
                `
                    : ''
                }
                ${
                  mc.startupCheck?.tested
                    ? `
                  <span class="pill" style="font-size:11px;background:${mc.startupCheck.success && !mc.startupCheck.lowLevel ? 'rgba(0,201,141,0.18)' : 'rgba(245,158,11,0.18)'};color:${mc.startupCheck.success && !mc.startupCheck.lowLevel ? 'var(--pr2)' : 'var(--am)'}">
                    ${mc.startupCheck.success && !mc.startupCheck.lowLevel ? '✅ মাইক রেডি' : '⚠️ ইনপুট কম'} (${mc.startupCheck.level}%) · ${mc.startupCheck.time}
                  </span>
                `
                    : ''
                }
              </div>

              ${
                mc.startupCheck?.tested
                  ? `
                <div class="fix" style="margin-top:10px;border-color:${mc.startupCheck.success && !mc.startupCheck.lowLevel ? 'var(--pr)' : 'var(--am)'}">
                  <b>${mc.startupCheck.success && !mc.startupCheck.lowLevel ? '✅ কুইক টেস্ট ফলাফল:' : '⚠️ কুইক টেস্ট সতর্কতা:'}</b>
                  <div style="margin-top:2px;font-size:13px">${esc(mc.startupCheck.msg)}</div>
                </div>
              `
                  : ''
              }
            </div>

            <h4 style="margin:16px 0 6px">⚙️ ব্রাউজার অডিও কনস্ট্রেইন্ট (Troubleshoot Distorted Audio)</h4>
            <p class="mu">যদি কথা কাটা কাটা বা রোবোটিক শোনায়, তবে নিচের ফিল্টারগুলো অন/অফ করে দেখুন:</p>
            <div class="row" style="margin-top:8px">
              <label class="chip ${S.audioConstraints?.echoCancellation ? 'on' : ''}" style="cursor:pointer">
                <input type="checkbox" data-a="toggleconstraint" data-v="echoCancellation" ${S.audioConstraints?.echoCancellation ? 'checked' : ''} style="margin-right:6px" />
                Echo Cancellation (প্রতিধ্বনি রোধ)
              </label>
              <label class="chip ${S.audioConstraints?.noiseSuppression ? 'on' : ''}" style="cursor:pointer">
                <input type="checkbox" data-a="toggleconstraint" data-v="noiseSuppression" ${S.audioConstraints?.noiseSuppression ? 'checked' : ''} style="margin-right:6px" />
                Noise Suppression (নয়েজ সাপ্রেশন)
              </label>
              <label class="chip ${S.audioConstraints?.autoGainControl ? 'on' : ''}" style="cursor:pointer">
                <input type="checkbox" data-a="toggleconstraint" data-v="autoGainControl" ${S.audioConstraints?.autoGainControl ? 'checked' : ''} style="margin-right:6px" />
                Auto Gain Control (অটো লেভেল)
              </label>
            </div>
          </div>

          <!-- 3. Background Noise Test & SNR Diagnostics -->
          <div class="card" style="border-color:${nt.step === 'done' ? nt.verdictColor : 'var(--br)'}">
            <div class="row">
              <h3 style="margin:0">🛡️ ব্যাকগ্রাউন্ড নয়েজ ও সিগন্যাল-টু-নয়েজ রেশিও (SNR) টেস্ট</h3>
              <span class="sp"></span>
              <button class="btn p" data-a="mcnoise" ${nt.running ? 'disabled' : ''}>
                ${nt.running ? '⏳ টেস্ট চলছে…' : '🔊 Background Noise Test শুরু করুন'}
              </button>
            </div>
            <p class="mu" style="margin-top:6px">পরিবেশে অতিরিক্ত ফ্যান বা কোলাহল থাকলে ভয়েস রিকগনিশনে সমস্যা হতে পারে। এই টেস্ট নীরবতা ও কথার সাউন্ড রেশিও পরিমাপ করে পরিবেশ মূল্যায়ন করে।</p>
            
            ${
              nt.step === 'silence'
                ? `
              <div class="fix" style="border-color:var(--ac);margin:14px 0">
                <b style="font-size:19px;color:var(--ac)">🤫 ধাপ ১/২: অনুগ্রহ করে ${nt.countdown} সেকেন্ড সম্পূর্ণ নীরব থাকুন</b>
                <p class="mu" style="margin:4px 0">পরিবেশের স্বাভাবিক ব্যাকগ্রাউন্ড নয়েজ (Ambient Noise Floor) পরিমাপ করা হচ্ছে...</p>
                <div class="bar" style="margin-top:10px;height:10px"><i style="width:${((4 - nt.countdown) / 3) * 100}%;background:var(--ac)"></i></div>
              </div>
            `
                : ''
            }

            ${
              nt.step === 'speak'
                ? `
              <div class="fix" style="border-color:var(--pr);margin:14px 0">
                <b style="font-size:19px;color:var(--pr2)">🗣️ ধাপ ২/২: স্বাভাবিক স্বরে কথা বলুন (${nt.countdown}s)</b>
                <p style="margin:4px 0">যেমন বলুন: <i>"Hello Speakly, checking my voice signal level."</i></p>
                <div class="bar" style="margin-top:10px;height:10px"><i style="width:${((4 - nt.countdown) / 3) * 100}%;background:var(--pr2)"></i></div>
              </div>
            `
                : ''
            }

            ${
              nt.step === 'done'
                ? `
              <div class="card hero" style="margin-top:14px;background:var(--s2);border-color:${nt.verdictColor}">
                <div class="row">
                  <span class="pill" style="font-size:14px;background:${nt.verdictColor};color:#04120D"><b>SNR: +${nt.snrDb} dB</b></span>
                  <span class="sp"></span>
                  <b style="font-size:17px;color:${nt.verdictColor}">${esc(nt.verdict)}</b>
                </div>
                <div class="g" style="margin:14px 0">
                  <div class="stat"><span class="mu">Noise Floor (নীরবতা)</span><b>${nt.noiseDb} dB</b><span class="mu" style="font-size:11px">${nt.noiseRms}% RMS</span></div>
                  <div class="stat"><span class="mu">Voice Signal (কথা)</span><b>${nt.signalDb} dB</b><span class="mu" style="font-size:11px">${nt.signalRms}% RMS</span></div>
                  <div class="stat"><span class="mu">Signal-to-Noise Ratio</span><b style="color:${nt.verdictColor}">+${nt.snrDb} dB</b><span class="mu" style="font-size:11px">${nt.snrDb >= 15 ? 'Excellent' : nt.snrDb >= 8 ? 'Good' : 'Needs attention'}</span></div>
                </div>
                <p style="margin:6px 0;line-height:1.6"><b>মূল্যায়ন:</b> ${esc(nt.msg)}</p>
                <div class="row" style="margin-top:12px;flex-wrap:wrap;gap:8px">
                  <button class="btn s" data-a="mcnoise">↺ পুনরায় নয়েজ টেস্ট করুন</button>
                  <button class="btn s p" data-a="mcrun">সম্পূর্ণ ডায়াগনস্টিক টেস্ট</button>
                  <button class="btn s" data-a="mcdownloadreport">📥 Download Report (JSON)</button>
                </div>
              </div>
            `
                : ''
            }
          </div>

          <!-- 4. Recharts Historical SNR Trend Line Chart -->
          <div class="card">
            <h3>📈 SNR হিস্টোরিক্যাল ট্রেন্ড লাইন (Recharts)</h3>
            <p class="mu">আপনার রেকর্ডিং পরিবেশ কতটা শান্ত হচ্ছে তা সময়ের সাথে ট্রেন্ড লাইনে পর্যবেক্ষণ করুন:</p>
            <div id="mc-snr-chart-root" style="width:100%;height:210px;margin-top:10px;"></div>
          </div>

          <!-- 5. Hardware & Permission Diagnostics -->
          <div class="card">
            <h3>পরিবেশ ও পারমিশন ডায়াগনস্টিকস</h3>
            <div class="mu" style="margin-top:6px;line-height:1.8">
              <div>✅ নিরাপদ সংযোগ (HTTPS / localhost): <b>${window.isSecureContext ? 'হ্যাঁ' : 'না'}</b></div>
              <div>✅ ব্রাউজারে স্পিচ রিকগনিশন আছে: <b>${window.SpeechRecognition || window.webkitSpeechRecognition ? 'হ্যাঁ' : 'না (Chrome সুপারিশকৃত)'}</b></div>
              <div>✅ মাইক্রোফোন হার্ডওয়্যার API (getUserMedia): <b>${navigator.mediaDevices && Boolean(navigator.mediaDevices.getUserMedia) ? 'হ্যাঁ' : 'না'}</b></div>
              <div>✅ AI Studio আইফ্রেম পারমিশন: <b>অনুমোদিত (requestFramePermissions: microphone)</b></div>
            </div>
            <div class="row" style="margin-top:16px;flex-wrap:wrap;gap:8px">
              <button class="btn p" data-a="mcrun" ${mc.run ? 'disabled' : ''}>
                ${mc.run ? '⏳ পরীক্ষা চলছে…' : '▶ সম্পূর্ণ মাইক্রোফোন টেস্ট চালান'}
              </button>
              <button class="btn" data-a="mcdownloadreport">
                📥 Download Diagnostics Report
              </button>
            </div>
            <p class="mu" id="mcmsg">${mc.run ? 'মাইকের কাছে স্পষ্ট স্বরে কিছু বলুন (যেমন: "Hello Speakly")...' : 'টেস্ট চালাতে বাটন চাপুন।'}</p>
            ${
              mc.txt
                ? `<div class="fix" style="border-color:var(--pr)"><b>✅ ব্রাউজার যা শুনেছে:</b> "${esc(mc.txt)}"</div>`
                : ''
            }
            ${mc.res
              .map(
                (item: any) => `
              <div class="fix" style="border-color:${item[0] === 'ok' ? 'var(--pr)' : item[0] === 'warn' ? 'var(--am)' : 'var(--rd)'}">
                <b>${item[0] === 'ok' ? '✅' : item[0] === 'warn' ? '⚠️' : '❌'} ${esc(item[1])}</b>
                <div class="mu">${esc(item[2])}</div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- 6. Export Diagnostics Report Card -->
          <div class="card" style="background:var(--s2);border-color:rgba(0,201,141,0.25)">
            <div class="row" style="align-items:center;flex-wrap:wrap;gap:12px">
              <div style="flex:1;min-width:240px">
                <h3 style="margin:0;display:flex;align-items:center;gap:6px">
                  <span>📥</span> Download Diagnostics Report
                </h3>
                <p class="mu" style="margin:4px 0 0;font-size:13px">
                  বর্তমান SNR টেস্টের ফলাফল, হার্ডওয়্যার সক্ষমতা ও পরিবেশ মূল্যায়নের সম্পূর্ণ বিবরণ JSON ফরম্যাটে এক্সপোর্ট করে সংরক্ষণ করুন।
                </p>
              </div>
              <button class="btn p" data-a="mcdownloadreport">
                📥 Download Diagnostics Report (.json)
              </button>
            </div>
          </div>
        `;
      }
      // View 5: Meeting Simulator
      else if (v === 'sim') {
        const sm = st.sm;
        content = `
          <h1>🎭 Meeting Simulator</h1>
          <p class="mu">বাস্তব ক্লায়েন্ট ইন্টারভিউ এবং মিটিং রোলপ্লে। AI প্রশ্ন করবে, আপনি উত্তর দেবেন।</p>
          <div class="card">
            <h3>দৃশ্য বাছুন</h3>
            <div class="row sc">
              <button class="chip ${sm.scn === 'discovery' ? 'on' : ''}" data-a="smscn" data-v="discovery">Discovery Call</button>
              <button class="chip ${sm.scn === 'pricing' ? 'on' : ''}" data-a="smscn" data-v="pricing">Pricing &amp; Budget</button>
              <button class="chip ${sm.scn === 'deadline' ? 'on' : ''}" data-a="smscn" data-v="deadline">Project Deadlines</button>
              <button class="chip ${sm.scn === 'revisions' ? 'on' : ''}" data-a="smscn" data-v="revisions">Revision Request</button>
            </div>
            <div class="row" style="margin-top:14px">
              <button class="btn p" data-a="smstart">${sm.on ? 'নতুন করে শুরু' : '▶ রোলপ্লে শুরু করুন'}</button>
            </div>
          </div>
          ${
            sm.log.length
              ? `
            <div class="card" style="max-height:48vh;overflow-y:auto">
              ${sm.log
                .map(
                  (m: any) => `
                <div class="fix" style="border-color:${m.t === 'you' ? 'var(--ac)' : 'var(--pr)'}">
                  <b>${m.t === 'you' ? 'আপনি' : '🧑‍💼 Client'}</b>
                  <div>${esc(m.content)}</div>
                  ${m.t === 'client' ? `<button class="btn s" data-a="say" data-v="${ea(m.content)}">🔊</button>` : ''}
                </div>
              `
                )
                .join('')}
            </div>
            <div class="card">
              <p class="mu">আপনার উত্তর দিন:</p>
              <div class="row">
                <input id="smin" placeholder="উত্তরে কী বলবেন লিখুন বা মাইকে বলুন..." style="flex:1" />
                <button class="btn ${st.dictatingTarget === 'smin' ? 'p rec' : ''}" data-a="dictate" data-v="smin" title="Speak your response">🎤</button>
                <button class="btn p" data-a="smsend">Send</button>
              </div>
            </div>
          `
              : ''
          }
        `;
      }
      // View 6: Confidence Training
      else if (v === 'hesit') {
        const h = st.hz;
        content = `
          <h1>💪 Confidence Training</h1>
          <p class="mu">জড়তা কাটিয়ে উঠতে স্ক্রিপ্ট থেকে ধাপে ধাপে স্বতঃস্ফূর্ত কথা বলা শিখুন।</p>
          <div class="card">
            <h3>প্রশ্ন বেছে অনুশীলন করুন:</h3>
            <div class="row sc">
              <button class="chip" data-a="hzpick" data-v="0">How much will this project cost?</button>
              <button class="chip" data-a="hzpick" data-v="1">When can you deliver the project?</button>
              <button class="chip" data-a="hzpick" data-v="2">Why does SEO take so long?</button>
              <button class="chip" data-a="hzpick" data-v="3">Why was the project delayed?</button>
            </div>
          </div>
          ${
            h.stage > 0
              ? `
            <div class="card">
              <span class="pill">Stage ${h.stage}: ${['পড়ুন ও বুঝুন', 'স্ক্রিপ্ট দেখে বলুন', 'কীওয়ার্ড দেখে বলুন', 'স্ক্রিপ্ট ছাড়া বলুন'][h.stage - 1] || 'অনুশীলন'}</span>
              <h3 style="margin-top:10px">প্রশ্ন: "${esc(h.q)}"</h3>
              <div style="font-size:18px;margin:12px 0;line-height:1.6">${esc(h.a)}</div>
              <div class="row">
                <input id="hzin" placeholder="স্ক্রিপ্ট দেখে বা না দেখে কথা বলুন..." style="flex:1" />
                <button class="btn ${st.dictatingTarget === 'hzin' ? 'p rec' : ''}" data-a="dictate" data-v="hzin" title="Speak into input">🎤</button>
                <button class="btn s" data-a="say" data-v="${ea(h.a)}">🔊 শুনুন</button>
                <button class="btn s p" data-a="hznext">পরের ধাপ →</button>
              </div>
            </div>
          `
              : ''
          }
        `;
      }
      // View: AI Coach
      else if (v === 'coach') {
        content = `
          <h1>🤖 AI Coach</h1>
          <p class="mu">ইংরেজি বলা, ব্যাকরণ সংশোধন বা ইন্টারভিউ নিয়ে যেকোনো প্রশ্ন করুন—মুখে বলে বা লিখে।</p>
          <div class="row sc" style="margin-bottom:12px">
            <button class="chip" data-a="cq2" data-v="Correct my grammar: I go to market yesterday">Correct my grammar: I go to market yesterday</button>
            <button class="chip" data-a="cq2" data-v="How do I introduce myself to a foreign client?">How to introduce myself?</button>
            <button class="chip" data-a="cq2" data-v="Give me 3 polite phrases to negotiate prices.">Price negotiation phrases</button>
          </div>
          <div class="card" style="min-height:220px;max-height:50vh;overflow-y:auto">
            ${st.chat
              .map(
                (m: any) => `
              <div class="fix" style="border-color:${m.role === 'user' ? 'var(--ac)' : 'var(--pr)'}">
                <b>${m.role === 'user' ? 'You' : 'Coach'}</b>
                <div>${m.role === 'user' ? gview(m.content) : esc(m.content)}</div>
                ${m.role === 'assistant' ? `<button class="btn s" data-a="say" data-v="${ea(m.content)}">🔊 Listen</button>` : ''}
              </div>
            `
              )
              .join('')}
            ${st.busy ? `<div class="mu">Coach is thinking…</div>` : ''}
          </div>
          <div class="row" style="margin-top:12px">
            <input id="cin" placeholder="যেকোনো প্রশ্ন করুন (ইংরেজিতে বা বাংলায়)..." style="flex:1" />
            <button class="btn ${st.dictatingTarget === 'cin' ? 'p rec' : ''}" data-a="dictate" data-v="cin" title="Speak your question">🎤</button>
            <button class="btn p" data-a="csend">Send</button>
          </div>
        `;
      }
      // View: Communication & Client Answers
      else if (v === 'comm') {
        content = `
          <h1>💬 Communication &amp; Client Answers</h1>
          <p class="mu">বাক্য বানানোর নিয়ম এবং ক্লায়েন্টের প্রশ্নের আত্মবিশ্বাসী উত্তর তৈরির অনুশীলন।</p>
          <div class="card">
            <h3>১) বাক্য গঠনের সূত্র</h3>
            <div class="hero card" style="padding:14px"><b>Subject + Verb + Object + Time</b><div class="mu">কে + কী করল/করে + কাকে/কী + কখন</div></div>
          </div>
          <div class="card">
            <h3>২) ক্লায়েন্টের প্রশ্নের উত্তর দিন</h3>
            <p><b>Client: "Why was my project delayed and when can you deliver it?"</b></p>
            <div class="row" style="margin-top:10px">
              <textarea id="ca" rows="3" placeholder="আপনার উত্তর ইংরেজিতে লিখুন বা মুখে বলুন..." style="flex:1"></textarea>
              <button class="btn ${st.dictatingTarget === 'ca' ? 'p rec' : ''}" data-a="dictate" data-v="ca" title="Speak answer">🎤</button>
            </div>
            <div class="row" style="margin-top:10px">
              <button class="btn p" data-a="cchk">Check Answer</button>
              <button class="btn" data-a="say" data-v="I apologize for the delay. An unexpected bug occurred during testing. The complete project will be delivered by tomorrow morning.">Model Answer</button>
            </div>
            <div id="cres" style="margin-top:8px"></div>
          </div>
        `;
      }
      // View: Communication Toolkit
      else if (v === 'toolkit') {
        const tk = st.tk;
        content = `
          <h1>🧰 Communication Toolkit</h1>
          <p class="mu">টেমপ্লেট, বাংলা→ইংরেজি ট্রান্সলেটর ও ক্লায়েন্ট মিটিং প্রস্তুতি।</p>
          <div class="row sc" style="margin-bottom:12px">
            <button class="chip ${tk.tab === 'templates' ? 'on' : ''}" data-a="tktab" data-v="templates">Templates</button>
            <button class="chip ${tk.tab === 'b2e' ? 'on' : ''}" data-a="tktab" data-v="b2e">বাংলা→ইংরেজি</button>
          </div>
          ${
            tk.tab === 'templates'
              ? `
            <div class="card">
              <h3>Professional Proposal &amp; Status Templates</h3>
              <p><b>Client Proposal:</b></p>
              <textarea id="tkbody" rows="6">Hello, based on our discussion, I have prepared the plan for your project. The delivery time is 5 days and total cost is $200. Let me know if you would like to proceed.</textarea>
              <div class="row" style="margin-top:10px">
                <button class="btn s p" data-a="cmcopy" data-v="0|tk">Copy Template</button>
                <button class="btn s" data-a="say" data-v="Hello, based on our discussion, I have prepared the plan for your project.">🔊 Listen</button>
              </div>
            </div>
          `
              : `
            <div class="card">
              <h3>বাংলায় লিখুন বা মুখে বলুন:</h3>
              <div class="row">
                <textarea id="b2ein" rows="3" placeholder="যেমন: ক্লায়েন্টকে বলুন কাজটি কাল শেষ হবে..." style="flex:1"></textarea>
                <button class="btn ${st.dictatingTarget === 'b2ein' ? 'p rec' : ''}" data-a="dictate" data-v="b2ein" title="Speak Bengali or English">🎤</button>
              </div>
              <div class="row" style="margin-top:12px">
                <button class="btn p" data-a="b2ego">ইংরেজি করুন</button>
              </div>
              <div id="b2eres" style="margin-top:12px"></div>
            </div>
          `
          }
        `;
      }
      // View: My Mistakes
      else if (v === 'mist') {
        content = `
          <h1>📓 My Mistakes (ভুলের খাতা)</h1>
          <p class="mu">কথা বলার সময় যত ভুল হয়, তা স্বয়ংক্রিয়ভাবে এখানে জমা হয়।</p>
          <div class="card">
            ${
              S.mb && S.mb.length
                ? S.mb
                    .map(
                      (m: any) => `
                  <div class="fix">
                    <s>${esc(m.orig)}</s><br/>
                    <b style="color:var(--pr2)">✅ ${esc(m.fix)}</b>
                    <div class="mu">${esc(m.why || '')}</div>
                    <div class="row" style="margin-top:6px">
                      <button class="btn s" data-a="say" data-v="${ea(m.fix)}">🔊 Listen</button>
                    </div>
                  </div>
                `
                    )
                    .join('')
                : `<p class="mu">এখনো কোনো ভুল রেকর্ড হয়নি। Speaking বা Live Talk করলে ভুল স্বয়ংক্রিয়ভাবে এখানে আসবে।</p>`
            }
          </div>
        `;
      }
      // View: IELTS Hub
      else if (v === 'ielts' || v === 'ird' || v === 'iwr' || v === 'isp' || v === 'ilis') {
        content = `
          <h1>🎓 IELTS Preparation</h1>
          <p class="mu">Academic ও General Training মডেল টেস্ট এবং অ্যানালাইসিস।</p>
          <div class="g2">
            <div class="card h" style="cursor:pointer" data-a="go" data-v="ird">
              <b>📖 Reading</b>
              <div class="mu">প্যাসেজ, প্রশ্ন ও উত্তর ব্যাখ্যাসহ ট্র্যাকিং</div>
            </div>
            <div class="card h" style="cursor:pointer" data-a="go" data-v="ilis">
              <b>🎧 Listening</b>
              <div class="mu">অডিও প্লেয়ার ও ফিল-ইন-দ্য-ব্ল্যাঙ্কস প্রশ্ন</div>
            </div>
            <div class="card h" style="cursor:pointer" data-a="go" data-v="iwr">
              <b>✍️ Writing</b>
              <div class="mu">Task 1 ও Task 2 প্রবন্ধ মূল্যায়ন (ভয়েস ডিকটেশন সহ)</div>
            </div>
            <div class="card h" style="cursor:pointer" data-a="go" data-v="isp">
              <b>🗣️ Speaking</b>
              <div class="mu">Part 1, Part 2 কিউ-কার্ড এবং Part 3 ডিসকাশন</div>
            </div>
          </div>
          <div class="card" style="margin-top:16px">
            <h3>IELTS Writing Task 2 Practice</h3>
            <p><b>Prompt:</b> "Some people think universities should focus on practical skills for employment rather than academic knowledge. Discuss both views."</p>
            <div class="row" style="margin-top:8px">
              <textarea id="iwtxt" rows="5" placeholder="Write or dictate your essay here..." style="flex:1"></textarea>
              <button class="btn ${st.dictatingTarget === 'iwtxt' ? 'p rec' : ''}" data-a="dictate" data-v="iwtxt" title="Dictate essay">🎤</button>
            </div>
            <div class="row" style="margin-top:10px">
              <button class="btn p s" data-a="iwcheck">Evaluate Essay</button>
            </div>
            <div id="iwres" style="margin-top:8px"></div>
          </div>
        `;
      }
      // View: Pronunciation Lab
      else if (v === 'pron') {
        const w = WORDS.find(x => x[0] === st.pw) || WORDS[0];
        const sy = SYL[w[0]] || [w[0]];
        content = `
          <h1>${t('pron')}</h1>
          <div class="row sc" style="margin:10px 0">
            ${Object.keys(SYL)
              .map(
                k => `
              <button class="chip ${k === st.pw ? 'on' : ''}" data-a="pw" data-v="${k}">${k}</button>
            `
              )
              .join('')}
          </div>
          <div class="card" style="text-align:center">
            <h1>${w[0]}</h1>
            <div class="mu">/${w[1]}/ · ${w[3]}</div>
            <p>${w[7]}</p>
            <div class="row" style="justify-content:center">
              <button class="btn" data-a="say" data-v="${w[0]}">🔊 Normal</button>
              <button class="btn" data-a="slow" data-v="${w[0]}">🐢 Slow</button>
            </div>
            <button class="micb" style="margin:20px 0" data-a="pmic" aria-label="Record yourself">🎤</button>
            <div id="pr">
              ${
                st.pres
                  ? sy
                      .map(
                        (s, i) => `
                    <span class="syl ${st.pres[i] ? 'ok' : 'no'}">${st.pres[i] ? '✓' : '△'} ${s}</span>
                  `
                      )
                      .join('') +
                    `<p><b>${st.pres.every((x: any) => x) ? 'Great pronunciation! 🎉' : 'Practice the highlighted syllable again.'}</b></p>`
                  : `<span class="mu">Record yourself to compare pronunciation.</span>`
              }
            </div>
          </div>
        `;
      }
      // View: Pronunciation Tips
      else if (v === 'ptips') {
        content = `
          <h1>🗣️ ${t('ptips')}</h1>
          <p class="mu">বাংলাভাষীদের সাধারণ উচ্চারণ সমস্যা ও সমাধান।</p>
          <div class="g2">
            ${PT.map(
              item => `
              <div class="card">
                <h3>${item.t}</h3>
                <div class="fix">${item.tip}</div>
                <div class="row" style="margin-top:10px">
                  ${item.w
                    .map(
                      pair => `
                    <button class="btn s" data-a="say" data-v="${pair.join(' ')}">🔊 ${pair.join(' vs ')}</button>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
            ).join('')}
          </div>
        `;
      }
      // View: Stories
      else if (v === 'stories') {
        content = `
          <h1>📖 30-Day Speaking Stories</h1>
          <p class="mu">প্রতিদিন একটি গল্প জোরে পড়ুন এবং ফ্লুয়েন্সি বাড়ান।</p>
          <div class="g2">
            ${STORY.map(
              (s, i) => `
              <div class="card h">
                <span class="pill">Chapter ${i + 1} · ${s[2]}</span>
                <h3 style="margin-top:6px">${s[0]}</h3>
                <div class="mu">${s[1]}</div>
                <p style="margin:10px 0">"${s[3][0]}"</p>
                <div class="row">
                  <button class="btn s" data-a="say" data-v="${s[3].join(' ')}">🔊 Listen</button>
                  <button class="btn s p" data-a="go" data-v="speak">🎙️ Read Aloud</button>
                </div>
              </div>
            `
            ).join('')}
          </div>
        `;
      }
      // View: Vocabulary Vault
      else if (v === 'vocab') {
        content = `
          <h1>📚 Vocabulary Vault</h1>
          <p class="mu">বাংলা অর্থ, আইপিএ উচ্চারণ এবং ব্যবহারিক বাক্যসহ শব্দভান্ডার।</p>
          <div class="g2">
            ${WORDS.map(
              w => `
              <div class="card">
                <div class="row">
                  <h3 style="margin:0">${w[0]}</h3>
                  <span class="pill">${w[2]}</span>
                </div>
                <div class="mu">${w[1] ? `/${w[1]}/` : ''} · <b>${w[3]}</b></div>
                <p class="mu">${w[6]}</p>
                <p><i>"${w[7]}"</i></p>
                <div class="row">
                  <button class="btn s" data-a="say" data-v="${w[0]}">🔊 Listen</button>
                  <button class="btn s p" data-a="go" data-v="pron">Practice Sound</button>
                </div>
              </div>
            `
            ).join('')}
          </div>
        `;
      }
      // View: Profile & Settings
      else if (v === 'me') {
        content = `
          <h1>👤 Profile &amp; Settings</h1>
          <div class="card">
            <h3>Your Profile</h3>
            <p class="mu">Name</p>
            <input id="nm" value="${esc(S.name)}" />
            <p class="mu" style="margin-top:10px">Daily Goal (minutes)</p>
            <input id="gl" type="number" value="${S.goal}" />
            <div class="row" style="margin-top:16px">
              <button class="btn p" data-a="saveme">Save Profile</button>
              <button class="btn" data-a="go" data-v="miccheck">🎤 Mic Diagnostics</button>
            </div>
          </div>
        `;
      }
      // Fallback
      else {
        content = `
          <h1>${t(v) || 'Dashboard'}</h1>
          <div class="card">
            <p class="mu">নিয়মিত স্পিকিং ও লিসনিং অনুশীলন চালিয়ে যান।</p>
            <div class="row">
              <button class="btn p" data-a="go" data-v="home">হোম ড্যাশবোর্ড</button>
              <button class="btn" data-a="go" data-v="miccheck">🎤 Mic Check</button>
            </div>
          </div>
        `;
      }

      return `
        <div id="shell">
          ${side}
          <main id="main">
            ${top}
            ${micBanner()}
            ${content}
          </main>
        </div>
        ${bottomNav}
      `;
    };

    // Action Dispatcher
    const A: Record<string, (val?: any) => void> = {
      go(v: string) {
        if (v !== 'miccheck') {
          stopWaveformMonitor();
        }
        st.phase = 'pick';
        S.view = v;
        save();
        R();
        window.scrollTo(0, 0);
      },
      lang() {
        S.lang = S.lang === 'en' ? 'bn' : 'en';
        save();
        R();
      },
      topic(idx: any) {
        st.topic = TOP[+idx] || TOP[0];
        st.phase = 'rec';
        st.txt = '';
        R();
      },
      back() {
        if (st.rec) {
          try { st.rec.stop(); } catch (e) {}
          st.rec = null;
        }
        st.phase = 'pick';
        R();
      },
      mic() {
        if (st.rec) {
          try { st.rec.stop(); } catch (e) {}
          st.rec = null;
          R();
          return;
        }

        st.t0 = Date.now();
        st.txt = '';
        st.conf = [];

        const r = listen(
          (text, cf) => {
            st.rec = null;
            if (text) st.txt = text;
            st.conf = cf;
            const man = document.getElementById('man') as HTMLTextAreaElement;
            if (man) man.value = st.txt;
            R();
          },
          true
        );

        if (r) {
          st.rec = r;
          R();
        }
      },
      done() {
        const manEl = document.getElementById('man') as HTMLTextAreaElement;
        const txt = (manEl && manEl.value.trim()) || st.txt.trim();
        if (!txt) {
          toast('অনুগ্রহ করে কিছু বলুন বা টাইপ করুন');
          return;
        }
        st.txt = txt;
        const secs = Math.max(3, (Date.now() - st.t0) / 1000);
        const cf = st.conf.length ? st.conf.reduce((a: number, b: number) => a + b, 0) / st.conf.length : 0.85;
        st.res = analyze2(txt, secs, cf);

        S.scores.push(Math.round((st.res.pron + st.res.flu + st.res.gram + st.res.voc) / 4));
        S.sess++;
        addXP(Math.max(1, Math.round(secs / 60)), 20);
        st.phase = 'res';
        R();
      },
      say(val: string) {
        say(val, 0.9);
      },
      slow(val: string) {
        say(val, 0.7);
      },
      pw(val: string) {
        st.pw = val;
        st.pres = null;
        R();
      },
      pmic() {
        const w = st.pw;
        listen(f => {
          const sy = SYL[w] || [w];
          const ok = norm(f).includes(w);
          st.pres = sy.map((_, i) => ok || (Boolean(f) && i !== sy.length - 1));
          addXP(1, ok ? 5 : 0);
          R();
        });
      },
      cmlisten() {
        const cm = st.cm;
        if (cm.on) {
          cm.on = 0;
          if (cm.rec) {
            try { cm.rec.stop(); } catch (e) {}
            cm.rec = null;
          }
          R();
        } else {
          cmListen();
        }
      },
      cmgen() {
        const i = document.getElementById('cmin') as HTMLInputElement;
        const v = i && i.value.trim();
        if (v) {
          i.value = '';
          cmReply(v);
        } else {
          toast('আগে ক্লায়েন্টের কথা লিখুন বা শুনুন');
        }
      },
      cmcopy(v: string) {
        const parts = v.split('|');
        const item = st.cm.items[+parts[0]];
        const text = item ? item[parts[1]] : '';
        if (text && navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => toast('কপি করা হয়েছে ✓'));
        }
      },
      cmclear() {
        st.cm.txt = '';
        st.cm.interim = '';
        st.cm.items = [];
        R();
      },
      smstart() {
        st.sm.on = 1;
        st.sm.log = [
          { t: 'client', content: 'Hi, thanks for joining the call today! Could you tell me a little bit about your experience and how you can help our project?' },
        ];
        say(st.sm.log[0].content);
        R();
      },
      smsend() {
        const i = document.getElementById('smin') as HTMLInputElement;
        const v = i && i.value.trim();
        if (!v) return;
        i.value = '';
        st.sm.log.push({ t: 'you', content: v });
        R();

        callAI([
          ...st.sm.log.map((m: any) => ({ role: m.t === 'you' ? 'user' : 'model', content: m.content })),
          { role: 'user', content: `Reply as a ${st.sm.pers} client. Ask ONE short follow-up question in 1-2 sentences.` },
        ])
          .then(reply => {
            st.sm.log.push({ t: 'client', content: reply });
            say(reply);
            R();
          })
          .catch(() => {
            const fallback = 'That sounds interesting. Could you clarify the timeline and delivery schedule?';
            st.sm.log.push({ t: 'client', content: fallback });
            say(fallback);
            R();
          });
      },
      hzpick(v: any) {
        const qs = [
          ['How much will this project cost?', 'The price depends on the exact scope of work. For this project, it would be around 200 dollars. Would you like me to send a detailed breakdown?'],
          ['When can you deliver the project?', 'I can deliver the first draft within 5 to 7 business days after receiving the requirements. Does that timeline fit your plan?'],
          ['Why does SEO take so long?', 'SEO takes time because search engines need several weeks to crawl and evaluate website improvements. Most clients see early results in two to three months.'],
          ['Why was the project delayed?', 'I apologize sincerely for the delay. It was due to unexpected technical testing. The final version will be delivered by tomorrow morning.'],
        ];
        const selected = qs[+v] || qs[0];
        st.hz = { stage: 1, q: selected[0], a: selected[1] };
        R();
      },
      hznext() {
        st.hz.stage = Math.min(4, st.hz.stage + 1);
        R();
      },
      cq2(v: string) {
        const i = document.getElementById('cin') as HTMLInputElement;
        if (i) i.value = v;
        A.csend();
      },
      async csend() {
        const i = document.getElementById('cin') as HTMLInputElement;
        const v = i && i.value.trim();
        if (!v || st.busy) return;
        st.chat.push({ role: 'user', content: v });
        st.busy = 1;
        R();
        try {
          const r = await callAI(st.chat.slice(-6));
          st.chat.push({ role: 'assistant', content: r });
          say(r);
        } catch {
          st.chat.push({ role: 'assistant', content: 'You can improve English fluency by speaking aloud 10 minutes every day and recording yourself.' });
        }
        st.busy = 0;
        R();
      },
      cchk() {
        const ca = (document.getElementById('ca') as HTMLTextAreaElement)?.value || '';
        const resEl = document.getElementById('cres');
        if (resEl) {
          resEl.innerHTML = `<div class="fix" style="border-color:var(--pr)"><b>✅ মূল্যায়ন:</b> উত্তর দৈর্ঘ্য: ${norm(ca).length} শব্দ। ${gview(ca)}</div>`;
        }
      },
      async b2ego() {
        const q = (document.getElementById('b2ein') as HTMLTextAreaElement)?.value || '';
        if (!q.trim()) return toast('আগে বাংলায় লিখুন বা বলুন');
        const rEl = document.getElementById('b2eres');
        if (rEl) rEl.innerHTML = '<div class="mu">অনুবাদ হচ্ছে…</div>';
        try {
          const r = await callAI([{ role: 'user', content: `Translate this Bengali into professional spoken English for a client: "${q}". Provide: 1) Natural spoken version, 2) Formal email version.` }]);
          if (rEl) rEl.innerHTML = `<div class="fix"><b>🇬🇧 ইংরেজি সংস্করণ:</b><div style="margin-top:6px;line-height:1.6">${esc(r)}</div></div>`;
        } catch {
          if (rEl) rEl.innerHTML = '<div class="fix">Thank you for your message; I will ensure the deliverable is completed by tomorrow.</div>';
        }
      },
      tktab(v: string) {
        st.tk.tab = v;
        R();
      },
      async iwcheck() {
        const txt = (document.getElementById('iwtxt') as HTMLTextAreaElement)?.value || '';
        if (norm(txt).length < 20) return toast('আগে কিছু লিখুন বা ডিকটেট করুন');
        const resEl = document.getElementById('iwres');
        if (resEl) resEl.innerHTML = '<div class="mu">বিশ্লেষণ হচ্ছে…</div>';
        try {
          const r = await callAI([{ role: 'user', content: `Assess this IELTS Writing Task 2 essay briefly: "${txt}". Give Band score estimate and 2 key corrections.` }]);
          if (resEl) resEl.innerHTML = `<div class="fix"><b>📊 IELTS Writing Evaluation:</b><p>${esc(r)}</p></div>`;
        } catch {
          if (resEl) resEl.innerHTML = `<div class="fix"><b>Estimated Band: 6.5</b><p>Good vocabulary. Ensure each paragraph has a clear topic sentence.</p></div>`;
        }
      },

      // Toggle Auto-check on Startup Setting
      toggleautocheck() {
        S.autoCheckOnStartup = !S.autoCheckOnStartup;
        save();
        toast(S.autoCheckOnStartup ? '⚡ Auto-check on Startup চালু হয়েছে' : 'Auto-check on Startup বন্ধ করা হয়েছে');
        R();
        if (S.autoCheckOnStartup && !st.mc.quickChecking) {
          runQuickStartupMicCheck(false);
        }
      },

      // On-demand Quick Microphone Check
      mcquickcheck() {
        runQuickStartupMicCheck(false);
      },

      // Toggle Audio Constraints
      toggleconstraint(key: string) {
        if (!S.audioConstraints) S.audioConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
        S.audioConstraints[key] = !S.audioConstraints[key];
        save();
        toast(`${key === 'echoCancellation' ? 'Echo Cancellation' : key === 'noiseSuppression' ? 'Noise Suppression' : 'Auto Gain'} ${S.audioConstraints[key] ? 'চালু' : 'বন্ধ'}`);
        if (st.mc && st.mc.liveWaveform) {
          stopWaveformMonitor();
          setTimeout(() => startWaveformMonitor(), 120);
        }
        R();
      },

      // Toggle Live Waveform Visualizer
      mctogglelive() {
        if (st.mc.liveWaveform) {
          stopWaveformMonitor();
          toast('লাইভ ওয়েভফর্ম মনিটর বন্ধ');
        } else {
          startWaveformMonitor();
          toast('লাইভ ওয়েভফর্ম মনিটর সক্রিয় ✓');
        }
        R();
      },

      // Universal Input Dictation (Solves "some section mic is missing & solve it different way")
      dictate(targetId: string) {
        const el = document.getElementById(targetId) as (HTMLInputElement | HTMLTextAreaElement);
        if (!el) return;

        if (st.dictatingTarget === targetId) {
          stopDictate();
          return;
        }

        stopDictate();
        st.dictatingTarget = targetId;
        R();

        toast('🎤 বলুন... (ভয়েস টাইপিং সক্রিয়)');

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
          try {
            const r = new SR();
            r.lang = (targetId === 'b2ein' && S.lang === 'bn') ? 'bn-BD' : 'en-US';
            r.continuous = true;
            r.interimResults = true;
            let finalSpeech = el.value ? (el.value.trim() + ' ') : '';

            r.onresult = (e: any) => {
              let interim = '';
              let newlyFinal = '';
              for (let i = e.resultIndex; i < e.results.length; i++) {
                const text = e.results[i][0].transcript;
                if (e.results[i].isFinal) newlyFinal += text + ' ';
                else interim += text;
              }
              if (newlyFinal) finalSpeech += newlyFinal;
              const cur = document.getElementById(targetId) as (HTMLInputElement | HTMLTextAreaElement);
              if (cur) cur.value = (finalSpeech + interim).trim();
            };

            r.onerror = (ev: any) => {
              console.warn('SR error, trying MediaRecorder fallback:', ev.error);
              if (ev.error === 'network' || ev.error === 'service-not-allowed') {
                startMediaRecorderFallback(targetId);
              }
            };

            r.onend = () => {
              if (st.dictatingTarget === targetId) {
                st.dictatingTarget = null;
                R();
              }
            };

            activeDictateSR = r;
            r.start();
            return;
          } catch (err) {
            console.warn('SR failed:', err);
          }
        }

        // Different way fallback: MediaRecorder + server-side Gemini audio transcription
        startMediaRecorderFallback(targetId);
      },

      // Background Noise Test (calculates Signal-to-Noise Ratio SNR in dB during silence & speaking)
      async mcnoise() {
        const mc = st.mc;
        if (mc.noiseTest && mc.noiseTest.running) return;

        mc.noiseTest = {
          running: true,
          step: 'silence',
          countdown: 3,
          noiseRms: 0,
          noiseDb: 0,
          signalRms: 0,
          signalDb: 0,
          snrDb: 0,
          verdict: '',
          verdictColor: '',
          msg: '',
        };
        R();

        let stream: MediaStream;
        try {
          const constraints: MediaTrackConstraints = {
            echoCancellation: Boolean(S.audioConstraints?.echoCancellation ?? true),
            noiseSuppression: Boolean(S.audioConstraints?.noiseSuppression ?? true),
            autoGainControl: Boolean(S.audioConstraints?.autoGainControl ?? true),
          };
          stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
          startWaveformMonitor(stream);
        } catch (err: any) {
          mc.noiseTest.running = false;
          micFail(err.name || 'not-allowed');
          R();
          return;
        }

        const ctx = getAudioContext();
        if (!ctx) {
          mc.noiseTest.running = false;
          R();
          return;
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        const source = ctx.createMediaStreamSource(stream);
        const gainNode = ctx.createGain();
        gainNode.gain.value = S.micGain || 1.0;
        source.connect(gainNode);
        gainNode.connect(analyser);

        const timeData = new Uint8Array(analyser.fftSize);
        const measureRMS = () => {
          analyser.getByteTimeDomainData(timeData);
          let sum = 0;
          for (let i = 0; i < timeData.length; i++) {
            const v = (timeData[i] - 128) / 128;
            sum += v * v;
          }
          return Math.sqrt(sum / timeData.length);
        };

        const silenceSamples: number[] = [];
        let silenceSec = 3;

        const silenceInterval = setInterval(() => {
          silenceSec--;
          mc.noiseTest.countdown = silenceSec;
          R();
          if (silenceSec <= 0) {
            clearInterval(silenceInterval);
            proceedToVoicePhase();
          }
        }, 1000);

        const sampleInterval = setInterval(() => {
          if (mc.noiseTest.step === 'silence') {
            silenceSamples.push(measureRMS());
          }
        }, 60);

        const proceedToVoicePhase = () => {
          mc.noiseTest.step = 'speak';
          mc.noiseTest.countdown = 3;
          R();
          toast('🗣️ এবার ৩ সেকেন্ড স্বাভাবিক স্বরে কিছু বলুন...', 2000);

          const voiceSamples: number[] = [];
          let voiceSec = 3;

          const voiceSampleInterval = setInterval(() => {
            voiceSamples.push(measureRMS());
          }, 60);

          const voiceCountdown = setInterval(() => {
            voiceSec--;
            mc.noiseTest.countdown = voiceSec;
            R();
            if (voiceSec <= 0) {
              clearInterval(voiceCountdown);
              clearInterval(sampleInterval);
              clearInterval(voiceSampleInterval);

              silenceSamples.sort((a, b) => a - b);
              const noiseTrimmed = silenceSamples.slice(0, Math.floor(silenceSamples.length * 0.85));
              const avgNoiseRms = noiseTrimmed.length ? noiseTrimmed.reduce((a, b) => a + b, 0) / noiseTrimmed.length : 0.005;

              voiceSamples.sort((a, b) => b - a);
              const topVoice = voiceSamples.slice(0, Math.max(5, Math.floor(voiceSamples.length * 0.5)));
              const avgSignalRms = topVoice.length ? topVoice.reduce((a, b) => a + b, 0) / topVoice.length : 0.02;

              const noiseFloorRms = Math.max(0.0005, avgNoiseRms);
              const speechSignalRms = Math.max(noiseFloorRms, avgSignalRms);

              const noiseDb = Math.round(20 * Math.log10(noiseFloorRms));
              const signalDb = Math.round(20 * Math.log10(speechSignalRms));

              let snr = Math.round(20 * Math.log10(speechSignalRms / noiseFloorRms));
              if (snr < 0) snr = 0;
              if (snr > 42) snr = 42;

              let verdict = '';
              let verdictColor = '';
              let adviceMsg = '';

              if (speechSignalRms < noiseFloorRms * 1.35 && speechSignalRms < 0.015) {
                verdict = 'কথা স্পষ্ট শনাক্ত হয়নি (No Voice Detected)';
                verdictColor = 'var(--am)';
                adviceMsg = 'দ্বিতীয় ধাপে কথা শোনা যায়নি। মাইকের সামনে এসে স্বাভাবিক স্বরে কথা বলে আবার টেস্ট করুন।';
              } else if (snr >= 20 && noiseDb <= -42) {
                verdict = 'চমৎকার ও শান্ত পরিবেশ (Excellent SNR)';
                verdictColor = 'var(--pr2)';
                adviceMsg = `আপনার পরিবেশ অত্যন্ত কোলাহলমুক্ত ও শান্ত (SNR: +${snr} dB, Noise Floor: ${noiseDb} dB)। ভয়েস রিকগনিশন ও এআই কোচ সর্বোচ্চ নির্ভুলতায় কাজ করবে।`;
              } else if (snr >= 12) {
                verdict = 'উপযোগী ও ভালো পরিবেশ (Good SNR)';
                verdictColor = 'var(--pr)';
                adviceMsg = `ভয়েস প্র্যাকটিসের জন্য পরিবেশ বেশ ভালো (SNR: +${snr} dB)। সামান্য ব্যাকগ্রাউন্ড সাউন্ড থাকলেও স্পিচ স্পষ্ট থাকবে।`;
              } else if (snr >= 6) {
                verdict = 'মাঝারি ব্যাকগ্রাউন্ড নয়েজ (Moderate Noise)';
                verdictColor = 'var(--am)';
                adviceMsg = `পরিবেশে মাঝারি মাত্রার নয়েজ রয়েছে (SNR: +${snr} dB, Noise: ${noiseDb} dB)। ফ্যান বা দরজার আওয়াজ কমাতে পারেন, এবং মাইকের আরেকটু কাছে স্পষ্ট করে কথা বলুন।`;
              } else {
                verdict = 'অতিরিক্ত নয়েজ — ভয়েস রিকগনিশনে সমস্যা হতে পারে (High Noise)';
                verdictColor = 'var(--rd)';
                adviceMsg = `ব্যাকগ্রাউন্ড নয়েজ খুব বেশি (SNR: +${snr} dB, Noise: ${noiseDb} dB)! টিভি, ফ্যান বা বাইরের আওয়াজ বেশি থাকলে স্পিচ রিকগনিশন ভুল শব্দ তুলতে পারে। শান্ত স্থানে যান অথবা হেডফোন/ইয়ারফোন মাইক ব্যবহার করুন।`;
              }

              mc.noiseTest = {
                running: false,
                step: 'done',
                countdown: 0,
                noiseRms: Math.round(noiseFloorRms * 1000) / 10,
                noiseDb,
                signalRms: Math.round(speechSignalRms * 1000) / 10,
                signalDb,
                snrDb: snr,
                verdict,
                verdictColor,
                msg: adviceMsg,
              };

              // Save to historical trend line dataset
              const newRecord = {
                id: Date.now(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: ds(new Date()),
                snr,
                noise: noiseDb,
                signal: signalDb,
                verdict,
              };
              S.snrHistory = S.snrHistory || [];
              S.snrHistory.push(newRecord);
              if (S.snrHistory.length > 20) S.snrHistory.shift();
              save();

              toast(`নয়েজ টেস্ট সম্পন্ন: SNR +${snr} dB`);
              R();
            }
          }, 1000);
        };
      },

      // Full Hardware Diagnostic Test
      mcrun() {
        const mc = st.mc;
        mc.run = 1;
        mc.res = [];
        mc.txt = '';
        R();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          mc.res.push(['fail', 'getUserMedia API অনুপস্থিত', 'আপনার ব্রাউজারে মাইক্রোফোন অ্যাক্সেস সুবিধা নেই।']);
          mc.run = 0;
          R();
          return;
        }

        mc.res.push(['ok', 'নিরাপদ ব্রাউজার কনটেক্সট', 'HTTPS / localhost সক্রিয় রয়েছে।']);

        const constraints: MediaTrackConstraints = {
          echoCancellation: Boolean(S.audioConstraints?.echoCancellation ?? true),
          noiseSuppression: Boolean(S.audioConstraints?.noiseSuppression ?? true),
          autoGainControl: Boolean(S.audioConstraints?.autoGainControl ?? true),
        };

        navigator.mediaDevices
          .getUserMedia({ audio: constraints })
          .then(stream => {
            mc.res.push(['ok', 'মাইক্রোফোন অনুমতি মঞ্জুর করা হয়েছে', 'ব্রাউজার আপনার মাইক সফলভাবে চালু করেছে।']);
            startWaveformMonitor(stream);

            // Step 3: Test Web Speech API recognition
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SR) {
              const msg = document.getElementById('mcmsg');
              if (msg) msg.textContent = 'এখন স্পষ্ট করে বলুন: "Hello Speakly"';

              const r = new SR();
              r.lang = 'en-US';
              r.onresult = (e: any) => {
                mc.txt = e.results[0][0].transcript;
                mc.res.push(['ok', 'ভয়েস রিকগনিশন সফল!', `শুনেছি: "${mc.txt}"`]);
                mc.run = 0;
                R();
              };
              r.onerror = (ev: any) => {
                mc.res.push(['warn', 'রিকগনিশন সতর্কতা: ' + ev.error, MICMSG[ev.error] || 'কথা শনাক্ত হয়নি।']);
                mc.run = 0;
                R();
              };
              r.onend = () => {
                mc.run = 0;
                R();
              };
              try {
                r.start();
              } catch (e) {
                mc.run = 0;
                R();
              }
            } else {
              mc.res.push(['warn', 'Web Speech API নেই', 'Chrome ব্রাউজারে সবচেয়ে ভালো কাজ করে (অন্য ব্রাউজারে সার্ভার ট্র্যান্সক্রাইব বিকল্প ব্যবহৃত হবে)।']);
              mc.run = 0;
              R();
            }
          })
          .catch(err => {
            mc.res.push(['fail', 'মাইক পারমিশন পাওয়া যায়নি', MICMSG[err.name] || err.message]);
            mc.run = 0;
            R();
          });
      },
      // Export Diagnostics Report as JSON
      mcdownloadreport() {
        const mc = st.mc;
        const nt = mc?.noiseTest || {};
        const now = new Date();

        // Environmental rating calculation
        let envRating = 'Not Tested';
        let suitability = 'Pending Background Noise Test';
        if (nt.step === 'done') {
          if (nt.snrDb >= 20 && nt.noiseDb <= -42) {
            envRating = 'Excellent';
            suitability = 'Optimal for voice recognition and AI coaching';
          } else if (nt.snrDb >= 12) {
            envRating = 'Good';
            suitability = 'Well-suited for speech recognition';
          } else if (nt.snrDb >= 6) {
            envRating = 'Moderate Noise';
            suitability = 'Usable with occasional background interference';
          } else {
            envRating = 'High Noise';
            suitability = 'Too noisy; headset microphone recommended';
          }
        }

        const report = {
          application: {
            name: 'Speakly',
            version: '2.0.0',
            description: 'AI English Speaking Coach for Bangla Learners',
            exportDateUTC: now.toISOString(),
            exportDateLocal: now.toLocaleString(),
          },
          hardwareAndBrowserStatus: {
            isSecureContext: window.isSecureContext,
            speechRecognitionSupported: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
            speechRecognitionEngine: window.SpeechRecognition
              ? 'Standard SpeechRecognition'
              : window.webkitSpeechRecognition
              ? 'WebKit SpeechRecognition'
              : 'None',
            getUserMediaSupported: Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            audioContextSupported: Boolean(window.AudioContext || window.webkitAudioContext),
            aiStudioIframeMicrophonePermission: 'Granted via metadata requestFramePermissions',
            userAgent: navigator.userAgent,
            language: navigator.language || 'en',
            screenResolution: `${window.innerWidth}x${window.innerHeight}`,
          },
          audioConfiguration: {
            inputGainMultiplier: S.micGain || 1.0,
            autoCheckOnStartupEnabled: Boolean(S.autoCheckOnStartup),
            audioConstraints: {
              echoCancellation: Boolean(S.audioConstraints?.echoCancellation ?? true),
              noiseSuppression: Boolean(S.audioConstraints?.noiseSuppression ?? true),
              autoGainControl: Boolean(S.audioConstraints?.autoGainControl ?? true),
            },
          },
          startupAndQuickCheck: {
            hasRun: Boolean(mc.startupCheck?.tested),
            success: Boolean(mc.startupCheck?.success),
            inputLevelPercent: mc.startupCheck?.level ?? 0,
            statusMessage: mc.startupCheck?.msg || 'Auto-check has not run yet.',
            recordedTime: mc.startupCheck?.time || null,
          },
          currentSnrTestResults: {
            hasCompletedTest: nt.step === 'done',
            status: nt.step || 'idle',
            signalToNoiseRatioDb: nt.snrDb ?? null,
            noiseFloorDb: nt.noiseDb ?? null,
            noiseRmsPercent: nt.noiseRms ?? null,
            voiceSignalDb: nt.signalDb ?? null,
            voiceSignalRmsPercent: nt.signalRms ?? null,
            verdict: nt.verdict || 'No SNR test performed yet',
            detailedAssessment: nt.msg || 'Run the Background Noise Test to assess ambient sound.',
          },
          environmentalAssessment: {
            rating: envRating,
            suitability,
            currentNoiseFloorLevel: nt.noiseDb != null ? `${nt.noiseDb} dB` : 'Unknown',
            recommendations: [
              nt.noiseDb != null && nt.noiseDb > -35
                ? 'Consider moving away from fans, AC, or street noise to lower the noise floor below -40 dB.'
                : 'Ambient noise floor is at an acceptable level.',
              (S.micGain || 1.0) < 1.0
                ? 'Microphone gain is currently reduced. If voice recognition misses words, set gain to 1.0x or 1.2x.'
                : 'Microphone gain is standard or boosted.',
              Boolean(S.audioConstraints?.echoCancellation)
                ? 'Echo cancellation is enabled to suppress acoustic feedback.'
                : 'Echo cancellation is disabled.',
              Boolean(S.audioConstraints?.noiseSuppression)
                ? 'Browser noise suppression filter is active.'
                : 'Noise suppression is disabled (raw microphone input).',
            ],
          },
          historicalSnrTrend: S.snrHistory || [],
          hardwareDiagnosticChecks: (mc.res || []).map((item: any) => ({
            status: item[0],
            check: item[1],
            details: item[2],
          })),
          lastRecognizedSpeech: mc.txt || null,
        };

        try {
          const jsonString = JSON.stringify(report, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const fileDate = now.toISOString().slice(0, 10);
          const fileTime = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
          a.download = `speakly-diagnostics-report-${fileDate}-${fileTime}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast('📥 ডায়াগনস্টিক রিপোর্ট JSON ডাউনলোড সম্পন্ন!');
        } catch (e: any) {
          toast('রিপোর্ট ডাউনলোড করতে সমস্যা: ' + (e?.message || 'Error'));
        }
      },
      micx() {
        st.micErr = null;
        R();
      },
      saveme() {
        const nm = (document.getElementById('nm') as HTMLInputElement)?.value;
        const gl = (document.getElementById('gl') as HTMLInputElement)?.value;
        if (nm) S.name = nm.trim();
        if (gl) S.goal = Math.max(1, parseInt(gl, 10));
        save();
        toast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে ✓');
        R();
      },
    };

    // Global Click Handler
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-a]') as HTMLElement;
      if (btn && btn.dataset.a) {
        const action = btn.dataset.a;
        const val = btn.dataset.v;
        if (A[action]) {
          A[action](val);
        }
      }
    };

    // Global Input Handler (for Mic Gain Slider)
    const inputHandler = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target && target.id === 'mcgain') {
        const val = parseFloat(target.value);
        S.micGain = val;
        save();
        const lbl = document.getElementById('gain-label');
        if (lbl) {
          lbl.textContent = `${val.toFixed(1)}x`;
        }
        if (waveGainNode && waveGainNode.context && waveGainNode.context.state !== 'closed') {
          try {
            waveGainNode.gain.setValueAtTime(val, waveGainNode.context.currentTime);
          } catch (err) {}
        }
      }
    };

    document.addEventListener('click', clickHandler);
    document.addEventListener('input', inputHandler);

    R();

    // Auto-check on Startup if enabled
    let startupTimer: any = null;
    if (S.autoCheckOnStartup) {
      startupTimer = setTimeout(() => {
        runQuickStartupMicCheck(true);
      }, 600);
    }

    return () => {
      if (startupTimer) clearTimeout(startupTimer);
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('input', inputHandler);
      stopQuickCheck();
      stopWaveformMonitor();
      stopDictate();
      if (st.rec) {
        try { st.rec.stop(); } catch (e) {}
      }
      if (st.cm && st.cm.rec) {
        try { st.cm.rec.stop(); } catch (e) {}
      }
    };
  }, [mounted]);

  return <div ref={containerRef} id="app"></div>;
}
