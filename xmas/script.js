document.addEventListener("DOMContentLoaded", () => {
  const rawEl = document.getElementById("raw-chord-data");
  const sheetEl = document.getElementById("chord-sheet");
  if (!rawEl || !sheetEl) return;

  // 先頭と末尾の空行だけ除去し、行内のスペースはそのまま保持
  const rawText = rawEl.textContent.replace(/^\n+|\n+$/g, "");
  const lines = rawText.split("\n");

  // コード行かどうかを判定する関数（例: "C  Am7  Dm7  G7" や "F#m7/B  Esus4"）
  const chordTokenRegex = /^[A-G][#b]?(?:maj|min|m|dim|aug|sus|add|M)?[0-9]*(?:(?:\([#b0-9,+\-]+\))|(?:[#b+-]?[0-9]+))*(?:\/[A-G][#b]?)?$/;

  function isChordLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return false;
    // セクション見出しや括弧メモは除外
    if (trimmed.startsWith("{") || trimmed.startsWith("（") || trimmed.startsWith("(")) {
      return false;
    }
    const tokens = trimmed.split(/\s+/);
    return tokens.every((token) => {
      // 小節線 "|" やリピート記号 "%" もコード行として許容
      if (token === "|" || token === "||" || token === "%") return true;
      return chordTokenRegex.test(token);
    });
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed === "") {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty-line";
      sheetEl.appendChild(emptyDiv);
      return;
    }

    // {Intro} や {Chorus} などのセクション見出し
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const secDiv = document.createElement("div");
      secDiv.className = "section-label";
      secDiv.textContent = trimmed.slice(1, -1);
      sheetEl.appendChild(secDiv);
      return;
    }

    // コード行か歌詞行かを判定して描画
    const lineDiv = document.createElement("div");
    if (isChordLine(line)) {
      lineDiv.className = "chord-line";
    } else {
      lineDiv.className = "lyric-line";
    }
    lineDiv.textContent = line;
    sheetEl.appendChild(lineDiv);
  });

  // 文字サイズ切り替え
  const sizeBtns = document.querySelectorAll("[data-size]");
  const savedSize = localStorage.getItem("chord_font_size") || "md";
  applySize(savedSize);

  sizeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const size = btn.getAttribute("data-size");
      applySize(size);
      localStorage.setItem("chord_font_size", size);
    });
  });

  function applySize(size) {
    sheetEl.classList.remove("size-sm", "size-md", "size-lg");
    sheetEl.classList.add("size-" + size);
    sizeBtns.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-size") === size);
    });
  }

  // 自動スクロール
  const scrollBtns = document.querySelectorAll("[data-scroll]");
  let scrollTimer = null;

  scrollBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const speed = Number(btn.getAttribute("data-scroll"));
      setScrollSpeed(speed);
      scrollBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  function setScrollSpeed(speed) {
    if (scrollTimer) {
      clearInterval(scrollTimer);
      scrollTimer = null;
    }
    if (speed <= 0) return;

    const intervalMs = speed === 1 ? 50 : speed === 2 ? 30 : 18;
    scrollTimer = setInterval(() => {
      window.scrollBy(0, 1);
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
        clearInterval(scrollTimer);
        scrollTimer = null;
        scrollBtns.forEach((b) => {
          b.classList.toggle("active", b.getAttribute("data-scroll") === "0");
        });
      }
    }, intervalMs);
  }
});
