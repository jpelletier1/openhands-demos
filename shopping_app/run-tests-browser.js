#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

console.log('Running integration tests...\n');

// Run the tests
const testProcess = spawn('npm', ['test', '--', '--verbose', '--json'], {
  cwd: __dirname,
  shell: true
});

let testOutput = '';
let jsonOutput = '';

testProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  testOutput += output;
  
  // Try to extract JSON from the output
  const lines = output.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('{') && (line.includes('"numTotalTests"') || line.includes('"testResults"'))) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.numTotalTests !== undefined) {
          jsonOutput = line;
        }
      } catch (e) {
        // Not valid JSON, continue
      }
    }
  }
});

testProcess.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

testProcess.on('close', (code) => {
  console.log(`\nTest process exited with code ${code}\n`);
  
  // Parse test results from output
  let results;
  if (jsonOutput) {
    try {
      const jsonData = JSON.parse(jsonOutput);
      results = parseJSONResults(jsonData);
      console.log('Parsed JSON results:', JSON.stringify(results, null, 2));
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      results = parseTestResults(testOutput);
    }
  } else {
    results = parseTestResults(testOutput);
  }
  
  // Generate HTML report
  const html = generateHTMLReport(results);
  
  // Save the report
  const reportPath = path.join(__dirname, 'test-results.html');
  fs.writeFileSync(reportPath, html);
  console.log(`Test report generated: ${reportPath}\n`);
  
  // Start a simple HTTP server
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/test-results.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  
  const PORT = 12001;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Test results server running!`);
    console.log(`View results at: https://work-2-angmgpptuwafuigr.prod-runtime.all-hands.dev`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
  });
});

function parseJSONResults(jsonData) {
  const results = {
    total: jsonData.numTotalTests || 0,
    passed: jsonData.numPassedTests || 0,
    failed: jsonData.numFailedTests || 0,
    duration: 0,
    tests: []
  };
  
  // Calculate total duration
  if (jsonData.testResults && jsonData.testResults.length > 0) {
    const testFile = jsonData.testResults[0];
    if (testFile.endTime && testFile.startTime) {
      results.duration = ((testFile.endTime - testFile.startTime) / 1000).toFixed(2);
    }
    
    // Extract individual test results
    if (testFile.assertionResults) {
      for (const assertion of testFile.assertionResults) {
        results.tests.push({
          name: assertion.title || assertion.fullName || 'Unknown test',
          status: assertion.status === 'passed' ? 'passed' : 'failed',
          duration: assertion.duration || 0
        });
      }
    }
  }
  
  return results;
}

function parseTestResults(output) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    duration: 0,
    tests: []
  };
  
  // Extract test summary
  const summaryMatch = output.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
  if (summaryMatch) {
    results.passed = parseInt(summaryMatch[1]);
    results.total = parseInt(summaryMatch[2]);
    results.failed = results.total - results.passed;
  }
  
  // Extract duration
  const durationMatch = output.match(/Time:\s+([\d.]+)\s*s/);
  if (durationMatch) {
    results.duration = parseFloat(durationMatch[1]);
  }
  
  // Extract individual test results
  const testPattern = /✓|✕/g;
  const lines = output.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('✓')) {
      const nameMatch = line.match(/✓\s+(.+?)\s+\((\d+)\s*ms\)/);
      if (nameMatch) {
        results.tests.push({
          name: nameMatch[1].trim(),
          status: 'passed',
          duration: parseInt(nameMatch[2])
        });
      }
    } else if (line.includes('✕')) {
      const nameMatch = line.match(/✕\s+(.+?)\s+\((\d+)\s*ms\)/);
      if (nameMatch) {
        results.tests.push({
          name: nameMatch[1].trim(),
          status: 'failed',
          duration: parseInt(nameMatch[2])
        });
      }
    }
  }
  
  return results;
}

function generateHTMLReport(results) {
  const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  
  const testItems = results.tests.map(test => `
    <div class="test-item ${test.status}">
      <div class="test-name">
        ${escapeHtml(test.name)}
        <span class="test-status status-${test.status}">${test.status.toUpperCase()}</span>
      </div>
      <div class="test-duration">${test.duration}ms</div>
    </div>
  `).join('');
  
  return `<!DOCTYPE html>
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
        .header h1 {
            margin: 0 0 10px 0;
        }
        .header p {
            margin: 0;
            opacity: 0.9;
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
            font-weight: 600;
        }
        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }
        .summary-card .subtitle {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .test-results {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .test-results-header {
            background: #f9fafb;
            padding: 20px;
            border-bottom: 2px solid #e5e7eb;
        }
        .test-results-header h2 {
            margin: 0;
            font-size: 20px;
        }
        .test-item {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
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
            flex: 1;
            font-weight: 500;
            font-size: 15px;
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
            margin-left: 20px;
        }
        .pass-rate {
            color: #22c55e;
        }
        .fail-rate {
            color: #ef4444;
        }
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Shopping Cart Integration Test Results</h1>
        <p>Comprehensive test suite for cart functionality</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Total Tests</h3>
            <div class="value">${results.total}</div>
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <div class="value pass-rate">${results.passed}</div>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div class="value fail-rate">${results.failed}</div>
        </div>
        <div class="summary-card">
            <h3>Pass Rate</h3>
            <div class="value">${passRate}%</div>
        </div>
        <div class="summary-card">
            <h3>Duration</h3>
            <div class="value">${results.duration}s</div>
        </div>
    </div>
    
    <div class="test-results">
        <div class="test-results-header">
            <h2>Test Cases (${results.tests.length})</h2>
        </div>
        ${testItems || '<div class="test-item"><div class="test-name">No test results available</div></div>'}
    </div>
    
    <div class="timestamp">
        Generated: ${new Date().toLocaleString()}
    </div>
</body>
</html>`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
