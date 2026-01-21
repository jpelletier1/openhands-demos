---
name: OpenHands Software Agent SDK
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - /openhands-sdk
---

# OpenHands Software Agent SDK Microagent

This microagent provides comprehensive guidance for creating Python applications using the OpenHands Software Agent SDK. The SDK enables building agents that write software with state-of-the-art performance and specialized coding tools.

## Core Components Overview

### 1. LLM Configuration
The `LLM` class configures the language model for your agent:

```python
from pydantic import SecretStr
from openhands.sdk import LLM

llm = LLM(
    model="openhands/claude-sonnet-4-5-20250929",  # or other supported models
    api_key=SecretStr("your-api-key"),
    base_url="optional-base-url",  # for custom endpoints
    usage_id="agent",  # for tracking usage
)
```

**Key LLM Methods:**
- `llm.metrics.accumulated_cost` - Get total cost of LLM usage
- `llm.completion(messages, tools)` - Direct LLM completion call
- `llm.supports_vision()` - Check if model supports image inputs

### 2. Agent Creation
The `Agent` class is the core component that orchestrates tools and LLM interactions:

```python
from openhands.sdk import Agent, Tool
from openhands.tools.execute_bash import BashTool
from openhands.tools.file_editor import FileEditorTool

# Basic agent with built-in tools
agent = Agent(
    llm=llm,
    tools=[
        Tool(name=BashTool.name),
        Tool(name=FileEditorTool.name),
    ]
)

# Or use preset agents
from openhands.tools.preset.default import get_default_agent
agent = get_default_agent(llm=llm, cli_mode=True)
```

**Key Agent Features:**
- **Tools**: Built-in and custom tools for various tasks
- **Context**: Dynamic context injection with skills and triggers
- **Security**: Confirmation policies and risk analysis
- **MCP Integration**: Model Context Protocol support

### 3. Conversation Management
The `Conversation` class manages agent interactions and execution:

```python
from openhands.sdk import Conversation

# Local conversation
conversation = Conversation(
    agent=agent,
    workspace="/path/to/workspace",  # or current directory
    persistence_dir=".conversations",  # optional persistence
    conversation_id="unique-id",  # optional ID
    callbacks=[callback_function],  # optional event callbacks
)

# Send messages and run
conversation.send_message("Write a Python script that prints 'Hello World'")
conversation.run()
```

**Key Conversation Methods:**
- `send_message(message)` - Send user message to agent
- `run()` - Execute agent until completion
- `set_confirmation_policy(policy)` - Set security confirmation mode
- `reject_pending_actions(reason)` - Reject pending actions in confirmation mode
- `generate_title(max_length, llm)` - Generate conversation title
- `close()` - Clean up resources (for remote conversations)

### 4. Built-in Tools

#### Essential Tools:
```python
from openhands.sdk.tool import Tool
from openhands.tools.execute_bash import BashTool
from openhands.tools.file_editor import FileEditorTool
from openhands.tools.task_tracker import TaskTrackerTool
from openhands.tools.glob import GlobTool
from openhands.tools.grep import GrepTool

tools = [
    Tool(name=BashTool.name),        # Execute bash commands
    Tool(name=FileEditorTool.name),  # Edit files with various operations
    Tool(name=TaskTrackerTool.name), # Task management and planning
    Tool(name=GlobTool.name),        # File pattern matching
    Tool(name=GrepTool.name),        # Content search
]
```

#### Browser Tools:
```python
from openhands.tools.browser_use import BrowserUseTool

# Add browser capabilities
tools.append(Tool(name=BrowserUseTool.name))
```

### 5. Custom Tool Creation

Create custom tools by defining Action, Observation, Executor, and ToolDefinition:

```python
from openhands.sdk.tool import (
    Action, Observation, ToolDefinition, ToolExecutor, register_tool
)
from pydantic import Field
from collections.abc import Sequence
from openhands.sdk import TextContent, ImageContent

# 1. Define Action (input)
class MyCustomAction(Action):
    parameter: str = Field(description="Description of parameter")
    optional_param: str | None = Field(default=None, description="Optional parameter")

# 2. Define Observation (output)
class MyCustomObservation(Observation):
    result: str = Field(description="Result of the operation")
    
    @property
    def to_llm_content(self) -> Sequence[TextContent | ImageContent]:
        return [TextContent(text=f"Result: {self.result}")]

# 3. Define Executor (implementation)
class MyCustomExecutor(ToolExecutor[MyCustomAction, MyCustomObservation]):
    def __call__(self, action: MyCustomAction, conversation=None) -> MyCustomObservation:
        # Implement your tool logic here
        result = f"Processed: {action.parameter}"
        return MyCustomObservation(result=result)

# 4. Define Tool
class MyCustomTool(ToolDefinition[MyCustomAction, MyCustomObservation]):
    @classmethod
    def create(cls, conv_state) -> Sequence[ToolDefinition]:
        executor = MyCustomExecutor()
        return [cls(
            description="Description of what this tool does",
            action_type=MyCustomAction,
            observation_type=MyCustomObservation,
            executor=executor,
        )]

# 5. Register and use
register_tool("MyCustomTool", MyCustomTool.create)
tools = [Tool(name="MyCustomTool")]
```

### 6. Agent Context and Skills

Add dynamic context and skills to your agent:

```python
from openhands.sdk import AgentContext
from openhands.sdk.context import Skill, KeywordTrigger, TaskTrigger

agent_context = AgentContext(
    skills=[
        Skill(
            name="coding_expert",
            content="You are an expert Python developer. Always follow PEP 8 standards.",
            trigger=None,  # Always active
        ),
        Skill(
            name="debug_mode",
            content="IMPORTANT: Debug mode activated. Provide detailed explanations.",
            trigger=KeywordTrigger(keywords=["debug", "explain", "verbose"]),
        ),
    ],
    system_message_suffix="Always write clean, well-documented code.",
    user_message_suffix="Please be thorough in your implementation.",
)

agent = Agent(llm=llm, tools=tools, agent_context=agent_context)
```

**Skill Triggers:**
- `None` - Always active
- `KeywordTrigger(keywords=["word1", "word2"])` - Activated by keywords
- `TaskTrigger(tasks=["task_type"])` - Activated by task types

### 7. Security and Confirmation

Control agent actions with confirmation policies:

```python
from openhands.sdk.security.confirmation_policy import AlwaysConfirm, NeverConfirm

# Always require confirmation
conversation.set_confirmation_policy(AlwaysConfirm())

# Never require confirmation (default)
conversation.set_confirmation_policy(NeverConfirm())

# Custom confirmation logic
def confirm_actions(pending_actions) -> bool:
    print(f"Agent wants to execute {len(pending_actions)} actions:")
    for action in pending_actions:
        print(f"  - {action.tool_name}: {str(action.action)[:100]}")
    return input("Approve? (y/n): ").lower() == 'y'

# Use in run loop
while conversation.state.execution_status != ConversationExecutionStatus.FINISHED:
    if conversation.state.execution_status == ConversationExecutionStatus.WAITING_FOR_CONFIRMATION:
        pending = ConversationState.get_unmatched_actions(conversation.state.events)
        if not confirm_actions(pending):
            conversation.reject_pending_actions("User rejected")
            continue
    conversation.run()
```

### 8. Remote Agent Server

Deploy agents as scalable web services:

```python
from openhands.sdk import RemoteConversation, Workspace

# Connect to remote agent server
workspace = Workspace(host="http://localhost:8000")
conversation = Conversation(
    agent=agent,
    workspace=workspace,  # This creates RemoteConversation automatically
    callbacks=[event_callback],
)

# Use exactly like local conversation
conversation.send_message("Hello from remote agent!")
conversation.run()
```

### 9. Async Support

Use agents in async contexts:

```python
import asyncio
from openhands.sdk.utils.async_utils import AsyncCallbackWrapper

async def async_callback(event):
    print(f"Async event: {type(event).__name__}")

def run_conversation_sync(callback):
    conversation = Conversation(agent=agent, callbacks=[callback])
    conversation.send_message("Create a Python script")
    conversation.run()

async def main():
    loop = asyncio.get_running_loop()
    callback = AsyncCallbackWrapper(async_callback, loop)
    await loop.run_in_executor(None, run_conversation_sync, callback)

asyncio.run(main())
```

### 10. Persistence and State Management

Save and restore conversation state:

```python
import uuid

conversation_id = uuid.uuid4()
conversation = Conversation(
    agent=agent,
    workspace="/workspace",
    persistence_dir=".conversations",
    conversation_id=conversation_id,
)

# Use conversation normally
conversation.send_message("Start working on the project")
conversation.run()

# Later, restore the same conversation
restored_conversation = Conversation(
    agent=agent,
    workspace="/workspace", 
    persistence_dir=".conversations",
    conversation_id=conversation_id,  # Same ID restores state
)

# Continue where you left off
restored_conversation.send_message("Continue the work")
restored_conversation.run()
```

### 11. Event Callbacks and Monitoring

Monitor agent execution with callbacks:

```python
from openhands.sdk import Event, LLMConvertibleEvent

def event_callback(event: Event):
    event_type = type(event).__name__
    print(f"Event: {event_type}")
    
    if isinstance(event, LLMConvertibleEvent):
        # This event can be converted to LLM messages
        llm_message = event.to_llm_message()
        print(f"LLM Message: {llm_message}")

conversation = Conversation(
    agent=agent,
    workspace="/workspace",
    callbacks=[event_callback],
)
```

### 12. MCP (Model Context Protocol) Integration

Integrate external tools via MCP:

```python
# Add MCP servers to agent configuration
mcp_config = {
    "mcpServers": {
        "fetch": {"command": "uvx", "args": ["mcp-server-fetch"]},
        "filesystem": {"command": "uvx", "args": ["mcp-server-filesystem"]},
    }
}

agent = Agent(llm=llm, tools=tools, mcp_config=mcp_config)
```

### 13. Planning Agent Workflow

Use specialized planning agents for complex tasks:

```python
from openhands.tools.preset.planning import get_planning_agent

# Create planning agent (read-only tools)
planning_agent = get_planning_agent(llm=llm)
planning_conversation = Conversation(agent=planning_agent, workspace="/workspace")

# Plan the task
planning_conversation.send_message("Create a plan for building a web scraper")
planning_conversation.run()

# Create execution agent (full tools)
execution_agent = get_default_agent(llm=llm, cli_mode=True)
execution_conversation = Conversation(agent=execution_agent, workspace="/workspace")

# Execute the plan
execution_conversation.send_message("Implement the plan from PLAN.md")
execution_conversation.run()
```

## Common Patterns and Best Practices

### 1. Basic Agent Setup Pattern
```python
import os
from pydantic import SecretStr
from openhands.sdk import LLM, Conversation
from openhands.tools.preset.default import get_default_agent

# Configure LLM
api_key = os.getenv("LLM_API_KEY")
assert api_key is not None, "LLM_API_KEY environment variable is not set."

llm = LLM(
    model=os.getenv("LLM_MODEL", "openhands/claude-sonnet-4-5-20250929"),
    api_key=SecretStr(api_key),
    base_url=os.getenv("LLM_BASE_URL"),
    usage_id="agent",
)

# Create agent and conversation
agent = get_default_agent(llm=llm, cli_mode=True)
conversation = Conversation(agent=agent, workspace=os.getcwd())

# Use the agent
conversation.send_message("Your task here")
conversation.run()

# Report cost
cost = llm.metrics.accumulated_cost
print(f"Total cost: ${cost}")
```

### 2. Error Handling and Robustness
```python
try:
    conversation.send_message("Potentially risky task")
    conversation.run()
except Exception as e:
    print(f"Agent execution failed: {e}")
    # Handle gracefully
```

### 3. Multi-step Conversations
```python
# Step 1
conversation.send_message("Analyze the codebase and create a summary")
conversation.run()

# Step 2
conversation.send_message("Based on your analysis, suggest improvements")
conversation.run()

# Step 3
conversation.send_message("Implement the top 3 improvements")
conversation.run()
```

### 4. Custom Tool Integration
```python
# Create tools that work together
def create_shared_tools(conv_state):
    bash_executor = BashExecutor(working_dir=conv_state.workspace.working_dir)
    bash_tool = BashTool.create(conv_state, executor=bash_executor)[0]
    custom_tool = MyCustomTool.create(conv_state, bash_executor=bash_executor)[0]
    return [bash_tool, custom_tool]

register_tool("SharedToolSet", create_shared_tools)
tools = [Tool(name="SharedToolSet")]
```

## Environment Variables

Set these environment variables for SDK usage:

```bash
# Required
export LLM_API_KEY="your-api-key"

# Optional
export LLM_MODEL="openhands/claude-sonnet-4-5-20250929"
export LLM_BASE_URL="https://custom-endpoint.com"
export LOG_LEVEL="INFO"
```

## Supported Models

The SDK supports various LLM providers:
- **OpenHands Models**: `openhands/claude-sonnet-4-5-20250929`, `openhands/gpt-5-mini-2025-08-07`
- **OpenAI**: `gpt-4`, `gpt-3.5-turbo`, etc.
- **Anthropic**: `claude-3-sonnet`, `claude-3-haiku`, etc.
- **Open Source**: Qwen, Devstral, and others via compatible APIs

## Key Imports Reference

```python
# Core SDK
from openhands.sdk import (
    LLM, Agent, Conversation, Tool, ToolDefinition,
    Action, Observation, Event, LLMConvertibleEvent,
    AgentContext, get_logger
)

# Context and Skills
from openhands.sdk.context import (
    Skill, KeywordTrigger, TaskTrigger, load_skills_from_dir
)

# Security
from openhands.sdk.security.confirmation_policy import AlwaysConfirm, NeverConfirm

# Tools
from openhands.sdk.tool import (
    ToolExecutor, register_tool, resolve_tool, list_registered_tools
)

# Built-in Tools
from openhands.tools.execute_bash import BashTool
from openhands.tools.file_editor import FileEditorTool
from openhands.tools.task_tracker import TaskTrackerTool
from openhands.tools.browser_use import BrowserUseTool

# Presets
from openhands.tools.preset.default import get_default_agent
from openhands.tools.preset.planning import get_planning_agent

# Workspace
from openhands.sdk.workspace import LocalWorkspace, RemoteWorkspace, Workspace

# Async utilities
from openhands.sdk.utils.async_utils import AsyncCallbackWrapper
```

## Troubleshooting

### Common Issues:
1. **API Key Not Set**: Ensure `LLM_API_KEY` environment variable is set
2. **Model Not Found**: Check model name spelling and availability
3. **Tool Import Errors**: Verify tool imports and registration
4. **Workspace Permissions**: Ensure agent has read/write access to workspace
5. **Remote Connection**: Check server URL and network connectivity

### Debug Mode:
```python
import logging
from openhands.sdk.logger import get_logger

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)
logger = get_logger(__name__)
```

This microagent provides comprehensive guidance for building sophisticated coding agents with the OpenHands Software Agent SDK. Use these patterns and examples to create powerful AI agents that can write, analyze, and maintain software effectively.