---
title: Spacecraft Dynamics Teaching Animations
published: 2026-10-20
description: Nine Chinese-narrated animations on spacecraft attitude dynamics, orbital mechanics, and attitude actuators.
tags:
  - Spacecraft
  - Dynamics
  - Animation
pin: 99
lang: en
abbrlink: spacecraft-dynamics-animations
toc: false
---

Many concepts in spacecraft dynamics are hard to build intuition for from static equations alone—such as why Euler-angle rotations do not commute, how energy dissipation destabilizes a minor-axis spin, or how relative trajectories close under the Clohessy–Wiltshire equations.

To make these mechanics directly observable, I built a set of nine Chinese-labeled teaching animations using custom Python dynamics integrators and Manim, covering attitude kinematics, rigid-body spin stability, orbital relative motion, and attitude actuators.

<figure class="gnc-fig">
<div class="gnc-fig__scroll">
<svg viewBox="0 0 900 220" role="img" aria-label="Three modules covered by the spacecraft dynamics animations: attitude dynamics, orbital mechanics, and actuators">
<g class="gnc-node" style="animation-delay:.05s">
  <rect class="gnc-card gnc-card--surface" x="20" y="18" width="268" height="184" rx="10"></rect>
  <text class="gnc-t--strong gnc-t--navy" x="154" y="42">Attitude &amp; Spin Stability</text>
  <ellipse cx="154" cy="112" rx="54" ry="20" fill="none" stroke="var(--gnc-line)" stroke-dasharray="4 4"></ellipse>
  <g class="gnc-spin">
    <ellipse cx="154" cy="112" rx="44" ry="18" fill="var(--gnc-fill-1)" stroke="var(--gnc-blue)" stroke-width="1.4"></ellipse>
    <line x1="154" y1="74" x2="154" y2="150" stroke="var(--gnc-coral)" stroke-width="1.6"></line>
    <circle cx="154" cy="74" r="3.5" fill="var(--gnc-coral)"></circle>
  </g>
  <text class="gnc-t--xs" x="154" y="176">3-1-2 Euler · Explorer 1 · Gravity Gradient</text>
</g>

<g class="gnc-node" style="animation-delay:.16s">
  <rect class="gnc-card gnc-card--surface" x="316" y="18" width="268" height="184" rx="10"></rect>
  <text class="gnc-t--strong gnc-t--teal" x="450" y="42">Orbital &amp; Relative Motion</text>
  <circle cx="450" cy="112" r="14" fill="var(--gnc-teal)" fill-opacity="0.25" stroke="var(--gnc-teal)" stroke-width="1.5"></circle>
  <ellipse cx="450" cy="112" rx="64" ry="30" fill="none" stroke="var(--gnc-teal)" stroke-width="1.3" class="gnc-flow gnc-flow--slow"></ellipse>
  <g class="gnc-spin gnc-spin--fast">
    <circle cx="514" cy="112" r="4.5" fill="var(--gnc-amber)"></circle>
    <circle cx="386" cy="112" r="2.5" fill="var(--gnc-teal)" fill-opacity="0.5"></circle>
  </g>
  <text class="gnc-t--xs" x="450" y="176">Sun-Synchronous · CW Rendezvous · Flyby</text>
</g>

<g class="gnc-node" style="animation-delay:.27s">
  <rect class="gnc-card gnc-card--surface" x="612" y="18" width="268" height="184" rx="10"></rect>
  <text class="gnc-t--strong gnc-t--amber" x="746" y="42">Attitude Actuators</text>
  <circle cx="746" cy="112" r="36" fill="var(--gnc-fill-3)" stroke="var(--gnc-amber)" stroke-width="1.4"></circle>
  <g class="gnc-spin gnc-spin--fast gnc-spin--reverse">
    <circle cx="746" cy="112" r="24" fill="none" stroke="var(--gnc-amber)" stroke-width="2" stroke-dasharray="14 10"></circle>
    <line x1="746" y1="84" x2="746" y2="140" stroke="var(--gnc-navy)" stroke-width="1.4"></line>
    <line x1="718" y1="112" x2="774" y2="112" stroke="var(--gnc-navy)" stroke-width="1.4"></line>
  </g>
  <circle cx="746" cy="112" r="5" fill="var(--gnc-navy)"></circle>
  <text class="gnc-t--xs" x="746" y="176">Reaction Wheel Desaturation · CMG Singularity</text>
</g>
</svg>
</div>
<figcaption>Figure 1. Three core themes across the nine animations: rigid-body attitude dynamics, orbital/relative motion, and attitude actuators.</figcaption>
</figure>

The collection includes:

- 3-1-2 Euler-angle sequence and the non-commutativity of rotations;
- Explorer 1 spin instability caused by energy dissipation;
- spin stability about the major and intermediate inertia axes;
- stable libration and unstable divergence under gravity-gradient torque;
- Sun-synchronous orbit nodal precession, inclination–altitude relation, and local-time preservation;
- CW natural fly-around and V-bar two-impulse rendezvous;
- gravity-assist velocity changes in planet-centered and heliocentric frames;
- reaction-wheel momentum exchange, saturation, desaturation, and CMG singular geometry.

All rendered videos and core simulation code are available on GitHub:

::github{repo="sanshansss/spacecraft-dynamics-animations"}

- Project: <https://github.com/sanshansss/spacecraft-dynamics-animations>
- Homepage: <https://sanshansss.github.io/astro-theme-retypeset/>
