---
name: test_runner
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - run tests
  - run the tests
  - show test results
  - test results in browser
  - display test results
---

# Test Runner Microagent

This microagent helps run integration tests for the shopping_app and display the results in a browser-friendly HTML format.

## Capabilities

When triggered, this microagent will:

1. Run the Jest integration tests for shopping_app
2. Generate an HTML report of the test results
3. Serve the report on an available port for viewing in the OpenHands browser
4. Provide the URL to view the results

## Implementation Steps

### 1. Run Tests and Capture Output

Navigate to the shopping_app directory and run tests with verbose output:

```bash
cd /workspace/project/openhands-demos/shopping_app
npm test -- --verbose --json --outputFile=test-results.json 2>&1 | tee test-output.txt
```

### 2. Generate HTML Report

Create an HTML file that displays the test results in a user-friendly format:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shopping Cart Test Results</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }
        .test-results {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .test-item {
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .test-item.passed {
            border-left: 4px solid #22c55e;
        }
        .test-item.failed {
            border-left: 4px solid #ef4444;
        }
        .test-name {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .test-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }
        .status-passed {
            background-color: #dcfce7;
            color: #166534;
        }
        .status-failed {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .test-duration {
            color: #666;
            font-size: 14px;
        }
        .pass-rate {
            color: #22c55e;
        }
        .fail-rate {
            color: #ef4444;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Shopping Cart Integration Test Results</h1>
        <p>Comprehensive test suite for cart functionality</p>
    </div>
    
    <div class="summary">
        <!-- Summary cards will be populated here -->
    </div>
    
    <div class="test-results">
        <!-- Test results will be populated here -->
    </div>
    
    <script>
        // Parse and display test results from JSON or text output
    </script>
</body>
</html>
```

### 3. Parse Test Results

Parse the test output to extract:
- Total tests run
- Tests passed
- Tests failed
- Individual test names and statuses
- Test durations
- Overall test suite duration

### 4. Serve the Report

Use a simple HTTP server to serve the HTML report:

```bash
cd /workspace/project/openhands-demos/shopping_app
python3 -m http.server 12001 --directory .
```

### 5. Provide the URL

Give the user the URL to view the test results:
- https://work-2-angmgpptuwafuigr.prod-runtime.all-hands.dev

## Notes

- The server must be running on port 12000 for the tests to execute properly
- Tests should be run from the shopping_app directory
- If tests fail, the report should clearly indicate which tests failed and why
- The HTML report should be generated even if tests fail

## Error Handling

If tests fail to run:
1. Check if dependencies are installed (npm install)
2. Verify the server is running on port 12000
3. Check for any missing test files or configuration issues

## Example Usage

User: "Run the tests and show me the results in the browser"

Agent response:
1. Navigate to shopping_app directory
2. Run npm test with appropriate flags
3. Parse the output
4. Generate HTML report
5. Start HTTP server
6. Provide URL to user
