var LIVETOUCHED = {
	under5F: "Under 5 F", under5M: "Under 5 M",
	betw5_12F: "5-12 F", betw5_12M: "5-12 M",
	betw13_19F: "13-19 F", betw13_19M: "13-19 M",
	betw20_25F: "20-25 F", betw20_25M: "20-25 M",
	adultF: "Adult F", adultM: "Adult M",
	commF: "Comm F", commM: "Comm M",
	girls: "Girls", boys: "Boys",
	children: "Children",
	Adu_care: "Adults - caregivers",
	Adu_comm: "Adults - community",
	total: "Total lives touched"
};

var SHELTER = {
	housing: "Housing",
	under5: "Housing Under 5",
	betw5_12: "Housing 5 to 12",
	betw13_19: "Housing 13 to 19",
	betw20_25: "Housing 20 to 25",
	adult: "Housing Adult",
	food: "Food",
	clothing: "Clothing",
	loan: "Loans to families"
};

var EDUCATION = {
	girls:"Girl's Education",
	boys:"Boy's Education",
	direct:"Direct Education",
	computer:"Computer Education",
	vocational:"Vocational Education",
	nursery:"Nursery Education",
	health:"Health Education",
	disabled:"Education for disabled",
	school:"Building Schools",
	training:"Teacher training",
	scholarship:"Scholarships",
	other:"Other"
}

var HEALTHCARE = {
	under5:"Nutrition/Food Under 5",
	betw5_12:"Nutrition/Food 5 to 12",
	betw13_19:"Nutrition/Food 13 to 19",
	betw20_25:"Nutrition/Food 20 to 25",
	adult:"Nutrition/Food Adult",
	supply:"Medical Supplies",
	service:"Medical Service",
	water:"Clean water",
	healthcare:"Healthcare"
}


var COUNTRY_DATA,
	SHELTER_DATA,
	EDUCATION_DATA,
	HEALTHCARE_DATA,
	NUM_DATASETS = 3,
	ACTIVE_IDX = 0,
	MOVEX = 0,
	MOVEY = 0,
	SCALEVALUE = 1,
	MAPWIDTH = 650,
	MAPHEIGHT = 400,
	US_ALIAS = "United States of America";


function showBarChart (country) {

	var dataset = getBarChartData(country, COUNTRY_DATA[country]),
		labels = ["Boys", "Girls", "Adults"],
		height = 350,
		width = 500,
		h = 300,
		w = 300;

	var margin = {
		left : 60,
		right : 20,
		top : 5,
		bottom : 20
	}

	var svg = d3.select("#data").append("svg")
				.attr("id", "barchart")
				.attr("height",height).attr("width",width);
				
	var yScale = d3.scale.linear().clamp(true)
				.domain([0, d3.max(dataset, 
					function(d) {return d;})]).range([h - margin.bottom, margin.top]);
		
	var barPadding = 30,
		barWidth = (w - margin.left) / dataset.length - barPadding;


	svg.selectAll("text").data(labels).enter()
		.append("text")
		.attr("x", function (d, i) {
			return margin.left + i * ((w - margin.left)/ dataset.length)
					+ barWidth / 2;
		})
		.attr("y", h + margin.bottom / 6)
		.attr("font-size", "14px")
		.attr("text-anchor", "middle")
		.text(function(d,i){
			return labels[i];
		});

	svg.selectAll("rect").data(dataset)
		.enter().append("rect").attr("height", 0).attr("y", h - margin.bottom)
		.attr("width", barWidth)
		.attr("x", function (d, i) {
			return margin.left + i * ((w - margin.left)/ dataset.length);
		})
		.attr("fill","teal")
		.transition()
		.duration(800)
		.attr("height", function(d){ return h - margin.bottom - yScale(d);})
		.attr("y", function(d) {
			console.log("scale(d): " + yScale(d));
			return yScale(d);
		});


	var yAxis = d3.svg.axis().scale(yScale).orient("right");
	svg.append("g").attr("class","axis").call(yAxis);
}


function getBarChartData(country, rows) {

	var d = [],
		fields = [LIVETOUCHED.boys, LIVETOUCHED.girls,
					LIVETOUCHED.Adu_care, LIVETOUCHED.Adu_comm];

	d.push(getSumOf(fields[0], rows));
	d.push(getSumOf(fields[1], rows));
	d.push(getSumOf(fields[2], rows) + getSumOf(fields[3], rows));

	return d;
}


// Get rows that includes the given field value
function getRowsBy(value, field, data){

	var rows = [];
	for (var i = 0; i < data.length; i++)
		if (data[i][field] == value)
			rows.push(data[i]);

	return (rows.length > 1)? rows : rows[0];
}


// Sum up all field values of the given rows
function getSumOf(field, rows){
	
	var sum = 0,
		tmp;

	for (var i = 0; i < rows.length; i++){
			tmp = rows[i][field];
			if (tmp)
				sum += parseInt(tmp);
		}
		
	return sum;
}


function showStackedBarChart (showdata, datatype){

	console.log("Displaying the stacked bar chart");
	//Width and height
	var margin = {
		left : 35,
		right : 20,
		top : 5,
		bottom : 20
	}

	var w = 500,
		h = 300,
		dataset = showdata,
		labels = ["Asia", "Africa", "Latin America"];

	//Set up stack method
	var stack = d3.layout.stack();

	//Data, stacked
	stack(dataset);

	//Set up scales
	var xScale = d3.scale.ordinal()
		.domain(d3.range(dataset[0].length))
		.rangeRoundBands([0 + margin.left, w / 2], 0.4);

	var yScale = d3.scale.linear()
		.domain([0,
			d3.max(dataset, function(d) {
				return d3.max(d, function(d) {
					return d.y0 + d.y;
				});
			})
		])
		.range([h - margin.bottom, 0]);

	//Easy colors accessible via a 10-step ordinal scale
	var colors = d3.scale.category20();

	//Create SVG element
	var svg = d3.select("#data")
		.append("svg")
		.attr("id", "stacked")
		.attr("width", w)
		.attr("height", h + margin.bottom);

	// Add a group for each row of data
	var groups = svg.selectAll("g")
		.data(dataset)
		.enter()
		.append("g")
		.style("fill", function(d, i) {
			return colors(i);
		});


	// Show labels
	svg.selectAll("text").data(labels).enter()
		.append("text")
		.attr("x", function (d, i){
			return xScale(i) + xScale.rangeBand() / 2;
		})
		.attr("y", h + margin.bottom / 9)
		.attr("text-anchor", "middle")
		.attr("font-size", function (d, i){
			if (d == "Latin America")
				return "11px";
			else
				return "12px";
		})
		.text(function(d, i){
				return labels[i];
		});


	// Add a rect for each data value
	groups.selectAll("rect")
		.data(function(d) { return d; })
		.enter()
		.append("rect")
		.attr("y", h - margin.bottom)
		.attr("x", function(d, i) {
			return xScale(i);
		})
		.attr("width", xScale.rangeBand())
		.transition().duration(800)
		.attr("y", function(d) {
			var y0 = yScale(d.y0);
			var y = yScale(d.y);

			if (y0 == h)
				return y;
			else
				return y + y0 - h

		})
		.attr("height", function(d) {
			return h - yScale(d.y);
		});


	// Axis
	var yAxis = d3.svg.axis().scale(yScale).orient("right");
	svg.append("g").attr("class","axis").call(yAxis);


	// Add Legends
	var legends = [];
	for (var field in datatype)
		legends.push(datatype[field]);

	for (var i = 0; i < legends.length; i++) {

		var initY = 20,
			yOffset = initY + i * 20;

		svg.append("rect").attr("x", w / 2)
			.attr("y", yOffset)
			.attr("width", 0)
			.transition()
			.duration(500)
			.attr("width", 10).attr("height", 10).attr("fill", colors(i));

		svg.append("text")
			.attr("x", w / 2 + 20)
			.attr("y", 24)
			.transition()
			.duration(600)
			.attr("y", yOffset)
			.attr("dy", ".71em")
			.attr("font-size", "12px")
			.style("text-anchor", "start")
			.text("")
			.transition()
			.duration(100)
			.text(legends[i]);

	}

}


function collectData(dataset, data) {

	var column = "Regions",
		asia = getRowsBy("Asia", column, data),
		africa  = getRowsBy("Africa",column, data),
		lAmerica = getRowsBy("Latin America", column, data),
		d = []

	var validate = function (data) {return (data)? parseInt(data) : 0;}
	console.log("Collecting data...");


	for (var field in dataset){

		var tmp = [],
			counter = 0,
			key = dataset[field];

		console.log("Asia(" + key + "): " + validate(asia[key]));

		tmp.push({x: counter++, y: validate(asia[key])});
		tmp.push({x: counter++, y: validate(africa[key])});
		tmp.push({x: counter++, y: validate(lAmerica[key])});

		d.push(tmp);
	}

	console.log("Collected.");

	return d;
}

function drawTitle(txt){

	d3.select("#dTitle").remove();

	d3.select("#svgTitle").append("text")
		.attr("id","dTitle")
		.attr("x", 155)
		.attr("y", 35)
		.attr("font-weight","bold")
		.attr("text-anchor","middle")
		.text(txt);
}


function drawDataSwitches (activeIdx){

	console.log("---- Called! -----");

	var labels = ["Education", "Shelter", "Healthcare"];
	var width = 300;
	var paddingLeft = 5;
	var paddingRight = 5;
	var left = 60;
	var offset = 10;


	var bar = function(i) {
		d3.select("#svgTitle")
			.append("circle")
			.attr("cx", function (){
				return ((width - paddingLeft - paddingRight) / 3) * (i + 1) - left;
			})
			.attr("cy", 32)
			.attr("r", 5)
			.attr("fill", "#DDDDDD")
			.attr("class", "switches")
			.style({
				"stroke":"black",
				"stroke-width":0.3,
				"cursor":"pointer"
			})
			.on("click", function(){
				d3.event.stopPropagation();
				switchStackBarChart(i)
			});


		d3.select("#svgTitle")
			.append("circle")
			.attr("cx", function (){
				return ((width - paddingLeft - paddingRight) / 3) * (i + 1) - left;
			})
			.attr("cy", 32)
			.attr("r", 3)
			.attr("fill", function(){
				return (i == activeIdx)? "black" : "#DDDDDD";
			})
			.attr("class", "switches")
			.style("cursor", "pointer")
			.on("click", function(){
				d3.event.stopPropagation();
				switchStackBarChart(i)
			})
			.attr("id", "button" + i);


		d3.select("#svgTitle")
			.append("text")
			.attr("x", function (){
				return ((width - paddingLeft - paddingRight) / 3) * (i + 1) - left + offset;
			})
			.attr("y", 36)
			.attr("font-size", "13px")
			.attr("class", "switches")
			.text(function (){
				return labels[i];
			})
	}

	for (var i = 0; i < labels.length; i++){
		bar(i);
	}
}


function switchStackBarChart (index){

	d3.select("#stacked").remove();

	var changeCircleColor = function(i){
		for (var j = 0; j < NUM_DATASETS; j++) {
			d3.select("#button" + j).attr("fill", function () {
				return (i == j)? "black" : "#DDDDDD";
			})
		}
	}

	ACTIVE_IDX = index;

	if (index == 0) {
		changeCircleColor(0);
		showStackedBarChart(EDUCATION_DATA, EDUCATION);
	}
	else if (index == 1) {
		changeCircleColor(1);
		showStackedBarChart(SHELTER_DATA, SHELTER);
	}
	else {
		changeCircleColor(2);
		showStackedBarChart(HEALTHCARE_DATA, HEALTHCARE);
	}
}


function createVis(error, geodata, sheet1, sheet2){

	d3.select("#vis_container").append("div").attr("id", "worldmap");
	d3.select("#worldmap").append("p").attr("id", "map_tooltip")
		.style({"position": "absolute", "display": "none"});
	d3.select("#vis_container").append("div").attr("id", "data_container");
	d3.select("#data_container").append("div").attr("id", "dataTitle");
	d3.select("#data_container").append("div").attr("id", "data");


	// Necessary Variables
	var width  = 650,
		height = 400,
		focusedCountry,
		color = d3.scale.category20(),
		projection = d3.geo.mercator().translate([325, 250]).scale([650]),
		path = d3.geo.path().projection(projection),
		svg = d3.select("#worldmap").append("svg")
			.attr("width", width).attr("height", height),
		g = svg.append("g");


	function zoomEvent(d) {

		var bounds = path.bounds(d),
			countryName = d.properties.sovereignt;


		console.log("Clicked");
		console.log(countryName);

		if (countryName == focusedCountry) {
			focusedCountry = undefined;
			return zoomOut();
		}
		else
			focusedCountry = countryName;

		var transVal,
			scaleVal = 5,
			offsetX = 0,
			offsetY = 0;

		var f = function (a, b, c, d) {
			return -(bounds[1][0] + bounds[0][1]) / a - b
				+ "," + -(bounds[1][1] + bounds[0][1] / c - d)
		}

		/* By default, some countries are not properly zoomed in.
			Here, adjust values manually to fix such behavior. */
		if (countryName == "Russia"){
			transVal = f(1.3, 35, 3, 25)
			offsetX = -192;
			offsetY = -57;
		} else if(countryName == "Canada") {
			transVal = f(2.2, 44, 3, 25);
			offsetX = 25;
			offsetY = -70;
		} else if(countryName == US_ALIAS){
			transVal = f(2.2, 20, 2, 60);
			offsetX = -22;
			offsetY = -50;
		} else if(countryName == "France") {
			transVal = f(2.1, 95, 2, 140);
			offsetX = -40;
			offsetY = 15;
		} else {
			transVal = -(bounds[1][0] + bounds[0][0]) / 2
			+ "," + -(bounds[1][1] + bounds[0][1]) / 2;
		}

		MOVEX = -(bounds[1][0] + bounds[0][0]) / 2 + offsetX + MAPWIDTH / 2;
		MOVEY = -(bounds[1][1] + bounds[0][1]) / 2 + offsetY + MAPHEIGHT / 2;

		g.transition().duration(800).attr("transform",
			"translate(" + projection.translate() + ")"
			+ "scale(" + scaleVal + ")" + "translate(" + transVal + ")");

		SCALEVALUE = scaleVal;
		console.log(countryName);
		d3.select("#stacked").remove();
		d3.select("#barchart").remove();
		d3.select("#nodata").remove();
		d3.selectAll(".switches").remove();
		drawTitle(countryName);

		if (countryName in COUNTRY_DATA)
			showBarChart(countryName);
		else
			showNoDataNotice(300, 500);
	}


	function zoomOut() {

		MOVEX = 0;
		MOVEY = 0;
		SCALEVALUE = 1;

		d3.select("#stacked").remove();
		d3.select("#barchart").remove();
		d3.select("#nodata").remove();
		d3.selectAll("text").remove();

		g.transition().duration(800).attr("transform", "scale(1)");
		drawDataSwitches(ACTIVE_IDX);
		switchStackBarChart(ACTIVE_IDX);
	}


	/***** Initialize data ******/
	var data = sheet1;
	var countries = {};
	for (var i in data) {
		var country = data[i].COUNTRY;
		countries[country] = [];
	}

	for (var j in data) {
		var country = data[j].COUNTRY;
		countries[country].push(data[j]);
	}

	COUNTRY_DATA = countries;
	console.log("Finished processing Sheet1");

	//Sheet2
	SHELTER_DATA = collectData(SHELTER, sheet2);
	EDUCATION_DATA = collectData(EDUCATION, sheet2);
	HEALTHCARE_DATA = collectData(HEALTHCARE, sheet2);

	showStackedBarChart(EDUCATION_DATA, EDUCATION);;


	// set up an svg to depict the title of the chart
	var h = 60,
		w = 320;

	d3.select("#dataTitle")
		.append("svg")
		.attr("id", "svgTitle")
		.attr("width", w)
		.attr("height", h);

	drawDataSwitches(ACTIVE_IDX);


	var country_alias = {
		"America":"United States of America",
		"United States":"United States of America",
		"The U.S.":"United States of America",
		"US":"United States of America",
		"U.S.":"United States of America",
		"Tanzania": "United Republic of Tanzania",
		"Timor Leste": "East Timor",
		"Burma": "Myanmar",
		"DRC": "Democratic Republic of the Congo",
		"Congo": "Democratic Republic of the Congo",
		"Tanzania": "United Republic of Tanzania"
	}

	var i = 0;

	g.selectAll("path").data(geodata.features).enter()
		.append("path").attr("d", path)
		.style({"stroke": "black",
				"stroke-width": "0.3",
				"fill": function (d) {
					var name = d.properties.sovereignt
					if (name in COUNTRY_DATA)
						return color(i++ % 20);
					else {
						for (alias in country_alias){
							if (country_alias[alias] == name &&
								alias in COUNTRY_DATA){

								if (name == "United States of America")
									US_ALIAS = alias;

								d.properties.sovereignt = alias;
								return color(i++ % 20);
							}
						}

						return "#dddddd";
					}
				}
		})
		.attr("class", "country")
		.on("click", zoomEvent)
		.on("mousemove", function (d) {
			var pos = d3.mouse(this),
				name = d.properties.sovereignt,
				data = COUNTRY_DATA[name];

			d3.select("#map_tooltip")
				.style({"display":"",
						"left": function(){
							var newX = ((pos[0] + MOVEX) - (MAPWIDTH / 2))
										* SCALEVALUE + (MAPWIDTH / 2) + 35;
							console.log("MouseX:" + newX);
							return newX + "px";
						},
						"top": function(){
							var newY = ((pos[1] + MOVEY) - (MAPHEIGHT / 2))
										* SCALEVALUE + (MAPHEIGHT / 2) - (70 / SCALEVALUE);
							console.log("MouseY:" + newY);
							return  newY + "px";
						},
						"font-size": "14px",
						"background": "#fff",
						"boarder-radius": "4px",
						"border-color": "black",
						"padding": "8px",
						"opacity": "0.9",
						"box-shadow": "0px 0px 2px 0px #a6a6a6"
				})
				.html(function(){
					if (data === undefined){
						return name;
					} else {
						var saved = getSumOf(LIVETOUCHED.children, data);
						if (saved)
							return "<b>" + name + "</b>" + "</br>"
									+ saved + " children are saved";
						else
							return "<b>" + name + "</b>" + "</br>"
									+ "Data is not available"
					}
				});

		})
		.on("mouseleave", function (d) {
			d3.select("#movtxt").style("display", "none");
		});
}


function showNoDataNotice(h, w){

	// height: 500, width 350
	d3.select("#data").append("svg")
		.attr("width", w).attr("height", h)
		.attr("id", "nodata");

	var width = 120,
		height = 60;

	d3.select("#nodata")
		.append("rect")
		.attr("x", w / 5.6)
		.attr("y", h / 5)
		.attr("width", width)
		.attr("height", height)
		.style({
			"fill":"white",
			"stroke":"black",
			"stroke-width":0.5,
			"opacity":0.5
		});

	d3.select("#nodata")
		.append("text")
		.attr("x", w / 4.4 )
		.attr("y", h / 3.12)
		.text("NO DATA");
}