define(['exports', 'jquery'], function (exports, _jquery) {
  /**
   * Created by yarden on 7/7/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.init = init;

  var tags = new Map();

  function init() {
    _jquery.get('/kb', function (data) {
      console.log('kb:', data);
    }, 'json');
  }
});

//# sourceMappingURL=kb.js.map