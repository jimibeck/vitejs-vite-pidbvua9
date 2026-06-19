import React, { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ───────────────────────────────────────────────
// Supabase 연결 (외부 배포용 - window.storage 대체)
// ───────────────────────────────────────────────
const SUPABASE_URL = "https://edzkrgxctnaphhuddoql.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_A-RDucigxtcoXBeIQ2MBXg_8JehopgT";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const dbStorage = {
  async get(key) {
    const { data, error } = await supabase
      .from("app_storage")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return { key, value: data.value };
  },
  async set(key, value) {
    const { error } = await supabase
      .from("app_storage")
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { key, value };
  },
};

// ───────────────────────────────────────────────
// 선수 프로필 이미지 (base64) - 기존 이미지 변수 그대로 사용 (PLACEHOLDER)
// 나중에 각 IMG_XXX 변수의 base64 값만 아이돌 이미지로 교체하면 됩니다.
// ───────────────────────────────────────────────
const IMG_BAEKSEUNGHO = "PLACEHOLDER_IMG_BASE64_1";
const IMG_HIDDINK = "PLACEHOLDER_IMG_BASE64_2";
const IMG_HWANGINBEOM = "PLACEHOLDER_IMG_BASE64_3";
const IMG_KIMMINJAE = "PLACEHOLDER_IMG_BASE64_4";
const IMG_KIMSEUNGGYU = "PLACEHOLDER_IMG_BASE64_5";
const IMG_LEEGIHYEOK = "PLACEHOLDER_IMG_BASE64_6";
const IMG_LEEHANBEOM = "PLACEHOLDER_IMG_BASE64_7";
const IMG_LEEJAESUNG = "PLACEHOLDER_IMG_BASE64_8";
const IMG_LEEKANGIN = "PLACEHOLDER_IMG_BASE64_9";
const IMG_LEETAESEOK = "PLACEHOLDER_IMG_BASE64_10";
const IMG_SEOLYEONGWOO = "PLACEHOLDER_IMG_BASE64_11";
const IMG_SONHEUNGMIN = "PLACEHOLDER_IMG_BASE64_12";
const IMG_TITLE = "PLACEHOLDER_IMG_TITLE";

// ───────────────────────────────────────────────
// 칭호 풀: 프로듀스11 컨셉 + 메인 프로듀서(테디, 게임마스터 전용)
// ───────────────────────────────────────────────
const MASTER_TITLE = "한예슬 얘기 물어보지마 테디";
const MASTER_NAME = "전진우"; // 이 이름으로 가입하면 자동으로 메인 프로듀서(단장) 권한 부여

const PLAYER_TITLES = [
  { title: "Permission to Dance 말고 Permission to 퇴근 필요한 BTS", img: IMG_KIMSEUNGGYU },
  { title: "영크크 외치다 야근크크 된 코르티스", img: IMG_LEEGIHYEOK },
  { title: "면접 보듯 매일 출근 도장 찍는 아이브", img: IMG_KIMMINJAE },
  { title: "광야로 출근하고 광야로 퇴근하는 에스파", img: IMG_LEEHANBEOM },
  { title: "안티프래자일, 깨져도 다시 출근하는 르세라핌", img: IMG_LEETAESEOK },
  { title: "거제 야호 외치다 야근까지 외친 리센느", img: IMG_BAEKSEUNGHO },
  { title: "야근으로 다크서클 깊어진 블랙핑크", img: IMG_HWANGINBEOM },
  { title: "마그네틱하게 야근에 끌려가는 아일릿", img: IMG_SEOLYEONGWOO },
  { title: "키득키득 웃다가 결국 야근하는 키키", img: IMG_LEEJAESUNG },
  { title: "9명 몫을 혼자 하는 1인다역 이즈나", img: IMG_LEEKANGIN },
  { title: "약속은 9시 퇴근, 현실은 매번 어기는 프로미스나인", img: IMG_SONHEUNGMIN },
];

const MASTER_IMG = IMG_HIDDINK;

// ───────────────────────────────────────────────
// 12명 명단 (이름 → 참가자 구분, 스쿼드 기능은 제거되어 표시용으로만 사용)
// ───────────────────────────────────────────────
const SQUAD_MEMBERS = [
  { name: "전진우", squad: "단장" },
  { name: "김정빈", squad: "팀원" },
  { name: "정해주", squad: "팀원" },
  { name: "김은정", squad: "팀원" },
  { name: "장소영", squad: "팀원" },
  { name: "김욱", squad: "팀원" },
  { name: "신준호", squad: "팀원" },
  { name: "김정찬", squad: "팀원" },
  { name: "김수봉", squad: "팀원" },
  { name: "박찬호", squad: "팀원" },
  { name: "전은혜", squad: "팀원" },
  { name: "김지나", squad: "팀원" },
];

function pickRandomPlayerTitle(usedTitles) {
  const remaining = PLAYER_TITLES.filter((t) => !usedTitles.includes(t.title));
  const pool = remaining.length > 0 ? remaining : PLAYER_TITLES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function makeDisplayName(name, title) {
  return `${title} (${name})`;
}

// ───────────────────────────────────────────────
// 스코어별 확률 (출처: KickOff.co.uk, 2026.6.19 기준 Correct Score 예측)
// https://www.kickoff.co.uk/world-cup-predictions-stats-odds/south-africa-vs-south-korea/
// home = 남아공 골수, away = 한국 골수
// ───────────────────────────────────────────────
const REAL_PROBS = {
  "0-1": 0.13, "0-2": 0.12, "1-1": 0.11, "0-0": 0.08, "1-2": 0.10,
  "0-3": 0.07, "1-0": 0.06, "1-3": 0.06, "2-1": 0.05, "2-2": 0.04,
  "0-4": 0.03, "2-0": 0.03, "1-4": 0.02, "3-2": 0.02, "3-1": 0.01,
};

function poisson(lambda, k) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

const LAMBDA_MEX = 0.8; // 남아공 예상 득점
const LAMBDA_KOR = 1.7; // 한국 예상 득점

function buildScores() {
  const emojiPool = ["😬","🤝","💤","📉","🔥","😤","🎉","🥶","🍿","🚀","🐯","😭","😱","🤯","🥳","😵","🙃","😎","🫠","🤡","🫨","🥴","😶‍🌫️","🤪","🦴"];
  const raw = [];
  for (let m = 0; m <= 4; m++) {
    for (let k = 0; k <= 4; k++) {
      const diff = Math.abs(m - k);
      if (diff >= 5) continue;
      const key = `${m}-${k}`;
      const prob = REAL_PROBS[key] != null
        ? REAL_PROBS[key]
        : poisson(LAMBDA_MEX, m) * poisson(LAMBDA_KOR, k) * 0.6;
      raw.push({ home: m, away: k, label: `한국 ${k} : ${m} 남아공`, prob, source: REAL_PROBS[key] != null ? "real" : "est" });
    }
  }
  const sumRaw = raw.reduce((a, b) => a + b.prob, 0);
  const bigDiffProb = Math.max(0.01, 1 - sumRaw);
  const halfProb = bigDiffProb / 2;
  raw.push({ home: "5+", away: "KOR", label: "한국 5점차 이상 대승", prob: halfProb, source: "est" });
  raw.push({ home: "5+", away: "MEX", label: "한국 5점차 이상 대패", prob: halfProb, source: "est" });

  const sorted = [...raw].sort((a, b) => b.prob - a.prob);
  const n = sorted.length;
  sorted.forEach((s, idx) => {
    const bucket = Math.floor((idx / n) * 7) + 1;
    s.hours = Math.min(bucket, 7);
  });
  sorted.filter((s) => s.home === "5+").forEach((s) => { s.hours = 7; });

  const display = [...sorted].sort((a, b) => {
    if (a.hours !== b.hours) return a.hours - b.hours;
    return b.prob - a.prob;
  });

  return display.map((s, i) => ({
    ...s,
    emoji: emojiPool[i % emojiPool.length],
  }));
}

const SCORES = buildScores();

// ───────────────────────────────────────────────
// 한국-남아공 역대 주요 경기 / 정보 (시간대별 로테이션)
// ───────────────────────────────────────────────
const HEAD_TO_HEAD_FACTS = [
  {
    title: "📊 조별리그 현황",
    body: "한국은 체코전 승리, 멕시코전 결과로 A조 순위가 결정된다. 남아공은 조 최하위 전력으로 평가받는다.",
  },
  {
    title: "📈 KickOff 예측 (6/19 기준)",
    body: "KickOff.co.uk 알고리즘 예측: 한국 승 59% / 무승부 23% / 남아공 승 18%. 예상 골 한국 1.7 - 남아공 0.8.",
  },
  {
    title: "🥅 최다 득점 시나리오",
    body: "KickOff 예측 Correct Score 1위는 '한국 1-0' (13%), 2위는 '한국 2-0' (12%). 한국 승리 시나리오가 우세하다.",
  },
  {
    title: "🌍 48개국 인플레이션",
    body: "이번 월드컵은 32개국 → 48개국으로 확대, 총 104경기가 열린다. 월드컵도 출산율은 떨어지는데 참가국은 늘어나는 시대.",
  },
  {
    title: "⏱️ 5초 룰 등장",
    body: "이번 대회부터 스로인·골킥에 '5초 카운트다운' 규칙이 적용된다. 늦으면 공 소유권 강탈!",
  },
];

function getRotatingFact() {
  const now = new Date();
  const hourIndex = now.getFullYear() * 8760 + now.getMonth() * 730 + now.getDate() * 24 + now.getHours();
  return HEAD_TO_HEAD_FACTS[hourIndex % HEAD_TO_HEAD_FACTS.length];
}

// ───────────────────────────────────────────────
// D-day 계산 (경기: 2026-06-25 10:00 KST)
// ───────────────────────────────────────────────
const MATCH_TIME = new Date("2026-06-25T10:00:00+09:00");

function getDday() {
  const now = new Date();
  const diffMs = MATCH_TIME.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const toKstDateOnly = (d) => {
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  };
  const diffDays = Math.round((toKstDateOnly(MATCH_TIME) - toKstDateOnly(now)) / (1000 * 60 * 60 * 24));
  return diffDays;
}

function getDdayLabel() {
  const diffDays = getDday();

  if (diffDays === null || diffDays <= 0) {
    return "👑 데뷔의 날, D-DAY! 국민 프로듀서의 선택이 시작된다";
  }
  if (diffDays === 1) {
    return "⚠️ 데뷔 평가 전야, D-1! 마지막 연습을 즐겨라";
  }
  return `⏳ 데뷔 평가까지 D-${diffDays}`;
}

// ───────────────────────────────────────────────
// 베팅 마감 카운트다운
// ───────────────────────────────────────────────
const COUNTDOWN_EVENTS = [
  { secondsBefore: 600, key: "t10m", text: "👑 데뷔 평가 마감 10분 전입니다!" },
  { secondsBefore: 300, key: "t5m", text: "⚠️ 마감 5분전! 무대가 곧 시작됩니다" },
  { secondsBefore: 180, key: "t3m", text: "🚨 마감 3분전! 연습생 최종 집결!" },
  { secondsBefore: 60, key: "t1m", text: "🔥 마감 1분전! 데뷔 준비 완료" },
  { secondsBefore: 10, key: "t10s", text: "⏰ 10초전... 무대가 시작된다" },
  { secondsBefore: 9, key: "t9s", text: "⏳ 9초전" },
  { secondsBefore: 8, key: "t8s", text: "⏳ 8초전" },
  { secondsBefore: 7, key: "t7s", text: "⏳ 7초전" },
  { secondsBefore: 6, key: "t6s", text: "⏳ 6초전" },
  { secondsBefore: 5, key: "t5s", text: "⏳ 5초전" },
  { secondsBefore: 4, key: "t4s", text: "⏳ 4초전" },
  { secondsBefore: 3, key: "t3s", text: "⏳ 3초전" },
  { secondsBefore: 2, key: "t2s", text: "⏳ 2초전" },
  { secondsBefore: 1, key: "t1s", text: "⏳ 1초전" },
  { secondsBefore: 0, key: "t0", text: "🎬 데뷔 평가가 시작됐다... 이제 결과만 남았다" },
];

function isBettingClosed() {
  return Date.now() >= MATCH_TIME.getTime();
}

const MEXICO_FLAG = "🇿🇦";
const KOREA_FLAG = "🇰🇷";

const palette = {
  bg: "#0E1A2B",
  card: "#16263D",
  accent: "#FF4D4D",
  accent2: "#00A859",
  text: "#F4F1EA",
  sub: "#8FA3BF",
  gold: "#FFC857",
};

function Avatar({ src, size = 36, ring }) {
  return (
    <img
      src={src}
      alt=""
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: ring ? `2px solid ${ring}` : `1px solid #24395C`,
        flexShrink: 0,
        background: "#0E1A2B",
      }}
    />
  );
}

export default function App() {
  const [members, setMembers] = useState({});
  const [roster, setRoster] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [welcomeUser, setWelcomeUser] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [loginName, setLoginName] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginMode, setLoginMode] = useState("login");

  // 클릭 미니게임 관련 state
  const [clickGameOpen, setClickGameOpen] = useState(null);
  const [clickGameScores, setClickGameScores] = useState({});
  const [clickGameTimeLeft, setClickGameTimeLeft] = useState(10);
  const [clickGameActive, setClickGameActive] = useState(false);
  const [clickGameCurrentScore, setClickGameCurrentScore] = useState(0);
  const clickGameTimerRef = useRef(null);

  const chatEndRef = useRef(null);
  const chatScrollRef = useRef(null);
  const prevChatLenRef = useRef(0);
  const chatInitializedRef = useRef(false);
  const [chatToast, setChatToast] = useState(null);

  // 새 메시지 도착 시 토스트 표시 (본인이 보낸 메시지는 제외)
  useEffect(() => {
    if (!chatInitializedRef.current) {
      chatInitializedRef.current = true;
      prevChatLenRef.current = chatMessages.length;
      return;
    }
    const prevLen = prevChatLenRef.current;
    if (chatMessages.length > prevLen) {
      const newMsgs = chatMessages.slice(prevLen);
      const fromOthers = newMsgs.filter((m) => m.name !== currentUser?.name);
      if (fromOthers.length > 0) {
        const last = fromOthers[fromOthers.length - 1];
        const sender = last.system ? null : (last.displayName || last.name);
        const rawText = last.text || "";
        const shortText = rawText.length > 300 ? rawText.slice(0, 300) + "..." : rawText;
        setChatToast({ id: Date.now(), sender, text: shortText });
      }
    }
    prevChatLenRef.current = chatMessages.length;
  }, [chatMessages, currentUser]);

  // 토스트 자동 닫기
  useEffect(() => {
    if (!chatToast) return;
    const t = setTimeout(() => setChatToast(null), 5000);
    return () => clearTimeout(t);
  }, [chatToast]);

  // 채팅 자동 스크롤 비활성화 (내가 직접 보낼 때만 스크롤)
  useEffect(() => {
    // 자동 스크롤 비활성화 (내가 직접 보낼 때만 스크롤)
  }, [chatMessages]);

  // 로그인 후 채팅창 최초 1회 맨 아래로 이동
  useEffect(() => {
    if (!currentUser) return;
    setTimeout(() => {
      const el = chatScrollRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, 1000);
  }, [currentUser]);

  // 초기 로드 + polling
  useEffect(() => {
    const load = async () => {
      try {
        const result = await dbStorage.get("members");
        if (result && result.value) setMembers(JSON.parse(result.value));
      } catch (e) {}
      try {
        const rosterResult = await dbStorage.get("roster");
        if (rosterResult && rosterResult.value) setRoster(JSON.parse(rosterResult.value));
      } catch (e) {}
      try {
        const chatResult = await dbStorage.get("chat");
        if (chatResult && chatResult.value) setChatMessages(JSON.parse(chatResult.value));
      } catch (e) {}
      try {
        const cgResult = await dbStorage.get("clickgame_scores");
        if (cgResult && cgResult.value) setClickGameScores(JSON.parse(cgResult.value));
      } catch (e) {}
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  // 베팅 마감 카운트다운 체크
  useEffect(() => {
    const checkCountdown = async () => {
      const now = Date.now();
      const diffSec = Math.floor((MATCH_TIME.getTime() - now) / 1000);
      for (const ev of COUNTDOWN_EVENTS) {
        if (diffSec === ev.secondsBefore || (ev.secondsBefore === 0 && diffSec <= 0 && diffSec > -5)) {
          let firedResult;
          try {
            firedResult = await dbStorage.get("countdown_fired");
          } catch (e) {
            firedResult = null;
          }
          let fired = {};
          try {
            fired = firedResult && firedResult.value ? JSON.parse(firedResult.value) : {};
          } catch (e) {
            fired = {};
          }
          if (!fired[ev.key]) {
            fired[ev.key] = true;
            try {
              await dbStorage.set("countdown_fired", JSON.stringify(fired));
            } catch (e) {}
            await pushSystemMessage(ev.text);
          }
        }
      }
    };
    const cdInterval = setInterval(checkCountdown, 1000);
    return () => clearInterval(cdInterval);
  }, [chatMessages]);

  const allEntries = useMemo(() => Object.values(members).flat(), [members]);

  const persist = async (updated) => {
    setMembers(updated);
    try {
      await dbStorage.set("members", JSON.stringify(updated));
    } catch (e) {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    }
  };

  const pushSystemMessage = async (text) => {
    const newMsg = { name: "__system__", displayName: "🔔 시스템", text, ts: Date.now(), system: true };
    let updated = [...chatMessages, newMsg];
    if (updated.length > 500) updated = updated.slice(updated.length - 500);
    setChatMessages(updated);
    try {
      await dbStorage.set("chat", JSON.stringify(updated));
    } catch (e) {}
  };

  // 로그인 / 회원가입
  const handleAuth = async () => {
    if (loginMode === "register") {
      const name = loginName.trim();
      const pin = loginPin.trim();
      const member = SQUAD_MEMBERS.find((m) => m.name === name);
      if (!member) {
        setError("위 명단에서 본인 이름을 선택해주세요!");
        return;
      }
      if (!/^\d{4}$/.test(pin)) {
        setError("비밀번호는 숫자 4자리로 입력해주세요.");
        return;
      }
      if (roster.some((e) => e.name === name)) {
        setError("이미 등록된 이름이에요. 재접속은 비밀번호로 입장해주세요!");
        return;
      }
      const pinTaken = roster.some((e) => e.pin === pin);
      if (pinTaken) {
        setError("이미 사용 중인 비밀번호예요. 다른 4자리 숫자로 입력해주세요!");
        return;
      }
      const usedTitles = allEntries.map((e) => e.title).filter(Boolean);
      let title, img;
      if (name === MASTER_NAME) {
        title = MASTER_TITLE;
        img = MASTER_IMG;
      } else {
        const picked = pickRandomPlayerTitle(usedTitles);
        title = picked.title;
        img = picked.img;
      }
      const displayName = makeDisplayName(name, title);
      const newUser = { name, pin, displayName, title, img, squad: member.squad, isNew: true };
      setCurrentUser(newUser);
      setError("");

      const newRosterEntry = { name, pin, displayName, title, img, squad: member.squad, joinedAt: Date.now() };
      const updatedRoster = [...roster, newRosterEntry];
      setRoster(updatedRoster);
      try {
        await dbStorage.set("roster", JSON.stringify(updatedRoster));
      } catch (e) {}

      await pushSystemMessage(`🎉 ${displayName} 님의 아이디가 생성되었습니다!`);
      setWelcomeUser(newUser);
    } else {
      const pin = loginPin.trim();
      if (!/^\d{4}$/.test(pin)) {
        setError("비밀번호 4자리를 입력해주세요.");
        return;
      }
      const existing = roster.find((e) => e.pin === pin);
      if (!existing) {
        setError("일치하는 계정이 없어요. 처음이라면 '새로 시작하기'를 눌러주세요!");
        return;
      }
      const scoreIdx = Object.keys(members).find((k) =>
        members[k].some((e) => e.pin === pin)
      );
      setCurrentUser({
        name: existing.name,
        pin,
        displayName: existing.displayName,
        title: existing.title,
        img: existing.img,
        squad: existing.squad || (SQUAD_MEMBERS.find((m) => m.name === existing.name) || {}).squad,
      });
      setSelected(scoreIdx != null ? Number(scoreIdx) : null);
      setError("");

      await pushSystemMessage(`🎤 ${existing.displayName} 님이 무대 뒤에서 등장했습니다`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginName("");
    setLoginPin("");
    setSelected(null);
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    if (isBettingClosed()) {
      setError("👑 베팅이 마감되었습니다. 이제 결과만 남았어요!");
      return;
    }
    if (selected === null) {
      setError("스코어 안 고르고 도망가는 거 아니죠? 하나 찍어주세요.");
      return;
    }

    const hadPreviousBet = allEntries.some((e) => e.name === currentUser.name);

    const updated = {};
    Object.entries(members).forEach(([key, entries]) => {
      updated[key] = entries.filter((e) => e.name !== currentUser.name);
    });
    updated[selected] = [
      ...(updated[selected] || []),
      { name: currentUser.name, pin: currentUser.pin, displayName: currentUser.displayName, title: currentUser.title, img: currentUser.img },
    ];
    await persist(updated);
    setError("");
    const s = SCORES[selected];
    const scoreLabel = s.home === "5+"
      ? (s.away === "KOR" ? "한국 5점차 이상 대승" : "한국 5점차 이상 대패")
      : `${s.away}:${s.home}`;

    if (hadPreviousBet) {
      const updatedRoster = roster.map((e) =>
        e.name === currentUser.name ? { ...e, changeCount: (e.changeCount || 0) + 1 } : e
      );
      setRoster(updatedRoster);
      try {
        await dbStorage.set("roster", JSON.stringify(updatedRoster));
      } catch (e) {}
      const newCount = (updatedRoster.find((e) => e.name === currentUser.name)?.changeCount) || 1;
      let changeTag;
      if (newCount === 1) changeTag = "변심 1회차 — 그럴 수도 있지";
      else if (newCount === 2) changeTag = "변심 2회차 — 마음이 갈대처럼 흔들린다";
      else if (newCount <= 4) changeTag = `변심 ${newCount}회차 — 연습생은 흔들린다`;
      else if (newCount <= 6) changeTag = `변심 ${newCount}회차 — 이 정도면 데뷔조 탈락 위기`;
      else if (newCount <= 9) changeTag = `변심 ${newCount}회차 — 무대 위에서도 못 정하는 자, 무대 밖에서도 못 정한다`;
      else if (newCount === 10) changeTag = `변심 ${newCount}회차 — 우유부단의 화신, 명예 변심왕 등극 🏆`;
      else changeTag = `변심 ${newCount}회차 — 경고: 데뷔 취소 임박, 본부는 더 이상 책임지지 않습니다 🚨`;
      await pushSystemMessage(`🔄 ${currentUser.displayName} 님이 [${scoreLabel}] (보상 ${s.hours}h)으로 변심! (${changeTag})`);
    } else {
      await pushSystemMessage(`⚡ ${currentUser.displayName} 님이 [${scoreLabel}] (보상 ${s.hours}h)에 베팅했습니다!`);
    }
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text) return;
    const newMsg = {
      name: currentUser.name,
      displayName: currentUser.displayName,
      img: currentUser.img,
      text,
      ts: Date.now(),
    };
    let updated = [...chatMessages, newMsg];
    if (updated.length > 500) updated = updated.slice(updated.length - 500);
    setChatMessages(updated);
    setChatInput("");
    setTimeout(() => {
      const el = chatScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
    try {
      await dbStorage.set("chat", JSON.stringify(updated));
    } catch (e) {
      setError("채팅 전송에 실패했어요.");
    }
  };

  const removeEntry = (scoreIdx, name) => {
    if (isBettingClosed()) return;
    const updated = { ...members };
    updated[scoreIdx] = updated[scoreIdx].filter((e) => e.name !== name);
    persist(updated);
    if (currentUser && currentUser.name === name) {
      setSelected(null);
    }
  };

  const handleAdminDeleteMember = async (name) => {
    const updatedRoster = roster.filter((e) => e.name !== name);
    setRoster(updatedRoster);
    try {
      await dbStorage.set("roster", JSON.stringify(updatedRoster));
    } catch (e) {}

    const updatedMembers = {};
    Object.entries(members).forEach(([key, entries]) => {
      updatedMembers[key] = entries.filter((e) => e.name !== name);
    });
    await persist(updatedMembers);

    await pushSystemMessage(`🧹 ${name} 님의 아이디가 관리자에 의해 삭제되었습니다. 재가입 부탁드려요!`);
    setDeleteTarget(null);
  };

  // 클릭게임 함수들
  const startClickGame = (idx) => {
    setClickGameOpen(idx);
    setClickGameActive(false);
    setClickGameCurrentScore(0);
    setClickGameTimeLeft(10);
  };

  const closeClickGame = () => {
    if (clickGameTimerRef.current) clearInterval(clickGameTimerRef.current);
    setClickGameOpen(null);
    setClickGameActive(false);
  };

  const beginClickGameRound = () => {
    setClickGameCurrentScore(0);
    setClickGameTimeLeft(10);
    setClickGameActive(true);
    clickGameTimerRef.current = setInterval(() => {
      setClickGameTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(clickGameTimerRef.current);
          setClickGameActive(false);
          saveClickGameScore();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClickGameTap = () => {
    if (!clickGameActive) return;
    setClickGameCurrentScore((prev) => prev + 1);
  };

  const saveClickGameScore = async () => {
    setClickGameCurrentScore((finalScore) => {
      const key = `${clickGameOpen}_${currentUser.name}`;
      const prevBest = clickGameScores[key] || 0;
      const newBest = Math.max(prevBest, finalScore);
      const updated = { ...clickGameScores, [key]: newBest };
      setClickGameScores(updated);
      dbStorage.set("clickgame_scores", JSON.stringify(updated)).catch(() => {});
      return finalScore;
    });
  };

  const getClickGameWinner = (idx) => {
    const entries = members[idx] || [];
    if (entries.length < 2) return null;
    let winner = null;
    let bestScore = -1;
    entries.forEach((e) => {
      const score = clickGameScores[`${idx}_${e.name}`] || 0;
      if (score > bestScore) {
        bestScore = score;
        winner = e.name;
      }
    });
    return { winner, bestScore };
  };

  const leaderboard = useMemo(() => {
    const rows = [];
    Object.entries(members).forEach(([idx, entries]) => {
      const s = SCORES[Number(idx)];
      const sameScoreCount = entries.length;

      let winnerName = null;
      if (sameScoreCount >= 2) {
        let bestScore = -1;
        entries.forEach((e) => {
          const score = clickGameScores[`${idx}_${e.name}`] || 0;
          if (score > bestScore) {
            bestScore = score;
            winnerName = e.name;
          }
        });
      }

      entries.forEach((e) => {
        let perPersonHours;
        if (sameScoreCount >= 2) {
          perPersonHours = winnerName != null && e.name === winnerName
            ? s.hours.toFixed(1)
            : "0.0";
        } else {
          perPersonHours = s.hours.toFixed(1);
        }
        rows.push({
          ...e,
          scoreLabel: s.home === "5+"
            ? (s.away === "KOR" ? "한국 5점차 이상 대승" : "한국 5점차 이상 대패")
            : `${s.away}:${s.home}`,
          prob: s.prob,
          hours: s.hours,
          perPersonHours,
          isClickGameTie: sameScoreCount >= 2,
          isClickGameWinner: sameScoreCount >= 2 && e.name === winnerName,
        });
      });
    });
    const sorted = rows.sort((a, b) => b.hours - a.hours || a.prob - b.prob);

    const masterEntry = roster.find((r) => r.title === MASTER_TITLE);
    if (masterEntry) {
      sorted.push({
        name: masterEntry.name,
        displayName: masterEntry.displayName,
        img: masterEntry.img,
        scoreLabel: "아무도 못 맞춘다 😈",
        prob: 0.999,
        hours: 0,
        perPersonHours: "0",
        isMaster: true,
      });
    }
    return sorted;
  }, [members, roster, clickGameScores]);

  const fact = getRotatingFact();
  const dday = getDday();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh", background: palette.bg, color: palette.text,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Pretendard', -apple-system, 'Apple SD Gothic Neo', sans-serif",
        }}
      >
        👑 불러오는 중...
      </div>
    );
  }

  // 클릭게임 모달
  const ClickGameModal = () => {
    if (clickGameOpen === null) return null;
    const s = SCORES[clickGameOpen];
    const myKey = `${clickGameOpen}_${currentUser.name}`;
    const myBest = clickGameScores[myKey] || 0;

    return (
      <div
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16,
        }}
        onClick={closeClickGame}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: palette.card, borderRadius: 20, padding: "28px 24px", maxWidth: 360, width: "100%",
            border: `2px solid ${palette.gold}`, textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, color: palette.gold, fontWeight: 700, marginBottom: 8 }}>
            🖱️ 클릭 미니게임
          </div>
          <div style={{ fontSize: 13, color: palette.sub, marginBottom: 16 }}>
            {s.label} 스코어 동점 베팅자 승부
          </div>

          {!clickGameActive && clickGameTimeLeft === 10 && clickGameCurrentScore === 0 && (
            <>
              <div style={{ fontSize: 13, color: palette.text, marginBottom: 16 }}>
                내 최고 기록: <span style={{ color: palette.gold, fontWeight: 700 }}>{myBest}클릭</span>
              </div>
              <button
                onClick={beginClickGameRound}
                style={{
                  width: "100%", padding: "14px", borderRadius: 10, border: "none",
                  background: palette.accent, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                시작하기 (10초)
              </button>
              <button
                onClick={closeClickGame}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10, border: `1px solid #24395C`,
                  background: "transparent", color: palette.sub, fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                닫기
              </button>
            </>
          )}

          {clickGameActive && (
            <>
              <div style={{ fontSize: 28, fontWeight: 900, color: palette.gold, marginBottom: 8 }}>
                ⏱️ {clickGameTimeLeft}초
              </div>
              <div style={{ fontSize: 16, color: palette.text, marginBottom: 16 }}>
                현재 클릭: <span style={{ color: palette.accent, fontWeight: 900, fontSize: 22 }}>{clickGameCurrentScore}</span>
              </div>
              <div
                onClick={handleClickGameTap}
                style={{
                  width: 160, height: 160, margin: "0 auto 16px", borderRadius: "50%",
                  border: `4px solid ${palette.gold}`, cursor: "pointer", overflow: "hidden",
                  userSelect: "none", boxShadow: `0 0 24px rgba(255,200,87,0.4)`,
                }}
              >
                <Avatar src={currentUser.img} size={160} />
              </div>
              <div style={{ fontSize: 12, color: palette.sub }}>캐릭터를 빠르게 클릭하세요!</div>
            </>
          )}

          {!clickGameActive && clickGameTimeLeft === 0 && (
            <>
              <div style={{ fontSize: 16, color: palette.gold, fontWeight: 700, marginBottom: 8 }}>
                결과: {clickGameCurrentScore}클릭!
              </div>
              <div style={{ fontSize: 13, color: palette.sub, marginBottom: 16 }}>
                내 최고 기록: <span style={{ color: palette.gold, fontWeight: 700 }}>{Math.max(myBest, clickGameCurrentScore)}클릭</span>
              </div>
              <button
                onClick={() => { setClickGameTimeLeft(10); setClickGameCurrentScore(0); }}
                style={{
                  width: "100%", padding: "12px", borderRadius: 10, border: "none",
                  background: palette.accent, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  marginBottom: 10,
                }}
              >
                다시 도전하기
              </button>
              <button
                onClick={closeClickGame}
                style={{
                  width: "100%", padding: "10px", borderRadius: 10, border: `1px solid #24395C`,
                  background: "transparent", color: palette.sub, fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}
              >
                닫기
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // ── 가입 축하 팝업 ──
  if (welcomeUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(180deg, ${palette.bg} 0%, #0A1320 100%)`,
          color: palette.text,
          fontFamily: "'Pretendard', -apple-system, 'Apple SD Gothic Neo', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}
      >
        <div
          style={{
            background: palette.card, borderRadius: 20, padding: "32px 24px", maxWidth: 380, width: "100%",
            border: `2px solid ${palette.gold}`, textAlign: "center", boxShadow: `0 0 30px rgba(255,200,87,0.25)`,
          }}
        >
          <div style={{ fontSize: 14, color: palette.gold, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>
            🎉 환영한다, 연습생 합류 완료! 🎉
          </div>
          <img
            src={welcomeUser.img}
            alt={welcomeUser.title}
            style={{
              width: 140, height: 140, borderRadius: "50%", objectFit: "cover",
              border: `4px solid ${palette.gold}`, margin: "0 auto 16px", display: "block",
              boxShadow: `0 0 20px rgba(255,200,87,0.4)`,
            }}
          />
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.5, marginBottom: 8 }}>
            {welcomeUser.title}
          </div>
          <div style={{ fontSize: 15, color: palette.sub, marginBottom: 16 }}>
            ({welcomeUser.name}) 님으로 배정되었습니다!
          </div>
          <div
            style={{
              background: "#0E1A2B", borderRadius: 12, padding: "14px", marginBottom: 20,
              border: `1px dashed ${palette.accent}`,
            }}
          >
            <div style={{ fontSize: 13, color: palette.sub, marginBottom: 4 }}>🔑 재접속용 비밀번호</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 10, color: palette.gold }}>
              {welcomeUser.pin}
            </div>
            <div style={{ fontSize: 12, color: palette.accent, marginTop: 8, fontWeight: 700 }}>
              ⚠️ 비밀번호를 꼭 기억하세요! 재접속 시 이 4자리만 입력하면 됩니다.
            </div>
          </div>
          <button
            onClick={() => setWelcomeUser(null)}
            style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: palette.accent, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
            }}
          >
            게임 시작하기 🎤
          </button>
        </div>
      </div>
    );
  }

  // ── 로그인 화면 ──
  if (!currentUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(180deg, ${palette.bg} 0%, #0A1320 100%)`,
          color: palette.text,
          fontFamily: "'Pretendard', -apple-system, 'Apple SD Gothic Neo', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}
      >
        <div
          style={{
            background: palette.card, borderRadius: 16, padding: "28px 24px", maxWidth: 360, width: "100%",
            border: `1px solid #24395C`,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👑 🎤 ⭐ 🎤 🍗 🎤 ⚽ 🎶 🪞 🎬</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              프로듀스 11 - 데뷔 평가 스코어 예측전
            </div>
            <div style={{ color: palette.sub, fontSize: 12, marginTop: 4 }}>
              {loginMode === "register"
                ? "이름을 선택하고 비번 4자리로 가입!"
                : "비밀번호 4자리만 입력하면 입장!"}
            </div>
            {dday != null && (
              <div style={{ color: palette.gold, fontSize: 13, marginTop: 8, fontWeight: 700 }}>
                {getDdayLabel()}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex", borderRadius: 10, overflow: "hidden", marginBottom: 16,
              border: `1px solid #24395C`,
            }}
          >
            <div
              onClick={() => { setLoginMode("login"); setError(""); }}
              style={{
                flex: 1, textAlign: "center", padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: loginMode === "login" ? palette.accent : "transparent",
                color: loginMode === "login" ? "#fff" : palette.sub,
              }}
            >
              재접속
            </div>
            <div
              onClick={() => { setLoginMode("register"); setError(""); }}
              style={{
                flex: 1, textAlign: "center", padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: loginMode === "register" ? palette.accent : "transparent",
                color: loginMode === "register" ? "#fff" : palette.sub,
              }}
            >
              새로 시작하기
            </div>
          </div>

          {loginMode === "register" && (
            <>
              <div
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10,
                }}
              >
                {SQUAD_MEMBERS.map((m) => {
                  const taken = roster.some((e) => e.name === m.name);
                  const isSelected = loginName === m.name;
                  return (
                    <div
                      key={m.name}
                      onClick={() => { if (!taken) { setLoginName(m.name); setError(""); } }}
                      style={{
                        textAlign: "center", borderRadius: 10, padding: "8px 4px", cursor: taken ? "default" : "pointer",
                        border: `1px solid ${isSelected ? palette.gold : "#24395C"}`,
                        background: taken ? "#0A1320" : (isSelected ? "rgba(255,200,87,0.12)" : "#0E1A2B"),
                        opacity: taken ? 0.5 : 1,
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? palette.gold : palette.text }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: 10, marginTop: 4, fontWeight: 700, color: taken ? palette.sub : palette.gold }}>
                        {taken ? "(합류 완료!)" : "(연습생이여, 합류하라!)"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  fontSize: 12, color: palette.gold, marginBottom: 10, lineHeight: 1.5,
                  background: "#0E1A2B", borderRadius: 8, padding: "8px 10px",
                }}
              >
                {loginName === MASTER_NAME
                  ? "🎤 메인 프로듀서(테디) 권한으로 등록됩니다! 칭호 + 프로필 자동 부여"
                  : loginName
                  ? "🎤 칭호+프로필 이미지는 인기 아이돌 11팀 중 하나로 랜덤 자동 배정됩니다!"
                  : "🎤 위에서 본인 이름을 선택해주세요!"}
              </div>
            </>
          )}

          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={loginPin}
            onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ""))}
            placeholder="비밀번호 4자리 (숫자만)"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid #24395C`,
              background: "#0E1A2B", color: palette.text, fontSize: 15, outline: "none",
              marginBottom: 12, boxSizing: "border-box", letterSpacing: 6,
            }}
          />

          {error && (
            <div style={{ color: palette.accent, fontSize: 13, marginBottom: 10 }}>🚨 {error}</div>
          )}

          <button
            onClick={handleAuth}
            style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none",
              background: palette.accent, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
            }}
          >
            {loginMode === "register" ? "가입하고 입장하기 🚪" : "입장하기 🚪"}
          </button>
          <div style={{ fontSize: 11, color: "#5A7099", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
            가입 시 이름이 중복되면 재접속 모드를 이용해주세요.
            <br />
            비번을 잊으면 운영자(메인 프로듀서)에게 문의하세요.
          </div>
        </div>
      </div>
    );
  }

  // ── 메인 화면 ──
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${palette.bg} 0%, #0A1320 100%)`,
        color: palette.text,
        fontFamily: "'Pretendard', -apple-system, 'Apple SD Gothic Neo', sans-serif",
        padding: "24px 16px 60px",
      }}
    >
      {chatToast && (
        <div
          onClick={() => {
            setChatToast(null);
            if (chatScrollRef.current) {
              chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            }
          }}
          style={{
            position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, maxWidth: "92%", width: 420,
            background: "#1F3654", border: `1px solid ${palette.gold}`, borderRadius: 12,
            padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            cursor: "pointer", fontSize: 13, color: palette.text,
            maxHeight: "70vh", overflowY: "auto", wordBreak: "break-word",
          }}
        >
          <span style={{ marginRight: 6 }}>💬</span>
          {chatToast.sender && (
            <span style={{ fontWeight: 700, color: palette.gold }}>{chatToast.sender}: </span>
          )}
          {chatToast.text}
        </div>
      )}
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* 타이틀 이미지 */}
        <div style={{ marginBottom: 16, borderRadius: 16, overflow: "hidden", border: `2px solid ${palette.gold}`, boxShadow: `0 0 20px rgba(255,200,87,0.2)` }}>
          <img src={IMG_TITLE} alt="고기팀 프로듀스11" style={{ width: "100%", display: "block" }} />
        </div>

        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 13, letterSpacing: 4, color: palette.gold, fontWeight: 700, marginBottom: 8 }}>
            6.25 THU · 10:00 AM
            {dday != null && (
              <div style={{ marginTop: 4 }}>{getDdayLabel()}</div>
            )}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            {KOREA_FLAG} 한국 <span style={{ color: palette.sub }}>vs</span> {MEXICO_FLAG} 남아공
          </h1>
          <p style={{ color: palette.sub, fontSize: 14, marginTop: 8 }}>
            2026 FIFA 월드컵 조별리그 · 과달라하라 스타디움
          </p>
          <p style={{ color: palette.accent, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
            👑 국민 프로듀서의 선택은... 데이터다!
          </p>
          <p style={{ color: palette.gold, fontSize: 13, marginTop: 4, fontWeight: 700 }}>
            🎤 고기팀 프로듀스11, 출정! 직캠 스코어 맞히기 대전 🎤
          </p>
          <div
            style={{
              marginTop: 10, display: "inline-flex", alignItems: "center", gap: 10,
              background: palette.card, borderRadius: 999, padding: "6px 14px", fontSize: 13,
              border: `1px solid #24395C`,
            }}
          >
            <Avatar src={currentUser.img} size={28} ring={palette.gold} />
            <span style={{ textAlign: "left", lineHeight: 1.3 }}>
              {currentUser.title}
              <br />
              ({currentUser.name})
            </span>
            <span onClick={handleLogout} style={{ color: palette.sub, cursor: "pointer", textAlign: "center", lineHeight: 1.3 }}>
              로그
              <br />
              아웃
            </span>
          </div>
        </div>

        {/* 전광판 */}
        <div
          style={{
            background: "#0A1320", border: `1px solid ${palette.gold}`, borderRadius: 12,
            padding: "12px 16px", marginBottom: 16, boxShadow: `0 0 12px rgba(255,200,87,0.15)`,
          }}
        >
          <div style={{ fontSize: 11, color: palette.gold, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
            📡 전광판 (매시 정각 갱신) · {fact.title}
          </div>
          <div style={{ fontSize: 13, color: palette.text, lineHeight: 1.6 }}>{fact.body}</div>
        </div>

        {/* 채팅창 */}
        <div style={{ marginTop: 20, background: palette.card, borderRadius: 16, border: `1px solid #24395C`, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid #24395C`, fontWeight: 700, fontSize: 14, color: palette.gold }}>
            💬 연습생 대기실 채팅
          </div>
          <div ref={chatScrollRef} style={{ maxHeight: 420, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {chatMessages.length === 0 && (
              <div style={{ color: palette.sub, fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                아직 메시지가 없어요. 첫 마디를 남겨보세요! 🎤
              </div>
            )}
            {chatMessages.map((m, i) => {
              if (m.system) {
                return (
                  <div key={i} style={{ textAlign: "center", fontSize: 12, color: palette.gold, padding: "4px 0" }}>
                    {m.text}
                  </div>
                );
              }
              const isMe = m.name === currentUser.name;
              return (
                <div key={i} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, alignItems: "flex-start", maxWidth: "100%" }}>
                  <Avatar src={m.img} size={30} />
                  <div style={{ maxWidth: "75%" }}>
                    {!isMe && (
                      <div style={{ fontSize: 11, color: palette.sub, marginBottom: 2 }}>{m.displayName}</div>
                    )}
                    <div
                      style={{
                        background: isMe ? palette.accent : "#0E1A2B", color: "#fff", borderRadius: 12,
                        padding: "8px 12px", fontSize: 14, lineHeight: 1.4, wordBreak: "break-word",
                      }}
                    >
                      {m.text}
                    </div>
                    <div style={{ fontSize: 10, color: "#5A7099", marginTop: 2, textAlign: isMe ? "right" : "left" }}>
                      {new Date(m.ts).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: `1px solid #24395C` }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
              placeholder="데뷔 평가 전에 할 말은 하자 🎤"
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid #24395C`,
                background: "#0E1A2B", color: palette.text, fontSize: 14, outline: "none",
              }}
            />
            <button
              onClick={sendChat}
              style={{
                padding: "10px 16px", borderRadius: 10, border: "none",
                background: palette.accent, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >
              전송
            </button>
          </div>
        </div>

        {/* 리더보드 */}
        <div
          style={{
            marginTop: 20, background: palette.card, borderRadius: 16, border: `1px solid #24395C`, overflow: "hidden",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: `1px solid #24395C`, fontWeight: 700, color: palette.gold, lineHeight: 1.4 }}>
            <span style={{ fontSize: 14 }}>👑 데뷔 평가 순위</span>
            <span style={{ fontSize: 11, marginLeft: 6 }}>(낮은 확률에 베팅하는 광기의 연습생들)</span>
          </div>
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {leaderboard.length === 0 && (
              <div style={{ color: palette.sub, fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                아직 아무도 베팅하지 않았어요. 첫 용기있는 자가 되어보세요!
              </div>
            )}
            {leaderboard.map((row, i) => (
              <div
                key={row.name}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "#0E1A2B", borderRadius: 10, padding: "8px 12px", fontSize: 13,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: palette.gold, fontWeight: 700, width: 24 }}>
                    {row.isMaster ? "👑" : i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                  </span>
                  <Avatar src={row.img} size={26} ring={row.name === currentUser.name ? palette.gold : undefined} />
                  <span style={{ fontWeight: row.name === currentUser.name ? 700 : 400, color: row.name === currentUser.name ? palette.gold : palette.text }}>
                    {row.displayName}
                  </span>
                </div>
                <div style={{ textAlign: "right", color: palette.sub }}>
                  <div>{row.scoreLabel} ({(row.prob * 100).toFixed(1)}%)</div>
                  <div style={{ color: row.isClickGameTie && !row.isClickGameWinner ? palette.sub : palette.gold, fontWeight: 700 }}>
                    {row.perPersonHours}h
                    {row.isClickGameTie && (
                      <span style={{ fontSize: 10, marginLeft: 4 }}>
                        {row.isClickGameWinner ? "🖱️🏆" : "🖱️"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentUser.title === MASTER_TITLE ? (
          <div
            style={{
              marginTop: 16, marginBottom: 12, padding: "14px", borderRadius: 10, textAlign: "center",
              background: "#0E1A2B", border: `1px solid ${palette.gold}`, color: palette.gold, fontWeight: 700, fontSize: 14,
            }}
          >
            🎤 메인 프로듀서(테디)는 베팅에 참여하지 않습니다. 공정한 심사위원으로 무대를 지켜봅니다 🧐
          </div>
        ) : (
        <>
        {/* 선택 확정 버튼 */}
        {isBettingClosed() ? (
          <div
            style={{
              marginTop: 16, marginBottom: 12, padding: "14px", borderRadius: 10, textAlign: "center",
              background: "#3A1F1F", border: `2px solid ${palette.accent}`, color: palette.accent, fontWeight: 700, fontSize: 15,
            }}
          >
            🎬 데뷔 평가가 시작됐다... 이제 결과만 남았다
          </div>
        ) : (
          <div style={{ marginTop: 16, marginBottom: 12 }}>
            <button
              onClick={handleSubmit}
              style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none",
                background: palette.accent, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
              }}
            >
              이 스코어로 데뷔 평가 신청 🔮
            </button>
          </div>
        )}
        {error && (
          <div style={{ color: palette.accent, fontSize: 13, marginBottom: 12 }}>🚨 {error}</div>
        )}
        {selected === null && !isBettingClosed() && (
          <div style={{ color: palette.sub, fontSize: 13, marginBottom: 12 }}>
            👇 일단 스코어부터 골라야 데뷔가 시작됩니다
          </div>
        )}

        {/* 스코어 리스트 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {SCORES.map((s, idx) => {
            const entries = members[idx] || [];
            const isSelected = selected === idx;
            const perPersonHours = entries.length > 0 ? (s.hours / entries.length).toFixed(1) : s.hours;
            const locked = isBettingClosed();
            return (
              <div
                key={idx}
                onClick={() => !locked && setSelected(idx)}
                style={{
                  background: isSelected ? "#1F3654" : palette.card,
                  border: isSelected ? `2px solid ${palette.gold}` : `1px solid #24395C`,
                  borderRadius: 14, padding: "14px 16px", cursor: locked ? "default" : "pointer",
                  transition: "all 0.15s", opacity: locked && !isSelected ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{s.emoji} {s.label}</div>
                    <div style={{ fontSize: 11, color: palette.sub, marginTop: 2 }}>
                      예상 확률 약 {(s.prob * 100).toFixed(1)}% {s.source === "real" ? "(실제 배당 기반)" : "(추정)"}
                    </div>
                  </div>
                  <div style={{ background: "#0E1A2B", borderRadius: 999, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: palette.gold, whiteSpace: "nowrap" }}>
                    {s.hours === 7 ? "🏆 " : ""}{s.hours}h
                    {entries.length > 1 && (
                      <span style={{ color: palette.sub, fontWeight: 400 }}> → {perPersonHours}h/인</span>
                    )}
                  </div>
                </div>
                {entries.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {entries.map((e) => {
                      const isMe = e.name === currentUser.name;
                      const myScore = clickGameScores[`${idx}_${e.name}`];
                      return (
                        <span
                          key={e.name}
                          style={{
                            background: "#0E1A2B",
                            border: `1px solid ${isMe ? palette.gold : palette.accent2}`,
                            color: isMe ? palette.gold : palette.accent2,
                            borderRadius: 999, padding: "4px 10px 4px 4px", fontSize: 12,
                            display: "flex", alignItems: "center", gap: 6, fontWeight: isMe ? 700 : 400,
                          }}
                        >
                          <Avatar src={e.img} size={22} ring={isMe ? palette.gold : palette.accent2} />
                          {isMe ? "⭐ " : ""}{e.displayName || e.name}
                          {myScore != null && (
                            <span style={{ fontSize: 10, color: palette.gold }}>🖱️{myScore}</span>
                          )}
                          {isMe && (
                            <span
                              onClick={(ev) => { ev.stopPropagation(); removeEntry(idx, e.name); }}
                              style={{ cursor: "pointer", color: palette.sub }}
                            >
                              ×
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
                {entries.length >= 2 && (
                  <div style={{ marginTop: 10, padding: "8px 10px", background: "#0A1320", borderRadius: 10, border: `1px dashed ${palette.gold}` }}>
                    <div style={{ fontSize: 11, color: palette.gold, fontWeight: 700, marginBottom: 4 }}>
                      🖱️ 동점 베팅 발생! 클릭 미니게임으로 승자 결정
                    </div>
                    {(() => {
                      const result = getClickGameWinner(idx);
                      return result && result.bestScore > 0 ? (
                        <div style={{ fontSize: 11, color: palette.sub, marginBottom: 6 }}>
                          현재 1위: <span style={{ color: palette.gold, fontWeight: 700 }}>{result.winner}</span> ({result.bestScore}클릭)
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: palette.sub, marginBottom: 6 }}>아직 아무도 도전하지 않았어요</div>
                      );
                    })()}
                    {entries.some((e) => e.name === currentUser.name) && (
                      <button
                        onClick={(ev) => { ev.stopPropagation(); startClickGame(idx); }}
                        style={{
                          padding: "6px 12px", borderRadius: 8, border: "none",
                          background: palette.gold, color: "#0E1A2B", fontWeight: 700, fontSize: 11, cursor: "pointer",
                        }}
                      >
                        클릭게임 도전하기 🖱️
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </>
        )}

        {/* 출처 */}
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#5A7099", lineHeight: 1.6 }}>
          확률 출처: KickOff.co.uk
          <br />
          (2026.6.19 기준 Correct Score 예측, 상위 15개 스코어){" "}
          <br />
          <br />
          <a href="https://www.kickoff.co.uk/world-cup-predictions-stats-odds/south-africa-vs-south-korea/" target="_blank" rel="noreferrer" style={{ color: palette.gold }}>
            원문 보기
          </a>
          <br />
          {"· "}그 외 스코어는 동 페이지의 예상 득점(남아공 0.8 / 한국 1.7)을 토대로 추정
        </div>

        {/* 참전 현황 */}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: palette.sub }}>
          👑 현재 참가 인원: {allEntries.length} / 11명 {allEntries.length === 11 ? "— 풀 라인업 완성! 🔥" : "— 아직 자리 있음"}
        </div>

        {/* 룰 카드 */}
        <div
          style={{
            background: palette.card, borderRadius: 16, padding: "18px 20px", marginTop: 20,
            fontSize: 14, lineHeight: 1.7, border: `1px solid #24395C`,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8, color: palette.gold }}>🎯 게임 규칙 (feat. 도파민, 그리고 데뷔의 무게)</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: palette.sub }}>
            <li>
              인생은 한 방! 데뷔는 두 번 없다
              <br />
              — 스코어 하나 찍고 이름 박기
            </li>
            <li style={{ marginTop: 10 }}>
              경기 시작(6/25 10:00) 전까지는 변심 자유
              <br />
              — 그게 연습생의 권리다
            </li>
            <li style={{ marginTop: 10 }}>
              확률이 낮은 스코어일수록 보상 시간 ↑
              <br />
              (최대 7시간 = <b>🏆 데뷔조 특별 휴가증</b>
              <br />
              — 7/31까지 원하는 날 사용 가능)
            </li>
            <li style={{ marginTop: 10 }}>
              같은 스코어에 2명 이상 적중한다면
              <br />
              클릭 미니게임 승부로 결판!
              <br />
              <span style={{ fontSize: 12 }}>1등이 해당 스코어 보상시간을 모두 가져갑니다</span>
            </li>
            <li style={{ marginTop: 10 }}>
              적중자 0명이면?
              <br />
              그 시간은... 무대 뒤로 증발한다 💨
            </li>
          </ul>
        </div>

        {/* 진지한 경고 문구 */}
        <div
          style={{
            marginTop: 16, padding: "14px 16px", borderRadius: 12,
            background: "#1A1A1A", border: "1px solid #555",
            fontSize: 12, color: "#CCCCCC", lineHeight: 1.7,
          }}
        >
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>⚠️ 안내</div>
          본 게임은 팀원 간 친목 도모 및 조직 활성화를 위한 순수한 이벤트입니다.
          여기서 지급되는 보상은 반차 등 사내에서 합의된 비금전적 보상에 한정되며,
          금전을 걸거나 주고받는 행위는 어떤 형태로든 허용되지 않습니다.
        </div>

        {/* 메인 프로듀서 전용: 전체 멤버 명단 + 삭제 */}
        {currentUser.title === MASTER_TITLE && (
          <div style={{ marginTop: 24, background: palette.card, borderRadius: 16, border: `1px solid ${palette.gold}`, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid #24395C`, fontWeight: 700, fontSize: 14, color: palette.gold }}>
              🎖️ 메인 프로듀서 전용 관리실 — 연습생 전체 명단 ({roster.length}명, 가입 순)
            </div>
            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              {roster.length === 0 && (
                <div style={{ color: palette.sub, fontSize: 13, textAlign: "center", padding: "12px 0" }}>
                  아직 가입한 연습생이 없습니다.
                </div>
              )}
              {roster.map((m, i) => (
                <div
                  key={m.name + i}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                    padding: "8px 10px", borderRadius: 10, background: "#0E1A2B",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 12, color: palette.sub, width: 24, textAlign: "right" }}>{i + 1}</span>
                    <Avatar src={m.img} size={28} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: palette.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {m.displayName}
                      </div>
                      <div style={{ fontSize: 11, color: "#5A7099" }}>
                        {new Date(m.joinedAt).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })} 가입
                      </div>
                    </div>
                  </div>
                  {m.title === MASTER_TITLE ? (
                    <span style={{ fontSize: 11, color: palette.gold, fontWeight: 700, flexShrink: 0 }}>프로듀서(나)</span>
                  ) : deleteTarget === m.name ? (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => handleAdminDeleteMember(m.name)}
                        style={{
                          border: "none", borderRadius: 8, padding: "6px 10px",
                          background: palette.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        진짜 삭제
                      </button>
                      <button
                        onClick={() => setDeleteTarget(null)}
                        style={{
                          border: `1px solid #24395C`, borderRadius: 8, padding: "6px 10px",
                          background: "transparent", color: palette.sub, fontSize: 12, fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteTarget(m.name)}
                      style={{
                        flexShrink: 0, border: "none", borderRadius: 8, padding: "6px 10px",
                        background: palette.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      🗑️ 삭제
                    </button>
                  )}
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#5A7099", marginTop: 4, lineHeight: 1.6 }}>
                삭제 시 해당 멤버의 베팅 기록도 함께 사라지고, 동일한 이름/번호로 재가입할 수 있게 됩니다.
                <br />
                비밀번호를 잊은 팀원이 있다면 여기서 삭제 후 다시 가입하라고 안내해주세요!
              </div>
            </div>
          </div>
        )}
      </div>
      <ClickGameModal />
    </div>
  );
}
