// ===========================================================
// Notebook — Static frontend (UI only, no backend calls)
// ===========================================================
// This file contains ONLY UI logic. There are no fetch/AJAX calls.
// Wire it into your Laravel + Blade app yourself:
//
//   - Replace the auth <form> action with your Laravel login/register route.
//   - Replace the note <form> action with your Laravel store/update route.
//   - Render the notes <tbody> from Blade (@foreach $notes as $note).
//   - Use Blade @csrf inside each form and method spoofing (@method('PUT'|'DELETE'))
//     where needed.
//
// What this script does on its own:
//   - Tab switching on the auth card (Sign in / Sign up).
//   - Open/close the note dialog (New / Edit / Delete confirm).
//   - Client-side filtering of the notes table by status.
//   - Toast notifications.
//   - A tiny in-memory demo store so the UI is interactive without a backend.
//     Delete the DEMO block once you hook up Blade.
// ===========================================================

const $ = (s) => document.querySelector(s);
const authView = $("#auth-view");
const appView = $("#app-view");

const state = { user: null, notes: [], filter: "all", editing: null };

// ---------- helpers ----------
function toast(msg, type = "info") {
  const el = $("#toast");
  el.textContent = msg;
  el.className = `toast show ${type === "error" ? "error" : ""}`;
  setTimeout(() => (el.className = "toast"), 2200);
}
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function statusLabel(s) {
  return { not_started: "Not Started", in_progress: "In Progress", completed: "Completed" }[s] || s;
}
function uid() { return Math.random().toString(36).slice(2, 10); }

function showApp() {
  authView.classList.add("hidden");
  appView.classList.remove("hidden");
  $("#user-email").textContent = state.user?.email ?? "";
  render();
}
function showAuth() {
  appView.classList.add("hidden");
  authView.classList.remove("hidden");
}

// ---------- AUTH tabs (UI only) ----------
let mode = "signin";
document.querySelectorAll(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    mode = t.dataset.tab;
    $("#auth-submit").textContent = mode === "signin" ? "Sign in" : "Create account";
  })
);

// DEMO: fake "login" so the UI is browseable without Laravel.
// Replace this whole handler with a real <form action="/login" method="POST"> in Blade.
$("#auth-form").addEventListener("submit", (e) => {
  e.preventDefault();
  state.user = { email: $("#auth-email").value || "demo@user.test" };
  toast(mode === "signin" ? "Welcome back" : "Account created");
  showApp();
});

$("#signout").addEventListener("click", () => {
  state.user = null;
  state.notes = [];
  showAuth();
});

// Start on auth view by default
showAuth();

// ---------- NOTES (in-memory demo) ----------
// Replace `state.notes` with data injected from Blade, e.g.:
//   <script>window.NOTES = @json($notes);</script>
// then: state.notes = window.NOTES ?? [];

function render() {
  const tbody = $("#notes-body");
  const list = state.notes.filter((n) => state.filter === "all" || n.status === state.filter);
  $("#count-label").textContent = `${list.length} of ${state.notes.length} shown`;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:var(--muted)">No notes yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map((n) => `
    <tr>
      <td>
        <div style="font-weight:500">${escapeHtml(n.title)}</div>
        ${n.content ? `<div class="muted" style="margin-top:2px">${escapeHtml(n.content).slice(0, 80)}</div>` : ""}
      </td>
      <td><span class="badge ${n.status}">${statusLabel(n.status)}</span></td>
      <td class="muted">${n.updated_at ? new Date(n.updated_at).toLocaleDateString() : ""}</td>
      <td style="text-align:right">
        <button class="btn icon" data-edit="${n.id}">✎</button>
        <button class="btn icon danger" data-del="${n.id}">🗑</button>
      </td>
    </tr>
  `).join("");
}

$("#filter-status").addEventListener("change", (e) => { state.filter = e.target.value; render(); });

$("#notes-body").addEventListener("click", (e) => {
  const editId = e.target.dataset.edit;
  const delId = e.target.dataset.del;
  if (editId) {
    openDialog(state.notes.find((x) => String(x.id) === String(editId)));
  } else if (delId) {
    const n = state.notes.find((x) => String(x.id) === String(delId));
    if (!confirm(`Delete "${n.title}"?`)) return;
    // In Blade: submit a <form action="/notes/{id}" method="POST">@csrf @method('DELETE')</form>
    state.notes = state.notes.filter((x) => x.id !== n.id);
    toast("Deleted");
    render();
  }
});

$("#new-note").addEventListener("click", () => openDialog(null));

function openDialog(note) {
  state.editing = note;
  $("#note-dialog-title").textContent = note ? "Edit note" : "New note";
  $("#n-title").value = note?.title ?? "";
  $("#n-content").value = note?.content ?? "";
  $("#n-status").value = note?.status ?? "not_started";
  $("#note-dialog").showModal();
}

// DEMO save — replace the dialog <form> with a Blade form that POSTs to
// /notes (create) or /notes/{id} with @method('PUT') (update).
$("#note-form").addEventListener("submit", (e) => {
  if (e.submitter?.value !== "save") return;
  e.preventDefault();
  const payload = {
    title: $("#n-title").value.trim(),
    content: $("#n-content").value,
    status: $("#n-status").value,
  };
  if (!payload.title) return toast("Title required", "error");
  const now = new Date().toISOString();
  if (state.editing) {
    Object.assign(state.editing, payload, { updated_at: now });
    toast("Updated");
  } else {
    state.notes.unshift({ id: uid(), created_at: now, updated_at: now, ...payload });
    toast("Created");
  }
  $("#note-dialog").close();
  render();
});
