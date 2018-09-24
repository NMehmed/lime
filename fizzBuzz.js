const fizzBuzz = {
    calculate (range) {
        for (var i = 1; i <= range; i++) {
            if (i % 15 === 0) console.log('FizzBuzz')
            else if (i % 5 === 0) console.log('Buzz')
            else if (i % 3 === 0) console.log('Fizz')
            else console.log(i)
        }
    }
}