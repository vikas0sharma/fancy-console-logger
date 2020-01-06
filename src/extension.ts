// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getMessageLine } from './log-helper';
import { log, commentAll } from './logger';
import { LogType } from './log-types';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


    let colorLog = vscode.commands.registerCommand('fancyLog.colorLog', async () => {
        const editor = vscode.window.activeTextEditor as vscode.TextEditor;
        await log(editor, LogType.Color);

    });

    let tableLog = vscode.commands.registerCommand('fancyLog.tableLog', async () => {
        const editor = vscode.window.activeTextEditor as vscode.TextEditor;
        await log(editor, LogType.Table);

    });

    let commentAllLogs = vscode.commands.registerCommand('fancyLog.commentLogs', async () => {
        const editor = vscode.window.activeTextEditor as vscode.TextEditor;
        await commentAll(editor);

    });

    context.subscriptions.push(
        colorLog,
        tableLog,
        commentAllLogs
    );

}

// this method is called when your extension is deactivated
export function deactivate() { }
