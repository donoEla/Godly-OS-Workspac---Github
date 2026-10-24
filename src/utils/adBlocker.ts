/**
 * Godly OS AdBlock & Privacy Shield Engine
 * Intercepts ad scripts and cosmetic elements using MutationObserver
 * and inline EasyList-style rules.
 */

// Bundled CSS selectors for cosmetic hiding of ad units and banners
export const COSMETIC_AD_SELECTORS = [
  '.adsbygoogle',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googlesyndication"]',
  'iframe[src*="adnxs"]',
  'iframe[src*="amazon-adsystem"]',
  'div[id^="ad-"]',
  'div[id^="google_ads_"]',
  'div[class*="ad-banner"]',
  'div[class*="sponsor"]',
  'div[class*="advertisement"]',
  'div[class*="ad-slot"]',
  'div[class*="ad-container"]',
  'div[data-ad-unit]',
  'aside[id*="ad"]',
  'ins.adsbygoogle',
  '.taboola',
  '.outbrain',
];

// URL fragments matching tracking scripts and telemetry
export const BLOCKED_SCRIPT_PATTERNS = [
  'google-analytics.com',
  'googletagmanager.com/gtag/js',
  'doubleclick.net',
  'adnxs.com',
  'adservice.google.',
  'pagead2.googlesyndication.com',
  'amazon-adsystem.com',
  'criteo.net',
  'scorecardresearch.com',
  'quantserve.com',
  'taboola.com',
  'outbrain.com',
];

const WHITELIST_KEY = 'godly_adblock_whitelist';

export class AdBlockShield {
  private static instance: AdBlockShield;
  private blockedCountMap: Map<string, number> = new Map();
  private whitelist: Set<string> = new Set();
  private observer: MutationObserver | null = null;
  private isEnabled: boolean = true;

  private constructor() {
    this.loadWhitelist();
  }

  public static getInstance(): AdBlockShield {
    if (!AdBlockShield.instance) {
      AdBlockShield.instance = new AdBlockShield();
    }
    return AdBlockShield.instance;
  }

  private loadWhitelist() {
    try {
      const saved = localStorage.getItem(WHITELIST_KEY);
      if (saved) {
        this.whitelist = new Set(JSON.parse(saved));
      }
    } catch {}
  }

  public saveWhitelist() {
    try {
      localStorage.setItem(WHITELIST_KEY, JSON.stringify(Array.from(this.whitelist)));
    } catch {}
  }

  public isWhitelisted(hostname: string): boolean {
    const cleanHost = hostname.replace(/^www\./, '').toLowerCase();
    return this.whitelist.has(cleanHost);
  }

  public toggleWhitelist(hostname: string): boolean {
    const cleanHost = hostname.replace(/^www\./, '').toLowerCase();
    if (this.whitelist.has(cleanHost)) {
      this.whitelist.delete(cleanHost);
    } else {
      this.whitelist.add(cleanHost);
    }
    this.saveWhitelist();
    return this.isWhitelisted(cleanHost);
  }

  public getBlockedCount(hostname: string): number {
    return this.blockedCountMap.get(hostname) || 0;
  }

  public resetBlockedCount(hostname: string) {
    this.blockedCountMap.set(hostname, 0);
  }

  public incrementBlockedCount(hostname: string, amount: number = 1) {
    const current = this.getBlockedCount(hostname);
    this.blockedCountMap.set(hostname, current + amount);
  }

  /**
   * Generates a CSS injection stylesheet for cosmetic ad element suppression.
   */
  public getCosmeticStyleSheet(): string {
    return `
      ${COSMETIC_AD_SELECTORS.join(',\n')} {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }
    `;
  }

  /**
   * Checks whether a script URL should be intercepted and blocked.
   */
  public shouldBlockScript(src: string): boolean {
    if (!src) return false;
    const lower = src.toLowerCase();
    return BLOCKED_SCRIPT_PATTERNS.some((pattern) => lower.includes(pattern));
  }

  /**
   * Scans a target document or element, removes blocked scripts, and counts blocked ads.
   */
  public scanAndPurge(doc: Document, hostname: string): number {
    if (this.isWhitelisted(hostname)) return 0;

    let blocked = 0;

    // 1. Intercept & strip script nodes
    const scripts = doc.querySelectorAll('script[src]');
    scripts.forEach((script) => {
      const src = script.getAttribute('src') || '';
      if (this.shouldBlockScript(src)) {
        script.remove();
        blocked++;
      }
    });

    // 2. Hide cosmetic ad elements
    try {
      const adElements = doc.querySelectorAll(COSMETIC_AD_SELECTORS.join(','));
      adElements.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
        blocked++;
      });
    } catch {}

    if (blocked > 0) {
      this.incrementBlockedCount(hostname, blocked);
    }

    return blocked;
  }

  /**
   * Attaches a MutationObserver to an iframe's content document to catch dynamically injected ads.
   */
  public observeIframe(iframe: HTMLIFrameElement, hostname: string) {
    if (this.isWhitelisted(hostname)) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      // Inject cosmetic stylesheet
      let style = doc.getElementById('godly-adblock-shield') as HTMLStyleElement;
      if (!style) {
        style = doc.createElement('style');
        style.id = 'godly-adblock-shield';
        style.textContent = this.getCosmeticStyleSheet();
        doc.head?.appendChild(style);
      }

      this.scanAndPurge(doc, hostname);

      const observer = new MutationObserver(() => {
        this.scanAndPurge(doc, hostname);
      });

      observer.observe(doc.body || doc.documentElement, {
        childList: true,
        subtree: true,
      });
    } catch {
      // Cross-origin iframe limitations are handled via SW / proxy filtering
    }
  }
}

export const adBlockShield = AdBlockShield.getInstance();
