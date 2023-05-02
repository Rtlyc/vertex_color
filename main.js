//! Constants
const width = 800;
const height = 600;
const radius = 20;

console.log("Greedy Coloring");

//! Graph data
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

//! Greedy coloring algorithm
const colorGraph = (graph) => {
  const steps = [];
  const colors = {};

  for (const node of graph.nodes) {
    const usedColors = new Set(
      graph.links
        .filter(
          (link) => link.source.id === node.id || link.target.id === node.id
        )
        .map(
          (link) =>
            colors[link.source.id === node.id ? link.target.id : link.source.id]
        )
    );

    for (let color = 1; color <= graph.nodes.length; color++) {
      if (!usedColors.has(color)) {
        colors[node.id] = color;
        steps.push({ ...colors });
        break;
      }
    }
  }

  return steps;
};

//! DSatur algorithm
const colorGraphDSatur = (graph) => {
  const steps = [];
  const colors = {};
  const saturation = {};
  const degrees = {};

  for (const node of graph.nodes) {
    saturation[node.id] = 0;
    degrees[node.id] = graph.links.filter(
      (link) => link.source.id === node.id || link.target.id === node.id
    ).length;
  }

  while (Object.keys(colors).length < graph.nodes.length) {
    const uncoloredNodes = graph.nodes.filter((node) => !colors[node.id]);
    uncoloredNodes.sort(
      (a, b) =>
        saturation[b.id] - saturation[a.id] || degrees[b.id] - degrees[a.id]
    );
    const node = uncoloredNodes[0];

    const usedColors = new Set(
      graph.links
        .filter(
          (link) => link.source.id === node.id || link.target.id === node.id
        )
        .map(
          (link) =>
            colors[link.source.id === node.id ? link.target.id : link.source.id]
        )
    );

    let color;
    for (color = 1; color <= graph.nodes.length; color++) {
      if (!usedColors.has(color)) {
        break;
      }
    }
    colors[node.id] = color;
    steps.push({ ...colors });

    for (const link of graph.links) {
      if (link.source.id === node.id || link.target.id === node.id) {
        const neighborId =
          link.source.id === node.id ? link.target.id : link.source.id;
        if (!colors[neighborId]) {
          saturation[neighborId]++;
        }
      }
    }
  }

  return steps;
};

//! Visualization setup
const svg = d3
  .select("#visualization")
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

//! Create links
const link = svg
  .selectAll(".link")
  .data(graph.links)
  .enter()
  .append("line")
  .attr("class", "link")
  .attr("stroke", "black")
  .attr("stroke-width", 2);

//! Create nodes
const node = svg
  .selectAll(".node")
  .data(graph.nodes)
  .enter()
  .append("circle")
  .attr("class", "node")
  .attr("r", radius)
  .call(drag(simulation));

//! Create labels
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

//! Update positions on tick
function ticked() {
  link
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

  label.attr("x", (d) => d.x).attr("y", (d) => d.y);
}

//! Drag behavior for nodes
function drag(simulation) {
  function dragStarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragEnded(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragStarted)
    .on("drag", dragged)
    .on("end", dragEnded);
}

//! Algorithm selection
const algorithmExplanations = {
  greedy:
    "The Greedy coloring algorithm is a simple and intuitive approach to vertex coloring. The algorithm iterates through the vertices of a graph, assigning the lowest available color to each vertex. The time complexity of this algorithm is O(n^2), where n is the number of vertices in the graph.",
  dsatur:
    "The DSatur (Degree of Saturation) algorithm is an improved vertex coloring algorithm that takes into account the saturation of vertices. The saturation of a vertex is the number of differently colored vertices adjacent to it. The algorithm iterates through the uncolored vertices with the highest saturation, breaking ties by choosing the vertex with the highest degree. The time complexity of this algorithm is O(n^2 + m), where n is the number of vertices and m is the number of edges in the graph.",
};

const algorithmSelect = document.getElementById("algorithm");

function updateAlgorithmExplanation() {
  const selectedAlgorithm = algorithmSelect.value;
  const explanation = algorithmExplanations[selectedAlgorithm];
  document.getElementById("algorithm-explanation").textContent = explanation;
}

// Update the algorithm explanation when the page is initially loaded
updateAlgorithmExplanation();

algorithmSelect.addEventListener("change", () => {
  const selectedAlgorithm = algorithmSelect.value;
  if (selectedAlgorithm === "greedy") {
    coloringSteps = colorGraph(graph);
  } else if (selectedAlgorithm === "dsatur") {
    coloringSteps = colorGraphDSatur(graph);
  }
  // Reset step index and uncolor the graph
  currentStep = -1;
  updateNodeColors(uncoloredGraph);
  backwardButton.disabled = true;
  forwardButton.disabled = false;

  // Update the algorithm explanation
  updateAlgorithmExplanation();
});

let coloringSteps = colorGraph(graph);

//! Set initial node colors
const uncoloredGraph = {};
for (const node of graph.nodes) {
  uncoloredGraph[node.id] = null;
}
updateNodeColors(uncoloredGraph);

// Set initial step index
let currentStep = -1;

//! Add event listeners for navigation buttons
const backwardButton = document.getElementById("backward");
const forwardButton = document.getElementById("forward");

backwardButton.addEventListener("click", () => {
  if (currentStep > 0) {
    currentStep--;
    updateNodeColors(coloringSteps[currentStep]);
  }
  backwardButton.disabled = currentStep === 0;
  forwardButton.disabled = false;
});

forwardButton.addEventListener("click", () => {
  if (currentStep < coloringSteps.length - 1) {
    currentStep++;
    updateNodeColors(coloringSteps[currentStep]);
  }
  forwardButton.disabled = currentStep === coloringSteps.length - 1;
  backwardButton.disabled = false;
});

//! Function to update node colors
function updateNodeColors(colorMapping) {
  node.attr("fill", (d) =>
    colorMapping[d.id] ? colorScale(colorMapping[d.id]) : "lightgray"
  );
}
