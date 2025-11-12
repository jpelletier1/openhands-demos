#!/usr/bin/env python3
"""
Markdown Frontmatter Generator Agent

A simple agent that scans markdown files and adds frontmatter with title and description
based on the file content using the OpenHands SDK.

Usage:
    python frontmatter_agent_simple.py [directory_path]

Environment Variables:
    LLM_API_KEY: Required API key for Claude Sonnet 4.5
    LOG_LEVEL: Optional logging level (default: INFO)
"""

import os
import sys
import logging
import glob
import re
from pathlib import Path
from typing import List, Optional, Dict, Any

# OpenHands SDK imports
from openhands.sdk import LLM, Message

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class FrontmatterGenerator:
    """Simple frontmatter generator using OpenHands SDK"""
    
    def __init__(self, directory: str = "."):
        self.directory = Path(directory).resolve()
        self.llm = None
        self.stats = {
            'processed': 0,
            'updated': 0,
            'skipped': 0,
            'errors': 0
        }
        
        # Initialize LLM
        self._init_llm()
    
    def _init_llm(self):
        """Initialize the LLM with Claude Sonnet 4.5"""
        api_key = os.getenv("LLM_API_KEY")
        if not api_key:
            raise ValueError("LLM_API_KEY environment variable is required")
        
        try:
            self.llm = LLM(
                model="openhands/claude-sonnet-4-5-20250929",
                api_key=api_key
            )
            logger.info("✅ LLM initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize LLM: {e}")
            raise
    
    def find_markdown_files(self) -> List[Path]:
        """Find all markdown files in the directory"""
        markdown_files = []
        
        # Directories to exclude
        exclude_dirs = {
            'node_modules', '.git', 'vendor', '__pycache__', 
            '.venv', 'venv', '.env', 'dist', 'build'
        }
        
        for md_file in self.directory.rglob("*.md"):
            # Skip files in excluded directories
            if any(part in exclude_dirs for part in md_file.parts):
                continue
            markdown_files.append(md_file)
        
        logger.info(f"📁 Found {len(markdown_files)} markdown files")
        return markdown_files
    
    def has_frontmatter(self, content: str) -> bool:
        """Check if content already has frontmatter"""
        return content.strip().startswith('---')
    
    def generate_frontmatter(self, content: str, filename: str) -> Optional[Dict[str, str]]:
        """Generate frontmatter using LLM"""
        try:
            prompt = f"""
Analyze this markdown file content and generate YAML frontmatter with exactly these two fields:
- title: A brief title (maximum 5 words)
- description: A brief description (maximum 20 words, one sentence)

File: {filename}
Content:
{content[:2000]}  # Limit content to avoid token limits

Respond with ONLY the YAML frontmatter in this exact format:
---
title: Your Title Here
description: Your description here.
---

Do not include any other text or explanations.
"""
            
            logger.debug(f"🤖 Generating frontmatter for {filename}")
            messages = [Message(role='user', content=prompt)]
            response = self.llm.completion(messages)
            
            if not response or not response.message:
                logger.error(f"❌ Empty response from LLM for {filename}")
                return None
            
            # Extract text content from response message
            response_text = ""
            if response.message.content:
                for content_item in response.message.content:
                    if hasattr(content_item, 'text'):
                        response_text += content_item.text
            
            if not response_text:
                logger.error(f"❌ No text content in response for {filename}")
                return None
            
            # Extract frontmatter from response
            frontmatter = self.parse_frontmatter_response(response_text)
            if frontmatter:
                logger.debug(f"✅ Generated frontmatter for {filename}: {frontmatter}")
                return frontmatter
            else:
                logger.error(f"❌ Failed to parse frontmatter from response for {filename}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error generating frontmatter for {filename}: {e}")
            return None
    
    def parse_frontmatter_response(self, response: str) -> Optional[Dict[str, str]]:
        """Parse frontmatter from LLM response"""
        try:
            # Look for YAML frontmatter block
            match = re.search(r'---\s*\n(.*?)\n---', response, re.DOTALL)
            if not match:
                logger.debug("No frontmatter block found in response")
                return None
            
            yaml_content = match.group(1).strip()
            
            # Simple YAML parsing for title and description
            frontmatter = {}
            for line in yaml_content.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip().strip('"\'')
                    if key in ['title', 'description']:
                        frontmatter[key] = value
            
            # Validate we have both fields
            if 'title' in frontmatter and 'description' in frontmatter:
                return frontmatter
            else:
                logger.debug(f"Missing required fields in frontmatter: {frontmatter}")
                return None
                
        except Exception as e:
            logger.error(f"Error parsing frontmatter response: {e}")
            return None
    
    def update_file(self, file_path: Path, frontmatter: Dict[str, str]) -> bool:
        """Update file with frontmatter"""
        try:
            # Read current content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Create frontmatter block
            fm_block = "---\n"
            fm_block += f"title: {frontmatter['title']}\n"
            fm_block += f"description: {frontmatter['description']}\n"
            fm_block += "---\n\n"
            
            # Add frontmatter to content
            new_content = fm_block + content
            
            # Write updated content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            logger.info(f"✅ Updated {file_path.name} with frontmatter")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error updating file {file_path}: {e}")
            return False
    
    def process_files(self) -> Dict[str, int]:
        """Process all markdown files"""
        logger.info(f"🚀 Starting frontmatter generation in {self.directory}")
        
        markdown_files = self.find_markdown_files()
        
        for file_path in markdown_files:
            try:
                self.stats['processed'] += 1
                logger.info(f"📄 Processing {file_path.name} ({self.stats['processed']}/{len(markdown_files)})")
                
                # Read file content
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Skip if already has frontmatter
                if self.has_frontmatter(content):
                    logger.info(f"⏭️  Skipping {file_path.name} (already has frontmatter)")
                    self.stats['skipped'] += 1
                    continue
                
                # Generate frontmatter
                frontmatter = self.generate_frontmatter(content, file_path.name)
                if not frontmatter:
                    logger.error(f"❌ Failed to generate frontmatter for {file_path.name}")
                    self.stats['errors'] += 1
                    continue
                
                # Update file
                if self.update_file(file_path, frontmatter):
                    self.stats['updated'] += 1
                else:
                    self.stats['errors'] += 1
                    
            except Exception as e:
                logger.error(f"❌ Error processing {file_path}: {e}")
                self.stats['errors'] += 1
        
        # Print summary
        self.print_summary()
        return self.stats
    
    def print_summary(self):
        """Print processing summary"""
        logger.info("=" * 50)
        logger.info("📊 PROCESSING SUMMARY")
        logger.info("=" * 50)
        logger.info(f"📄 Files processed: {self.stats['processed']}")
        logger.info(f"✅ Files updated: {self.stats['updated']}")
        logger.info(f"⏭️  Files skipped: {self.stats['skipped']}")
        logger.info(f"❌ Errors: {self.stats['errors']}")
        logger.info("=" * 50)


def main():
    """Main entry point"""
    # Check for API key
    if not os.getenv("LLM_API_KEY"):
        print("❌ LLM_API_KEY environment variable is required")
        print("Please set your API key:")
        print("export LLM_API_KEY='your-api-key-here'")
        sys.exit(1)
    
    # Get directory from command line or use current directory
    directory = sys.argv[1] if len(sys.argv) > 1 else "."
    
    try:
        generator = FrontmatterGenerator(directory)
        generator.process_files()
    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()