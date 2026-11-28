function cvControls(t, cv, className, {animated = false} = {}) {
  return `<div class="${className} cv-controls">
    <a href="${cv}" target="_blank" rel="noopener" aria-label="${t('Открыть резюме (PDF)', 'View CV (PDF)')}">${animated ? '<span class="home-scramble" data-scramble>CV</span>' : 'CV'}</a>
    <a href="${cv}" download aria-label="${t('Скачать резюме (PDF)', 'Download CV (PDF)')}"><img src="assets/home/download.svg" alt=""></a>
  </div>`;
}

function homeScreen(t, person, cv) {
  const art = 'assets/home/';
  const scramble = text => `<span class="home-scramble" data-scramble>${text}</span>`;
  const items = [
    ['work', t('кейсы', 'work')], ['about', t('опыт', 'about')],
    ['services', t('услуги', 'services')], ['pricing', t('цены', 'rates')],
    ['contacts', t('контакты', 'contact')]
  ];
  return `<section class="home-screen" aria-labelledby="home-title">
    <div class="home-stage">
      <header class="home-nav">
        <button type="button" class="home-menu-toggle" aria-controls="home-menu" aria-expanded="false" aria-label="${t('Меню', 'Menu')}"><img src="${art}mobile-menu.svg" alt=""></button>
        <div class="home-menu" id="home-menu">
        <button type="button" id="home-language" aria-label="${t('English version', 'Русская версия')}">${scramble(t('[en]', '[ru]'))}</button>
        <nav aria-label="${t('Навигация', 'Navigation')}">${items.map(([id, label]) =>
          `<a href="#${id}">${scramble('[' + label + ']')}</a>`).join('')}</nav>
        <a class="home-menu-handle" href="${home}">${scramble('[linqueenn]')}</a>
        <a class="home-menu-resume" href="${cv}" download><span>${t('скачать резюме', 'download résumé')}</span><img src="${art}download.svg" alt=""></a>
        </div>
      </header>
      <h1 class="home-title" id="home-title">
        <span class="home-line home-line-digital">${scramble('Digital design,')}</span>
        <span class="home-line home-line-web">${scramble('Web &amp;')}
          <span class="home-gem-slot" data-crystal-anchor="home" aria-hidden="true"></span>
        </span>
        <span class="home-line home-line-visual">${scramble('Visual')} ${scramble('systems')}</span>
      </h1>
      <a class="home-portrait home-portrait-pending" href="${home}" aria-label="${t('На главную', 'Home')}">
        <img class="home-shadow-left" src="${art}left-shadow.svg" alt="">
        <img class="home-shadow-right" src="${art}right-shadow.svg" alt="">
        <img class="home-person" data-src="${art}portrait-still.webp" alt="${person}">
      </a>
      <div class="home-profile">
        <a href="https://t.me/linqueenn">${scramble('@linqueenn')}</a>
        <p><img src="${art}status.svg" alt="">${t('открыта к проектам', 'open for projects')}</p>
      </div>
      ${cvControls(t, cv, 'home-cv', {animated: true})}
      <div class="home-resume-note"><span>${t('моё резюме тут', 'my résumé is here')}</span><img src="${art}resume.svg" alt=""></div>
      <a class="home-cta" href="https://t.me/linqueenn" aria-label="${t('Обсудить проект', 'Discuss a project')}"><span class="home-cta-bracket home-cta-bracket-left" aria-hidden="true">[</span>${scramble(t('Обсудить проект', 'Discuss a project'))}<span class="home-cta-bracket home-cta-bracket-right" aria-hidden="true">]</span></a>
      <div class="home-intro">
        <h2>${scramble(t('привет, я Лина', 'hi, I’m Lina'))}</h2>
        <p>${t('создаю сайты, цифровые интерфейсы и&nbsp;визуальные решения для&nbsp;брендов.', 'I design websites, digital interfaces and visual systems for brands.')}</p>
        <div class="home-philosophy">
          <span>${t('создаю дизайн, который приносит людям деньги', 'I design to help businesses make money')}</span>
        </div>
      </div>
    </div>
  </section>`;
}

function setupPortraitArrival(startText) {
  const portrait = document.querySelector('.home-portrait');
  const image = portrait.querySelector('.home-person');
  const mode = new URLSearchParams(location.search).get('portrait');
  if (portraitArrival) portrait.classList.add('home-portrait-6221');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let stopVideo = () => {};
  const showPortrait = () => {
    loadPortraitStill(image);
    startText();
    stopVideo();
    portrait.classList.remove('home-portrait-pending', 'home-portrait-materializing',
      'home-portrait-playing', 'home-portrait-blending');
  };
  const classic = () => {
    loadPortraitStill(image);
    startText();
    stopVideo();
    portrait.classList.remove('home-portrait-playing', 'home-portrait-blending', 'home-portrait-video-mode');
    portrait.addEventListener('animationend', event => {
      if (event.target === portrait && event.animationName === 'home-portrait-load') showPortrait();
    });
    portrait.classList.replace('home-portrait-pending', 'home-portrait-materializing');
  };
  if (reduced.matches) return showPortrait();
  reduced.addEventListener('change', () => { if (reduced.matches) showPortrait(); });
  if (portraitArrival) {
    stopVideo = playPortraitArrival(portrait, image, showPortrait, startText, classic);
    return;
  }
  loadPortraitStill(image);
  image.decode().then(() => {
    if (!portrait.classList.contains('home-portrait-pending')) return;
    if (mode === 'classic') classic();
    else stopVideo = playPortraitVideo(portrait, showPortrait, classic, mode, startText);
  }, showPortrait);
}

function loadPortraitStill(image) {
  if (!image.hasAttribute('src')) image.src = image.dataset.src;
}

function playPortraitArrival(portrait, image, finish, startText, fallback) {
  const {manifest, sheets: urls, start, scale} = portraitArrival;
  const controller = new AbortController();
  const sheets = urls.map((src, index) => {
    const sheet = new Image();
    sheet.fetchPriority = index === 0 ? 'high' : 'auto';
    sheet.src = src;
    return sheet;
  });
  const surface = document.createElement('canvas');
  surface.width = Math.round(1920 * scale);
  surface.height = Math.round(1038 * scale);
  surface.className = 'home-portrait-arrival';
  surface.setAttribute('aria-hidden', 'true');
  const context = surface.getContext('2d');
  let stopped = false;
  let animationFrame;
  let shineIn;
  let shine;
  let entryOffset, left;
  let mediaTime = start / 1000;
  const timeout = setTimeout(fallback, 4300);

  function measure() {
    const rect = image.getBoundingClientRect();
    const scale = rect.height / 1024;
    const videoScale = scale * 1.001;
    const width = 1920 * videoScale;
    // Align the last frame with the still portrait.
    left = 381 * rect.width / 768 - 1200 * videoScale;
    surface.style.width = `${width}px`;
    surface.style.top = `${-8 * scale}px`;
    entryOffset = Math.max(0, document.documentElement.clientWidth - rect.left - left - width);
    position();
  }

  function position() {
    const progress = Math.max(0, Math.min(1, (mediaTime - .400) / (1.383333 - .400)));
    const remaining = 1 - progress * progress * (3 - 2 * progress);
    surface.style.left = `${left + entryOffset * remaining}px`;
  }

  function completeArrival() {
    if (stopped) return;
    const silhouette = document.createElement('canvas');
    silhouette.width = surface.width;
    silhouette.height = surface.height;
    const context = silhouette.getContext('2d');
    if (!context || !CSS.supports('mask-composite', 'intersect')) return finish();

    context.drawImage(surface, 0, 0);
    const still = image.getBoundingClientRect();
    const lastFrame = surface.getBoundingClientRect();
    shine = document.createElement('span');
    shine.className = 'home-portrait-shine home-portrait-shine-video';
    shine.setAttribute('aria-hidden', 'true');
    shine.style.setProperty('--shine-video-mask', `url("${silhouette.toDataURL()}")`);
    shine.style.setProperty('--shine-video-left', `${(lastFrame.left - still.left) / (still.width - lastFrame.width) * 100}%`);
    shine.style.setProperty('--shine-video-top', `${(lastFrame.top - still.top) / (still.height - lastFrame.height) * 100}%`);
    shine.style.setProperty('--shine-video-width', `${lastFrame.width / still.width * 100}%`);
    shine.style.setProperty('--shine-video-height', `${lastFrame.height / still.height * 100}%`);
    portrait.append(shine);

    // Swap as the light crosses the upper body, where the two poses differ most.
    const handoff = {backgroundPosition: '50% 58.33%'};
    shineIn = shine.animate([{backgroundPosition: '50% 100%'}, handoff], {duration: 125, fill: 'forwards'});
    shineIn.finished.then(() => {
      const highlight = shine;
      shine = null;
      highlight.classList.remove('home-portrait-shine-video');
      highlight.animate([handoff, {backgroundPosition: '50% 0%'}], {duration: 175, fill: 'forwards'})
        .onfinish = () => highlight.remove();
      finish();
    }, () => {});
  }

  const atlas = fetch(manifest, {signal: controller.signal}).then(response => {
    if (!response.ok) throw new Error('Portrait frames unavailable');
    return response.json();
  });
  Promise.all([atlas, ...sheets.map(sheet => sheet.decode())]).then(([{frames, end}]) => {
    if (stopped) return;
    if (!context) return fallback();
    clearTimeout(timeout);
    portrait.append(surface);
    measure();
    window.addEventListener('resize', measure);
    let elapsed = start;
    let previousTime;
    let current = -1;
    function draw(now) {
      if (stopped) return;
      if (!document.hidden && previousTime !== undefined && now - previousTime <= 250) {
        elapsed = Math.min(end, elapsed + now - previousTime);
      }
      previousTime = now;
      mediaTime = elapsed / 1000;
      let next = current;
      while (next + 1 < frames.length && frames[next + 1][0] <= elapsed) next++;
      if (next !== current) {
        const firstFrame = current === -1;
        const [, sheet, sx, sy, sw, sh, x, y, width, height] = frames[next];
        current = next;
        context.clearRect(0, 0, surface.width, surface.height);
        context.drawImage(sheets[sheet], sx, sy, sw, sh, x * scale, y * scale, width * scale, height * scale);
        for (let i = 0; i < sheet; i++) if (sheets[i].src) sheets[i].removeAttribute('src');
        if (firstFrame) {
          surface.classList.add('home-portrait-arrival-ready');
          loadPortraitStill(image);
          startText();
        }
      }
      position();
      if (elapsed < end) animationFrame = requestAnimationFrame(draw);
      else image.decode().then(completeArrival, completeArrival);
    }
    animationFrame = requestAnimationFrame(draw);
  }).catch(() => { if (!stopped) fallback(); });

  return () => {
    stopped = true;
    clearTimeout(timeout);
    controller.abort();
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', measure);
    sheets.forEach(sheet => sheet.removeAttribute('src'));
    surface.remove();
    if (shine) {
      shineIn?.cancel();
      shine.remove();
    }
  };
}

function playPortraitVideo(portrait, finish, fallback, mode, startText) {
  const previous = mode === 'previous';
  const latest = ['6211', '6215', 'transparent'].includes(mode);
  const restored = !latest && !previous && mode !== '6209';
  const version = restored ? 'detail' : latest ? '6211' : previous ? '6207' : '6209';
  const video = document.createElement('video');
  video.className = `home-portrait-video home-portrait-video-${version}`;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  let timeout = setTimeout(fallback, 2200);
  let stopped = false;
  const mobileEntry = previous && matchMedia('(max-width: 540px)').matches;

  function blend() {
    if (stopped || portrait.classList.contains('home-portrait-blending')) return;
    portrait.classList.add('home-portrait-blending');
    timeout = setTimeout(finish, restored ? 300 : latest ? 200 : 145);
  }

  function positionRestoredVideo(time) {
    const currentOffset = parseFloat(video.style.translate) || 0;
    const frameRight = video.getBoundingClientRect().right - currentOffset;
    const edgeOffset = Math.max(0, document.documentElement.clientWidth - frameRight);
    const progress = Math.max(0, Math.min(1, (time - .56) / 1.10));
    const eased = progress * progress * (3 - 2 * progress);
    video.style.translate = `${edgeOffset * (1 - eased)}px 0`;
  }

  function trackRestoredFrame(_now, frame) {
    if (stopped || video.ended) return;
    positionRestoredVideo(frame.mediaTime);
    video.requestVideoFrameCallback(trackRestoredFrame);
  }

  video.addEventListener('playing', () => {
    if (stopped || portrait.classList.contains('home-portrait-playing')) return;
    clearTimeout(timeout);
    // A decoder without VP9 alpha presents the transparent corner as opaque.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 8, 8, 1, 1, 0, 0, 1, 1);
      if (context.getImageData(0, 0, 1, 1).data[3] > 24) return fallback();
    }
    portrait.classList.add('home-portrait-playing', 'home-portrait-video-mode');
    if (restored) {
      positionRestoredVideo(video.currentTime);
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(trackRestoredFrame);
      else video.addEventListener('timeupdate', () => positionRestoredVideo(video.currentTime));
    }
    startText(restored ? 0 : Math.max(0, (previous ? 1560 : 920) - video.currentTime * 1000));
  });
  video.addEventListener('ended', () => {
    // Keep the last planted pose before replacing the entire silhouette.
    if (restored || latest || previous) blend();
    else timeout = setTimeout(blend, 95);
  }, {once: true});
  if (mobileEntry) {
    video.addEventListener('loadedmetadata', () => { video.currentTime = .44; }, {once: true});
  }
  video.addEventListener('error', () => {
    if (!stopped) fallback();
  }, {once: true});
  const source = restored ? 'detail' : mode === 'transparent' ? '6211-transparent'
    : mode === '6211' ? '6211'
    : latest ? '6215' : previous ? '6207-clean' : '6209-soft';
  video.src = `assets/home/portrait-walk-${source}.webm`;
  portrait.append(video);
  video.play().catch(() => { if (!stopped) fallback(); });
  return () => {
    if (stopped) return;
    stopped = true;
    clearTimeout(timeout);
    video.pause();
    video.remove();
  };
}

const homeScrambleStagger = 34;

function setupHomeScramble() {
  setupPortfolioMenu(document.querySelector('.home-nav'), document.querySelector('.home-screen'));
  const screen = document.querySelector('.home-screen');
  const titleJobs = createScrambleJobs(screen.querySelector('.home-title'), {initial: true});
  createScrambleJobs(screen.querySelector('.home-intro h2'), {initial: true});
  const jobs = createScrambleJobs(screen);
  let started = false;
  return (remaining = 0) => {
    if (started) return false;
    started = true;
    const delay = Math.max(0, remaining - (jobs.length - 1) * homeScrambleStagger - 760);
    titleJobs.forEach((play, index) => play(index * homeScrambleStagger));
    jobs.forEach((play, index) => {
      if (!titleJobs.includes(play)) play(delay + index * homeScrambleStagger);
    });
    return true;
  };
}

function setupPortfolioMenu(header, anchor) {
  const menu = header.querySelector('.home-menu');
  const toggle = header.querySelector('.home-menu-toggle');
  const setMenuOpen = open => {
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('portfolio-menu-open', open);
  };
  const closeMenu = () => setMenuOpen(false);
  toggle.onclick = () => setMenuOpen(toggle.getAttribute('aria-expanded') === 'false');
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  toggle.closest('header').addEventListener('keydown', event => {
    if (event.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
    closeMenu();
    toggle.focus();
  });
  const homePosition = document.createComment('home navigation position');
  header.before(homePosition);
  new IntersectionObserver(([entry]) => {
    const floating = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
    if (header.classList.contains('home-nav-floating') === floating) return;
    closeMenu();
    header.classList.toggle('home-nav-floating', floating);
    if (floating) document.body.append(header);
    else homePosition.after(header);
  }).observe(anchor);
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  createScrambleJobs(header);
}

const scrambleJobCache = new WeakMap();
function createScrambleJobs(root, {initial = false} = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  return [...root.querySelectorAll('[data-scramble]')].map(element => {
    if (element.closest('.home-menu-handle')) return () => {};
    if (initial && !reduced.matches) element.classList.add('home-scrambling');
    if (scrambleJobCache.has(element)) return scrambleJobCache.get(element);
    const glyphs = [...element.textContent];
    const revealComma = element.parentElement.classList.contains('home-line-digital');
    const menuItem = element.closest('.home-nav a, .home-nav button, .home-cv a, .about-resume, .work-tab, #contacts .remaining-action');
    const letters = glyphs.filter(glyph => /[\p{L}\p{N}]/u.test(glyph)).length;
    let duration = menuItem || letters <= 4 ? Math.min(550, 200 + letters * 38) : 760;
    if (element.closest('.home-title')) duration = 1800 - 3 * homeScrambleStagger;
    const alphabet = /[а-я]/i.test(element.textContent)
      ? 'БЖКЛМНСФШЯ0123456789#%?' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%?';
    const overlay = document.createElement('span');
    overlay.className = 'home-scramble-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    element.append(overlay);
    let animation;

    function play(delay = 0, activeDuration = duration) {
      if (reduced.matches) {
        element.classList.remove('home-scrambling');
        overlay.textContent = '';
        return;
      }
      cancelAnimationFrame(animation);
      const start = performance.now() + delay;
      let lastTick = -1;
      function frame(now) {
        const elapsed = now - start;
        if (reduced.matches || elapsed >= activeDuration) {
          element.classList.remove('home-scrambling');
          overlay.textContent = '';
          return;
        }
        const tick = Math.floor(elapsed / 42);
        if (elapsed >= 0 && tick !== lastTick) {
          lastTick = tick;
          const progress = elapsed / activeDuration;
          const locked = Math.floor(glyphs.length * Math.max(0, (progress - .17) / .83));
          const visible = Math.ceil(glyphs.length * Math.min(1, .28 + progress * 2));
          overlay.textContent = glyphs.map((glyph, i) => {
            if (revealComma && glyph === ',') return ' ';
            if (i < locked || /[\s\[\]]/.test(glyph)) return glyph;
            if (i >= visible) return ' ';
            return alphabet[Math.floor(Math.random() * alphabet.length)];
          }).join('');
          element.classList.add('home-scrambling');
        }
        animation = requestAnimationFrame(frame);
      }
      if (delay > 0) animation = requestAnimationFrame(frame);
      else frame(start);
    }

    const heroButton = element.closest('.home-screen .home-cta, #pricing .pricing-cta');
    if (heroButton) {
      const left = heroButton.querySelector('.home-cta-bracket-left');
      const right = heroButton.querySelector('.home-cta-bracket-right');
      function animateButton() {
        if (reduced.matches || heroButton.classList.contains('home-cta-closing')) return;
        const box = heroButton.getBoundingClientRect();
        const leftBox = left.getBoundingClientRect();
        const rightBox = right.getBoundingClientRect();
        const center = box.left + box.width / 2;
        heroButton.style.setProperty('--bracket-left-shift', center - leftBox.left - leftBox.width * .75 + 'px');
        heroButton.style.setProperty('--bracket-right-shift', center - rightBox.left - rightBox.width * .25 + 'px');
        heroButton.classList.add('home-cta-closing');
        play(300, 700);
      }
      heroButton.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') animateButton();
      });
      heroButton.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button === 0) animateButton();
      });
      heroButton.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') animateButton();
      });
      heroButton.addEventListener('focus', () => {
        if (heroButton.matches(':focus-visible')) animateButton();
      });
      left.addEventListener('animationend', () => heroButton.classList.remove('home-cta-closing'));
      reduced.addEventListener('change', () => {
        if (reduced.matches) heroButton.classList.remove('home-cta-closing');
      });
    }
    if (menuItem) {
      menuItem.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') play();
      });
      menuItem.addEventListener('focus', () => {
        if (menuItem.matches(':focus-visible')) play();
      });
    }
    scrambleJobCache.set(element, play);
    return play;
  });
}
