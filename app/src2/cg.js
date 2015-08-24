define(['exports', 'module', 'd3', '/config', './components/selector', '/.graph'], function (exports, module, _d3, _config, _componentsSelector, _graph) {
  /**
   * Created by yarden on 8/24/15.
   */

  'use strict';

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _d32 = _interopRequireDefault(_d3);

  var _Selector = _interopRequireDefault(_componentsSelector);

  var _Graph = _interopRequireDefault(_graph);

  module.exports = function () {
    var width = 200,
        height = 200;
    var showEdges = false;

    var force = _d32['default'].layout.force().on('tick', updatePosition).on('end', forceDone);

    var x = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var y = _d32['default'].scale.linear().domain([0, 1]).range([0, 1]);

    var nodesRange = [0, 1],
        edgesRange = [0.7, 1];

    var nodesSelector = (0, _Selector['default'])().width(100).height(50).select(nodesRange).on('select', function (r) {
      nodesRange = r;
      render(_config.cg.canvas.fastDuration);
      updateEdgesSelector();
    });

    var edgesSelector = (0, _Selector['default'])().width(100).height(50).select(edgesRange).on('select', function (r) {
      edgesRange = r;render(_config.cg.canvas.fastDuration);
    });

    function updatePosition() {}
    function forceDone() {}
    function render() {}

    function build() {
      var svg = _d32['default'].select(this).append('svg');

      svg.append('rect').attr('class', 'overlay').attr('width', width).attr('height', Math.max(0, height - edgeSelector.height() - 10));

      /* selectors */
      var sg = svg.append('g').attr('class', 'cgSelectors');

      nodesSelector(sg.append('g').attr('class', 'nodesSelector'));

      sg.append('text').attr('transform', 'translate(20,' + (nodesSelector.height() + 5) + ')').text('topics');

      edgesSelector(sg.append('g').attr('class', 'edgesSelector').attr('transform', 'translate(' + (nodesSelector.width() + 10) + ',0)'));

      sg.append('text').attr('transform', 'translate(' + (20 + nodesSelector.width() + 10) + ',' + (nodesSelector.height() + 5) + ')').text('relations').on('click', function () {
        showEdges = !showEdges;render();
      });

      var g = svg.append('g');

      g.append('g').attr('class', 'links');
      g.append('g').attr('class', 'nodes');

      addListeners();

      return g;
    }

    function addListeners() {}

    var cg = function cg(selection) {
      selection.each(function (d) {
        var g = _d32['default'].select(this).select('g');
        if (g.empty()) g = build();
      });
    };

    cg.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      return this;
    };

    cg.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      return this;
    };

    cg.render = function () {
      return this;
    };

    return cg;
  };
});

//# sourceMappingURL=cg.js.map