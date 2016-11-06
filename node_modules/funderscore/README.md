# funderscore
happy functional funtimes version of _

## usage

    var _ = require('funderscore')

    var foo = {
      a: 'ha',
      b: 'ob',
      c: 'ac'
    }

    _.reduce(
      _.map(foo, function (val) {
          return val[1].toUpperCase()
        }),
      function (seed, val, key) {
          seed[key+'M'] = val
          return seed
        })
      )
    // => {
    //      aM: 'A',
    //      bM: 'B',
    //      cM: 'C'
    //    } 

## stability

api likely to change. I want to experiment more with chaining, possibly using `this`

## installation

    $ npm install funderscore

## contributors

jden <jason@denizac.org>

## license
MIT. (c) 2013 jden <jason@denizac.org>. See LICENSE.md