gsap.registerPlugin(ScrollTrigger);

let iteration = 0;

gsap.set('.cards li', {xPercent: 400, opacity: 0, scale: 0});

const spacing = 0.1,
  snapTime = gsap.utils.snap(spacing),
  cards = gsap.utils.toArray('.cards li'),
  animateFunc = element => {
    const tl = gsap.timeline(),
      bg = element.getAttribute("data-bg") || gsap.getProperty(element, "backgroundColor");
    tl.fromTo(element, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, backgroundColor: bg, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false})
      .fromTo(element, {xPercent: 400}, {xPercent: -400, duration: 1, ease: "none", immediateRender: false}, 0);
    return tl;
  },
  seamlessLoop = buildSeamlessLoop(cards, spacing, animateFunc),
  playhead = {offset: 0},
  wrapTime = gsap.utils.wrap(0, seamlessLoop.duration()),
  scrub = gsap.to(playhead, {
    offset: 0,
    onUpdate() {
      seamlessLoop.time(wrapTime(playhead.offset));
    },
    duration: 0.5,
    ease: "power3",
    paused: true
  });

function scrollToOffset(offset) {
  let snappedTime = snapTime(offset),
    progress = (snappedTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
  scrub.vars.offset = snappedTime;
  scrub.invalidate().restart();
}

document.querySelector(".next").addEventListener("click", () => {
  const nextOffset = playhead.offset + spacing;
  scrollToOffset(nextOffset);
});

document.querySelector(".prev").addEventListener("click", () => {
  const prevOffset = playhead.offset - spacing;
  scrollToOffset(prevOffset);
});

function buildSeamlessLoop(items, spacing, animateFunc) {
  let rawSequence = gsap.timeline({paused: true}),
    seamlessLoop = gsap.timeline({
      paused: true,
      repeat: -1,
      onRepeat() {
        this._time === this._dur && (this._tTime += this._dur - 0.01);
      }
    }),
    cycleDuration = spacing * items.length,
    dur;

  items.concat(items).concat(items).forEach((item, i) => {
    let anim = animateFunc(items[i % items.length]);
    rawSequence.add(anim, i * spacing);
    dur || (dur = anim.duration());
  });

  seamlessLoop.fromTo(rawSequence, {
    time: cycleDuration + dur / 2
  }, {
    time: "+=" + cycleDuration,
    duration: cycleDuration,
    ease: "none"
  });
  return seamlessLoop;
}
