'use strict';
/* global d3 */
const SearchResults = new Mongo.Collection("searchresults");
Template.graph.rendered = function() {
    let data = SearchResults.find({}).fetch();

    /*    var data = [{
            date: '15-Oct-15',
            AngularJS: '50',
            ReactJS: '100'
        }, {
            date: '15-Oct-16',
            AngularJS: '55',
            ReactJS: '150'
        }, {
            date: '15-Oct-17',
            AngularJS: '75',
            ReactJS: '170'
        }, {
            date: '15-Oct-18',
            AngularJS: '90',
            ReactJS: '144'
        }, {
            date: '15-Oct-19',
            AngularJS: '95',
            ReactJS: '150'
        }, {
            date: '15-Oct-20',
            AngularJS: '80',
            ReactJS: '152'
        }];*/

    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%y-%b-%d").parse,
        formatPercent = d3.format(".0%");

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(formatPercent);

    var area = d3.svg.area()
        .x(function(d) {
            return x(d.date);
        })
        .y0(function(d) {
            return y(d.y0);
        })
        .y1(function(d) {
            return y(d.y0 + d.y);
        });

    var stack = d3.layout.stack()
        .values(function(d) {
            return d.values;
        });

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(data[0]).filter(function(key) {
        return key !== "date";
    }));

    data.forEach(function(d) {
        d.date = parseDate(d.date);
        var sum = 0;
        Object.keys(d).forEach(function(key, index) {
            if (key !== "date") {
                sum += parseInt(d[key], 10);
            }
        });
        d.totalResults = sum;
    });

    var browsers = stack(color.domain().map(function(name) {
        return {
            name: name,
            values: data.map(function(d) {
                return {
                    date: d.date,
                    y: d[name] / d.totalResults
                };
            })
        };
    }));

    x.domain(d3.extent(data, function(d) {
        return d.date;
    }));

    var browser = svg.selectAll(".browser")
        .data(browsers)
        .enter().append("g")
        .attr("class", "browser");

    browser.append("path")
        .attr("class", "area")
        .attr("d", function(d) {
            return area(d.values);
        })
        .style("fill", function(d) {
            return color(d.name);
        });

    browser.append("text")
        .datum(function(d) {
            return {
                name: d.name,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function(d) {
            return "translate(" + x(d.value.date) + "," + y(d.value.y0 + d.value.y / 2) + ")";
        })
        .attr("x", -6)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.name;
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

};