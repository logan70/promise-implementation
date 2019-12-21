const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

const queueMicrotask = typeof window !== 'undefined' ? window.queueMicrotask : process.nextTick

class Promise {
  constructor(excutor) {
    this.state = PENDING
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    excutor(this._resolve.bind(this), this._reject.bind(this))
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }
    const promise2 = new Promise((resolve, reject) => {
      const next = () => queueMicrotask(() => {
        try {
          const x = this.state === FULFILLED ?
            onFulfilled(this.value) :
            onRejected(this.reason)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })

      if (this.state !== PENDING) return next()
      
      this.onFulfilledCallbacks.push(next)
      this.onRejectedCallbacks.push(next)
    })
    return promise2
  }

  catch(handler) {
    return this.then(v => v, e => handler(e))
  }

  finally(handler) {
    return this.then(() => handler(), () => handler())
  }

  static resolve(value) {
    return new Promise(resolve => resolve(value))
  }

  static reject(reason) {
    return new Promise((_, reject) => reject(reason))
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach(p => p.then(resolve, reject))
    })
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      const count = promises.length
      let resultArr = new Array(count)
      let fulfilledCount = 0
      const check = (result, i) => {
        resultArr[i] = result
        fulfilledCount++
        if (fulfilledCount === promises.length) {
          resolve(resultArr)
        }
      }
      promises.forEach((p, i) => {
        p.then(result => check(result, i), reject)
      })
    })
  }

  _resolve(value) {
    if (this.state !== PENDING) return
    this.state = FULFILLED
    this.value = value
    this.onFulfilledCallbacks.forEach(cb => cb(this.value))
  }

  _reject(reason) {
    if (this.state !== PENDING) return
    this.state = REJECTED
    this.reason = reason
    this.onRejectedCallbacks.forEach(cb => cb(this.reason))
  }
}

function resolvePromise(promise2, x, resolve, reject){
  if(x === promise2){
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  let called
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then
      if (typeof then === 'function') { 
        then.call(x, y => {
          if (called) return
          called = true
          resolvePromise(promise2, y, resolve, reject)
        }, err => {
          if (called) return
          called = true
          reject(err)
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

// Adapters to run Promises/A+ Compliance Test Suite
Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = Promise
