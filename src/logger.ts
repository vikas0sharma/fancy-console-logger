import { TextDocument, TextEditor, Position } from "vscode";
import { getMessageLine, getSpaces } from "./log-helper";


export async function log(editor: TextEditor) {
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

            const msg = logColoredMsg(document, lineOfSelectedVar, selectedVar, tabSize, calculatedLine);
            await editor.edit(editBuilder => {
                editBuilder.insert(new Position(insertLine, 0), msg);
            });
        }

    }
}

function logColoredMsg(
    document: TextDocument,
    selectedLineNumber: number,
    selectedVar: string,
    tabSize: number,
    calculatedLine: number) {

    const spacesBeforeMsg = getSpaces(document, selectedLineNumber, tabSize);
    const s1 = 'color: #008f68; font-weight: bold; font-size: 1rem;';
    const s2 = 'color: #bd1424; font-weight: bold; font-size: 1rem;';
    
    const consoleLog = `console.log('%c${selectedVar} %c>>>>>','${s1}','${s2}', ${selectedVar});`;
    
    return `${calculatedLine === document.lineCount ? "\n" : ""}${spacesBeforeMsg}${consoleLog}\n`;
}