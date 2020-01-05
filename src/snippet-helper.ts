
export function isClassDeclaration(code: string): boolean {
    const classNameRegex = /class(\s+)[a-zA-Z]+(.*){/;
    return classNameRegex.test(code);
}

export function isObjectDeclaration(code: string): boolean {
    const objectRegex = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*){/;
    return objectRegex.test(code);
}

export function isArrayDeclaration(selectedCode: string, nextLineCode: string): boolean {
    const arrayDeclarationRegex = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*)\[/;
    return arrayDeclarationRegex.test(selectedCode) ||
        (/(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*[a-zA-Z0-9]*/.test(selectedCode)
            && nextLineCode.startsWith("["));
}

export function isFunctionCallDeclaration(code: string): boolean {
    const functionCallDeclarationRegex = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*\(.*/;
    return functionCallDeclarationRegex.test(code);
}

export function isObjectFunctionCallDeclaration(selectedCode: string, nextLineCode: string): boolean {
    const objectFunctionCallDeclaration = /(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*[a-zA-Z0-9]*\./;
    return objectFunctionCallDeclaration.test(selectedCode) || (/(const|let|var)?(\s*)[a-zA-Z0-9]*(\s*)=(\s*).*[a-zA-Z0-9]*/.test(selectedCode) && nextLineCode.startsWith("."));
}

export function isFunction(selectedCode: string): boolean {
    const namedFunctionDeclarationRegex = /[a-zA-Z]+(\s*)\(.*\)(\s*){/;
    const nonNamedFunctionDeclaration = /(function)(\s*)\(.*\)(\s*){/;
    const namedFunctionExpressionRegex = /[a-zA-Z]+(\s*)=(\s*)(function)?(\s*)[a-zA-Z]*(\s*)\(.*\)(\s*)(=>)?(\s*){/;
    const isNamedFunctionDeclaration = namedFunctionDeclarationRegex.test(
        selectedCode
    );
    const isNonNamedFunctionDeclaration = nonNamedFunctionDeclaration.test(
        selectedCode
    );
    const isNamedFunctionExpression = namedFunctionExpressionRegex.test(selectedCode);
    return (
        (isNamedFunctionDeclaration && !isNonNamedFunctionDeclaration) ||
        isNamedFunctionExpression
    );
}

export function isJSBuiltInStatement(selectedCode: string): boolean {
    const jSBuiltInStatement = /(if|switch|while|for|catch)(\s*)\(.*\)(\s*){/;
    return jSBuiltInStatement.test(selectedCode);
}