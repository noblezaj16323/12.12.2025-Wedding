// ============================
// IntersectionObserver for LEFT reveal animations
// ============================
const setupReveals = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('.reveal-left').forEach(el => observer.observe(el));
};

// ============================
// IntersectionObserver for SLIDE-DOWN animations (e.g., Schedule section)
// ============================


// Falling leaves animation
    const leafImage = 'leaf.png'; // path to your image
    const leafCount = window.innerWidth < 768 ? 15 : 25;
    const leaves = [];
    const leafContainer = document.getElementById('leaf-layer') || document.body;

    // Create leaves
    for (let i = 0; i < leafCount; i++) {
      const leaf = document.createElement("img");
      leaf.src = leafImage;
      leaf.className = "leaf";
      leaf.style.left = Math.random() * window.innerWidth + "px";
      leaf.style.top = Math.random() * window.innerHeight + "px";
      const hero = document.querySelector('.hero.with-bg');
      leafContainer.appendChild(leaf);



      leaves.push({
        el: leaf,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 0.5 + Math.random() * 1.5,
        sway: Math.random() * 2 + 1,
        phase: Math.random() * Math.PI * 2, // random phase for left/right movement
        angle: Math.random() * 360,
        rotationSpeed: Math.random() * 2,
      });
    }

    function animate() {
      const height = window.innerHeight;
      const width = window.innerWidth;

      leaves.forEach((leaf) => {
        leaf.y += leaf.speed;
        leaf.x += Math.sin((leaf.y / 50) * leaf.sway + leaf.phase) * 1.5;
        leaf.angle += leaf.rotationSpeed;

        // Reset leaf when it falls below the screen
        if (leaf.y > height + 50) {
          leaf.y = -50;
          leaf.x = Math.random() * width;
        }

        // Keep leaves within horizontal bounds
        if (leaf.x < -50) leaf.x = width + 50;
        if (leaf.x > width + 50) leaf.x = -50;

        leaf.el.style.transform = `translate(${leaf.x}px, ${leaf.y}px) rotate(${leaf.angle}deg)`;
      });

      requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
    window.addEventListener("resize", () => {
      leaves.forEach((leaf) => {
        leaf.x = Math.random() * window.innerWidth;
      });
    });

const setupSlideDown = () => {
  const slideElements = document.querySelectorAll('.slide-down');
  if (slideElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        const cards = entry.target.querySelectorAll('.card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('animate');
          }, index * 200);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  slideElements.forEach(el => observer.observe(el));
};

// ============================
// Smooth scroll for in-page anchors
// ============================
const setupSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
};

// ============================
// Page initialization
// ============================
window.addEventListener('DOMContentLoaded', () => {
  setupReveals();
  setupSlideDown();
  setupSmoothScroll();
});

// ============================
// Load external HTML (reservation)
// ============================
function View(file) {
  fetch(file)
    .then(r => r.text())
    .then(html => document.getElementById("app").innerHTML = html);
}
View("reservation4.html");

// ============================
// RSVP LOGIC
// ============================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzg22K276Q_YXBEowV2lHHF7cwIEom5VydMEEld5fhMTfC4E4ycyOkJRm1oazeh_SV1/exec";
const INCLUDE_MAIN_IN_SUBMIT = false;
const COUNT_INCLUDES_MAIN   = true;

let guestData = null;
let editingEnabled = false;

// ============================
// LOADING OVERLAY Helper
// ============================
function showLoadingOverlay(show = true, message) {
  const el = document.getElementById('loadingOverlay');
  const txt = document.getElementById('loadingText');
  if (!el) return;
  if (message && txt) txt.textContent = message;
  el.classList.toggle('show', !!show);
}

function renderGuestInputs(count, prefill = [], mainName = "") {
  const box = document.getElementById("guestInputs");
  box.innerHTML = "";
  const n = Math.max(0, Number(count || 0));
  if (n === 0) return;

  const firstWrap = document.createElement("div");
  const first = document.createElement("input");
  first.type = "text";
  first.id = "guest_1";
  first.placeholder = "Guest 1 (You)";
  first.value = mainName || "";
  first.readOnly = true;
  first.classList.add("readonly");
  firstWrap.appendChild(first);
  box.appendChild(firstWrap);

  for (let i = 2; i <= n; i++) {
    const wrap = document.createElement("div");
    const input = document.createElement("input");
    input.type = "text";
    input.id = `guest_${i}`;
    input.placeholder = `Guest ${i} full name`;
    input.value = prefill[i - 2] || "";
    wrap.appendChild(input);
    box.appendChild(wrap);
  }

  const hint = document.createElement("div");
  hint.className = "hint";
  box.appendChild(hint);
}

function getGuestNamesFromInputs() {
  return Array.from(document.querySelectorAll("#guestInputs input"))
    .map(el => el.value.trim())
    .filter(v => v.length > 0);
}

function setFormEditable(enabled) {
  const count = document.getElementById("guestCount");
  const inputs = Array.from(document.querySelectorAll("#guestInputs input"));
  const radios = Array.from(document.querySelectorAll('input[name="attendance"]'));

  inputs.forEach((el, idx) => {
    if (idx === 0) { el.readOnly = true; el.disabled = !enabled; el.classList.add("readonly"); }
    else { el.readOnly = !enabled; el.disabled = !enabled; el.classList.toggle("readonly", !enabled); }
  });

  count.readOnly = !enabled;
  count.disabled = !enabled;
  radios.forEach(r => r.disabled = !enabled);
}

function updateVisibilityByAttendance() {
  const selected = document.querySelector('input[name="attendance"]:checked')?.value || "Yes";
  if (selected === "Yes") {
    document.getElementById("guestDetails").classList.remove("hidden");
    document.getElementById("submitSection").classList.toggle("hidden", !editingEnabled);
    document.getElementById("updateSection").classList.add("hidden");
  } else {
    document.getElementById("guestDetails").classList.add("hidden");
    document.getElementById("submitSection").classList.add("hidden");
    document.getElementById("updateSection").classList.toggle("hidden", !editingEnabled);
  }
}

// ============================
// Check Name
// ============================
async function checkName() {
  const _btn=document.getElementById('checkBtn'); 
  setBusy(_btn,true,'Checking…'); 
  announce('Checking name…');

  showLoadingOverlay(true, 'Checking your name…'); // ✅ added

  const name = document.getElementById("guestName").value.trim();
  if (!name) {
    showLoadingOverlay(false);
    setBusy(_btn,false);
    return alert("Please enter your name");
  }

  try {
    const controller = new AbortController();
    const response = await withTimeout(fetch(WEB_APP_URL + "?name=" + encodeURIComponent(name), { signal: controller.signal }), 12000, controller);
    if (!response.ok) throw new Error("Network error " + response.status);
    const result = await response.json();

    if (!result.exists) {
      const status = document.getElementById("status");
      status.innerHTML = `
        <div class="not-found">
          ❌ Sorry, we couldn’t find your name on our guest list.<br>
          If you believe this is a mistake, please click below to reach us.
          <br>
          <button class="contact-btn" onclick="window.open('https://web.facebook.com/psychewhiz/', '_blank')">
            <svg xmlns="http://www.w3.org/2000/svg" class="contact-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Host
          </button>
        </div>`;
      hideFormAndButtons();
      return;
    }

    guestData = result;
    const planned = Number(result.plannedGuests || 0);
    const prefillList = (result.additionalGuests || "")
      .split(/\r?\n|,\s*/).map(s => s.trim()).filter(Boolean);

    const guestCountInput = document.getElementById("guestCount");
    guestCountInput.value = planned;
    guestCountInput.max = planned;
    guestCountInput.min = 0;

    if (result.alreadyRegistered === "Yes") {
      const remainingSeats = planned - Number(result.registeredGuests || 0);
      if (remainingSeats <= 0) {
        editingEnabled = false;
        document.getElementById("status").innerText = "✅ Completed. Already Registered. You want to edit?";
        renderGuestInputs(planned, prefillList, result.name);
        setFormEditable(false);
        document.getElementById("submitSection").classList.add("hidden");
        document.getElementById("updateSection").classList.add("hidden");
        document.getElementById("rsvpForm").classList.add("hidden");
        document.getElementById("editPrompt").classList.remove("hidden");
        document.getElementById("editButtons").classList.remove("hidden");
      } else {
        editingEnabled = false;
        document.getElementById("status").innerText =
          `⚠️ You already submitted, but there are ${remainingSeats} seat(s) left. Update?`;
        renderGuestInputs(planned, prefillList, result.name);
        setFormEditable(false);
        document.getElementById("rsvpForm").classList.add("hidden");
        document.getElementById("editPrompt").classList.remove("hidden");
        document.getElementById("editButtons").classList.remove("hidden");
      }
    } else {
      editingEnabled = true;
      document.getElementById("status").innerText =
        `🎉 Welcome ${result.name}! You have ${planned} planned guests under your name.`;
      renderGuestInputs(planned, prefillList, result.name);
      setFormEditable(true);
      document.getElementById("rsvpForm").classList.remove("hidden");
      document.getElementById("editPrompt").classList.add("hidden");
      document.getElementById("editButtons").classList.add("hidden");
    }

    const attendanceRadios = document.getElementsByName('attendance');
    attendanceRadios.forEach(r => r.addEventListener('change', updateVisibilityByAttendance));
    updateVisibilityByAttendance();

  } catch (err) {
    console.error("Error in checkName:", err);
    document.getElementById("status").innerText = "⚠️ Error connecting to server. Check console.";
  }
  finally { 
    showLoadingOverlay(false);  // ✅ added
    setBusy(document.getElementById('checkBtn'),false); 
    announce('Ready'); 
  }
}

function startEditing() {
  editingEnabled = true;
  document.getElementById("rsvpForm").classList.remove("hidden");
  document.getElementById("status").innerText = `Hi ${guestData.name}, you can now edit your RSVP.`;
  document.getElementById("editPrompt").classList.add("hidden");
  document.getElementById("editButtons").classList.add("hidden");
  document.getElementById("submitSection").classList.add("hidden");
  setFormEditable(true);
  updateVisibilityByAttendance();
}

function cancelEditing() {
  hideFormAndButtons();
  setFormEditable(false);
  editingEnabled = false;
  document.getElementById("status").innerText = "✅ RSVP remains unchanged.";
}

function hideFormAndButtons() {
  document.getElementById("rsvpForm").classList.add("hidden");
  document.getElementById("guestDetails").classList.add("hidden");
  document.getElementById("submitSection").classList.add("hidden");
  document.getElementById("updateSection").classList.add("hidden");
  document.getElementById("editPrompt").classList.add("hidden");
  document.getElementById("editButtons").classList.add("hidden");
}

// ============================
// Submit RSVP
// ============================
async function submitRSVP() {
  const _sbtn=document.getElementById('submitBtn'); 
  setBusy(_sbtn,true,'Submitting…'); 
  announce('Submitting your RSVP…');

  showLoadingOverlay(true, 'Submitting your RSVP…'); // ✅ added

  if (!guestData) return alert("Please check your name first!");

  const attendance = document.querySelector('input[name="attendance"]:checked').value;
  const namesAll = getGuestNamesFromInputs();
  const namesForSubmit = INCLUDE_MAIN_IN_SUBMIT ? namesAll : namesAll.slice(1);
  let guestNames = namesForSubmit.join("\n");
  let guestCount = COUNT_INCLUDES_MAIN ? namesAll.length : Math.max(0, namesAll.length - 1);

  if (attendance === "No") {
    guestNames = "";
    guestCount = 0;
  }

  document.getElementById("guestNames").value = guestNames;
  document.getElementById("guestCount").value = String(guestCount);

  try {
    if (!WEB_APP_URL) {
      document.getElementById("status").innerText = "⚠️ Set WEB_APP_URL to your Apps Script deployment.";
      return;
    }

    const data = new URLSearchParams();
    data.append("row", guestData.row);
    data.append("name", guestData.name);
    data.append("attendance", attendance);
    data.append("guestCount", String(guestCount));
    data.append("guestNames", guestNames);

    const controller2 = new AbortController();
    const response = await withTimeout(fetch(WEB_APP_URL, { method: "POST", body: data, signal: controller2.signal }), 15000, controller2);
    const result = await response.json();
    document.getElementById("status").innerText = result.message;

    setFormEditable(false);
    editingEnabled = false;
    hideFormAndButtons();
  } catch (err) {
    console.error("Error in submitRSVP:", err);
    document.getElementById("status").innerText = "⚠️ Failed to submit RSVP. Check console.";
  }
  finally { 
    showLoadingOverlay(false);  // ✅ added
    setBusy(document.getElementById('submitBtn'),false); 
    announce('Ready'); 
  }
}

// === RSVP UX Helpers ===
function announce(msg){ try{ document.getElementById('ariaStatus').textContent = msg; }catch(e){} }
function setBusy(btn, busy, label){
  if(!btn) return;
  if(busy){
    btn.classList.add('is-loading');
    if(label){ btn.dataset._origLabel = btn.textContent; btn.textContent = label; }
    btn.setAttribute('aria-busy','true'); btn.disabled = true;
  } else {
    btn.classList.remove('is-loading');
    if(btn.dataset._origLabel){ btn.textContent = btn.dataset._origLabel; delete btn.dataset._origLabel; }
    btn.removeAttribute('aria-busy'); btn.disabled = false;
  }
}
function withTimeout(promise, ms, controller){
  const to = setTimeout(()=>controller && controller.abort(), ms);
  return promise.finally(()=>clearTimeout(to));
}
function activateWithFade(btn){
  if(!btn) return;
  btn.classList.add('btn-activated');
  const remove = () => btn.classList.remove('btn-activated');
  btn.addEventListener('animationend', remove, { once: true });
}
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t && t.id === 'guestName') {
    const btn = document.getElementById('checkBtn');
    if (btn) {
      const shouldDisable = t.value.trim().length === 0;
      const wasDisabled = btn.disabled;
      btn.disabled = shouldDisable;
      if (wasDisabled && !shouldDisable) activateWithFade(btn);
    }
  }
});
window.addEventListener('DOMContentLoaded', () => {
  const t = document.getElementById('guestName');
  const btn = document.getElementById('checkBtn');
  if (t && btn) {
    const shouldDisable = t.value.trim().length === 0;
    const wasDisabled = btn.disabled;
    btn.disabled = shouldDisable;
    if (wasDisabled && !shouldDisable) activateWithFade(btn);
  }
  if (t) {
    t.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const b = document.getElementById('checkBtn');
        if (b && !b.disabled) checkName();
      }
    });
  }
});
