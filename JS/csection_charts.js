(function () {

    // world c-section map on WHO data
    var width, height, svg, g, projection, path, boundaries;



    var csections_data;



    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var tooltipText = tooltip
        .append('p')
        .attr('class', 'tooltipText');
    /* 
            var colours = d3.scaleThreshold()
            .range(d3.schemeYlOrRd[9])
           
     */


    var colours = d3.scaleSequential(d3.interpolateYlOrRd);

    var map = d3.map();

    var init = function () {
        width = d3.select('#csectionGlobal').node().getBoundingClientRect().width;

        height = d3.select('#csectionGlobal').node().getBoundingClientRect().height;



        // chart title
        d3.select('#csectionGlobal')
            .append('h3')
            .attr('class', 'chartTitle')
            .text('Use of c-sections worldwide nearly doubled since 2000');


        d3.select('#csectionGlobal')
            .append('p')
            .attr('class', 'subtitle')
            .text('Caesarean sections as a % of all births, latest year available in WHO database')

        svg = d3.select('#csectionGlobal')
            .append('svg')
            .attr('width', width)
            .attr('height', height);


        g = svg.append('g')
            .attr('transform', 'translate(0, 10)')


        var caption = d3.select('#csectionGlobal')
            .append('p')
            .attr('class', 'chartCaption')
            .text('Source: ')


        var link = captionLink(caption, 'https://apps.who.int/gho/data/node.main.BIRTHSBYCAESAREAN?lang=en')


        link.text('World Health Organisation')


        projection = d3.geoMercator()
            .rotate([0, 0]);


        path = d3.geoPath()
            .projection(projection);





        d3.queue()
            // map credits: https://github.com/deldersveld/topojson
            .defer(d3.json, 'src/world-countries-sans-antarctica.json')
            .defer(d3.csv, 'src/c_section_global.csv')
            .await(function (error, boundary_data, c_data) {

                c_data.forEach(function (d) {
                    d.c_sections = +d.c_sections;
                })


                csections_data = c_data;


                console.log(csections_data);
                boundaries = boundary_data;
                console.log(boundaries);



                draw(boundary_data);
            })
    }();



    const draw = function (boundaries) {

        projection.scale(1)
            .translate([0, 0]);




        colours.domain(d3.extent(csections_data, d => {
            return d.c_sections;
        }));




        csections_data.forEach(d => {
            map.set(d.country_code, d.c_sections);
        })

        // !! countries2 doesn't have any properties, use countries1
        var b = path.bounds(topojson.feature(boundaries, boundaries.objects['countries1']));

        var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        projection
            .scale(s)
            .translate(t);

        // build map polygons
        g.selectAll(".area")
            .data(topojson.feature(boundaries, boundaries.objects['countries1']).features)
            .enter()
            .append("path")
            .attr("class", "area")
            .attr('id', d => {

                return 'area' + d.id;
            })
            .attr("fill", function (d) {


                if (map.get(d.id) == undefined) {


                    d.properties.csections = 'Not available';
                    return '#e3e3e3'
                }
                else {

                    d.properties.csections = map.get(d.id) + '%'
                    return colours(map.get(d.id))
                }

            })
            .attr('d', path)
            .on('mouseenter', function (d) {

                // tooltip's pointer events are off so it's not in the way

                tooltip.transition()
                    .duration(100)
                    .style("opacity", .9)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");

                tooltipText.html(d.properties.name + '<br>' + d.properties.csections);
            })


            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })




        // svg legend based on colour scale
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
})();