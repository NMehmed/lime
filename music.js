const music = {
    numOfPlaylist(n, k, l) {
        return this._permute(n) * (Math.pow((n - k), (l - n)))
    },

    _permute(n) {
        let result = 1;

        for (var i = 2; i <= n; i++) {
            result = result * i
        }

        return result
    }
}