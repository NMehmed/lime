const movies = {
    query(term) {
        return new Promise((resolve, reject) => {
            let titles = []

            this._getTitles(term)
                .then((movies) => {
                    titles = movies.titles

                    if (movies.totalPages > 1) this._getAllTitles(term, movies.totalPages)
                        .then((restOfMovies) => {
                            restOfMovies.forEach(data => {
                                titles = titles.concat(data.titles)
                            });

                            resolve(titles.sort())
                        })
                    else resolve(titles.sort())
                })
                .catch((error) => {
                    reject(error)
                })
        })
    },

    _getAllTitles(term, pages) {
        let promises = []

        for (var i = 2; i <= pages; i++) {
            promises.push(this._getTitles(term, i))
        }

        return Promise.all(promises)
    },

    _getTitles(term, pageNum = 1) {
        return new Promise((resolve, reject) => {
            this._makeRequest(term, pageNum)
                .then((response) => {
                    let result = JSON.parse(response)

                    resolve({ titles: this._extractTitles(result), totalPages: result.total_pages })
                })
                .catch(error => reject(error))
        })
    },

    _makeRequest(term, pageNum) {
        return new Promise((resolve, reject) => {
            let xmlHttp = new XMLHttpRequest();
            let url = this._buildUrl(term, pageNum)

            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState === 4 && (xmlHttp.status === 200 || xmlHttp.status === 304))
                    resolve(xmlHttp.responseText)
                else if (xmlHttp.readyState === 4)
                    reject('Error')
            }

            xmlHttp.open("GET", url, true)
            xmlHttp.send(null)
        })
    },

    _buildUrl(title, pageNum) {
        return `https://jsonmock.hackerrank.com/api/movies/search/?Title=${title}&page=${pageNum}`
    },

    _extractTitles(response) {
        let titles = []

        response.data.forEach((movieData) => {
            titles.push(movieData.Title)
        });

        return titles
    }
}