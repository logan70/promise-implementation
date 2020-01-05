import Promise from '../src/index'
const assert = require('assert')

describe('`Promises.race()` Test cases', function () {
  it('`Promise.race()` asynchronously yields the value of the first promise in the given iterable to fulfill or reject.', function () {
    return  assert.doesNotReject(() => {
      const p1 = new Promise(function(resolve, reject) { 
        setTimeout(() => resolve('one'), 50); 
      })
      const p2 = new Promise(function(resolve, reject) { 
        setTimeout(() => resolve('two'), 100); 
      })

      return Promise.race([p1, p2]).then(value => { 
        return assert.strictEqual(value, 'one')
      })
    })
  })

  it('An empty iterable causes the promise returned by `Promise.race()` to be forever pending.', function (done) {
    let hasFulfilled = false
    Promise.race([]).then(() => {
      hasFulfilled = true
    })
    setTimeout(() => {
      assert.strictEqual(hasFulfilled, false)
      done()
    }, 50)
  })

  it('`Promise.race()` will resolve to the first non-promise value', function () {
    return assert.doesNotReject(() => {
      const p1 = 'p1'
      const p2 = new Promise((resolve, reject) => { 
        setTimeout(() => resolve('p2'), 100) 
      })
      const p3 = 3
      return Promise.race([p1, p2, p3]).then(result => {
        return assert.strictEqual(result, 'p1')
      })
    })
  })
})