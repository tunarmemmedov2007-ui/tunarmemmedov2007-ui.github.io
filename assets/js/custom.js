/* ============================================================
   CUSTOM.JS — FORM + MEMORY GAME (FIXED TIMER)
============================================================ */

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isOnlyLetters(str) {
  return /^[A-Za-zÀ-ž\s]+$/.test(str);
}

document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     CONTACT FORM
  ============================================================ */

  const form = document.getElementById("extendedForm");
  if (!form) return;

  const nameInput = document.getElementById("userName");
  const surnameInput = document.getElementById("userSurname");
  const emailInput = document.getElementById("userEmail");
  const phoneInput = document.getElementById("userPhone");
  const addressInput = document.getElementById("userAddress");
  const rating1 = document.getElementById("rating1");
  const rating2 = document.getElementById("rating2");
  const rating3 = document.getElementById("rating3");
  const submitBtn = document.getElementById("submitBtn");
  const results = document.getElementById("form-results");

  function error(el, msg) {
    el.classList.add("input-error");
    let t = el.parentElement.querySelector(".error-text");
    if (!t) {
      t = document.createElement("div");
      t.className = "error-text";
      el.parentElement.appendChild(t);
    }
    t.textContent = msg;
  }

  function clear(el) {
    el.classList.remove("input-error");
    const t = el.parentElement.querySelector(".error-text");
    if (t) t.remove();
  }

  /* ---------- Phone Mask ---------- */
  phoneInput.addEventListener("input", () => {
    let v = phoneInput.value.replace(/\D/g, "");
    if (!v.startsWith("3706")) v = "3706" + v.slice(4);
    if (v.length > 11) v = v.slice(0, 11);

    let out = "+370";
    if (v.length > 3) out += " " + v[3];
    if (v.length > 4) out += v.slice(4, 6);
    if (v.length > 6) out += " " + v.slice(6);

    phoneInput.value = out;
  });

  function validate() {
    let ok = true;

    if (!isOnlyLetters(nameInput.value.trim())) {
      error(nameInput, "Only letters allowed");
      ok = false;
    } else clear(nameInput);

    if (!isOnlyLetters(surnameInput.value.trim())) {
      error(surnameInput, "Only letters allowed");
      ok = false;
    } else clear(surnameInput);

    if (!isEmailValid(emailInput.value)) {
      error(emailInput, "Invalid email");
      ok = false;
    } else clear(emailInput);

    if (phoneInput.value.length < 14) {
      error(phoneInput, "Invalid LT phone");
      ok = false;
    } else clear(phoneInput);

    if (addressInput.value.trim().length < 4) {
      error(addressInput, "Address too short");
      ok = false;
    } else clear(addressInput);

    [rating1, rating2, rating3].forEach(r => {
      if (r.value < 1 || r.value > 10) {
        error(r, "1–10 only");
        ok = false;
      } else clear(r);
    });

    submitBtn.disabled = !ok;
  }

  [
    nameInput, surnameInput, emailInput,
    phoneInput, addressInput,
    rating1, rating2, rating3
  ].forEach(i => i.addEventListener("input", validate));

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    const avg =
      ((+rating1.value + +rating2.value + +rating3.value) / 3).toFixed(1);

    const color = avg < 4 ? "red" : avg < 7 ? "orange" : "green";
    const helper =
      "FE24-JS-CF-" +
      Math.random().toString(36).substring(2, 7).toUpperCase();

    results.innerHTML = `
      <div>Name: ${nameInput.value}</div>
      <div>Surname: ${surnameInput.value}</div>
      <div>Email: ${emailInput.value}</div>
      <div>Phone number: ${phoneInput.value}</div>
      <div>Address: ${addressInput.value}</div>
      <div>Helper tag: ${helper}</div>
      <div>
        ${nameInput.value} ${surnameInput.value}:
        <span style="color:${color};font-weight:bold">${avg}</span>
      </div>
    `;

    popup("Form submitted successfully!");
  });

  function popup(msg) {
    const p = document.createElement("div");
    p.className = "success-popup";
    p.textContent = msg;
    document.body.appendChild(p);
    setTimeout(() => p.classList.add("visible"), 50);
    setTimeout(() => p.remove(), 2500);
  }

  /* ============================================================
     MEMORY GAME — TIMER FIXED
  ============================================================ */

  const board = document.getElementById("mg-board");
  if (!board) return;

  const movesEl = document.getElementById("mg-moves");
  const matchesEl = document.getElementById("mg-matches");
  const winEl = document.getElementById("mg-win");
  const timerEl = document.getElementById("mg-timer");
  const diffSel = document.getElementById("mg-difficulty");
  const startBtn = document.getElementById("mg-start");
  const restartBtn = document.getElementById("mg-restart");

  const icons = ["🐱","🐶","🐸","🦊","🐵","🐼","🐯","🐨","🐰","🐹","🐙","🐠"];

  let first = null;
  let second = null;
  let lock = false;
  let moves = 0;
  let matches = 0;
  let timer = 0;
  let interval = null;
  let difficulty = "easy";

  startBtn.onclick = () => {
    difficulty = diffSel.value;
    initGame();
    startTimer();
  };

  restartBtn.onclick = () => {
    clearInterval(interval);
    timer = 0;
    timerEl.textContent = "0s";
    initGame();
  };

  function startTimer() {
    clearInterval(interval);   // 🔴 CRITICAL FIX
    timer = 0;
    timerEl.textContent = "0s";

    interval = setInterval(() => {
      timer++;
      timerEl.textContent = timer + "s";
    }, 1000);
  }

  function initGame() {
    board.innerHTML = "";
    moves = matches = 0;
    movesEl.textContent = "0";
    matchesEl.textContent = "0";
    winEl.textContent = "";
    lock = false;
    first = second = null;

    const set = difficulty === "easy" ? icons.slice(0, 6) : icons;
    const cards = [...set, ...set].sort(() => Math.random() - 0.5);

    board.className = "mg-board " + difficulty;

    cards.forEach(v => {
      const c = document.createElement("div");
      c.className = "mg-card";
      c.dataset.v = v;
      c.innerHTML = `<div class="inner"><div></div><div>${v}</div></div>`;
      c.onclick = () => flip(c);
      board.appendChild(c);
    });
  }

  function flip(c) {
    if (lock || c === first || c.classList.contains("matched")) return;
    c.classList.add("flipped");

    if (!first) {
      first = c;
      return;
    }

    second = c;
    check();
  }

  function check() {
    moves++;
    movesEl.textContent = moves;

    if (first.dataset.v === second.dataset.v) {
      first.classList.add("matched");
      second.classList.add("matched");
      matches++;
      matchesEl.textContent = matches;
      reset();
      if (matches === (difficulty === "easy" ? 6 : 12)) win();
    } else {
      lock = true;
      setTimeout(() => {
        first.classList.remove("flipped");
        second.classList.remove("flipped");
        reset();
      }, 900);
    }
  }

  function reset() {
    first = null;
    second = null;
    lock = false;
  }

  function win() {
    clearInterval(interval);
    winEl.textContent = "🎉 You Win!";
  }

});
