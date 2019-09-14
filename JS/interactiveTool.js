var width, height, svg, g, projection, path, boundaries;


var mapFill = 'rgb(241,239,239)'
var selectMeasure;
var parseTime = d3.timeParse("%Y");


var zoom = d3.zoom()
    .on('zoom', zoomFunc);

var measure_data;
var regions;
var mean;
var active = d3.select(null);

var centered;



var zoomFunc = function () {
    g.attr('transform', d3.event.transform)


}


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




    svg.call(zoom);

    // projection = d3.geoMercator()
    // .rotate([0, 0]);

    projection = d3.geoAlbers()
        .rotate([0, 0]);


    path = d3.geoPath()
        .projection(projection);


    function reset(d) {
        active.classed('active', false)

        /*     active.style("stroke", "#000"); */
        active = d3.select(null)


        svg.transition()
            .duration(1300)
            .call(zoom.transform, d3.zoomIdentity);
    }

    function zoomFunc() {
        g.attr('transform', d3.event.transform);
    }




    d3.queue()
        .defer(d3.json, 'src/nuts2it.json')
        .defer(d3.csv, 'src/interactive_source.csv')
        .await(function (error, boundary_data, i_data) {
            i_data.forEach(function (d) {
                d.value = +d.value;
                d.year = parseTime(d.year);
            })


            measure_data = i_data;

            regions = d3.map(measure_data, d => {
                return d.geo_time
            }).keys();

            console.log(measure_data);
            boundaries = boundary_data;
            console.log(boundaries);


            selectMeasure = d3.select('div.side')
                .insert('select', '#regionBoard')
                .attr('id', 'selectMeasure');
            

            selectMeasure.selectAll('option')
                .data(d3.map(i_data, d => { return d.measure }).keys())
                .enter()
                .append('option')
                .text(d => { return d; })
                .attr('value', d => { return d; })


            document.getElementById('selectMeasure')
                .addEventListener('change', descriptionGen);


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


    /* 
                min = d3.min(measure_data, d => {
                    return d.income;
                })
    
    
                max = d3.max(measure_data, d => {
                    return d.income;
                })
    
    
    
                colours.domain([min, max]);
    
    
                income_data.forEach( d => {
                    map.set(d.geo_time, d.income);
                }) */


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
        /*
        .attr("fill", function (d) {
           // console.log(d);
            if (map.get(d.properties.NUTS_ID) == undefined) {
        
                // if there is no data for an area, set the no. of victims to 0 and return gray shade
                d.properties.income = 'Not available';
                return '#e3e3e3'
            }
            else {
              
                // retrieve victims based on the key-value pairs created previously
                return colours(d.properties.income = map.get(d.properties.NUTS_ID))
            }
             console.log(mp.get(d.properties.PC_NAME))
              return colours(d.properties.victims = mp.get(d.properties.PC_NAME)) ? colours(d.properties.victims = mp.get(d.properties.PC_NAME) ) : 'gray';  
        })*/
        .attr('d', path)
        /*  .on('mouseenter', function (d) {
            
            tooltip.transition()        
    .duration(100)      
    .style("opacity", .9) 
    .style("left", (d3.event.pageX) + "px")     
    .style("top", (d3.event.pageY - 28) + "px");

    tooltipText.html(d.properties.NUTS_NAME + '<br>' + format(d.properties.income));
})                  

      
        .on("mouseout", function(d) {       
tooltip.transition()        
    .duration(500)      
    .style("opacity", 0);   
}) */
        .on('click', d => {
            if (active.node() == null) {
                active = d3.select('#' + d.properties.id)
                    .classed('active', true);
              descriptionGen();

            } else {
                active.classed('active', false);
                active.select(null);
                active = d3.select('#' + d.properties.id)
                    .classed('active', true)

                    descriptionGen();
            }
        })

        descriptionGen();



    // .on("click", clicked);

    /* 
    selectRegion
    .on('change', function () {
        var select = document.getElementById('selectRegion')
        var value = select[select.selectedIndex].value;
        active.classed('active', false);
        active.select(null);
        active = d3.select('#' + value);
                    active.classed('active', true)
    
    }) */


}



const descriptionGen = function() {

    var [filtered, measure] = measureFilter(measure_data);



    // national average
     mean = d3.mean(filtered, d => {
        return d.value;
    });


    console.log(mean)

   
var regionalData;




    if (active.node() == null) {

        var randIndex = Math.floor(Math.random() * regions.length);


        var randomRegion = regions[randIndex];
    
        // if no region is selected, select random region
        active = d3.select('#' + randomRegion)
            .classed('active', true);

            
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


       console.log(regionalData)

        var region = d3.map(regionalData, d => {
                return d.geo_label
            }).keys();
    
        var value = d3.map(regionalData, d => {
                return d.value
            }).keys();
            
           
            console.log(region)


            var year = d3.map(regionalData, d => {
                return d.year
            }).keys();
            
            var source = d3.map(regionalData, d => {
                return d.Source
            }).keys();
            



    if (measure.includes('income')) {
        value = format(parseFloat(value));
        mean = format(parseFloat(mean))
        document.querySelectorAll('span.suffix').forEach( par => {
            par.innerText = null;
        })
    } else if (measure.includes('expectancy')) {
        value = ageFormat(value)
        mean = ageFormat(mean) 
        document.querySelectorAll('span.suffix').forEach( par => {
            par.innerText = ' years';
        })
    }
         
        document.getElementById('regionTitle').innerText = region;
       

        document.querySelector('#valueStatement > p').innerText = measure + ' in ' + region + ' is';

        document.querySelector('#valueStatement .number span')
        .innerHTML = value;


        document.querySelector('#valueComparison > p').innerText = 'The national average is';

document.querySelector('#valueComparison .number span')
        .innerHTML = mean;

    document.querySelector('#source span').textContent = source + ', ' + new Date(year).getFullYear()
        


    }
/* 
    else {
        var regionId = active.node().getAttribute('id');

        
        var regionalData = filtered.filter(d => {
            return d.geo_time == regionId;
        })

        var region = d3.map(regionalData, d => {
                return d.geo_label
            }).keys();
    
        var value = d3.map(regionalData, d => {
                return d.value
            }).keys();


    if (measure.includes('income')) {
        value = format(parseFloat(value));
        console.log(value)
        mean = format(mean)
    } else if (measure.includes('expectancy')) {
        value = value + ' years';
        mean = ageFormat(mean) + ' years'
    }
           
            document.getElementById('regionTitle').innerText = region;
       

       document.querySelector('#valueStatement > p').innerText = measure + ' in ' + region + ' is';

       document.querySelector('#valueStatement .number span')
       .innerHTML = value;


       document.querySelector('#valueComparison > p').innerText = 'The national average is';

document.querySelector('#valueComparison .number span')
       .innerHTML = mean
    }

} */
