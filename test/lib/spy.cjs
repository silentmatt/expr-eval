'use strict';

module.exports = function (fn) {
  function spy() {
    spy.called = true;
    return fn.apply(this, arguments);
  }
  spy.called = false;
  return spy;
};
