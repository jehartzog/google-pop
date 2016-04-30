'use strict';
/* global d3, SearchResults */

const SearchResults = new Mongo.Collection("searchresults");

Template.graph.rendered = function() {
    Meteor.setTimeout(() => { // temporary workaround while figuring out how to wait until Meteor collection loaded
        let data = SearchResults.find({});
        console.log('Got ' + data.count() + ' results');
        data = data.fetch();


        var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
            },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var formatPercent = d3.format(".0%");

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
            return key !== "date" && key !== "_id";
        }));

        data.forEach(function(d) {
            var sum = 0;
            Object.keys(d).forEach(function(key, index) {
                if (key !== "date" && key !== "_id") {
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
                return "translate(" + width + "," + y(d.value.y0 + d.value.y / 2) + ")";
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

        // var div = d3.select("body").append("div")
        //     .attr("class", "tooltip").style("opacity", 0);

        var vertical = d3.select("body")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", height + "px")
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fff");

        d3.select("body")
            .on("mousemove", function() {
                vertical.style("left", d3.mouse(this)[0] + "px");
            })
            .on("mouseover", function() {
                vertical.style("left", d3.mouse(this)[0] + "px");
            });
        /*
            svg.selectAll(".layer")
                .attr("opacity", 1)
                .on("mouseover", function(d, i) {
                    svg.selectAll(".layer").transition()
                        .duration(250)
                        .attr("opacity", function(d, j) {
                            return j != i ? 0.6 : 1;
                        })
                })
                .on("mousemove", function(d, i) {
                    var invertedx = x.invert(d3.mouse(this)[0]);
                    invertedx = invertedx.getMonth() + invertedx.getDate();
                    var selected = (d.values);
                    for (var k = 0; k < selected.length; k++) {
                        datearray[k] = selected[k].date
                        datearray[k] = datearray[k].getMonth() + datearray[k].getDate();
                    }

                    mousedate = datearray.indexOf(invertedx);
                    pro = d.values[mousedate].value;

                    d3.select(this)
                        .classed("hover", true)
                        .attr("stroke", strokecolor)
                        .attr("stroke-width", "0.5px"),
                        tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "visible");

                })
                .on("mouseout", function(d, i) {
                    svg.selectAll(".layer")
                        .transition()
                        .duration(250)
                        .attr("opacity", "1");
                    d3.select(this)
                        .classed("hover", false)
                        .attr("stroke-width", "0px"), tooltip.html("<p>" + d.key + "<br>" + pro + "</p>").style("visibility", "hidden");
                })
        */

    }, 5000);

};