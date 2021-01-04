import Plot from "react-plotly.js";

function CumulativeFlowDiagram(props) {
  console.log(props);
  return (
    <Plot
      data={[
        //backlog
        {
          x: props.data.plotData.map((o) => o.days),
          y: props.data.plotData.map((o) => o.backlog),
          name: "Backlog",
          type: "scatter",
          mode: "lines",
          marker: { color: "orange" },
        },
        //work done
        {
          x: props.data.plotData.map((o) => o.days),
          y: props.data.plotData.map((o) => o.workDone),
          name: "Work Done",
          type: "scatter",
          mode: "lines",
          marker: { color: "blue" },
        },
        {
          x: props.data.plotData.map((o) => o.days),
          y: props.data.plotData.map((o) => o.workIncrease),
          name: "Backlog Increase",
          type: "scatter",
          mode: "lines",
          marker: { color: "pink" },
        },
        {
          x: props.data.plotData.map((o) => o.days),
          y: props.data.plotData.map((o) => o.worstCase),
          name: "99% Confidence",
          type: "scatter",
          mode: "lines",
          marker: { color: "red" },
        },
        {
          x: props.data.plotData.map((o) => o.days),
          y: props.data.plotData.map((o) => o.confidence95),
          name: "95% Confidence",
          type: "scatter",
          mode: "lines",
          marker: { color: "#FF4E11" },
        },
        {
          x: props.data.plotData.map((o) => o.days),
          y: props.data.plotData.map((o) => o.confidence90),
          name: "90% Confidence",
          type: "scatter",
          mode: "lines",
          marker: { color: "#FF8E15" },
        },
        {
          x: props.data.plotData.map((o) => o.days),
          y: props.data.plotData.map((o) => o.confidence75),
          name: "75% Confidence",
          type: "scatter",
          mode: "lines",
          marker: { color: "#FAB733" },
        },
        {
          x: props.data.plotData.map((o) => o.days),
          y: props.data.plotData.map((o) => o.confidence50),
          name: "50% Confidence",
          type: "scatter",
          mode: "lines",
          marker: { color: "#69B34C" },
        },
        {
          x: props.data.plotData.map((o) => o.days),
          y: props.data.plotData.map((o) => o.confidence25),
          name: "25% Confidence",
          type: "scatter",
          mode: "lines",
          marker: { color: "#ACB334" },
        },
      ]}
      layout={{ title: "Cumulative Flow Diagram" }}
      config={{ responsive: true }}
    />
  );
}
export default CumulativeFlowDiagram;
