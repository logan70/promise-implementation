import Promise from '../src/index'
const assert = require('assert')

describe('Promises.all Test cases', function () {
  it('`Promise.all` waits for all fulfillments', function () {
    return  assert.doesNotReject(() => {
      const p1 = Promise.resolve(3)
      const p2 = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('foo')
        }, 100)
      })

      return Promise.all([p1, p2]).then(values => { 
        return assert.deepStrictEqual(values, [3, 'foo'])
      })
    })
  })

  it('Non-promise values still counted in the returned promise array value', function () {
    return assert.doesNotReject(() => {
      return Promise.all([18, false, null, undefined, 'foo', [1, 2, 3], { bar: 'bar' }]).then(values => {
        return assert.deepStrictEqual(values, [18, false, null, undefined, 'foo', [1, 2, 3], { bar: 'bar' }])
      })
    })
  })

  it('`Promise.all` is rejected if any of the elements are rejected', function () {
    return assert.rejects(() => {
      const p1 = new Promise((resolve, reject) => { 
        setTimeout(() => resolve('one'), 100)
      }) 
      const p2 = new Promise((resolve, reject) => { 
        setTimeout(() => resolve('two'), 200) 
      })
      const p3 = new Promise((resolve, reject) => {
        setTimeout(() => resolve('three'), 300)
      })
      const p4 = new Promise((resolve, reject) => {
        setTimeout(() => resolve('four'), 400)
      })
      const p5 = new Promise((resolve, reject) => {
        reject(new Error('reject'))
      })
      return Promise.all([p1, p2, p3, p4, p5])
    })
  })

  it('It is possible to change this behaviour by handling possible rejections', function () {
    return assert.doesNotReject(() => {
      const p1 = new Promise((resolve, reject) => { 
        setTimeout(() => resolve('p1_delayed_resolution'), 1000) 
      }) 
      
      const p2 = new Promise((resolve, reject) => {
        throw new Error('p2_immediate_rejection')
      })
      
      const p3 = new Promise((resolve, reject) => {
        reject(new Error('p2_immediate_rejection'))
      })
      
      return Promise.all([
        p1.catch(error => { return error }),
        p2.catch(error => { return error }),
        p3.catch(error => { return error }),
      ])
    })
  })
})