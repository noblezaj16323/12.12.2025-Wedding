<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>The Youngest Serif</title>
  <style>
    body {
      font-family: Georgia, "Times New Roman", Times, serif;
      margin: 2rem;
      line-height: 1.5;
      color: #222;
      background: #f7f8fb;
    }

    .title {
      font-size: clamp(1.8rem, 5vw, 3rem);
      margin: 0 0 0.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-family: "La Lexus Serif", Georgia, serif; /* your custom serif first */
      font-size: 1.05rem;
      color: #4b5b87;
      margin-bottom: 1.2rem;
    }

    .sample {
      padding: 1rem;
      border-left: 4px solid #dfe7ff;
      background: white;
      max-width: 720px;
      box-shadow: 0 6px 18px rgba(17,24,39,0.04);
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h1 class="title">The Youngest Serif</h1>
  <p class="subtitle">A tiny showcase using serif fonts</p>

  <div class="sample">
    <p><strong>Serif default:</strong> This paragraph uses the page's serif stack (Georgia / Times / serif). Serifs give text a classic, readable look for headings and body copy.</p>
    <p><em>Try changing the font-family in the CSS to see different serif styles.</em></p>
  </div>
</body>
</html>
