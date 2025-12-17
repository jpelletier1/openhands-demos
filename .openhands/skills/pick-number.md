---
name: pick-number
triggers:
  - /pick-number
inputs:
  - name: START_NUMBER
    description: "Starting number"
  - name: END_NUMBER
    description: "Ending number"
---

Pick a random number between {{ START_NUMBER }} and {{ END_NUMBER }}.