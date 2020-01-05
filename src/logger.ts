import { TextDocument, TextEditor, Position } from "vscode";
import { getMessageLine, getSpaces } from "./log-helper";
import { LogType } from "./log-types";


export async function log(editor: TextEditor, logType: LogType) {
    if (!editor) {
        return;
    }

    const tabSize = Number(editor.options.tabSize);
    const document = editor.document;


    for (let index = 0; index < editor.selections.length; index++) {

        const selection = editor.selections[index];
        const selectedVar = document.getText(selection);
        if (selectedVar.trim().length !== 0) {
            const lineOfSelectedVar = selection.active.line;
            const calculatedLine = getMessageLine(document, lineOfSelectedVar, selectedVar);
            const insertLine = calculatedLine >= document.lineCount ? document.lineCount : calculatedLine;

            const msg = logMsg(
                document,
                lineOfSelectedVar,
                selectedVar,
                tabSize,
                calculatedLine,
                logType);
            await editor.edit(editBuilder => {
                editBuilder.insert(new Position(insertLine, 0), msg);
            });
        }

    }
}

function logMsg(
    document: TextDocument,
    selectedLineNumber: number,
    selectedVar: string,
    tabSize: number,
    calculatedLine: number,
    logType: LogType) {

    const spacesBeforeMsg = getSpaces(document, selectedLineNumber, tabSize);
    const s1 = 'color: #008f68; font-weight: bold; font-size: 1rem;';
    const s2 = 'color: #bd1424; font-weight: bold; font-size: 1rem;';

    //const consoleLog = `console.log('%c${selectedVar} %c>>>>>','${s1}','${s2}', ${selectedVar});`;
    let consoleLog = '';
    
    switch (logType) {
        case LogType.Color:
            consoleLog = getColoredMsg(selectedVar);
            break;
        case LogType.Table:
            consoleLog = getTableMsg(selectedVar);
            break;
    }

    return `${calculatedLine === document.lineCount ? "\n" : ""}${spacesBeforeMsg}${consoleLog}\n`;
}

function getColoredMsg(selectedVar: string): string {
    const s = 'color: #f8d15a; font-weight: bold; font-size: 1rem;';

    const s1 = 'color: #F7DF1E; font-size: 1.5rem;';
    const s2 = 'color: #3399FE; font-size: 1.5rem;';
    const s3 = 'color: #61dafb; font-size: 1.5rem;';
    const s4 = 'color: #41B883; font-size: 1.5rem;';
    const s5 = 'color: #DD0031; font-size: 1.5rem;';
    const s6 = 'color: purple; font-size: 1.5rem;';


    return `console.log('%c${selectedVar} %c>%c>%c>%c>%c>%c>','${s}','${s1}','${s2}','${s3}','${s4}','${s5}','${s6}', ${selectedVar});`;
}

function getTableMsg(selectedVar: string): string {
    return `console.table(${selectedVar});`;
}