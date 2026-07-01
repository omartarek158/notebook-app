const $ = (s) => document.querySelector(s);

const newNoteBtn = $('#new-note');
const noteDialog = $('#note-dialog');
const noteForm = $('#note-form');
const dialogTitle = $('#note-dialog-title');
const profileBtn = $('#profile-btn');
const profileDropdown = $('#profile-dropdown');
const notesBody = $('#notes-body');
const filterStatus = $('#filter-status');
const shownCountEl = $('#shown-count');
const totalCountEl = $('#total-count');

let notes = window.initialNotes || [];
let editingNoteId = null;
function toast(msg, type = "info") {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast show ${type === "error" ? "error" : ""}`;
  setTimeout(() => (el.className = "toast"), 3000);
}
// ---------- Helpers ----------
function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB'); // d/m/yyyy
}

function statusLabel(status) {
    return status.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function truncate(text, n = 60) {
    if (!text) return '';
    return text.length > n ? text.slice(0, n) + '…' : text;
}

// ---------- Render ----------
function renderNotes() {
    const filter = filterStatus ? filterStatus.value : 'all';
    const visible = filter === 'all' ? notes : notes.filter(n => n.status === filter);

    if (shownCountEl) shownCountEl.textContent = visible.length;
    if (totalCountEl) totalCountEl.textContent = notes.length;

    if (!visible.length) {
        notesBody.innerHTML = `<tr><td colspan="4" class="muted">No notes yet</td></tr>`;
        return;
    }

    notesBody.innerHTML = visible.map(note => `
        <tr data-id="${note.id}"
            data-title="${escapeAttr(note.title)}"
            data-content="${escapeAttr(note.content || '')}"
            data-status="${note.status}">
          <td>
            <div class="note-title">${escapeHtml(note.title)}</div>
            ${note.content ? `<div class="note-preview muted">${escapeHtml(truncate(note.content))}</div>` : ''}
          </td>
          <td><span class="badge ${note.status}">${statusLabel(note.status)}</span></td>
          <td>${formatDate(note.updated_at)}</td>
          <td style="text-align:right">
            <button class="btn icon edit-note" data-id="${note.id}">✎</button>
            <button class="btn icon danger delete-note" data-id="${note.id}">🗑</button>
          </td>
        </tr>
    `).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
}

// ---------- Profile dropdown ----------
if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target) && e.target !== profileBtn) {
            profileDropdown.classList.add('hidden');
        }
    });
}

// ---------- Filter ----------
if (filterStatus) {
    filterStatus.addEventListener('change', renderNotes);
}

// ---------- New note ----------
if (newNoteBtn && noteDialog) {
    newNoteBtn.addEventListener('click', () => {
        editingNoteId = null;
        noteForm.reset();
        dialogTitle.textContent = 'New note';
        noteDialog.showModal();
    });
}

// ---------- Edit / Delete ----------
document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-note');
    const deleteBtn = e.target.closest('.delete-note');

    if (editBtn) {
        const row = editBtn.closest('tr');
        editingNoteId = row.dataset.id;

        $('#n-title').value = row.dataset.title || '';
        $('#n-content').value = row.dataset.content || '';
        $('#n-status').value = row.dataset.status || 'not_started';

        dialogTitle.textContent = 'Edit note';
        noteDialog.showModal();
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm('متأكد إنك عايز تمسح النوت دي؟')) {
            deleteNote(id);
        }
    }
});

// ---------- Submit ----------
if (noteForm) {
    noteForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = $('#n-title').value;
        const content = $('#n-content').value;
        const status = $('#n-status').value;

        if (editingNoteId) {
            updateNoteInDatabase(editingNoteId, { title, content, status });
        } else {
            saveNoteToDatabase({ title, content, status });
        }
    });
}

// ---------- CREATE ----------
function saveNoteToDatabase(data) {
    fetch('/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf(),
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(async (res) => {
        if (res.ok) return res.json();
        const errorData = await res.json();
        throw new Error(errorData.message || 'Server Error');
    })
    .then(newNote => {
        notes.unshift(newNote); // ضيفها فوق القايمة
        renderNotes();
        noteDialog.close();
        if (typeof toast === 'function') toast('Note saved!', 'success');
    })
    .catch(err => {
        console.error(err);
        alert('حدث خطأ أثناء الحفظ: ' + err.message);
    });
}

// ---------- UPDATE ----------
function updateNoteInDatabase(id, data) {
    fetch(`/notes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf(),
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(async (res) => {
        if (res.ok) return res.json();
        const errorData = await res.json();
        throw new Error(errorData.message || 'Server Error');
    })
    .then(updatedNote => {
        const idx = notes.findIndex(n => n.id == id);
        if (idx !== -1) notes[idx] = updatedNote;
        renderNotes();
        noteDialog.close();
        editingNoteId = null;
        if (typeof toast === 'function') toast('Updated', 'success');
    })
    .catch(err => {
        console.error(err);
        alert('حدث خطأ أثناء التحديث: ' + err.message);
    });
}

// ---------- DELETE ----------
function deleteNote(id) {
    fetch(`/notes/${id}`, {
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': csrf(),
            'Accept': 'application/json'
        }
    })
    .then(async (res) => {
        if (res.ok) return res.json();
        const errorData = await res.json();
        throw new Error(errorData.message || 'Server Error');
    })
    .then(() => {
        notes = notes.filter(n => n.id != id);
        renderNotes();
        if (typeof toast === 'function') toast('Deleted', 'success');
    })
    .catch(err => {
        console.error(err);
        alert('حدث خطأ أثناء الحذف: ' + err.message);
    });
}

// ---------- Initial render ----------
renderNotes();