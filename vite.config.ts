import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import http from 'node:http'
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'

// Allow self-signed and internal certificates for proxied destinations like watch.streamflix.one
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

function godlyOsProxyPlugin(): Plugin {
  return {
    name: 'godly-os-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const reqUrl = req.url || '/'

        // Direct local games vault streaming from /home/dono/Downloads/Game Files
        if (reqUrl.startsWith('/local-games/')) {
          try {
            const cleanReq = reqUrl.split('?')[0].split('#')[0]
            const relPath = decodeURIComponent(cleanReq.replace('/local-games/', ''))
            const safePath = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '')
            const fullPath = path.join('/home/dono/Downloads/Game Files', safePath)
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8')
              res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless')
              res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
              fs.createReadStream(fullPath).pipe(res)
              return
            }
          } catch (e) {
            console.warn('Local game serve error:', e)
          }
          res.statusCode = 404
          res.end('Game not found')
          return
        }

        const hostHeader = (req.headers.host || '').toLowerCase()
        const refererHeader = (req.headers.referer || '').toLowerCase()

        // Detect if request is explicitly for proxy, or a subresource from nowgg.fun / ip.localhost
        const isProxyRoute = reqUrl.startsWith('/os-proxy') || reqUrl.startsWith('/os-proxy-backend')
        const isNowGgHost = hostHeader.includes('ip.localhost') || hostHeader.includes('nowgg')
        const isNowGgSubresource = reqUrl.startsWith('/apps/') || reqUrl.startsWith('/img/') || reqUrl.startsWith('/css/')

        // Check if this is an asset request from a page proxied by /os-proxy
        const isLocalOsAsset =
          reqUrl.startsWith('/src/') ||
          reqUrl.startsWith('/@') ||
          reqUrl.startsWith('/node_modules/') ||
          reqUrl.startsWith('/assets/') ||
          reqUrl.startsWith('/uv/') ||
          reqUrl.startsWith('/baremux/') ||
          reqUrl.startsWith('/libcurl/') ||
          reqUrl.startsWith('/favicon.ico') ||
          reqUrl === '/'

        const isReferencedByProxy =
          !isLocalOsAsset &&
          (refererHeader.includes('/os-proxy?url=') || refererHeader.includes('/uv/service/'))

        if (!isProxyRoute && !isNowGgHost && !isNowGgSubresource && !isReferencedByProxy) {
          return next()
        }

        try {
          const fullUrl = new URL(reqUrl, 'http://localhost:5173')
          let targetUrl = fullUrl.searchParams.get('url')

          // If it was a direct subresource (e.g. /apps/... or /img/...)
          if (!targetUrl && (isNowGgHost || isNowGgSubresource)) {
            targetUrl = `https://nowgg.fun${reqUrl}`
          }

          // If it was a subresource from a proxied page (e.g. Next.js /_next/ or /api/ on StreamFlix)
          if (!targetUrl && isReferencedByProxy && refererHeader) {
            try {
              if (refererHeader.includes('/os-proxy?url=')) {
                const refParsed = new URL(refererHeader)
                const parentUrl = refParsed.searchParams.get('url')
                if (parentUrl) {
                  const parentOrigin = new URL(parentUrl).origin
                  targetUrl = new URL(reqUrl, parentOrigin).toString()
                }
              }
            } catch {}
          }

          if (!targetUrl) {
            return next()
          }

          // Enforce nowgg.fun NOT now.gg
          let effectiveUrl = targetUrl
          if (effectiveUrl.includes('now.gg')) {
            effectiveUrl = effectiveUrl.replace(/now\.gg/g, 'nowgg.fun')
          }

          let parsedTarget: URL
          try {
            parsedTarget = new URL(effectiveUrl)
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'text/plain')
            res.end(`Godly OS Proxy: Invalid URL "${effectiveUrl}"`)
            return
          }

          if (parsedTarget.hostname.endsWith('now.gg')) {
            parsedTarget.hostname = parsedTarget.hostname.replace('now.gg', 'nowgg.fun')
            effectiveUrl = parsedTarget.toString()
          }

          const isNowGG = parsedTarget.hostname.includes('nowgg.fun')
          const isStreamFlix = parsedTarget.hostname.includes('streamflix.one')
          const isOctave = parsedTarget.hostname.includes('octavestreaming.com')
          const client = parsedTarget.protocol === 'https:' ? https : http

          const requestHeaders: Record<string, string> = {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 GodlyOS/2.5',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          }

          if (isNowGG) {
            requestHeaders['Referer'] = 'https://nowgg.fun/'
            requestHeaders['Origin'] = 'https://nowgg.fun'
          } else if (isStreamFlix) {
            requestHeaders['Referer'] = 'https://watch.streamflix.one/'
            requestHeaders['Origin'] = 'https://watch.streamflix.one'
          } else if (isOctave) {
            requestHeaders['Referer'] = 'https://octavestreaming.com/'
            requestHeaders['Origin'] = 'https://octavestreaming.com'
          }

          const proxyAgent = parsedTarget.protocol === 'https:' ? new https.Agent({ rejectUnauthorized: false }) : undefined

          const proxyReq = client.request(
            effectiveUrl,
            {
              method: req.method || 'GET',
              headers: requestHeaders,
              rejectUnauthorized: false,
              agent: proxyAgent,
            },
            (remoteRes) => {
              // Strip headers that break HTTP or enforce HTTPS / framing blocks
              const headers: Record<string, string | string[]> = {}
              for (const [key, val] of Object.entries(remoteRes.headers)) {
                const lower = key.toLowerCase()
                if (
                  lower === 'x-frame-options' ||
                  lower === 'content-security-policy' ||
                  lower === 'content-security-policy-report-only' ||
                  lower === 'strict-transport-security' ||
                  lower === 'alt-svc' ||
                  lower === 'x-content-type-options' ||
                  lower === 'cross-origin-embedder-policy' ||
                  lower === 'cross-origin-opener-policy' ||
                  lower === 'cross-origin-resource-policy'
                ) {
                  continue
                }
                if (val !== undefined) headers[key] = val
              }

              headers['access-control-allow-origin'] = '*'
              headers['access-control-allow-methods'] = 'GET, POST, OPTIONS'
              headers['access-control-allow-headers'] = '*'
              headers['x-godly-proxy'] = 'service-worker-tunnel'

              // Handle remote HTTP redirects
              if (
                remoteRes.statusCode &&
                [301, 302, 303, 307, 308].includes(remoteRes.statusCode) &&
                remoteRes.headers.location
              ) {
                const redirectLocation = new URL(remoteRes.headers.location, effectiveUrl).toString()
                res.writeHead(302, {
                  Location: `/os-proxy?url=${encodeURIComponent(redirectLocation)}`,
                  'Access-Control-Allow-Origin': '*',
                })
                res.end()
                return
              }

              const rawContentType = (remoteRes.headers['content-type'] || '').toLowerCase()
              const isHtml =
                rawContentType.includes('text/html') ||
                effectiveUrl.endsWith('.html') ||
                effectiveUrl.includes('/html/') ||
                (rawContentType.includes('text/plain') && (effectiveUrl.endsWith('.html') || effectiveUrl.includes('freebuisness') || effectiveUrl.includes('Replku')));

              if (isHtml) {
                headers['content-type'] = 'text/html; charset=utf-8'
                delete headers['x-content-type-options']

                // Buffer HTML to neutralize rogue HTTPS redirects and inject base href
                const chunks: Buffer[] = []
                remoteRes.on('data', (c) => chunks.push(c))
                remoteRes.on('end', () => {
                  let html = Buffer.concat(chunks).toString('utf-8')

                  // 1. Route nowgg.fun https://${prefix}.ip.${window.location.host} through /os-proxy
                  html = html.replace(
                    /https:\/\/\$\{sessionStorage\.getItem\("prefix"\)\}\.ip\.\$\{window\.location\.host\}[^`"']*/g,
                    () => {
                      return `/os-proxy?url=${encodeURIComponent('https://172.ip.nowgg.fun/apps/roblox-corporation/5349/roblox.html')}`
                    }
                  )
                  html = html.replace(
                    /https:\/\/\$\{[^}]+\}\.ip\.\$\{window\.location\.host\}[^`"']*/g,
                    () => {
                      return `/os-proxy?url=${encodeURIComponent('https://172.ip.nowgg.fun/apps/roblox-corporation/5349/roblox.html')}`
                    }
                  )

                  // 2. Prevent window.location.host being evaluated as localhost:5173 inside remote scripts
                  html = html.replace(/\$\{window\.location\.host\}/g, 'nowgg.fun')
                  html = html.replace(/window\.location\.host/g, '"nowgg.fun"')

                  // 3. Route hardcoded window.location navigations into /os-proxy
                  html = html.replace(
                    /window\.location\.href\s*=\s*`https:\/\/([^`]+)`/g,
                    (_match, urlPart) => {
                      return `window.location.href = '/os-proxy?url=' + encodeURIComponent('https://' + \`${urlPart}\`)`
                    }
                  )
                  html = html.replace(
                    /window\.location\.replace\(`https:\/\/([^`]+)`\)/g,
                    (_match, urlPart) => {
                      return `window.location.replace('/os-proxy?url=' + encodeURIComponent('https://' + \`${urlPart}\`))`
                    }
                  )

                  // 4. Inject base tag for relative assets
                  const baseTag = `<base href="${effectiveUrl}">`
                  if (!html.includes('<base ') && !html.includes('<BASE ')) {
                    if (html.includes('<head>')) {
                      html = html.replace('<head>', `<head>${baseTag}`)
                    } else if (html.includes('<HEAD>')) {
                      html = html.replace('<HEAD>', `<HEAD>${baseTag}`)
                    } else {
                      html = `${baseTag}${html}`
                    }
                  }

                  res.writeHead(remoteRes.statusCode || 200, headers)
                  res.end(html)
                })
              } else {
                // Pipe binary or non-HTML directly
                res.writeHead(remoteRes.statusCode || 200, headers)
                remoteRes.pipe(res)
              }
            }
          )

          proxyReq.on('error', (err) => {
            res.writeHead(502, { 'Content-Type': 'text/html' })
            res.end(`
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { margin: 0; background: #0b0f19; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; }
                  .box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; max-width: 500px; }
                  h2 { color: #f43f5e; margin-top: 0; font-size: 18px; }
                  p { color: #94a3b8; font-size: 13px; line-height: 1.6; }
                  code { background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px; color: #c084fc; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="box">
                  <h2>Godly OS Proxy Tunnel Notice</h2>
                  <p>Target URL: <code>${targetUrl}</code></p>
                  <p>The host server could not be reached via proxy tunnel: ${err.message}</p>
                </div>
              </body>
              </html>
            `)
          })

          if (req.method === 'POST') {
            req.pipe(proxyReq)
          } else {
            proxyReq.end()
          }
        } catch (err: any) {
          res.statusCode = 500
          res.end(`Proxy internal error: ${err.message}`)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), godlyOsProxyPlugin()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
})
