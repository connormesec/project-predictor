function WorkAddedConfidenceValues(props) {
  return (
    <div>
      <h4>Work Added</h4>
      <h4>Historical Values</h4>
      <p>Mean: {Math.round(props.data.workAdded.workAdded.mean * 100) / 100}</p>
      <p>
        Median: {Math.round(props.data.workAdded.workAdded.median * 100) / 100}
      </p>
      <p>
        Std Dev: {Math.round(props.data.workAdded.workAdded.sd * 100) / 100}
      </p>
      <p>Mode: {props.data.workAdded.workAdded.mode}</p>
      <h3>Random Values</h3>
      <p>
        Mean: {Math.round(props.data.workAdded.randWorkAdded.mean * 100) / 100}
      </p>
      <p>
        Median:{" "}
        {Math.round(props.data.workAdded.randWorkAdded.median * 100) / 100}
      </p>
      <p>
        Std Dev: {Math.round(props.data.workAdded.randWorkAdded.sd * 100) / 100}
      </p>
      <p>Mode: {props.data.workAdded.randWorkAdded.mode}</p>
    </div>
  );
}

export default WorkAddedConfidenceValues;
