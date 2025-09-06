import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('Extension should activate', async () => {
        const extension = vscode.extensions.getExtension('copilot-chat-logger-v1');
        assert.ok(extension, 'Extension should be registered');
        
        await extension?.activate();
        assert.strictEqual(extension?.isActive, true, 'Extension should be active');
    });

    test('Commands should be registered', () => {
        const commands = [
            'copilot-chat-logger-v1.exportLogs',
            'copilot-chat-logger-v1.clearLogs',
            'copilot-chat-logger-v1.viewLogs',
            'copilot-chat-logger-v1.toggleLogging'
        ];

        commands.forEach(commandId => {
            vscode.commands.getCommands(true)
                .then(allCommands => {
                    assert.ok(
                        allCommands.includes(commandId),
                        `Command ${commandId} should be registered`
                    );
                });
        });
    });
});
