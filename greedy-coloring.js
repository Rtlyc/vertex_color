const width = 800;
const height = 600;
const radius = 20;

console.log("Greedy Coloring");

const graph = {
  nodes: [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }, { id: "E" }],
  links: [
    { source: "A", target: "B" },
    { source: "A", target: "C" },
    { source: "B", target: "C" },
    { source: "B", target: "D" },
    { source: "C", target: "D" },
    { source: "D", target: "E" },
  ],
};

const colorGraph = (graph) => {
  const colors = {};

  for (const node of graph.nodes) {
    const usedColors = new Set(
      graph.links
        .filter((link) => link.source === node.id || link.target === node.id)
        .map(
          (link) => colors[link.source === node.id ? link.target : link.source]
        )
    );

    for (let color = 1; color <= graph.nodes.length; color++) {
      if (!usedColors.has(color)) {
        colors[node.id] = color;
        break;
      }
    }
  }

  return colors;
};

const coloredGraph = colorGraph(graph);


const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const colorScale = d3
  .scaleOrdinal()
  .domain(graph.nodes.map((node) => node.id))
  .range(d3.schemeCategory10);

const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

graph.links.forEach((link) => {
  link.source = nodeById.get(link.source);
  link.target = nodeById.get(link.target);
});

const simulation = d3
  .forceSimulation(graph.nodes)
  .force("charge", d3.forceManyBody().strength(-400))
  .force("link", d3.forceLink(graph.links).distance(100))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .on("tick", ticked);

const link = svg
  .selectAll(".link")
  .data(graph.links)
  .enter()
  .append("line")
  .attr("class", "link")
  .attr("stroke", "black")
  .attr("stroke-width", 2);

const node = svg
  .selectAll(".node")
  .data(graph.nodes)
  .enter()
  .append("circle")
  .attr("class", "node")
  .attr("r", radius)
  .attr("fill", (d) => colorScale(coloredGraph[d.id]));

const label = svg
  .selectAll(".label")
  .data(graph.nodes)
  .enter()
  .append("text")
  .attr("class", "label")
  .text((d) => d.id)
  .attr("text-anchor", "middle")
  .attr("dy", ".35em")
  .style("pointer-events", "none")
  .style("user-select", "none")
  .style("font-size", "16px")
  .style("font-weight", "bold");

function ticked() {
  link
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

  label.attr("x", (d) => d.x).attr("y", (d) => d.y);
}

function updateNodeColors(colorMapping) {
  node.attr("fill", (d) =>
    colorMapping[d.id] ? colorScale(colorMapping[d.id]) : "lightgray"
  );
}


// Initially, set all nodes to gray
const uncoloredGraph = {};
for (const node of graph.nodes) {
  uncoloredGraph[node.id] = null;
}
updateNodeColors(uncoloredGraph);

// Add event listener to the button
const toggleColorButton = document.getElementById("toggleColor");
let isColored = false;
toggleColorButton.addEventListener("click", () => {
  if (isColored) {
    updateNodeColors(uncoloredGraph);
    toggleColorButton.textContent = "Color Graph";
  } else {
    updateNodeColors(coloredGraph);
    toggleColorButton.textContent = "Uncolor Graph";
  }
  isColored = !isColored;
});
