# Usage Example

This document shows how to use the Markdown Frontmatter Agent.

## Quick Start

1. **Set your API key:**
   ```bash
   export LLM_API_KEY=your-api-key-here
   ```

2. **Run the agent:**
   ```bash
   python markdown_frontmatter_agent.py
   ```

## Example Output

```
🤖 Markdown Frontmatter Agent
Analyzing markdown files in current directory...
Working directory: /path/to/your/project

============================================================
MARKDOWN FRONTMATTER AGENT - PROCESSING SUMMARY
============================================================
Total files found: 3
Successfully processed: 2
Skipped (already complete): 1
Failed: 0

✅ PROCESSED FILES:
   • README.md - added title and description
     Title: 'Project Documentation Guide'
     Description: 'Comprehensive guide for setting up and using the project features'
   • CHANGELOG.md - added description
     Title: 'Project Changelog'
     Description: 'Version history and release notes for project updates'

⏭️  SKIPPED FILES:
   • CONTRIBUTING.md - skipped - already has complete frontmatter

============================================================
```

## Before and After Examples

### Before Processing
```markdown
# Getting Started

This guide helps you get started with the project.

## Installation
...
```

### After Processing
```markdown
---
title: Getting Started Guide
description: Comprehensive guide for project installation and basic usage
---

# Getting Started

This guide helps you get started with the project.

## Installation
...
```

## Features Demonstrated

- ✅ **Automatic Discovery**: Finds all `.md` files in current directory
- ✅ **Smart Analysis**: Preserves existing frontmatter and only adds missing fields
- ✅ **AI-Powered Content**: Uses LLM to generate contextual titles and descriptions
- ✅ **Safe Processing**: Never overwrites existing title/description fields
- ✅ **Comprehensive Logging**: Detailed progress reporting and error handling