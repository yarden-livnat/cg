/**
 * Created by yarden on 5/31/15.
 */

import * as d3 from 'd3';

function initialize(selection) {
  selection.each(function() {
    var header = d3.select(this).select('.x-panel-header');
    var body = d3.select(this).select('.x-panel-body');
    var closed = header.classed('closed');
    var h = parseInt(body.style('height'));

    var text = header.text();
    if (text) header.text(null);
    var icon = header.insert('span', ':first-child')
      .classed('fa', true)
      .classed('fa-fw', true)
      .classed('fa-caret-right', closed)
      .classed('fa-caret-down', !closed);
    if (text) {
      header.append('text').text(text);
    }
    header.on('click', function() {
      closed = !closed;
      header.classed('closed', closed);
      icon
        .classed('fa-caret-right', closed)
        .classed('fa-caret-down', !closed);
      body
        .transition()
        .style('margin-top', closed ? -h+'px' : '0px');
    });

    body.style('margin-top', closed ? -h+'px' : '0px');
  });
}

export function init() {
  initialize(d3.selectAll('.x-panel'));
}

export class XPanel {
  constructor(el) {
    this.closed = false;
    this.h = 0;
    this._panel = el.classed('x-panel', true);
    this._header = this._panel.append('div').attr('class', 'x-panel-header');
    this._body = this._panel.append('div').attr('class', 'x-panel-body');
    this._icon = this._header.append('span')
      .attr('class', 'fa fa-fw')
      .classed('fa-caret-right', this.closed)
      .classed('fa-caret-down', !this.closed)
      .on('click',  () => this.onClick(!this.closed));
  }

  onClick(_) {
    this.closed = _;
    this._icon
      .classed('fa-caret-right', this.closed)
      .classed('fa-caret-down', !this.closed);
    this._body
      .transition()
      .style('margin-top', this.closed ? -this.h+'px' : '0px');
  }

  get header() { return this._header; }
  get body() { return this._body;}
  get icon() { return this._icon; }

  update() {
    this.h = parseInt(this._body.style('height'));
    this._body.style('margin-top', this.closed ? -this.h+'px' : '0px');
  }
}