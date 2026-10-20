(() => {
    let uvPfx = "/uv/";
    // check if config is loaded in context of service worker or not
    let loc = self.location.pathname.includes(uvPfx)
        ? self.location.pathname.substring(
              0,
              self.location.pathname.indexOf(uvPfx),
          )
        : self.location.pathname.substring(
              0,
              self.location.pathname.lastIndexOf("/"),
          );

    let fullPrefix = (loc ? loc : "") + uvPfx + "service/";

    self.__uv$config = {
        prefix: fullPrefix,
        encodeUrl: Ultraviolet.codec.xor.encode,
        decodeUrl: Ultraviolet.codec.xor.decode,
        handler: (loc ? loc : "") + uvPfx + "uv.handler.js",
        client: (loc ? loc : "") + uvPfx + "uv.client.js",
        bundle: (loc ? loc : "") + uvPfx + "uv.bundle.js",
        config: (loc ? loc : "") + uvPfx + "uv.config.js",
        sw: (loc ? loc : "") + uvPfx + "uv.sw.js",
        stockSW: (loc ? loc : "") + uvPfx + "sw.js",
        loc: loc,
    };
})();
