React Native View Style Charts
===================
A charting library built using only View and Style

![View Style Charts Demo](https://lh3.googleusercontent.com/E0iC4yE-_lPjoGYAflNaLRNWgLGf6_iYDW9JFdJMeO8vc_zq80FqE9nOtntNvbiEW9wCBn4y8_CPc7yf6oKiO0gU7g)

https://rnplay.org/apps/7J2NIQ

Install
-------

Run under your React Native project folder:

```npm install react-native-vs-charts --save```

Usage
-----

```javascript
var {
  // axis and scale
  Axes,
  // the charts
  BarChart,
  LineChart,
  // helper functions
  makeRange,
  generateScale
} = require('react-native-vs-charts');
```

Data Objects
------------
There are 2 kinds of data we use to render the charts.

For bar charts and line charts:
```javascript
var DatasetPropType = ReactPropTypes.shape({
  name: ReactPropTypes.string,
  primaryColor: ReactPropTypes.string,
  secondaryColor: ReactPropTypes.string,
  values: ReactPropTypes.arrayOf(ReactPropTypes.number).isRequired
});
```

For pie chart:
```javascript
var DataPropType = ReactPropTypes.shape({
  name: ReactPropTypes.string,
  primaryColor: ReactPropTypes.string,
  secondaryColor: ReactPropTypes.string,
  value: ReactPropTypes.number.isRequired
});
```

The `name` is used for identification and legend; `primaryColor` and `secondaryColor` have different use in different charts.

Bar Chart
---------
You can create clustered or stacked bar charts vertically or horizontally.

```javascript
var BarChart = React.createClass({
  propTypes: {
    // Bar options
    // space between bars / bar clusters
    spacing: ReactPropTypes.number,
    // space between bars in bar cluster
    clusterSpacing: ReactPropTypes.number,
    // border width of the bar, uses secondaryColor from dataset
    barBorderWidth: ReactPropTypes.number,

    datasets: ReactPropTypes.arrayOf(DatasetPropType).isRequired,

    // Scale of the chart
    valueScale: ScalePropType.isRequired,

    // Style
    orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']),
    displayMode: ReactPropTypes.oneOf(['clustered', 'stacked']),
    style: View.propTypes.style
  }
});
```

Line Chart
----------
Line chart only supports one orientation. Points and area are optional.

```javascript
var LineChart = React.createClass({
  propTypes: {
    // data
    datasets: ReactPropTypes.arrayOf(DatasetPropType).isRequired,
    valueScale: ScalePropType.isRequired,
    // options
    categoryAxisMode: ReactPropTypes.oneOf(['point', 'range']),
    valueAxisMode: ReactPropTypes.oneOf(['normal', 'inverted']),
    showArea: ReactPropTypes.bool,
    showPoints: ReactPropTypes.bool,
    // styling
    lineWidth: ReactPropTypes.number,
    pointRadius: ReactPropTypes.number,
    pointBorderWidth: ReactPropTypes.number,
    style: View.propTypes.style
  }
});
```

Axes
----
The charts render without axes and scale by default, you can wrap the charts with this special component to show scale, values and names of the dataset. Children of this component are rendered on top of one another, so you can easily combine a bar chart with line chart. Shared properties are passed down to children so that you don't need to declare them again.

```javascript
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
    valueAxisMode: ReactPropTypes.oneOf(['normal', 'inverted']),
    valueScale: ScalePropType.isRequired,
    valueLabelStyle: Text.propTypes.style,

    // Style
    orientation: ReactPropTypes.oneOf(['vertical', 'horizontal']),
    style: View.propTypes.style
  }
});
```

Known Issues
------------
1. Points in line chart are clipped on Android

Development
-----------
1. Pie Chart
