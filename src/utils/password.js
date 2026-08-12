// ---------------------------------------------------------------------------
// Validasi password kuat (dipakai di profile & register)
// ---------------------------------------------------------------------------

// Password umum / lemah yang tidak boleh dipakai
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "passw0rd", "p@ssw0rd",
  "admin", "admin123", "admin1234", "administrator", "admin12345",
  "123456", "1234567", "12345678", "123456789", "1234567890",
  "1234", "12345", "123123", "123321", "112233", "111111",
  "11111111", "000000", "00000000", "654321", "987654", "987654321",
  "qwerty", "qwerty123", "qwertyuiop", "abc123", "abc12345",
  "iloveyou", "letmein", "welcome", "welcome1", "monkey", "dragon",
  "football", "superman", "master", "hello", "hello123", "sunshine",
  "princess", "trustno1", "batman", "pokemon", "shadow", "starwars",
  "changeme", "default", "test", "test123", "testing", "user",
  "user123", "root", "toor", "guest", "access", "login",
]);

// Deretan karakter yang mudah ditebak (angka, alfabet, baris keyboard)
const WEAK_SEQUENCES = [
  "0123456789", "9876543210",
  "abcdefghijklmnopqrstuvwxyz", "zyxwvutsrqponmlkjihgfedcba",
  "qwertyuiop", "poiuytrewq", "asdfghjkl", "lkjhgfdsa",
  "zxcvbnm", "mnbvcxz",
];

// True jika password mengandung deretan karakter berurutan (min. 4)
// atau karakter berulang (mis. "aaaa", "1111")
const hasWeakPattern = (lower) => {
  if (/(.)\1{3,}/.test(lower)) return true;
  return WEAK_SEQUENCES.some((seq) => {
    for (let i = 0; i + 4 <= seq.length; i++) {
      if (lower.includes(seq.slice(i, i + 4))) return true;
    }
    return false;
  });
};

// Cek per item kekuatan password → dipakai untuk checklist di UI
export const getPasswordChecks = (password, userName, userEmail) => {
  const value = password || "";
  const lower = value.toLowerCase();
  const namePart = (userName || "").toLowerCase().replace(/\s+/g, "");
  const emailPart = (userEmail || "").split("@")[0].toLowerCase();
  const userInfo = [namePart, emailPart].filter((p) => p.length >= 3);

  return [
    { key: "length", ok: value.length >= 8 },
    { key: "upper", ok: /[A-Z]/.test(value) },
    { key: "lower", ok: /[a-z]/.test(value) },
    { key: "number", ok: /[0-9]/.test(value) },
    { key: "symbol", ok: /[^A-Za-z0-9]/.test(value) },
    { key: "common", ok: !COMMON_PASSWORDS.has(lower) },
    { key: "sequence", ok: !hasWeakPattern(lower) },
    { key: "userInfo", ok: !userInfo.some((part) => lower.includes(part)) },
  ];
};

// Key pesan error untuk aturan pertama yang gagal
export const passwordErrorKey = (password, userName, userEmail) => {
  const failed = getPasswordChecks(password, userName, userEmail).find(
    (check) => !check.ok
  );
  if (!failed) return null;
  if (failed.key === "length") return "passwordTooShort";
  if (
    failed.key === "upper" ||
    failed.key === "lower" ||
    failed.key === "number" ||
    failed.key === "symbol"
  )
    return "passwordWeak";
  if (failed.key === "common" || failed.key === "sequence")
    return "passwordCommon";
  return "passwordContainsUserInfo";
};
