const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

fetch(url)
  .then(res => res.json())
  .then(data => {
    const baseTemp = data.baseTemperature;
    const dataset = data.monthlyVariance;

    const margin = { top: 60, right: 20, bottom: 100, left: 80 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#heatmap")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const years = dataset.map(d => d.year);
    const months = dataset.map(d => d.month);

    const xScale = d3.scaleBand()
      .domain([...new Set(years)])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(d3.range(1, 13))
      .range([0, height]);

    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter(year => year % 10 === 0))
      .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(month => d3.timeFormat("%B")(new Date(0, month - 1)));

    chart.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    chart.append("g")
      .attr("id", "y-axis")
      .call(yAxis);

    const temps = dataset.map(d => baseTemp + d.variance);
    const colorScale = d3.scaleThreshold()
      .domain([2.8, 4, 5, 6, 7, 8, 9, 10, 11])
      .range(d3.schemeRdYlBu[9].reverse());

    chart.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemp + d.variance)
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(baseTemp + d.variance))
      .on("mouseover", (event, d) => {
        const tooltip = d3.select("#tooltip");
        tooltip
          .style("opacity", 0.9)
          .attr("data-year", d.year)
          .html(`${d.year} - ${d3.timeFormat("%B")(new Date(0, d.month - 1))}<br>
                 Temp: ${(baseTemp + d.variance).toFixed(2)}℃<br>
                 Variance: ${d.variance.toFixed(2)}℃`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    // Legend
    const legendWidth = 400;
    const legendHeight = 30;

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${width / 2 - legendWidth / 2 + margin.left}, ${height + margin.top + 40})`);

    const legendScale = d3.scaleLinear()
      .domain(d3.extent(temps))
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .tickValues(colorScale.domain())
      .tickFormat(d3.format(".1f"));

    legend.selectAll("rect")
      .data(colorScale.range().map(color => {
        const d = colorScale.invertExtent(color);
        return d;
      }))
      .enter()
      .append("rect")
      .attr("x", d => legendScale(d[0]))
      .attr("y", 0)
      .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
      .attr("height", legendHeight)
      .style("fill", d => colorScale(d[0]));

    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  });
