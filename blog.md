---
layout: default
title: Writing
---

<div class="accent-rule mb-4"></div>
<h1 class="text-3xl font-bold text-[#37352f] mb-2">Writing</h1>
<p class="text-[#787774] text-sm mb-7">Essays on data ethics, analytics, and social context.</p>

<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
  {% for post in site.posts %}
  <a href="{{ post.url | relative_url }}" class="group block bg-white border border-[#e3e2e0] rounded-2xl overflow-hidden shadow-sm ch">
    <div class="aspect-[16/9] overflow-hidden">
      <img src="{{ post.thumbnail | default: '/assets/images/og-preview.png' | relative_url }}" alt="{{ post.title | escape }} thumbnail" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300">
    </div>
    <div class="p-4 border-t border-[#e3e2e0]">
      <div class="flex items-center gap-1.5 mb-2">
        <div class="w-4 h-4 rounded-full bg-[#e3e2e0] flex items-center justify-center text-[7px] font-bold text-[#787774]">H</div>
        <span class="text-[10px] text-[#787774]">Hampton Abbott · {{ post.date | date: "%b %d, %Y" }}</span>
      </div>
      <div class="text-sm font-semibold text-[#37352f] leading-snug">{{ post.title }}</div>
      {% if post.subtitle %}<div class="text-xs text-[#787774] mt-0.5">{{ post.subtitle }}</div>{% endif %}
    </div>
  </a>
  {% endfor %}
</div>
