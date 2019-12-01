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


var current_selection = null;

var width = 675;
var height = 625;

var sidebar_x = 675;
var sidebar_y = 0;
var sidebar_w = 300;
var sidebar_h = height;
var sidebar_created = false;
var button_r = 20;


var control_h = height;
var control_w = 335;

var year_list = [];
var year_res = {};
var year_sports = {};
var year_events = {};
var year_strat = {};
var year_city_map = {};


var pictogram_lookup = {};
var flag_lookup = {};

var zoom_g = d3.zoom();

var selected_year = 1896;


var selected_gender = "All";
var selected_medal = "Gold";


d3.csv("olympic_data.csv" + '?' + Math.floor(Math.random() * 1000)).then(function(data, error) {

  var results;
  if (error)
    console.log(error);
  else
    results = data;

  d3.csv("pictogram_lookup.csv" + '?' + Math.floor(Math.random() * 1000)).then(function(p_data, p_error) {
    if (p_error)
      console.log(p_error);
    else {
      p_data.forEach(function(d){
        pictogram_lookup[d.sport] = d.image;
      });
    }

    d3.csv("flag_lookup.csv" + '?' + Math.floor(Math.random() * 1000)).then(function(f_data, f_error) {
      if (f_error)
        console.log(f_error);
      else {
        console.log("found flag lookup");
        f_data.forEach(function(d) {
          if (d.three_char === "EUN")
            console.log("found EUN");
          flag_lookup[d.three_char] = { "full": d.full_name,
                                        "two_char": d.two_char };
        });
      }
    
    var year;
    var sport;
    var dEvent;
    for (var i = 0; i < results.length; i++) {

      year = results[i].Edition;
      sport = results[i].Sport;
      dEvent = results[i].Event;

      if (!(year in year_res)) {
        year_root = {id: year};
        year_res[year] = [];
        year_res[year].push(year_root);

        year_sports[year] = [];
        year_events[year] = {};

        year_city_map[year] = results[i].City;
      }


      if (!(sport + "_" + dEvent in year_events[year])) {

        year_events[year][sport + "_" + dEvent] = {id: dEvent,
                                     parentId: sport,
                                     members: []};
      }

      year_events[year][sport + "_" + dEvent].members.push(results[i]);

      if (!(year_sports[year].includes(sport))) {
        year_sports[year].push(sport);
        year_res[year].push({id: sport, parentId: year});

      }
     
    }
    
    for (var year of Object.keys(year_events)) {
      for (var dEvent of Object.keys(year_events[year])) {
        year_res[year].push(year_events[year][dEvent]);
      }
    }


    year_city_map[1916] = "No Games";
    year_city_map[1940] = "No Games";
    year_city_map[1944] = "No Games";

    for (var i = 0; i < Object.values(year_res).length; i++) {
      year_strat[Object.keys(year_res)[i]] = d3.stratify()(Object.values(year_res)[i]);
    }

    initPlot();

    });

  });
 
});

function initPlot() {

  svg = d3.select("#chart")
          .append("svg")
          .attr("viewBox", [0, 0, width, height])
          .attr("width", width)
          .attr("height",height)
          .attr("style", "background-color:rgb(47, 69, 69)");

  g = d3.select("#chart")
        .select("svg")
        .append("g")
        .attr("width", (width))
        .attr("height", (height))
        .attr("transform", "translate(" + width/2 + "," + height/2 + ")")
        .attr("cursor", "grab");

  g2 = d3.select("#chart")
                   .select("svg")
                   .append("g")
                   .attr("width", width)
                   .attr("height", height);

  var zoom = svg.call(zoom_g
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 2])
      .on("zoom", zoomed));

  zoom_g.scaleTo(svg, 0.6);
  zoom_g.translateTo(svg, -width/10 + padding * 3, -height/10 + padding * 3);

  control = d3.select("#control")
               .append("svg")
               .attr("width", control_w)
               .attr("height", control_h);

  control_background = d3.select("#control")
                         .select("svg")
                         .append("g");

  control_background
         .append("rect")
         .attr("class", "chart_bg")
         .attr("x", 0)
         .attr("y", 0)
         .attr("height", control_h)
         .attr("width", control_w)
         .attr("id", "background_rect");

  gender_buttons = d3.select("#control")
                      .select("svg")
                      .append("g")
                      .attr("id", "gender_buttons");

  medal_buttons = d3.select("#control")
                      .select("svg")
                      .append("g")
                      .attr("id", "medal_buttons");


  gender_buttons.selectAll("g.button")
                        .data(["All", "Men", "Women"])
                        .enter()
                        .append("g")
                        .attr("class", "button")
                        .style("cursor", "pointer")
                        .on("click", function(d, i) {
                          console.log("this", this);
                          prev_gender_selection.select("circle").attr("fill", "rgb(225, 255, 205)");
                          d3.select(this).select("circle").attr("fill", "rgb(155, 185, 135)");
                          prev_gender_selection = d3.select(this);
                          selected_gender = d;
                          drawPlot();
                          if (sidebar_created) {
                            node_update();
                          }
                        })
                        .attr("id", function(d) { return "#" + d + "_gender"; });

  var prev_gender_selection = d3.select("#All_gender");

  document.getElementById("#All_gender").dispatchEvent(new Event("click"));

  var button_w = control_w - (padding * 4);


  medal_buttons.selectAll("g.button")
                        .data(["Gold", "All", "All_Adjusted"])
                        .enter()
                        .append("g")
                        .attr("class", "button")
                        .style("cursor", "pointer")
                        .on("click", function(d, i) {
                          console.log("this", this);
                          prev_medal_selection.select("circle").attr("fill", "rgb(225, 255, 205)");
                          d3.select(this).select("circle").attr("fill", "rgb(155, 185, 135)");
                          prev_medal_selection = d3.select(this);
                          selected_medal = d;
                          drawPlot();
                          if (sidebar_created) {
                            node_update();
                          }
                        })
                        .attr("id", function(d) { return "#" + d + "_medal"; });

  var prev_medal_selection = d3.select("#Gold_medal");

  document.getElementById("#Gold_medal").dispatchEvent(new Event("click"));


  gender_buttons.selectAll("g.button")
                .append("circle")
                .attr("cx", function(d, i) {
                        return (padding * 2) + (i + 0.5) * (button_w / 3);
               })
               .attr("cy", control_h / 3)
               .attr("r", button_r)
               .attr("stroke", "black")
               .attr("stroke-width", 1)
               .attr("fill", "rgb(225, 255, 205)");
  

  prev_gender_selection.select("circle").attr("fill", "rgb(155, 185, 135)");


  medal_buttons.selectAll("g.button")
                .append("circle")
                .attr("cx", function(d, i) {
                        return (padding * 2) + (i + 0.5) * (button_w / 3);
               })
               .attr("cy", 2 * control_h / 3)
               .attr("r", button_r)
               .attr("stroke", "black")
               .attr("stroke-width", 1)
               .attr("fill", "rgb(225, 255, 205)");

  prev_medal_selection.select("circle").attr("fill", "rgb(155, 185, 135)");


  var gender_text = ["All", "Men", "Women"];

  gender_buttons.selectAll("g.button")
                    .append("text")
                    .attr("class", "button_text")
                    .attr("x", function(d, i) {
                        return (padding * 2) + (i + 0.5) * (button_w / 3);
                    })
                    .attr("y", (control_h / 3) + 3 * padding)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 16)

                    .text(function(d, i) {
                        console.log("gender_text[i]", gender_text[i]);
                        return gender_text[i];
                    });

  var medal_text = ["Gold", "All", "All Adjusted"];

  medal_buttons.selectAll("g.button")
                    .append("text")
                    .attr("class", "button_text")
                    .attr("x", function(d, i) {
                        return (padding * 2) + (i + 0.5) * (button_w / 3);
                    })
                    .attr("y", (2 * control_h / 3) + 3 * padding)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 16)

                    .text(function(d, i) {
                        return medal_text[i];
                    });

  var dataTime = d3.range(0, 2009-1896, 4).map(function(d) {
                    return new Date(1896 + d, 10, 3);
  });
  

  var sliderTime = d3.sliderBottom()
                     .min(d3.min(dataTime))
                     .max(d3.max(dataTime))
                     .step(4 * 1000 * 60 * 60 * 24 * 365)
                     .width(800)
                     .tickFormat(d3.timeFormat("%Y"))
                     .default(new Date(1896, 10, 3))
                     .tickValues(dataTime)
                     .on("onchange", val => {
                        if (!(parseInt(selected_year) === 1900 + val.getYear())) {
                          remove_sidebar();

                          zoom_g.scaleTo(svg, 0.6);
                          zoom_g.translateTo(svg, -width/10 + padding * 3, -height/10 + padding * 3);
                          
                          selected_year = Math.round(1900 + val.getYear());

                          d3.select("#control_title").text(year_city_map[selected_year] + ": " + selected_year);

                          drawPlot();
                          if (selected_year in year_res) {
                            yearSidebar(selected_year);
                          }
                          updateControlText();
                        }
                     });
  console.log("keys(year_res)", Object.keys(year_res));

  
  var gTime = d3.select("#slider-time")
                .append("svg")
                .attr("width", 860)
                .attr("height", 100)
                .append("g")
                .attr("transform", "translate(30, 30)")
                .attr("fill", "ghostwhite");

  gTime.call(sliderTime);

  drawPlot();
  yearSidebar(selected_year);
  updateControlText();

  control_background.append("line")
                    .attr("x1", 0)
                    .attr("y1", (1/3) * control_h - padding * 6)
                    .attr("x2", control_w)
                    .attr("y2", (1/3) * control_h - padding * 6)
                    .attr("stroke", "ghostwhite");

  control_background.append("line")
                    .attr("x1", 0)
                    .attr("y1", (2/3) * control_h - padding * 6)
                    .attr("x2", control_w)
                    .attr("y2", (2/3) * control_h - padding * 6)
                    .attr("stroke", "ghostwhite");


  control_background.append("line")
                    .attr("x1", 0)
                    .attr("y1", (3/3) * control_h - padding * 6)
                    .attr("x2", control_w)
                    .attr("y2", (3/3) * control_h - padding * 6)
                    .attr("stroke", "ghostwhite");
}

function updateControlText() {

  console.log("selected year", selected_year);
  control_background.selectAll("text").remove();

  /* Control title text */  
  control_background
         .append("text")
         .attr("class", "chart_title")
         .attr("x", sidebar_w / 2)
         .attr("y", padding * 3)
         .attr("text-anchor", "middle")
         .text(year_city_map[selected_year] + ": " + selected_year)
         .call(wrap, control_w, control_w / 2)
         .attr("id", "#control_title");

  control_background
         .append("text")
         .attr("class", "chart_title")
         .attr("x", control_w / 2)
         .attr("y", (1/3) * control_h - padding * 3)
         .attr("text-anchor", "middle")
         .text("Gender Category")
         .call(wrap, control_w, control_w / 2)

  control_background
         .append("text")
         .attr("class", "chart_title")
         .attr("x", control_w / 2)
         .attr("y", (2/3) * control_h - padding * 3)
         .attr("text-anchor", "middle")
         .text("Medal Category")
         .call(wrap, control_w, control_w / 2)

}


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

    g2.append("text")
      .attr("class", "chart_title")
      .attr("x", width/2)
      .attr("y", height/2)
      .attr("text-anchor", "middle")
      .text(message);

  }

  else {

    var data = year_strat[selected_year];
    var layout = d3.cluster().size([2 * Math.PI, (Math.sqrt(year_res[selected_year].length) * 50) - 10.1]);

    var root = d3.hierarchy(data);
    var nodes = root.descendants();
    var links = layout(root).links();


    var zoom_k = (Math.sqrt(year_res[selected_year].length) * 100) - 10.1;

    zoom_g.translateExtent([[-zoom_k, -zoom_k], 
                            [zoom_k, zoom_k]]);

    sportNodes = [];
    eventNodes = [];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].data.data.parentId in year_strat)
        sportNodes.push(nodes[i]);
      else if (year_sports[selected_year].includes(nodes[i].data.data.parentId))
        eventNodes.push(nodes[i]);
      else if (current_selection == null)
        current_selection = nodes[i];
    }

    g.selectAll("path")
     .data(links)
     .enter()
     .append("path")
     .attr("class", "branch")
     .attr("d", d3.linkRadial()
                  .angle(function(d) { return d.x; })
                  .radius(function(d) { return d.y; }))
     .attr("fill", "none")
     .attr("stroke", "black")
     .attr("stroke-width", 2)
     .attr("opacity", function(d) {

        if (year_sports[selected_year].includes(d.source.data.id)) {
          for (var i = 0; i < d.target.data.data.members.length; i++) {
            if (selected_gender_list().includes(d.target.data.data.members[i].Gender))
              return 0.6;
          }
          return 0;
        }
        return 0.6;

      });

    g.selectAll("circle")
     .data(nodes)
     .enter()
     .append("circle")
     .attr("transform", function(d) { return "translate(" + d3.pointRadial(d.x, d.y) + ")"; })
     .attr("r", function(d) {
      if (d.data.data.parentId in year_strat)
        return 20;
      else
        return 10;
     })
     .attr("class", function(d) {
      if (d.data.data.parentId in year_strat)
        return "green";
      else
        return "blue";
      })
     .attr("opacity", function(d) {

        if (year_sports[selected_year].includes(d.data.data.parentId)) {
          for (var i = 0; i < d.data.data.members.length; i++) {
            if (selected_gender_list().includes(d.data.data.members[i].Gender))
              return 1;
          }
          return 0;
        }
        return 1;
      })
      .on("click", function(d) {
        current_selection = d;
        node_update();
      })
      .attr("cursor", "pointer"); 

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
        node_update();
      })
      .attr("cursor", "pointer");

    console.log("nodes", nodes);
    g.selectAll("text")
     .data(eventNodes)
     .enter()
     .append("text")
     .attr("class", "chart_text")
     .attr("x", 10)
     .attr("dy", ".35em")
     .attr("transform", function(d) { 
        var initial_rotate = (d.x * (180/Math.PI) - 90 );
        var initial_translate = d.y;
        if (initial_rotate < 90 || initial_rotate > 270) 
          return "rotate(" + initial_rotate + ")translate(" + (initial_translate + 10) + ")";
        else
          return "rotate(" + (initial_rotate + 180) + ")translate(" + (-initial_translate + -30) + ")"; })

     .attr("text-anchor", function(d) { 
        if (((d.x * (180/Math.PI) - 90 ) >= 90) && (d.x * (180/Math.PI) - 90 ) <= 270) 
          return "end";
        else
          return "start";    
      })
     .text(function(d) { 
        for (var i = 0; i < d.data.data.members.length; i++) {
          if (selected_gender_list().includes(d.data.data.members[i].Gender))
            return d.data.id.capitalize(); 
        }
        return ""; 
    })
  }
}

function remove_sidebar() {
  sidebar_created = false;
  sidebar.remove();

}

function node_update() {

  remove_sidebar();
  if (current_selection.data.data.id in year_res) {
    yearSidebar(current_selection.data.data.id);
  }
  else if (current_selection.data.data.parentId in year_res) {
    sportSidebar();
  }
  else {
    eventSidebar();
  }
}

function yearSidebar(year) {

  var sportList = [];
  for (var i = 0; i < sportNodes.length; i++) {
    sportList.push(sportNodes[i].data.data.id);
  }
  var pairs = sportCountryCounts(sportList);

  drawBars(year + ": Overall Results", pairs);

}

function sportSidebar() {
  var pairs = sportCountryCounts([current_selection.data.data.id]);

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
              .attr("width", sidebar_w)
              .attr("height", sidebar_height);

  sidebar_background = d3.select("#sidebar")
              .select("svg")
              .append("g");

  sidebar_chart = d3.select("#sidebar")
              .select("svg")
              .append("g");

  
  sidebar_axis = d3.select("#sidebar")
         .select("svg")
         .append("g")
         .attr("transform", "translate(" + padding + "," + (6 * padding) + ")");


}


function drawBars(title, pairs) {

  create_sidebar(false, pairs.length);

  var countries = [];
  for (var i = 0; i < pairs.length; i++) {
    countries.push(pairs[i].country);
  }

  var sidebar_top = padding * 3;

  var bandScale = d3.scaleBand()
                    .domain(countries)
                    .range([sidebar_top + padding * 4, sidebar_top + padding * 4 + countries.length * 20])
                    .paddingInner(0.05);

  var xScale = d3.scaleLinear()
                     .domain([0, d3.max(pairs, function(d) { return d.count; })])
                     .range([2 * padding, sidebar_w - 2 * padding]);

  var xAxis = d3.axisTop(xScale)
                .ticks(Math.min(8, d3.max(pairs, function(d) { return d.count; })));

  sidebar_axis.call(xAxis);
  sidebar_axis.style("visibility", "visible");

  sidebar_background
         .append("rect")
         .attr("class", "chart_bg")
         .attr("x", 0)
         .attr("y", 0)
         .attr("height", sidebar_height)
         .attr("width", sidebar_w)
         .attr("id", "background_rect");

  sidebar_background
         .append("text")
         .attr("class", "chart_title")
         .attr("x", sidebar_w / 2)
         .attr("y", padding * 3)
         .attr("text-anchor", "middle")
         .text(title);

  sidebar_chart
         .selectAll("text")
         .data(pairs)
         .enter()
         .append("text")
         .attr("class", "chart_text")
         .attr("x", function(d, i) {
            return padding / 2;
         })
         .attr("y", function(d) {
            return bandScale(d.country) + 15;
         })
         .attr("text-anchor", "start")
         .text(function(d) { return d.country; })

         .style("cursor", "default")

         .on("mouseover", function(d, i) {
              var dx = padding + 5;
              var dy = bandScale(d.country);
              console.log("dx", dx);
              console.log("dy", dy);

            sidebar_chart.append("text")
                         .attr("x", dx + 30)
                         .attr("y", dy + bandScale.bandwidth())
                         .attr("id", "t-bar-text-1-" + i)
                         .text(function() {
                            return flag_lookup[d.country].full;
                         });

            sidebar_chart.append("rect")
                .attr("x", dx + 30)
                .attr("y", dy)
                .attr("id", "t-bar-rect-1-" + i)
                .attr("width", function() {
                    return d3.select("#t-bar-text-1-" + i).node().getComputedTextLength();

                })
                .attr("height", function() {
                    return bandScale.bandwidth();
                })
                .attr("fill", "beige");

            sidebar_chart.append("text")
                         .attr("id", "t-bar-text-2-" + i)
                         .attr("x", dx + 30)
                         .attr("y", dy + bandScale.bandwidth() - 3)
                         .text(function() {
                            return flag_lookup[d.country].full;
                         });
          })
          .on("mouseout", function(d, i) {

            d3.select("#t-bar-text-1-" + i).remove();
            d3.select("#t-bar-text-2-" + i).remove();
            d3.select("#t-bar-rect-1-" + i).remove();

          });

  sidebar_chart
         .selectAll("rect")
         .data(pairs)
         .enter()
         .append("rect")
         .attr("x", function(d, i) {
            return 3 * padding;
         })
         .attr("y", function(d) {
            return bandScale(d.country);
         })
         .attr("width",  function(d) {
            return xScale(d.count) - 2 * padding;
         })
         .attr("height", function(d) {
            return bandScale.bandwidth();
         })
         .attr("class", "blue");
}

function selected_gender_list() {

  if (selected_gender === "All")
    return ["Men", "Women"];
  else
    return [selected_gender];

}


function selected_medal_list() {

  if (selected_medal === "All" || selected_medal === "All_Adjusted")
    return ["Gold", "Silver", "Bronze"];
  else
    return [selected_medal];

}



function sportCountryCounts(sportList) {

  var countryCounts = {};
  var genders = selected_gender_list();
  var medals = selected_medal_list();
  var categories;
  var medalist, placement, gender, country;
  var incr = {};
  if (selected_medal === "All_Adjusted") {
    incr["Gold"] = 1;
    incr["Silver"] = 2/3;
    incr["Bronze"] = 1/3;
  }
  else {
    incr["Gold"] = 1;
    incr["Silver"] = 1;
    incr["Bronze"] = 1;
  }


  for (var i = 0; i < year_res[selected_year].length; i++) {

    if (sportList.includes(year_res[selected_year][i].parentId)) {

      for (var j = 0; j < year_res[selected_year][i].members.length; j++) {
        medalist = year_res[selected_year][i].members[j];
        placement = medalist.Medal;
        gender = medalist.Gender;
        country = medalist.NOC;
        if (genders.includes(gender) && medals.includes(placement)) {
          if (country in countryCounts) {
            countryCounts[country] += incr[placement];
          }
          else {
            countryCounts[country] = incr[placement];
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

  return pairs;


}

function eventSidebar() {

  sorted_members = medalSort(current_selection.data.data.members, selected_gender);

  console.log(sorted_members);

  create_sidebar(true, sorted_members.length);

  sidebar_axis.style("visibility", "hidden");


  var sidebar_height = padding * 7 + Math.max(sidebar_h, 50 * sorted_members.length); 

  sidebar_background.append("rect")
                    .attr("class", "chart_bg")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", sidebar_w)
                    .attr("height", sidebar_height);


  sidebar_background.append("text")
                    .attr("class", "chart_title")
                    .attr("x", sidebar_w / 2)
                    .attr("y", padding * 3)
                    .attr("text-anchor", "middle")
                    .text(current_selection.data.data.id.capitalize())
                    .call(wrap, sidebar_w, sidebar_w / 2);


  var athlete_top = padding * 7;
  var title_h = athlete_top;

  sidebar_chart.selectAll("circle")
               .data(sorted_members)
               .enter()
               .append("circle")
               .attr("cx", padding)
               .attr("cy", function(d, i) { 
                  return athlete_top + i * 50 + 15;
               })
               .attr("r", 8)
               .attr("fill", function(d) {
                  return medalColourLookup(d.Medal);
               })
               .attr("opacity", 0.8);


  sidebar_chart.selectAll("text")
        .data(sorted_members)
        .enter()
        .append("text")
        .attr("class", "chart_text")
        .attr("x", 5*padding)
        .attr("y", function(d, i) { 
            return athlete_top + i * 50 + 20;
        })
        .attr("text-anchor", "left")
        .text(function(d) { return d.Athlete; })
        .call(wrap, sidebar_w - 5 * padding, 5 * padding);


  sidebar_chart.selectAll("image")
          .data(sorted_members)
          .enter()
          .append("image")
          .attr("x", 2*padding)
          .attr("y", function(d, i) {
              return athlete_top + i * 50 + 8;
          })
          .attr("xlink:href", function(d) { 
          console.log("d.NOC: ", d.NOC);
          if (!(d.NOC in flag_lookup))
            console.log("unknown flag");
          else
           return "flags/" + flag_lookup[d.NOC].two_char.toLowerCase() + ".svg"; 
          })
          .attr("height", 15);

}


function wrap(text, width, x) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = 0,
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

    console.log("dy", dy);
    console.log("tspan1", tspan);
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      console.log("tspan", tspan);
      }
    }
  });
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

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};
