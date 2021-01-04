import Plot from 'react-plotly.js';


function LeadTimeRandomFrequencyDiagram(props) {
  return (
    <Plot
      data={[
        //backlog
        {
          x: props.data.leadtime.randLeadTimeData,
          type: "histogram",
          histnorm: "probability",
          marker: {
            color: "rgb(255,255,100)",
          },
        },
      ]}
      layout={{title: "Lead Time Frequency Diagram" }}
      config = {{responsive: true}}
    />
  );
}

export default LeadTimeRandomFrequencyDiagram;
