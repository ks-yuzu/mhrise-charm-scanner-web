<script>
  export let isOpen = false;
</script>


<div class="menu toggle-back">
  <label>
    <input type="checkbox" bind:checked={isOpen}>
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" />
      <path class="line--1" d="M0 55l14-10c4.7-3.3 9-5 13-5h72" />
      <path class="line--2" d="M0 50h99" />
      <path class="line--3" d="M0 45l14 10c4.7 3.3 9 5 13 5h72" />
    </svg>
  </label>
</div>


<style>
.menu label {
  width:  3rem;
  height: 3rem;
}

.menu label input {
  display: none;
}

.menu label svg circle {
  fill: #fff3;
  opacity: 0;
}

.menu label:hover circle {
  opacity: 1;
}

.menu label svg path {
  fill: none;
  stroke: #ffffff;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  --length: 24;
  --offset: -38;
  stroke-dasharray: var(--length) var(--total-length);
  stroke-dashoffset: var(--offset);
  transition: all .2s cubic-bezier(.645, .045, .355, 1);
}

.menu.toggle-back label input:checked+svg .line--1,
.menu.toggle-back label input:checked+svg .line--3 {
  --length: 8.602325267;
}

.menu svg .line--1,
.menu svg .line--3 {
  --total-length: 103.35061645507812;
  --offset:       -42.35061645507812;
}
.menu svg .line--2 {
  --total-length: 99;
}

.menu input:checked+svg path {
  transform: translateX(31px);
}
.menu input:checked+svg .line--1,
.menu input:checked+svg .line--3 {
  --offset: -8.602325267;
}
.menu input:checked+svg .line--2 {
  --offset: -7;
}
</style>
