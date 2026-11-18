/* Zeus Coffee · illüstrasyon animasyonları (GSAP 3 + ScrollTrigger)
   Her sahnenin dinlenme hali orijinal görselin kendisidir; animasyon yalnızca oraya varış yolunu oynatır. */
(() => {
  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) { root.classList.add('no-gsap'); return; }
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { root.classList.add('no-gsap'); return; }

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rnd = gsap.utils.random;
  const allLoops = [];

  /* Sahne görünür olunca girişi bir kez oynatır; döngüler yalnızca ekrandayken çalışır.
     Fare üstüne gelince (veya dokununca) giriş yeniden oynar. */
  function stage(name, { intro, loops = [], start = 'top 72%', onLoad = false }) {
    const el = $(`[data-scene="${name}"]`);
    if (!el) return;
    const tl = intro(el);
    tl.pause();
    window.__scenes = window.__scenes || {};
    window.__scenes[name] = tl;
    // Döngüler giriş ilk kez bittiğinde kurulur, böylece başlangıç değerleri görselin dinlenme halidir.
    let lp = null, visible = false;
    const runLoops = on => lp && lp.forEach(l => (on && !root.classList.contains('anim-paused') ? l.play() : l.pause()));
    tl.eventCallback('onComplete', () => {
      if (!lp) { lp = loops.map(f => f(el)).filter(Boolean); lp.forEach(l => { l.pause(); allLoops.push(l); }); }
      runLoops(visible);
    });
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onToggle: self => { visible = self.isActive; if (tl.progress() === 1) runLoops(visible); }
    });
    if (onLoad) gsap.delayedCall(.35, () => tl.play());
    else ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => tl.play() });
    let cool = 0;
    const replay = () => {
      if (tl.isActive() || tl.progress() < 1 || Date.now() < cool) return;
      cool = Date.now() + 2500;
      runLoops(false); tl.restart();
    };
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') replay(); });
    el.addEventListener('click', replay);
  }

  /* Buhar: mürekkep çizgili pembe kıvrımlar fincandan yükselir */
  function steam(el, sel = '.steam .wisp') {
    const wisps = $$(sel, el);
    const tl = gsap.timeline({ repeat: -1 });
    wisps.forEach((w, i) => {
      const paths = $$('path', w), len = paths[0].getTotalLength(), seg = len * .85;
      gsap.set(paths, { strokeDasharray: `${seg} ${len * 1.6}`, strokeDashoffset: seg });
      const t = gsap.timeline({ repeat: -1, delay: i * .9 });
      t.fromTo(paths, { strokeDashoffset: seg }, { strokeDashoffset: -len, duration: 2.8, ease: 'sine.inOut' }, 0)
       .fromTo(w, { opacity: 0, y: 6 }, { opacity: 1, y: -2, duration: .6, ease: 'power1.out' }, 0)
       .to(w, { opacity: 0, y: -10, duration: .7, ease: 'power1.in' }, 2.1);
      tl.add(t, 0);
    });
    return tl;
  }

  /* ------------------------------------------------------------ HERO */
  stage('hero', {
    onLoad: true,
    intro: el => {
      const lamp = $('.lamp', el), glow = $('.glow', el);
      return gsap.timeline()
        .fromTo(lamp, { rotation: 7, svgOrigin: '791 0' }, { rotation: 0, duration: 2.4, ease: 'elastic.out(1,.28)' }, .3)
        .fromTo(glow, { opacity: 0 }, { keyframes: [{ opacity: .9, duration: .06 }, { opacity: .1, duration: .08 }, { opacity: 1, duration: .05 }, { opacity: .35, duration: .1 }, { opacity: 1, duration: .4 }] }, .7)
        .fromTo($$('.steam .wisp', el), { opacity: 0 }, { opacity: 1, duration: .6, stagger: .15 }, .9);
    },
    loops: [
      el => steam(el),
      el => { const t = $('.lamp', el); gsap.set(t, { svgOrigin: '791 0' }); return gsap.timeline({ repeat: -1 }).to(t, { rotation: 1.6, duration: 1.3, ease: 'sine.out' }).to(t, { rotation: -1.6, duration: 2.6, ease: 'sine.inOut' }).to(t, { rotation: 0, duration: 1.3, ease: 'sine.in' }); },
      el => { const t = $('.plant', el); gsap.set(t, { svgOrigin: '985 668' }); return gsap.timeline({ repeat: -1 }).to(t, { rotation: 1.4, duration: 1.55, ease: 'sine.out' }).to(t, { rotation: -1.4, duration: 3.1, ease: 'sine.inOut' }).to(t, { rotation: 0, duration: 1.55, ease: 'sine.in' }); },
      el => gsap.timeline({ repeat: -1, repeatDelay: 5.5 })
        .to($('.glow', el), { keyframes: [{ opacity: .3, duration: .05 }, { opacity: 1, duration: .07 }, { opacity: .45, duration: .06 }, { opacity: 1, duration: .3 }] })
    ]
  });

  /* ------------------------------------------------------------ POUR */
  stage('pour', {
    intro: el => {
      const grow = $('.grow', el), beans = $$('.bean', el);
      return gsap.timeline()
        .set(grow, { attr: { y: 246, height: 0 } })
        .from(beans, { x: () => rnd(160, 260), y: () => rnd(-220, -80), rotation: () => rnd(-180, 180), scale: .4, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .07 }, 0)
        .to(grow, { attr: { height: 172 }, duration: .8, ease: 'power2.in' }, .45)
        .add(() => burst(el), 1.2);
    },
    loops: [
      el => {
        const grow = $('.grow', el);
        return gsap.timeline({ repeat: -1, delay: 2.4, repeatDelay: 1.4 })
          .to(grow, { attr: { y: 418, height: 0 }, duration: .55, ease: 'power1.in' })
          .set(grow, { attr: { y: 246, height: 0 } }, '+=1.1')
          .to(grow, { attr: { height: 172 }, duration: .75, ease: 'power2.in' })
          .add(() => burst(el), '-=.05')
          .to({}, { duration: 1.6 });
      },
      el => {
        const tl = gsap.timeline({ repeat: -1 });
        $$('.bean', el).forEach((b, i) => tl.add(gsap.to(b, { y: i % 2 ? -9 : 8, rotation: i % 2 ? 10 : -12, svgOrigin: `${b.dataset.x} ${b.dataset.y}`, duration: 2.4 + i * .35, yoyo: true, repeat: 1, ease: 'sine.inOut' }), 0));
        return tl;
      }
    ]
  });
  function burst(el) {
    const g = $('.burst', el), dots = $$('circle', g);
    gsap.set(g, { opacity: 1 });
    dots.forEach((d, i) => {
      const dx = (i - dots.length / 2) * rnd(5, 9);
      gsap.timeline()
        .fromTo(d, { x: 0, y: 0, opacity: 1, scale: 1 }, { x: dx * .6, y: rnd(-34, -18), duration: .3, ease: 'power2.out' })
        .to(d, { x: dx, y: rnd(10, 26), opacity: 0, scale: .6, duration: .4, ease: 'power2.in' });
    });
  }

  /* ------------------------------------------------------------ CUP: havadan düşer, sütuna çarpar, kahve taşar */
  stage('cup', {
    start: 'top 62%',
    intro: el => {
      const drop = $('.cup-drop', el), squash = $('.cup-squash', el), splash = $('.splash', el), world = $('.world', el);
      const flyers = $$('.drop, .bean', el);
      gsap.set(squash, { svgOrigin: '255 300' });
      const tl = gsap.timeline()
        .fromTo(drop, { y: -620, rotation: -14, svgOrigin: '250 180' }, { y: 0, rotation: 0, duration: .85, ease: 'power3.in', immediateRender: true })
        .fromTo(splash, { scale: 0, opacity: 0, svgOrigin: '255 335' }, { scale: 1, opacity: 1, duration: .6, ease: 'back.out(2.2)', immediateRender: true }, '>-0.02')
        .fromTo(squash, { scaleY: 1, scaleX: 1 }, { scaleY: .9, scaleX: 1.06, duration: .07, ease: 'power2.out' }, '<')
        .to(squash, { scaleY: 1, scaleX: 1, duration: .7, ease: 'elastic.out(1,.35)' }, '>')
        .fromTo(world, { y: 0 }, { y: 5, duration: .05, yoyo: true, repeat: 3, ease: 'none' }, '<-0.07');
      flyers.forEach(f => {
        const x = +f.dataset.x, y = +f.dataset.y;
        tl.fromTo(f, { x: 255 - x, y: 330 - y, scale: .25, rotation: rnd(-160, 160), opacity: 0, svgOrigin: `${x} ${y}` },
          { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1, duration: rnd(.8, 1.15), ease: 'expo.out', immediateRender: true }, .86);
      });
      return tl;
    },
    loops: [
      el => {
        const tl = gsap.timeline({ repeat: -1 });
        $$('.bean, .drop', el).forEach((b, i) => tl.add(gsap.to(b, { y: i % 2 ? -7 : 7, x: i % 3 ? 3 : -3, rotation: i % 2 ? 9 : -9, duration: 2.2 + (i % 4) * .4, yoyo: true, repeat: 1, ease: 'sine.inOut' }), 0));
        return tl;
      },
      el => gsap.to($('.cup-drop', el), { y: -5, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    ]
  });

  /* ------------------------------------------------------------ STORY: enerji halkaları ve kıvılcımlar */
  stage('story', {
    intro: el => {
      const rings = $$('.aura circle', el);
      rings.forEach(c => { const l = c.getTotalLength(); gsap.set(c, { strokeDasharray: l, strokeDashoffset: l }); });
      return gsap.timeline()
        .fromTo($('.portrait', el), { scale: 1.08, svgOrigin: '160 200', opacity: .0 }, { scale: 1, opacity: 1, duration: 1.6, ease: 'expo.out' })
        .to(rings, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: .14 }, .35)
        .add(() => spark(el), 1.4);
    },
    loops: [
      el => { const t = $('.aura', el); gsap.set(t, { svgOrigin: '205 186' }); return gsap.timeline({ repeat: -1 }).to(t, { rotation: 4, duration: 2.25, ease: 'sine.out' }).to(t, { rotation: -4, duration: 4.5, ease: 'sine.inOut' }).to(t, { rotation: 0, duration: 2.25, ease: 'sine.in' }); },
      el => gsap.timeline({ repeat: -1, repeatDelay: 2.6 }).add(() => spark(el)),
      el => gsap.to($('.portrait', el), { scale: 1.035, svgOrigin: '160 200', duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    ]
  });
  function spark(el) {
    const s = $$('.sparks polyline', el), g = $('.sparks', el);
    gsap.set(g, { opacity: 1 });
    const one = s[Math.floor(Math.random() * s.length)];
    gsap.set(s, { opacity: 0 });
    gsap.fromTo(one, { opacity: 0 }, { keyframes: [{ opacity: 1, duration: .04 }, { opacity: .2, duration: .06 }, { opacity: 1, duration: .04 }, { opacity: 0, duration: .35 }] });
  }

  /* ------------------------------------------------------------ SIP: şimşek çakar, pembe güneş titrer, buhar yükselir */
  stage('sip', {
    intro: el => strike(el),
    loops: [
      el => steam(el),
      el => gsap.timeline({ repeat: -1, repeatDelay: 6 }).add(strike(el))
    ]
  });
  function strike(el) {
    const bolt = $('.bolt', el), flash = $('.flash', el), ring = $('.ring', el);
    return gsap.timeline()
      .set(bolt, { opacity: 0 })
      .fromTo(bolt, { scaleY: .2, svgOrigin: '360 -6' }, { scaleY: 1, duration: .12, ease: 'power4.in' })
      .to(bolt, { keyframes: [{ opacity: 1, duration: .03 }, { opacity: .15, duration: .05 }, { opacity: 1, duration: .04 }] }, '<')
      .fromTo(flash, { opacity: 0 }, { opacity: .55, duration: .04, yoyo: true, repeat: 1 }, '<')
      .fromTo(ring, { opacity: .9, scale: 1, svgOrigin: '300 112' }, { opacity: 0, scale: 1.45, duration: .9, ease: 'expo.out' }, '<+0.06')
      .to(bolt, { opacity: 0, duration: .5, ease: 'power2.in' }, '+=.25');
  }

  /* ------------------------------------------------------------ ICED: bardağa buz düşer, kabarcıklar yükselir */
  stage('iced', {
    start: 'top 70%',
    intro: el => gsap.timeline()
      .fromTo($('.figure', el), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out' })
      .add(ice(el), .5),
    loops: [
      el => gsap.to($('.figure', el), { y: -9, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
      el => gsap.timeline({ repeat: -1, repeatDelay: 3.4 }).add(ice(el)),
      el => {
        const g = $('.bubbles', el), b = $$('circle', g);
        gsap.set(g, { opacity: 1 });
        const tl = gsap.timeline({ repeat: -1 });
        b.forEach((c, i) => tl.add(gsap.fromTo(c, { y: 0, opacity: 0 }, { y: -rnd(120, 160), opacity: 1, duration: rnd(2.2, 3.2), ease: 'sine.in', repeat: 1, delay: i * .45 }), 0));
        return tl;
      }
    ]
  });
  function ice(el) {
    const ic = $('.ice', el), cubes = $$('.cube', el), drops = $$('.rim-drops circle', el);
    const tl = gsap.timeline().set(ic, { opacity: 1 });
    cubes.forEach((c, i) => {
      const at = i * .32;
      tl.fromTo(c, { y: 80, rotation: rnd(-40, 40), transformOrigin: '50% 50%', opacity: 1 },
        { y: 360, rotation: rnd(-120, 120), duration: .55, ease: 'power2.in' }, at)
        .to(c, { opacity: 0, duration: .2 }, at + .5);
      tl.add(() => {
        gsap.set($('.rim-drops', el), { opacity: 1 });
        drops.forEach(d => gsap.timeline()
          .fromTo(d, { x: 0, y: 0, opacity: 1 }, { x: rnd(-22, 22), y: rnd(-40, -20), duration: .28, ease: 'power2.out' })
          .to(d, { y: rnd(0, 18), opacity: 0, duration: .35, ease: 'power2.in' }));
      }, at + .42);
    });
    return tl;
  }

})();
