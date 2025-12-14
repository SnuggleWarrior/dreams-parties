const STORAGE_KEY = "dreams_parties_bookings_v1";

const form = document.getElementById("bookingForm");
const clearAll = document.getElementById("clearAll");
const yearEl = document.getElementById("year");

const calGrid = document.getElementById("calGrid");
const calTitle = document.getElementById("calTitle");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const todayBtn = document.getElementById("todayBtn");

const listEl = document.getElementById("list");

const dlg = document.getElementById("dlg");
const dlgTitle = document.getElementById("dlgTitle");
const dlgBody = document.getElementById("dlgBody");
const dlgClose = document.getElementById("dlgClose");
const dlgOk = document.getElementById("dlgOk");
const dlgDelete = document.getElementById("dlgDelete");

yearEl.textContent = new Date().getFullYear();

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBookings(b) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}

function sortBookings(b) {
  return b.slice().sort((a, b) => {
    const ad = new Date(`${a.date}T${a.time}`);
    const bd = new Date(`${b.date}T${b.time}`);
    return ad - bd;
  });
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

let currentMonth = new Date();
currentMonth.setDate(1);

function renderCalendar(monthDate) {
  calGrid.innerHTML = "";

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  calTitle.textContent = monthDate.toLocaleString(undefined, { month: "long", year: "numeric" });

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const startDay = start.getDay();

  const bookings = loadBookings();

  // headers
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => {
    const h = document.createElement("div");
    h.className = "head";
    h.textContent = d;
    calGrid.appendChild(h);
  });

  // blanks
  for (let i = 0; i < startDay; i++) {
    const blank = document.createElement("div");
    blank.className = "cell";
    calGrid.appendChild(blank);
  }

  for (let day = 1; day <= end.getDate(); day++) {
    const cellDate = new Date(year, month, day);

    const cell = document.createElement("div");
    cell.className = "cell";

    const num = document.createElement("div");
    num.className = "num";
    num.textContent = day;
    cell.appendChild(num);

    const todaysBookings = bookings.filter(b => {
      const bd = new Date(`${b.date}T00:00:00`);
      return sameDay(bd, cellDate);
    });

    todaysBookings.forEach(b => {
      const btn = document.createElement("button");
      btn.className = "event";
      btn.textContent = `🎉 ${b.character1}${b.character2 ? " & " + b.character2 : ""}`;
      btn.onclick = () => openDialog(b.id);
      cell.appendChild(btn);
    });

    calGrid.appendChild(cell);
  }
}

function renderList() {
  const now = new Date();
  const bookings = sortBookings(loadBookings()).filter(b => new Date(`${b.date}T${b.time}`) >= now);

  if (bookings.length === 0) {
    listEl.innerHTML = `<div class="muted">No upcoming bookings yet.</div>`;
    return;
  }

  listEl.innerHTML = "";
  bookings.forEach(b => {
    const when = new Date(`${b.date}T${b.time}`);
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="item-top">
        <div><strong>${when.toLocaleString()}</strong> • ${b.duration} min</div>
        <button class="btn small ghost" data-id="${b.id}">View</button>
      </div>
      <div class="muted">${b.location}</div>
      <div><strong>Characters:</strong> ${b.character1}${b.character2 ? " & " + b.character2 : ""}</div>
    `;
    div.querySelector("button").onclick = () => openDialog(b.id);
    listEl.appendChild(div);
  });
}

function openDialog(id) {
  const b = loadBookings().find(x => x.id === id);
  if (!b) return;

  dlgTitle.textContent = `Booking • ${b.date} @ ${b.time}`;
  dlgBody.innerHTML = `
    <p><strong>Name:</strong> ${escapeHtml(b.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(b.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(b.phone)}</p>
    <p><strong>Location:</strong> ${escapeHtml(b.location)}</p>
    <p><strong>Duration:</strong> ${b.duration} minutes</p>
    <p><strong>Characters:</strong> ${escapeHtml(b.character1)}${b.character2 ? " & " + escapeHtml(b.character2) : ""}</p>
    <p><strong>Instructions:</strong> ${b.instructions ? escapeHtml(b.instructions) : "—"}</p>
  `;

  dlgDelete.onclick = () => {
    if (!confirm("Delete this booking?")) return;
    const all = loadBookings().filter(x => x.id !== id);
    saveBookings(all);
    dlg.close();
    refresh();
  };

  dlg.showModal();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function refresh() {
  renderCalendar(currentMonth);
  renderList();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());

  const booking = {
    id: uid(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    location: data.location,
    date: data.date,
    time: data.time,
    count: data.count,
    duration: parseInt(data.duration, 10),
    character1: data.character1,
    character2: (data.count === "2" ? (data.character2 || "") : ""),
    instructions: data.instructions || ""
  };

  // simple validation for 2 characters
  if (booking.count === "2" && !booking.character2.trim()) {
    alert("You selected 2 characters — please enter Character #2.");
    return;
  }

  const all = loadBookings();
  all.push(booking);
  saveBookings(all);

  form.reset();
  alert("Booking added! Check the calendar below.");
  refresh();

  // jump to calendar
  document.getElementById("calendar").scrollIntoView({ behavior: "smooth" });
});

clearAll.addEventListener("click", () => {
  if (!confirm("Clear ALL bookings?")) return;
  localStorage.removeItem(STORAGE_KEY);
  refresh();
});

prevMonth.onclick = () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  refresh();
};
nextMonth.onclick = () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  refresh();
};
todayBtn.onclick = () => {
  currentMonth = new Date();
  currentMonth.setDate(1);
  refresh();
};

dlgClose.onclick = () => dlg.close();
dlgOk.onclick = () => dlg.close();

refresh();
