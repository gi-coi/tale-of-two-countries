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
        .call(responsivefy)
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



    var readMore = document.getElementsByClassName("readMore");

for (let i = 0; i < readMore.length; i++) {
  readMore[i].addEventListener("click", function() {
    this.classList.toggle("open");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
  
        content.style.display = "none";
        this.querySelector('span.arrow').textContent = '⮞'
    
     
      
    } else {
      content.style.display = "block";
      this.querySelector('span.arrow').textContent = '⮟'
    }
  });
} 


function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMid")
      .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
  }
}