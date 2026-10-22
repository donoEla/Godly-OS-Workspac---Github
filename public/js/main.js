// Godly OS Local Games Companion Script
// Provides polyfills and safe environment setup for legacy canvas and web games
(function() {
  if (typeof window !== 'undefined') {
    window.__GODLY_GAME_COMPANION__ = true;
  }
})();
