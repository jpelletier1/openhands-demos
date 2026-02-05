---
name: add-skill
triggers:
  - /add-skill
inputs:
  - name: SKILL_NAME
    description: "Skill name"
---

Please create a new Agent Skill in the following directory: .openhands/skills/{{ SKILL_NAME }}.

Once the Agent Skill has been loaded, please initialize it with OpenHands so it's ready for use.