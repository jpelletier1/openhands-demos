# Markdown Frontmatter Agent

An intelligent agent built with the OpenHands SDK that automatically analyzes markdown files and ensures they have proper YAML frontmatter with `title` and `description` fields.

## Features

- **Automatic Discovery**: Finds all `.md` files in the current directory
- **Smart Analysis**: Uses AI to analyze markdown content and generate meaningful titles and descriptions
- **Safe Processing**: Preserves existing frontmatter and file structure
- **Comprehensive Logging**: Detailed progress reporting and error handling
- **Flexible Handling**: Works with files that have no frontmatter, partial frontmatter, or complete frontmatter

## Requirements

- Python 3.8+
- OpenHands SDK
- LLM API key (Anthropic Claude, OpenAI, or other LiteLLM-supported provider)

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set your LLM API key:
```bash
export LLM_API_KEY=your-api-key-here
```

3. Optionally set the model (default is Claude Sonnet):
```bash
export LLM_MODEL=anthropic/claude-sonnet-4-5-20250929
```

## Usage

Run the agent in any directory containing markdown files:

```bash
python markdown_frontmatter_agent.py
```

The agent will:
1. Scan the current directory for `.md` files
2. Analyze each file's frontmatter and content
3. Generate missing `title` and `description` fields using AI
4. Update files with proper YAML frontmatter
5. Provide a detailed summary of all actions taken

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

## How It Works

### Content Analysis
The agent uses advanced language models to analyze the entire content of each markdown file, not just headings. This ensures accurate and contextual title and description generation.

### Frontmatter Handling
- **No frontmatter**: Creates new YAML frontmatter with title and description
- **Partial frontmatter**: Adds missing fields while preserving existing ones
- **Complete frontmatter**: Skips processing to avoid overwriting existing content

### Constraints
- **Title**: Maximum 4 words, descriptive and clear
- **Description**: Maximum 19 words, informative summary
- **Format**: Standard YAML frontmatter enclosed in `---`

### File Safety
- Validates YAML before writing
- Preserves existing frontmatter structure and values
- Comprehensive error handling with detailed logging
- Creates log file (`frontmatter_agent.log`) for debugging

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_API_KEY` | **Required** - API key for your LLM provider | None |
| `LLM_MODEL` | Model to use for content analysis | `anthropic/claude-sonnet-4-5-20250929` |

### Supported LLM Providers

The agent supports any LiteLLM-compatible provider:
- Anthropic Claude
- OpenAI GPT models
- OpenHands Cloud
- Other LiteLLM providers

## Examples

### Before Processing
```markdown
# My Project

This is a great project that does amazing things.

## Features
- Feature 1
- Feature 2
```

### After Processing
```markdown
---
title: My Project Guide
description: Documentation for a project with amazing features and capabilities
---

# My Project

This is a great project that does amazing things.

## Features
- Feature 1
- Feature 2
```

## Troubleshooting

### Common Issues

**"LLM_API_KEY environment variable is required"**
- Set your API key: `export LLM_API_KEY=your-key-here`

**"No markdown files found"**
- Ensure you're in a directory with `.md` files
- The agent only processes files in the current directory (no subdirectories)

**"Invalid YAML frontmatter"**
- The agent will attempt to fix malformed YAML
- Check the log file for detailed error information

**"File write operation failed"**
- Check file permissions
- Ensure the file isn't locked by another application

### Logging

The agent creates detailed logs in `frontmatter_agent.log`. Check this file for:
- Processing details for each file
- Error messages and stack traces
- LLM interaction logs
- Performance metrics

## Architecture

The agent is built using the OpenHands SDK and consists of several key components:

- **MarkdownAnalyzer**: Discovers and analyzes markdown files
- **ContentProcessor**: Uses LLM for intelligent content analysis
- **FrontmatterManager**: Handles YAML parsing and generation
- **FileUpdater**: Safely updates files with new frontmatter
- **MarkdownFrontmatterAgent**: Orchestrates the entire process

## Contributing

This agent demonstrates the power of the OpenHands SDK for building intelligent file processing tools. Feel free to extend it with additional features like:

- Custom frontmatter fields
- Batch processing of subdirectories
- Integration with git workflows
- Custom content analysis prompts

## License

This project is part of the OpenHands demos repository and follows the same licensing terms.