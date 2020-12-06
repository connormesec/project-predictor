import React, { useState } from "react";
import Papa from 'papaparse';
import Chart from './Chart';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
      completionDate: new Date('12/2/2020')
    };
    this.updateData = this.updateData.bind(this);
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
          <button
            className="button"
            onClick={() => {
              runTest();
            }}
          >
            Run Test
          </button>
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
              exportToJson(this.state);
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

function exportToJson(exportObj) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "export" + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function runTest() {





}



export default FileReader;