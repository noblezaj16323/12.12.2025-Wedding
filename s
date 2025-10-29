<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Full-Screen Responsive Background</title>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body, html {
    height: 100%;
    font-family: 'Playfair Display', serif;
  }

  .hero-section {
    background-image: url('assets/images/frontpage.jpg'); /* Replace with your image */
    background-size: cover;         /* ✅ Fill entire screen */
    background-position: center;    /* Keep focus centered */
    background-repeat: no-repeat;
    height: 100vh;                  /* Full viewport height */
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    color: white;
    padding: 0 20px;
  }

  /* Optional dark overlay for text contrast */
  .hero-section::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 0;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 90%;
  }

  .hero-content h1 {
    font-size: clamp(1.8rem, 5vw, 3.5rem);
    margin-bottom: 10px;
  }

  .hero-content p {
    font-size: clamp(1rem, 3vw, 1.5rem);
    line-height: 1.4;
  }
</style>
</head>
<body>

<section class="hero-section">
  <div class="hero-content">
    <h1>Welcome to My Page 🌅</h1>
    <p>Your journey begins here. Designed to fit every screen.</p>
  </div>
</section>

</body>
</html>
