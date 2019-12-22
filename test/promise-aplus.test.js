import Promise from '../src/index'

// Adapters to run Promises/A+ Compliance Test Suite
Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

describe("Promises/A+ Tests", function () {
  require("promises-aplus-tests").mocha(Promise);
});