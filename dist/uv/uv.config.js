(() => {
    let uvPfx = "/uv/";
    let loc = "";

    // 1. Detect jsDelivr context and base directory
    let href = "";
    if (typeof document !== "undefined" && document.baseURI && !document.baseURI.startsWith("about:")) {
        href = document.baseURI;
    } else if (typeof self !== "undefined" && self.location && !self.location.href.startsWith("about:")) {
        href = self.location.href;
    }

    if (href && href.includes("cdn.jsdelivr.net")) {
        const m = href.match(/cdn\.jsdelivr\.net(\/gh\/[^/]+\/[^/@]+(?:@[^/]+)?(?:\/dist)?)/i);
        if (m) {
            loc = m[1].replace(/\/$/, "");
            if (!loc.endsWith("/dist")) {
                loc += "/dist";
            }
        } else {
            loc = "/gh/donoEla/Godly-OS-Workspac---Github@main/dist";
        }
    } else {
        const pathname = typeof self !== "undefined" && self.location ? self.location.pathname : "";
        loc = pathname.includes(uvPfx)
            ? pathname.substring(0, pathname.indexOf(uvPfx))
            : pathname.substring(0, pathname.lastIndexOf("/"));
    }

    loc = (loc || "").replace(/\/$/, "");
    let fullPrefix = loc + uvPfx + "service/";

    self.__uv$config = {
        prefix: fullPrefix,
        encodeUrl: typeof Ultraviolet !== "undefined" && Ultraviolet.codec?.xor?.encode 
            ? Ultraviolet.codec.xor.encode 
            : (str) => encodeURIComponent(str.split("").map((c, i) => i % 2 ? String.fromCharCode(c.charCodeAt(0) ^ 2) : c).join("")),
        decodeUrl: typeof Ultraviolet !== "undefined" && Ultraviolet.codec?.xor?.decode 
            ? Ultraviolet.codec.xor.decode 
            : (str) => decodeURIComponent(str).split("").map((c, i) => i % 2 ? String.fromCharCode(c.charCodeAt(0) ^ 2) : c).join(""),
        handler: loc + uvPfx + "uv.handler.js",
        client: loc + uvPfx + "uv.client.js",
        bundle: loc + uvPfx + "uv.bundle.js",
        config: loc + uvPfx + "uv.config.js",
        sw: loc + uvPfx + "uv.sw.js",
        stockSW: loc + uvPfx + "sw.js",
        loc: loc,
    };
})();
