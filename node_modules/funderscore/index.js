var _ = function (x) { return x }

// collection fns
_.pair = function (key, val) {
  var o = {}
  o[key] = val
  return o
}

_.contains = function (obj, key) {
  for (var k in obj) {
    if (k === key) {
      return true
    }
  }
  return false
}

// algebraic fns

_.map = function (obj, fn) {
  var o = {}
  for (var k in obj) {
    o[k] = fn(obj[k], k)
  }
  return o
}

_.reduce = function (obj, fn, seed) {
  var val = seed || {}
  for (var k in obj) {
    val = fn(val, obj[k], k)
  }
  return val
}

_.concat = function (objA, objB) {
  for (var k in objB) {
    objA[k] = objB[k]
  }
  return objA
}

/* i might be doing this wrong:
 * this applies a function to each key-value pair in a dictionary
 * where the function is (Pair) => Array
 * and returns a flattened Array
 */
_.flatMap = function (obj, fn) {
  return _.reduce(obj, function (arr, val, key) {
    return arr.concat(fn(val, key))
  }, [])
}

module.exports = _