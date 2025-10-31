---
name: refactor_angular
version: 1.0.0
author: openhands
agent: CodeActAgent
triggers:
- /refactor_angular
inputs:
  - name: ANGULAR_VERSION
    description: "Numeric Angular version to refactor to"
  - name: DIRECTORY
    description: "Directory within codebase to find the legacy Angular code"
---

Please work within the {{ DIRECTORY }}. This directory contains legacy Angular code. 

Your job is to refactor this code to Angular {{ ANGULAR VERSION }}.

When you are complete with refactoring, please generate a summary of the files and methods you have changed. 

If there are any existing tests, please update those tests and verify the new refactored code is working.