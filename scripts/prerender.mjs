/**
 * Post-build script that generates pre-rendered HTML pages for SEO.
 * Creates individual HTML files for each tool and blog page with
 * proper meta tags, structured data, and static content so search
 * engine crawlers see real content without executing JavaScript.
 * 
 * Run: node scripts/prerender.mjs
 * Runs after: vite build
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const SITE_URL = 'https://devv.tools'
const OG_IMAGE = 'https://dev-tools-hub.s3.us-east-1.amazonaws.com/og.png'

// Read the built index.html as the template
const template = readFileSync(join(DIST, 'index.html'), 'utf-8')

// ---- Tool definitions (must match tools.ts) ----
const tools = [
  { id: "qr-generator", title: "QR Code Generator", desc: "Generate QR codes from text, URLs, and data. Create scannable QR codes instantly for free.", cat: "Utility", kw: "qr code generator, qr code maker, create qr code, qr code online, free qr code" },
  { id: "image-optimizer", title: "Image Optimizer", desc: "Compress and optimize images online for free. Reduce file size while maintaining quality.", cat: "Utility", kw: "image optimizer, compress image, image compressor, reduce image size" },
  { id: "password-generator", title: "Password Generator", desc: "Generate strong, secure random passwords with custom length, symbols, and character options.", cat: "Generator", kw: "password generator, random password, secure password, strong password generator" },
  { id: "base64-encode", title: "Base64 Encoder", desc: "Encode text and data to Base64 format online. Free Base64 encoding tool for developers.", cat: "Converter", kw: "base64 encoder, base64 encode, text to base64, encode base64 online" },
  { id: "base64-decode", title: "Base64 Decoder", desc: "Decode Base64 strings back to original text. Free online Base64 decoding tool.", cat: "Converter", kw: "base64 decoder, base64 decode, base64 to text, decode base64 online" },
  { id: "regex-tester", title: "Regex Tester", desc: "Test and debug regular expressions with real-time matching and highlighting.", cat: "Utility", kw: "regex tester, regex online, regular expression tester, regex debugger" },
  { id: "json-formatter", title: "JSON Formatter", desc: "Format, beautify, and validate JSON data online. Pretty-print JSON with syntax highlighting.", cat: "Formatter", kw: "json formatter, json beautifier, json pretty print, format json online" },
  { id: "lorem-generator", title: "Lorem Ipsum Generator", desc: "Generate lorem ipsum placeholder text for designs, mockups, and development.", cat: "Generator", kw: "lorem ipsum generator, placeholder text, dummy text generator" },
  { id: "uuid-generator", title: "UUID Generator", desc: "Generate random UUID v4 identifiers online. Create unique IDs for databases and applications.", cat: "Generator", kw: "uuid generator, guid generator, random uuid, uuid v4" },
  { id: "html-formatter", title: "HTML Formatter", desc: "Format, beautify, and clean HTML code with proper indentation.", cat: "Formatter", kw: "html formatter, html beautifier, format html, html pretty print" },
  { id: "css-formatter", title: "CSS Formatter", desc: "Beautify, format, and organize CSS stylesheets online.", cat: "Formatter", kw: "css formatter, css beautifier, format css, css pretty print" },
  { id: "sql-formatter", title: "SQL Formatter", desc: "Format and beautify SQL queries with proper indentation and structure.", cat: "Formatter", kw: "sql formatter, sql beautifier, format sql, sql pretty print" },
  { id: "json-validator", title: "JSON Validator", desc: "Validate JSON syntax and structure online with detailed error messages.", cat: "Validator", kw: "json validator, validate json, json checker, json lint" },
  { id: "html-validator", title: "HTML Validator", desc: "Check and validate HTML markup for errors and warnings.", cat: "Validator", kw: "html validator, html checker, validate html" },
  { id: "css-validator", title: "CSS Validator", desc: "Validate CSS syntax and properties online.", cat: "Validator", kw: "css validator, css checker, validate css" },
  { id: "url-encode", title: "URL Encoder", desc: "Encode URLs and special characters for safe web transmission.", cat: "Converter", kw: "url encoder, url encode online, encode url, percent encoding" },
  { id: "url-decode", title: "URL Decoder", desc: "Decode URL-encoded strings back to readable text.", cat: "Converter", kw: "url decoder, url decode online, decode url" },
  { id: "hash-generator", title: "Hash Generator", desc: "Generate MD5, SHA-1, SHA-256, SHA-512 hash values online.", cat: "Converter", kw: "hash generator, md5 generator, sha256 hash, sha1 hash" },
  { id: "color-picker", title: "Color Picker", desc: "Pick colors and convert between HEX, RGB, and HSL formats.", cat: "Utility", kw: "color picker, color converter, hex to rgb, rgb to hex" },
  { id: "timestamp-converter", title: "Timestamp Converter", desc: "Convert between Unix timestamps and human-readable dates.", cat: "Utility", kw: "timestamp converter, unix timestamp, epoch converter" },
  { id: "jwt-decoder", title: "JWT Decoder", desc: "Decode and inspect JWT tokens online. View header, payload, and verify signatures.", cat: "Utility", kw: "jwt decoder, jwt token decoder, decode jwt online" },
  { id: "markdown-preview", title: "Markdown Preview", desc: "Preview and render Markdown with live editing.", cat: "Utility", kw: "markdown preview, markdown editor, markdown viewer" },
  { id: "minify-css", title: "CSS Minifier", desc: "Minify and compress CSS for production. Reduce CSS file size for faster page loads.", cat: "Formatter", kw: "css minifier, minify css, css compressor, compress css" },
  { id: "minify-js", title: "JavaScript Minifier", desc: "Minify and compress JavaScript for production.", cat: "Formatter", kw: "javascript minifier, js minifier, minify js, compress javascript" },
  { id: "url-shortener", title: "URL Shortener", desc: "Create short URLs for sharing.", cat: "Utility", kw: "url shortener, shorten url, link shortener" },
  { id: "text-counter", title: "Text Counter", desc: "Count characters, words, sentences, and lines in text.", cat: "Utility", kw: "text counter, word counter, character counter" },
  { id: "diff-checker", title: "Diff Checker", desc: "Compare two texts and find differences with side-by-side view.", cat: "Utility", kw: "diff checker, text compare, diff tool online" },
  { id: "text-case-converter", title: "Text Case Converter", desc: "Convert text between camelCase, snake_case, PascalCase, UPPER CASE, and more.", cat: "Converter", kw: "case converter, text case converter, camelcase converter" },
  { id: "base-converter", title: "Base Converter", desc: "Convert numbers between binary, octal, decimal, and hexadecimal.", cat: "Converter", kw: "base converter, binary converter, hex converter" },
  { id: "yaml-formatter", title: "YAML Formatter", desc: "Format, beautify, and validate YAML documents online.", cat: "Formatter", kw: "yaml formatter, yaml beautifier, format yaml" },
  { id: "json-yaml-converter", title: "JSON to YAML Converter", desc: "Convert between JSON and YAML formats instantly.", cat: "Converter", kw: "json to yaml, yaml to json, json yaml converter" },
  { id: "cron-builder", title: "Cron Expression Builder", desc: "Build and validate cron expressions visually.", cat: "Utility", kw: "cron expression builder, cron generator, crontab generator" },
  { id: "unix-permissions", title: "Unix Permissions Calculator", desc: "Calculate chmod values and symbolic permissions.", cat: "Utility", kw: "chmod calculator, unix permissions, file permissions calculator" },
  { id: "csv-json-converter", title: "CSV to JSON Converter", desc: "Convert between CSV and JSON formats online.", cat: "Converter", kw: "csv to json, json to csv, csv json converter" },
  { id: "xml-formatter", title: "XML Formatter", desc: "Format, beautify, and validate XML documents online.", cat: "Formatter", kw: "xml formatter, xml beautifier, format xml" },
  { id: "http-status", title: "HTTP Status Codes", desc: "Complete HTTP status code reference with descriptions.", cat: "Utility", kw: "http status codes, http response codes, status code reference" },
  { id: "mock-data-generator", title: "Mock Data Generator", desc: "Generate realistic fake data for testing.", cat: "Generator", kw: "mock data generator, fake data generator, test data generator" },
  { id: "escape-unescape", title: "Escape/Unescape Tool", desc: "Escape and unescape HTML, URL, JSON, and Unicode strings.", cat: "Converter", kw: "escape unescape, html escape, json escape" },
  { id: "byte-unit-converter", title: "Byte Unit Converter", desc: "Convert between bytes, KB, MB, GB, TB, and more.", cat: "Converter", kw: "byte converter, mb to gb, kb to mb, data size converter" },
  { id: "graphql-formatter", title: "GraphQL Formatter", desc: "Format and beautify GraphQL queries and schemas.", cat: "Formatter", kw: "graphql formatter, format graphql, graphql beautifier" },
  { id: "jwt-generator", title: "JWT Generator", desc: "Generate JWT tokens with custom payloads for testing.", cat: "Generator", kw: "jwt generator, jwt token generator, create jwt" },
]

// ---- Blog posts (slugs and titles for meta generation) ----
const blogPosts = [
  { slug: "best-free-json-formatter-online", title: "Best Free JSON Formatter Online: Format, Validate & Beautify JSON", desc: "Learn how to format, validate, and beautify JSON data online for free.", kw: "json formatter, json beautifier, format json online" },
  { slug: "secure-password-generator-guide", title: "How to Generate Strong Passwords: Free Secure Password Generator", desc: "Generate strong, secure passwords with our free tool. Learn best practices for password security.", kw: "password generator, secure password, strong password generator" },
  { slug: "base64-encoding-decoding-explained", title: "Base64 Encoding & Decoding Explained: How It Works + Free Online Tool", desc: "Understand Base64 encoding and decoding. Learn when to use Base64.", kw: "base64 encoder, base64 decoder, base64 encoding" },
  { slug: "regex-tutorial-for-developers", title: "Regex Tutorial: Master Regular Expressions with Our Free Tester", desc: "Learn regular expressions from basics to advanced patterns.", kw: "regex tutorial, regular expressions, regex tester" },
  { slug: "jwt-tokens-explained", title: "JWT Tokens Explained: How to Decode, Verify & Generate JSON Web Tokens", desc: "Learn how JWT tokens work, their structure, and how to decode and generate them.", kw: "jwt decoder, jwt token, json web token" },
  { slug: "css-minification-guide", title: "CSS Minification: How to Minify CSS for Faster Websites", desc: "Learn how CSS minification speeds up your website.", kw: "css minifier, minify css, css compression" },
  { slug: "uuid-guide-developers", title: "UUID Guide for Developers: v4 vs v7, When to Use, and Free Generator", desc: "Learn everything about UUIDs for developers.", kw: "uuid generator, guid generator, uuid v4" },
  { slug: "hash-algorithms-explained", title: "Hash Algorithms Explained: MD5, SHA-256, SHA-512 — When to Use Each", desc: "Understand cryptographic hash functions and when to use each.", kw: "hash generator, md5 hash, sha256 hash" },
  { slug: "cron-expressions-guide", title: "Cron Expression Guide: Syntax, Examples & Free Visual Builder", desc: "Master cron expressions with our complete guide.", kw: "cron expression, crontab, cron schedule" },
  { slug: "json-yaml-conversion-guide", title: "JSON vs YAML: Differences, When to Use Each & Free Converter", desc: "Compare JSON and YAML formats, learn when to use each.", kw: "json to yaml, yaml to json, json vs yaml" },
]

// Script injected into prerendered pages to hide SEO content once React mounts
const HIDE_SCRIPT = `<script>
(function(){var s=document.getElementById('seo-content');if(s){var o=new MutationObserver(function(){if(document.getElementById('root').children.length>0){s.style.display='none';o.disconnect()}});o.observe(document.getElementById('root'),{childList:true})}})();
</script>`

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function generateToolHtml(tool) {
  const title = `${tool.title} - Free Online ${tool.cat} Tool - devv.tools`
  const url = `${SITE_URL}/tools/${tool.id}`

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.title,
    "description": tool.desc,
    "url": url,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "isPartOf": { "@type": "WebSite", "name": "devv.tools", "url": SITE_URL }
  })

  const breadcrumbLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "devv.tools", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": `${tool.cat}s`, "item": `${SITE_URL}/${tool.cat.toLowerCase()}s` },
      { "@type": "ListItem", "position": 3, "name": tool.title, "item": url }
    ]
  })

  // SEO content block that crawlers will see
  const seoContent = `
    <div id="seo-content" style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif;">
      <nav style="margin-bottom: 1rem; font-size: 0.875rem; color: #666;">
        <a href="/" style="color: #14b8a6;">Home</a> &gt; 
        <a href="/${tool.cat.toLowerCase()}s" style="color: #14b8a6;">${tool.cat}s</a> &gt; 
        ${escapeHtml(tool.title)}
      </nav>
      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">${escapeHtml(tool.title)}</h1>
      <p style="color: #666; font-size: 1.125rem; margin-bottom: 2rem;">${escapeHtml(tool.desc)}</p>
      <p>This free online ${tool.cat.toLowerCase()} tool runs entirely in your browser. No data is sent to any server — your input stays private and secure.</p>
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem;">Features</h2>
      <ul>
        <li>Free to use — no signup or registration required</li>
        <li>Works offline — processes everything locally in your browser</li>
        <li>Privacy-first — no data leaves your machine</li>
        <li>Fast and responsive — instant results</li>
      </ul>
      <p style="margin-top: 1rem;"><a href="/blog" style="color: #14b8a6;">Read our developer guides</a> for tips and best practices.</p>
    </div>`

  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(tool.desc)}"`)
    .replace(/<meta name="keywords" content="[^"]*"/, `<meta name="keywords" content="${escapeHtml(tool.kw)}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeHtml(title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeHtml(tool.desc)}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeHtml(title)}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escapeHtml(tool.desc)}"`)
    .replace('<div id="root"></div>', `<div id="root"></div>${seoContent}\n    <script type="application/ld+json">${jsonLd}</script>\n    <script type="application/ld+json">${breadcrumbLd}</script>\n    ${HIDE_SCRIPT}`)
}

function generateBlogHtml(post) {
  const title = `${post.title} - devv.tools`
  const url = `${SITE_URL}/blog/${post.slug}`

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.desc,
    "url": url,
    "author": { "@type": "Organization", "name": "devv.tools" },
    "publisher": { "@type": "Organization", "name": "devv.tools", "url": SITE_URL }
  })

  const seoContent = `
    <div id="seo-content" style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif;">
      <nav style="margin-bottom: 1rem; font-size: 0.875rem; color: #666;">
        <a href="/" style="color: #14b8a6;">Home</a> &gt; 
        <a href="/blog" style="color: #14b8a6;">Blog</a> &gt; 
        ${escapeHtml(post.title)}
      </nav>
      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">${escapeHtml(post.title)}</h1>
      <p style="color: #666; font-size: 1.125rem;">${escapeHtml(post.desc)}</p>
    </div>`

  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeHtml(post.desc)}"`)
    .replace(/<meta name="keywords" content="[^"]*"/, `<meta name="keywords" content="${escapeHtml(post.kw)}"`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeHtml(title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeHtml(post.desc)}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeHtml(title)}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escapeHtml(post.desc)}"`)
    .replace('<div id="root"></div>', `<div id="root"></div>${seoContent}\n    <script type="application/ld+json">${jsonLd}</script>\n    ${HIDE_SCRIPT}`)
}

function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}

// Generate tool pages
console.log('🔧 Generating pre-rendered tool pages...')
for (const tool of tools) {
  const dir = join(DIST, 'tools', tool.id)
  ensureDir(dir)
  writeFileSync(join(dir, 'index.html'), generateToolHtml(tool))
}
console.log(`   ✅ ${tools.length} tool pages generated`)

// Generate blog pages
console.log('📝 Generating pre-rendered blog pages...')
const blogDir = join(DIST, 'blog')
ensureDir(blogDir)

// Blog index
const blogIndexHtml = template
  .replace(/<title>[^<]*<\/title>/, '<title>Developer Blog: Guides, Tutorials & Best Practices - devv.tools</title>')
  .replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="Learn about JSON formatting, password security, Base64 encoding, regex patterns, JWT tokens, and more. Free developer guides."')
  .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${SITE_URL}/blog"`)
  .replace('<div id="root"></div>', `<div id="root"></div>
    <div id="seo-content" style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif;">
      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">Developer Blog</h1>
      <p style="color: #666;">Guides, tutorials, and best practices for developers.</p>
      <ul>${blogPosts.map(p => `<li><a href="/blog/${p.slug}" style="color: #14b8a6;">${escapeHtml(p.title)}</a> — ${escapeHtml(p.desc)}</li>`).join('\n        ')}</ul>
    </div>\n    ${HIDE_SCRIPT}`)
writeFileSync(join(blogDir, 'index.html'), blogIndexHtml)

for (const post of blogPosts) {
  const dir = join(blogDir, post.slug)
  ensureDir(dir)
  writeFileSync(join(dir, 'index.html'), generateBlogHtml(post))
}
console.log(`   ✅ ${blogPosts.length + 1} blog pages generated`)

// Generate category pages
const categories = ['formatters', 'validators', 'converters', 'generators']
console.log('📂 Generating category pages...')
for (const cat of categories) {
  const dir = join(DIST, cat)
  ensureDir(dir)
  const catTitle = cat.charAt(0).toUpperCase() + cat.slice(1)
  const catTools = tools.filter(t => t.cat.toLowerCase() + 's' === cat)
  const catHtml = template
    .replace(/<title>[^<]*<\/title>/, `<title>${catTitle} - Free Online Developer Tools - devv.tools</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="Free online ${cat} tools for developers. ${catTools.map(t => t.title).slice(0, 5).join(', ')}, and more."`)
    .replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${SITE_URL}/${cat}"`)
    .replace('<div id="root"></div>', `<div id="root"></div>
    <div id="seo-content" style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif;">
      <h1 style="font-size: 2rem; font-weight: bold;">${catTitle}</h1>
      <p style="color: #666;">Free online ${cat} tools for developers.</p>
      <ul>${catTools.map(t => `<li><a href="/tools/${t.id}" style="color: #14b8a6;">${escapeHtml(t.title)}</a> — ${escapeHtml(t.desc)}</li>`).join('\n        ')}</ul>
    </div>\n    ${HIDE_SCRIPT}`)
  writeFileSync(join(dir, 'index.html'), catHtml)
}
console.log(`   ✅ ${categories.length} category pages generated`)

console.log('\n🎉 Pre-rendering complete!')
console.log(`   Total pages: ${tools.length + blogPosts.length + 1 + categories.length + 1}`)
