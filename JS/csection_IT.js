(function () {

    // huge anonymous function that doesn't interfere with the other map 

    // map for c-section frequency in Italy


    var width, height, svg, g, projection, path, boundaries;



    var csections_data;


    var colours = d3.scaleSequential(d3.interpolateYlOrRd);

    var format = d3.format(" ^(.2f")


    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var tooltipText = tooltip
        .append('p')
        .attr('class', 'tooltipText');


    var map = d3.map();




    var init = function () {
        width = d3.select('#csection_IT').node().getBoundingClientRect().width;

        height = d3.select('#csection_IT').node().getBoundingClientRect().height;


        // chart title and subtitle
        d3.select('#csection_IT')
            .append('h3')
            .attr('class', 'chartTitle')
            .text('C-sections are twice as frequent in the Mezzogiorno');


        d3.select('#csection_IT')
            .append('p')
            .attr('class', 'subtitle')
            .text('Caesarean sections as a % of all births, 2017')




        svg = d3.select('#csection_IT')
            .append('svg')
            .attr('width', width)
            .attr('height', height);


        g = svg.append('g');


        // chart caption and source
        var caption = d3.select('#csection_IT')
            .append('p')
            .attr('class', 'chartCaption')
            .text('Source: ')


        var caption = captionLink(caption, 'https://pne.agenas.it/index.php')


        caption.text('Agenas, Programma Nazionale Esiti (2018)')




        // projection = d3.geoMercator()
        // .rotate([0, 0]);

        projection = d3.geoAlbers()
            .rotate([0, 0]);


        path = d3.geoPath()
            .projection(projection);






        d3.queue()
            // Topojson from Eurostat
            // data from Osservasalute 2018
            .defer(d3.json, 'src/nuts2it.json')
            .defer(d3.csv, 'src/csection_it.csv')
            .await(function (error, boundary_data, c_data) {

                c_data.forEach(function (d) {
                    d.csections = +d.csections;
                    d.year = +d.year

                })


                csections_data = c_data.filter(d => {
                    return d.year == d3.max(c_data, d => {
                        return d.year
                    });
                });




                boundaries = boundary_data;


                // c-section map
                draw(boundary_data);


                // chart for progress in Campania
                campania_chart(c_data);
            })
    }();



    const draw = function (boundaries) {

        projection.scale(1)
            .translate([0, 0]);


        colours.domain(d3.extent(csections_data, d => {
            return d.csections
        }));


        csections_data.forEach(d => {
         
            map.set(d.geo_code, d.csections);
        })

      


        var b = path.bounds(topojson.feature(boundaries, boundaries.objects['foo']));

        var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        projection
            .scale(s)
            .translate(t);

        var areas = g.selectAll(".area")
            .data(topojson.feature(boundaries, boundaries.objects['foo']).features)
            .enter()
            .append("path")
            .attr("class", "area")
            /*    .attr('id', d => {
                   //console.log(d);
                   return 'area' + d.properties.id;
               }) */
            .attr("fill", function (d) {
                return colours(d.properties.csections = map.get(d.properties.id))

            })
            .attr('d', path)
            .on('mouseenter', function (d) {

                tooltip.transition()
                    .duration(100)
                    .style("opacity", .9)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");

                tooltipText.html(d.properties.NUTS_NAME + '<br>' + format(d.properties.csections) + '%');
            })


            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })



        // legend with colour scale
        // svg legend library
        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(30,0)");

        var legendLinear = d3.legendColor()
            .shapeWidth(40)
            .cells(5)
            .orient('horizontal')
            .scale(colours);

        svg.select(".legendLinear")
            .call(legendLinear);



    }


    const campania_chart = function (data) {
        // timeline of c-sections in Campania, 2011-17
        var filter = data.filter(d => {
            return d.region == 'Campania'
        })

        var margin = { top: 50, right: 50, bottom: 50, left: 90 }


        // title and caption
        d3.select('#csection_campania')
            .append('h3')
            .attr('class', 'chartTitle')
            .text('Campania\'s c-section rate has dropped 8% in the last two years')


        d3.select('#csection_campania')
            .append('p')
            .attr('class', 'subtitle')
            .text('Caesarean sections as a % of all births, 2011-2017')


        var width = d3.select('#csection_campania').node().getBoundingClientRect().width;


        var height = d3.select('#csection_campania').node().getBoundingClientRect().height;


        var svg = d3.select('#csection_campania')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


        height = height - margin.top - margin.bottom;

        width = width - margin.left - margin.right;

        svg
            .append('g')
            .attr('class', 'x axis')
            .attr("transform", "translate(0," + height + ")")




        svg
            .append('g')
            .attr('class', 'y axis');




        var caption = d3.select('#csection_campania')
            .append('p')
            .attr('class', 'chartCaption')
            .text('Source: ')

        var link = captionLink(caption, 'https://www.osservatoriosullasalute.it/rapporto-osservasalute');

        link.text('Osservasalute, 2018')

        /*    var xScale = d3.scaleLinear()
           .domain(d3.extent(filter, d => {
               return d.year
           }))
           .range([0, width])
           .nice(); */


        var xScale = d3.scaleBand()
            .domain(filter.map(d => {
                return d.year
            }))
            .rangeRound([0, width])
            .padding(.1)

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(filter, d => {
                return d.csections
            })])
            .range([height, 0]);



        var line = d3.line()
            .x(d => { return xScale(d.year) })
            .y(d => { return yScale(d.csections) });



        svg
            .selectAll('.group')
            .data(filter, d => {
                return d.year
            })
            .enter()
            .append('g')
            .attr('class', 'group')
            .append('rect')
            .attr('width', xScale.bandwidth())
            .attr('height', d => {

                return height - yScale(d.csections)
            })
            .attr('x', d => {
                return xScale(d.year)
            })
            .attr('y', d => {
                return yScale(d.csections)
            })
            /*   .append('path')
              .attr('class', 'line') */

            .attr('fill', 'steelblue')
        /*     .attr('d', line) */


        svg.select('.x.axis')
            .call(d3.axisBottom(xScale))

        svg.select('.y.axis')
            .call(d3.axisLeft(yScale))

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "2.2em")
            .style("text-anchor", "middle")
            .attr('class', 'y axisLabel')
            .text("Rate of caesarean sections (%)");


    }







})()