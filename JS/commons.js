var radius = 6;
var opacity = .75;
var strokeWidth = 1.5;
var strokeColour = '#616060';

const basics = function (parent, type) {


    d3.select(parent)
    .append('h3')
    .attr('class', 'chartTitle')

    var width = d3.select(parent).node().getBoundingClientRect().width;
    
    
    var height = d3.select(parent).node().getBoundingClientRect().height;

   
    var svg = d3.select(parent)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');


        svg
        .append('g')
        .attr('class', 'x axis');
        
    
    
    
    svg
        .append('g')
        .attr('class', 'y axis');

      
    
        if (type === 'wide') {
            svg
            .attr('transform', 'translate(' + barMargin.left + ',' + barMargin.top + ')');

            height = height - barMargin.top - barMargin.bottom;
    
            width = width - barMargin.left - barMargin.right;


            svg
            .select('.x.axis')
            .attr("transform", "translate(0," + height + ")")
        
        }
        else {
            svg
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            height = height - margin.top - margin.bottom;
    
            width = width - margin.left - margin.right;

            svg
            .select('.x.axis')
            .attr("transform", "translate(0," + height + ")")
        }
    
    
        d3.select(parent)
        .append('p')
        .attr('class', 'chartCaption')
 
    
    return [width, height, svg]
    }

    
    var parseTime = d3.timeParse("%Y");


    const captionLink = function(elem, link) {
      var link =  elem
        .append('a')
        .attr('href', link)
        .attr('target', '_blank');
        return link;
        
    }