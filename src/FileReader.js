import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Chart from "./Chart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import IAM from "./TestData/IAM.json";
import CEREBRAL from "./TestData/CEREBRAL.json";
import Usability from "./TestData/UsabilityStudyFeedbackTFX.json";
import MarkAsCorrect from "./TestData/MarkAsCorrect.json";
import ResourceManagement from "./TestData/ResourceMangement.json";
import SSBlackline from "./TestData/SpreadSheetsBlackline.json";

// import { calculateMonteCarlo } from './montecarlo.js';

function FileReader(props) {
  const [csvFile, setCsvFile] = useState();
  const [data, setData] = useState();
  const [simulationDate, setSimulationDate] = useState(new Date());
  const [startDate, setStartDate] = useState();
  const [isChecked, setIsChecked] = useState(false);
  const [showComponent, setShowComponent] = useState(false);
  const [monteCarloResult, setMonteCarloResult] = useState();

  const handleChange = (event) => setCsvFile(event.target.files[0]);
  const toggleCheckboxChange = () => setIsChecked(!isChecked);
  const updateData = (result) => {
    setData(result.data);
    // setMonteCarloResult(calculateMonteCarlo(

    // ));
  };
  const importCSV = () =>
    Papa.parse(csvFile, {
      complete: updateData,
      header: true,
    });
  const onButtonClick = () => setShowComponent(true);
  
  if (!data) {
    return (
      <div>
        <h2>Import CSV File!</h2>
        <input
          className="csv-input"
          type="file"
          name="file"
          onChange={handleChange}
        />
        <p />
        <div>
          <DatePicker
            selected={simulationDate}
            onChange={(date) => setSimulationDate(date)}
            placeholderText="Today"
          />
        </div>
        <p />
        <div>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date (can be blank)"
          />
        </div>
        <p />
        <input
          type="checkbox"
          value="skewNormal"
          checked={isChecked}
          onChange={toggleCheckboxChange}
        />{" "}
        Use Skew-Normal
        <p />
        <button onClick={importCSV}>RUN!</button>
        <p />
        <div>
          <button onClick={onButtonClick}>Run Test</button>
          {showComponent && test(monteCarloResult)}
        </div>
      </div>
    );
  }

  // return (
  //   <div>
  //     <div className='importHeader'>
  //       <h2>Import CSV File!</h2>
  //       <input className='csv-input' type='file' name='file' onChange={handleChange} />
  //       <p />
  //       <div>
  //         <DatePickerToday />
  //       </div>
  //       <p />
  //       <div>
  //       <DatePicker
  //     selected={startDate}
  //     onChange={(date) => setStartDate(date)}
  //     placeholderText='Start Date (can be blank)'
  //   />
  //       </div>
  //       <p />
  //       <input type='checkbox' value='skewNormal' checked={isChecked} onChange={toggleCheckboxChange} /> Use Skew-Normal
  //       <p />
  //       <button onClick={importCSV}>RUN!</button>
  //     </div>
  //     <button
  //       className='button'
  //       // onClick={() => exportToJson(this.state, 'export')} TODO: Fix this
  //     >
  //       Download JSON
  //     </button>
  //     <p />
  //     <div>
  //       <Chart
  //       // data={this.state} TODO: Fix this
  //       />
  //     </div>
  //   </div>
  // );
}

function DatePickerToday(props) {
  const { startDate, setStartDate } = useState(new Date());
  console.log(startDate);
  return (
    <DatePicker
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      placeholderText="Today"
    />
  );
}

function DatePickerStartDate(props) {
  const { startDate, setStartDate } = props;

  return (
    <DatePicker
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      placeholderText="Start Date (can be blank)"
    />
  );
}

function exportToJson(exportObj, name) {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", name + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function test(monteCarloResult) {
  let jsonFileArray = [
    IAM,
    CEREBRAL,
    Usability,
    MarkAsCorrect,
    ResourceManagement,
    SSBlackline,
  ];
  const elements = jsonFileArray.map((jsonFile) => (
    <Chart data={jsonFile} monteCarloResult={monteCarloResult} />
  ));

  return (
    <table>
      <tr>
        <th colspan="2"></th>
        <th colspan="3">Three Tickets Done</th>
        <th colspan="3">Six Tickets Done</th>
        <th colspan="3">Eleven Tickets Done</th>
        <th colspan="3">25% Done</th>
        <th colspan="3">50% Done</th>
        <th colspan="3">75% Done</th>
      </tr>
      <tr>
        <th>Project</th>
        <th>Completion Date</th>
        <th>Today</th>
        <th>Normal</th>
        <th>Skew</th>
        <th>Today</th>
        <th>Normal</th>
        <th>Skew</th>
        <th>Today</th>
        <th>Normal</th>
        <th>Skew</th>
        <th>Today</th>
        <th>Normal</th>
        <th>Skew</th>
        <th>Today</th>
        <th>Normal</th>
        <th>Skew</th>
        <th>Today</th>
        <th>Normal</th>
        <th>Skew</th>
      </tr>
      {elements}
    </table>
  );
}

export default FileReader;
