import React from 'react';
import Papa from 'papaparse';
import Chart from './Chart';

class FileReader extends React.Component {
  constructor() {
    super();
    this.state = {
      csvfile: undefined,
      data: undefined
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
      data: data
    });
  }

  render() {
    console.log(this.state.csvfile);
    if (!this.state.data) {
      return (
        <div className="App">
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
          <button onClick={this.importCSV}>RUN!</button>
        </div>
      );
    } else {
      return (
        <div>
          <Chart data={this.state.data} />
        </div>
      )
    }

  }
}
export default FileReader;