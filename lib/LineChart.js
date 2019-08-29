/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule LineChart
 */
'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View
} = React;

var DatasetPropType = require('./DatasetPropType');
var ScalePropType = require('./ScalePropType');

var resolveDatasets = require('./resolveDatasets');
var ensureScaleCoverRange = require('./ensureScaleCoverRange');
var makeRange = require('./makeRange');

/**
  * Line component
  */
var Line = React.createClass({
  propTypes: {
    lineColor: React.PropTypes.string,
    lineWidth: React.PropTypes.number.isRequired,
    fromRatio: React.PropTypes.number.isRequired,
    toRatio: React.PropTypes.number.isRequired,
    pointMode: React.PropTypes.oneOf(['from', 'to', 'both', 'none']).isRequired,
    pointRadius: React.PropTypes.number,
    pointBorderWidth: React.PropTypes.number,
    pointBorderColor: React.PropTypes.string,
    pointColor: React.PropTypes.string
  },

  getDefaultProps(): Props {
    return {
      lineWidth: 2,
      lineColor: 'rgba(220,220,220,1)',
      pointMode: 'none',
      pointRadius: 5,
      pointBorderWidth: 2,
      pointColor: 'rgba(220,220,220,1)',
      pointBorderColor: 'rgba(0,0,0,.05)'
    }
  },

  getInitialState: function() {
    return {
      layout: null
    }
  },

  _onLayout: function(e) {
    this.setState({
      layout: e.nativeEvent.layout
    });
  },

  render: function() {
    if (!this.state.layout) {
      return (
        <View style={lineStyles.measure} onLayout={this._onLayout} />
      );
    }
    // render line
    var fromY = Math.floor(this.state.layout.height * this.props.fromRatio);
    var toY = Math.floor(this.state.layout.height * this.props.toRatio);
    var baseY = Math.min(fromY, toY);
    // calculate angle for line
    var center = baseY + Math.abs(fromY - toY) / 2;
    var sideA = Math.abs(fromY - toY) / 2;
    var sideB = this.state.layout.width / 2;
    var sideC = Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
    var rotate = Math.asin(sideA / sideC) * (180 / Math.PI) * -1;
    // inverse rotation if fromY is larger than toY
    if (fromY > toY) {
      rotate *= -1;
    }
    var linePadding = this.props.pointMode != 'none' ? this.props.pointRadius : 0;
    var lineWidth = sideC - linePadding;
    var scaleX = lineWidth / sideB;
    // styles
    var lineStyle = {
      position: 'absolute',
      bottom: center - this.props.lineWidth / 2,
      width: this.state.layout.width,
      height: this.props.lineWidth,
      backgroundColor: this.props.lineColor,
      transform: [
        {rotate: Math.round(rotate) + "deg"},
        {scaleX}
      ]
    };
    // points
    var pointStyle = {
      backgroundColor: this.props.pointColor,
      borderColor: this.props.pointBorderColor,
      borderWidth: this.props.pointBorderWidth,
      borderRadius: this.props.pointRadius,
      width: this.props.pointRadius * 2,
      height: this.props.pointRadius * 2
    };
    var points = [];
    // from point
    var drawFromPoint = this.props.pointMode == 'from' || this.props.pointMode == 'both';
    if (drawFromPoint) {
      var fromPointStyle = {
        ...pointStyle,
        bottom: fromY - this.props.pointRadius,
        left: -this.props.pointRadius,
        position: 'absolute'
      };
      var fromPoint = (
        <View key='from' style={fromPointStyle} />
      );
      points.push(fromPoint);
    }
    var drawToPoint = this.props.pointMode == 'to' || this.props.pointMode == 'both';
    if (drawToPoint) {
      var toPointStyle = {
        ...pointStyle,
        bottom: toY - this.props.pointRadius,
        right: -this.props.pointRadius,
        position: 'absolute'
      };
      var toPoint = (
        <View key='to' style={toPointStyle} />
      );
      points.push(toPoint);
    }
    return (
      <View style={lineStyles.container}>
        <View style={lineStyle} />
        {points}
      </View>
    );
  }
});

var lineStyles = StyleSheet.create({
  measure: {
    flex: 1
  },

  container: {
    flex: 1
  }
});

/**
  * Area component
  */
var Area = React.createClass({
  propTypes: {
    fillColor: React.PropTypes.string,
    fromRatio: React.PropTypes.number.isRequired,
    toRatio: React.PropTypes.number.isRequired
  },

  getDefaultProps(): Props {
    return {
      fillColor: 'rgba(0,0,0,.05)'
    }
  },

  getInitialState: function() {
    return {
      layout: null
    }
  },

  _onLayout: function(e) {
    this.setState({
      layout: e.nativeEvent.layout
    });
  },

  render: function() {
    if (!this.state.layout) {
      return (
        <View style={areaStyles.measure} onLayout={this._onLayout} />
      );
    }
    // render area
    // ratios
    var topRatio = Math.max(this.props.fromRatio, this.props.toRatio);
    var bottomRatio = Math.min(this.props.fromRatio, this.props.toRatio);
    var topHeight = Math.floor(this.state.layout.height * topRatio);
    var bottomHeight = Math.floor(this.state.layout.height * bottomRatio);
    // styles
    var bottomStyle = {
      width: this.state.layout.width,
      height: bottomHeight,
      backgroundColor: this.props.fillColor
    };
    var topStyle = {
      borderBottomWidth: topHeight - bottomHeight,
      borderBottomColor: this.props.fillColor,
      borderLeftWidth: this.state.layout.width,
      borderLeftColor: 'transparent'
    };
    // flip horizontal if fromRatio is larger then toRatio
    if (this.props.fromRatio > this.props.toRatio) {
      topStyle.transform = [
        {
          scaleX: -1
        }
      ];
    }
    return (
      <View style={areaStyles.container}>
        <View key='top' style={topStyle} />
        <View key='bottom' style={bottomStyle} />
      </View>
    );
  }
});

var areaStyles = StyleSheet.create({
  measure: {
    flex: 1
  },

  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end'
  }
});

/**
  * LineChart component
  */
var LineChart = React.createClass({
  propTypes: {
    // data
    datasets: React.PropTypes.arrayOf(DatasetPropType).isRequired,
    valueScale: ScalePropType.isRequired,
    // options
    categoryAxisMode: React.PropTypes.oneOf(['point', 'range']),
    valueAxisMode: React.PropTypes.oneOf(['normal', 'inverted']),
    showArea: React.PropTypes.bool,
    showPoints: React.PropTypes.bool,
    // styling
    lineWidth: React.PropTypes.number,
    pointRadius: React.PropTypes.number,
    pointBorderWidth: React.PropTypes.number,
    style: View.propTypes.style
  },

  getDefaultProps(): Props {
    return {
      valueAxisMode: 'normal',
      categoryAxisMode: 'point',
      showArea: false,
      showPoints: true,
      lineWidth: 2,
      pointRadius: 5,
      pointBorderWidth: 2
    }
  },

  _getRatio: function(fromValue, toValue) {
    var min = this.props.valueScale.min;
    var max = this.props.valueScale.max;
    var fromRatio = (fromValue - min) / (max - min);
    var toRatio = (toValue - min) / (max - min);
    if (this.props.valueAxisMode == 'inverted') {
      fromRatio = 1 - fromRatio;
      toRatio = 1 - toRatio;
    }
    return {
      from: fromRatio,
      to: toRatio
    };
  },

  _renderLine: function(value, index, values, dataset) {
    var fromValue = value;
    var toValue = values[index + 1];
    if (typeof toValue == 'undefined') {
      return null;
    };
    var ratio = this._getRatio(fromValue, toValue);
    var toIndex = index + 1;
    var positionMode = toIndex == values.length - 1 ? 'both' : 'from';
    var pointMode = this.props.showPoints ? positionMode : 'none';
    return (
      <Line key={'line-' + index}
        fromRatio={ratio.from}
        toRatio={ratio.to}
        lineStyle={this.props.lineStyle}
        lineWidth={this.props.lineWidth}
        lineColor={dataset.primaryColor}
        pointRadius={this.props.pointRadius}
        pointBorderWidth={this.props.pointBorderWidth}
        pointColor={dataset.secondaryColor}
        pointBorderColor={dataset.primaryColor}
        pointMode={pointMode} />
    );
  },

  _renderArea: function(value, index, values, dataset) {
    var fromValue = value;
    var toValue = values[index + 1];
    if (typeof toValue == 'undefined') {
      return null;
    };
    var ratio = this._getRatio(fromValue, toValue);
    return (
      <Area key={'area-' + index}
        fromRatio={ratio.from}
        toRatio={ratio.to}
        fillColor={dataset.secondaryColor} />
    );
  },

  _renderLineChart: function(dataset, index) {
    // render areas
    var areaContainer = null;
    if (this.props.showArea) {
      var areas = dataset.values.map(function(value, index, values) {
        return this._renderArea(value, index, values, dataset);
      }.bind(this));
      areaContainer = (
        <View key='area' style={styles.area}>
          {areas}
        </View>
      );
    }
    // render lines
    var lines = dataset.values.map(function(value, index, values) {
      return this._renderLine(value, index, values, dataset);
    }.bind(this));
    var lineContainer = (
      <View key='line' style={styles.line}>
        {lines}
      </View>
    );
    var chartFlex = {
      flex: dataset.values.length - 1
    };
    var margin = this.props.categoryAxisMode == 'range' && (
      <View style={styles.chartMargin} />
    );
    return (
        <View key={'lineChart-' + index} style={styles.chartContainer}>
          {margin}
          <View style={chartFlex}>
            {[areaContainer, lineContainer]}
          </View>
          {margin}
        </View>
    );
  },

  componentWillMount: function() {
    var p = this.props;
    ensureScaleCoverRange(p.valueScale, p.datasets, false);
  },

  componentWillReceiveProps: function(nextProps) {
    var p = nextProps;
    ensureScaleCoverRange(p.valueScale, p.datasets, false);
  },

  render: function() {
    var lineCharts = this.props.datasets.map(this._renderLineChart);
    return (
      <View key='chart'
        style={this.props.style}>
        {lineCharts}
      </View>
    );
  }
});

// Common base styles
var styles = StyleSheet.create({
  chartContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row'
  },
  // for categoryAxisMode == 'range'
  chartMargin: {
    flex: 0.5
  },

  chart: {
    flex: 1,
    flexDirection: 'row'
  },

  area: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row'
  },

  line: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    flexDirection: 'row'
  }
});

module.exports = LineChart;
