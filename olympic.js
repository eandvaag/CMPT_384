/*
  Erik Andvaag
  NSID: eaa299
  Student ID: 11199809

  Dr. Debajyoti Mondal
  CMPT 384.3
*/


/*
  Assignment 6 
*/


var svg;
var g;
var sidebar;
var sidebar_background;
var sidebar_chart;
var sidebar_axis;
var padding = 15;


var current_selection;

//const state = {
//  ALL: 1,
//  EXPORT: 2,
//  IMPORT: 3
//};
const genderCategory = {
  ALL: 1,
  MEN: 2,
  WOMEN: 3
};


const medalCategory = {
  ALL: 1,
  ALL_ADJ: 2,
  GOLD: 3
};

//var currentState = state.ALL;

//var relations;
//var uniqueRelations = {};



var width = 675;
var height = 625;

var sidebar_x = 675;//(2 * width) / 3;
var sidebar_y = 0;//height / 2;
var sidebar_w = 300;
var sidebar_h = height;
var sidebar_created = false;
//var sidebar_buttons;
var button_r = 20;
//var button_groups;


var control_h = height;
var control_w = 335;

//var padding = 100;
//var opacityScale;
//var projection;
var year_list = [];
var year_res = {};
var year_sports = {};
var year_events = {};
var year_strat = {};

var pictogram_lookup = {};
var flag_lookup = {};

var zoom_g = d3.zoom();

var selected_year = 1896;


/* EVENTS */
var selected_gender = "All";

d3.csv("olympic_data.csv").then(function(data, error) {

  var results;
  if (error)
    console.log(error);
  else
    results = data;

  d3.csv("pictogram_lookup.csv").then(function(p_data, p_error) {
    if (p_error)
      console.log(p_error);
    else
      p_data.forEach(function(d){
        pictogram_lookup[d.sport] = d.image;
      });
//      pictogram_lookup = p_data;

    d3.csv("flag_lookup.csv").then(function(f_data, f_error) {
      if (f_error)
        console.log(f_error);
      else
        f_data.forEach(function(d) {
          flag_lookup[d.three_char] = { "full": d.full_name,
                                        "two_char": d.two_char };
        });

    


    console.log("pictogram_lookup", pictogram_lookup); 
    console.log("flag_lookup", flag_lookup);

    var year;
    var sport;
    var dEvent;
    for (var i = 0; i < results.length; i++) {

      year = results[i].Edition;
      sport = results[i].Sport;
      dEvent = results[i].Event;

  //    results[i].id = results[i].Event;
  //    results[i].parentId = sport;

      if (!(year in year_res)) {
        year_root = {id: year};
        year_res[year] = [];
        year_res[year].push(year_root);

        year_sports[year] = [];
        year_events[year] = {};
      }

  //    if (!(year_events[year].includes(dEvent))) {
  //      year_events[year].push(dEvent);
  //      
  //    }


      if (!(sport + "_" + dEvent in year_events[year])) {

        year_events[year][sport + "_" + dEvent] = {id: dEvent,
                                     parentId: sport,
                                     members: []};
      }

  //    console.log(year_events[year][dEvent]);
      year_events[year][sport + "_" + dEvent].members.push(results[i]);
  //      year_res[year].push({id: dEvent, parentId: sport});
  //    }
  //    else {
  //      year_events[year][dEvent]

      if (!(year_sports[year].includes(sport))) {
        year_sports[year].push(sport);
        year_res[year].push({id: sport, parentId: year});

      }

  //    for (var i = 0; i < Object.values(year_res).length; i++) {
        
  //    }
  //    for (var i = 0; i < Object.values(year_events).length; i++) {
  //      for (var j = 0; j < Object.values(year_events)[i].length; j++) {
  //        year_res[Object.values(year_events)[i][j]
  //      }
         // year_res[year].push({id: dEvent, parentId
      

    }
    
    for (var year of Object.keys(year_events)) {
      for (var dEvent of Object.keys(year_events[year])) {
        year_res[year].push(year_events[year][dEvent]);
      }
    }

  /*  for (var i = 0; i < results.length; i++) {
      if (!results[i].Sport in sports)

      results[i].parentId = results[i].Sport;

    }
  */
  //  console.log(data);
    console.log("year_res", year_res);
    console.log("year_sports", year_sports);

    for (var i = 0; i < Object.values(year_res).length; i++) {
      year_strat[Object.keys(year_res)[i]] = d3.stratify()(Object.values(year_res)[i]);
      //year_strat.push(d3.stratify()(Object.values(year_res)[i]));
    }
    console.log("year_strat", year_strat);

    initPlot();
    drawPlot();

    });

  });
 
});

function initPlot() {

  svg = d3.select("#chart")
          .append("svg")
          .attr("viewBox", [0, 0, width, height])
          .attr("width", width)
          .attr("height",height);
//          .attr("id", "svgTree")

  //var panZoomTree = svgPanZoom("#svgTree");//d3.select("#svgTree").select("svg"));

  //var svgElement = document.querySelector("#svgTree");
 // var panZoomTree = svg

  g = d3.select("#chart")
        .select("svg")
//      d3.selectAll("svg")
//      svg.
//      svg.select("svg")
//               .attr("id", "nodeTree")
//               .append("svg")
        .append("g")
        .attr("width", (width))
        .attr("height", (height))
//        .select("g")
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
        .attr("cursor", "grab");

  g2 = d3.select("#chart")
                   .select("svg")
                   .append("g")
                   .attr("width", width)
                   .attr("height", height);

//  var transform = d3.zoomIdentity;
  var zoom = svg.call(zoom_g
      .extent([[0, 0], [width, height]])
//      .translateExtent([[-width, -height], [width, height]])
      .scaleExtent([0.1, 2])
      .on("zoom", zoomed));

  zoom_g.scaleTo(svg, 0.6);//, [width/2,height/2]);
  zoom_g.translateTo(svg, -width/10 + padding * 3, -height/10 + padding * 3);

  control = d3.select("#control")
               .append("svg")
               .attr("width", control_w)
               .attr("height", control_h);

  sidebar_background = d3.select("#sidebar")
              .select("svg")
              .append("g");


  control_background = d3.select("#control")
                         .select("svg")
                         .append("g");

  control_background
//         .selectAll("rect")
         .append("rect")
         .attr("x", 0)
         .attr("y", 0)
         .attr("height", control_h)
         .attr("width", control_w)
         .attr("fill", "hsl(" + 120 + "," + 73 + "%," + 85 + "%)")
         .attr("id", "background_rect");


  control_buttons = d3.select("#control")
                      .select("svg")
                      .append("g")
                      .attr("id", "control_buttons");


  control_buttons.selectAll("g.button")
                        .data(["All", "Men", "Women"])
                        .enter()
                        .append("g")
                        .attr("class", "button")
                        .style("cursor", "pointer")
                        .on("click", function(d, i) {
                          //d3.select(
                          prev_gender_selection.select("circle").attr("fill", "lightgreen");
                          d3.select(this).select("circle").attr("fill", "darkgreen");
                          prev_gender_selection = d3.select(this);
                          selected_gender = d;
                          drawPlot();
                          if (sidebar_created) {
                            node_update();
                          }
                        })
                        .attr("id", function(d) { return "#" + d; });
  var prev_gender_selection = d3.select("#All");
  var button_w = control_w - (padding * 4);

  

  control_buttons.selectAll("g.button")
//                 .data(["All", "Men", "Women"])
//                .enter()
               .append("circle")
               .attr("class", "button_circle")
//               .attr("width", padding)
//               .attr("height", padding)
               .attr("cx", function(d, i) {
                        return (padding * 2) + (i + 0.5) * (button_w / 3);// padding + i * (sidebar_w - 2 * padding) / 2;
               })
               .attr("cy", padding * 6)
               .attr("r", button_r)
               .attr("fill", "lightgreen")
               .attr("stroke", "black")
               .attr("stroke-width", 1);

  prev_gender_selection.select("circle").attr("fill", "darkgreen");


  var gender_text = ["All", "Men", "Women"];

  control_buttons.selectAll("g.button")
                    .append("text")
                    .attr("x", function(d, i) {
                        return (padding * 2) + (i + 0.5) * (button_w / 3);// padding + i * (sidebar_w - 2 * padding) / 2;
                    })
                    .attr("y", padding * 9)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 16)

                    .text(function(d, i) {
                        console.log("gender_text[i]", gender_text[i]);
                        return gender_text[i];
                    });


 // control_background.append("text")


//  svg.call(zoom);
//  svg.call(zoom.transform, center);
/*
  sidebar = d3.select("#sidebar")
              .append("svg");
              .attr("width", sidebar_w)
              .attr("height", sidebar_h);
//              .attr("transform", "translate(" + sidebar_x + "," + sidebar_y + ")");
*/

/*
  var m = [20, 120, 20, 120],
      w = 1280 - m[1] - m[3],
      h = 1800 - m[0] - m[2];


  sidebar = d3.select("#sidebar")
              .append("svg")
//              .attr("width", w + m[1] + m[3])
//              .attr("height", h + m[0] + m[2])

              .attr("width", sidebar_w)
              .attr("height", sidebar_h * 2);
              //.attr("viewBox", [0, 0, sidebar_w, sidebar_h]); //sidebar_w, sidebar_h])
          //    .attr("overflow", "scroll");

//              .attr("transform", "translate(" + sidebar_x + "," + sidebar_y + ")");




//  sidebar.select("svg")
//         .append("g")
//         .attr("id", "sidebar_background");

//  sidebar.select("svg")
//         .append("g")
//         .attr("id", "sidebar_chart");


            //d3.selectAll("svg")
//  sidebar.select("#sidebar_background")//.selectAll("svg")
//              .attr("id", "sidebar")
//              .append("svg")

  sidebar_background = d3.select("#sidebar")
              .select("svg")
              .append("g");



              //.attr("width", sidebar_w)
              //.attr("height", sidebar_h * 2);
//              .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

//              .attr("transform", "translate(" + sidebar_x + "," + sidebar_y + ")");


//  sidebar.select("#sidebar_chart")//.selectAll("svg")
//              .attr("id", "sidebar")
//              .append("svg")
  sidebar_chart = d3.select("#sidebar")
              .select("svg")
              .append("g");
//              .attr("viewBox", [0, 0, sidebar_w, sidebar_h/2])
              //.attr("cursor", "grab");
              //.attr("width", sidebar_w)
              //.attr("height", sidebar_h * 2);
//              .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

//              .attr("transform", "translate(" + sidebar_x + "," + sidebar_y + ")");
  sidebar_buttons = d3.select("#sidebar")
                      .select("svg")
                      .append("g")
                      .attr("id", "sidebar_buttons");


  sidebar_axis = d3.select("#sidebar")
         .select("svg")
//  sidebar.select("svg")
         .append("g")
         .attr("transform", "translate(" + padding + "," + (6 * padding) + ")");
         //.attr("class", "axis")
         
//
//  d3.select("#title")
//    .selectAll("text")
//    .append("text")
//    .attr("font-size", 40)
//    .text("Modern Olympic Results");
//
*/

  sidebar = d3.select("#sidebar")
              .append("svg");


  var dataTime = d3.range(0, 2009-1896, 4).map(function(d) {
                    return new Date(1896 + d, 10, 3);
  });
    

//    return new Data(

  var sliderTime = d3.sliderBottom()
                     //.data(year_res[year].keys())
                     //.min(d3.min(data))
                     //.max(d3.max(data))
                     //.min("1900")
                     //.max("1904")
                     .min(d3.min(dataTime))
                     .max(d3.max(dataTime))
                     //.min(d3.min(Object.keys(year_res), function(d) { return parseInt(d); }))
                     //.max(d3.max(Object.keys(year_res), function(d) { return parseInt(d); }))
                     //.step(4)
                     .step(4 * 1000 * 60 * 60 * 24 * 365)
                     .width(800)
                     .tickFormat(d3.timeFormat("%Y"))
                     //.tickValues(["1900", "1904"]);
                     .default(new Date(1896, 10, 3))
                     .tickValues(dataTime)
                     .on("onchange", val => {
                        //drawPlot;
                        if (!(parseInt(selected_year) === 1900 + val.getYear()))
                          remove_sidebar();
                          sidebar.append("svg");
    zoom_g.scaleTo(svg, 0.6);//, [width/2,height/2]);
    zoom_g.translateTo(svg, -width/10 + padding * 3, -height/10 + padding * 3);



                                //= d3.select("#sidebar")
                                //      .append("svg")
                          
                          selected_year = Math.round(1900 + val.getYear());
                          drawPlot();
                        //console.log("val", 1900 + val.getYear());
                        //console.log("year : ", d3.select("p#value-time").text(d3.timeFormat("%Y")(val)));
                     });
  console.log("keys(year_res)", Object.keys(year_res));

  
  var gTime = d3.select("#slider-time")
                .append("svg")
                .attr("width", 1200)
                .attr("height", 100)
                .append("g")
                .attr("transform", "translate(30, 30)");

  gTime.call(sliderTime);



}
/*
function update_button_colour(button) {
  button

});
*/

function drawPlot() {
  console.log("in drawPlot");

  g.selectAll("path").remove();
  g.selectAll("circle").remove();
  g.selectAll("image").remove();
  g.selectAll("text").remove();
 
  g2.selectAll("rect").remove();
  g2.selectAll("text").remove();

  if (!(selected_year in year_strat)) {
    console.log("no olympics held in ", selected_year);
    var message;
    if (selected_year == 1916)
      message = "No olympics held due to WW1";
    else
      message = "No olympics held due to WW2";

    g2//.selectAll("text")
     .append("text")
     .attr("x", width/2)
     .attr("y", height/2)
     .attr("text-anchor", "middle")
     .attr("font-size", 24)
     .text(message);

  }

  else {

    

    var data = year_strat[selected_year];
//    var layout = d3.cluster().size([2 * Math.PI, Math.min(width/2, height/2)/2 - 10]);
    console.log("NUMBER", (Math.sqrt(year_res[selected_year].length) * 50) - 10.1);
    var layout = d3.cluster().size([2 * Math.PI, (Math.sqrt(year_res[selected_year].length) * 50) - 10.1]);
    //var layout = d3.cluster().size([2 * Math.PI, Math.sqrt(year_res[selected_year].length) - 10]);
    console.log(layout);

    var root = d3.hierarchy(data);
    var nodes = root.descendants();
    var links = layout(root).links();


    var zoom_k = (Math.sqrt(year_res[selected_year].length) * 100) - 10.1;

//    var zoom_k = year_res[selected_year].length / year_res[1896].length;
    zoom_g.translateExtent([[-zoom_k, -zoom_k], 
                            [zoom_k, zoom_k]]);
/*
    zoom_g.scaleTo(svg, 0.6);//, [width/2,height/2]);
    zoom_g.translateTo(svg, -width/10 + padding * 3, -height/10 + padding * 3);
*/
    sportNodes = [];
    eventNodes = [];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].data.data.parentId in year_strat)
        sportNodes.push(nodes[i]);
      else if (year_sports[selected_year].includes(nodes[i].data.data.parentId))
        eventNodes.push(nodes[i]);
    }
/* 
    g2.append("rect")
     .attr("x", 0)
     .attr("y", 0)
     .attr("width", width)
     .attr("height", height)
     .attr("fill", "none")
     .attr("stroke", "black")
     .attr("stroke-width", 2);
*/

   //  .attr("fill", "lightyellow");


    
    //d3.select("#chart").select("svg").select("g2").moveToBack();

    g.selectAll("path")
     .data(links)
     .enter()
     .append("path")
     .attr("d", d3.linkRadial()
                  .angle(function(d) { return d.x; })
                  .radius(function(d) { return d.y; }))
     .attr("fill", "none")
     .attr("stroke", "black")
     .attr("stroke-width", 2)
     .attr("opacity", function(d) {
//            console.log("link", d);
//        return 1;

        if (year_sports[selected_year].includes(d.source.data.id)) {
          for (var i = 0; i < d.target.data.data.members.length; i++) {
            if (selected_gender_list().includes(d.target.data.data.members[i].Gender))
            //if current_genders.includes(d.data.data.members[i].Gender) {
              return 0.6;
          }
          return 0;
        }
        return 0.6;

      });

//     .attr("opacity", 0.6);

    g.selectAll("circle")
     .data(nodes)
     .enter()
     .append("circle")
     .attr("transform", function(d) { return "translate(" + d3.pointRadial(d.x, d.y) + ")"; })
  //   .attr("transform", function(d){ return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
     .attr("r", function(d) {
      if (d.data.data.parentId in year_strat)
        return 20;
      else
        return 10;
     })
     .attr("fill", function(d) {
      if (d.data.data.parentId in year_strat)
        //return "lightgreen";
        return "hsl(" + 120 + "," + 73 + "%," + 85 + "%)";
      else
        return "lightblue";
      })
     .attr("opacity", function(d) {
//            console.log("d.data.data", d.data.data);

        if (year_sports[selected_year].includes(d.data.data.parentId)) {
          for (var i = 0; i < d.data.data.members.length; i++) {
            if (selected_gender_list().includes(d.data.data.members[i].Gender))
            //if current_genders.includes(d.data.data.members[i].Gender) {
              return 1;
          }
          return 0;
        }
        return 1;
      })



      .on("click", function(d) {
        current_selection = d;
        node_update(sportNodes);
      })
      .attr("cursor", "pointer"); 
/*
    .on("mouseover", function(d) {
        node_update(d, sportNodes);
      })
     .on("mouseout", function(d) {
        remove_sidebar();
      });
*/

    console.log("sportNodes", sportNodes); 
    g.selectAll("image")
      .data(sportNodes)
      .enter()
      .append("image")
      .attr("transform", function(d) { return "translate(" + d3.pointRadial(d.x, d.y) + ")"; })
      .attr("x", function(d) { return -15;})
      .attr("y", function(d) { return -15;})
      .attr("height", 30)
      .attr("width", 30)
      .attr("xlink:href", function(d) { 
         console.log("lookup: ", pictogram_lookup[d.data.data.id]);
         return "pictograms/" + pictogram_lookup[d.data.data.id]; 
      })
      .on("click", function(d) {
        current_selection = d;
        node_update(sportNodes);
      })
      .attr("cursor", "pointer");

    console.log("nodes", nodes);
    g.selectAll("text")
     .data(eventNodes)
     .enter()
     .append("text")
     .attr("x", 10)
  //   .attr("dx", ".35em")
     .attr("dy", ".35em")
  //   .attr("text-anchor", "start")
  //   .attr("text-anchor", function(d) {
  //      if (d.x < 180)
  //        return "start";
  //      else
  //        return "end";
  //    })
     //.attr("transform", function(d) { return d.x < 180? "translate(" + d3.pointRadial(d.x, d.y) + ")" : "rotate(180)translate(" + d3.pointRadial(d.x, d.y) + ")";})

  //   .attr("transform", function(d){ return "rotate(" + (d.x * (180/Math.PI) - 90) + ")translate(" + d.y + ")"; })


     .attr("transform", function(d) { 
        var initial_rotate = (d.x * (180/Math.PI) - 90 );
        var initial_translate = d.y;
        //var initial_translate = d3.pointRadial(d.x, d.y);


        if (initial_rotate < 90 || initial_rotate > 270) 
          return "rotate(" + initial_rotate + ")translate(" + initial_translate + 18 + ")";
        else
          return "rotate(" + (initial_rotate + 180) + ")translate(" + (-initial_translate + -20) + ")"; })

     .attr("text-anchor", function(d) { 
        if (((d.x * (180/Math.PI) - 90 ) >= 90) && (d.x * (180/Math.PI) - 90 ) <= 270) 
          return "end";
  //        return d.x * (180/Math.PI) < 180 ? "start" : "end"; 
        else
          return "start";    
      })

  //   .attr("transform", function(d) { return "rotate(" + (d.x * (180/Math.PI)) + ")translate(" + d3.pointRadial(d.x, d.y) + ")"; })
     //.attr("transform", function(d) { return d.x < Math.PI ? "translate(8)" : "rotate(180)translate(-8)"; })
     //.attr("transform", function(d) { return "rotate(" + d3.pointRadial(d.x, d.y) + ")"; })
     //.attr("transform", function(d) { return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + (d.data.id.length + 50)  + ")"; })
  //   .attr("text-anchor", "start")
     .text(function(d) { 
        return d.data.id; })
  //   .attr("transform", function(d) { return "rotate(180)translate(-" + (d.data.id.length + 50)  + ")"; })
  //   .style("fill-opacity", 1e-6)
  //   .attr("stroke", "black");

      // Interaction

  //  updateSidebar(nodes);
   // var panZoomTree = svgPanZoom("#svgTree");
    console.log("done drawing");
  }
}

function remove_sidebar() {
/*
  sidebar_background.selectAll("rect").remove();
  sidebar_chart.selectAll("rect").remove();
  sidebar_background.selectAll("text").remove();
  sidebar_chart.selectAll("text").remove();
  sidebar_background.selectAll("circle").remove();
  sidebar_chart.selectAll("circle").remove();
  sidebar_background.selectAll("image").remove();
  sidebar_chart.selectAll("image").remove();

  sidebar_axis.style("visibility", "invisible");

  sidebar_buttons.selectAll("g.button").selectAll("circle").remove();
  sidebar_buttons.selectAll("g.button").remove();
*/
  sidebar_created = false;
  sidebar.remove();

}

function node_update(sportNodes) {

  remove_sidebar();
/*
  sidebar_background.selectAll("rect").remove();
  sidebar_chart.selectAll("rect").remove();
  sidebar_background.selectAll("text").remove();
  sidebar_chart.selectAll("text").remove();
  sidebar_background.selectAll("circle").remove();
  sidebar_chart.selectAll("circle").remove();
  sidebar_background.selectAll("image").remove();
  sidebar_chart.selectAll("image").remove();

  sidebar_buttons.selectAll("g.button").selectAll("circle").remove();
  sidebar_buttons.selectAll("g.button").remove();
*/  

//  button_groups.selectAll("circle").remove();

//  console.log("node", node);
  if (current_selection.data.data.id in year_res) {
    yearSidebar(sportNodes);
  }
  else if (current_selection.data.data.parentId in year_res) {
    sportSidebar();
  }
  else {
    eventSidebar();
  }
}

function yearSidebar(nodes) {

  console.log("the year is: ", current_selection.data.data.id);

  var sportList = [];
  for (var i = 0; i < sportNodes.length; i++) {
    sportList.push(sportNodes[i].data.data.id);
//    sPairs = sportCountryCounts(node, genderCategory.ALL, medalCategory.GOLD);
//    for (var j = 0; j < sPairs.length; j++) {
//      if (sPairs[j] in pairs)
//    pairs.push(sPairs);
  }
  var pairs = sportCountryCounts(sportList, medalCategory.GOLD);

  drawBars(current_selection.data.data.id + ": Overall Results", pairs);

}

function sportSidebar() {
  var pairs = sportCountryCounts([current_selection.data.data.id], medalCategory.GOLD);

  drawBars(current_selection.data.data.id, pairs);

}

function create_sidebar(is_event, num_items) {

  sidebar_created = true;

  if (is_event) {

    sidebar_height = Math.max(sidebar_h, padding * 7 + num_items * 50);
  }
  else {
    sidebar_height = Math.max(sidebar_h, padding * 7 + num_items * 20);
  }

  sidebar = d3.select("#sidebar")
              .append("svg")
//              .attr("width", w + m[1] + m[3])
//              .attr("height", h + m[0] + m[2])

              .attr("width", sidebar_w)
              .attr("height", sidebar_height);
              //.attr("height", sidebar_h * 2);


  sidebar_background = d3.select("#sidebar")
              .select("svg")
              .append("g");



              //.attr("width", sidebar_w)
              //.attr("height", sidebar_h * 2);
//              .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

//              .attr("transform", "translate(" + sidebar_x + "," + sidebar_y + ")");


//  sidebar.select("#sidebar_chart")//.selectAll("svg")
//              .attr("id", "sidebar")
//              .append("svg")
  sidebar_chart = d3.select("#sidebar")
              .select("svg")
              .append("g");

  
  sidebar_axis = d3.select("#sidebar")
         .select("svg")
//  sidebar.select("svg")
         .append("g")
         .attr("transform", "translate(" + padding + "," + (6 * padding) + ")");


}


function drawBars(title, pairs) {
/*
  sidebar_background.selectAll("rect").remove();
  sidebar_chart.selectAll("rect").remove();
  sidebar_background.selectAll("text").remove();
  sidebar_chart.selectAll("text").remove();
*/

  create_sidebar(false, pairs.length);
/*
  sidebar_height = Math.max(sidebar_h, padding * 7 + pairs.length * 20);

  sidebar = d3.select("#sidebar")
              .append("svg")
//              .attr("width", w + m[1] + m[3])
//              .attr("height", h + m[0] + m[2])

              .attr("width", sidebar_w)
              .attr("height", sidebar_height);
              //.attr("height", sidebar_h * 2);


  sidebar_background = d3.select("#sidebar")
              .select("svg")
              .append("g");



              //.attr("width", sidebar_w)
              //.attr("height", sidebar_h * 2);
//              .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

//              .attr("transform", "translate(" + sidebar_x + "," + sidebar_y + ")");


//  sidebar.select("#sidebar_chart")//.selectAll("svg")
//              .attr("id", "sidebar")
//              .append("svg")
  sidebar_chart = d3.select("#sidebar")
              .select("svg")
              .append("g");
//              .attr("viewBox", [0, 0, sidebar_w, sidebar_h/2])
              //.attr("cursor", "grab");
              //.attr("width", sidebar_w)
              //.attr("height", sidebar_h * 2);
//              .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

//              .attr("transform", "translate(" + sidebar_x + "," + sidebar_y + ")");
*/

//  var pairs = sportCountryCounts(node, genderCategory.ALL, medalCategory.GOLD);
  var countries = [];
  for (var i = 0; i < pairs.length; i++) {
    countries.push(pairs[i].country);
  }

  //  countries.push(pairs[i][0]);
  //  counts.push(pairs[i][1]);
  //}


/*
  var sidebar_xScale = d3.scaleBand()
                      //d3.scaleLinear()
                     .domain(Object.keys(countryCounts))
                     //.domain(0, Object.values(countryCounts).length)
                     .range([0, sidebar_w])
                     //.range([sidebar_x, sidebar_x + sidebar_w])
                     .paddingInner(0.1);
*/


  var sidebar_top = padding * 3;

  var bandScale = d3.scaleBand()
                    .domain(countries)
                    .range([sidebar_top + padding * 4, sidebar_top + padding * 4 + countries.length * 20])//3 * sidebar_h / 4])
                    .paddingInner(0.05);

  var xScale = d3.scaleLinear()
                     .domain([0,
  //[d3.min(Object.values(countryCounts), function(d) { return d; }),
                              d3.max(pairs, function(d) { return d.count; })]) //. function(d) { return d. /* unfinished */)])
                     .range([padding, sidebar_w - 2 * padding]);//sidebar_h / 2]);

  var xAxis = d3.axisTop(xScale)
                .ticks(Math.min(10, d3.max(pairs, function(d) { return d.count; })));
              //  .scale(xScale)
              //  .orient("bottom")
              //  .ticks(1);


  sidebar_axis.call(xAxis);
  sidebar_axis.style("visibility", "visible");
//              .attr("y", sidebar_h / 4 + countries.length * 20);
//  console.log("selection", countryCounts);
//  console.log("counts", Object.values(countryCounts));
  //sidebar.selectAll("rect").remove();


//  var sb_background_g = sidebar.select("#sidebar_background")
//                               .select("svg");
//                               .select("g");

                              
  //sidebar.select("#sidebar_background")
  //       .select("svg")



//  sb_background_g

  sidebar_background
//         .selectAll("rect")
         .append("rect")
         .attr("x", 0)
         .attr("y", 0)
         .attr("height", sidebar_height)
         .attr("width", sidebar_w)
         .attr("fill", "hsl(" + 120 + "," + 73 + "%," + 85 + "%)")
         .attr("id", "background_rect");


//  var sb_chart_g = sidebar.select("#sidebar_chart")
//                            .select("svg");
//                            .select("g");
  //sidebar.selectAll("rect")
//                            .append("svg");
//  sidebar.select("#sidebar_chart").select("svg").select("g").
  sidebar_chart
         .selectAll("rect")
         .data(pairs)
         .enter()
         .append("rect")
         .attr("x", function(d, i) {
            //return i * 50; 
            return padding;
            //return sidebar_xScale(countryCounts[d]);
         })
         .attr("y", function(d) {
            return bandScale(d.country);
            //return sidebar_h / 2 - sidebar_yScale(countryCounts[d]);
         })
         .attr("width",  function(d) {
                //sidebar_xScale.bandwidth())
            return xScale(d.count);
            //return bandScale(countryCounts[d]);
         })
         .attr("height", function(d) {
            //return sidebar_yScale(countryCounts[d]);
            return bandScale.bandwidth();
         })
         .attr("fill", "lightblue");
//  sidebar.select("#sidebar_background")
  sidebar_background
 //        .selectAll("text")
         .append("text")
         .attr("x", sidebar_w / 2)
         .attr("y", padding * 3)
         .attr("text-anchor", "middle")
         .attr("font-size", 24)
         .text(title);
//  sidebar.select("#sidebar_chart")
  sidebar_chart
         .selectAll("text")
         .data(pairs)
         .enter()
         .append("text")
         .attr("x", function(d, i) {
            return padding;
//            return sidebar_xScale(countryCounts[d]);
         })
         .attr("y", function(d) {
            return bandScale(d.country) + 15;
            //return sidebar_h / 2 - sidebar_yScale(countryCounts[d]);
         })
         .attr("text-anchor", "start")
         .text(function(d) { return d.country; });

/*

  var rowEnter = function(rowSelection) {
    rowSelection.append("rect")
         .attr("x", function(d, i) {
            //return i * 50; 
            return padding;
            //return sidebar_xScale(countryCounts[d]);
         })
         .attr("y", function(d) {
            return bandScale(d.country);
            //return sidebar_h / 2 - sidebar_yScale(countryCounts[d]);
         })
         .attr("width",  function(d) {
                //sidebar_xScale.bandwidth())
            return xScale(d.count);
            //return bandScale(countryCounts[d]);
         })
         .attr("height", function(d) {
            //return sidebar_yScale(countryCounts[d]);
            return bandScale.bandwidth();
         })
         .attr("fill", "lightblue");
 };

  var rowUpdate = function(rowSelection) {
                        console.log("rowUpdate", rowSelection);
                  };
  var rowExit = function(rowSelection) {};

 var virtualScroller = d3.VirtualScroller()
            .rowHeight(bandScale.bandwidth())
            .enter(rowEnter)
            .update(rowUpdate)
            .exit(rowExit)
            .svg(sidebar)
            .totalRows(50)
            .viewport(d3.select(".viewport"))
            .data(pairs, function(d) { return d.country; });

  sidebar_chart.call(virtualScroller);

*/

}

function selected_gender_list() {

  if (selected_gender === "All")
    return ["Men", "Women"];
  else
    return [selected_gender];

}

function sportCountryCounts(sportList, medalSelection) {

  var countryCounts = {};
  var genders = selected_gender_list();
  var categories;
//  genders = ["Men", "Women"];


/*
  switch (genderSelection) {
    case genderCategory.ALL:
      genders = ["Men", "Women"];
      break;
    case genderCategory.MEN:
      genders = ["Men"];
      break;
    case genderCategory.WOMEN:
      genders = ["Women"];
      break;
    default:
      console.log("unknown gender");
  }
*/
  switch (medalSelection) {
    case medalCategory.ALL:
    case medalCategory.ALL_ADJ:
      categories = ["Gold", "Silver", "Bronze"]
      break;
    case medalCategory.GOLD:
      categories = ["Gold"];
      break;
    default:
      console.log("unknown medalCategory");
  }


//  console.log("selected this sport: ", node.data.data.id)
  var medalist, placement, gender, country;
  for (var i = 0; i < year_res[selected_year].length; i++) {
//    if (year_res[selected_year][i].parentId === node.data.data.id) {

    if (sportList.includes(year_res[selected_year][i].parentId)) {
      console.log("found an event: ", year_res[selected_year][i].id);

      for (var j = 0; j < year_res[selected_year][i].members.length; j++) {
        medalist = year_res[selected_year][i].members[j];
        placement = medalist.Medal;
        gender = medalist.Gender;
        country = medalist.NOC;
        if (genders.includes(gender) && categories.includes(placement)) {
          if (country in countryCounts) {
            countryCounts[country] += 1;
          }
          else {
            countryCounts[country] = 1;
          }
        }
      }
    }
  }



  pairs = Object.keys(countryCounts).map(function(key) {
            return {"country" : key, "count": countryCounts[key]};
  });

  pairs.sort(function(first, second) {
    return second.count - first.count;
  });

  console.log("pairs", pairs);

  return pairs;


//  return countryCounts;
}

function eventSidebar() {

/*

  The event sidebar is divided into three sections:

  (1) Title

  (2) Medalists

  (3) Controls


*/


  console.log("updateSidebar"); 
/*
  sidebar_background.selectAll("rect").remove();
  sidebar_chart.selectAll("rect").remove();
  sidebar_background.selectAll("text").remove();
  sidebar_chart.selectAll("text").remove();
  sidebar_background.selectAll("circle").remove(); 
*/

//  sidebar_background.selectAll("rect").remove();
//  sidebar_background.selectAll("text").remove();
// data = [selection];

//  console.log(selection);
// sidebar.selectAll("circles").remove();

  sorted_members = medalSort(current_selection.data.data.members, selected_gender);
  console.log(sorted_members);

  create_sidebar(true, sorted_members.length);

  sidebar_axis.style("visibility", "hidden");//remove();


  var sidebar_height = padding * 7 + Math.max(sidebar_h, 50 * sorted_members.length); 

  sidebar_background.append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", sidebar_w)
                    .attr("height", sidebar_height)
                    .attr("fill", "lightblue");
  sidebar_background
         .append("text")
         .attr("x", sidebar_w / 2)
         .attr("y", padding * 3)
         .attr("text-anchor", "middle")
         .attr("font-size", 24)
         .text(current_selection.data.data.id.toUpperCase());


/*
  sidebar_background.selectAll("rect")
//         .remove()
         .data(sorted_members)
         .enter()
         .append("rect")
         .attr("x", 0)
         .attr("y", function(d, i) { return i * (sidebar_h / sorted_members.length); })
         .attr("width", sidebar_w)
         .attr("height", sidebar_h / sorted_members.length)
         .attr("fill", "lightblue");
*/
/*
         .attr("fill", function(d) {
//          console.log("adding circle", d);
          return medalColourLookup(d.Medal);
         })
*/

//         .attr("stroke", "black")
//         .attr("stroke-width", 2)
//         .attr("opacity", 0.6);

//  var athlete_top = (1 / 8) * sidebar_h;
  var athlete_top = padding * 7;
//  var control_top = (4 / 5) * sidebar_h;

  var title_h = athlete_top;
  //var control_h = sidebar_h - control_top;

//  var athlete_h = sidebar_h - (title_h + control_h);

  sidebar_chart.selectAll("circle")
                    .data(sorted_members)
                    .enter()
                    .append("circle")
                    .attr("cx", padding)
                    .attr("cy", function(d, i) { 
                       //return athlete_top + i * (athlete_h / sorted_members.length) + 15;// + padding; 
                       return athlete_top + i * 50 + 15;
                    })
                    .attr("r", 8)
                    .attr("fill", function(d) {
                      return medalColourLookup(d.Medal);
                    })
                    .attr("opacity", 0.8);



 sidebar_chart.selectAll("text")
//        .remove()
        .data(sorted_members)
        .enter()
        .append("text")
//        .attr("x", 25)
//        .attr("y", 25)
        .attr("x", 5*padding)
        .attr("y", function(d, i) { 
            //return athlete_top + i * (athlete_h / sorted_members.length) + 20; })
            return athlete_top + i * 50 + 20;
        })
        .attr("text-anchor", "left")
//        .attr("stroke", "black")
//        .attr("stroke", "black")
        .text(function(d) { return d.Athlete; });


  sidebar_chart.selectAll("image")
          .data(sorted_members)
          .enter()
          .append("image")
          .attr("x", 2*padding)
          .attr("y", function(d, i) {
            // return athlete_top + i * (athlete_h / sorted_members.length) + 8; })
              return athlete_top + i * 50 + 8;
          })
          .attr("xlink:href", function(d) { 
          console.log("d.NOC: ", d.NOC);
          if (!(d.NOC in flag_lookup))
            console.log("unknown flag");
          else
           return "flags/" + flag_lookup[d.NOC].two_char.toLowerCase() + ".svg"; 
          })
//          .attr("width", 10)
          .attr("height", 15);//(sidebar_h / sorted_members.length) + 20);
//          .attr("width", 30);

  console.log("done update");




}

function medalSort(members, gender_selection) {
  var gold = [];
  var silver = [];
  var bronze = [];
  var other = [];

  if (gender_selection === "All")
    genders = ["Men", "Women"];
  else
    genders = [gender_selection];

  for (var i = 0; i < members.length; i++) {
    if (members[i].Medal === "Gold" && genders.includes(members[i].Gender))
      gold.push(members[i]);
    else if (members[i].Medal === "Silver" && genders.includes(members[i].Gender))
      silver.push(members[i]);
    else if (members[i].Medal === "Bronze" && genders.includes(members[i].Gender))
      bronze.push(members[i]);
    else
      console.log("excluded", members[i]);
  }

  return gold.concat(silver, bronze, other);

}


function medalColourLookup(medal) {

  if (medal === "Bronze")
    return "rgb(217, 95, 14)";
  else if (medal === "Silver")
    return "rgb(189, 189, 189)";
  else if (medal === "Gold")
    return "rgb(254, 196, 79)";
  else
    return "rgb(229, 245, 249)";


}

function zoomed() {
  g.attr("transform", d3.event.transform);
}

//function center() {
//  return d3.zoomIdentity
//        .scale(0.5);
//}
