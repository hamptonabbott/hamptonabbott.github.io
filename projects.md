---
layout: default
title: Projects
---

<div class="accent-rule mb-4"></div>
<h1 class="text-3xl font-bold text-[#37352f] mb-2">Featured Projects</h1>
<p class="text-[#787774] text-sm mb-7">Self-developed, deployed builds.</p>

<div class="space-y-5">
  {% for p in site.data.projects %}{% if p.category == "featured" %}
    {% include project-card.html project=p variant="featured" %}
  {% endif %}{% endfor %}
</div>

<div class="accent-rule mb-4 mt-14"></div>
<h2 class="text-2xl font-bold text-[#37352f] mb-2">Case Studies</h2>
<p class="text-[#787774] text-sm mb-7">Analytical studies with full writeups.</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
  {% for p in site.data.projects %}{% if p.category == "case-study" %}
    {% include project-card.html project=p variant="compact" %}
  {% endif %}{% endfor %}
</div>
