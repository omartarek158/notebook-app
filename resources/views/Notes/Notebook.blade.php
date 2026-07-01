<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Notebook</title>
  <meta name="description" content="Vanilla HTML/CSS/JS notebook with per-user notes." />
  <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}" />
</head>

<body>
  <!-- APP VIEW -->
  <section id="app-view">
    <header class="topbar">
      <div class="row" style="gap:12px;">
        <div class="profile-wrap">
          <button class="btn icon" id="profile-btn" title="Profile">👤</button>
          <div class="profile-dropdown hidden" id="profile-dropdown">
            <p class="profile-name">{{ auth()->user()->name }}</p>
            <p class="profile-email muted">{{ auth()->user()->email }}</p>
            <hr>
            <a href="{{ route('logout') }}" class="btn"
              style="width:100%; text-align:center; text-decoration:none; display:block;"
              onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
              Sign out
            </a>
          </div>
        </div>
        <h1>Notebook</h1>
      </div>

      <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
        @csrf
      </form>
    </header>

    <main class="container">
      <div class="card">
        <div class="card-head">
          <div>
            <h2>My Notes</h2>
            <p class="muted" id="count-label">
              <span id="shown-count">{{ $notes->count() }}</span> of
              <span id="total-count">{{ $notes->count() }}</span> shown
            </p>
          </div>
          <div class="row">
            <select id="filter-status">
              <option value="all">All statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button class="btn primary" id="new-note">+ New note</button>
          </div>
        </div>
        <table class="data">
          <thead>
            <tr>
              <th>Title</th>
              <th style="width:140px">Status</th>
              <th style="width:140px">Updated</th>
              <th style="width:110px;text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody id="notes-body"></tbody>
        </table>
      </div>
    </main>
  </section>

  <!-- NOTE DIALOG -->
  <dialog id="note-dialog">
    <form method="dialog" id="note-form" class="grid">
      <h3 id="note-dialog-title">New note</h3>
      <label>Title <input id="n-title" required /></label>
      <label>Content <textarea id="n-content" rows="4"></textarea></label>
      <label>Status
        <select id="n-status">
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <div class="row end">
        <button type="button" class="btn" onclick="document.getElementById('note-dialog').close()">Cancel</button>
        <button type="submit" class="btn primary" id="n-save">Save</button>
      </div>
    </form>
  </dialog>

  <div id="toast" class="toast"></div>

  <script>
    window.initialNotes = @json($notes);
  </script>
  <script type="module" src="{{ asset('assets/js/app.js') }}"></script>
</body>

</html>