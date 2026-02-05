---
name: add-skill
description: A skill for adding an agent to the .openhands directory
triggers:
  - /add-skill
inputs:
  - name: SKILL_NAME
    description: "Name of Agent Skill"
---

Please look at the files uploaded and turn this into a new Agent Skill in the following directory: .openhands/skills/{{ SKILL_NAME }}.

If there is a markdown file uploaded, consider this the skill. Rename this to SKILL.md and store it in the directory.

If there are additional files uploaded, please move these into a scripts/ directory. Make sure any filepath references within SKILL.md to those additional files are updated.

Once the Agent Skill has been uploaded into the directory, please initialize it with OpenHands so it's ready for use.