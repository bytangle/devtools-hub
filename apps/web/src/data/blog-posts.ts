export interface BlogPost {
  slug: string
  title: string
  description: string
  content: string
  toolId?: string
  keywords: string[]
  publishedAt: string
  updatedAt: string
  readingTime: number
  category: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "best-free-json-formatter-online",
    title: "Best Free JSON Formatter Online: Format, Validate & Beautify JSON",
    description: "Learn how to format, validate, and beautify JSON data online for free. Our JSON formatter tool helps developers quickly clean up JSON with syntax highlighting and tree view.",
    toolId: "json-formatter",
    keywords: ["json formatter", "json beautifier", "format json online", "json pretty print", "json validator", "json viewer", "beautify json"],
    publishedAt: "2026-03-15",
    updatedAt: "2026-04-07",
    readingTime: 5,
    category: "Formatters",
    content: `## Why You Need a JSON Formatter

JSON (JavaScript Object Notation) is the backbone of modern web development. Every API response, configuration file, and data exchange uses JSON. But minified JSON is nearly impossible to read:

\`\`\`json
{"users":[{"id":1,"name":"John","email":"john@example.com","roles":["admin","user"]},{"id":2,"name":"Jane","email":"jane@example.com","roles":["user"]}]}
\`\`\`

A JSON formatter transforms this into clean, readable structure:

\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "John",
      "email": "john@example.com",
      "roles": ["admin", "user"]
    },
    {
      "id": 2,
      "name": "Jane",
      "email": "jane@example.com",
      "roles": ["user"]
    }
  ]
}
\`\`\`

## How to Use Our JSON Formatter

1. **Paste your JSON** into the input editor
2. **Click Format** to beautify with 2 or 4 space indentation
3. **View the tree** to explore nested structures visually
4. **Copy the output** with one click

## Key Features

- **Syntax Validation** — Instantly detects and highlights JSON errors with line numbers
- **Tree View** — Collapse and expand nested objects and arrays
- **Minification** — Compress JSON for production use
- **Custom Indentation** — Choose between 2, 4, or 8 spaces
- **No Data Storage** — Everything runs in your browser; your data never leaves your machine

## Common JSON Formatting Issues

### Missing Quotes Around Keys
JSON requires double quotes around all keys. This is invalid:
\`\`\`
{name: "John"}
\`\`\`

### Trailing Commas
Unlike JavaScript, JSON does not allow trailing commas:
\`\`\`json
{"name": "John", "age": 30,}  // Invalid!
\`\`\`

### Single Quotes
JSON only supports double quotes:
\`\`\`
{'name': 'John'}  // Invalid!
\`\`\`

## When to Use a JSON Formatter

- **Debugging API responses** — Format response bodies to find issues quickly
- **Reading config files** — Make \`package.json\`, \`tsconfig.json\`, etc. readable
- **Code reviews** — Clean up JSON before sharing with teammates
- **Learning** — Understand nested data structures visually

## Try It Now

Our [JSON Formatter](/tools/json-formatter) is completely free, works offline, and processes everything in your browser. No signup required.`
  },
  {
    slug: "secure-password-generator-guide",
    title: "How to Generate Strong Passwords: Free Secure Password Generator",
    description: "Generate strong, secure passwords with our free tool. Learn best practices for password security, why length matters more than complexity, and how to create uncrackable passwords.",
    toolId: "password-generator",
    keywords: ["password generator", "secure password", "strong password generator", "random password", "password security", "password best practices"],
    publishedAt: "2026-03-18",
    updatedAt: "2026-04-07",
    readingTime: 6,
    category: "Generators",
    content: `## Why Strong Passwords Matter

In 2026, weak passwords remain the #1 cause of data breaches. A password like \`password123\` can be cracked in under 1 second. But a randomly generated 20-character password would take billions of years.

## What Makes a Password Strong?

### Length Is King
Every additional character exponentially increases crack time:

| Length | Lowercase Only | Mixed + Symbols |
|--------|---------------|-----------------|
| 8 chars | 5 hours | 8 hours |
| 12 chars | 3 years | 34,000 years |
| 16 chars | 91 million years | Billions of years |
| 20 chars | Trillions of years | Heat death of universe |

### Character Diversity
Use a mix of:
- ✅ Uppercase letters (A-Z)
- ✅ Lowercase letters (a-z)
- ✅ Numbers (0-9)
- ✅ Special symbols (!@#$%^&*)

## How Our Password Generator Works

Our [Password Generator](/tools/password-generator) uses the **Web Crypto API** (\`crypto.getRandomValues()\`) — the same cryptographic random number generator used by banks and security software. This means:

1. **True randomness** — Not pseudo-random; uses OS-level entropy
2. **Browser-only** — Passwords are generated locally, never sent to a server
3. **Customizable** — Set length, include/exclude character types
4. **Instant** — Generate multiple passwords in milliseconds

## Password Best Practices

### Do ✅
- Use a unique password for every account
- Use a password manager (1Password, Bitwarden, KeePass)
- Enable two-factor authentication (2FA)
- Use passwords of 16+ characters

### Don't ❌
- Reuse passwords across sites
- Use personal info (birthday, pet name, etc.)
- Share passwords via email or text
- Use common substitutions (p@ssw0rd is not secure)

## How Long Should Your Password Be?

For most accounts, **16 characters** is the sweet spot. For critical accounts (email, banking), go to **20+ characters**. With a password manager, length doesn't matter for usability.

## Try It Now

Generate an uncrackable password in seconds with our free [Password Generator](/tools/password-generator). No signup, no tracking — just secure passwords.`
  },
  {
    slug: "base64-encoding-decoding-explained",
    title: "Base64 Encoding & Decoding Explained: How It Works + Free Online Tool",
    description: "Understand Base64 encoding and decoding. Learn when to use Base64, how the algorithm works, and encode/decode data instantly with our free online tool.",
    toolId: "base64-encode",
    keywords: ["base64 encoder", "base64 decoder", "base64 encoding", "encode base64", "decode base64", "what is base64", "base64 online"],
    publishedAt: "2026-03-20",
    updatedAt: "2026-04-07",
    readingTime: 7,
    category: "Converters",
    content: `## What Is Base64 Encoding?

Base64 is a binary-to-text encoding scheme that converts binary data into a set of 64 ASCII characters. It's used everywhere in web development:

- **Data URLs** — Embedding images directly in HTML/CSS
- **Email attachments** — MIME encoding
- **API authentication** — HTTP Basic Auth headers
- **JWT tokens** — Header and payload encoding
- **Transferring binary data** — Through text-only channels

## How Base64 Works

Base64 takes 3 bytes (24 bits) of input and converts them into 4 ASCII characters:

\`\`\`
Input:    H        e        l
Binary:   01001000 01100101 01101100
6-bit:    010010 000110 010101 101100
Base64:   S        G        V        s
\`\`\`

The Base64 alphabet uses: \`A-Z\`, \`a-z\`, \`0-9\`, \`+\`, \`/\`, and \`=\` for padding.

## Base64 Encoding Example

Input text: \`Hello, World!\`

Encoded: \`SGVsbG8sIFdvcmxkIQ==\`

The \`==\` at the end is padding — it appears when the input length isn't divisible by 3.

## Common Use Cases

### 1. Embedding Images in CSS
\`\`\`css
.icon {
  background-image: url(data:image/png;base64,iVBORw0KGgo...);
}
\`\`\`

### 2. HTTP Basic Authentication
\`\`\`
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
\`\`\`
This is \`username:password\` in Base64.

### 3. Storing Binary Data in JSON
Since JSON only supports text, binary data must be Base64-encoded:
\`\`\`json
{
  "file": "SGVsbG8gV29ybGQ=",
  "type": "text/plain"
}
\`\`\`

## Important: Base64 Is NOT Encryption

Base64 is **encoding**, not encryption. Anyone can decode it. Never use Base64 to hide sensitive data — use proper encryption (AES, RSA) instead.

## Base64 Size Overhead

Base64 increases data size by approximately **33%**. A 1 MB file becomes ~1.33 MB when Base64-encoded. Keep this in mind for performance-sensitive applications.

## Try It Now

Use our free [Base64 Encoder](/tools/base64-encode) and [Base64 Decoder](/tools/base64-decode) to convert data instantly. Everything runs in your browser — your data stays private.`
  },
  {
    slug: "regex-tutorial-for-developers",
    title: "Regex Tutorial: Master Regular Expressions with Our Free Tester",
    description: "Learn regular expressions from basics to advanced patterns. Use our free regex tester to practice and debug patterns with real-time matching and highlighting.",
    toolId: "regex-tester",
    keywords: ["regex tutorial", "regular expressions", "regex tester", "regex cheat sheet", "regex examples", "regex patterns", "learn regex"],
    publishedAt: "2026-03-22",
    updatedAt: "2026-04-07",
    readingTime: 8,
    category: "Utilities",
    content: `## What Are Regular Expressions?

Regular expressions (regex) are patterns used to match character combinations in text. They're one of the most powerful tools in a developer's toolkit — used in search, validation, parsing, and text manipulation.

## Essential Regex Patterns

### Basic Matchers
| Pattern | Matches | Example |
|---------|---------|---------|
| \`.\` | Any character | \`h.t\` → "hat", "hot" |
| \`\\d\` | Any digit | \`\\d{3}\` → "123" |
| \`\\w\` | Word character | \`\\w+\` → "hello" |
| \`\\s\` | Whitespace | \`\\s+\` → " " |
| \`^\` | Start of string | \`^Hello\` |
| \`$\` | End of string | \`world$\` |

### Quantifiers
| Pattern | Meaning |
|---------|---------|
| \`*\` | 0 or more |
| \`+\` | 1 or more |
| \`?\` | 0 or 1 |
| \`{3}\` | Exactly 3 |
| \`{2,5}\` | Between 2 and 5 |

### Character Classes
| Pattern | Matches |
|---------|---------|
| \`[abc]\` | a, b, or c |
| \`[a-z]\` | Any lowercase letter |
| \`[^abc]\` | NOT a, b, or c |
| \`[0-9]\` | Any digit |

## Real-World Regex Examples

### Validate an Email
\`\`\`
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$
\`\`\`

### Match a URL
\`\`\`
https?:\\/\\/[\\w\\-.]+(:\\d+)?(\\/[\\w\\-./?%&=]*)?
\`\`\`

### Extract Phone Numbers
\`\`\`
\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}
\`\`\`

### Match an IP Address
\`\`\`
\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b
\`\`\`

## Groups and Lookahead

### Capture Groups
\`\`\`
(\\d{4})-(\\d{2})-(\\d{2})
\`\`\`
Captures year, month, and day separately from dates like \`2026-04-07\`.

### Lookahead
\`\`\`
\\d+(?= dollars)
\`\`\`
Matches numbers only when followed by " dollars".

## Common Regex Mistakes

1. **Not escaping special characters** — \`.\`, \`*\`, \`?\`, \`(\`, \`)\` need \`\\\` prefix
2. **Greedy matching** — \`.*\` is greedy; use \`.*?\` for lazy matching
3. **Forgetting anchors** — Use \`^\` and \`$\` when validating entire strings
4. **Catastrophic backtracking** — Nested quantifiers like \`(a+)+\` can hang your program

## Practice with Our Regex Tester

Our free [Regex Tester](/tools/regex-tester) lets you write patterns and see matches highlighted in real-time. It supports JavaScript regex syntax with flags (global, case-insensitive, multiline).`
  },
  {
    slug: "jwt-tokens-explained",
    title: "JWT Tokens Explained: How to Decode, Verify & Generate JSON Web Tokens",
    description: "Learn how JWT tokens work, their structure (header, payload, signature), and how to decode and generate them. Free online JWT decoder and generator tools.",
    toolId: "jwt-decoder",
    keywords: ["jwt decoder", "jwt token", "json web token", "jwt explained", "jwt generator", "jwt signature", "decode jwt online"],
    publishedAt: "2026-03-25",
    updatedAt: "2026-04-07",
    readingTime: 7,
    category: "Utilities",
    content: `## What Is a JSON Web Token (JWT)?

A JWT is a compact, URL-safe token format used for authentication and information exchange. It's the standard for modern API authentication — used by OAuth 2.0, OpenID Connect, and most SaaS platforms.

## JWT Structure

A JWT has three parts, separated by dots:

\`\`\`
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U
\`\`\`

### 1. Header
\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`
Specifies the signing algorithm (HS256, RS256, etc.) and token type.

### 2. Payload
\`\`\`json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516325422
}
\`\`\`
Contains claims — user data and metadata. Common claims:
- \`sub\` — Subject (user ID)
- \`iat\` — Issued at time
- \`exp\` — Expiration time
- \`iss\` — Issuer
- \`aud\` — Audience

### 3. Signature
\`\`\`
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
\`\`\`
Ensures the token hasn't been tampered with.

## JWT Security Best Practices

### Do ✅
- Use short expiration times (15 minutes for access tokens)
- Store tokens in httpOnly cookies (not localStorage)
- Validate the \`exp\` claim on every request
- Use RS256 (asymmetric) for distributed systems

### Don't ❌
- Store sensitive data in the payload (it's only Base64-encoded, not encrypted)
- Use \`none\` algorithm in production
- Ignore expiration validation
- Use the same secret across environments

## JWT vs Session Cookies

| Feature | JWT | Session Cookie |
|---------|-----|----------------|
| Stateless | ✅ Yes | ❌ No (server stores session) |
| Scalable | ✅ Easy | ⚠️ Needs shared store |
| Revocation | ⚠️ Hard | ✅ Easy |
| Size | Larger (~1KB) | Small (~32 bytes) |

## Debugging JWTs

When working with APIs, you often need to inspect JWT contents. Our [JWT Decoder](/tools/jwt-decoder) instantly breaks down any JWT into its header, payload, and signature. We also offer a [JWT Generator](/tools/jwt-generator) for creating test tokens.

## Try It Now

Paste any JWT into our free [JWT Decoder](/tools/jwt-decoder) to inspect its contents, or use our [JWT Generator](/tools/jwt-generator) to create test tokens with custom payloads.`
  },
  {
    slug: "css-minification-guide",
    title: "CSS Minification: How to Minify CSS for Faster Websites",
    description: "Learn how CSS minification speeds up your website. Minify CSS online for free and understand the performance impact of removing whitespace, comments, and redundant code.",
    toolId: "minify-css",
    keywords: ["css minifier", "minify css", "css compression", "optimize css", "css performance", "reduce css size", "minify css online"],
    publishedAt: "2026-03-28",
    updatedAt: "2026-04-07",
    readingTime: 5,
    category: "Formatters",
    content: `## What Is CSS Minification?

CSS minification removes unnecessary characters from CSS code without changing its functionality:

- **Whitespace and newlines** — removed entirely
- **Comments** — stripped out  
- **Redundant semicolons** — removed
- **Zero units** — \`0px\` → \`0\`

### Before Minification (1,204 bytes)
\`\`\`css
/* Main navigation styles */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #ffffff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar .logo {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}
\`\`\`

### After Minification (186 bytes) — 85% smaller!
\`\`\`css
.navbar{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;background-color:#fff;box-shadow:0 2px 4px rgba(0,0,0,.1)}.navbar .logo{font-size:24px;font-weight:700;color:#1a1a1a}
\`\`\`

## Why Minify CSS?

### 1. Faster Page Loads
CSS blocks rendering — the browser can't paint anything until CSS is downloaded and parsed. Smaller CSS = faster first paint.

### 2. Less Bandwidth
Especially important for mobile users on slow connections. A 100KB CSS file minified to 60KB saves 40KB per page load.

### 3. Better Core Web Vitals
Google uses page speed as a ranking factor. Minified CSS directly improves:
- **LCP** (Largest Contentful Paint)
- **FCP** (First Contentful Paint)
- **CLS** (Cumulative Layout Shift)

## CSS Minification vs Gzip

| Technique | What It Does | Typical Savings |
|-----------|-------------|-----------------|
| Minification | Removes whitespace, comments | 20-50% |
| Gzip | Compresses at server level | 60-80% |
| Both combined | Best results | 80-90% |

Always use **both**. They complement each other — minification removes redundancy, gzip compresses the remaining patterns.

## Try It Now

Paste your CSS into our free [CSS Minifier](/tools/minify-css) and see the size reduction instantly. No signup, no limits — just paste and minify.`
  },
  {
    slug: "uuid-guide-developers",
    title: "UUID Guide for Developers: v4 vs v7, When to Use, and Free Generator",
    description: "Learn everything about UUIDs: what they are, UUID v4 vs v7, when to use them over auto-increment IDs, and generate UUIDs instantly with our free tool.",
    toolId: "uuid-generator",
    keywords: ["uuid generator", "guid generator", "uuid v4", "uuid vs auto increment", "generate uuid", "unique id generator", "random uuid"],
    publishedAt: "2026-04-01",
    updatedAt: "2026-04-07",
    readingTime: 6,
    category: "Generators",
    content: `## What Is a UUID?

A UUID (Universally Unique Identifier) is a 128-bit identifier that's guaranteed to be unique across space and time. Format:

\`\`\`
550e8400-e29b-41d4-a716-446655440000
\`\`\`

That's 32 hexadecimal digits in 5 groups separated by hyphens (8-4-4-4-12).

## UUID Versions

### UUID v4 (Random) — Most Common
Generated from random numbers. The probability of collision is astronomically low: you'd need to generate 1 billion UUIDs per second for 85 years to have a 50% chance of a single collision.

### UUID v7 (Time-Sorted) — Newer Standard
Combines a timestamp with randomness. Benefits:
- **Sortable** — UUIDs sort chronologically
- **Better database performance** — Sequential insertion into B-tree indexes
- **Still unique** — Timestamp + random bits

## UUID vs Auto-Increment IDs

| Feature | UUID | Auto-Increment |
|---------|------|----------------|
| Globally unique | ✅ Yes | ❌ Only within table |
| Predictable | ❌ No (secure) | ⚠️ Yes (security risk) |
| Distributed generation | ✅ No coordination needed | ❌ Needs central authority |
| Database performance | ⚠️ Random insertion | ✅ Sequential insertion |
| Size | 16 bytes | 4–8 bytes |
| URL friendly | ⚠️ Long | ✅ Short |

### When to Use UUIDs
- Distributed systems with multiple databases
- Public-facing IDs (don't want users guessing /user/1, /user/2)
- Offline-capable apps that sync later
- Microservice architectures

### When to Use Auto-Increment
- Simple single-database apps
- When URL length matters
- When sequential ordering is important
- When storage size is critical

## Generate UUIDs in Code

### JavaScript
\`\`\`javascript
crypto.randomUUID()
// "550e8400-e29b-41d4-a716-446655440000"
\`\`\`

### Python
\`\`\`python
import uuid
str(uuid.uuid4())
\`\`\`

### Command Line
\`\`\`bash
uuidgen  # macOS/Linux
\`\`\`

## Try It Now

Generate UUIDs instantly with our free [UUID Generator](/tools/uuid-generator). Generate single or bulk UUIDs with one click.`
  },
  {
    slug: "hash-algorithms-explained",
    title: "Hash Algorithms Explained: MD5, SHA-256, SHA-512 — When to Use Each",
    description: "Understand cryptographic hash functions: MD5, SHA-1, SHA-256, SHA-512. Learn when to use each algorithm, which ones are secure, and hash data for free online.",
    toolId: "hash-generator",
    keywords: ["hash generator", "md5 hash", "sha256 hash", "sha512", "hash algorithm", "hash function", "checksum calculator"],
    publishedAt: "2026-04-03",
    updatedAt: "2026-04-07",
    readingTime: 6,
    category: "Converters",
    content: `## What Is a Hash Function?

A hash function takes any input and produces a fixed-size output (the "hash" or "digest"). Key properties:

1. **Deterministic** — Same input always produces same output
2. **Fast** — Computing a hash is quick
3. **One-way** — You cannot reverse a hash back to the original input
4. **Collision resistant** — Different inputs should produce different hashes
5. **Avalanche effect** — Small input changes cause completely different outputs

## Common Hash Algorithms

### MD5 (128-bit) ⚠️ Deprecated
\`\`\`
"hello" → 5d41402abc4b2a76b9719d911017c592
\`\`\`
- ❌ **Not secure** — Collisions found in 2004
- ✅ Still fine for checksums and non-security purposes
- Output: 32 hex characters

### SHA-1 (160-bit) ⚠️ Deprecated  
\`\`\`
"hello" → aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d
\`\`\`
- ❌ **Not secure** — Google demonstrated a collision in 2017 (SHAttered)
- ⚠️ Still used in Git (for now)
- Output: 40 hex characters

### SHA-256 (256-bit) ✅ Recommended
\`\`\`
"hello" → 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
\`\`\`
- ✅ **Secure** — No known vulnerabilities
- Used in Bitcoin, TLS certificates, code signing
- Output: 64 hex characters

### SHA-512 (512-bit) ✅ Most Secure
\`\`\`
"hello" → 9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2...
\`\`\`
- ✅ **Most secure** — Even stronger than SHA-256
- Better performance on 64-bit systems
- Output: 128 hex characters

## Which Hash Should You Use?

| Use Case | Algorithm |
|----------|-----------|
| File integrity checks | SHA-256 |
| Password storage | bcrypt, scrypt, or Argon2 (NOT raw SHA) |
| Digital signatures | SHA-256 or SHA-512 |
| Non-security checksums | MD5 (fast, well-supported) |
| Git commits | SHA-1 (legacy) → SHA-256 (future) |
| Blockchain | SHA-256 |

## Important: Hashing Passwords

Never use raw hash functions (MD5, SHA-256) for passwords. Use purpose-built password hashing:

- **bcrypt** — Time-tested, adjustable cost factor
- **scrypt** — Memory-hard, resistant to GPU attacks
- **Argon2** — Winner of Password Hashing Competition; recommended for new projects

## Try It Now

Hash any text with MD5, SHA-1, SHA-256, and SHA-512 using our free [Hash Generator](/tools/hash-generator). All processing happens in your browser.`
  },
  {
    slug: "cron-expressions-guide",
    title: "Cron Expression Guide: Syntax, Examples & Free Visual Builder",
    description: "Master cron expressions with our complete guide. Learn cron syntax, see common scheduling examples, and build cron jobs visually with our free builder tool.",
    toolId: "cron-builder",
    keywords: ["cron expression", "crontab", "cron schedule", "cron syntax", "cron builder", "cron examples", "cron job scheduler"],
    publishedAt: "2026-04-05",
    updatedAt: "2026-04-07",
    readingTime: 6,
    category: "Utilities",
    content: `## What Is a Cron Expression?

Cron is the Unix standard for scheduling recurring tasks. A cron expression defines when a job runs using five fields:

\`\`\`
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 7, 0 and 7 = Sunday)
│ │ │ │ │
* * * * *
\`\`\`

## Common Cron Expressions

| Expression | Schedule |
|-----------|----------|
| \`* * * * *\` | Every minute |
| \`0 * * * *\` | Every hour |
| \`0 0 * * *\` | Every day at midnight |
| \`0 9 * * 1-5\` | Weekdays at 9 AM |
| \`0 0 1 * *\` | First day of every month |
| \`0 0 * * 0\` | Every Sunday at midnight |
| \`*/15 * * * *\` | Every 15 minutes |
| \`0 9,17 * * *\` | 9 AM and 5 PM daily |
| \`0 0 1 1 *\` | January 1st at midnight |

## Special Characters

| Character | Meaning | Example |
|-----------|---------|---------|
| \`*\` | Any value | \`* * * * *\` = every minute |
| \`,\` | List | \`1,15\` = 1st and 15th |
| \`-\` | Range | \`1-5\` = Monday to Friday |
| \`/\` | Step | \`*/10\` = every 10 |

## Cron in Different Platforms

### Linux/macOS Crontab
\`\`\`bash
crontab -e
# Add: 0 9 * * 1-5 /path/to/script.sh
\`\`\`

### GitHub Actions
\`\`\`yaml
on:
  schedule:
    - cron: '0 9 * * 1-5'
\`\`\`

### Kubernetes CronJob
\`\`\`yaml
spec:
  schedule: "0 */6 * * *"
\`\`\`

## Common Mistakes

1. **Month/day-of-week confusion** — Months are 1-12, day-of-week is 0-7
2. **Server timezone** — Cron typically uses the server's timezone, not UTC
3. **Overlapping runs** — If a job takes longer than the interval, you can get concurrent executions

## Try It Now

Build cron expressions visually with our free [Cron Expression Builder](/tools/cron-builder). Select times, preview the next scheduled runs, and copy the expression.`
  },
  {
    slug: "json-yaml-conversion-guide",
    title: "JSON vs YAML: Differences, When to Use Each & Free Converter",
    description: "Compare JSON and YAML formats, learn when to use each, and convert between them instantly with our free online JSON-YAML converter tool.",
    toolId: "json-yaml-converter",
    keywords: ["json to yaml", "yaml to json", "json vs yaml", "json yaml converter", "yaml format", "yaml syntax", "convert json yaml"],
    publishedAt: "2026-04-06",
    updatedAt: "2026-04-07",
    readingTime: 5,
    category: "Converters",
    content: `## JSON vs YAML: Quick Comparison

### JSON
\`\`\`json
{
  "server": {
    "host": "localhost",
    "port": 3000,
    "debug": true,
    "databases": ["postgres", "redis"]
  }
}
\`\`\`

### YAML
\`\`\`yaml
server:
  host: localhost
  port: 3000
  debug: true
  databases:
    - postgres
    - redis
\`\`\`

## Key Differences

| Feature | JSON | YAML |
|---------|------|------|
| Readability | Good | Better (no brackets/quotes) |
| Comments | ❌ Not supported | ✅ \`#\` syntax |
| Data types | Strings, numbers, bools, null, arrays, objects | All JSON types + dates, multiline strings |
| File size | Larger (quotes, brackets) | Smaller (indentation-based) |
| Parsing speed | Faster | Slower |
| Human editing | Harder | Easier |

## When to Use JSON

- **API responses** — The standard for REST APIs
- **package.json** — npm/Node.js ecosystem
- **Browser data** — Native \`JSON.parse()\` support
- **Data interchange** — When machines are the primary consumers

## When to Use YAML

- **Configuration files** — Docker Compose, Kubernetes, CI/CD
- **Human-edited files** — When developers frequently edit by hand
- **Documentation** — Frontmatter in markdown files
- **When you need comments** — JSON doesn't support them

## Common YAML Gotchas

### The Norway Problem
\`\`\`yaml
country: NO  # YAML 1.1 interprets this as boolean false!
\`\`\`
Fix: Quote it: \`country: "NO"\`

### Indentation Matters
\`\`\`yaml
# This is WRONG (tabs):
server:
\tport: 3000  # YAML requires spaces, not tabs!
\`\`\`

### Multiline Strings
\`\`\`yaml
description: |
  This is a multiline
  string in YAML
  that preserves newlines.
\`\`\`

## Try It Now

Convert between JSON and YAML instantly with our free [JSON ↔ YAML Converter](/tools/json-yaml-converter). Paste either format and get the other with one click.`
  },
]