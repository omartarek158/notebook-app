<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Create account — Notebook</title>
  <meta name="description" content="Create a Notebook account." />
  <link rel="stylesheet" href="{{ asset('assets/css/auth.css') }}" />
</head>
<body>
  <section class="auth-wrap">
    <div class="card auth-card">
      <h1>Create account</h1>
      <p class="muted">Start taking notes in seconds</p>

      <form id="register-form" class="grid" action="{{ route('register') }}" method="POST">
        @csrf 

        <label>Name 
          <input type="text" id="name" name="name" value="{{ old('name') }}" required maxlength="80" />
        </label>
        @error('name') <span style="color:red; font-size:12px;">{{ $message }}</span> @enderror

        <label>Email 
          <input type="email" id="email" name="email" value="{{ old('email') }}" required />
        </label>
        @error('email') <span style="color:red; font-size:12px;">{{ $message }}</span> @enderror

        <label>Password 
          <input type="password" id="password" name="password" minlength="8" required />
        </label>
        @error('password') <span style="color:red; font-size:12px;">{{ $message }}</span> @enderror

        <label>Confirm password 
          <input type="password" id="password_confirmation" name="password_confirmation" minlength="8" required />
        </label>

        <button class="btn primary" type="submit">Create account</button>
        
        <p class="muted" style="text-align:center">
          Already have an account? <a href="{{ route('login') }}">Sign in</a>
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