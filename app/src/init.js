/**
 * Created by yarden on 6/30/15.
 */
requirejs.config({
  baseUrl: 'src',

  config: {
    es6: {
      resolveModuleSource: function(source) {
        return 'es6!'+source;
      }
    }
  },

  paths: {
    es6: '../lib/requirejs-babel/es6',
    babel: '../lib/requirejs-babel/babel-4.6.6.min',
    d3: '../lib/d3/d3.min',
    c3: '../lib/c3/c3.min',
    queue: '../lib/queue-async/queue.min',
    lodash: '../lib/lodash/lodash.min',
    jquery: '../lib/jquery/dist/jquery.min',
    postal: '../lib/postal/lib/postal',
    formatter: '../lib/formatter/dist/formatter.min',
    leaflet: '../lib/leaflet/dist/leaflet'
  }
});

require(['app']);