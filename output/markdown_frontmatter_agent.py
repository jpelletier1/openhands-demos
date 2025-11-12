#!/usr/bin/env python3
"""
Markdown Frontmatter Agent

This agent analyzes markdown files in the current directory and ensures they have
proper YAML frontmatter with 'title' and 'description' fields. If these fields are
missing, the agent will add them based on content analysis.

Usage:
    python markdown_frontmatter_agent.py

Environment Variables:
    LLM_API_KEY: Required API key for the language model
    LLM_MODEL: Optional model name (default: anthropic/claude-sonnet-4-5-20250929)
"""

import os
import re
import sys
import glob
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass

import yaml
from openhands.sdk import LLM, Agent, Conversation, Tool
from openhands.tools.file_editor import FileEditorTool
from openhands.tools.terminal import TerminalTool


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('frontmatter_agent.log')
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class FrontmatterAnalysis:
    """Results of frontmatter analysis for a markdown file."""
    has_frontmatter: bool
    has_title: bool
    has_description: bool
    existing_frontmatter: Dict[str, Any]
    content_without_frontmatter: str
    needs_processing: bool


@dataclass
class ProcessingResult:
    """Results of processing a single markdown file."""
    filename: str
    success: bool
    action_taken: str
    error_message: Optional[str] = None
    generated_title: Optional[str] = None
    generated_description: Optional[str] = None


class MarkdownAnalyzer:
    """Handles discovery and analysis of markdown files."""
    
    def __init__(self, directory: str = "."):
        self.directory = Path(directory)
        logger.info(f"Initialized MarkdownAnalyzer for directory: {self.directory.absolute()}")
    
    def find_markdown_files(self) -> List[Path]:
        """Find all markdown files in the current directory (no subdirectories)."""
        pattern = str(self.directory / "*.md")
        markdown_files = [Path(f) for f in glob.glob(pattern)]
        logger.info(f"Found {len(markdown_files)} markdown files: {[f.name for f in markdown_files]}")
        return markdown_files
    
    def analyze_file(self, filepath: Path) -> FrontmatterAnalysis:
        """Analyze a markdown file for frontmatter and content."""
        logger.info(f"Analyzing file: {filepath.name}")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Error reading file {filepath.name}: {e}")
            return FrontmatterAnalysis(
                has_frontmatter=False,
                has_title=False,
                has_description=False,
                existing_frontmatter={},
                content_without_frontmatter="",
                needs_processing=False
            )
        
        # Check for YAML frontmatter
        frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
        
        if frontmatter_match:
            yaml_content = frontmatter_match.group(1)
            markdown_content = frontmatter_match.group(2)
            
            try:
                frontmatter = yaml.safe_load(yaml_content) or {}
            except yaml.YAMLError as e:
                logger.warning(f"Invalid YAML frontmatter in {filepath.name}: {e}")
                frontmatter = {}
            
            has_title = 'title' in frontmatter and frontmatter['title']
            has_description = 'description' in frontmatter and frontmatter['description']
            
            analysis = FrontmatterAnalysis(
                has_frontmatter=True,
                has_title=has_title,
                has_description=has_description,
                existing_frontmatter=frontmatter,
                content_without_frontmatter=markdown_content,
                needs_processing=not (has_title and has_description)
            )
        else:
            # No frontmatter found
            analysis = FrontmatterAnalysis(
                has_frontmatter=False,
                has_title=False,
                has_description=False,
                existing_frontmatter={},
                content_without_frontmatter=content,
                needs_processing=True
            )
        
        logger.info(f"Analysis for {filepath.name}: frontmatter={analysis.has_frontmatter}, "
                   f"title={analysis.has_title}, description={analysis.has_description}, "
                   f"needs_processing={analysis.needs_processing}")
        
        return analysis


class ContentProcessor:
    """Handles LLM-based content analysis and generation."""
    
    def __init__(self, llm: LLM):
        self.llm = llm
        logger.info("Initialized ContentProcessor with LLM")
    
    def generate_title_and_description(self, content: str, filename: str) -> Tuple[str, str]:
        """Generate title and description from markdown content using LLM."""
        logger.info(f"Generating title and description for content from {filename}")
        
        # Create a focused prompt for content analysis
        prompt = f"""Analyze the following markdown content and generate:
1. A brief title (maximum 4 words) that captures the main topic
2. A concise description (maximum 19 words) that summarizes what the content covers

Markdown content from file "{filename}":
---
{content[:2000]}  # Limit content to avoid token limits
---

Requirements:
- Title: Must be 4 words or fewer, descriptive and clear
- Description: Must be 19 words or fewer, informative summary
- If content is minimal or unclear, create generic but relevant titles/descriptions
- Focus on the main purpose or topic of the content

Respond in this exact format:
TITLE: [your title here]
DESCRIPTION: [your description here]"""

        try:
            # Use the LLM to analyze content
            response = self.llm.complete(prompt)
            response_text = response.choices[0].message.content
            
            # Parse the response
            title_match = re.search(r'TITLE:\s*(.+)', response_text)
            description_match = re.search(r'DESCRIPTION:\s*(.+)', response_text)
            
            if title_match and description_match:
                title = title_match.group(1).strip()
                description = description_match.group(1).strip()
                
                # Validate length constraints
                title_words = len(title.split())
                description_words = len(description.split())
                
                if title_words > 5:
                    logger.warning(f"Generated title too long ({title_words} words), truncating")
                    title = ' '.join(title.split()[:4])
                
                if description_words > 20:
                    logger.warning(f"Generated description too long ({description_words} words), truncating")
                    description = ' '.join(description.split()[:19])
                
                logger.info(f"Generated - Title: '{title}' ({len(title.split())} words), "
                           f"Description: '{description}' ({len(description.split())} words)")
                
                return title, description
            else:
                logger.error("Failed to parse LLM response for title/description")
                return self._generate_fallback_content(filename)
                
        except Exception as e:
            logger.error(f"Error generating content with LLM: {e}")
            return self._generate_fallback_content(filename)
    
    def _generate_fallback_content(self, filename: str) -> Tuple[str, str]:
        """Generate fallback title and description when LLM fails."""
        base_name = Path(filename).stem.replace('_', ' ').replace('-', ' ').title()
        title = f"{base_name} Documentation"
        description = f"Documentation and information about {base_name.lower()}"
        
        logger.info(f"Using fallback content - Title: '{title}', Description: '{description}'")
        return title, description


class FrontmatterManager:
    """Handles YAML frontmatter parsing, merging, and generation."""
    
    def merge_frontmatter(self, existing: Dict[str, Any], title: str, description: str) -> Dict[str, Any]:
        """Merge new title/description with existing frontmatter."""
        logger.info("Merging frontmatter with new title/description")
        
        # Create a copy of existing frontmatter
        merged = existing.copy()
        
        # Add or update title and description
        if not merged.get('title'):
            merged['title'] = title
            logger.info(f"Added title: '{title}'")
        
        if not merged.get('description'):
            merged['description'] = description
            logger.info(f"Added description: '{description}'")
        
        return merged
    
    def generate_frontmatter_yaml(self, frontmatter: Dict[str, Any]) -> str:
        """Generate properly formatted YAML frontmatter."""
        logger.info("Generating YAML frontmatter")
        
        try:
            # Use yaml.dump with proper formatting
            yaml_content = yaml.dump(
                frontmatter,
                default_flow_style=False,
                allow_unicode=True,
                sort_keys=False
            )
            
            # Ensure clean formatting
            yaml_content = yaml_content.strip()
            
            return f"---\n{yaml_content}\n---\n"
            
        except Exception as e:
            logger.error(f"Error generating YAML: {e}")
            # Fallback to manual generation
            lines = ["---"]
            for key, value in frontmatter.items():
                if isinstance(value, str):
                    lines.append(f"{key}: {value}")
                else:
                    lines.append(f"{key}: {yaml.dump(value).strip()}")
            lines.extend(["---", ""])
            return "\n".join(lines)


class FileUpdater:
    """Handles safe file updating with new frontmatter."""
    
    def update_file(self, filepath: Path, new_frontmatter: str, content: str) -> bool:
        """Update a markdown file with new frontmatter."""
        logger.info(f"Updating file: {filepath.name}")
        
        try:
            # Combine frontmatter and content
            new_content = new_frontmatter + content
            
            # Write to file
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            logger.info(f"Successfully updated {filepath.name}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating file {filepath.name}: {e}")
            return False


class MarkdownFrontmatterAgent:
    """Main agent class that orchestrates the frontmatter processing."""
    
    def __init__(self):
        logger.info("Initializing Markdown Frontmatter Agent")
        
        # Initialize OpenHands SDK components
        self.llm = self._setup_llm()
        self.agent = self._setup_agent()
        
        # Initialize processing components
        self.analyzer = MarkdownAnalyzer()
        self.content_processor = ContentProcessor(self.llm)
        self.frontmatter_manager = FrontmatterManager()
        self.file_updater = FileUpdater()
        
        logger.info("Agent initialization complete")
    
    def _setup_llm(self) -> LLM:
        """Setup the LLM with proper configuration."""
        api_key = os.getenv("LLM_API_KEY")
        if not api_key:
            logger.error("LLM_API_KEY environment variable is required")
            sys.exit(1)
        
        model = os.getenv("LLM_MODEL", "anthropic/claude-sonnet-4-5-20250929")
        
        logger.info(f"Setting up LLM with model: {model}")
        
        return LLM(
            model=model,
            api_key=api_key,
        )
    
    def _setup_agent(self) -> Agent:
        """Setup the OpenHands agent with required tools."""
        logger.info("Setting up OpenHands agent")
        
        return Agent(
            llm=self.llm,
            tools=[
                Tool(name=FileEditorTool.name),
                Tool(name=TerminalTool.name),
            ],
        )
    
    def process_directory(self) -> List[ProcessingResult]:
        """Process all markdown files in the current directory."""
        logger.info("Starting directory processing")
        
        # Find all markdown files
        markdown_files = self.analyzer.find_markdown_files()
        
        if not markdown_files:
            logger.info("No markdown files found in current directory")
            return []
        
        results = []
        
        for filepath in markdown_files:
            result = self.process_file(filepath)
            results.append(result)
        
        self._print_summary(results)
        return results
    
    def process_file(self, filepath: Path) -> ProcessingResult:
        """Process a single markdown file."""
        logger.info(f"Processing file: {filepath.name}")
        
        try:
            # Analyze the file
            analysis = self.analyzer.analyze_file(filepath)
            
            if not analysis.needs_processing:
                logger.info(f"File {filepath.name} already has complete frontmatter")
                return ProcessingResult(
                    filename=filepath.name,
                    success=True,
                    action_taken="skipped - already has complete frontmatter"
                )
            
            # Generate missing content
            title, description = self.content_processor.generate_title_and_description(
                analysis.content_without_frontmatter,
                filepath.name
            )
            
            # Merge with existing frontmatter
            merged_frontmatter = self.frontmatter_manager.merge_frontmatter(
                analysis.existing_frontmatter,
                title,
                description
            )
            
            # Generate new frontmatter YAML
            frontmatter_yaml = self.frontmatter_manager.generate_frontmatter_yaml(merged_frontmatter)
            
            # Update the file
            success = self.file_updater.update_file(
                filepath,
                frontmatter_yaml,
                analysis.content_without_frontmatter
            )
            
            if success:
                action = []
                if not analysis.has_title:
                    action.append("added title")
                if not analysis.has_description:
                    action.append("added description")
                if not analysis.has_frontmatter:
                    action.append("created frontmatter")
                
                return ProcessingResult(
                    filename=filepath.name,
                    success=True,
                    action_taken=" and ".join(action),
                    generated_title=title,
                    generated_description=description
                )
            else:
                return ProcessingResult(
                    filename=filepath.name,
                    success=False,
                    action_taken="failed to update file",
                    error_message="File write operation failed"
                )
                
        except Exception as e:
            logger.error(f"Error processing file {filepath.name}: {e}")
            return ProcessingResult(
                filename=filepath.name,
                success=False,
                action_taken="error during processing",
                error_message=str(e)
            )
    
    def _print_summary(self, results: List[ProcessingResult]):
        """Print a summary of processing results."""
        print("\n" + "="*60)
        print("MARKDOWN FRONTMATTER AGENT - PROCESSING SUMMARY")
        print("="*60)
        
        successful = [r for r in results if r.success]
        failed = [r for r in results if not r.success]
        skipped = [r for r in results if r.success and "skipped" in r.action_taken]
        processed = [r for r in results if r.success and "skipped" not in r.action_taken]
        
        print(f"Total files found: {len(results)}")
        print(f"Successfully processed: {len(processed)}")
        print(f"Skipped (already complete): {len(skipped)}")
        print(f"Failed: {len(failed)}")
        
        if processed:
            print(f"\n✅ PROCESSED FILES:")
            for result in processed:
                print(f"   • {result.filename} - {result.action_taken}")
                if result.generated_title:
                    print(f"     Title: '{result.generated_title}'")
                if result.generated_description:
                    print(f"     Description: '{result.generated_description}'")
        
        if skipped:
            print(f"\n⏭️  SKIPPED FILES:")
            for result in skipped:
                print(f"   • {result.filename} - {result.action_taken}")
        
        if failed:
            print(f"\n❌ FAILED FILES:")
            for result in failed:
                print(f"   • {result.filename} - {result.action_taken}")
                if result.error_message:
                    print(f"     Error: {result.error_message}")
        
        print("\n" + "="*60)
        
        # Log summary
        logger.info(f"Processing complete: {len(processed)} processed, {len(skipped)} skipped, {len(failed)} failed")


def main():
    """Main entry point for the agent."""
    print("🤖 Markdown Frontmatter Agent")
    print("Analyzing markdown files in current directory...")
    print(f"Working directory: {os.getcwd()}")
    
    try:
        agent = MarkdownFrontmatterAgent()
        results = agent.process_directory()
        
        # Exit with appropriate code
        failed_count = len([r for r in results if not r.success])
        if failed_count > 0:
            logger.warning(f"Agent completed with {failed_count} failures")
            sys.exit(1)
        else:
            logger.info("Agent completed successfully")
            sys.exit(0)
            
    except KeyboardInterrupt:
        logger.info("Agent interrupted by user")
        print("\n⚠️  Agent interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Agent failed with error: {e}")
        print(f"\n❌ Agent failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()