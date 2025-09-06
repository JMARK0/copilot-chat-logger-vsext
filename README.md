# GitHub Copilot Chat Logger

A Visual Studio Code extension that silently logs GitHub Copilot chat interactions for analysis and debugging purposes. This extension operates in the background without interfering with your normal Copilot chat experience.

## Features

- 🤫 Silent logging of all GitHub Copilot chat interactions
- � Captures both user prompts and Copilot responses
- 💾 Export logs to JSON files for analysis
- 🔍 View chat history directly in VS Code
- 🎚️ Enable/disable logging with a single command
- 🔒 Privacy-focused: all data stays local

## Installation

You can install this extension in one of two ways:

1. **From VS Code Marketplace**
   - Open VS Code
   - Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS)
   - Type `ext install copilot-chat-logger-v1`

2. **From VSIX File**
   - Download the `.vsix` file from the releases page
   - Open VS Code
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
   - Type "Install from VSIX" and select the downloaded file

## Requirements

- Visual Studio Code ^1.85.0
- GitHub Copilot Chat extension must be installed and activated

## Usage

### Commands

Access these commands through the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

- `Copilot Logger: Export Chat Logs` - Export logs to a file
- `Copilot Logger: Clear Chat Logs` - Clear the current log buffer
- `Copilot Logger: View Chat Logs` - View recent chat interactions
- `Copilot Logger: Toggle Logging` - Enable/disable logging

### Configuration

Configure the extension through VS Code settings:

\`\`\`json
{
    "copilot-chat-logger-v1.enableLogging": true,
    "copilot-chat-logger-v1.bufferSize": 1000
}
\`\`\`

- **enableLogging**: Enable/disable automatic logging (default: true)
- **bufferSize**: Maximum number of interactions to store (default: 1000)

## Log Format

The logs follow TypeScript interfaces with the following structure:

\`\`\`typescript
interface ChatInteraction {
    id: string;                     // Unique identifier for the interaction
    timestamp: Date;                // When the interaction occurred
    type: 'prompt' | 'response' | 'context';  // Type of interaction
    content: string;                // The actual message content
    source: 'user' | 'copilot' | 'system';   // Who generated the message
    metadata?: {
        model?: string;             // The model used (e.g., 'gpt-4')
        tokens?: number;            // Number of tokens in the message
        participants?: string[];     // List of participants
        location?: 'chat' | 'inline' | 'quick-chat';  // Where the interaction occurred
    };
}

interface LogExport {
    exportDate: string;             // When the log was exported
    totalInteractions: number;      // Total number of interactions
    interactions: ChatInteraction[]; // Array of all interactions
}
\`\`\`

### Example Log Output:

\`\`\`typescript
const logExample: LogExport = {
    exportDate: "2025-09-06T15:30:00.000Z",
    totalInteractions: 2,
    interactions: [
        {
            id: "1693916400000-abc123def",
            timestamp: new Date("2025-09-06T10:00:00.000Z"),
            type: "prompt",
            content: "How do I implement a binary search?",
            source: "user",
            metadata: {
                model: "gpt-4",
                location: "chat",
                participants: ["user"]
            }
        },
        {
            id: "1693916401000-xyz789uvw",
            timestamp: new Date("2025-09-06T10:00:01.000Z"),
            type: "response",
            content: "Here's how you can implement binary search...",
            source: "copilot",
            metadata: {
                model: "gpt-4",
                location: "chat",
                participants: ["assistant"]
            }
        }
    ]
}
\`\`\`

## Limitations

1. The extension only logs:
   - Direct chat interactions with GitHub Copilot
   - Prompts and responses in the chat interface
   - Basic metadata (timestamps, model info when available)

2. The extension does not log:
   - Code snippets you accept/reject
   - Inline suggestions
   - File contents or workspace information
   - Personal or sensitive information

## Privacy & Security

- ✅ All logs are stored locally on your machine
- ✅ No data is ever sent to external servers
- ✅ Logs can be cleared at any time
- ✅ Logging can be disabled completely
- ✅ Export logs only when you choose to

## Troubleshooting

1. **Logs are not being captured**
   - Verify logging is enabled in settings
   - Check that GitHub Copilot Chat is properly installed
   - Try reloading VS Code

2. **Cannot export logs**
   - Ensure you have write permissions in the target directory
   - Check if the file is not locked by another application

3. **Log viewer is empty**
   - Verify that interactions have occurred since enabling logging
   - Try clearing logs and starting fresh

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- File issues on [GitHub Issues](https://github.com/your-username/copilot-chat-logger/issues)
- Submit feature requests
- Read the [documentation](https://github.com/your-username/copilot-chat-logger#readme)

## Acknowledgments

- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Inspired by the need for better Copilot interaction analysis
- Thanks to all contributors

---
Made with ❤️ for the VS Code community
