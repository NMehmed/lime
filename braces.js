const braces = {
    BRACES: {
        ')': '(',
        ']': '[',
        '}': '{'
    },

    checkBalance(values) {
        let balanceCheckResult = []

        for (var i = 0; i < values.length; i++) {
            if (braces._isBalanced(values[i])) balanceCheckResult.push('YES')
            else balanceCheckResult.push('NO')
        }

        return balanceCheckResult
    },

    _isBalanced(str) {
        let openBraces = []

        for (var i = 0; i < str.length; i++) {
            let char = str[i]

            if (this._isOpenBracket(char)) {
                openBraces.push(char)
            } else {
                if (openBraces.length < 1) return false

                if (!this._isPair(char, openBraces.pop())) return false
            }
        }

        return openBraces.length === 0
    },

    _isOpenBracket(char) {
        return '{[('.indexOf(char) > -1
    },

    _isPair(char, expectingChar) {
        return this.BRACES[char] === expectingChar
    }
}