SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "github:": "jspm_packages/github/",
    "local:": "jspm_packages/local/",
    "cg/": "src/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  transpiler: "plugin-babel",
  packages: {
    "cg": {
      "main": "app.js",
      "format": "esm",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    }
  },
  map: {
    "crossfilter": "github:square/crossfilter@1.3.12",
    "lockr": "github:tsironis/lockr@0.8.4"
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json",
    "local:*.json"
  ],
  map: {
    "d3-scale-chromatic": "npm:d3-scale-chromatic@1.0.0",
    "cg-core": "local:cg-core@0.6.0",
    "d3/d3-queue": "github:d3/d3-queue@3.0.1",
    "d3-time-format": "npm:d3-time-format@2.0.0",
    "d3": "npm:d3@4.1.0",
    "d3-queue": "npm:d3-queue@3.0.1",
    "assert": "github:jspm/nodelibs-assert@0.2.0-alpha",
    "buffer": "github:jspm/nodelibs-buffer@0.2.0-alpha",
    "child_process": "github:jspm/nodelibs-child_process@0.2.0-alpha",
    "events": "github:jspm/nodelibs-events@0.2.0-alpha",
    "firstopinion/formatter.js": "github:firstopinion/formatter.js@0.1.5",
    "font-awesome": "npm:font-awesome@4.6.3",
    "fs": "github:jspm/nodelibs-fs@0.2.0-alpha",
    "http": "github:jspm/nodelibs-http@0.2.0-alpha",
    "https": "github:jspm/nodelibs-https@0.2.0-alpha",
    "leaflet": "github:Leaflet/Leaflet@0.7.7",
    "path": "github:jspm/nodelibs-path@0.2.0-alpha",
    "plugin-babel": "npm:systemjs-plugin-babel@0.0.12",
    "postal": "npm:postal@2.0.4",
    "process": "github:jspm/nodelibs-process@0.2.0-alpha",
    "square/crossfilter": "github:square/crossfilter@1.3.12",
    "tsironis/lockr": "github:tsironis/lockr@0.8.4",
    "url": "github:jspm/nodelibs-url@0.2.0-alpha",
    "util": "github:jspm/nodelibs-util@0.2.0-alpha",
    "yarden-livnat/cg-core": "github:yarden-livnat/cg-core@master"
  },
  packages: {
    "npm:font-awesome@4.6.3": {
      "map": {
        "css": "github:systemjs/plugin-css@0.1.23"
      }
    },
    "github:jspm/nodelibs-buffer@0.2.0-alpha": {
      "map": {
        "buffer-browserify": "npm:buffer@4.7.0"
      }
    },
    "npm:buffer@4.7.0": {
      "map": {
        "base64-js": "npm:base64-js@1.1.2",
        "ieee754": "npm:ieee754@1.1.6",
        "isarray": "npm:isarray@1.0.0"
      }
    },
    "github:jspm/nodelibs-http@0.2.0-alpha": {
      "map": {
        "http-browserify": "npm:stream-http@2.3.0"
      }
    },
    "github:jspm/nodelibs-url@0.2.0-alpha": {
      "map": {
        "url-browserify": "npm:url@0.11.0"
      }
    },
    "npm:stream-http@2.3.0": {
      "map": {
        "xtend": "npm:xtend@4.0.1",
        "builtin-status-codes": "npm:builtin-status-codes@2.0.0",
        "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
        "readable-stream": "npm:readable-stream@2.1.4",
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:readable-stream@2.1.4": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "inherits": "npm:inherits@2.0.1",
        "buffer-shims": "npm:buffer-shims@1.0.0",
        "core-util-is": "npm:core-util-is@1.0.2",
        "process-nextick-args": "npm:process-nextick-args@1.0.7",
        "util-deprecate": "npm:util-deprecate@1.0.2",
        "string_decoder": "npm:string_decoder@0.10.31"
      }
    },
    "npm:url@0.11.0": {
      "map": {
        "querystring": "npm:querystring@0.2.0",
        "punycode": "npm:punycode@1.3.2"
      }
    },
    "npm:postal@2.0.4": {
      "map": {
        "lodash": "npm:lodash@4.13.1"
      }
    },
    "npm:d3-request@1.0.0": {
      "map": {
        "d3-dsv": "npm:d3-dsv@1.0.0",
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-collection": "npm:d3-collection@1.0.0",
        "xmlhttprequest": "npm:xmlhttprequest@1.8.0"
      }
    },
    "npm:d3-force@1.0.0": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-collection": "npm:d3-collection@1.0.0",
        "d3-quadtree": "npm:d3-quadtree@1.0.0",
        "d3-timer": "npm:d3-timer@1.0.1"
      }
    },
    "npm:d3-drag@1.0.0": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-selection": "npm:d3-selection@1.0.0"
      }
    },
    "npm:d3-scale@1.0.0": {
      "map": {
        "d3-array": "npm:d3-array@1.0.0",
        "d3-collection": "npm:d3-collection@1.0.0",
        "d3-color": "npm:d3-color@1.0.0",
        "d3-format": "npm:d3-format@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0",
        "d3-time": "npm:d3-time@1.0.0",
        "d3-time-format": "npm:d3-time-format@2.0.0"
      }
    },
    "npm:d3-zoom@1.0.1": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-drag": "npm:d3-drag@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0",
        "d3-selection": "npm:d3-selection@1.0.0",
        "d3-transition": "npm:d3-transition@1.0.0"
      }
    },
    "npm:d3-time-format@2.0.0": {
      "map": {
        "d3-time": "npm:d3-time@1.0.0"
      }
    },
    "npm:d3-shape@1.0.0": {
      "map": {
        "d3-path": "npm:d3-path@1.0.0"
      }
    },
    "npm:d3-transition@1.0.0": {
      "map": {
        "d3-color": "npm:d3-color@1.0.0",
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-ease": "npm:d3-ease@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0",
        "d3-selection": "npm:d3-selection@1.0.0",
        "d3-timer": "npm:d3-timer@1.0.1"
      }
    },
    "npm:d3-brush@1.0.1": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.0",
        "d3-drag": "npm:d3-drag@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0",
        "d3-selection": "npm:d3-selection@1.0.0",
        "d3-transition": "npm:d3-transition@1.0.0"
      }
    },
    "npm:d3-dsv@1.0.0": {
      "map": {
        "rw": "npm:rw@1.3.2"
      }
    },
    "npm:d3-scale-chromatic@1.0.0": {
      "map": {
        "d3-interpolate": "npm:d3-interpolate@1.1.0"
      }
    },
    "npm:d3-interpolate@1.1.0": {
      "map": {
        "d3-color": "npm:d3-color@1.0.0"
      }
    },
    "npm:d3@4.1.0": {
      "map": {
        "d3-chord": "npm:d3-chord@1.0.0",
        "d3-geo": "npm:d3-geo@1.1.0",
        "d3-polygon": "npm:d3-polygon@1.0.0",
        "d3-format": "npm:d3-format@1.0.0",
        "d3-axis": "npm:d3-axis@1.0.0",
        "d3-drag": "npm:d3-drag@1.0.0",
        "d3-collection": "npm:d3-collection@1.0.0",
        "d3-random": "npm:d3-random@1.0.0",
        "d3-voronoi": "npm:d3-voronoi@1.0.0",
        "d3-time": "npm:d3-time@1.0.0",
        "d3-hierarchy": "npm:d3-hierarchy@1.0.0",
        "d3-interpolate": "npm:d3-interpolate@1.1.0",
        "d3-force": "npm:d3-force@1.0.0",
        "d3-shape": "npm:d3-shape@1.0.0",
        "d3-selection": "npm:d3-selection@1.0.0",
        "d3-request": "npm:d3-request@1.0.0",
        "d3-ease": "npm:d3-ease@1.0.0",
        "d3-color": "npm:d3-color@1.0.0",
        "d3-queue": "npm:d3-queue@3.0.1",
        "d3-time-format": "npm:d3-time-format@2.0.0",
        "d3-quadtree": "npm:d3-quadtree@1.0.0",
        "d3-timer": "npm:d3-timer@1.0.1",
        "d3-brush": "npm:d3-brush@1.0.1",
        "d3-scale": "npm:d3-scale@1.0.0",
        "d3-path": "npm:d3-path@1.0.0",
        "d3-array": "npm:d3-array@1.0.0",
        "d3-transition": "npm:d3-transition@1.0.0",
        "d3-dsv": "npm:d3-dsv@1.0.0",
        "d3-zoom": "npm:d3-zoom@1.0.1",
        "d3-dispatch": "npm:d3-dispatch@1.0.0"
      }
    },
    "npm:d3-chord@1.0.0": {
      "map": {
        "d3-path": "npm:d3-path@1.0.0",
        "d3-array": "npm:d3-array@1.0.0"
      }
    },
    "npm:d3-geo@1.1.0": {
      "map": {
        "d3-array": "npm:d3-array@1.0.0"
      }
    },
    "local:cg-core@0.6.0": {
      "map": {
        "d3": "npm:d3@4.1.0",
        "css": "github:systemjs/plugin-css@0.1.23"
      }
    },
    "github:yarden-livnat/cg-core@master": {
      "map": {
        "d3": "npm:d3@4.1.0",
        "css": "github:systemjs/plugin-css@0.1.23"
      }
    }
  }
});
