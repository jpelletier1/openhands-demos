# Markdown Frontmatter Agent - Technical Implementation Plan

## Overview
This agent analyzes markdown files in the current directory and ensures they have proper YAML frontmatter with `title` and `description` fields. If these fields are missing, the agent will add them based on the content analysis of the markdown file.

## Requirements Summary
- **Scope**: Analyze markdown files in current directory only (no subdirectories)
- **Frontmatter Format**: YAML frontmatter (enclosed in `---`)
- **Target Fields**: `title` (< 5 words) and `description` (< 20 words)
- **Behavior**: 
  - If frontmatter exists but missing title/description → add missing fields
  - If no frontmatter exists → create new frontmatter with both fields
- **Content Analysis**: Analyze entire markdown content to generate meaningful title and description

## Technical Architecture

### Core Components

#### 1. OpenHands SDK Integration
- **LLM**: Use Claude Sonnet for content analysis and generation
- **Agent**: Standard OpenHands agent with file editing capabilities
- **Tools**: FileEditorTool for reading/writing markdown files
- **Workspace**: Local workspace in current directory

#### 2. Markdown Processing Pipeline
```
1. Directory Scan → 2. File Analysis → 3. Frontmatter Check → 4. Content Analysis → 5. Frontmatter Generation → 6. File Update
```

#### 3. Key Modules

**MarkdownAnalyzer**
- Scan directory for `.md` files
- Parse existing frontmatter (if any)
- Extract and analyze markdown content
- Identify missing title/description fields

**ContentProcessor**
- Analyze markdown content using LLM
- Generate concise title (< 5 words)
- Generate brief description (< 20 words)
- Handle edge cases (empty files, minimal content)

**FrontmatterManager**
- Parse existing YAML frontmatter
- Merge new fields with existing frontmatter
- Generate properly formatted YAML frontmatter
- Preserve existing field order when possible

**FileUpdater**
- Create backup of original files (optional)
- Update files with new/modified frontmatter
- Maintain file permissions and metadata

## Implementation Strategy

### Phase 1: Core Agent Setup
1. Set up OpenHands SDK environment
2. Configure LLM (Claude Sonnet)
3. Initialize agent with FileEditorTool
4. Create basic conversation framework

### Phase 2: Markdown Discovery & Analysis
1. Implement directory scanning for `.md` files
2. Create markdown file parser
3. Implement frontmatter detection and parsing
4. Build content extraction logic

### Phase 3: Content Analysis & Generation
1. Implement LLM-based content analysis
2. Create title generation logic (< 5 words)
3. Create description generation logic (< 20 words)
4. Handle edge cases (empty files, minimal content)

### Phase 4: Frontmatter Management
1. Implement YAML frontmatter parsing
2. Create frontmatter merging logic
3. Implement frontmatter generation
4. Ensure proper YAML formatting

### Phase 5: File Operations
1. Implement safe file updating
2. Add error handling and validation
3. Create logging and progress reporting
4. Add dry-run capability for testing

### Phase 6: Integration & Testing
1. Integrate all components
2. Test with various markdown file scenarios
3. Validate frontmatter generation quality
4. Performance optimization

## Data Flow

```
Input: Current Directory
    ↓
Scan for *.md files
    ↓
For each markdown file:
    ↓
Parse existing frontmatter (if any)
    ↓
Check for title/description fields
    ↓
If missing fields:
    ↓
Analyze markdown content with LLM
    ↓
Generate title (< 5 words) & description (< 20 words)
    ↓
Merge with existing frontmatter
    ↓
Update file with new frontmatter
    ↓
Log results
```

## Key Technical Decisions

### 1. LLM Integration
- **Choice**: Use OpenHands SDK's LLM integration with Claude Sonnet
- **Rationale**: Excellent content analysis and concise text generation capabilities

### 2. File Processing Strategy
- **Choice**: Process files sequentially with individual LLM calls
- **Rationale**: Ensures accurate content analysis per file, manageable for typical directory sizes

### 3. Frontmatter Handling
- **Choice**: Use PyYAML for parsing/generation
- **Rationale**: Robust YAML handling, preserves formatting and comments

### 4. Error Handling
- **Choice**: Graceful degradation with detailed logging
- **Rationale**: Continue processing other files if one fails, provide clear feedback

### 5. Content Analysis Approach
- **Choice**: Analyze entire markdown content rather than just headings
- **Rationale**: More accurate title/description generation, handles various markdown structures

## Expected Challenges & Solutions

### Challenge 1: Frontmatter Preservation
- **Issue**: Maintaining existing frontmatter structure and comments
- **Solution**: Parse existing frontmatter, merge new fields, preserve order

### Challenge 2: Content Analysis Quality
- **Issue**: Generating meaningful titles/descriptions from diverse content
- **Solution**: Use structured prompts with examples, validate length constraints

### Challenge 3: File Safety
- **Issue**: Risk of corrupting markdown files
- **Solution**: Validate YAML before writing, implement dry-run mode

### Challenge 4: Performance
- **Issue**: LLM calls for each file may be slow
- **Solution**: Process files sequentially with progress reporting, consider batching for large directories

## Success Criteria

1. **Functionality**: Successfully processes all markdown files in directory
2. **Accuracy**: Generates relevant titles (< 5 words) and descriptions (< 20 words)
3. **Safety**: Preserves existing frontmatter and file integrity
4. **Usability**: Clear logging and progress reporting
5. **Robustness**: Handles edge cases gracefully (empty files, malformed frontmatter, etc.)

## File Structure

```
output/
├── markdown_frontmatter_agent.py    # Main agent implementation
├── requirements.txt                 # Python dependencies
└── README.md                       # Usage instructions and examples
```

## Usage Example

```bash
# Set environment variables
export LLM_API_KEY=your-api-key-here

# Run the agent in current directory
python markdown_frontmatter_agent.py

# Expected output:
# Processing markdown files in current directory...
# ✓ file1.md - Added title and description
# ✓ file2.md - Added missing description  
# ✓ file3.md - Already has complete frontmatter
# Processed 3 files successfully
```

This plan provides a comprehensive roadmap for implementing the markdown frontmatter agent using the OpenHands SDK, ensuring robust functionality while maintaining file safety and generating high-quality content analysis.