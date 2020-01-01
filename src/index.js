const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

const queueMicrotask = typeof window !== 'undefined' ? window.queueMicrotask : process.nextTick

export default class Promise {
  constructor(excutor) {
    this.state = PENDING
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []
    try {
      excutor(val => {
        resolvePromise(this, val, this._resolve.bind(this), this._reject.bind(this))
      }, this._reject.bind(this))
    } catch (error) {
      this._reject(error)
    }
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
    const promise2 = new Promise((resolve, reject) => {
      this.then(v => resolve(v), e => {
        try {
          const returnVal = handler(e)
          resolvePromise(promise2, returnVal, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
    return promise2
  }

  finally(handler) {
    return this.then(() => handler(), () => handler())
  }

  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolvePromise(null, value, resolve, reject)
    })
  }

  static reject(reason) {
    return new Promise((_, reject) => reject(reason))
  }

  static race(promises) {
    return new Promise((resolve, reject) => {
      promises.forEach(p => p.then(resolve, reject))
    })
  }

  static all(iterable) {
    return new Promise((resolve, reject) => {
      try {
        const type = iterable === null ? 'null' : typeof iterable
        const isObject = type === 'object'
        const gen = isObject && (iterable[Symbol.asyncIterator] || iterable[Symbol.iterator])
        const iterator = typeof gen === 'function' && gen.call(iterable)
        const isIteratorInvalid = !iterator || typeof iterator !== 'object' || typeof iterator.next !== 'function'
        if (isIteratorInvalid) {
          return reject(new TypeError(`${type} is not iterable (cannot read property Symbol(Symbol.iterator))`))
        }
  
        let resultArr = []
        let promisesCount = 0
        let fulfilledPromisesCount = 0
  
        const check = () => {
          if (promisesCount === fulfilledPromisesCount) {
            resolve(resultArr)
          }
        }
  
  
        while (true) {
          const { value, done } = iterator.next()
          if (done) {
            check()
            break
          }
          const index = promisesCount
          promisesCount++
          Promise.resolve(value).then(result => {
            resultArr[index] = result
            fulfilledPromisesCount++
            check()
          }).catch(err => {
            reject(err)
          })
        }
      } catch (error) {
        reject(error)
      }
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
  if(promise2 && x === promise2){
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
