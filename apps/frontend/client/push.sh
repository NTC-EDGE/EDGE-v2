#!/usr/bin/env bash
set -euo pipefail

AI_BASE_URL="https://morning-dew-a596.ntcedge2.workers.dev"
AI_MAX_TOKENS="${AI_MAX_TOKENS:-120}"
DIFF_MAX_CHARS="${DIFF_MAX_CHARS:-12000}"

# Optional if your Worker expects it:
# export APP_API_KEY="..."
APP_API_KEY="${APP_API_KEY:-}"

# 1) Check changes
if git diff --quiet && git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi

# 2) Stage
git add -A

# 3) Build prompt (ensure non-empty)
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
FILES="$(git diff --cached --name-only | head -n 300)"
DIFF="$(git diff --cached | head -c "$DIFF_MAX_CHARS")"
STATUS_SUMMARY="$(git status --porcelain=v1 | head -n 300)"

PROMPT=$(cat <<EOF
Branch: $BRANCH

Changed files:
$FILES

Staged diff (truncated to ${DIFF_MAX_CHARS} chars):
$DIFF
EOF
)

# If diff ended up empty (binary-only changes sometimes), fallback to status/file list
if [[ -z "${DIFF// }" ]]; then
  PROMPT=$(cat <<EOF
Branch: $BRANCH

Staged changes summary (diff empty / binary files likely):
$STATUS_SUMMARY

Changed files:
$FILES
EOF
)
fi

# 4) Ask AI (Node fetch). IMPORTANT: ensure input is NOT empty.
COMMIT_MSG="$(
  PROMPT="$PROMPT" \
  AI_BASE_URL="$AI_BASE_URL" \
  AI_MAX_TOKENS="$AI_MAX_TOKENS" \
  APP_API_KEY="$APP_API_KEY" \
  node - <<'NODE'
function extractProxyText(json) {
  return (json?.result?.response ?? json?.result?.choices?.[0]?.message?.content ?? "")
    .toString()
    .trim();
}

(async () => {
  const AI_BASE_URL = process.env.AI_BASE_URL;
  const MAX_TOKENS = Number(process.env.AI_MAX_TOKENS || "120");
  const APP_API_KEY = (process.env.APP_API_KEY || "").trim();

  let input = (process.env.PROMPT || "").toString();
  if (!input.trim()) input = "Staged changes exist but prompt was empty. Write a Conventional Commit message.";

  const instructions =
`Write ONE git commit message in Conventional Commits format.
- Keep it under 72 characters.
- No quotes, no markdown, no extra lines.
- Be specific about what changed.`;

  const headers = { "Content-Type": "application/json" };
  if (APP_API_KEY) headers["X-APP-KEY"] = APP_API_KEY;

  const res = await fetch(AI_BASE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      input,                 // <-- must be non-empty
      instructions,
      max_tokens: MAX_TOKENS,
    }),
  });

  const json = await res.json().catch(() => ({}));
  const out = extractProxyText(json);

  if (!res.ok || !out) {
    console.error("AI error status:", res.status);
    console.error("AI response:", JSON.stringify(json).slice(0, 1200));
    process.stdout.write("");
    return;
  }

  const msg = out.split(/\r?\n/)[0].trim().slice(0, 72);
  process.stdout.write(msg);
})();
NODE
)"

if [[ -z "${COMMIT_MSG// }" ]]; then
  echo "❌ AI returned empty commit message" >&2
  exit 1
fi

echo "🤖 AI commit message:"
echo "  $COMMIT_MSG"

git commit -m "$COMMIT_MSG"
git push
echo "✅ Done"
