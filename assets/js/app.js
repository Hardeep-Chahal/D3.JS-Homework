// @TODO: YOUR CODE HERE!
//chart setup
var svgWidth = 1000; 
var svgHeight = 500; 

var margin = { 
    top: 20, 
    right: 40, 
    bottom: 60, 
    left: 50
}; 

var width = svgWidth - margin.left - margin.right; 
var height = svgHeight - margin.top - margin.bottom;

//create SVG wrapper, needs to append SVGgroup to hold chart
//and shift by left & top margins

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
  
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//set initial parameters 
var XAxis = "income"; 

// function used for updating x-scale var upon click on axis label
function xScale(data, XAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[XAxis]) * 0.8,
        d3.max(data, d => d[XAxis]) * 1.2
      ])
      .range([0, width]); 
  
    return xLinearScale;
  
  }

  //update xAxis var upon clicking axis label using fucntion. 
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisbottom(newXScale); 

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

//function that is used to update circles w/ trans. to new circles
function renderCircles (circlesGroup, newXScale, xAxis) {
    circlesGroup.transition()
        .duration(1000) 
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup; 
}

//function used for updating circles group with new tooltip
function updateToolTip(XAxis, circlesGroup) {
    if(XAxis === "income") {
        var label = "Income";
    }
    else {
        var label = "Obesity";
    }
    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, 60])
    .html(function(d) {
        return (`${d.abbr}<br>${label} ${d[XAxis]}`);
        });

    circlesGroup.call(toolTip); 

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        //mouseout event
        .on("mouseout", function(data,index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

//get data from cSV file 
//execute all 
d3.csv("data.csv", function(err, dataStuff){
    if ( err) throw err; 

    //data parser
    dataStuff.forEach(function(data) {
        data.income = +data.income; 
        data.obesity = +data.obesity; 
    });

    //use xlinerscale for csv import. 
    var xLinearScale = xScale(dataStuff, XAxis); 
    //y scale
    var ylinearScale = d3.scaleLinear()
        .domain([0, d3.max(dataStuff, d => d.obesity)])
        .range([height, 0]);

    //create axis funtions 
    var bottomAxis= d3.axisbottom(xLinearScale);
    var leftAxis = d3.axisLeft(ylinearScale);
    
    //append the xaxis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis); 

    //appen the yaxis
    chartGroup.append("g")
        .call(leftAxis); 

    //append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(dataStuff)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[XAxis]))
        .attr("cy", d => ylinearScale(d.obesity))
        .attr("r",20)
        .attr("fill", "red")
        .attr("opactiy", ".5" );

    //creating group for two-x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "income") 
        .classed("active", true)
        .text("Average Income per State");
    var obeseLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "obesity") 
        .classed("inactive", true)
        .text("Percentage of Obesity");
    //append yaxis 
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2)) 
        .classed("axis-text", true)
        .text("");

    //update ToolTip for CSV import
    var circlesGroup = updateToolTip(XAxis, circlesGroup); 

    //event listner for xasxi labels

labelsGroup.selectAll("text")
    .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== XAxis) {

            //Chosen XAxis replace with neew value
            XAxis = value; 
            // update the xcale for new data xLinearScale
            xLinearScale = xScale(dataStuff, XAxis); 
            //update xaxis for transitions
            xAxis = renderAxes(xLinearScale, xAxis); 
            //update circles with append xvalues
            circlesGroup = renderCircles(circlesGroup, xLinearScale, XAxis); 
            //update tooltip w/new info
            circlesGroup = updateToolTip(XAxis, circlesGroup); 
            //create bold text 
            if (XAxis === "income") {
                obeseLabel
                    .classed("active", true)
                    .classed("inactive", false); 
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true); 
            }
            else {
                obeseLabel
                    .classed("active", false)
                    .classed("inactive",true); 
                
            }

        }
    });
});


