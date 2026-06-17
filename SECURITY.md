# Security Policy

## Supported Versions

Currently, only the latest version of the SDG Decision Intelligence Framework is supported with security updates.

| Version | Supported | Release Date |
|---------|-----------|--------------|
| 0.1.x | ✅ Yes | 2024-01-01 |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

### How to Report

**Do not** open a public issue.

Instead, send an email to: [INSERT SECURITY EMAIL]

Your email should include:

- A description of the vulnerability
- Steps to reproduce the vulnerability
- Potential impact of the vulnerability
- Any suggested mitigation (if known)

### What Happens Next

1. We will acknowledge receipt of your report within 48 hours
2. We will investigate the vulnerability
3. We will determine a severity level and remediation plan
4. We will work with you to coordinate disclosure
5. We will release a fix and security advisory

### Disclosure Policy

We aim to:

- Acknowledge vulnerabilities within 48 hours
- Provide regular updates on remediation progress
- Disclose vulnerabilities within 90 days of report
- Credit researchers who report vulnerabilities

## Security Best Practices

### For Users

- Keep dependencies updated
- Review pull requests before merging
- Use environment variables for sensitive data
- Enable security features in your deployment

### For Contributors

- Follow secure coding practices
- Validate all user inputs
- Use parameterized queries to prevent injection
- Keep dependencies up to date
- Review code for security issues

## Security Features

The framework includes the following security features:

- Input validation on all user inputs
- Type safety through TypeScript
- No external API calls by default
- No server-side data persistence
- Client-side only computation

## Known Security Considerations

- The framework runs entirely client-side
- No authentication or authorization is implemented
- All data is processed locally in the browser
- No data is transmitted to external servers

## Dependency Security

We regularly audit dependencies for vulnerabilities:

```bash
npm audit
```

We update dependencies to address security vulnerabilities promptly.

## Security Advisories

Security advisories will be published on GitHub Security Advisories.

## Contact

For security-related questions not related to vulnerability reporting, please open an issue with the "security" label.
