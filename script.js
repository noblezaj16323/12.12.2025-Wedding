// ============================
// Inject minimal fade CSS (for smooth reload transitions)
// ============================
(function injectFadeStyles(){
  const css = `
    .fade-out{ opacity:0; transition:opacity .4s ease; }
    .fade-in{ opacity:1; transition:opacity .4s ease; }
    .hidden { display: none !important; } /* safety, if not in your CSS */
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

function setNavOffset(){
  const h = document.querySelector('header.site-nav');
  if (h) document.documentElement.style.setProperty('--nav-h', h.offsetHeight + 'px');
}
window.addEventListener('load', setNavOffset);
window.addEventListener('resize', setNavOffset);
// Smooth reload: fade, scroll to top/home, then reload
function smoothReload(target) {
  const el = target || document.body;

  // scroll to the top or your specific section
  window.location.hash = '#home'; // 👈 ensures it opens at top/home after reload

  el.classList.add('fade-in');
  requestAnimationFrame(() => {
    el.classList.remove('fade-in');
    el.classList.add('fade-out');
  });

  el.addEventListener('transitionend', () => {
    window.scrollTo({ top: 0, behavior: 'auto' }); // scrolls to top before reload
    location.reload();
  }, { once:true });
}


// Bind fade+reload to any existing "Search Another Guest" button
function hookSearchReloadButtons(scope = document){
  scope.querySelectorAll('#searchAnotherGuestBtn, [data-action="search-again"]')
    .forEach(btn => {
      if (!btn.dataset.boundReload) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          smoothReload();
        });
        btn.dataset.boundReload = '1';
      }
    });
}

// Optional: nice fade-in on page load
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
});

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
    phase: Math.random() * Math.PI * 2,
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

    if (leaf.y > height + 50) {
      leaf.y = -50;
      leaf.x = Math.random() * width;
    }
    if (leaf.x < -50) leaf.x = width + 50;
    if (leaf.x > width + 50) leaf.x = -50;

    leaf.el.style.transform = `translate(${leaf.x}px, ${leaf.y}px) rotate(${leaf.angle}deg)`;
  });

  requestAnimationFrame(animate);
}
animate();

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
  hookSearchReloadButtons();  // attach on load too
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
const INCLUDE_MAIN_IN_SUBMIT = true;
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

  // ----- Guest 1 (You) — editable -----
  const firstWrap = document.createElement("div");
  const first = document.createElement("input");
  first.type = "text";
  first.id = "guest_1";
  first.name = "guest_names[]";
  first.placeholder = "Guest 1 (You)";
  first.value = mainName || "";

  // hard-unlock in case something set it elsewhere
  first.readOnly = false;
  first.disabled = false;
  first.removeAttribute("readonly");
  first.removeAttribute("disabled");
  first.classList.remove("readonly");          // ensure no CSS is blocking typing
  first.autocomplete = "off";

  firstWrap.appendChild(first);
  box.appendChild(firstWrap);

  // ----- Guests 2..n (IMPORTANT: start at 2) -----
  for (let i = 2; i <= n; i++) {
    const wrap = document.createElement("div");
    const input = document.createElement("input");
    input.type = "text";
    input.id = `guest_${i}`;
    input.name = "guest_names[]";
    input.placeholder = `Guest ${i} full name`;

    // prefill[0] -> guest_2, prefill[1] -> guest_3, etc.
    const prefillIndex = i - 2;
    input.value = prefill[prefillIndex] || "";

    input.readOnly = false;
    input.disabled = false;
    input.removeAttribute("readonly");
    input.removeAttribute("disabled");
    input.autocomplete = "off";

    wrap.appendChild(input);
    box.appendChild(wrap);
  }
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
    if (idx === 0) { el.readOnly = false; el.disabled = !enabled; el.classList.add("readonly"); }
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
  const _btn = document.getElementById('checkBtn');
  setBusy(_btn, true, 'Checking…');
  announce('Checking name…');

  showLoadingOverlay(true, 'Please wait…');

  const name = document.getElementById("guestName").value.trim();
  if (!name) {
    _btn.style.display = "none";
    showLoadingOverlay(false);
    setBusy(_btn, false);
    return alert("Please enter your name");
  }

  try {
    const controller = new AbortController();
    const response = await withTimeout(
      fetch(WEB_APP_URL + "?name=" + encodeURIComponent(name), { signal: controller.signal }),
      12000,
      controller
    );
    if (!response.ok) throw new Error("Network error " + response.status);
    const result = await response.json();

    if (!result.exists) {
      const status = document.getElementById("status");
      status.innerHTML = `
        <div class="not-found">
          Sorry, we couldn’t locate your name on our guest list.<br>
          If you believe this is an oversight, please contact us using the button below.
          <br>
          <button class="contact-btn" onclick="window.open('https://web.facebook.com/psychewhiz/', '_blank')">
            Contact Host
          </button>
          <button class="confirmation-btn" data-action="search-again">Search Another Guest</button>
        </div>`;
      hideFormAndButtons();
      hookSearchReloadButtons(status); // bind inside the newly injected HTML
      return;
    }

    // ✅ If attendance already set, show confirmation and bind existing search button
    const attendance = (result.attendance || "").toLowerCase();
    if (attendance === "yes" || attendance === "no") {
      editingEnabled = false;
      hideFormAndButtons();

      // hide the textbox + continue button
      ["guestName","checkBtn"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
      });
document.getElementById("rsvpHeader").style.display = "none";


      const submittedSection = document.getElementById("rsvpSubmittedSection");
      const guestNameDisplay = document.getElementById("guestNameDisplay");
      const confirmationStatus = document.getElementById("confirmationStatus");
      const confirmationIcon = document.getElementById("confirmationIcon");
      const confirmationTitle = document.getElementById("confirmationTitle");
      const confirmationMessage = document.getElementById("confirmationMessage");
      const additionalGuestsContainer = document.getElementById("additionalGuestsContainer");
      const additionalGuestsList = document.getElementById("additionalGuestsList");

      if (!submittedSection || !guestNameDisplay || !confirmationStatus || !confirmationIcon || !confirmationTitle || !confirmationMessage) {
        console.warn("⚠️ Some confirmation section elements are missing in the HTML.");
        return;
      }

      guestNameDisplay.innerText = result.name || "Guest";

      if (attendance === "yes") {
        confirmationStatus.textContent = "✔ Accepted";
        confirmationStatus.className = "confirmation-status accepted";
        confirmationIcon.textContent = "✅";
        confirmationTitle.textContent = "RSVP Confirmed";
        confirmationMessage.textContent = "We already have your RSVP confirmation. We can't wait to celebrate with you!";
      } else {
        confirmationStatus.textContent = "❌ Declined";
        confirmationStatus.className = "confirmation-status declined";
        confirmationIcon.textContent = "💭";
        confirmationTitle.textContent = "RSVP Declined";
        confirmationMessage.textContent = "We’re sorry you can’t make it, but thank you for responding!";
      }

      // Populate additional guests list (if any)
      if (additionalGuestsContainer && additionalGuestsList) {
        const guestList = (result.additionalGuests || "").split(/\r?\n|,\s*/).map(g => g.trim()).filter(Boolean);
        if (guestList.length > 0) {
          additionalGuestsContainer.classList.remove("hidden");
          additionalGuestsList.innerHTML = "";
          guestList.forEach(g => {
            const li = document.createElement("li");
            li.textContent = g;
            additionalGuestsList.appendChild(li);
          });
        } else {
          additionalGuestsContainer.classList.add("hidden");
        }
      }

      submittedSection.classList.remove("hidden");
      hookSearchReloadButtons(submittedSection);
      return;
    }

    // --- Continue original registration logic if attendance not yet answered ---
    guestData = result;
    const planned = Number(result.plannedGuests || 0);
    const prefillList = (result.additionalGuests || "").split(/\r?\n|,\s*/).map(s => s.trim()).filter(Boolean);

    const guestCountInput = document.getElementById("guestCount");
    guestCountInput.value = planned;
    guestCountInput.max = planned;
    guestCountInput.min = 0;

    if (result.alreadyRegistered === "Yes") {
      const remainingSeats = planned - Number(result.registeredGuests || 0);
      if (remainingSeats <= 0) {
        editingEnabled = false;

        const elementsToHide = [
          "guestDetails", "guestName", "checkBtn", "guestInputs",
          "rsvpForm", "editButtons", "editPrompt", "status",
          "submitSection", "updateSection"
        ];
        elementsToHide.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.add("hidden");
        });

        const section = document.getElementById("rsvpSubmittedSection");
        if (section) {
          section.classList.remove("hidden");
          hookSearchReloadButtons(section);
        }
      } else {
        editingEnabled = false;
        document.getElementById("checkBtn").style.display = "none";
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
const statusEl = document.getElementById("status");
statusEl.innerText = `🎉 Welcome ${result.name}! We have reserved ${planned} seat/s for you.`;
statusEl.style.textAlign = "center";
        const elementsToHide = [
          "checkBtn", "guestDetails", "guestName"
         
        ];
        elementsToHide.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.add("hidden");
        });
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

  const statusEl = document.getElementById("status");
  statusEl.innerHTML = `
    <div style="
      background: linear-gradient(180deg, #f8fbff, #eef3f8);
      border: 1px solid #d8e2ec;
      box-shadow: 0 4px 16px rgba(15, 39, 69, 0.08);
      padding: 20px 25px;
      border-radius: 10px;
      color: #334155;
      font-family: 'Playfair Display', serif;
      text-align: center;
    ">
      <p style="margin:0 0 12px;">Error connecting to the server.</p>
      <button id="refreshBtn" style="
        background: linear-gradient(135deg, #1e3a8a, #3b82f6);
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 15px;
        font-family: 'Playfair Display', serif;
        transition: background 0.3s ease, transform 0.15s ease;
      ">Refresh</button>
    </div>
  `;

  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("mouseover", () => refreshBtn.style.transform = "scale(1.05)");
    refreshBtn.addEventListener("mouseout", () => refreshBtn.style.transform = "scale(1)");
    refreshBtn.addEventListener("click", () => location.reload());
  }
}
 finally {
    showLoadingOverlay(false);
    setBusy(document.getElementById('checkBtn'), false);
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
  document.getElementById("checkBtn").style.display = "inline-block";
  document.getElementById("guestName").value = "";
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
  document.getElementById("checkBtn").style.display = "inline-block";
  const _sbtn = document.getElementById('submitBtn'); 
  setBusy(_sbtn,true,'Submitting…'); 
  announce('Submitting your RSVP…');

  showLoadingOverlay(true, 'Submitting your RSVP…');

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
   const status = document.getElementById("status");
  status.innerHTML = `
    <div class="rsvp-success-box">
      <h2>${attendance === "Yes" ? "💙 RSVP Submitted Successfully!" : "💭 RSVP Noted"}</h2>
      <p>
        Thank you, ${guestData.name}! 
        ${attendance === "Yes" 
          ? "We’ve received your response and can’t wait to see you!" 
          : "We’re sorry you can’t make it. Thank you for letting us know!"}
      </p>
      <button onclick="location.href='#home'" class="btn alt">Back to Home</button>
    </div>
  `;
    setFormEditable(false);
    editingEnabled = false;
    hideFormAndButtons();
  } catch (err) {
    console.error("Error in submitRSVP:", err);
    document.getElementById("status").innerText = "⚠️ Failed to submit RSVP. Check console.";
  }
  finally { 
    showLoadingOverlay(false);
    setBusy(document.getElementById('submitBtn'),false); 
    announce('Ready'); 
  }
}
function showSuccessMessage() {
  document.getElementById("rsvpForm").classList.add("hidden");
  document.getElementById("rsvpSuccessMessage").classList.remove("hidden");
  launchConfetti(); // optional, for celebration 🎉
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
