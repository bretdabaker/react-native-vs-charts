/**
 * Copyright (c) 2015-present, Vivace Studio.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule BarChart
 */
'use strict';

var ReactPropTypes = require('ReactPropTypes');
var ViewStylePropTypes = require('ViewStylePropTypes');
var React = require('react-native');
var {
  StyleSheet,
  Text,
  View,
} = React;

var DataPropType = require('./DataPropType');
var DatasetPropType = require('./DatasetPropType');
var ScalePropType = require('./ScalePropType');

var resolveDatasets = require('resolveDatasets');
var ensureScaleCoverRange = require('./ensureScaleCoverRange');
var makeRange = require('./makeRange');

/**
  * AntiBar component
  */
var AntiBar = React.createClass({
  propTypes: {
    ratio: ReactPropTypes.number
  },

  render: function() {
    var barStyle = {
      flex: this.props.ratio
    };
    // render bar
    return (
      <View style={[barStyle]} />
    );
  }
});

/**
  * Bar component
  */
var Bar = React.createClass({
  propTypes: {
    orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']).isRequired,
    borderColor: ReactPropTypes.string,
    fillColor: ReactPropTypes.string,
    borderStyle: ViewStylePropTypes.borderStyle,
    borderWidth: ReactPropTypes.number,
    ratio: ReactPropTypes.number.isRequired,
    // not used fro rendering, reference only
    name: ReactPropTypes.string,
    value: ReactPropTypes.number.isRequired
  },

  getDefaultProps(): Props {
    return {
      borderStyle: 'solid',
      borderWidth: 1,
      fillColor: '#CBDDE6',
      borderColor: '#A2C3D2',
    }
  },

  render: function() {
    var vertical = this.props.orientation != 'horizontal';
    var directionStyle = {
      flexDirection: vertical ? 'column' : 'row'
    };
    // use flex to draw the bar
    var valueFlex = this.props.ratio;
    // the outter bar ensures the ratio is not affected by
    // the border width so that the bar meets the scale precisely
    var outterBarStyle = {
      flex: valueFlex
    };
    var orientationStyle = vertical ? barStyles.vertical : barStyles.horizontal;
    var innerBarStyle = {
      flex: 1,
      backgroundColor: this.props.fillColor,
      borderColor: this.props.borderColor,
      borderWidth: this.props.ratio ? this.props.borderWidth : 0,
      borderStyle: this.props.borderStyle
    };

    // render bar
    return (
      <View style={[outterBarStyle]}>
        <View style={[innerBarStyle, orientationStyle]} />
      </View>
    );
  }
});

var barStyles = StyleSheet.create({
  vertical: {
    borderBottomWidth: 0
  },

  horizontal: {
    borderLeftWidth: 0
  }
});

/**
  * BarCluster component
  */
var BarCluster = React.createClass({
  propTypes: {
    orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']).isRequired,
    minValue: ReactPropTypes.number.isRequired,
    maxValue: ReactPropTypes.number.isRequired,
    borderStyle: ViewStylePropTypes.borderStyle,
    borderWidth: ReactPropTypes.number,
    data: ReactPropTypes.arrayOf(DataPropType).isRequired,
    margin: ReactPropTypes.number,
    barSpacing: ReactPropTypes.number
  },

  _renderBar: function(datum, index, data) {
    var barMargin = this.props.barSpacing / 2;
    var marginStart = (index > 0) ? barMargin : 0;
    var marginEnd = (index == data.length - 1) ? 0 : barMargin;
    // always use diff to avoid divid by zero and negative values
    var ratio = (datum.value - this.props.minValue) / (this.props.maxValue - this.props.minValue);
    var antiRatio = 1 - ratio;
    var bar = (
      <Bar key='bar'
        orientation={this.props.orientation}
        fillColor={datum.primaryColor}
        borderColor={datum.secondaryColor}
        borderWidth={this.props.borderWidth}
        borderStyle={this.props.borderStyle}
        ratio={ratio}
        name={datum.name}
        value={datum.value} />
    );
    var antiBar = (
      <AntiBar key='antiBar'
        ratio={antiRatio} />
    );
    var vertical = this.props.orientation != 'horizontal';
    var barContent = vertical ? [antiBar, bar] : [bar, antiBar];
    var marginStyle = {
      marginLeft: vertical ? marginStart : 0,
      marginRight: vertical ? marginEnd : 0,
      marginTop: vertical ? 0 : marginStart,
      marginBottom: vertical ? 0 : marginEnd
    };
    return (
      <View key={'bar-' + index}
        style={[barClusterStyles.barContainer, marginStyle]}>
        {barContent}
      </View>
    );
  },

  render: function() {
    var vertical = this.props.orientation != 'horizontal';
    var marginStyle = {
      marginHorizontal: vertical ? this.props.margin : 0,
      marginVertical: vertical ? 0 : this.props.margin
    };
    return (
      <View style={[
          barClusterStyles.container,
          barClusterStyles[this.props.orientation],
          marginStyle
        ]}>
        { this.props.data.map(this._renderBar) }
      </View>
    );
  }
});

var barClusterStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between'
  },

  barContainer: {
    flex: 1
  },

  vertical: {
    flexDirection: 'row'
  },

  horizontal: {
    flexDirection: 'column'
  }
});

/**
  * BarStack component
  */
  var BarStack = React.createClass({
    propTypes: {
      orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']).isRequired,
      minValue: ReactPropTypes.number.isRequired,
      maxValue: ReactPropTypes.number.isRequired,
      borderStyle: ViewStylePropTypes.borderStyle,
      borderWidth: ReactPropTypes.number,
      data: ReactPropTypes.arrayOf(DataPropType).isRequired,
      margin: ReactPropTypes.number
    },

    _renderBar: function(datum, index, data) {
      // always use diff to avoid divid by zero and negative values
      var ratio = (datum.value - this.props.minValue) / (this.props.maxValue - this.props.minValue);
      return (
        <Bar key={'bar-' + index}
          orientation={this.props.orientation}
          fillColor={datum.primaryColor}
          borderColor={datum.secondaryColor}
          borderWidth={this.props.borderWidth}
          borderStyle={this.props.borderStyle}
          ratio={ratio}
          name={datum.name}
          value={datum.value} />
      );
    },

    render: function() {
      var vertical = this.props.orientation != 'horizontal';
      var marginStyle = {
        marginHorizontal: vertical ? this.props.margin : 0,
        marginVertical: vertical ? 0 : this.props.margin
      };
      var totalValue = 0;
      this.props.data.forEach(function(datum, index) {
        totalValue += datum.value;
      });
      var totalRatio = (totalValue - this.props.minValue) / (this.props.maxValue - this.props.minValue);
      var antiBar = (
        <AntiBar key='antiBar'
          ratio={1 - totalRatio} />
      );
      var bars = this.props.data.map(this._renderBar).reverse();
      bars.unshift(antiBar);
      if (!vertical) {
        bars.reverse();
      }

      return (
        <View style={[
            barStackStyles.container,
            barStackStyles[this.props.orientation],
            marginStyle
          ]}>
          { bars }
        </View>
      );
    }
  });

  var barStackStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent'
    },

    barContainer: {
      flex: 1
    },

    vertical: {
      flexDirection: 'column'
    },

    horizontal: {
      flexDirection: 'row'
    }
  });

/**
  * BarChart component
  */
var BarChart = React.createClass({
  propTypes: {
    // Bar options
    // space between bars / bar clusters
    spacing: ReactPropTypes.number,
    // space between bars in bar cluster
    clusterSpacing: ReactPropTypes.number,
    // Border width of the bar, uses secondaryColor from dataset
    barBorderWidth: ReactPropTypes.number,

    datasets: ReactPropTypes.arrayOf(DatasetPropType).isRequired,

    // Scale of the chart
    valueScale: ScalePropType.isRequired,

    // Style
    orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']),
    displayMode: ReactPropTypes.oneOf(['clustered', 'stacked']),
    style: View.propTypes.style
  },

  getDefaultProps(): Props {
    return {
      spacing: 10,
      clusterSpacing: 0,
      barBorderWidth: 2,
      displayMode: 'clustered',
      orientation: 'vertical'
    }
  },

  _renderBarCluster: function(data, index) {
    return (
      <BarCluster key={'barCluster-' + index}
        orientation={this.props.orientation}
        minValue={this.props.valueScale.min}
        maxValue={this.props.valueScale.max}
        borderStyle={this.props.barBorderStyle}
        borderWidth={this.props.barBorderWidth}
        margin={this.props.spacing / 2}
        barSpacing={this.props.clusterSpacing}
        data={data} />
    );
  },

  _renderBarStack: function(data, index) {
    return (
      <BarStack key={'barStack-' + index}
        orientation={this.props.orientation}
        minValue={this.props.valueScale.min}
        maxValue={this.props.valueScale.max}
        borderStyle={this.props.barBorderStyle}
        borderWidth={this.props.barBorderWidth}
        margin={this.props.spacing / 2}
        data={data} />
    );
  },

  componentWillMount: function() {
    var p = this.props;
    ensureScaleCoverRange(p.valueScale, p.datasets, p.displayMode == 'stacked');
  },

  componentWillReceiveProps: function(nextProps) {
    var p = nextProps;
    ensureScaleCoverRange(p.valueScale, p.datasets, p.displayMode == 'stacked');
  },

  render: function() {
    var dataArray = resolveDatasets(this.props.datasets);
    var content = this.props.displayMode == 'stacked' ?
      dataArray.map(this._renderBarStack) :
      dataArray.map(this._renderBarCluster);
    return (
      <View key='chart'
        style={[
          styles.container,
          styles[this.props.orientation],
          this.props.style
        ]}>
        {content}
      </View>
    );
  }
});

// Common base styles
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },

  vertical: {
    flexDirection: 'row'
  },

  horizontal: {
    flexDirection: 'column'
  }
});

module.exports = BarChart;
