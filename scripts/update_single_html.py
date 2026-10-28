import json
import re

def update_file(filepath):
    print(f"Processing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. CSS styling
    css_to_add = """
    /* Media & Entertainment Apps (Manga, Movies, Music, Cloud Gaming) */
    .manga-container, .movies-container, .music-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background: #080911;
      color: #fff;
      overflow: hidden;
      font-family: inherit;
    }
    .manga-topbar, .movies-topbar, .music-topbar {
      padding: 12px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 17, 30, 0.95);
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex-shrink: 0;
    }
    .media-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 14px;
      padding: 18px;
      overflow-y: auto;
      flex: 1;
    }
    .media-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }
    .media-card:hover {
      transform: translateY(-4px);
      border-color: rgba(168, 85, 247, 0.5);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(168, 85, 247, 0.2);
      background: rgba(255, 255, 255, 0.06);
    }
    .media-card-poster {
      position: relative;
      width: 100%;
      aspect-ratio: 2/3;
      overflow: hidden;
      background: #050508;
    }
    .media-card-poster img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .media-card:hover .media-card-poster img {
      transform: scale(1.06);
    }
    .media-card-info {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .media-card-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .media-card-subtitle {
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
    .player-overlay {
      position: absolute;
      inset: 0;
      background: #000;
      z-index: 50;
      display: flex;
      flex-direction: column;
    }
    .player-header {
      height: 48px;
      padding: 0 16px;
      background: #0b0c16;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .audio-player-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: radial-gradient(circle at center, rgba(168,85,247,0.15), transparent 70%);
    }
    .album-art-wrap {
      width: 180px;
      height: 180px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 16px 48px rgba(0,0,0,0.8), 0 0 24px rgba(168,85,247,0.3);
      border: 1px solid rgba(255,255,255,0.2);
      margin-bottom: 20px;
    }
    .album-art-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
"""
    if '/* Media & Entertainment Apps' not in content:
        content = content.replace('</style>', css_to_add)

    # 2. Add Desktop Icons
    desktop_icons_html = """
      <div class="desktop-icon" onclick="openApp('manga')">
        <div class="icon-img" style="background: linear-gradient(135deg, #ec4899, #be185d); display:flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </div>
        <div class="icon-label">Godly Manga</div>
      </div>
      <div class="desktop-icon" onclick="openApp('movies')">
        <div class="icon-img" style="background: linear-gradient(135deg, #e11d48, #b91c1c); display:flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
        </div>
        <div class="icon-label">StreamFlix</div>
      </div>
      <div class="desktop-icon" onclick="openApp('music')">
        <div class="icon-img" style="background: linear-gradient(135deg, #8b5cf6, #6366f1); display:flex; align-items:center; justify-content:center;">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <div class="icon-label">Stratus Music</div>
      </div>
"""
    if "openApp('manga')" not in content:
        content = content.replace('<div class="desktop-icon" onclick="openApp(\'calculator\')">', desktop_icons_html + '      <div class="desktop-icon" onclick="openApp(\'calculator\')">')

    # 3. Add Start Menu items
    start_items_html = """
        <div class="start-item" onclick="openApp('manga'); toggleStartMenu();">
          <div class="start-item-icon" style="background: linear-gradient(135deg, #ec4899, #be185d); display:flex; align-items:center; justify-content:center; border-radius:12px;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          </div>
          <div class="start-item-title">Godly Manga</div>
        </div>
        <div class="start-item" onclick="openApp('movies'); toggleStartMenu();">
          <div class="start-item-icon" style="background: linear-gradient(135deg, #e11d48, #b91c1c); display:flex; align-items:center; justify-content:center; border-radius:12px;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
          </div>
          <div class="start-item-title">StreamFlix Cinema</div>
        </div>
        <div class="start-item" onclick="openApp('music'); toggleStartMenu();">
          <div class="start-item-icon" style="background: linear-gradient(135deg, #8b5cf6, #6366f1); display:flex; align-items:center; justify-content:center; border-radius:12px;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <div class="start-item-title">Stratus Music</div>
        </div>
"""
    if "openApp('manga'); toggleStartMenu();" not in content:
        content = content.replace('<div class="start-item" onclick="openApp(\'calculator\'); toggleStartMenu();">', start_items_html + '        <div class="start-item" onclick="openApp(\'calculator\'); toggleStartMenu();">')

    # 4. Add Dock Quick Launch Buttons
    dock_buttons_html = """
      <button class="dock-btn" onclick="openApp('manga')" title="Godly Manga (MangaDex)">
        <span>📖</span>
      </button>
      <button class="dock-btn" onclick="openApp('movies')" title="StreamFlix Cinema & TV">
        <span>🎬</span>
      </button>
      <button class="dock-btn" onclick="openApp('music')" title="Stratus Music">
        <span>🎵</span>
      </button>
"""
    if "openApp('manga')\" title=\"Godly Manga" not in content:
        content = content.replace('<button class="dock-btn" onclick="openApp(\'terminal\')" title="Terminal">', dock_buttons_html + '      <button class="dock-btn" onclick="openApp(\'terminal\')" title="Terminal">')

    # 5. Add APP_ICONS
    app_icons_append = """
      manga: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23ec4899'/><path d='M22 30 C34 26, 48 30, 50 36 C52 30, 66 26, 78 30 L78 72 C66 68, 52 72, 50 76 C48 72, 34 68, 22 72 Z' fill='%23ffffff'/><path d='M50 36 L50 76' stroke='%23ec4899' stroke-width='4'/></svg>",
      movies: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%23e11d48'/><polygon points='40,32 72,50 40,68' fill='%23ffffff'/></svg>",
      music: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%238b5cf6'/><circle cx='38' cy='62' r='12' fill='%23ffffff'/><circle cx='68' cy='52' r='12' fill='%23ffffff'/><rect x='46' y='24' width='8' height='38' fill='%23ffffff'/><rect x='76' y='14' width='8' height='38' fill='%23ffffff'/><polygon points='46,28 84,18 84,28 46,38' fill='%23ffffff'/></svg>",
"""
    if "manga:" not in content:
        content = content.replace('const APP_ICONS = {', 'const APP_ICONS = {' + app_icons_append)

    # 6. Add Stratus Cloud Games Category Pill in Arcade
    if 'data-cat="Stratus Cloud"' not in content:
        content = content.replace(
            '<div class="cat-pill active" data-cat="all">All Games (${GAMES_DATA.length})</div>',
            '<div class="cat-pill active" data-cat="all">All Games (${GAMES_DATA.length})</div>\n                  <div class="cat-pill" data-cat="Stratus Cloud">☁️ Stratus Cloud (225 AAA)</div>'
        )

    # 7. Add openApp implementations for manga, movies, music
    new_apps_impl = """
      } else if (appId === 'manga') {
        createWindow({
          id: 'manga',
          title: 'Godly Manga & Anime Reader [MangaDex v5 API]',
          icon: APP_ICONS.manga,
          width: 1040,
          height: 680,
          contentHtml: `
            <div class="manga-container" id="manga-app-root">
              <div class="manga-topbar">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <span style="font-size:14px; font-weight:800; color:#ec4899;">Godly Manga Reader</span>
                    <span style="font-size:10px; padding:2px 8px; border-radius:12px; background:rgba(236,72,153,0.2); color:#f472b6; border:1px solid rgba(236,72,153,0.4); margin-left:8px;">MangaDex API</span>
                  </div>
                  <input type="text" id="manga-search" placeholder="Search series, authors, tags..." class="search-input" style="width:240px;" />
                </div>
                <div class="category-pills" id="manga-tags" style="margin-top:4px;">
                  <div class="cat-pill active" onclick="filterManga('All')">All</div>
                  <div class="cat-pill" onclick="filterManga('Action')">Action</div>
                  <div class="cat-pill" onclick="filterManga('Fantasy')">Fantasy</div>
                  <div class="cat-pill" onclick="filterManga('Shounen')">Shounen</div>
                  <div class="cat-pill" onclick="filterManga('Dark Fantasy')">Dark Fantasy</div>
                  <div class="cat-pill" onclick="filterManga('Supernatural')">Supernatural</div>
                  <div class="cat-pill" onclick="filterManga('Comedy')">Comedy</div>
                </div>
              </div>
              <div class="media-card-grid" id="manga-grid"></div>
              <div id="manga-reader-modal" class="player-overlay" style="display:none;">
                <div class="player-header">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <button class="page-btn" onclick="closeMangaReader()">← Back to Library</button>
                    <span id="manga-reader-title" style="font-size:12px; font-weight:700;"></span>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <a id="manga-reader-ext" href="#" target="_blank" rel="noopener noreferrer" class="page-btn" style="text-decoration:none;">↗ MangaDex</a>
                    <button class="page-btn" onclick="closeMangaReader()">✕</button>
                  </div>
                </div>
                <iframe id="manga-reader-frame" class="game-frame" allow="fullscreen; autoplay; clipboard-read; clipboard-write"></iframe>
              </div>
            </div>
          `,
          onInit: setupMangaApp
        });
      } else if (appId === 'movies') {
        createWindow({
          id: 'movies',
          title: 'StreamFlix Cinema & TV [AutoEmbed & TMDB]',
          icon: APP_ICONS.movies,
          width: 1060,
          height: 700,
          contentHtml: `
            <div class="movies-container" id="movies-app-root">
              <div class="movies-topbar">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <span style="font-size:14px; font-weight:800; color:#e11d48;">StreamFlix Cinema</span>
                    <span style="font-size:10px; padding:2px 8px; border-radius:12px; background:rgba(225,29,72,0.2); color:#fb7185; border:1px solid rgba(225,29,72,0.4); margin-left:8px;">UltraHD 4K Streams</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:11px; color:#94a3b8;">Server:</span>
                    <select id="movie-server-select" class="page-btn" style="background:#0f111e; color:#fff;" onchange="changeMovieServer(this.value)">
                      <option value="autoembed">Server 1 (AutoEmbed)</option>
                      <option value="superembed">Server 2 (SuperEmbed)</option>
                      <option value="vidlink">Server 3 (VidLink Pro)</option>
                      <option value="2embed">Server 4 (2Embed CDN)</option>
                      <option value="vidsrc">Server 5 (VidSrc Direct)</option>
                    </select>
                    <input type="text" id="movies-search" placeholder="Search films, series..." class="search-input" style="width:200px;" />
                  </div>
                </div>
                <div class="category-pills" id="movies-filters" style="margin-top:4px;">
                  <div class="cat-pill active" onclick="filterMovies('All')">All Titles</div>
                  <div class="cat-pill" onclick="filterMovies('movie')">Feature Movies</div>
                  <div class="cat-pill" onclick="filterMovies('tv')">TV Series</div>
                  <div class="cat-pill" onclick="filterMovies('Sci-Fi')">Sci-Fi</div>
                  <div class="cat-pill" onclick="filterMovies('Action')">Action</div>
                  <div class="cat-pill" onclick="filterMovies('Drama')">Drama</div>
                </div>
              </div>
              <div class="media-card-grid" id="movies-grid"></div>
              <div id="movie-player-modal" class="player-overlay" style="display:none;">
                <div class="player-header">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <button class="page-btn" onclick="closeMoviePlayer()">← Back to Catalog</button>
                    <span id="movie-player-title" style="font-size:12px; font-weight:700; color:#fb7185;"></span>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div id="movie-tv-controls" style="display:none; align-items:center; gap:6px;">
                      <span style="font-size:11px; color:#94a3b8;">Season:</span>
                      <select id="movie-season-picker" class="page-btn" style="background:#0f111e; color:#fff;" onchange="updateTvStream()"></select>
                      <span style="font-size:11px; color:#94a3b8;">Episode:</span>
                      <select id="movie-episode-picker" class="page-btn" style="background:#0f111e; color:#fff;" onchange="updateTvStream()"></select>
                    </div>
                    <button class="page-btn" onclick="reloadMovieStream()">↻ Reload</button>
                    <button class="page-btn" onclick="closeMoviePlayer()">✕ Close</button>
                  </div>
                </div>
                <iframe id="movie-player-frame" class="game-frame" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen="true"></iframe>
              </div>
            </div>
          `,
          onInit: setupMoviesApp
        });
      } else if (appId === 'music') {
        createWindow({
          id: 'music',
          title: 'Stratus Music Studio [Hi-Fi Lossless Streams]',
          icon: APP_ICONS.music,
          width: 960,
          height: 640,
          contentHtml: `
            <div class="music-container" id="music-app-root">
              <div class="music-topbar">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <span style="font-size:14px; font-weight:800; color:#a855f7;">Stratus Music Studio</span>
                    <span style="font-size:10px; padding:2px 8px; border-radius:12px; background:rgba(168,85,247,0.2); color:#c084fc; border:1px solid rgba(168,85,247,0.4); margin-left:8px;">Lossless Audio</span>
                  </div>
                  <button class="page-btn" onclick="toggleCustomMusicPrompt()">+ Custom Stream URL</button>
                </div>
                <div id="custom-music-input-wrap" style="display:none; margin-top:6px; display:flex; gap:8px;">
                  <input type="text" id="custom-music-url" placeholder="Paste direct .mp3 / audio stream link..." class="search-input" style="flex:1;" />
                  <button class="page-btn" onclick="loadCustomMusicUrl()">Play Direct</button>
                </div>
                <div class="category-pills" id="music-stations" style="margin-top:4px;">
                  <div class="cat-pill active" onclick="switchMusicStation('all')">All Tracks</div>
                  <div class="cat-pill" onclick="switchMusicStation('Lofi Chill')">☕ Lofi Chill</div>
                  <div class="cat-pill" onclick="switchMusicStation('Synthwave')">⚡ Synthwave</div>
                  <div class="cat-pill" onclick="switchMusicStation('Chiptune')">👾 Chiptune 8-Bit</div>
                  <div class="cat-pill" onclick="switchMusicStation('Anime OST')">🌸 Anime OST</div>
                  <div class="cat-pill" onclick="switchMusicStation('Ambient')">🌌 Ambient Void</div>
                  <div class="cat-pill" onclick="switchMusicStation('Acoustic')">🎸 Acoustic</div>
                </div>
              </div>
              <div style="flex:1; display:flex; overflow:hidden;">
                <!-- Audio Player View -->
                <div class="audio-player-box">
                  <div class="album-art-wrap">
                    <img id="music-art" src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80" alt="Album Art" />
                  </div>
                  <div style="text-align:center; margin-bottom:18px;">
                    <div id="music-title" style="font-size:16px; font-weight:800; color:#fff;">Midnight Coffee & Starlight</div>
                    <div id="music-artist" style="font-size:12px; color:#c084fc; font-weight:600; margin-top:2px;">Lofi Celestial</div>
                    <div id="music-album" style="font-size:10px; color:#94a3b8; font-family:'JetBrains Mono', monospace; margin-top:2px;">Astral Chill Sessions • Lofi Chill</div>
                  </div>
                  <!-- Scrubber -->
                  <div style="width:100%; max-width:400px; display:flex; align-items:center; gap:8px; margin-bottom:16px;">
                    <span id="music-curr-time" style="font-size:10px; font-family:'JetBrains Mono', monospace; color:#94a3b8;">0:00</span>
                    <input type="range" id="music-scrub" min="0" max="100" value="0" style="flex:1; accent-color:#a855f7; height:4px;" oninput="seekMusicTrack(this.value)" />
                    <span id="music-total-time" style="font-size:10px; font-family:'JetBrains Mono', monospace; color:#94a3b8;">2:54</span>
                  </div>
                  <!-- Controls -->
                  <div style="display:flex; align-items:center; gap:16px;">
                    <button class="page-btn" onclick="prevMusicTrack()" style="border-radius:50%; width:36px; height:36px; padding:0;">⏮</button>
                    <button id="music-play-btn" onclick="togglePlayMusic()" style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg, #ec4899, #8b5cf6); border:none; color:#fff; font-size:20px; cursor:pointer; box-shadow:0 8px 24px rgba(168,85,247,0.5);">▶</button>
                    <button class="page-btn" onclick="nextMusicTrack()" style="border-radius:50%; width:36px; height:36px; padding:0;">⏭</button>
                  </div>
                  <div style="display:flex; align-items:center; gap:8px; margin-top:16px;">
                    <span style="font-size:12px;">🔊</span>
                    <input type="range" id="music-vol" min="0" max="1" step="0.05" value="0.8" style="width:90px; accent-color:#a855f7; height:4px;" oninput="setMusicVol(this.value)" />
                  </div>
                </div>
                <!-- Playlist Queue -->
                <div style="width:280px; border-left:1px solid rgba(255,255,255,0.08); background:#0c0d18; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:6px;" id="music-playlist-queue"></div>
              </div>
            </div>
          `,
          onInit: setupMusicApp
        });
"""
    if "appId === 'manga'" not in content:
        content = content.replace("} else if (appId === 'themes') {", new_apps_impl + "      } else if (appId === 'themes') {")

    # 8. Add JavaScript logic for Manga, Movies, Music, and Stratus Cloud Games
    js_logic_append = """
    // =========================================================================
    // Stratus Cloud Games + Manga + Movies + Music Data & Handlers
    // =========================================================================

    const MANGA_CATALOG = [
      { id: 'solo-leveling', title: 'Solo Leveling', rating: 9.8, chapters: 179, tags: ['Action', 'Fantasy'], author: 'Chugong & DUBU', cover: 'https://uploads.mangadex.org/covers/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/d814ec96-1c49-43c2-8fe0-c9771e8a4d46.jpg', url: 'https://mangadex.org/title/32d76d19-8a05-4db0-9fc2-e0b0648fe9d0/solo-leveling' },
      { id: 'one-piece', title: 'One Piece', rating: 9.9, chapters: 1130, tags: ['Action', 'Shounen'], author: 'Eiichiro Oda', cover: 'https://uploads.mangadex.org/covers/a1c7c817-4e59-43b7-9365-09675a149a6f/1d0a5148-18e0-47b2-b13c-53f08ca6fae6.jpg', url: 'https://mangadex.org/title/a1c7c817-4e59-43b7-9365-09675a149a6f/one-piece' },
      { id: 'jujutsu-kaisen', title: 'Jujutsu Kaisen', rating: 9.7, chapters: 271, tags: ['Action', 'Dark Fantasy'], author: 'Gege Akutami', cover: 'https://uploads.mangadex.org/covers/c52b2ce3-7f95-469c-96b0-479524fb7a1a/40b3341b-4395-4ef5-83e9-a3b04396b2ea.jpg', url: 'https://mangadex.org/title/c52b2ce3-7f95-469c-96b0-479524fb7a1a/jujutsu-kaisen' },
      { id: 'chainsaw-man', title: 'Chainsaw Man', rating: 9.6, chapters: 180, tags: ['Action', 'Dark Fantasy'], author: 'Tatsuki Fujimoto', cover: 'https://uploads.mangadex.org/covers/a77742c1-fda2-40e3-980a-019349ff7e28/97cf6741-285d-4f18-bb9d-922dfb420ee9.jpg', url: 'https://mangadex.org/title/a77742c1-fda2-40e3-980a-019349ff7e28/chainsaw-man' },
      { id: 'berserk', title: 'Berserk', rating: 10.0, chapters: 376, tags: ['Dark Fantasy'], author: 'Kentaro Miura', cover: 'https://uploads.mangadex.org/covers/801513ba-a712-498b-8f57-415b86f79b5f/2f3a4794-5cb8-477c-a496-e7e2c9066668.jpg', url: 'https://mangadex.org/title/801513ba-a712-498b-8f57-415b86f79b5f/berserk' },
      { id: 'dandadan', title: 'Dandadan', rating: 9.6, chapters: 172, tags: ['Action', 'Comedy'], author: 'Yukinobu Tatsu', cover: 'https://uploads.mangadex.org/covers/4e8b0906-897e-428b-ab29-430347607736/6f75db19-c1bb-45b7-a3cf-bc8bc4e86a5d.jpg', url: 'https://mangadex.org/title/4e8b0906-897e-428b-ab29-430347607736/dandadan' },
      { id: 'frieren', title: 'Frieren: Beyond Journey', rating: 9.8, chapters: 135, tags: ['Fantasy'], author: 'Kanehito Yamada', cover: 'https://uploads.mangadex.org/covers/b0b721ff-c388-4486-aa0f-c8b0e921824b/cb2e8318-774f-4d26-b186-b481615a6bfa.jpg', url: 'https://mangadex.org/title/b0b721ff-c388-4486-aa0f-c8b0e921824b/frieren-at-the-funeral' },
      { id: 'spy-x-family', title: 'Spy x Family', rating: 9.5, chapters: 105, tags: ['Comedy', 'Shounen'], author: 'Tatsuya Endo', cover: 'https://uploads.mangadex.org/covers/64562060-4965-4f46-993d-d557342721f4/ec48e7e1-8857-4186-b605-2b47e2ecdb34.jpg', url: 'https://mangadex.org/title/64562060-4965-4f46-993d-d557342721f4/spy-x-family' },
      { id: 'attack-on-titan', title: 'Attack on Titan', rating: 9.8, chapters: 139, tags: ['Action', 'Dark Fantasy'], author: 'Hajime Isayama', cover: 'https://uploads.mangadex.org/covers/30465500-98b3-43da-9eff-f9746e336e4f/bf0df841-ba95-4673-95b8-508bfae830d9.jpg', url: 'https://mangadex.org/title/30465500-98b3-43da-9eff-f9746e336e4f/attack-on-titan' },
      { id: 'demon-slayer', title: 'Demon Slayer', rating: 9.6, chapters: 205, tags: ['Action', 'Supernatural'], author: 'Koyoharu Gotouge', cover: 'https://uploads.mangadex.org/covers/0e227a92-f0b4-4b55-a22a-cf0a931327c1/a1d3fe6b-950c-4fa2-b25c-0cfbd6652cb6.jpg', url: 'https://mangadex.org/title/0e227a92-f0b4-4b55-a22a-cf0a931327c1/demon-slayer-kimetsu-no-yaiba' }
    ];

    const MOVIES_CATALOG = [
      { id: 'dune-2', tmdbId: 693134, title: 'Dune: Part Two', type: 'movie', rating: 8.6, year: 2024, poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', genres: ['Sci-Fi', 'Action'] },
      { id: 'deadpool-3', tmdbId: 533535, title: 'Deadpool & Wolverine', type: 'movie', rating: 8.1, year: 2024, poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', genres: ['Action', 'Comedy'] },
      { id: 'oppenheimer', tmdbId: 872585, title: 'Oppenheimer', type: 'movie', rating: 8.8, year: 2023, poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', genres: ['Drama', 'History'] },
      { id: 'spider-verse', tmdbId: 569094, title: 'Spider-Man: Across the Spider-Verse', type: 'movie', rating: 8.7, year: 2023, poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', genres: ['Animation', 'Action'] },
      { id: 'interstellar', tmdbId: 157336, title: 'Interstellar', type: 'movie', rating: 8.9, year: 2014, poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genres: ['Sci-Fi', 'Adventure'] },
      { id: 'stranger-things', tmdbId: 66732, title: 'Stranger Things', type: 'tv', rating: 8.7, year: 2016, poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', genres: ['Sci-Fi', 'Drama'], seasons: 4, eps: 9 },
      { id: 'last-of-us', tmdbId: 100088, title: 'The Last of Us', type: 'tv', rating: 8.8, year: 2023, poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7JMrRI.jpg', genres: ['Drama', 'Sci-Fi'], seasons: 1, eps: 9 },
      { id: 'arcane', tmdbId: 94605, title: 'Arcane', type: 'tv', rating: 9.0, year: 2021, poster: 'https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg', genres: ['Animation', 'Action'], seasons: 2, eps: 9 },
      { id: 'breaking-bad', tmdbId: 1396, title: 'Breaking Bad', type: 'tv', rating: 9.5, year: 2008, poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', genres: ['Drama', 'Crime'], seasons: 5, eps: 16 },
      { id: 'the-boys', tmdbId: 76479, title: 'The Boys', type: 'tv', rating: 8.6, year: 2019, poster: 'https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg', genres: ['Sci-Fi', 'Action'], seasons: 4, eps: 8 }
    ];

    const MUSIC_CATALOG = [
      { id: 'lofi-1', title: 'Midnight Coffee & Starlight', artist: 'Lofi Celestial', album: 'Astral Chill Sessions', duration: 174, cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3', genre: 'Lofi Chill' },
      { id: 'synth-1', title: 'Neon Horizon 2099', artist: 'CyberMatrix', album: 'Megacity Syndicate', duration: 218, cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=cyberpunk-2099-10701.mp3', genre: 'Synthwave' },
      { id: 'chip-1', title: 'Level 99 Boss Fight', artist: 'Chiptune Brigade', album: '8-Bit Odyssey', duration: 156, cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=80', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=retro-game-arcade-236130.mp3', genre: 'Chiptune' },
      { id: 'anime-1', title: 'Limit Break Awakening', artist: 'Kenji Takahashi', album: 'Shounen Symphony', duration: 195, cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80', url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c93a0a38b5.mp3?filename=action-rock-124673.mp3', genre: 'Anime OST' },
      { id: 'amb-1', title: 'Cosmic Drift & Nebula Meditation', artist: 'Astral Frequency', album: 'Ethereal Planes', duration: 242, cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80', url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_9242967117.mp3?filename=space-ambient-meditation-10114.mp3', genre: 'Ambient' },
      { id: 'acoust-1', title: 'Golden Hour Reflections', artist: 'Ember & Strings', album: 'Acoustic Sanctuary', duration: 168, cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80', url: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1e01.mp3?filename=acoustic-guitars-ambient-chill-10762.mp3', genre: 'Acoustic' }
    ];

    // Global Single-HTML Audio Element
    let gAudio = null;
    let gCurrentMusicIndex = 0;
    let gIsPlayingMusic = false;

    function setupMangaApp(el) {
      const grid = el.querySelector('#manga-grid');
      const search = el.querySelector('#manga-search');
      let currentFilter = 'All';

      function render(query = '') {
        grid.innerHTML = '';
        const list = MANGA_CATALOG.filter(m => {
          const matchTag = currentFilter === 'All' || m.tags.includes(currentFilter);
          const matchQ = !query || m.title.toLowerCase().includes(query.toLowerCase()) || m.author.toLowerCase().includes(query.toLowerCase());
          return matchTag && matchQ;
        });

        list.forEach(m => {
          const card = document.createElement('div');
          card.className = 'media-card';
          card.innerHTML = `
            <div class="media-card-poster">
              <img src="${m.cover}" alt="${m.title}" loading="lazy" />
              <div style="position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.2); font-size:9px; font-weight:700; color:#fde047; padding:1px 6px; border-radius:6px;">★ ${m.rating}</div>
            </div>
            <div class="media-card-info">
              <div class="media-card-title">${m.title}</div>
              <div class="media-card-subtitle">
                <span>${m.chapters} Chs</span>
                <span>${m.tags[0]}</span>
              </div>
            </div>
          `;
          card.onclick = () => {
            const modal = el.querySelector('#manga-reader-modal');
            const frame = el.querySelector('#manga-reader-frame');
            const title = el.querySelector('#manga-reader-title');
            const ext = el.querySelector('#manga-reader-ext');
            title.textContent = `${m.title} - MangaDex v5`;
            ext.href = m.url;
            frame.src = m.url;
            modal.style.display = 'flex';
          };
          grid.appendChild(card);
        });
      }

      window.filterManga = (tag) => {
        currentFilter = tag;
        el.querySelectorAll('#manga-tags .cat-pill').forEach(p => p.classList.toggle('active', p.textContent === tag));
        render(search.value);
      };

      window.closeMangaReader = () => {
        const modal = el.querySelector('#manga-reader-modal');
        const frame = el.querySelector('#manga-reader-frame');
        modal.style.display = 'none';
        frame.src = 'about:blank';
      };

      search.addEventListener('input', (e) => render(e.target.value));
      render();
    }

    function setupMoviesApp(el) {
      const grid = el.querySelector('#movies-grid');
      const search = el.querySelector('#movies-search');
      let currentFilter = 'All';
      let activeMovie = null;
      let activeServer = 'autoembed';

      function render(query = '') {
        grid.innerHTML = '';
        const list = MOVIES_CATALOG.filter(m => {
          const matchF = currentFilter === 'All' || m.type === currentFilter || m.genres.includes(currentFilter);
          const matchQ = !query || m.title.toLowerCase().includes(query.toLowerCase());
          return matchF && matchQ;
        });

        list.forEach(m => {
          const card = document.createElement('div');
          card.className = 'media-card';
          card.innerHTML = `
            <div class="media-card-poster">
              <img src="${m.poster}" alt="${m.title}" loading="lazy" />
              <div style="position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.2); font-size:9px; font-weight:700; color:#fb7185; padding:1px 6px; border-radius:6px; text-transform:uppercase;">${m.type}</div>
            </div>
            <div class="media-card-info">
              <div class="media-card-title">${m.title}</div>
              <div class="media-card-subtitle">
                <span>${m.year}</span>
                <span style="color:#fde047;">★ ${m.rating}</span>
              </div>
            </div>
          `;
          card.onclick = () => {
            activeMovie = m;
            playMedia(m);
          };
          grid.appendChild(card);
        });
      }

      function getStreamUrl(m, s = 1, e = 1) {
        if (activeServer === 'superembed') {
          return `https://multiembed.mov/?video_id=${m.tmdbId}&tmdb=1${m.type === 'tv' ? `&s=${s}&e=${e}` : ''}`;
        } else if (activeServer === 'vidlink') {
          return `https://vidlink.pro/${m.type}/${m.tmdbId}${m.type === 'tv' ? `/${s}/${e}` : ''}`;
        } else if (activeServer === '2embed') {
          return `https://www.2embed.cc/embed/${m.type === 'tv' ? 'tv/' : ''}${m.tmdbId}${m.type === 'tv' ? `&s=${s}&e=${e}` : ''}`;
        } else if (activeServer === 'vidsrc') {
          return `https://vidsrc.to/embed/${m.type}/${m.tmdbId}${m.type === 'tv' ? `/${s}/${e}` : ''}`;
        }
        return `https://player.autoembed.cc/embed/${m.type}/${m.tmdbId}${m.type === 'tv' ? `/${s}/${e}` : ''}`;
      }

      function playMedia(m) {
        const modal = el.querySelector('#movie-player-modal');
        const frame = el.querySelector('#movie-player-frame');
        const title = el.querySelector('#movie-player-title');
        const tvControls = el.querySelector('#movie-tv-controls');
        const sPick = el.querySelector('#movie-season-picker');
        const ePick = el.querySelector('#movie-episode-picker');

        title.textContent = `${m.title} (${m.year}) - 4K Stream`;

        if (m.type === 'tv') {
          tvControls.style.display = 'flex';
          sPick.innerHTML = '';
          for (let s = 1; s <= (m.seasons || 1); s++) {
            sPick.innerHTML += `<option value="${s}">S${s}</option>`;
          }
          ePick.innerHTML = '';
          for (let ep = 1; ep <= (m.eps || 8); ep++) {
            ePick.innerHTML += `<option value="${ep}">Ep ${ep}</option>`;
          }
          frame.src = getStreamUrl(m, 1, 1);
        } else {
          tvControls.style.display = 'none';
          frame.src = getStreamUrl(m);
        }

        modal.style.display = 'flex';
      }

      window.filterMovies = (f) => {
        currentFilter = f;
        render(search.value);
      };

      window.changeMovieServer = (srv) => {
        activeServer = srv;
        if (activeMovie) {
          const s = el.querySelector('#movie-season-picker').value || 1;
          const e = el.querySelector('#movie-episode-picker').value || 1;
          el.querySelector('#movie-player-frame').src = getStreamUrl(activeMovie, s, e);
        }
      };

      window.updateTvStream = () => {
        if (!activeMovie) return;
        const s = el.querySelector('#movie-season-picker').value || 1;
        const e = el.querySelector('#movie-episode-picker').value || 1;
        el.querySelector('#movie-player-frame').src = getStreamUrl(activeMovie, s, e);
      };

      window.reloadMovieStream = () => {
        const frame = el.querySelector('#movie-player-frame');
        const src = frame.src;
        frame.src = 'about:blank';
        setTimeout(() => { frame.src = src; }, 100);
      };

      window.closeMoviePlayer = () => {
        const modal = el.querySelector('#movie-player-modal');
        const frame = el.querySelector('#movie-player-frame');
        modal.style.display = 'none';
        frame.src = 'about:blank';
      };

      search.addEventListener('input', (e) => render(e.target.value));
      render();
    }

    function setupMusicApp(el) {
      if (!gAudio) {
        gAudio = new Audio();
      }

      const art = el.querySelector('#music-art');
      const title = el.querySelector('#music-title');
      const artist = el.querySelector('#music-artist');
      const album = el.querySelector('#music-album');
      const scrub = el.querySelector('#music-scrub');
      const currTime = el.querySelector('#music-curr-time');
      const totalTime = el.querySelector('#music-total-time');
      const playBtn = el.querySelector('#music-play-btn');
      const queue = el.querySelector('#music-playlist-queue');
      let currentFilter = 'all';

      function formatTime(s) {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
      }

      function loadTrack(idx, autoPlay = true) {
        gCurrentMusicIndex = (idx + MUSIC_CATALOG.length) % MUSIC_CATALOG.length;
        const t = MUSIC_CATALOG[gCurrentMusicIndex];
        art.src = t.cover;
        title.textContent = t.title;
        artist.textContent = t.artist;
        album.textContent = `${t.album} • ${t.genre}`;
        gAudio.src = t.url;
        scrub.value = 0;
        currTime.textContent = '0:00';
        totalTime.textContent = formatTime(t.duration);

        if (autoPlay) {
          gAudio.play().then(() => {
            gIsPlayingMusic = true;
            playBtn.textContent = '⏸';
          }).catch(() => {
            gIsPlayingMusic = false;
            playBtn.textContent = '▶';
          });
        }
        renderQueue();
      }

      function renderQueue() {
        queue.innerHTML = '<div style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:4px;">Up Next in Queue</div>';
        const list = MUSIC_CATALOG.filter(t => currentFilter === 'all' || t.genre === currentFilter);
        list.forEach((t, i) => {
          const isCurr = MUSIC_CATALOG[gCurrentMusicIndex].id === t.id;
          const item = document.createElement('div');
          item.style.cssText = `padding:8px; border-radius:10px; cursor:pointer; background:${isCurr ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${isCurr ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.05)'}; display:flex; align-items:center; gap:8px;`;
          item.innerHTML = `
            <img src="${t.cover}" style="width:32px; height:32px; border-radius:6px; object-fit:cover;" />
            <div style="flex:1; overflow:hidden;">
              <div style="font-size:11px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.title}</div>
              <div style="font-size:9px; color:#94a3b8;">${t.artist}</div>
            </div>
            <span style="font-size:9px; color:#64748b; font-family:'JetBrains Mono',monospace;">${formatTime(t.duration)}</span>
          `;
          item.onclick = () => {
            const actualIdx = MUSIC_CATALOG.findIndex(x => x.id === t.id);
            loadTrack(actualIdx, true);
          };
          queue.appendChild(item);
        });
      }

      gAudio.ontimeupdate = () => {
        if (!gAudio.duration) return;
        scrub.value = (gAudio.currentTime / gAudio.duration) * 100;
        currTime.textContent = formatTime(gAudio.currentTime);
        totalTime.textContent = formatTime(gAudio.duration);
      };

      gAudio.onended = () => {
        nextMusicTrack();
      };

      window.togglePlayMusic = () => {
        if (!gAudio.src) {
          loadTrack(0, true);
          return;
        }
        if (gIsPlayingMusic) {
          gAudio.pause();
          gIsPlayingMusic = false;
          playBtn.textContent = '▶';
        } else {
          gAudio.play();
          gIsPlayingMusic = true;
          playBtn.textContent = '⏸';
        }
      };

      window.nextMusicTrack = () => loadTrack(gCurrentMusicIndex + 1, true);
      window.prevMusicTrack = () => loadTrack(gCurrentMusicIndex - 1, true);

      window.seekMusicTrack = (val) => {
        if (gAudio && gAudio.duration) {
          gAudio.currentTime = (val / 100) * gAudio.duration;
        }
      };

      window.setMusicVol = (v) => {
        if (gAudio) gAudio.volume = Number(v);
      };

      window.switchMusicStation = (st) => {
        currentFilter = st;
        renderQueue();
      };

      window.toggleCustomMusicPrompt = () => {
        const wrap = el.querySelector('#custom-music-input-wrap');
        wrap.style.display = wrap.style.display === 'none' ? 'flex' : 'none';
      };

      window.loadCustomMusicUrl = () => {
        const url = el.querySelector('#custom-music-url').value.trim();
        if (!url) return;
        const customTrack = {
          id: `custom-${Date.now()}`,
          title: 'Custom Audio Stream',
          artist: 'Web Live Source',
          album: 'Direct Stream',
          duration: 300,
          cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
          url: url,
          genre: 'Custom'
        };
        MUSIC_CATALOG.unshift(customTrack);
        loadTrack(0, true);
      };

      loadTrack(0, false);
    }
"""

    if '// Stratus Cloud Games + Manga + Movies + Music Data & Handlers' not in content:
        content = content.replace('// Open App Handler', js_logic_append + '\n    // Open App Handler')

    # 9. Append the 225 Stratus Cloud Games into GAMES_DATA
    with open('public/stratus_cloud_games.json', 'r', encoding='utf-8') as f:
        cloud_games = json.load(f)

    converted_cloud_games = []
    for g in cloud_games:
        converted_cloud_games.append({
            "id": "stratus_" + g["game_key"],
            "title": g["name"],
            "url": "https://www.raccoongame.com/#/game-detail?gameKey=" + g["game_key"],
            "cover": g["cover"] or g["image"],
            "category": "Stratus Cloud",
            "author": "Stratus Cloud / " + (g["tags"][0] if g["tags"] else "3A")
        })

    # Check if stratus_ already in GAMES_DATA
    if 'stratus_' not in content:
        cloud_json_str = json.dumps(converted_cloud_games)
        # remove outer brackets to append
        inner_items = cloud_json_str[1:-1]
        content = content.replace('const GAMES_DATA = [', 'const GAMES_DATA = [' + inner_items + ',')
        print(f"Appended {len(converted_cloud_games)} Stratus Cloud Games to GAMES_DATA!")

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully updated {filepath}!")

if __name__ == '__main__':
    update_file('Single Html | Svg/index.html')
    update_file('Single Html | Svg/godly_games_edition.html')
