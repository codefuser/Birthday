import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const fadeInUp = (el: string | Element, delay = 0) =>
  gsap.from(el, { y: 60, opacity: 0, duration: 1, delay, ease: 'power3.out' })

export const staggerReveal = (el: string, stagger = 0.1) =>
  gsap.from(el, { y: 40, opacity: 0, duration: 0.8, stagger, ease: 'power2.out' })

export const createScrollReveal = (trigger: string | Element, target: string | Element, vars: gsap.TweenVars = {}) =>
  gsap.from(target, {
    y: 80, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger, start: 'top 85%', toggleActions: 'play none none reverse' },
    ...vars,
  })

export const parallaxEffect = (el: string | Element, speed = 0.3) =>
  gsap.to(el, {
    y: () => window.innerHeight * speed, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
  })

export const floatingAnimation = (el: string | Element, duration = 3, yOffset = 15) =>
  gsap.to(el, { y: yOffset, duration, ease: 'sine.inOut', yoyo: true, repeat: -1 })

export const createTimeline = () => gsap.timeline({ defaults: { duration: 0.8, ease: 'power3.out' } })

export const starWarpTransition = (container: HTMLElement, duration = 1.2) => {
  const tl = gsap.timeline()
  const lines = container.querySelectorAll('.warp-line')
  tl.to(lines, {
    scaleX: 0, opacity: 0, duration: duration * 0.5, ease: 'power2.in', stagger: 0.05,
  })
  return tl
}

export const particleDissolveTransition = (
  container: HTMLElement,
  particles: HTMLElement[],
  duration = 1
) => {
  const tl = gsap.timeline()
  tl.to(container, { opacity: 0, duration: duration * 0.3 }, 0)
  tl.to(particles, {
    x: () => (Math.random() - 0.5) * 400,
    y: () => (Math.random() - 0.5) * 400,
    scale: 0, opacity: 0, duration: duration * 0.8, ease: 'power2.out',
    stagger: 0.02,
  }, 0)
  return tl
}

export const portalTransition = (portal: HTMLElement, duration = 1.2) => {
  const tl = gsap.timeline()
  tl.set(portal, { scale: 0, opacity: 1, display: 'block' })
  tl.to(portal, { scale: 30, opacity: 0, duration, ease: 'power4.in' })
  return tl
}

export const lightBurstTransition = (burst: HTMLElement, duration = 1) => {
  const tl = gsap.timeline()
  tl.set(burst, { scale: 0, opacity: 1 })
  tl.to(burst, { scale: 50, opacity: 0, duration, ease: 'power3.out' })
  return tl
}

export const ribbonRevealTransition = (ribbons: HTMLElement[], duration = 1.2) => {
  const tl = gsap.timeline()
  tl.fromTo(ribbons,
    { scaleY: 0, transformOrigin: 'top center' },
    { scaleY: 1, duration: duration * 0.6, stagger: 0.1, ease: 'power3.inOut' }
  )
  return tl
}

export const splitTextToSpans = (el: HTMLElement) => {
  const text = el.textContent
  if (!text) return []
  el.textContent = ''
  return text.split('').map((char) => {
    const span = document.createElement('span')
    span.className = 'char inline-block'
    span.textContent = char === ' ' ? '\u00A0' : char
    el.appendChild(span)
    return span
  })
}

export const screenShake = (el: HTMLElement, intensity = 10, duration = 0.3) => {
  return gsap.to(el, {
    x: () => (Math.random() - 0.5) * intensity,
    y: () => (Math.random() - 0.5) * intensity,
    duration: 0.03,
    repeat: Math.floor(duration / 0.03),
    yoyo: true,
    ease: 'none',
    onComplete: () => gsap.set(el, { x: 0, y: 0 }),
  })
}
