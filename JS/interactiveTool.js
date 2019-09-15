var width, height, svg, g, projection, path, boundaries;


var mapFill = 'rgb(241,239,239)'
var selectMeasure;
var parseTime = d3.timeParse("%Y");



var measure_data;
var regions;
var mean;
var active = d3.select(null);

var centered;






var l = d3.formatDefaultLocale({
    'decimal': '.',
    'thousands': ',',
    'grouping': [3],
    'currency': ['€', '']

})


var format = d3.format(" ^($,.2f")




var ageFormat = d3.format('.2f')






var init = function () {
    //  width = d3.select('#interactiveMap').node().getBoundingClientRect().width;

    height = d3.select('#interactiveMap').node().getBoundingClientRect().height;
    width = height;


    svg = d3.select('#interactiveMap')
        .insert('svg', 'div.side')
        .attr('width', width)
        .attr('height', height);


    g = svg.append('g');






    projection = d3.geoAlbers()
        .rotate([0, 0]);


    path = d3.geoPath()
        .projection(projection);



    d3.queue()
        .defer(d3.json, 'src/nuts2it.json')
        .defer(d3.csv, 'src/interactive_source.csv')
        .await(function (error, boundary_data, data) {
            data.forEach(function (d) {
                d.value = +d.value;
                d.year = parseTime(d.year);
            })


            measure_data = data;

            regions = d3.map(measure_data, d => {
                return d.geo_time
            }).keys();

          
            boundaries = boundary_data;


            measureDropdown(data);
         
          


            draw(boundary_data);
        })
}();

/* window.addEventListener('resize', sizeChange)

function sizeChange() {
    d3.select("svg").attr("transform", "scale(" + $("#interactiveMap").width()/900 + ")");
    $("svg").height($("#interactiveMap").width()*0.618);
}
 */
const measureFilter = function (data) {

    var measure = document.getElementById('selectMeasure')[document.getElementById('selectMeasure').selectedIndex].value;

    var filtered = data.filter(d => {
        return d.measure == measure;
    })
    return [filtered, measure];
}




const draw = function (boundaries) {

    projection.scale(1)
        .translate([0, 0]);


    var b = path.bounds(topojson.feature(boundaries, boundaries.objects['foo']));

    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
        .scale(s)
        .translate(t);

    var areas = g.selectAll(".area")
        .data(topojson.feature(boundaries, boundaries.objects['foo']).features)


    areas.exit().remove();
    areas
        .enter()
        .append("path")
        .attr("class", "area")
        .merge(areas)
        .attr('id', d => {
            //console.log(d);
            return d.properties.id;
        })
        .attr('fill', mapFill)
        .attr('d', path)
        .on('click', d => {
            /*  If another region is selected, deselect it*/
            if (active.node() != null) {
                active.classed('active', false);
                active.select(null);
            }

            /* Highlight current region and display data */
            active = d3.select('#' + d.properties.id)
                .classed('active', true)

            descriptionGen();

        })
    /* Display data for default visualisation */
    descriptionGen();


}



const descriptionGen = function () {

    /*   Displays the data for the selected measure on the dropdown menu */

    var [filtered, measure] = measureFilter(measure_data);



    // national average
    mean = d3.mean(filtered, d => {
        return d.value;
    });


    var regionalData;




    if (active.node() == null) {
        // If no region is selected, this function will pick a random number
        var randIndex = Math.floor(Math.random() * regions.length);


        var randomRegion = regions[randIndex];

        // Select region with random index
        active = d3.select('#' + randomRegion)
            .classed('active', true);

        // extract data for thar region
        regionalData = filtered.filter(d => {
            return d.geo_time == randomRegion;
        })

    }
    else {
        var regionId = active.node().getAttribute('id');


        regionalData = filtered.filter(d => {
            return d.geo_time == regionId;
        })
    }

    // Extract information to display on the "dashboard"


    // region name
    var region = d3.map(regionalData, d => {
        return d.geo_label
    }).keys();


    // value to display
    var value = d3.map(regionalData, d => {
        return d.value
    }).keys();


    // Source information: Year and source
    var year = d3.map(regionalData, d => {
        return d.year
    }).keys();

    var source = d3.map(regionalData, d => {
        return d.Source
    }).keys();



    // Format output based on source
    if (measure.includes('income')) {
        value = format(parseFloat(value));
        mean = format(parseFloat(mean))
        document.querySelectorAll('span.suffix').forEach(par => {
            par.innerText = null;
        })
    } else if (measure.includes('expectancy')) {
        value = ageFormat(value)
        mean = ageFormat(mean)
        document.querySelectorAll('span.suffix').forEach(par => {
            par.innerText = ' years';
        })
    }



    // Fill dashboard with text
    document.getElementById('regionTitle').innerText = region;


    document.querySelector('#valueStatement > p').innerText = measure + ' in ' + region + ' is';

    document.querySelector('#valueStatement .number span')
        .innerHTML = value;


    document.querySelector('#valueComparison > p').innerText = 'The national average is';

    document.querySelector('#valueComparison .number span')
        .innerHTML = mean;

    document.querySelector('#source span').textContent = source + ', ' + new Date(year).getFullYear()



}



const measureDropdown = function (data) {

    // Build dropdown menu with measures available

    selectMeasure = d3.select('div.side')
    .insert('select', '#regionBoard')
    .attr('id', 'selectMeasure');


selectMeasure.selectAll('option')
    .data(d3.map(data, d => { return d.measure }).keys())
    .enter()
    .append('option')
    .text(d => { return d; })
    .attr('value', d => { return d; })

// add event listener to update the visualisation
document.getElementById('selectMeasure')
    .addEventListener('change', descriptionGen);
}
