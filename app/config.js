System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime"
    ]
  },
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },
  shim: {
    "bootstrap-multiselect": {
      "deps": [
        "jquery"
      ]
    }
  },

  map: {
    "babel": "npm:babel-core@5.8.33",
    "babel-runtime": "npm:babel-runtime@5.8.29",
    "bootstrap": "github:twbs/bootstrap@3.3.5",
    "bootstrap-multiselect": "github:davidstutz/bootstrap-multiselect@0.9.13",
    "core-js": "npm:core-js@1.2.6",
    "crossfilter": "github:square/crossfilter@1.3.12",
    "d3": "github:mbostock/d3@3.5.6",
    "davidstutz/bootstrap-multiselect": "github:davidstutz/bootstrap-multiselect@0.9.13",
    "firstopinion/formatter.js": "github:firstopinion/formatter.js@0.1.5",
    "font-awesome": "npm:font-awesome@4.4.0",
    "formatter.js": "github:firstopinion/formatter.js@0.1.5",
    "jquery": "github:components/jquery@2.1.4",
    "leaflet": "github:Leaflet/Leaflet@0.7.7",
    "lockr": "github:tsironis/lockr@0.8.2",
    "lodash": "npm:lodash@3.10.1",
    "mbostock/queue": "github:mbostock/queue@1.0.7",
    "postal": "npm:postal@1.0.7",
    "queue": "github:mbostock/queue@1.0.7",
    "square/crossfilter": "github:square/crossfilter@1.3.12",
    "tsironis/lockr": "github:tsironis/lockr@0.8.2",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "github:twbs/bootstrap@3.3.5": {
      "jquery": "github:components/jquery@2.1.4"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.29": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:core-js@1.2.6": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:font-awesome@4.4.0": {
      "css": "github:systemjs/plugin-css@0.1.19"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:lodash@3.10.1": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:postal@1.0.7": {
      "lodash": "npm:lodash@3.10.1"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});
