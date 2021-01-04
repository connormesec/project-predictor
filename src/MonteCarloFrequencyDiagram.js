import Plot from "react-plotly.js";

function MonteCarloFrequenctDiagram(props) {
 return (
    <Plot
    data={[
        //monteCarlo
        {
            x: props.data.monte.daysToCompletionArray,
            type: 'histogram',
            histnorm: 'probability',
            marker: {
                color: 'rgb(255,100,100)',
            },
        },
    ]}
    layout={{ title: 'Monte Carlo', xaxis: { range: [0, Math.max(props.data.monte.daysToCompletionArray)] } }}
    config = {{responsive: true}}
/>
 )
}
export default MonteCarloFrequenctDiagram;