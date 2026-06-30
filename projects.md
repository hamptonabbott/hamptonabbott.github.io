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

<div class="accent-rule mb-4 mt-14"></div>
<h2 class="text-2xl font-bold text-[#37352f] mb-2">Writing</h2>
<p class="text-[#787774] text-sm mb-7">Essays on data ethics, analytics, and social context.</p>

<div class="divide-y divide-[#e3e2e0] border-y border-[#e3e2e0] mb-4">
  {% for post in site.posts %}
  <a href="{{ post.url | relative_url }}" class="flex items-baseline justify-between gap-4 py-3 group">
    <span>
      <span class="text-[15px] font-semibold text-[#37352f] group-hover:text-[#0f7b6c] transition-colors">{{ post.title }}</span>
      {% if post.subtitle %}<span class="text-[13px] text-[#787774]"> — {{ post.subtitle }}</span>{% endif %}
    </span>
    <span class="text-xs text-[#787774] whitespace-nowrap">{{ post.date | date: "%b %d, %Y" }}</span>
  </a>
  {% endfor %}
</div>

<a href="{{ '/blog' | relative_url }}" class="text-sm text-[#787774] hover:underline">All writing →</a>
