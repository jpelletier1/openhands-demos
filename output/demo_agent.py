#!/usr/bin/env python3
"""
Demo script for the Markdown Frontmatter Agent
Shows the agent working with sample files using mock LLM responses
"""

import os
import sys
import shutil
from pathlib import Path

# Add the current directory to the path so we can import our agent
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from markdown_frontmatter_agent import (
    MarkdownAnalyzer, 
    FrontmatterManager, 
    FileUpdater,
    ProcessingResult
)

class MockContentProcessor:
    """Mock content processor that simulates LLM responses"""
    
    def __init__(self):
        # Predefined responses for our sample files
        self.responses = {
            "sample1.md": ("Getting Started Guide", "Comprehensive guide for project installation and basic usage"),
            "sample2.md": ("API Reference Documentation", "Complete reference for available API endpoints and methods"),
            "sample3.md": ("Complete Documentation", "Comprehensive guide with all features and examples")  # This one already has both
        }
    
    def generate_title_and_description(self, content: str, filename: str) -> tuple[str, str]:
        """Generate mock title and description based on filename"""
        if filename in self.responses:
            return self.responses[filename]
        
        # Fallback for unknown files
        base_name = Path(filename).stem.replace('_', ' ').replace('-', ' ').title()
        return f"{base_name} Documentation", f"Documentation for {base_name.lower()}"

def demo_agent():
    """Demonstrate the agent working with sample files"""
    print("🤖 Markdown Frontmatter Agent Demo")
    print("=" * 50)
    
    # Work in the test_files directory
    test_dir = Path(__file__).parent / "test_files"
    if not test_dir.exists():
        print("❌ test_files directory not found!")
        return
    
    print(f"📁 Working directory: {test_dir}")
    print(f"🔍 Scanning for markdown files...\n")
    
    # Initialize components
    analyzer = MarkdownAnalyzer(str(test_dir))
    content_processor = MockContentProcessor()
    frontmatter_manager = FrontmatterManager()
    file_updater = FileUpdater()
    
    # Find and analyze files
    markdown_files = analyzer.find_markdown_files()
    
    if not markdown_files:
        print("❌ No markdown files found!")
        return
    
    results = []
    
    for filepath in markdown_files:
        print(f"📄 Processing: {filepath.name}")
        print("-" * 30)
        
        # Show original content
        original_content = filepath.read_text()
        print("📖 Original content:")
        print(original_content[:200] + "..." if len(original_content) > 200 else original_content)
        print()
        
        # Analyze the file
        analysis = analyzer.analyze_file(filepath)
        
        print(f"🔍 Analysis:")
        print(f"   • Has frontmatter: {analysis.has_frontmatter}")
        print(f"   • Has title: {analysis.has_title}")
        print(f"   • Has description: {analysis.has_description}")
        print(f"   • Needs processing: {analysis.needs_processing}")
        print()
        
        if not analysis.needs_processing:
            print("⏭️  Skipping - already has complete frontmatter")
            results.append(ProcessingResult(
                filename=filepath.name,
                success=True,
                action_taken="skipped - already has complete frontmatter"
            ))
        else:
            # Generate title and description
            title, description = content_processor.generate_title_and_description(
                analysis.content_without_frontmatter,
                filepath.name
            )
            
            print(f"🧠 Generated content:")
            print(f"   • Title: '{title}'")
            print(f"   • Description: '{description}'")
            print()
            
            # Merge with existing frontmatter
            merged_frontmatter = frontmatter_manager.merge_frontmatter(
                analysis.existing_frontmatter,
                title,
                description
            )
            
            # Generate YAML
            frontmatter_yaml = frontmatter_manager.generate_frontmatter_yaml(merged_frontmatter)
            
            print("📝 Generated frontmatter:")
            print(frontmatter_yaml)
            
            # Update the file
            success = file_updater.update_file(
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
                
                print("✅ File updated successfully!")
                results.append(ProcessingResult(
                    filename=filepath.name,
                    success=True,
                    action_taken=" and ".join(action),
                    generated_title=title,
                    generated_description=description
                ))
            else:
                print("❌ Failed to update file!")
                results.append(ProcessingResult(
                    filename=filepath.name,
                    success=False,
                    action_taken="failed to update file"
                ))
        
        print("\n" + "=" * 50 + "\n")
    
    # Print summary
    print("📊 PROCESSING SUMMARY")
    print("=" * 50)
    
    successful = [r for r in results if r.success]
    failed = [r for r in results if not r.success]
    skipped = [r for r in results if r.success and "skipped" in r.action_taken]
    processed = [r for r in results if r.success and "skipped" not in r.action_taken]
    
    print(f"📈 Total files: {len(results)}")
    print(f"✅ Successfully processed: {len(processed)}")
    print(f"⏭️  Skipped (already complete): {len(skipped)}")
    print(f"❌ Failed: {len(failed)}")
    
    if processed:
        print(f"\n🎉 PROCESSED FILES:")
        for result in processed:
            print(f"   • {result.filename} - {result.action_taken}")
            if result.generated_title:
                print(f"     📝 Title: '{result.generated_title}'")
            if result.generated_description:
                print(f"     📝 Description: '{result.generated_description}'")
    
    if skipped:
        print(f"\n⏭️  SKIPPED FILES:")
        for result in skipped:
            print(f"   • {result.filename} - {result.action_taken}")
    
    if failed:
        print(f"\n❌ FAILED FILES:")
        for result in failed:
            print(f"   • {result.filename} - {result.action_taken}")
    
    print("\n" + "=" * 50)
    print("🎯 Demo completed! Check the files to see the results.")
    
    # Show updated files
    print("\n📋 Updated file contents:")
    for filepath in markdown_files:
        print(f"\n📄 {filepath.name}:")
        print("-" * 20)
        content = filepath.read_text()
        print(content[:300] + "..." if len(content) > 300 else content)

def main():
    """Run the demo"""
    try:
        demo_agent()
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()