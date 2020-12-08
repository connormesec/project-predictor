import React, { useState } from "react";
import Papa from 'papaparse';
import Chart from './Chart';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import IAM from './TestData/IAM.json';
import CEREBRAL from './TestData/CEREBRAL.json'

var today = new Date();
var dpStartDate = undefined;
class FileReader extends React.Component {
  constructor() {
    super();
    this.state = {
      csvfile: undefined,
      data: undefined,
      today: today,
      startDate: dpStartDate,
      isChecked: false,
      //for the test
      isTest: false,
      completionDate: new Date('12/2/2020'),
      showComponent: false,
    };
    this.updateData = this.updateData.bind(this);
    this._onButtonClick = this._onButtonClick.bind(this);
  }

  handleChange = event => {
    this.setState({
      csvfile: event.target.files[0]
    });
  };

  importCSV = () => {
    const { csvfile } = this.state;
    Papa.parse(csvfile, {
      complete: this.updateData,
      header: true
    });
  };

  updateData(result) {
    var data = result.data;
    this.setState({
      data: data,
      today: today,
      startDate: dpStartDate
    });
  }

  _onButtonClick() {
    this.setState({
      showComponent: true,
    });
  }

  toggleCheckboxChange = () => {
    this.setState(({ isChecked }) => (
      {
        isChecked: !isChecked,
      }
    ));
  }

  render() {
    const { isChecked } = this.state;
    console.log(this.state.csvfile);
    console.log(this.state);
    if (!this.state.data) {
      return (
        <div>
          <h2>Import CSV File!</h2>
          <input
            className="csv-input"
            type="file"
            ref={input => {
              this.filesInput = input;
            }}
            name="file"
            placeholder={null}
            onChange={this.handleChange}
          />
          <p />
          <div><DatePickerToday /></div>
          <p />
          <div><DatePickerStartDate /></div>
          <p />
          <input
            type="checkbox"
            value="skewNormal"
            checked={isChecked}
            onChange={this.toggleCheckboxChange}
          /> Use Skew-Normal
          <p />
          <button onClick={this.importCSV}>RUN!</button>
          <p />
          <div>
          <button onClick={this._onButtonClick}>Run Test</button>
          {this.state.showComponent ?
           test() : null}
      </div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="importHeader">
            <h2>Import CSV File!</h2>
            <input
              className="csv-input"
              type="file"
              ref={input => {
                this.filesInput = input;
              }}
              name="file"
              placeholder={null}
              onChange={this.handleChange}
            />
            <p />
            <div><DatePickerToday /></div>
            <p />
            <div><DatePickerStartDate /></div>
            <p />
            <input
              type="checkbox"
              value="skewNormal"
              checked={isChecked}
              onChange={this.toggleCheckboxChange}
            /> Use Skew-Normal
          <p />
            <button onClick={this.importCSV}>RUN!</button>
          </div>
          <button
            className="button"
            onClick={() => {
              exportToJson(this.state, "export");
            }}
          >
            Download JSON
          </button>
          <p />
          <div>
            <Chart data={this.state} />
          </div>

        </div>
      )
    }

  }
}


function DatePickerToday() {
  const [startDate, setStartDate] = useState(new Date());
  today = startDate;
  console.log(today);
  return (
    <DatePicker selected={startDate} onChange={date => setStartDate(date)} placeholderText="Today" />
  );
}

function DatePickerStartDate() {
  const [startDate, setStartDate] = useState(undefined);
  dpStartDate = startDate;
  console.log(dpStartDate);
  return (
    <DatePicker selected={dpStartDate} onChange={date => setStartDate(date)} placeholderText="Start Date (can be blank)" />
  );
}

function exportToJson(exportObj, name) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", name + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}


function test() {
  let jsonFileArray = [IAM, CEREBRAL]
  let elements = [];
  for (let i = 0; i<jsonFileArray.length ; i++) {
    elements.push(<Chart data={jsonFileArray[i]} />)
  }
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
  )
}

export default FileReader;