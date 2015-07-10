define(['exports', 'd3'], function (exports, _d3) {
  /**
   * Created by yarden on 5/31/15.
   */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  exports.init = init;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function initialize(selection) {
    selection.each(function () {
      var header = _d3.select(this).select('.x-panel-header');
      var body = _d3.select(this).select('.x-panel-body');
      var closed = header.classed('closed');
      var h = parseInt(body.style('height'));

      var text = header.text();
      if (text) header.text(null);
      var icon = header.insert('span', ':first-child').classed('fa', true).classed('fa-fw', true).classed('fa-caret-right', closed).classed('fa-caret-down', !closed);
      if (text) {
        header.append('text').text(text);
      }
      header.on('click', function () {
        closed = !closed;
        header.classed('closed', closed);
        icon.classed('fa-caret-right', closed).classed('fa-caret-down', !closed);
        body.transition().style('margin-top', closed ? -h + 'px' : '0px');
      });

      body.style('margin-top', closed ? -h + 'px' : '0px');
    });
  }

  function init() {
    initialize(_d3.selectAll('.x-panel'));
  }

  var XPanel = (function () {
    function XPanel(el) {
      var _this = this;

      _classCallCheck(this, XPanel);

      this.closed = false;
      this.h = 0;
      this._panel = el.classed('x-panel', true);
      this._header = this._panel.append('div').attr('class', 'x-panel-header');
      this._body = this._panel.append('div').attr('class', 'x-panel-body');
      this._icon = this._header.append('span').attr('class', 'fa fa-fw').classed('fa-caret-right', this.closed).classed('fa-caret-down', !this.closed).on('click', function () {
        return _this.onClick(!_this.closed);
      });
    }

    _createClass(XPanel, [{
      key: 'onClick',
      value: function onClick(_) {
        this.closed = _;
        this._icon.classed('fa-caret-right', this.closed).classed('fa-caret-down', !this.closed);
        this._body.transition().style('margin-top', this.closed ? -this.h + 'px' : '0px');
      }
    }, {
      key: 'update',
      value: function update() {
        this.h = parseInt(this._body.style('height'));
        this._body.style('margin-top', this.closed ? -this.h + 'px' : '0px');
      }
    }, {
      key: 'header',
      get: function () {
        return this._header;
      }
    }, {
      key: 'body',
      get: function () {
        return this._body;
      }
    }, {
      key: 'icon',
      get: function () {
        return this._icon;
      }
    }]);

    return XPanel;
  })();

  exports.XPanel = XPanel;
});

//# sourceMappingURL=xpanel.js.map