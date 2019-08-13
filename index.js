const url = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json';

var margin = { top: 100, right: 10, bottom: 150, left: 10 },
    width = 1500 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

var svg = d3.select('body').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('class', 'graph-svg-component')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');;

svg.append('text')
  .attr('id','title')
  .attr('x', (width / 2))             
  .attr('y', 0 - (margin.top / 2))
  .attr('text-anchor', 'middle')  
  .style('font-size', '30px') 
  .text('Video Game Sales');
  
svg.append('text')
  .attr('id','description')
  .attr('x', (width / 2))             
  .attr('y', 0 - (margin.top / 2) + 25)
  .attr('text-anchor', 'middle')  
  .style('font-size', '20px') 
  .text('Top 100 Most Sold Video Games Grouped by Platform');

var treemap = d3.treemap()
    .size([width, height])
    .paddingInner(1);
   
d3.json(url)
  .then(function(data) {
    var root = d3.hierarchy(data)
      .eachBefore(function(d) {
        d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name; 
      })
      .sum(function(d){
        return d.value;
      })
      .sort(function(a, b) { return b.value - a.value; });

    treemap(root);
  
    var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
  
    var cell = svg.selectAll('g')
      .data(root.leaves())
      .enter().append('g')
      .attr('transform', function(d) { return 'translate(' + d.x0 + ',' + d.y0 + ')'; });
  
    var rectBox = cell.append('rect')
      .attr('id', function(d) { return d.data.id; })      
      .attr('width', function(d) { return d.x1 - d.x0; })
      .attr('height', function(d) { return d.y1 - d.y0; })
      .attr('class','tile')
      .attr('data-name', function(d){
        return d.data.name;
      })
      .attr('data-category', function(d){
        return d.data.category;
      })
      .attr('data-value', function(d){
        return d.data.value;
      })
      .attr('fill', function(d,i) {
        return color(d.data.category);
      })
      .on('mouseover', function(d) {
        d3.select('#tooltip')
          .style('opacity', 1)
          .style('left', d3.event.pageX + 10 + 'px')
          .style('top', d3.event.pageY - 28 + 'px')
          .style('display', 'block')
          .attr('data-value', d.data.value)
          .html(          
            'Name: ' + d.data.name + 
            '<br>Category: ' + d.data.category + 
            '<br>Value: ' + d.data.value
          );
      })
      .on('mouseout', function() {
        d3.select('#tooltip').style('display', 'none');
        });
  
    cell.append('text')
      .attr('class', 'tile-text')
      .selectAll('tspan')
      .data(function(d) { return d.data.name.split(/(?=[A-Z][^A-Z])/g); })
      .enter().append('tspan')
      .attr('x', 4)
      .attr('y', function(d, i) { return 16 + i * 10; })
      .text(function(d) { return d; });

    var categories = root.leaves().map(function(nodes){
      return nodes.data.category;
    });
    categories = categories.filter(function(category, index, self){
      return self.indexOf(category)===index;    
    });
  
    var legend = svg.selectAll('.legend')                    
      .data(categories)                                 
      .enter()                                              
      .append('g') 
      .attr('id', 'legend')
      .attr('transform', function(d, i) {                    
        var width = 50;          
        var offset =  width * 8;    
        var vert = height + 80;                       
        var horz = i * width - offset + 700;                        
        return 'translate(' + horz + ',' + vert + ')';        
      })
  
    legend.append('rect')                                   
      .attr('width', 15)                          
      .attr('height', 15)    
      .attr('class', 'legend-item')
      .style('fill', function(d, i) {
        return color(d);
      })                                   
      .style('stroke', function(d, i)  {
        return color(d);
      })
      .append('text')
      .text(function(d) { return d });
  
    legend.append('text') 
      .attr('x', -2)
      .attr('y', -10)
      .text(function(d) { return d });
  

  });