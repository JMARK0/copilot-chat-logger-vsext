// src/ChatLogger.ts
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CircularBuffer } from './CircularBuffer';

export interface ChatInteraction {
    id: string;
    timestamp: Date;
    type: 'prompt' | 'response' | 'context';
    content: string;
    source: 'user' | 'copilot' | 'system';
    metadata?: {
        model?: string;
        tokens?: number;
        participants?: string[];
        location?: 'chat' | 'inline' | 'quick-chat';
    };
}

export class ChatLogger {
    private buffer: CircularBuffer<ChatInteraction>;
    private logFilePath: string;
    private isLogging = false;

    constructor(bufferSize = 1000, workspaceUri?: vscode.Uri) {
        this.buffer = new CircularBuffer<ChatInteraction>(bufferSize);

        // Determine log file path
        if (workspaceUri) {
            this.logFilePath = path.join(workspaceUri.fsPath, '.vscode', 'copilot-chat-log.json');
        } else {
            // Use global storage if no workspace
            const globalStoragePath = vscode.extensions.getExtension('copilot-chat-logger-v1')
                ?.packageJSON?.globalStorageUri?.fsPath || '';
            this.logFilePath = path.join(globalStoragePath, 'copilot-chat-log.json');
        }
    }

    /**
     * Log a chat interaction
     */
    async logInteraction(interaction: Omit<ChatInteraction, 'id' | 'timestamp'>): Promise<void> {
        const fullInteraction: ChatInteraction = {
            ...interaction,
            id: this.generateId(),
            timestamp: new Date()
        };

        this.buffer.push(fullInteraction);

        if (this.isLogging) {
            await this.writeToFile();
        }
    }

    /**
     * Log user prompt
     */
    async logPrompt(prompt: string, metadata?: ChatInteraction['metadata']): Promise<void> {
        await this.logInteraction({
            type: 'prompt',
            content: prompt,
            source: 'user',
            metadata
        });
    }

    /**
     * Log Copilot response
     */
    async logResponse(response: string, metadata?: ChatInteraction['metadata']): Promise<void> {
        await this.logInteraction({
            type: 'response',
            content: response,
            source: 'copilot',
            metadata
        });
    }

    /**
     * Log system context
     */
    async logContext(context: string, metadata?: ChatInteraction['metadata']): Promise<void> {
        await this.logInteraction({
            type: 'context',
            content: context,
            source: 'system',
            metadata
        });
    }

    /**
     * Enable/disable file logging
     */
    setLogging(enabled: boolean): void {
        this.isLogging = enabled;
    }

    /**
     * Get recent interactions
     */
    getRecentInteractions(count = 10): ChatInteraction[] {
        return this.buffer.getRecent(count);
    }

    /**
     * Get all interactions
     */
    getAllInteractions(): ChatInteraction[] {
        return this.buffer.getAll();
    }

    /**
     * Export logs to file manually
     */
    async exportLogs(filePath?: string): Promise<void> {
        const exportPath = filePath || this.logFilePath;
        await this.writeToFile(exportPath);
    }

    /**
     * Clear all logs
     */
    clearLogs(): void {
        this.buffer.clear();
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private async writeToFile(filePath: string = this.logFilePath): Promise<void> {
        try {
            // Ensure directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true });

            const logData = {
                exportDate: new Date().toISOString(),
                totalInteractions: this.buffer.size(),
                interactions: this.buffer.getAll()
            };

            await fs.writeFile(filePath, JSON.stringify(logData, null, 2), 'utf8');
        } catch (error) {
            console.error('Failed to write log file:', error);
            vscode.window.showErrorMessage(`Failed to write chat log: ${error}`);
        }
    }
}