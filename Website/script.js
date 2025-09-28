/* Wanderlust — Travel Explorer (Enhanced)
   script.js — enhanced with new features
   Features:
    - Destinations explorer (grid + modal)
    - Map (Leaflet)
    - Weather (Open-Meteo + Nominatim)
    - Currency conversion (exchangerate.host)
    - Planner + printable itinerary
    - Bookings & favorites via localStorage
    - Lightbox gallery, theme toggle
    - Travel Blog, Packing List, Checklist, Translator, Tips, Statistics
*/
(() => {
  'use strict';

  /* ---------- Utilities ---------- */
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const fmt = s => String(s || '').trim();
  const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));
  const load = k => JSON.parse(localStorage.getItem(k) || 'null');

  /* ---------- Initial state ---------- */
  const DEST_KEY = 'wl_destinations_v1';
  const FAV_KEY = 'wl_favorites_v1';
  const BOOK_KEY = 'wl_bookings_v1';
  const STATS_KEY = 'wl_stats_v1';
  const CHECKLIST_KEY = 'wl_checklist_v1';

  // Seed data (professional list)
  const seedDestinations = [
    { id:'santorini', title:'Santorini, Greece', region:'europe', lat:36.3932, lon:25.4615, price:299, desc:'Whitewashed houses and sunsets in Oia.', imgs:[
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a3f09e7b0f?w=1200&q=80'
    ]},
    { id:'bali', title:'Bali, Indonesia', region:'asia', lat:-8.3405, lon:115.0920, price:349, desc:'Lush rice terraces, beaches, and temples.', imgs:[
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a3f09e7b0f?w=1200&q=80'
    ]},
    { id:'paris', title:'Paris, France', region:'europe', lat:48.8566, lon:2.3522, price:399, desc:'City of lights, art and cafes.', imgs:[
      'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200&q=80'
    ]},
    { id:'maldives', title:'Maldives', region:'asia', lat:3.2028, lon:73.2207, price:699, desc:'Crystal clear lagoons and overwater villas.', imgs:[
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80'
    ]},
    { id:'reykjavik', title:'Reykjavik, Iceland', region:'europe', lat:64.1466, lon:-21.9426, price:449, desc:'Northern lights and dramatic landscapes.', imgs:[
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80'
    ]},
  ];

  // Travel blog data
  const blogPosts = [
    {
      id: 1,
      title: "Santorini Sunset Magic",
      excerpt: "Experiencing the famous Oia sunset was everything I hoped for and more. The views from the cliffs are absolutely breathtaking.",
      author: "Traveler Jane",
      date: "2023-05-15",
      rating: 5,
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80"
    },
    {
      id: 2,
      title: "Bali's Hidden Waterfalls",
      excerpt: "Beyond the beaches, Bali's interior holds magical waterfalls worth exploring. We found several secluded spots away from the crowds.",
      author: "Adventure Mike",
      date: "2023-04-22",
      rating: 4,
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80"
    },
    {
      id: 3,
      title: "Parisian Cafés & Culture",
      excerpt: "How to experience Paris like a local, from hidden cafés to neighborhood markets. Skip the tourist traps and find the real Paris.",
      author: "Culture Seeker",
      date: "2023-03-10",
      rating: 5,
      image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=600&q=80"
    }
  ];

  // Travel tips data
  const travelTips = [
    { icon: "💼", title: "Pack Smart", text: "Roll clothes to save space and prevent wrinkles. Use packing cubes for organization." },
    { icon: "💰", title: "Budget Wisely", text: "Always have a contingency fund for unexpected expenses. Track your spending daily." },
    { icon: "🔌", title: "Power Adapters", text: "Research the plug types used in your destination country. A universal adapter is a good investment." },
    { icon: "📱", title: "Digital Copies", text: "Keep digital copies of important documents on your phone and in cloud storage." },
    { icon: "💧", title: "Stay Hydrated", text: "Drink plenty of water, especially during flights and in hot climates." },
    { icon: "🧳", title: "Luggage Tags", text: "Use durable luggage tags with your contact information inside and outside your bags." }
  ];

  // Travel checklist items
  const checklistItems = [
    { id: 1, text: "Book flights", category: "transportation" },
    { id: 2, text: "Arrange accommodation", category: "accommodation" },
    { id: 3, text: "Check passport validity", category: "documents" },
    { id: 4, text: "Get travel insurance", category: "documents" },
    { id: 5, text: "Notify bank of travel plans", category: "finance" },
    { id: 6, text: "Research visa requirements", category: "documents" },
    { id: 7, text: "Download offline maps", category: "preparation" },
    { id: 8, text: "Pack medications", category: "health" },
    { id: 9, text: "Charge electronics", category: "preparation" },
    { id: 10, text: "Confirm bookings", category: "accommodation" }
  ];

  // Packing list templates
  const packingTemplates = {
    beach: ["Swimsuit", "Sunscreen", "Beach towel", "Sunglasses", "Flip flops", "Beach bag", "Hat", "Cover-up", "Water shoes"],
    city: ["Comfortable walking shoes", "City map", "Day bag", "Light jacket", "Power bank", "City guide", "Umbrella", "Compact camera"],
    adventure: ["Hiking boots", "Backpack", "Water bottle", "First aid kit", "Multi-tool", "Headlamp", "Quick-dry clothes", "Compass"],
    cold: ["Warm jacket", "Thermal layers", "Beanie", "Gloves", "Scarf", "Warm socks", "Lip balm", "Hand warmers"],
    essentials: ["Passport", "Wallet", "Phone", "Charger", "Medications", "Travel documents", "Credit cards", "Emergency contacts"]
  };

  // ensure destinations stored
  if(!load(DEST_KEY)) save(DEST_KEY, seedDestinations);

  /* ---------- DOM refs ---------- */
  const destGrid = $('#destGrid');
  const loadMoreBtn = $('#loadMore');
  const favCountEl = $('#favCount');
  const favoritesList = $('#favoritesList');
  const favoritesBtn = $('#favoritesBtn');
  const destModal = $('#destModal');
  const destContent = $('#destContent');
  const destClose = $('#destClose');
  const mapView = $('#mapView');
  const galleryGrid = $('#galleryGrid');
  const yearEl = $('#year');
  const themeToggle = $('#themeToggle');
  const blogGrid = $('#blogGrid');
  const travelChecklist = $('#travelChecklist');
  const travelTipsEl = $('#travelTips');
  const travelStats = $('#travelStats');
  const packingList = $('#packingList');

  /* ---------- Theme ---------- */
  const storedTheme = localStorage.getItem('wl-theme') || 'light';
  if(storedTheme === 'dark') document.documentElement.setAttribute('data-theme','dark');
  themeToggle.textContent = storedTheme === 'dark' ? '☀️' : '🌙';
  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    if(next === 'dark') document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('wl-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  yearEl.textContent = new Date().getFullYear();

  /* ---------- NEW: Travel Blog ---------- */
  function renderBlogPosts() {
    blogGrid.innerHTML = blogPosts.map(post => `
      <article class="blog-card">
        <img src="${post.image}" alt="${post.title}" loading="lazy">
        <div class="blog-content">
          <div class="blog-meta">
            <span>${post.author}</span>
            <span>${new Date(post.date).toLocaleDateString()}</span>
          </div>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <div class="blog-rating">${'★'.repeat(post.rating)}${'☆'.repeat(5-post.rating)}</div>
        </div>
      </article>
    `).join('');
  }

  /* ---------- NEW: Travel Checklist ---------- */
  function renderChecklist() {
    let checklistProgress = load(CHECKLIST_KEY) || {};
    
    travelChecklist.innerHTML = checklistItems.map(item => {
      const isChecked = checklistProgress[item.id] || false;
      return `
        <div class="checklist-item">
          <input type="checkbox" id="check-${item.id}" ${isChecked ? 'checked' : ''} data-id="${item.id}">
          <label for="check-${item.id}">${item.text}</label>
        </div>
      `;
    }).join('');
    
    // Add event listeners to checkboxes
    $$('#travelChecklist input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id);
        checklistProgress[id] = e.target.checked;
        save(CHECKLIST_KEY, checklistProgress);
        updateChecklistProgress();
      });
    });
    
    updateChecklistProgress();
  }

  function updateChecklistProgress() {
    const checklistProgress = load(CHECKLIST_KEY) || {};
    const total = checklistItems.length;
    const completed = Object.values(checklistProgress).filter(Boolean).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Update stats
    let stats = load(STATS_KEY) || {};
    stats.checklistProgress = progress;
    save(STATS_KEY, stats);
    renderStats();
  }

  /* ---------- NEW: Travel Tips ---------- */
  function renderTravelTips() {
    travelTipsEl.innerHTML = travelTips.map(tip => `
      <div class="tip-card">
        <h4><span class="tip-icon">${tip.icon}</span> ${tip.title}</h4>
        <p>${tip.text}</p>
      </div>
    `).join('');
  }

  /* ---------- NEW: Travel Statistics ---------- */
  function renderStats() {
    const stats = load(STATS_KEY) || { tripsPlanned: 0, destinationsVisited: 0, daysTraveled: 0, checklistProgress: 0 };
    
    travelStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Trips Planned</div>
        <div class="stat-value">${stats.tripsPlanned || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Destinations Visited</div>
        <div class="stat-value">${stats.destinationsVisited || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Days Traveled</div>
        <div class="stat-value">${stats.daysTraveled || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Checklist Progress</div>
        <div class="stat-value">${stats.checklistProgress || 0}%</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.checklistProgress || 0}%"></div>
        </div>
      </div>
    `;
  }

  /* ---------- NEW: Packing List Generator ---------- */
  function generatePackingList(tripDetails) {
    if (!tripDetails) {
      packingList.innerHTML = '<p class="muted">Generate your itinerary first to see packing suggestions</p>';
      return;
    }
    
    const { destination, days, style } = tripDetails;
    let categories = ['essentials'];
    
    // Determine categories based on trip details
    if (days > 7) categories.push('extended');
    if (style === 'adventure') categories.push('adventure');
    if (destination.toLowerCase().includes('beach') || style === 'relax') categories.push('beach');
    if (destination.toLowerCase().includes('cold') || style === 'adventure') categories.push('cold');
    categories.push('city'); // Always include city items
    
    let packingHTML = '';
    
    categories.forEach(category => {
      if (packingTemplates[category]) {
        packingHTML += `
          <div class="packing-category">
            <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
            <div class="packing-items">
              ${packingTemplates[category].map(item => `
                <div class="packing-item">
                  <input type="checkbox" id="pack-${category}-${item.replace(/\s+/g, '-')}">
                  <label for="pack-${category}-${item.replace(/\s+/g, '-')}">${item}</label>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    });
    
    packingList.innerHTML = packingHTML;
  }

  /* ---------- NEW: Language Translator ---------- */
  $('#translateBtn').addEventListener('click', () => {
    const text = fmt($('#textToTranslate').value);
    const fromLang = $('#langFrom').value;
    const toLang = $('#langTo').value;
    
    if (!text) {
      $('#translatedText').value = "Please enter text to translate";
      return;
    }
    
    // Simple mock translation (in a real app, you'd use a translation API)
    const mockTranslations = {
      "en-es": {
        "hello": "hola",
        "goodbye": "adiós",
        "thank you": "gracias",
        "please": "por favor",
        "where is": "dónde está",
        "how much": "cuánto cuesta",
        "help": "ayuda"
      },
      "es-en": {
        "hola": "hello",
        "adiós": "goodbye",
        "gracias": "thank you",
        "por favor": "please",
        "dónde está": "where is",
        "cuánto cuesta": "how much",
        "ayuda": "help"
      }
      // Add more mock translations as needed
    };
    
    const translationKey = `${fromLang}-${toLang}`;
    const translationDict = mockTranslations[translationKey] || {};
    
    // Simple word-by-word translation for demo
    const translated = text.split(' ').map(word => {
      const lowerWord = word.toLowerCase();
      return translationDict[lowerWord] || word;
    }).join(' ');
    
    $('#translatedText').value = translated;
  });
  
  $('#swapLang').addEventListener('click', () => {
    const fromVal = $('#langFrom').value;
    const toVal = $('#langTo').value;
    $('#langFrom').value = toVal;
    $('#langTo').value = fromVal;
    
    // Also swap text areas if they have content
    const temp = $('#textToTranslate').value;
    $('#textToTranslate').value = $('#translatedText').value;
    $('#translatedText').value = temp;
  });

  /* ---------- NEW: Social Sharing ---------- */
  function setupSocialSharing() {
    $('#shareFb').addEventListener('click', () => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent("Check out this amazing travel planner!");
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    });
    
    $('#shareTw').addEventListener('click', () => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent("Amazing travel planner - Wanderlust!");
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    });
    
    $('#shareWa').addEventListener('click', () => {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent("Check out this travel planner: ");
      window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank');
    });
    
    $('#shareEmail').addEventListener('click', () => {
      const subject = encodeURIComponent("Amazing Travel Planner - Wanderlust");
      const body = encodeURIComponent(`Check out this travel planner: ${window.location.href}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    });
  }

  /* ---------- Render destinations ---------- */
  function getDestinations() { return load(DEST_KEY) || seedDestinations; }
  function renderDestinations(filter='all') {
    const list = getDestinations().filter(d => filter === 'all' || d.region === filter);
    destGrid.innerHTML = '';
    list.forEach(d => {
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `
        <img loading="lazy" src="${d.imgs[0]}" alt="${d.title}">
        <h3>${d.title}</h3>
        <p class="muted">${d.desc}</p>
        <div style="display:flex;gap:8px;align-items:center;margin-top:auto">
          <button data-act="view" data-id="${d.id}">View</button>
          <button data-act="plan" data-id="${d.id}" class="muted">Plan</button>
          <button data-act="fav" data-id="${d.id}" title="Favorite" style="margin-left:auto">${getFavorites().includes(d.id) ? '★' : '☆'}</button>
        </div>
      `;
      destGrid.appendChild(el);
    });
    attachDestListeners();
  }

  /* ---------- Destination card listeners ---------- */
  function attachDestListeners(){
    $$('#destGrid [data-act="view"]').forEach(btn => btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      openDestinationModal(id);
    }));
    $$('#destGrid [data-act="plan"]').forEach(btn => btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const d = getDestinations().find(x=>x.id===id);
      if(d) {
        $('#p-destination').value = d.title;
        location.hash = '#planner';
        $('#p-days').focus();
      }
    }));
    $$('#destGrid [data-act="fav"]').forEach(btn => btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      toggleFavorite(id);
    }));
  }

  /* ---------- Modal ---------- */
  function openDestinationModal(id){
    const d = getDestinations().find(x=>x.id===id);
    if(!d) return;
    destContent.innerHTML = `
      <h2>${d.title} <small class="muted">— $${d.price}</small></h2>
      <p class="muted">${d.desc}</p>
      <div class="thumbs">${d.imgs.map(src => `<img src="${src}" loading="lazy" />`).join('')}</div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button id="modalPlan">Plan this</button>
        <button id="modalFav" class="muted">${getFavorites().includes(d.id) ? '★' : '☆'} Favorite</button>
        <button id="modalWeather" class="muted">Weather</button>
      </div>
      <div id="modalMap" style="height:240px;margin-top:12px;border-radius:8px;overflow:hidden"></div>
      <div id="modalWeatherRes" class="tool-output" style="margin-top:8px"></div>
    `;
    // show modal
    destModal.classList.add('show'); destModal.setAttribute('aria-hidden','false');

    // hook buttons
    $('#modalPlan').addEventListener('click', ()=> {
      $('#p-destination').value = d.title; location.hash = '#planner';
      hideModal();
    });
    $('#modalFav').addEventListener('click', ()=> { toggleFavorite(d.id); });
    $('#modalWeather').addEventListener('click', ()=> { fetchAndShowWeather(d.lat, d.lon, '#modalWeatherRes'); });

    // init map inside modal using Leaflet
    setTimeout(()=> {
      try {
        const map = L.map('modalMap', { scrollWheelZoom:false }).setView([d.lat, d.lon], 8);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'' }).addTo(map);
        L.marker([d.lat, d.lon]).addTo(map).bindPopup(d.title).openPopup();
      } catch(e) { console.warn('Leaflet modal map init failed', e); }
    }, 100);
  }
  function hideModal(){ destModal.classList.remove('show'); destModal.setAttribute('aria-hidden','true'); destContent.innerHTML=''; }

  destClose.addEventListener('click', hideModal);
  destModal.addEventListener('click', (ev)=> { if(ev.target === destModal) hideModal(); });

  /* ---------- Favorites ---------- */
  function getFavorites(){ return load(FAV_KEY) || []; }
  function toggleFavorite(id){
    let favs = getFavorites();
    if(favs.includes(id)) favs = favs.filter(x=>x!==id);
    else favs.push(id);
    save(FAV_KEY, favs);
    updateFavUI();
    renderDestinations($('.filter-btn.active')?.dataset.filter || 'all');
  }
  function updateFavUI(){
    const favs = getFavorites();
    favCountEl.textContent = favs.length;
    if(favs.length === 0) favoritesList.textContent = 'No favorites yet';
    else {
      const nodes = favs.map(id => {
        const d = getDestinations().find(x=>x.id===id);
        return `<div style="display:flex;gap:8px;align-items:center"><img src="${d.imgs[0]}" style="width:56px;height:40px;object-fit:cover;border-radius:6px"/><div><strong>${d.title}</strong><div class="muted">$${d.price} · ${d.region}</div></div><button data-unfav="${d.id}" style="margin-left:auto" class="muted">Remove</button></div>`;
      }).join('');
      favoritesList.innerHTML = nodes;
      // attach remove buttons
      $$('#favoritesList [data-unfav]').forEach(b => b.addEventListener('click', e => {
        toggleFavorite(e.currentTarget.dataset.unfav);
      }));
    }
  }
  favoritesBtn.addEventListener('click', ()=> {
    window.scrollTo({ top: favoritesList.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' });
  });

  /* ---------- Map (Leaflet) ---------- */
  let mainMap;
  function initMap(){
    try {
      mainMap = L.map('mapView', { zoomControl:true }).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'' }).addTo(mainMap);
      // add markers
      getDestinations().forEach(d => {
        const m = L.marker([d.lat, d.lon]).addTo(mainMap);
        m.bindPopup(`<strong>${d.title}</strong><div class="muted">$${d.price} · ${d.region}</div><div style="margin-top:6px"><button class="mini" data-open="${d.id}">View</button></div>`);
        m.on('popupopen', () => {
          // attach click
          document.querySelectorAll('[data-open]').forEach(btn => {
            btn.addEventListener('click', e => openDestinationModal(e.currentTarget.dataset.open));
          });
        });
      });
    } catch(e){
      console.warn('Map init failed', e);
      mapView.innerHTML = '<div class="muted">Map failed to load</div>';
    }
  }

  /* ---------- Gallery ---------- */
  function renderGallery(){
    const imgs = getDestinations().flatMap(d => d.imgs.slice(0,2));
    galleryGrid.innerHTML = '';
    imgs.forEach(src => {
      const img = document.createElement('img');
      img.src = src; img.loading = 'lazy';
      img.addEventListener('click', ()=> openLightbox(src));
      galleryGrid.appendChild(img);
    });
  }
  const lightbox = $('#lightbox'), lbImg = $('#lbImg'), lbClose = $('#lbClose');
  function openLightbox(src){ lbImg.src = src; lightbox.classList.add('show'); lightbox.setAttribute('aria-hidden','false'); }
  lbClose.addEventListener('click', ()=> { lightbox.classList.remove('show'); lightbox.setAttribute('aria-hidden','true'); });
  lightbox.addEventListener('click', e => { if(e.target === lightbox) { lightbox.classList.remove('show'); } });

  /* ---------- Weather (Open-Meteo + Nominatim) ---------- */
  async function geocode(query) {
    // if lat,lon return directly
    if(/^[\d\.\-]+,\s*[\d\.\-]+$/.test(query)) {
      const [lat, lon] = query.split(',').map(s=>s.trim());
      return { lat, lon, name:`${lat},${lon}` };
    }
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const json = await resp.json();
      if(json && json[0]) return { lat: json[0].lat, lon: json[0].lon, name: json[0].display_name };
      return null;
    } catch(e){ console.warn('geocode error', e); return null; }
  }

  async function fetchWeatherByCoords(lat, lon){
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const json = await res.json();
      return json.current_weather;
    } catch(e) {
      console.warn('weather fetch error', e);
      return null;
    }
  }

  async function fetchAndShowWeather(lat, lon, outSelector){
    const target = typeof outSelector === 'string' ? document.querySelector(outSelector) : outSelector;
    if(!target) return;
    target.textContent = 'Loading weather...';
    const w = await fetchWeatherByCoords(lat, lon);
    if(!w) { target.textContent = 'Weather unavailable'; return; }
    target.textContent = `Temp: ${w.temperature}°C · Wind: ${w.windspeed} km/h · Time: ${w.time}`;
  }

  $('#getWeather').addEventListener('click', async () => {
    const q = fmt($('#weatherQuery').value);
    if(!q) { $('#weatherResult').textContent = 'Enter a city or lat,lon'; return; }
    $('#weatherResult').textContent = 'Geocoding...';
    const geo = await geocode(q);
    if(!geo) { $('#weatherResult').textContent = 'Location not found'; return; }
    await fetchAndShowWeather(geo.lat, geo.lon, $('#weatherResult'));
  });
  $('#weatherClear').addEventListener('click', ()=> { $('#weatherQuery').value=''; $('#weatherResult').textContent='No query yet'; });

  /* ---------- Currency conversion (exchangerate.host) ---------- */
  $('#convertBtn').addEventListener('click', async () => {
    const amount = Number($('#curAmount').value) || 0;
    const from = $('#curFrom').value || 'USD';
    const to = $('#curTo').value || 'EUR';
    $('#convertResult').textContent = 'Fetching...';
    try {
      const res = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`);
      const json = await res.json();
      if(json && json.result !== undefined){
        $('#convertResult').textContent = `${amount} ${from} = ${Number(json.result).toFixed(2)} ${to} · Rate: ${json.info.rate.toFixed(4)}`;
      } else {
        $('#convertResult').textContent = 'Conversion failed';
      }
    } catch(e){ console.warn(e); $('#convertResult').textContent = 'Conversion error'; }
  });
  $('#swapCur').addEventListener('click', ()=> {
    const a = $('#curFrom').value; $('#curFrom').value = $('#curTo').value; $('#curTo').value = a;
  });

  /* ---------- Planner / Itinerary ---------- */
  const plannerForm = $('#plannerForm');
  const itinEl = $('#itinerary');

  plannerForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData(plannerForm);
    const dest = form.get('destination');
    const days = Number(form.get('days')) || 1;
    const style = form.get('style') || 'balanced';
    const budget = Number(form.get('budget')) || 0;
    const start = form.get('start') ? new Date(form.get('start')) : new Date();
    const html = generateItineraryHTML({dest, days, style, budget, start});
    itinEl.innerHTML = html;
    
    // Update stats
    let stats = load(STATS_KEY) || {};
    stats.tripsPlanned = (stats.tripsPlanned || 0) + 1;
    stats.destinationsVisited = (stats.destinationsVisited || 0) + 1;
    stats.daysTraveled = (stats.daysTraveled || 0) + days;
    stats.budgetUsed = (stats.budgetUsed || 0) + budget;
    save(STATS_KEY, stats);
    renderStats();
    
    // Generate packing list
    generatePackingList({dest, days, style, budget, start});
    
    // show print hint
    setTimeout(()=> window.scrollTo({ top: itinEl.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' }), 200);
  });

  function generateItineraryHTML({dest, days, style, budget, start}){
    if(!dest) return '<div class="muted">Provide a destination to generate an itinerary.</div>';
    const perDay = Math.max(50, Math.round(budget / Math.max(1, days)));
    let out = `<h3>Itinerary — ${escapeHtml(dest)} · ${days} day(s)</h3>`;
    out += `<div class="muted">Estimated daily budget: $${perDay} · Travel style: ${style}</div>`;
    out += `<div style="margin-top:10px">`;
    for(let i=0;i<days;i++){
      const d = new Date(start); d.setDate(start.getDate()+i);
      out += `<div class="day"><strong>Day ${i+1} — ${d.toDateString()}</strong><ul>`;
      // suggestions based on style
      if(style === 'adventure'){
        out += `<li>Morning: Outdoor activity (hike, water sport)</li><li>Afternoon: Local guided adventure</li><li>Evening: Street food market</li>`;
      } else if(style === 'relax'){
        out += `<li>Morning: Leisure at the hotel or beach</li><li>Afternoon: Spa / slow sightseeing</li><li>Evening: Sunset dinner</li>`;
      } else if(style === 'budget'){
        out += `<li>Morning: Free walking tour</li><li>Afternoon: Public transport to landmarks</li><li>Evening: Local affordable eats</li>`;
      } else {
        out += `<li>Morning: Top sights & museum</li><li>Afternoon: Neighborhood exploration</li><li>Evening: Popular local restaurant</li>`;
      }
      out += `</ul></div>`;
    }
    out += `</div><div style="margin-top:12px" class="muted">Tip: Use the Weather & Currency tools to finalize dates and budgets.</div>`;
    // include download/print note
    out += `<div style="margin-top:12px"><small class="muted">Use "Download Itinerary" to print or save PDF.</small></div>`;
    return out;
  }

  $('#downloadItin').addEventListener('click', () => {
    // Prepare a printable window with itinerary content
    const content = itinEl.innerHTML || '<div class="muted">No itinerary to download</div>';
    const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    const css = `<style>body{font-family:Inter,Arial;padding:24px;color:#102a43} h3{margin-top:0}.muted{color:#6b7c93}</style>`;
    win.document.write(`<html><head><title>Itinerary</title>${css}</head><body>${content}<hr><div class="muted">Generated from Wanderlust — Travel Explorer</div></body></html>`);
    win.document.close();
    win.focus();
    // give a short delay then call print
    setTimeout(()=> { win.print(); }, 500);
  });

  $('#clearPlan').addEventListener('click', ()=> { 
    itinEl.innerHTML=''; 
    plannerForm.reset(); 
    packingList.innerHTML = '<p class="muted">Generate your itinerary first to see packing suggestions</p>';
  });

  /* ---------- Bookings (local demo) ---------- */
  const bookingForm = $('#bookingForm');
  const bookingList = $('#bookingList');

  function getBookings(){ return load(BOOK_KEY) || []; }
  function renderBookings(){
    const b = getBookings();
    if(!b.length) { bookingList.textContent = 'No bookings yet'; return; }
    bookingList.innerHTML = b.map((bk,i) => `<div style="display:flex;gap:10px;align-items:center"><div><strong>${bk.destination}</strong><div class="muted">${bk.from} → ${bk.to}</div></div><button data-del="${i}" class="muted" style="margin-left:auto">Cancel</button></div>`).join('');
    $$('#bookingList [data-del]').forEach(btn => btn.addEventListener('click', e => {
      const idx = Number(e.currentTarget.dataset.del);
      const arr = getBookings(); arr.splice(idx,1); save(BOOK_KEY, arr); renderBookings();
    }));
  }

  bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    const dest = $('#b-destination').value.trim();
    const from = $('#b-from').value;
    const to = $('#b-to').value;
    const arr = getBookings();
    arr.push({ destination: dest, from, to, created: new Date().toISOString() });
    save(BOOK_KEY, arr);
    renderBookings();
    bookingForm.reset();
    alert('Booking saved (demo). Data stored locally.');
  });

  /* ---------- Helpers ---------- */
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function escapeHtmlAttr(s){ return String(s).replace(/"/g, '&quot;'); }
  function escapeHtmlText(s){ return String(s); }

  /* ---------- Filter buttons ---------- */
  $$('.filter-btn').forEach(btn => btn.addEventListener('click', e => {
    $$('.filter-btn').forEach(b=>b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    renderDestinations(e.currentTarget.dataset.filter || 'all');
  }));

  /* ---------- Load more (demo) ---------- */
  loadMoreBtn.addEventListener('click', () => {
    loadMoreBtn.disabled = true; loadMoreBtn.textContent = 'Loading…';
    setTimeout(()=> {
      // append a couple of demo items
      const data = getDestinations();
      data.push(
        { id:'tokyo', title:'Tokyo, Japan', region:'asia', lat:35.6762, lon:139.6503, price:379, desc:'Vibrant metropolis & food scene', imgs:['https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=1200&q=80'] },
        { id:'vancouver', title:'Vancouver, Canada', region:'americas', lat:49.2827, lon:-123.1207, price:329, desc:'Coastlines & mountains.', imgs:['https://images.unsplash.com/photo-1505765051424-6f6e8f6f0c6f?w=1200&q=80'] }
      );
      save(DEST_KEY, data);
      renderDestinations($('.filter-btn.active')?.dataset.filter || 'all');
      loadMoreBtn.disabled = false; loadMoreBtn.textContent = 'Load more';
    }, 900);
  });

  /* ---------- Quick search form ---------- */
  $('#quickSearch').addEventListener('submit', e => {
    e.preventDefault();
    const q = fmt($('#q-destination').value);
    const days = Number($('#q-days').value) || 3;
    const budget = Number($('#q-budget').value) || 1500;
    $('#p-destination').value = q; $('#p-days').value = days; $('#p-budget').value = budget;
    location.hash = '#planner';
  });

  /* ---------- Dest modal click handlers for thumbs (delegation) ---------- */
  destContent.addEventListener('click', e => {
    if(e.target.tagName === 'IMG' && e.target.closest('.thumbs')) {
      openLightbox(e.target.src);
    }
  });

  /* ---------- Init UI ---------- */
  function initUI(){
    renderDestinations();
    updateFavUI();
    initMap();
    renderGallery();
    renderBookings();
    renderBlogPosts();
    renderChecklist();
    renderTravelTips();
    renderStats();
    setupSocialSharing();
  }

  /* ---------- Run on load ---------- */
  window.addEventListener('load', initUI);

  /* ---------- Small accessibility: close modal on ESC ---------- */
  window.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      hideModal();
      if(lightbox.classList.contains('show')) { lightbox.classList.remove('show'); lightbox.setAttribute('aria-hidden','true'); }
    }
  });

  /* ---------- Expose some for debug (optional) ---------- */
  window.Wanderlust = {
    getDestinations, renderDestinations, getFavorites, getBookings
  };

})();