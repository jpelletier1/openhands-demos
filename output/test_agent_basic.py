#!/usr/bin/env python3
"""
Basic test script for the Markdown Frontmatter Agent
Tests the core functionality without requiring an API key
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path

# Add the current directory to the path so we can import our agent
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from markdown_frontmatter_agent import (
    MarkdownAnalyzer, 
    FrontmatterManager, 
    FileUpdater,
    FrontmatterAnalysis
)

def test_markdown_analyzer():
    """Test the MarkdownAnalyzer component"""
    print("🧪 Testing MarkdownAnalyzer...")
    
    # Create a temporary directory with test files
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Create test files
        (temp_path / "test1.md").write_text("""# Test File
This is a test markdown file without frontmatter.
""")
        
        (temp_path / "test2.md").write_text("""---
title: Existing Title
---
# Test File
This file has partial frontmatter.
""")
        
        (temp_path / "test3.md").write_text("""---
title: Complete Title
description: Complete description
author: Test Author
---
# Test File
This file has complete frontmatter.
""")
        
        # Test the analyzer
        analyzer = MarkdownAnalyzer(temp_dir)
        files = analyzer.find_markdown_files()
        
        assert len(files) == 3, f"Expected 3 files, found {len(files)}"
        print(f"✅ Found {len(files)} markdown files")
        
        # Test analysis of each file
        for file in files:
            analysis = analyzer.analyze_file(file)
            print(f"   📄 {file.name}: frontmatter={analysis.has_frontmatter}, "
                  f"title={analysis.has_title}, description={analysis.has_description}, "
                  f"needs_processing={analysis.needs_processing}")
        
        print("✅ MarkdownAnalyzer tests passed!")

def test_frontmatter_manager():
    """Test the FrontmatterManager component"""
    print("\n🧪 Testing FrontmatterManager...")
    
    manager = FrontmatterManager()
    
    # Test merging frontmatter
    existing = {"author": "John Doe", "date": "2024-01-01"}
    merged = manager.merge_frontmatter(existing, "Test Title", "Test description")
    
    expected_keys = {"author", "date", "title", "description"}
    assert set(merged.keys()) == expected_keys, f"Expected keys {expected_keys}, got {set(merged.keys())}"
    assert merged["title"] == "Test Title"
    assert merged["description"] == "Test description"
    assert merged["author"] == "John Doe"
    
    # Test YAML generation
    yaml_content = manager.generate_frontmatter_yaml(merged)
    assert yaml_content.startswith("---\n")
    assert yaml_content.endswith("---\n")
    assert "title: Test Title" in yaml_content
    assert "description: Test description" in yaml_content
    
    print("✅ FrontmatterManager tests passed!")

def test_file_updater():
    """Test the FileUpdater component"""
    print("\n🧪 Testing FileUpdater...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        test_file = temp_path / "test.md"
        
        # Create a test file
        original_content = "# Test\nThis is test content."
        test_file.write_text(original_content)
        
        # Test updating the file
        updater = FileUpdater()
        frontmatter = "---\ntitle: Test Title\ndescription: Test description\n---\n"
        
        success = updater.update_file(test_file, frontmatter, original_content)
        assert success, "File update should succeed"
        
        # Verify the file was updated correctly
        updated_content = test_file.read_text()
        expected_content = frontmatter + original_content
        assert updated_content == expected_content, "File content should match expected"
        
        print("✅ FileUpdater tests passed!")

def test_integration():
    """Test integration of components"""
    print("\n🧪 Testing Integration...")
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Create a test file without frontmatter
        test_file = temp_path / "integration_test.md"
        content = """# Integration Test
This is a test file for integration testing.

## Features
- Feature 1
- Feature 2

## Usage
This shows how to use the features.
"""
        test_file.write_text(content)
        
        # Test the workflow
        analyzer = MarkdownAnalyzer(temp_dir)
        manager = FrontmatterManager()
        updater = FileUpdater()
        
        # Analyze the file
        files = analyzer.find_markdown_files()
        assert len(files) == 1
        
        analysis = analyzer.analyze_file(files[0])
        assert analysis.needs_processing
        assert not analysis.has_frontmatter
        assert not analysis.has_title
        assert not analysis.has_description
        
        # Generate mock title and description (simulating LLM output)
        mock_title = "Integration Test Guide"
        mock_description = "Test file demonstrating integration testing features and usage"
        
        # Merge frontmatter
        merged = manager.merge_frontmatter({}, mock_title, mock_description)
        yaml_content = manager.generate_frontmatter_yaml(merged)
        
        # Update the file
        success = updater.update_file(files[0], yaml_content, analysis.content_without_frontmatter)
        assert success
        
        # Verify the result
        updated_content = test_file.read_text()
        assert updated_content.startswith("---\n")
        assert "title: Integration Test Guide" in updated_content
        assert "description: Test file demonstrating integration testing features and usage" in updated_content
        assert "# Integration Test" in updated_content
        
        print("✅ Integration tests passed!")

def main():
    """Run all tests"""
    print("🚀 Running Markdown Frontmatter Agent Tests\n")
    
    try:
        test_markdown_analyzer()
        test_frontmatter_manager()
        test_file_updater()
        test_integration()
        
        print("\n🎉 All tests passed! The agent components are working correctly.")
        print("\n📝 Note: This test validates the core functionality without requiring an LLM API key.")
        print("   To test the full agent with LLM integration, set LLM_API_KEY and run the main agent.")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()