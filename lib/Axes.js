/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Axes
 */
'use strict';

var invariant = require('invariant');

var ReactPropTypes = require('ReactPropTypes');
var ViewStylePropTypes = require('ViewStylePropTypes');
var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
} = React;

var StyleSheetPropType = require('StyleSheetPropType');
var AxisStylePropTypes = require('./AxisStylePropTypes');

var ChartScalePropType = require('./ChartScalePropType');

var flattenStyle = require('flattenStyle');

var axisStylePropType = StyleSheetPropType(AxisStylePropTypes);

// Helper function to determine decimal places
// http://stackoverflow.com/a/20334744
var findDecimalPlaces = function(){
 function isInt(n){
    return typeof n === 'number' &&
           parseFloat(n) == parseInt(n, 10) && !isNaN(n);
 }
 return function(n){
    var a = Math.abs(n);
    var c = a, count = 1;
    while(!isInt(c) && isFinite(c)){
       c = a * Math.pow(10,count++);
    }
    return count-1;
 };
}();

var DEFAULT_AXIS_LABEL_WIDTH = 40;

/**
  * Axes component plots axes, labels and gridlines for a chart
  */
var Axes = React.createClass({
  propTypes: {
    // Category axis options
    showCategoryAxisLine: ReactPropTypes.bool,
    showCategoryLabels: ReactPropTypes.bool,
    showCategoryTicks: ReactPropTypes.bool,
    showCategoryGridlines: ReactPropTypes.bool,
    categoryAxisStyle: axisStylePropType,
    categoryAxisMode: ReactPropTypes.oneOf(['point', 'range']),
    categoryLabelStyle: Text.propTypes.style,
    categoryLabels: ReactPropTypes.arrayOf(ReactPropTypes.string),

    // Value axis options
    showValueAxisLine: ReactPropTypes.bool,
    showValueLabels: ReactPropTypes.bool,
    showValueTicks: ReactPropTypes.bool,
    showValueGridlines: ReactPropTypes.bool,
    valueAxisStyle: axisStylePropType,
    valueScale: ChartScalePropType.isRequired,
    valueLabelStyle: Text.propTypes.style,

    // Style
    orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']),
    style: View.propTypes.style
  },

  getDefaultProps(): Props {
    return {
      showCategoryAxisLine: true,
      showCategoryLabels: true,
      showCategoryGridlines: true,
      showCategoryTicks: true,
      categoryAxisMode: 'range',

      showValueAxisLine: true,
      showValueLabels: true,
      showValueGridlines: true,
      showValueTicks: true,
      roundValueLabels: true,

      orientation: 'vertical'
    }
  },

  _isVertical: function() {
    return this.props.orientation == 'vertical';
  },

  _getValues: function(props) {
    var scale = props.valueScale;
    var values = [];
    var valueCount = Math.floor((scale.max - scale.min) / scale.unit);
    for (var i = 0; i <= valueCount; i++) {
      var value = (scale.unit * i) + scale.min;
      values.push(value);
    }
    // add remaining value item
    var valueRemain = scale.max - ((valueCount * scale.unit) + scale.min);
    if (valueRemain > 0) {
      values.push(scale.max);
    }
    return values;
  },

  _getValueUnits: function(props) {
    var scale = props.valueScale;
    var units = [];
    var unitCount = Math.floor((scale.max - scale.min) / scale.unit);
    for (var i = 0; i < unitCount; i++) {
      var unit = scale.unit;
      units.push(unit);
    }
    // add remaining unit item
    var unitRemain = scale.max - ((unitCount * scale.unit) + scale.min);
    if (unitRemain) {
      units.push(unitRemain);
    }
    return units;
  },

  // distributed evenly
  _getCategoryUnits: function(props) {
    var unitCount = props.categoryLabels.length;
    var units = [];
    var base = props.categoryAxisMode == 'point' ? 1 : 0
    for (var i = base; i < unitCount; i++) {
      units.push(1);
    }
    return units;
  },

  // Used to position labels and ticks
  _getXAxisLabelWidth: function() {
    return this.xAxisLabelStyle.width || DEFAULT_AXIS_LABEL_WIDTH;
  },

  // Used to position labels and ticks
  _getYAxisLabelWidth: function() {
    return this.yAxisLabelStyle.width || DEFAULT_AXIS_LABEL_WIDTH;
  },

  // Used to position labels and ticks
  _getYAxisLabelHeight: function() {
    return this.yAxisLabelStyle.fontSize;
  },

  _renderXAxisLabels: function() {
    if (!this.showXAxisLabels) {
      return null;
    }
    var containerLayout = {
      alignItems: this.xAxisMode == 'point' ? 'flex-start' : 'center',
      marginTop: this.xAxisStyle.labelOffset
    };
    var labelWidth = this._getXAxisLabelWidth();
    var textStyle = {
      width: labelWidth,
      textAlign: 'center'
    };

    var labels = [];
    for (var i = this.xAxisLabels.length - 1; i >= 0; i--) {
      var unit =  this.xAxisUnits[i];
      var flex = {
        flex: unit,
        width: unit ? null : labelWidth
      };
      var label = (
        <View  key={'label-' + i}
          style={[containerLayout, flex]}>
          <Text style={[this.xAxisLabelStyle, textStyle]}>
            {this.xAxisLabels[i]}
          </Text>
        </View>
      );
      labels.push(label);
    }
    var labelWidth = this.showXAxisLabels ? this._getXAxisLabelWidth() : 0;
    var margin = this.xAxisMode == 'point' ? -(labelWidth / 2) : 0;
    var marginStyle = {
      marginHorizontal: margin
    };
    return (
      <View key='labels' style={[styles.xAxisLabels, marginStyle]}>
        {labels.reverse()}
      </View>
    );
  },

  _renderYAxisLabels: function() {
    if (!this.showYAxisLabels) {
      return null;
    }
    var labels = [];
    var containerLayout = {
      justifyContent: this.yAxisMode == 'point' ? 'flex-start' : 'center',
      alignItems: 'flex-end',
      marginRight: this.yAxisStyle.labelOffset
    };
    var labelWidth = this._getYAxisLabelWidth();
    var labelHeight = this._getYAxisLabelHeight();
    var textStyle = {
      textAlign: 'right'
    };

    for (var i = 0; i < this.yAxisLabels.length; i++) {
      var unit =  this.yAxisUnits[i];
      var layoutStyle = {
        flex: unit,
        width: labelWidth,
        height: unit ? null : labelHeight
      };
      var label = (
        <View key={'label-' + i}
          style={[containerLayout, layoutStyle]}>
          <Text style={[textStyle, this.yAxisLabelStyle]}>
            {this.yAxisLabels[i]}
          </Text>
        </View>
      );
      labels.push(label);
    }
    return (
      <View key='labels' style={[styles.yAxisLabels]}>
        {labels}
      </View>
    );
  },

  _renderXAxisTicks: function() {
    if (!this.showXAxisTicks) {
      return null;
    }
    // render
    var tickStyle = {
      borderRightWidth: this.xAxisStyle.gridlineWidth,
      borderColor: this.xAxisStyle.gridlineColor
    };
    var firstTickStyle = {
      borderLeftWidth: this.xAxisStyle.gridlineWidth
    };
    var ticks = [];
    for (var i = 0; i < this.xAxisUnits.length; i++) {
      var flex = {
        flex: this.xAxisUnits[i],
      };
      var tick = (
        <View key={'tick-' + i}
          style={[
            tickStyle,
            flex,
            (i == 0) && firstTickStyle]} />
      );
      ticks.push(tick);
    }
    var containerStyle = {
      flexDirection: 'row',
      height: this.xAxisStyle.tickLength
    };
    return (
      <View key='ticks' style={[containerStyle]}>
        {ticks}
      </View>
    );
  },

  _renderYAxisTicks: function() {
    if (!this.showYAxisTicks) {
      return null;
    }
    // render
    var tickStyle = {
      borderTopWidth: this.yAxisStyle.gridlineWidth,
      borderColor: this.yAxisStyle.gridlineColor
    };
    var lastTickStyle = {
      borderBottomWidth: this.xAxisStyle.gridlineWidth
    };
    var ticks = [];
    for (var i = 0; i < this.yAxisUnits.length; i++) {
      var flex = {
        flex: this.yAxisUnits[i],
      };
      var tick = (
        <View key={'tick-' + i}
          style={[
            tickStyle,
            flex,
            (i == this.yAxisUnits.length - 1) && lastTickStyle]} />
      );
      ticks.push(tick);
    }

    var labelHeight = this.showYAxisLabels ? this._getYAxisLabelHeight() : 0;
    var margin = this.yAxisMode == 'point' ? labelHeight / 2 : 0;
    var containerStyle = {
      width: this.yAxisStyle.tickLength,
      marginVertical: margin
    };
    return (
      <View key='ticks' style={[containerStyle]}>
        {ticks}
      </View>
    );
  },

  _renderGrids: function() {
    // style
    var columnStyle = {
      flexDirection: 'row',
      borderTopWidth: this.showYAxisGridlines ?  this.yAxisStyle.gridlineWidth : 0,
      borderTopColor: this.yAxisStyle.gridlineColor
    };
    var rowStyle = {
      borderRightWidth: this.showXAxisGridlines ?  this.xAxisStyle.gridlineWidth : 0,
      borderRightColor: this.xAxisStyle.gridlineColor
    };
    // render
    var columns = [];
    for (var i = 0; i < this.yAxisUnits.length; i++) {
      var rows = [];
      for (var j = 0; j < this.xAxisUnits.length; j++) {
        var rowFlex = {
          flex: this.xAxisUnits[j]
        };
        var row = (
          <View  key={'col-' + j}
            style={[rowStyle, rowFlex]} />
        );
        rows.push(row);
      }
      var columnFlex = {
        flex: this.yAxisUnits[i]
      }
      var column = (
        <View key={'col-' + i}
          style={[columnStyle, columnFlex]}>
          {rows}
        </View>
      );
      columns.push(column);
    }
    // transparent border for padding
    var borderStyle = {
      borderBottomWidth: this.showYAxisGridlines ?  this.yAxisStyle.gridlineWidth : 0,
      borderLeftWidth: this.showXAxisGridlines ? this.xAxisStyle.gridlineWidth : 0,
      borderColor: 'transparent'
    };
    return (
      <View key='grids' style={[styles.absolute, borderStyle]}>
        {columns}
      </View>
    );
  },

  _renderChildren: function() {
    // transparent border for padding
    var borderStyle = {
      borderBottomWidth: this.showYAxisGridlines ?  this.yAxisStyle.gridlineWidth : 0,
      borderLeftWidth: this.showXAxisGridlines ? this.xAxisStyle.gridlineWidth : 0,
      borderColor: 'transparent'
    };
    var children = React.Children.map(this.props.children, function(child, index) {
      return React.cloneElement(child, {
        ...child.props,
        key: 'child-' + index,
        style:[child.style, styles.absolute]
      });
    }, this);
    return (
      <View key='children' style={[styles.absolute, borderStyle]}>
        {children}
      </View>
    );
  },

  _renderAxisLines: function() {
    var axisLineStyle = {
      borderLeftColor: this.yAxisStyle.axisLineColor,
      borderLeftWidth: this.showYAxisLine ? this.yAxisStyle.axisLineWidth : 0,
      borderBottomColor: this.xAxisStyle.axisLineColor,
      borderBottomWidth: this.showXAxisLine ? this.xAxisStyle.axisLineWidth : 0
    }
    return (
      <View key='axis_lines' style={[styles.absolute, axisLineStyle]}/>
    );
  },

  _processProps: function(props) {
    // round the values to same decimal places as unit
    var values = this._getValues(props);
    var unitDecimalPlaces = findDecimalPlaces(props.valueScale.unit);
    var fixedValues = [];
    for (var i = 0; i < values.length; i++) {
      var value = values[i];
      fixedValues.push(value.toFixed(unitDecimalPlaces));
    }
    // convert vertical/horizontal orientation to x/y axis,
    // flatten style as well
    var vertical = (props.orientation == 'vertical');
    if (vertical) {
      this.showXAxisLine = props.showCategoryAxisLine;
      this.showYAxisLine = props.showValueAxisLine;
      this.showXAxisLabels = props.showCategoryLabels;
      this.showYAxisLabels = props.showValueLabels;
      this.showXAxisTicks = props.showCategoryTicks;
      this.showYAxisTicks = props.showValueTicks;
      this.showXAxisGridlines = props.showCategoryGridlines;
      this.showYAxisGridlines = props.showValueGridlines;
      this.xAxisStyle = flattenStyle([styles.categoryAxis, this.props.categoryAxisStyle]);
      this.yAxisStyle = flattenStyle([styles.valueAxis, this.props.valueAxisStyle]);
      this.xAxisLabelStyle = flattenStyle([styles.categoryLabel, this.props.categoryLabelStyle]);
      this.yAxisLabelStyle = flattenStyle([styles.valueLabel, this.props.valueLabelStyle]);
      this.xAxisMode = this.props.categoryAxisMode;
      this.yAxisMode = 'point';
      this.xAxisLabels = this.props.categoryLabels;
      this.yAxisLabels = fixedValues.reverse();
      this.xAxisUnits = this._getCategoryUnits(props);
      this.yAxisUnits = this._getValueUnits(props).reverse();
    } else {
      this.showYAxisLine = props.showCategoryAxisLine;
      this.showXAxisLine = props.showValueAxisLine;
      this.showYAxisLabels = props.showCategoryLabels;
      this.showXAxisLabels = props.showValueLabels;
      this.showYAxisTicks = props.showCategoryTicks;
      this.showXAxisTicks = props.showValueTicks;
      this.showYAxisGridlines = props.showCategoryGridlines;
      this.showXAxisGridlines = props.showValueGridlines;
      this.yAxisStyle = flattenStyle([styles.categoryAxis, this.props.categoryAxisStyle]);
      this.xAxisStyle = flattenStyle([styles.valueAxis, this.props.valueAxisStyle]);
      this.yAxisLabelStyle = flattenStyle([styles.categoryLabel, this.props.categoryLabelStyle]);
      this.xAxisLabelStyle = flattenStyle([styles.valueLabel, this.props.valueLabelStyle]);
      this.yAxisMode = this.props.categoryAxisMode;
      this.xAxisMode = 'point';
      this.yAxisLabels = this.props.categoryLabels;
      this.xAxisLabels = fixedValues;
      this.yAxisUnits = this._getCategoryUnits(props);
      this.xAxisUnits = this._getValueUnits(props);
    }
  },

  componentWillMount: function() {
    invariant(this.props.valueScale != null && this.props.categoryLabels != null, 'valueScale and categoryLabels property are required');
    this._processProps(this.props);
  },

  componentWillReceiveProps: function(nextProps: Object) {
    invariant(this.props.valueScale != null && this.props.categoryLabels != null, 'valueScale and categoryLabels property are required');
    this._processProps(nextProps);
  },

  render: function() {
    // label sizes
    var yLabelWidth = this.showYAxisLabels ? this._getYAxisLabelWidth() + this.yAxisStyle.labelOffset : 0;
    var yLabelHeight = this.showYAxisLabels ? this._getYAxisLabelHeight() : 0;
    var yTickLength = this.showYAxisTicks ? this.yAxisStyle.tickLength : 0;
    var xLabelWidth = this.showXAxisLabels ? this._getXAxisLabelWidth() : 0;
    var yLabelTickWidth = yLabelWidth + yTickLength;
    var xLabelMargin = this.xAxisMode == 'point' ? xLabelWidth / 2 : 0;
    var yLabelMargin = this.yAxisMode == 'point' ? yLabelHeight / 2 : 0;
    // content margins for aligning with y axis
    var contentMarginStyle = {
      marginVertical: yLabelMargin,
      marginRight: xLabelMargin
    };
    // min width
    var yAxisMinWidth = Math.max(xLabelMargin, yLabelTickWidth);
    var yAxisMinWidthStyle = {
      width: yAxisMinWidth
    };
    // x axis margins for aligning with content
    var xAxisMarginStyle = {
      marginTop: -yLabelMargin,
      marginLeft: yAxisMinWidth,
      marginRight: xLabelMargin
    };
    return (
      <View key='container' style={[styles.container, this.props.style]}>
        <View key='top' style={[styles.top]}>
          <View key='y_axis' style={[styles.yAxis, yAxisMinWidthStyle]}>
            <View key='content' style={[styles.yAxisContent]}>
              { this._renderYAxisLabels() }
              { this._renderYAxisTicks() }
            </View>
          </View>
          <View key='content' style={[styles.chartContent, contentMarginStyle]}>
            { this._renderGrids() }
            { this._renderChildren() }
            { this._renderAxisLines() }
          </View>
        </View>
        <View key='bottom' style={[styles.bottom]}>
          <View key='x_axis' style={[styles.xAxis, xAxisMarginStyle]}>
            <View key='content' style={[styles.xAxisContent]}>
              { this._renderXAxisTicks() }
              { this._renderXAxisLabels() }
            </View>
          </View>
        </View>
      </View>
    );
  }
});

// Common base styles
var styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: 'transparent'
  },

  top: {
    flex: 1,
    flexDirection: 'row'
  },

  bottom: {
    flexDirection: 'column'
  },

  xAxis: {
    flexDirection: 'row'
  },

  yAxis: {
    flexDirection: 'column',
    alignItems: 'flex-end'
  },

  xAxisContent: {
    flex: 1,
    flexDirection: 'column'
  },

  yAxisContent: {
    flex: 1,
    flexDirection: 'row'
  },

  chartContent: {
    flex: 1,
    backgroundColor: 'transparent'
  },

  xAxisLabels: {
    flexDirection: 'row'
  },

  yAxisLabels: {
    flexDirection:'column',
    alignItems:'flex-end'
  },

  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },

  valueAxis: {
    axisLineWidth: 1,
    axisLineColor: 'gray',
    tickLength: 6,
    labelOffset: 6,
    gridlineWidth: 1,
    gridlineColor: 'gray',
    gridlineStyle: 'solid'
  },

  categoryAxis: {
    axisLineWidth: 1,
    axisLineColor: 'gray',
    tickLength: 6,
    labelOffset: 6,
    gridlineWidth: 1,
    gridlineColor: 'gray',
    gridlineStyle: 'solid'
  },

  valueLabel: {
    width: DEFAULT_AXIS_LABEL_WIDTH,
    fontSize: 12,
    color: 'gray'
  },

  categoryLabel: {
    width: DEFAULT_AXIS_LABEL_WIDTH,
    fontSize: 12,
    color: 'gray'
  }
});

module.exports = Axes;
