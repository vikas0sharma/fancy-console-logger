import { TextDocument } from "vscode";
import {
    isObjectDeclaration,
    isObjectFunctionCallDeclaration,
    isFunctionCallDeclaration,
    isArrayDeclaration,
    isFunction,
    isJSBuiltInStatement,
    isClassDeclaration
} from "./snippet-helper";


export function getMessageLine(document: TextDocument, selectedLineNumber: number, selectedVar: string): number {
    if (selectedLineNumber === document.lineCount - 1) {
        return selectedLineNumber;
    }
    let currentLineText = document.lineAt(selectedLineNumber).text;
    let nextLineText = document.lineAt(selectedLineNumber + 1).text.replace(/\s/g, "");
    if (isObjectDeclaration(currentLineText)) {
        // Selected varibale is an object
        let nbrOfOpenedBrackets = (currentLineText.match(/{/g) || []).length;
        let nbrOfClosedBrackets = (currentLineText.match(/}/g) || []).length;
        let currentLineNum = selectedLineNumber + 1;
        while (currentLineNum < document.lineCount) {
            const currentLineText = document.lineAt(currentLineNum).text;
            nbrOfOpenedBrackets += (currentLineText.match(/{/g) || []).length;
            nbrOfClosedBrackets += (currentLineText.match(/}/g) || []).length;
            currentLineNum++;
            if (nbrOfOpenedBrackets === nbrOfClosedBrackets) break;
        }
        return nbrOfClosedBrackets === nbrOfOpenedBrackets
            ? currentLineNum
            : selectedLineNumber + 1;
    } else if (
        isObjectFunctionCallDeclaration(
            currentLineText,
            nextLineText
        )
    ) {
        // Selected variable get it's value from an object function call
        if (
            /\((\s*)$/.test(currentLineText.split(selectedVar)[0]) ||
            /,(\s*)$/.test(currentLineText.split(selectedVar)[0])
        ) {
            return selectedLineNumber + 1;
        }
        const openedParenthesesRegex = /\(/g;
        const closedParenthesesRegex = /\)/g;
        let openedParenthesisMatch,
            openedParenthesisMatches = [];
        let closedParenthesisMatch,
            closedParenthesisMatches = [];
        while (
            (openedParenthesisMatch = openedParenthesesRegex.exec(currentLineText)) !=
            null
        ) {
            openedParenthesisMatches.push(openedParenthesisMatch.index);
        }
        while (
            (closedParenthesisMatch = closedParenthesesRegex.exec(currentLineText)) !=
            null
        ) {
            closedParenthesisMatches.push(closedParenthesisMatch.index);
        }
        let currentLineNum = selectedLineNumber + 1;
        if (
            openedParenthesisMatches.length !== closedParenthesisMatches.length ||
            currentLineText.charAt(
                closedParenthesisMatches[closedParenthesisMatches.length - 1]
            ) === "." ||
            nextLineText.trim().startsWith(".")
        ) {
            while (currentLineNum < document.lineCount) {
                currentLineText = document.lineAt(currentLineNum).text;
                while (
                    (openedParenthesisMatch = openedParenthesesRegex.exec(
                        currentLineText
                    )) != null
                ) {
                    openedParenthesisMatches.push(openedParenthesisMatch.index);
                }
                while (
                    (closedParenthesisMatch = closedParenthesesRegex.exec(
                        currentLineText
                    )) != null
                ) {
                    closedParenthesisMatches.push(closedParenthesisMatch.index);
                }
                if (currentLineNum === document.lineCount - 1) break;
                nextLineText = document.lineAt(currentLineNum + 1).text;
                currentLineNum++;
                if (
                    openedParenthesisMatches.length === closedParenthesisMatches.length &&
                    !(
                        currentLineText.charAt(
                            closedParenthesisMatches[closedParenthesisMatches.length - 1]
                        ) === "."
                    ) &&
                    !nextLineText.trim().startsWith(".")
                )
                    break;
            }
        }
        return openedParenthesisMatches.length === closedParenthesisMatches.length
            ? currentLineNum
            : selectedLineNumber + 1;
    } else if (isFunctionCallDeclaration(currentLineText)) {
        // Selected variable get it's value from a direct function call
        if (
            /\((\s*)$/.test(currentLineText.split(selectedVar)[0]) ||
            /,(\s*)$/.test(currentLineText.split(selectedVar)[0])
        ) {
            return selectedLineNumber + 1;
        }
        let nbrOfOpenedParenthesis = (currentLineText.match(/\(/g) || []).length;
        let nbrOfClosedParenthesis = (currentLineText.match(/\)/g) || []).length;
        let currentLineNum = selectedLineNumber + 1;
        if (nbrOfOpenedParenthesis !== nbrOfClosedParenthesis) {
            while (currentLineNum < document.lineCount) {
                const currentLineText = document.lineAt(currentLineNum).text;
                nbrOfOpenedParenthesis += (currentLineText.match(/\(/g) || []).length;
                nbrOfClosedParenthesis += (currentLineText.match(/\)/g) || []).length;
                currentLineNum++;
                if (nbrOfOpenedParenthesis === nbrOfClosedParenthesis) break;
            }
        }
        return nbrOfOpenedParenthesis === nbrOfClosedParenthesis
            ? currentLineNum
            : selectedLineNumber + 1;
    } else if (/`/.test(currentLineText)) {
        // Template string
        let currentLineNum = selectedLineNumber + 1;
        let nbrOfBackTicks = (currentLineText.match(/`/g) || []).length;
        while (currentLineNum < document.lineCount) {
            const currentLineText = document.lineAt(currentLineNum).text;
            nbrOfBackTicks += (currentLineText.match(/`/g) || []).length;
            if (nbrOfBackTicks % 2 === 0) {
                break;
            }
            currentLineNum++;
        }
        return nbrOfBackTicks % 2 === 0 ? currentLineNum + 1 : selectedLineNumber + 1;
    } else if (
        isArrayDeclaration(currentLineText, nextLineText)
    ) {
        let nbrOfOpenedBrackets = (currentLineText.match(/\[/g) || []).length;
        let nbrOfClosedBrackets = (currentLineText.match(/\]/g) || []).length;
        let currentLineNum = selectedLineNumber + 1;
        if (nbrOfOpenedBrackets !== nbrOfClosedBrackets) {
            while (currentLineNum < document.lineCount) {
                const currentLineText = document.lineAt(currentLineNum).text;
                nbrOfOpenedBrackets += (currentLineText.match(/\[/g) || []).length;
                nbrOfClosedBrackets += (currentLineText.match(/\]/g) || []).length;
                currentLineNum++;
                if (nbrOfOpenedBrackets === nbrOfClosedBrackets) break;
            }
        }
        return nbrOfOpenedBrackets === nbrOfClosedBrackets
            ? currentLineNum
            : selectedLineNumber + 1;
    } else {
        if (currentLineText.trim().startsWith("return")) return selectedLineNumber;
        return selectedLineNumber + 1;
    }

}

export function getSpaces(document: TextDocument, selectedLineNumber: number, tabSize: number): string {
    const currentLine = document.lineAt(selectedLineNumber);
    const currentLineTextChars = currentLine.text.split("");
    if (
        isFunction(currentLine.text) || isJSBuiltInStatement(currentLine.text) || isClassDeclaration(currentLine.text)
    ) {
        const nextLine = document.lineAt(selectedLineNumber + 1);
        const nextLineTextChars = nextLine.text.split("");
        if (nextLineTextChars.filter(char => char !== " ").length !== 0) {
            if (
                nextLine.firstNonWhitespaceCharacterIndex >
                currentLine.firstNonWhitespaceCharacterIndex
            ) {
                if (
                    nextLineTextChars[nextLine.firstNonWhitespaceCharacterIndex - 1] ===
                    "\t"
                ) {
                    return " ".repeat(
                        nextLine.firstNonWhitespaceCharacterIndex * tabSize
                    );
                } else {
                    return " ".repeat(nextLine.firstNonWhitespaceCharacterIndex);
                }
            } else {
                if (
                    currentLineTextChars[
                    currentLine.firstNonWhitespaceCharacterIndex - 1
                    ] === "\t"
                ) {
                    return " ".repeat(
                        currentLine.firstNonWhitespaceCharacterIndex * tabSize
                    );
                } else {
                    return " ".repeat(currentLine.firstNonWhitespaceCharacterIndex);
                }
            }
        } else {
            if (
                currentLineTextChars[
                currentLine.firstNonWhitespaceCharacterIndex - 1
                ] === "\t"
            ) {
                return " ".repeat(
                    currentLine.firstNonWhitespaceCharacterIndex * tabSize
                );
            } else {
                return " ".repeat(currentLine.firstNonWhitespaceCharacterIndex);
            }
        }
    } else {
        if (
            currentLineTextChars[currentLine.firstNonWhitespaceCharacterIndex - 1] ===
            "\t"
        ) {
            return " ".repeat(currentLine.firstNonWhitespaceCharacterIndex * tabSize);
        } else {
            return " ".repeat(currentLine.firstNonWhitespaceCharacterIndex);
        }
    }
}

export function getAllConsoles(document: TextDocument, tabSize: number) {
    const documentNbrOfLines = document.lineCount;
    const logMessages = [];
    for (let i = 0; i < documentNbrOfLines; i++) {

        let numberOfOpenParenthesis = 0;
        let numberOfCloseParenthesis = 0;
        if (/console\./.test(document.lineAt(i).text)) {
            const logMessageLines = { spaces: "", lines: [] };
            logMessageLines.spaces = getSpaces(document, i, tabSize);
            for (let k = i; k <= documentNbrOfLines; k++) {
                logMessageLines.lines.push({
                    // @ts-ignore
                    range: document.lineAt(k).rangeIncludingLineBreak
                });
                if (document.lineAt(k).text.match(/\(/g)) {
                    // @ts-ignore
                    numberOfOpenParenthesis += document.lineAt(k).text.match(/\(/g)
                        .length;
                }
                if (document.lineAt(k).text.match(/\)/g)) {
                    // @ts-ignore
                    numberOfCloseParenthesis += document.lineAt(k).text.match(/\)/g)
                        .length;
                }
                if (
                    numberOfOpenParenthesis === numberOfCloseParenthesis &&
                    numberOfOpenParenthesis !== 0
                )
                    break;
            }
            logMessages.push(logMessageLines);
        }



    }
    return logMessages;
}
