define(['exports', 'd3', 'postal', './service', './tag_selection'], function (exports, _d3, _postal, _service, _tag_selection) {
  /**
   * Created by yarden on 11/19/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _postal2 = _interopRequireDefault(_postal);

  _postal2['default'].subscribe({ channel: 'global', topic: 'render', callback: update });

  function update() {
    var tags = [],
        topic = undefined;
    if (_tag_selection.selected.size > 0) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _tag_selection.selected[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tid = _step.value;

          topic = _service.topicsMap.get(tid);
          tags.push({ tid: tid, topic: topic, attr: 'selected' });
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    if (_tag_selection.excluded.size > 0) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = _tag_selection.excluded[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var tid = _step2.value;

          topic = _service.topicsMap.get(tid);
          tags.push({ tid: tid, topic: topic, attr: 'excluded' });
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }

    var items = _d32['default'].select('#selection-list').selectAll('li').data(tags);
    items.enter().append('li');
    items.text(function (d) {
      return d.topic.name;
    }).attr('class', function (d) {
      return d.attr;
    }).on('click', function (d) {
      if (_d32['default'].event.metaKey) {
        _tag_selection.exclude(d.topic.id);
      } else {
        _tag_selection.select(d.topic.id);
      }
    });

    items.exit().remove();
  }
});

//# sourceMappingURL=info_selection.js.map