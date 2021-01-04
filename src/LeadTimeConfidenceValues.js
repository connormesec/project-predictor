function LeadTimeConfidenceValues(props) {
const mean = (list) => list.reduce((a, b) => a + b) / list.length;

  return (
    <div>
      <h4>Historical Values</h4>
      <p>
        {props.data.leadtime.leadTimeLastEleven.map((o) => (
          <>{o},</>
        ))}
      </p>
      <p>Mean: {Math.round(props.data.leadtime.lastElevenData.mean * 100) / 100}</p>
      <p>Median: {Math.round(props.data.leadtime.lastElevenData.median * 100) / 100}</p>
      <p>Std Dev: {Math.round(props.data.leadtime.lastElevenData.sd * 100) / 100}</p>
      <h4>Random Values</h4>
      <p>Mean: {Math.round(props.data.leadtime.randLastElevenData.mean * 100) / 100}</p>
      <p>Median: {Math.round(props.data.leadtime.randLastElevenData.median * 100) / 100}</p>
      <p>Std Dev: {Math.round(props.data.leadtime.randLastElevenData.sd * 100) / 100}</p>
      <p>Mode: {props.data.leadtime.randLastElevenData.mode}</p>
    </div>
  );
}



export default LeadTimeConfidenceValues;
