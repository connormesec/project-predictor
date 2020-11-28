import React from 'react';
import Papa from 'papaparse';

var minimum = new Date();
var today = new Date('2020-11-02');
var forplot = [];

class FileReader extends React.Component {
  constructor() {
    super();
    this.state = {
      csvfile: undefined
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
    dateChange(data);
    console.log(data);
    findEarliestAndLatestDate(data);
    createDateArray(data);
    lastElevenLeadTime(data,today);
  }

  render() {
    console.log(this.state.csvfile);
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
  }
}

function dateChange(data) {
  let data3 = data.map(datastring => {
    datastring['Lead Time'] = calcBusinessDays(new Date(datastring['In Progress']), new Date(datastring['Merged']));
    datastring['In Progress'] = new Date(datastring['In Progress']);
    datastring['Created Date'] = new Date(datastring['Created Date']);
    datastring['Merged'] = new Date(datastring['Merged']);
    return datastring;
  })
  return data3;
}

function calcBusinessDays(dDate1, dDate2) {         // input given as Date objects

  var iWeeks, iDateDiff, iAdjust = 0;

  if (dDate2 < dDate1) return -1;                 // error code if dates transposed

  var iWeekday1 = dDate1.getDay();                // day of week
  var iWeekday2 = dDate2.getDay();

  iWeekday1 = (iWeekday1 == 0) ? 7 : iWeekday1;   // change Sunday from 0 to 7
  iWeekday2 = (iWeekday2 == 0) ? 7 : iWeekday2;

  if ((iWeekday1 > 5) && (iWeekday2 > 5)) iAdjust = 1;  // adjustment if both days on weekend

  iWeekday1 = (iWeekday1 > 5) ? 5 : iWeekday1;    // only count weekdays
  iWeekday2 = (iWeekday2 > 5) ? 5 : iWeekday2;

  // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
  iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000)

  if (iWeekday1 <= iWeekday2) {
    iDateDiff = (iWeeks * 5) + (iWeekday2 - iWeekday1)
  } else {
    iDateDiff = ((iWeeks + 1) * 5) - (iWeekday1 - iWeekday2)
  }

  iDateDiff -= iAdjust                            // take into account both days on weekend

  return (iDateDiff + 1);                         // add 1 because dates are inclusive

}

function findEarliestAndLatestDate(dateArray) {
  var minIdx = 0, maxIdx = 0;
  for (var i = 0; i < dateArray.length; i++) {
    if (isValidDate(dateArray[i]['In Progress']) && isValidDate(dateArray[minIdx]['In Progress'])) {
      if (dateArray[i]['In Progress'] > dateArray[maxIdx]['In Progress']) maxIdx = i;
      if (dateArray[i]['In Progress'] < dateArray[minIdx]['In Progress']) minIdx = i;
    }
    if (isValidDate(dateArray[i]['In Progress']) && isValidDate(dateArray[minIdx]['In Progress']) == false) minIdx = i;
  }
  minimum = new Date(dateArray[minIdx]['In Progress']);
  console.log(minimum);
  //maximum = new Date(dateArray[maxIdx]['In Progress']);
  return dateArray;
}

function isValidDate(date) {
  return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}

function createDateArray(array) {
  var graphXAxisNum = Math.floor(today.getTime() - minimum.getTime()) / 86400000;
  console.log(graphXAxisNum);
  var xaxis = [];
  for (var j = 0; j < graphXAxisNum; j++) {
    let day = {
      "Day": addDays(minimum, j),
      "Backlog": getBacklogAndWorkDone(addDays(minimum, j), array, 'Created Date'),
      "Work_Done": getBacklogAndWorkDone(addDays(minimum, j), array, 'Merged'),
    }
    xaxis[j] = day;
  }
  forplot = xaxis;
  console.log(xaxis);
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getBacklogAndWorkDone(date, array, key) {
  let count = 0;
  for (var j = 0; j < array.length; j++) {
    if (isValidDate(date) && isValidDate(array[j][key])) {
      if (date.getTime() > array[j][key].getTime()) {
        count++;
      }
    }
  }
  return count;
}

function lastElevenLeadTime(array, today) {
  var count = 0;
  var leadTime = array.slice().sort((a, b) => b['Merged'] - a['Merged']);
 
  console.log(leadTime);
}


var list = createListOfNNumbersBetweenAAndB(1, 1, 10);
var newList = transfomListToExactMeanAndSd(list, 5, 2);

console.log('transformed list, mean and sd', newList, computeMeanSdAndItervalRangeMinMax(newList));
console.log('original list, mean and sd', list, computeMeanSdAndItervalRangeMinMax(list));

function createListOfNNumbersBetweenAAndB(n, a, b) {
  const listOfN = Array(...new Array(n));
  return listOfN.map(() => Math.random() * (b - a) + a);
}

function computeMeanSdAndItervalRangeMinMax(list) {
  const sum = list.reduce((a, b) => a + b, 0);
  const mean = sum / list.length;
  const sumMinusMean = list.reduce((a, b) => a + (b - mean) * (b - mean), 0);

  return {
    mean: mean,
    sd: Math.sqrt(sumMinusMean / (list.length - 1)),
    range: [Math.min(...list), Math.max(...list)]
  };
}

function transfomListToExactMeanAndSd(list, mean, sd) {
  const current = computeMeanSdAndItervalRangeMinMax(list);
  return list.map(n => sd * (n - current.mean) / current.sd + mean);
}
export default FileReader;