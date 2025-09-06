// src/extension.ts
import * as vscode from 'vscode';
import { ChatLogger } from './ChatLogger';

let chatLogger: ChatLogger;

export function activate(context: vscode.ExtensionContext) {
    console.log('Copilot Chat Logger extension is now active');

    // Initialize chat logger
    const workspaceUri = vscode.workspace.workspaceFolders?.[0]?.uri;
    const bufferSize = vscode.workspace.getConfiguration('copilot-chat-logger-v1').get<number>('bufferSize', 1000);
    chatLogger = new ChatLogger(bufferSize, workspaceUri);

    // Enable logging by default (configurable)
    const enableLogging = vscode.workspace.getConfiguration('copilot-chat-logger-v1').get<boolean>('enableLogging', true);
    chatLogger.setLogging(enableLogging);

    // Register commands
    const exportLogsCommand = vscode.commands.registerCommand('copilot-chat-logger-v1.exportLogs', exportLogs);
    const clearLogsCommand = vscode.commands.registerCommand('copilot-chat-logger-v1.clearLogs', clearLogs);
    const viewLogsCommand = vscode.commands.registerCommand('copilot-chat-logger-v1.viewLogs', viewLogs);
    const toggleLoggingCommand = vscode.commands.registerCommand('copilot-chat-logger-v1.toggleLogging', toggleLogging);

    // Add to subscriptions for cleanup
    context.subscriptions.push(
        exportLogsCommand,
        clearLogsCommand,
        viewLogsCommand,
        toggleLoggingCommand
    );

    // Monitor configuration changes
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('copilot-chat-logger-v1')) {
            const config = vscode.workspace.getConfiguration('copilot-chat-logger-v1');
            chatLogger.setLogging(config.get<boolean>('enableLogging', true));
        }
    });

    // Define the chat request handler to capture prompts and responses
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, _context: vscode.ChatContext, stream: vscode.ChatResponseStream) => {
        // Log the prompt silently
        if (chatLogger) {
            await chatLogger.logPrompt(request.prompt, {
                model: request.model?.name || 'unknown',
                location: 'chat',
                participants: ['user']
            });

            // Intercept the stream to capture responses
            const originalMarkdown = stream.markdown;
            stream.markdown = (content: string) => {
                try {
                    // Log the response
                    chatLogger.logResponse(content, {
                        model: request.model?.name || 'unknown',
                        location: 'chat',
                        participants: ['assistant']
                    });
                    // Call original to maintain normal behavior
                    return originalMarkdown.call(stream, content);
                } catch (error) {
                    console.error('Error in response logging:', error);
                    // Still call original even if logging fails
                    return originalMarkdown.call(stream, content);
                }
            };
        }
        // Don't provide a response, let Copilot handle it
        return;
    };

    // Register chat response listener
    const chatResponseListener = vscode.chat.createChatParticipant('copilot-chat-logger.observer', handler);

    // Add to subscriptions for cleanup
    context.subscriptions.push(
        chatResponseListener
    );

    console.log('Copilot Chat Logger extension initialized successfully');
}



async function exportLogs(): Promise<void> {
    try {
        const options: vscode.SaveDialogOptions = {
            saveLabel: 'Export Chat Logs',
            filters: {
                jsonFiles: ['json'],
                allFiles: ['*']
            },
            defaultUri: vscode.Uri.file('copilot-chat-logs.json')
        };

        const uri = await vscode.window.showSaveDialog(options);
        if (uri) {
            await chatLogger.exportLogs(uri.fsPath);
            vscode.window.showInformationMessage(`Chat logs exported to: ${uri.fsPath}`);
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to export logs: ${error}`);
    }
}

async function clearLogs(): Promise<void> {
    const result = await vscode.window.showWarningMessage(
        'Are you sure you want to clear all chat logs? This action cannot be undone.',
        'Yes, Clear All',
        'Cancel'
    );

    if (result === 'Yes, Clear All') {
        chatLogger.clearLogs();
        vscode.window.showInformationMessage('All chat logs have been cleared.');
    }
}

async function viewLogs(): Promise<void> {
    const interactions = chatLogger.getAllInteractions();

    if (interactions.length === 0) {
        vscode.window.showInformationMessage('No chat interactions logged yet.');
        return;
    }

    // Create a virtual document to display logs
    const logContent = JSON.stringify({
        summary: {
            totalInteractions: interactions.length,
            dateRange: {
                earliest: interactions[0]?.timestamp,
                latest: interactions[interactions.length - 1]?.timestamp
            }
        },
        interactions
    }, null, 2);

    const doc = await vscode.workspace.openTextDocument({
        content: logContent,
        language: 'json'
    });

    vscode.window.showTextDocument(doc);
}

async function toggleLogging(): Promise<void> {
    const config = vscode.workspace.getConfiguration('copilot-chat-logger-v1');
    const currentState = config.get<boolean>('enableLogging', true);

    await config.update('enableLogging', !currentState, vscode.ConfigurationTarget.Workspace);

    const newState = !currentState ? 'enabled' : 'disabled';
    vscode.window.showInformationMessage(`Chat logging has been ${newState}.`);
}

export function deactivate() {
    console.log('Copilot Chat Logger extension deactivated');
}