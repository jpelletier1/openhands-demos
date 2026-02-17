# Example To Do App with Known CVEs

A simple Node.js To Do application that contains known security vulnerabilities for testing Trivy scanning.

## Purpose

This application is designed to demonstrate CVE detection using Trivy. It contains intentionally vulnerable dependencies and code patterns.

## Vulnerable Dependencies

| Package | Version | CVE Issues |
|---------|---------|------------|
| lodash | 4.17.15 | Prototype pollution (CVE-2021-23337) |
| moment | 2.29.1 | Path traversal, ReDoS |
| axios | 0.21.1 | Server-Side Request Forgery (SSRF) |
| jsonwebtoken | 8.5.1 | Algorithm confusion |
| underscore | 1.12.0 | Prototype pollution |
| ejs | 3.1.6 | Template injection |
| cookie-parser | 1.4.5 | Cookie injection |
| express-session | 1.17.2 | Session fixation |

## Vulnerable Code Patterns

- **Prototype Pollution**: lodash merge operations
- **SSRF**: Unsanitized URL fetching via axios
- **JWT Algorithm Confusion**: Using 'none' algorithm
- **Path Traversal**: Unsafe moment.js date parsing

## Docker Vulnerabilities

- Running as root user
- Missing health checks
- No resource limits

## Running the App

```bash
# Install dependencies
npm install

# Run the app
npm start
```

## Scanning with Trivy

```bash
# Scan dependencies
trivy fs --security-checks vuln .

# Scan with config checks
trivy fs --security-checks vuln,config .

# Output JSON
trivy fs --format json --output trivy-results.json .

# Scan Docker image
trivy image todo-app:latest
```

## Known CVEs Detected

- CVE-2021-23337 (lodash prototype pollution)
- CVE-2022-31197 (moment ReDoS)
- CVE-2020-26116 (axios SSRF)
- CVE-2022-23529 (jsonwebtoken)
- And more...
