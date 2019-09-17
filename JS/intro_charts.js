

var strokeColour = '#616060';

// standard margin
var margin = { top: 50, right: 50, bottom: 70, left: 60 }

// higher left margin if labels are long (e.g. horizontal bar charts)
var barMargin = { top: 50, right: 50, bottom: 70, left: 200 }



var tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip');


var tooltipLabel = tooltip
    .append('p')
    .attr('class', 'tooltipLabel tooltipText');


var tooltipNumber = tooltip.append('p')
    .attr('class', 'tooltipNumber tooltipText')





d3.csv('src/age_income.csv', d => {
    d.value = +d.value;
    d.life_exp = +d.life_exp;
    d.spesa_pubblica = +d.spesa_pubblica;
    d.spesa_privata = +d.spesa_privata;
    d.spesa_tot = +d.spesa_tot;
    return d;

}, data => {



    scatter(data);
})


d3.csv('src/deaths_italy.csv', function (d) {
    d.deaths = +d.deaths;
    return d;
}, function (data) {


    barchartCauses(data);
})


d3.csv('src/life_gender.csv', function (d) {
    d.men = +d.men;
    d.women = +d.women;
    d.year = parseTime(parseInt(d.year));
    d.mean_exp = d3.mean([d.men, d.women]);
    return d;
}, function (data) {
    // console.log(data);

    dotExp(data);

})



const scatter = function (data) {
    // scatter plot for disposable income - healthy life expectancy

    var [width, height, svg] = basics('#income_age');

    d3.select('#income_age .chartTitle')
        .text('A tale of three countries? Income and life expectancy gaps cut across Italy')

    d3.select('#income_age')
        .insert('p', 'svg')
        .attr('class', 'subtitle')
        .text('Household disposable income in € and healthy (disability-free) life expectancy in 2017')
    var caption = d3.select('#income_age .chartCaption');

    caption.text(' Source: ')

    var link = captionLink(caption, 'https://www.istat.it/it/benessere-e-sostenibilit%C3%A0/la-misurazione-del-benessere-(bes)/gli-indicatori-del-bes');

    link.text('ISTAT (2018)');



    var xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => {
            return d.value;
        }))
        .range([0, width])
        .nice();


    var yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => {
            return d.life_exp;
        }))
        .range([height, 0])
        .nice();


    const voronoi = d3.voronoi()
        .x(function (d) {
            return xScale(d.value);
        })
        .y(function (d) {
            return yScale(d.life_exp)
        })
        .extent([
            [-margin.left, -margin.top],
            [width + margin.right, height + margin.bottom]
        ]);




    var colours = d3.scaleOrdinal()
        .domain(['Mezzogiorno', 'Centro', 'Nord'])
        .range(['#904935', '#C4BB66', '#406068'])



    var group = svg
        .selectAll('.group')
        .data(data, d => { return d.territorio; })
        .enter()
        .append('g')
        .attr('class', 'group');


    group
        .append('circle')
        .attr('r', radius)
        .attr('cx', d => {
            return xScale(d.value);
        })
        .attr('cy', d => {
            return yScale(d.life_exp);
        })
        .attr('fill', d => {
            return colours(d.area)
        })
        .attr('opacity', opacity)



    svg.select('.x.axis')
        .call(d3.axisBottom(xScale)
            .ticks(5))



    svg.select('.y.axis')
        .call(d3.axisLeft(yScale));


    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.bottom - 10) + ")")
        .style("text-anchor", "middle")
        .attr('class', 'x axisLabel')
        .text("Household disposable income (in €)");


    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr('class', 'y axisLabel')
        .text("Healthy life expectancy (years)");




    svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(" + (width / 2 - margin.left) + ',-35)')

    var legendOrdinal = d3.legendColor()
        //d3 symbol creates a path-string, for example
        //"M0,-8.059274488676564L9.306048591020996,
        //8.059274488676564 -9.306048591020996,8.059274488676564Z"
        .shape("path", d3.symbol().type(d3.symbolCircle).size(100)())
        .shapePadding(65)
        .orient('horizontal')
        //use cellFilter to hide the "e" cell
        .cellFilter(function (d) { return d.label !== "e" })
        .scale(colours);

    svg.select(".legendOrdinal")
        .call(legendOrdinal);



    var v = svg
        .selectAll('.voronoi')
        .data(voronoi.polygons(data));


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


            tooltipLabel
                .text(d.data.territorio)


        })
        .on('mouseout', function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })

}






const barchartCauses = function (data) {

    // 10 most common death causes in Italy

    var [width, height, svg] = basics('#deathCausesIT', 'wide');

    d3.select('#deathCausesIT .chartTitle')
        .text('Non-trasmittable diseases account for 90% of deaths in Italy');
    svg
        .attr('transform', 'translate(280, 0)')


    d3.select('#deathCausesIT')
        .insert('p', 'svg')
        .attr('class', 'subtitle')
        .text('Top 10 causes of death in Italy, 2016')



    var caption = d3.select('#deathCausesIT .chartCaption');

    caption.text('Source: ')

    var link = captionLink(caption, 'https://www.who.int/gho/mortality_burden_disease/causes_death/country/en/');

    link.text('Global Health Estimates 2016: Disease burden by Cause, Age, Sex, by Country and by Region, 2000-2016. Geneva, World Health Organization; 2018.');


    // to filter by cause (excludes subgroups and larger groups)
    var filtered = data.filter(d => {
        return d.cause !== 'All' & d.cause_detail == 'All';
    })




    filtered = filtered.sort(function (a, b) {
        return d3.descending(a.deaths, b.deaths)
    }).slice(0, 10); // selects the top 10

    //console.log(filtered)

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(filtered, d => {
            return d.deaths;
        })])
        .range([0, width])
        .nice();


    var yScale = d3.scaleBand()
        .domain(filtered.map(function (d) {
            return d.cause;
        }))
        .range([0, height])
        .padding(.1);



    var groups = svg
        .selectAll('.group')
        .data(filtered, d => { return d.cause })
        .enter()
        .append('g')
        .attr('class', 'group');



    groups
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => { return yScale(d.cause) })
        .attr('height', yScale.bandwidth())
        .attr('width', d => { return xScale(d.deaths) })
        .attr('fill', 'rgb(31, 95, 201)')



    svg
        .select('.x.axis')
        .call(d3.axisBottom(xScale)
            .ticks(5));

    svg
        .select('.y.axis')
        .call(d3.axisLeft(yScale));



    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .attr('class', 'x axisLabel')
        .text("Deaths per year");







}


const dotExp = function (data) {
    // compares life expectancy by region and by gender
    var recent = data.filter(function (d) {
        return d.year.getFullYear() == d3.max(data, function (d) {
            return d.year;
        }).getFullYear()
    });


    recent = recent.sort(function (a, b) {
        return d3.ascending(a.women, b.women)
    })






    var [width, height, svg] = basics('#exp_vis', 'wide');

    d3.select('#exp_vis .chartTitle')

        .text('Women in the Mezzogiorno live up to 3 years less than in the North');


    d3.select('#exp_vis')
        .insert('p', 'svg')
        .attr('class', 'subtitle')
        .text('Life expectancy for men and women by region, 2017')


    var caption = d3.select('#exp_vis .chartCaption');

    caption.text('Source: ')

    var link = captionLink(caption, 'https://www.istat.it/it/archivio/14562');

    link.text('ISTAT, Health For All');


    var xScale = d3.scaleLinear()
        .domain([d3.min(recent, d => {
            return Math.min(d.men, d.women)

        }), d3.max(recent, d => {
            return Math.max(d.men, d.women)
        })])
        .range([0, width])
        .nice()



    var yScale = d3.scaleBand()
        .domain(recent.map(d => {
            return d.region;
        }))
        .range([height, 0])
        .padding(1);



    var colourScale = d3.scaleOrdinal()
        .domain(['men', 'women'])
        .range(['#67a9cf', '#ef8a62'])


    var groups = svg.selectAll('.group')
        .data(recent, d => { return d.region })
        .enter()
        .append('g')
        .attr('class', 'group');

    groups
        .append('line')
        .attr('class', 'line')

        .attr('x1', function (d) {

            return xScale(d.men);
        })
        .attr('x2', function (d) {
            return xScale(d.women);
        })
        .attr('y1', function (d) {
            return yScale(d.region);
        })
        .attr('y2', function (d) {
            return yScale(d.region);
        })
        .attr('stroke', strokeColour)
        .attr('stroke-width', strokeWidth)



    groups
        .append('circle')
        .attr('class', 'menDot')
        .attr('cx', function (d) {
            return xScale(d.men);
        })
        .attr('cy', function (d) {
            return yScale(d.region);
        })
        .attr('r', radius)
        .attr('fill', colourScale('men'))
        .attr('id', d => { return 'men ' + d.region })



    groups
        .append('circle')
        .attr('class', 'womenDot dot')
        .attr('cx', function (d) {
            return xScale(d.women);
        })
        .attr('cy', function (d) {
            return yScale(d.region);
        })
        .attr('r', radius)
        .attr('fill', colourScale('women'))
        .attr('id', d => {
            return 'women ' + d.region;
        })


    svg
        .select('.y.axis')
        .call(d3.axisLeft(yScale));


    svg
        .select('.x.axis')
        .call(d3.axisBottom(xScale))

    svg.append("text")
        .attr('class', 'x axisLabel')
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top) + ")")
        .style("text-anchor", "middle")
        .text("Life expectancy (years)");



    svg
        .selectAll('.menDot')
        .on('mouseenter', d => {

            tooltip
                .classed('active', true)
                .transition()
                .duration(100)

                //.style('opacity', .9)
                .style('left', (d3.event.pageX) + 'px')

                .style('top', (d3.event.pageY - 28) + 'px');

            tooltipLabel
                .text(d.region + ' - Men');
            tooltipNumber
                .text(d.men + ' years')



        })
        .on('mouseout', d => {
            tooltip
                .classed('active', false)
                .transition()
                .duration(100)


                .style('left', -100)
                .style('top', -100)
        })
    /*  svg
 
     .selectAll('.menDot')
     .on('click', d => {
 
      
         if (tooltip.classed('active')) {
             tooltip.classed('active', false)
             .transition()
         .duration(100)
         .style('left', -100)
         .style('top', -100)
 
         }
         else {
             tooltip
             .classed('active', true)
             .transition()
             .duration(100)
             
             //.style('opacity', .9)
             .style('left', (d3.event.pageX) + 'px')
     
             .style('top', (d3.event.pageY - 28) + 'px');
           
  
 
             tooltipLabel
             .text(d.region);
             tooltipNumber
             .text(d.men + ' years')
 
             
         }
     }) */

    svg
        .selectAll('.womenDot')
        .on('mouseenter', d => {

            tooltip
                .classed('active', true)
                .transition()
                .duration(100)

                //.style('opacity', .9)
                .style('left', (d3.event.pageX) + 'px')

                .style('top', (d3.event.pageY - 28) + 'px');

            tooltipLabel
                .text(d.region + ' - Women');
            tooltipNumber
                .text(d.women + ' years')



        })
        .on('mouseout', d => {
            tooltip
                .classed('active', false)
                .transition()
                .duration(100)


                .style('left', -100)
                .style('top', -100)
        })
    /*  .on('click', d => {
         if (tooltip.classed('active')) {
             tooltip.classed('active', false)
             .transition()
         .duration(100)
         .style('left', -100)
         .style('top', -100)
 
         }
         else {
             tooltip
             .classed('active', true)
             .transition()
             .duration(100)
             
             //.style('opacity', .9)
             .style('left', (d3.event.pageX) + 'px')
     
             .style('top', (d3.event.pageY - 28) + 'px');
           
     
 
             tooltipLabel
             .text(d.region);
             tooltipNumber
             .text(d.women + ' years')
         }
     }) */





    svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(" + (width / 2 - margin.left) + ',-40)')

    var legendOrdinal = d3.legendColor()
        //d3 symbol creates a path-string, for example
        //"M0,-8.059274488676564L9.306048591020996,
        //8.059274488676564 -9.306048591020996,8.059274488676564Z"
        .shape("path", d3.symbol().type(d3.symbolCircle).size(100)())
        .shapePadding(65)
        .orient('horizontal')
        //use cellFilter to hide the "e" cell
        .cellFilter(function (d) { return d.label !== "e" })
        .scale(colourScale);

    svg.select(".legendOrdinal")
        .call(legendOrdinal);







}
