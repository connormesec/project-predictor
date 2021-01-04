function MonteCarloConfidenceValues(props) {
  return (
    <div>
      <h4>Confidence Values</h4>
      <p>25%: {props.data.monte.confidence[0].value} days</p>
      <p>50%: {props.data.monte.confidence[1].value} days</p>
      <p>75%: {props.data.monte.confidence[2].value} days</p>
      <p>90%: {props.data.monte.confidence[3].value} days</p>
      <p>95%: {props.data.monte.confidence[4].value} days</p>
      <p>99%: {props.data.monte.confidence[5].value} days</p>
      <h4>Model Values</h4>
      <p>
        Mean:{" "}
        {Math.round(props.data.monte.finalDistributionValuies.mean * 100) / 100}
      </p>
      <p>
        Median:{" "}
        {Math.round(props.data.monte.finalDistributionValuies.median * 100) /
          100}
      </p>
      <p>
        Std Dev:{" "}
        {Math.round(props.data.monte.finalDistributionValuies.sd * 100) / 100}
      </p>
      <p>Mode: {props.data.monte.finalDistributionValuies.mode}</p>
      <p>
        Work in parallel value:{" "}
        {Math.round(props.data.monte.workInParrallelValue * 100) / 100}
      </p>
    </div>
  );
}
export default MonteCarloConfidenceValues;
