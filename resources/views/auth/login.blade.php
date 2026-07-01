<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Sign in — Notebook</title>
  <meta name="description" content="Sign in to your Notebook account." />
  <link rel="stylesheet" href="{{ asset('assets/css/auth.css') }}" />
</head>
<body>
  <section class="auth-wrap">
    <div class="card auth-card">
      <h1>Notebook</h1>
      <p class="muted">Sign in to manage your notes</p>

      <form id="login-form" class="grid" action="{{ route('login') }}" method="POST">
        @csrf 

        <label>Email 
          <input type="email" id="email" name="email" value="{{ old('email') }}" required />
        </label>

        <label>Password 
          <input type="password" id="password" name="password" minlength="6" required />
        </label>

        <button class="btn primary" type="submit">Sign in</button>
        
        <p class="muted" style="text-align:center">
          Don't have an account? <a href="{{ route('register') }}">Create one</a>
        </p>
      </form>
    </div>
  </section>

  @if ($errors->any())
    <div class="auth-errors-trigger hidden" data-message="{{ $errors->first() }}"></div>
  @endif

  <div id="toast" class="toast"></div>
  <script type="module" src="{{ asset('assets/js/auth.js') }}"></script>
</body>
</html>