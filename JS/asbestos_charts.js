var parseTime = d3.timeParse("%Y");
var margin = { top: 50, bottom: 50, left: 90, right: 50 };


var radius = '6';
var strokeWidth = '1px'


var ottanaMap = L.map('ottana').setView([40.2409,9.0293], 14);


L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
).addTo(ottanaMap);

var enichem = L.marker([40.239, 9.0193]).addTo(ottanaMap)
.bindPopup('<strong>Enichem</strong><br>Chemical plant; 1973-1996');


var legler = L.marker([40.2499, 9.0234]).addTo(ottanaMap)
.bindPopup('<strong>Legler</strong><br>1990s-2007; Textiles');


var tirso = L.marker([40.2505, 9.0042]).addTo(ottanaMap)
.bindPopup('<strong>Metallurgica del Tirso</strong><br>Metallurgical industry; 1973-1978');












d3.csv('src/registro_cumulativo.csv', d => {

    d.year = parseTime(parseInt(d.year));
    d.alta = +d.alta;
    d.bassa = +d.bassa;
    d.tot = +d.tot;
    d.cum_alta = +d.cum_alta;
    d.cum_bassa = +d.cum_bassa;
    d.cum_tot = +d.cum_tot;

    return d;
}, function (data) {
    console.log(data);


    cumulative(data);
})





/// REGISTRO EX EXPOSTI - NUORO
const cumulative = function (data) {

    var [width, height, svg] = basics('#asbestos_time');

    d3.select('#asbestos_time .chartTitle')
    .text('INAIL\'s u-turn paves the way for healthcare surveillance in Ottana')

d3.select('#asbestos_time')
    .insert('p', 'svg')
    .attr('class', 'subtitle')
    .text('Workers enrolled in the asbestos exposure surveillance programme, province of Nuoro');



var caption = d3.select('#asbestos_time .chartCaption');

caption.html('Ottana workers are over 90% of those enrolled in the Nuoro province. The chart does not include workers resident in other provinces.<br>Source: ')

var link = captionLink(caption, 'http://www.sardegnasalute.it/index.php?xsl=313&s=273749&v=2&c=12803');

link.text('Sardegna Salute');




    var filter = data.filter(d => {
        return d.asl == 'asl_3';
    })

    var xScale = d3.scaleBand()
        .domain(filter.map(d => {
            return d.year.getFullYear()
        }))
        .range([0, width])
        .padding(.1);



    var yScale = d3.scaleLinear()
        .domain([0, d3.max(filter, d => {
            return d.cum_tot;
        })])
        .range([height, 0])

    console.log(xScale.bandwidth())
    console.log(xScale.range())


    var bars = svg
        .selectAll('.bar')
        .data(filter, d => { return d.year })
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('width', xScale.bandwidth())
        .attr('x', d => {
            console.log(d);
            return xScale(d.year.getFullYear())
        })
        .attr('y', d => {
            return yScale(d.cum_tot);
        })
        .attr('height', d => {
            return height - yScale(d.cum_tot);
        })
        .attr('fill', '#28719D')



    svg
        .select('.x.axis')
        .call(d3.axisBottom(xScale));


    svg
        .select('.y.axis')
        .call(d3.axisLeft(yScale));



        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "2.1em")
        .style("text-anchor", "middle")
        .attr('class', 'y axisLabel')
        .text("Workers enrolled in the programme");
    
// https://d3-annotation.susielu.com/

    const type = d3.annotationCallout;

    const annotations = [{
        note: {
            label: 'Ottana workers are admitted into the surveillance programme',
            bgPadding: 40,
            title: 'Late 2015'
        },

        data: {year: 2016, cum_tot: 450},
        className: "annotation",
dy: 10,
dx: -15
    }]


const makeAnnotation = d3.annotation()
.editMode(false)
.notePadding(15)
.type(type)
.accessors({
    x: d => {
        return xScale(d.year);
    },
    y: d => {
        return yScale(450)
    }
})
.annotations(annotations);

svg
    .append('g')
    .attr('class', 'annotationContainer')
    .call(makeAnnotation)

}