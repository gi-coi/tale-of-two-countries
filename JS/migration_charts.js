
// standard margin
var margin = { top: 50, right: 50, bottom: 70, left: 60 }

// higher left margin if labels are long (e.g. horizontal bar charts)
var barMargin = { top: 50, right: 50, bottom: 70, left: 250 }


var standardOpacity = .67;

var lowOpacity = .22;

var highOpacity = 1;

var tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip');


var tooltipText = tooltip
    .append('p')
    .attr('class', 'tooltipLabel tooltipText');


var l = d3.formatDefaultLocale({
    'decimal': '.',
    'thousands': ',',
    'grouping': [3],
    'currency': ['€', ''],

})


var format = d3.format(" ^($,.2f")

var number = d3.format(',.0f')

d3.csv('src/mobilita_crediti.csv', function (d) {
    d.crediti_mobilita = +d.crediti_mobilita;
    d.debiti_mobilita = +d.debiti_mobilita;
    return d;
}, function (data) {
    // console.log(data);





    dotplot(data);
    barplot(data);

})




const dotplot = function (data) {

    // https://www.d3-graph-gallery.com/graph/lollipop_cleveland.html



    var [width, height, svg] = basics('#dotMobility', 'wide')


    d3.select('#dotMobility .chartTitle')
        .text('With more than €1.2bn, Lombardy\'s healthcare system is the largest creditor')

    d3.select('#dotMobility')
        .insert('p', 'svg')
        .attr('class', 'subtitle')
        .text('Mobility debts and credits in 2018 in €, including adjustments from previous years');



    var caption = d3.select('#dotMobility .chartCaption');

    caption.html('The chart includes the Ospedale Pediatrico Bambin Gesù, owned by the Vatican State, and ACISMOM, the Order of Malta.<br>Source: ')

    var link = captionLink(caption, 'http://www.quotidianosanita.it/regioni-e-asl/articolo.php?articolo_id=60080');

    link.text('Conferenza delle Regioni, Quotidiano Sanità');


    const voronoi = d3.voronoi()
        .x(function (d) {
            return xScale(d.value);
        })
        .y(function (d) {
            return yScale(d.regioni)
        })
        .extent([
            [-margin.left, -margin.top],
            [width + margin.right, height + margin.bottom]
        ]);


    data = data.sort(function (a, b) { return d3.ascending(a.crediti_mobilita, b.crediti_mobilita); });

    var xScale = d3.scaleLinear()
        .range([0, width])
        .domain([0, d3.max(data, function (d) {

            return (d.crediti_mobilita)
        })])
        .nice()


    var yScale = d3.scaleBand()
        .range([height, 0])
        .domain(data.map(function (d) {
            return d.regioni;
        })
        )
        .padding(1);






    var groups = svg
        .selectAll('.group')
        .data(data, function (d) {
            return d.regioni;
        })
        .enter()
        .append('g')
        .attr('class', 'group');


    groups
        .append('line')
        .attr('class', 'line')

        .attr('x1', function (d) {

            return xScale(d.crediti_mobilita);
        })
        .attr('x2', function (d) {
            return xScale(d.debiti_mobilita);
        })
        .attr('y1', function (d) {
            return yScale(d.regioni);
        })
        .attr('y2', function (d) {
            return yScale(d.regioni);
        })
        .attr('stroke', '#616060')
        .attr('stroke-width', strokeWidth)



    groups
        .append('circle')
        .attr('class', 'creditDot')
        .attr('cx', function (d) {
            return xScale(d.crediti_mobilita);
        })
        .attr('cy', function (d) {
            return yScale(d.regioni);
        })
        .attr('r', radius)
        .attr('fill', '#67a9cf')



    groups
        .append('circle')
        .attr('class', 'debtDot')
        .attr('cx', function (d) {
            return xScale(d.debiti_mobilita);
        })
        .attr('cy', function (d) {
            return yScale(d.regioni);
        })
        .attr('r', radius)
        .attr('fill', '#ef8a62')


    svg
        .select('.y.axis')
        .call(d3.axisLeft(yScale));


    svg
        .select('.x.axis')
        .call(d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d3.formatPrefix(".0", 1e6)))


            svg.append("text")             
            .attr("transform",
                  "translate(" + (width / 2) + " ," + 
                                 (height + margin.bottom - 18) + ")")
            .style("text-anchor", "middle")
            .attr('class', 'x axisLabel')
            .text("Healthcare mobility credits/debts (€)");


    var transposed = [];

    data.forEach(function (d) {
        for (var key in d) {
            var obj = {};
            if (key !== "regioni") {
                obj.mobility = key;
                obj.value = d[key];
                obj.regioni = d.regioni;
                transposed.push(obj)
            }
        }
    });


    //console.log(transposed)

    dt = transposed;
    var v = svg
        .selectAll('.voronoi')
        .data(voronoi.polygons(transposed));


    v
        .enter()
        .append('path')
        .attr('d', function (d, i) {
            return d ? 'M' + d.join('L') + 'Z' : null;
        })
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseenter', function (d) {
            tooltip.transition()
                .duration(100)
                .style('opacity', .9)
                .style('left', (d3.event.pageX) + 'px')

                .style('top', (d3.event.pageY - 28) + 'px');
            if (d.data.mobility === 'debiti_mobilita') {
                tooltipText
                    .text('Mobility debts:\n' + format(d.data.value));
            } else if (d.data.mobility === 'crediti_mobilita') {

                tooltipText
                    .text('Mobility credits:\n' + format(d.data.value));
            }



        })
        .on('mouseout', function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })










}



const barplot = function (data) {
    data.forEach(function (d) {
        d.difference = d.crediti_mobilita - d.debiti_mobilita;
    })
    console.log(data);



    var [width, height, svg] = basics('#barMobility', 'wide');


    d3.select('#barMobility .chartTitle')
    .text('Only 7 in 20 regions have a net mobility credit; only one is in the South')

d3.select('#barMobility')
    .insert('p', 'svg')
    .attr('class', 'subtitle')
    .text('Net mobility credits in 2018 in €, including adjustments from previous years');



var caption = d3.select('#barMobility .chartCaption');

caption.html('The chart includes the Ospedale Pediatrico Bambin Gesù, owned by the Vatican State, and ACISMOM, the Order of Malta.<br>Source: ')

var link = captionLink(caption, 'http://www.quotidianosanita.it/regioni-e-asl/articolo.php?articolo_id=60080');

link.text('Conferenza delle Regioni, Quotidiano Sanità');


    /*  svg
     .attr('transform', 'translate(250,' + margin.top +')'); */ 
    data.sort(function (a, b) {
        return d3.ascending(a.difference, b.difference)
    })



    var xScale = d3.scaleLinear()
        .range([0, width])
        .domain(d3.extent(data, function (d) {
            return (d.difference);
        }))
        .nice()


    var yScale = d3.scaleBand()
        .domain(data.map(function (d) {
            return d.regioni;
        }))
        .range([height, 0])
        .padding(.1)





    var groups = svg
        .selectAll('.group')
        .data(data, function (d) {
            return d.regioni;
        })
        .enter()
        .append('g')
        .attr('class', 'group');



    groups
        .append('rect')
        .attr('class', 'bar')
        .attr('id', function (d) {
            return 'bar' + d.regioni;
        })
        .attr("x", function (d) {
            return xScale(Math.min(0, d.difference));
        })
        .attr('y', function (d) {

            return yScale(d.regioni)
        })
        .attr('height', yScale.bandwidth())
        .attr("width", function (d) {
            return Math.abs(xScale(d.difference) - xScale(0));
        })

        .attr('fill', function (d) {
            return (d.difference >= 0 ? '#67a9cf' : '#ef8a62');
        })



    svg
        .select('.y.axis')
        .call(d3.axisLeft(yScale)
            .tickPadding(5));


    svg
        .select('.x.axis')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d3.formatPrefix(".0", 1e6)))


// x axis label
     
svg.append("text")             
.attr("transform",
      "translate(" + (width / 2) + " ," + 
                     (height + margin.bottom - 18) + ")")
.style("text-anchor", "middle")
.attr('class', 'x axisLabel')
.text("Healthcare mobility credits/debts (€)");

        
}




const chordChart = function() {
    var matrixData = {
        'North':
        [4603834, 36633, 20221],
        'Centre':
        [81623, 2042476, 35997],
        'South':
        [176785, 151919, 3275831]
        
        
    } 
 /*    var matrixData = {
        'North':
        [4603834, 36633, 13835, 6386],
        'Centre':
        [81623, 2042476, 33206, 2791],
        'South':
        [176785, 151919, 2266996, 8101],
        'Islands':
        [55820, 20488, 3663, 997071]
        
        
    } */


var matrix = Object.values(matrixData)

var matrixKeys = Object.keys(matrixData)
   var [width, height, svg] = basics('#chordFlow');

    var outerRadius = Math.min(width, height) * 0.7 - 30

var innerRadius = outerRadius - 20;
   



var colours = d3.scaleOrdinal()
.domain(d3.range(4))
.range(['#904935', '#C4BB66', '#406068', '#e3e3e3']);
    

var chord = d3.chord()
.padAngle(0.05)
.sortSubgroups(d3.descending)


   var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)

    var ribbon = d3.ribbon()
    .radius(innerRadius)


   var g = svg.append("g")
   .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
   .datum(chord(matrix))


   var group = g.append("g")
   .attr("class", "groups")
 .selectAll("g")
 .data(function(chords) { return chords.groups; })
 .enter().append("g");


 group.append("path")
.attr('class', 'border')
   .style("fill", function(d) { return colours(d.index); })
   .style("stroke", function(d) { return d3.rgb(colours(d.index)).darker(); })
   .attr("d", arc)
   .each(function(d,i) {
  
    //Search pattern for everything between the start and the first capital L
    var firstArcSection = /(^.+?)L/; 	

    //Grab everything up to the first Line statement
    var newArc = firstArcSection.exec( d3.select(this).attr("d") )[1];
    //Replace all the comma's so that IE can handle it
    newArc = newArc.replace(/,/g , " ");
    
    //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
    //flip the end and start position
    if (d.endAngle > 90*Math.PI/180 & d.startAngle < 270*Math.PI/180) {
        var startLoc 	= /M(.*?)A/,		//Everything between the first capital M and first capital A
            middleLoc 	= /A(.*?)0 0 1/,	//Everything between the first capital A and 0 0 1
            endLoc 		= /0 0 1 (.*?)$/;	//Everything between the first 0 0 1 and the end of the string (denoted by $)
        //Flip the direction of the arc by switching the start en end point (and sweep flag)
        //of those elements that are below the horizontal line
        var newStart = endLoc.exec( newArc )[1];
        var newEnd = startLoc.exec( newArc )[1];
        var middleSec = middleLoc.exec( newArc )[1];
        
        //Build up the new arc notation, set the sweep-flag to 0
        newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
    }//if
    
    //Create a new invisible arc that the text can flow along
    svg.append("path")
        .attr("class", "hiddenArcs")
        .attr("id", "arc"+i)
        .attr("d", newArc)
        .style("fill", "none");
});


//Append the label names on the outside
group.append("text")
	.attr("class", "titles")
	.attr("dy", function(d,i) { return (d.endAngle > 90*Math.PI/180 & d.startAngle < 270*Math.PI/180 ? 25 : -16); })
   .append("textPath")
	.attr("startOffset","50%")
	.style("text-anchor","middle")
	.attr("xlink:href",function(d,i){return "#arc"+i;})
    .text(function(d,i){ return matrixKeys[d.index] }); 
    

    
   
  var ribs =  g.append("g")
    .attr("class", "ribbon")
  .selectAll("g")
  .data(function(chords) { return chords; })
  .enter().append("g");

  ribs.append("path")
  .attr('class', 'ribbonPath')
 
  .attr("d", ribbon)
  .attr('id', d => { return '#direction' + matrixKeys[d.source.index] + matrixKeys[d.target.index]})
    .style("fill", function(d) { return colours(d.source.index); })
    .style("stroke", function(d) { return d3.rgb(colours(d.source.index)).darker(); })
    .style('opacity', standardOpacity)
  .on('mouseenter', function (d) {
    g.selectAll('.ribbonPath')
    .style('opacity', .3);

    d3.select(this).style('opacity', 1)
    tooltip.transition()
        .duration(100)
        .style('opacity', .9)
        .style('left', (d3.event.pageX) + 'px')

        .style('top', (d3.event.pageY - 28) + 'px');
   tooltipText
   .html(matrixKeys[d.source.index] + ' → ' + matrixKeys[d.target.index] + '<br>' + number(d.target.value) + ' patients')

})
.on('mouseout', function (d) {
    tooltip.transition()
        .duration(500)
        .style("opacity", 0);

    g.selectAll('.ribbonPath')
    .style('opacity', standardOpacity)
})
    
console.log(chord(matrix))

/* 
    group.append("text")
    .each(d => { console.log(d); d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", ".35em")
    .attr("transform", d => `
      rotate(${(d.angle * 180 / Math.PI - 90)})
      translate(${innerRadius + 26})
      ${d.angle > Math.PI ? "rotate(180)" : ""}
    `)
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
    .text(d => areas[d.index]);
 */


   
};


const sankeyFlow = function () {
    var colours = d3.scaleOrdinal()
.domain(['North', 'Centre', 'Mezzogiorno'])
.range(['#406068', '#C4BB66', '#904935'])


var width = d3.max([d3.select('#migrationFlow').node().getBoundingClientRect().width, 800]);
var height = d3.max([d3.select('#migrationFlow').node().getBoundingClientRect().height, 800]);



d3.select('#migrationFlow')
.append('h3')
.attr('class', 'chartTitle')
.html('The Southern diaspora: at least 330,000 Southern patients migrate for healthcare');


d3.select('#migrationFlow')
.append('p')
.attr('class', 'subtitle')
.html('Healthcare migration flows in 2017 (excluding same-area flows)')
// append the svg object to the body of the page
var svg = d3.select("#migrationFlow").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");


          width = width - margin.left - margin.right;

          height = height - margin.top - margin.bottom;


        var caption =  d3.select('#migrationFlow')
          .append('p')
          .attr('class', 'chartCaption')
          .html('Source: ')

    var link = captionLink(caption, 'http://www.salute.gov.it/portale/news/p3_2_1_1_1.jsp?lingua=italiano&menu=notizie&p=dalministero&id=3682');

    link.text('Rapporto Schede di Dimissione Ospedaliera (SDO) 2017');



// load the data
d3.json("src/mobility_flows.json", function(error, graph) {

    // Set the sankey diagram properties
var sankey = d3.sankey()
.nodeWidth(36)
.nodePadding(40)
.size([width, height]);

var path = sankey.link();

  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(1);

// add in the links
  var link = svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", d => {
        return 'link ' + 'link-' +d.source.name;
      })
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .style('opacity', standardOpacity)
      .sort(function(a, b) { return b.dy - a.dy; })
      .on('mouseenter', function (d) {
        
        svg.selectAll('path.link')
        .style('opacity', lowOpacity)

        svg.selectAll('path.link-' + d.source.name)
        .style('opacity', highOpacity)
       
        tooltip.transition()
            .duration(100)
            .style('opacity', .9)
            .style('left', (d3.event.pageX) + 'px')

            .style('top', (d3.event.pageY - 28) + 'px');
            
      tooltipText.html(
         d.source.name + " → " + 
            d.target.name + "<br>" + number(d.value)+ ' patients' );



    })
    .on('mouseout', function (d) {

        svg.selectAll('path.link')
        .style('opacity', standardOpacity)
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    })


// add in the nodes
  var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; });

// add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { 
		  return d.colour = colours(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { 
          return d3.rgb(d.colour).darker(2); })
          .on('mouseenter', function (d) {
        
           
            tooltip.transition()
                .duration(100)
                .style('opacity', .9)
                .style('left', (d3.event.pageX) + 'px')
    
                .style('top', (d3.event.pageY - 28) + 'px');

            if (d.sourceLinks.length > 0 & d.targetLinks.length == 0) {
                tooltipText.html(
                    d.name + "<br>" + number(d.value) + ' patients emigrate' );
                    
            }

            else if (d.sourceLinks.length == 0 & d.targetLinks.length > 0) {
                tooltipText.html(
                    d.name + "<br>" + 'Receives ' + number(d.value) + ' patients' );
            }
                
         
       
        })
        .on('mouseout', function (d) {
    
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })

// add in the title for the nodes
  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

});

}()