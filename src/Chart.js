import React from 'react';
import Plot from 'react-plotly.js';


var minimum = new Date();
var today = new Date('2020-10-12');
var forplot = [];
var mostRecentElevenTicketsArray = [];
let plotData = [];

function formatData(data) {
    dateChange(data);
    lastElevenTickets(data, today);
    findEarliestAndLatestDate(data);
    createDateArray(data);
    lastElevenLeadTime(data, today);
    workInParrallel(mostRecentElevenTicketsArray);
    return data;
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
    var leadTime = array.slice().sort((a, b) => b['Merged'] - a['Merged']);
    let leadTimeEleven = [];
    let j = 0;
    let i = 0;
    do {
        if (leadTime[j]['Merged'] < today && isValidDate(leadTime[j]['Merged'])) {
            leadTimeEleven.push(leadTime[j]['Lead Time']);
            i = i + 1;
            j = j + 1;
        } else { j = j + 1; }
    } while (i < 11 || i >= leadTime.length)
    console.log(leadTimeEleven);
    let msr = computeMeanSdAndItervalRangeMinMax(leadTimeEleven);
    console.log(msr);
    leadTimeAnalysis(msr);
    return leadTimeEleven;
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

//get the last ll tickets worked to completion
function lastElevenTickets(array, today) {
    var temp = array.slice().sort((a, b) => b['Merged'] - a['Merged']);
    let mostRecentElevenTickets = [];
    let j = 0;
    let i = 0;
    do {
        if (temp[j]['Merged'] < today && isValidDate(temp[j]['Merged'])) {
            mostRecentElevenTickets.push(temp[j]);
            i = i + 1;
            j = j + 1;
        } else { j = j + 1; }
    } while (i < 11 || i >= temp.length)
    mostRecentElevenTicketsArray = mostRecentElevenTickets;
}


function workInParrallel(array) {
    let dateRange = [];
    const lastDay = {date: new Date (today),
    in_progress: false,
    merged: false,
    last_day: true};
    console.log(array)
    for (var i = 0; i < array.length; i++) {
        if(isValidDate(array[i]['In Progress']) && isValidDate(array[i]['Merged'])) {
            const toadd = [{
                date: array[i]['In Progress'],
                in_progress: true,
                merged: false,
                last_day: false
            },{
                date: array[i]['Merged'],
                in_progress: false,
                merged: true,
                last_day: false
            }];
            dateRange = dateRange.concat(toadd);
        }
        if(isValidDate(array[i]['In Progress']) && !isValidDate(array[i]['Merged'])) {
            dateRange = dateRange.concat({
                date: array[i]['In Progress'],
                in_progress: true,
                merged: false,
                last_day: false
            });
        }
        if(array[i]['In Prgress'] >= today) break;
    }
    dateRange = dateRange.concat(lastDay);
    //[0] earliest date -> [n] last date
    var filteredDateRange = dateRange.slice().sort((a, b) => a.date - b.date);
    if (!filteredDateRange[0].in_progress) console.error("something is wrong with this csv, the first item has a merged date before the in progress date");
    let multiplyer = 1;
    let sum = 0;
    for (var j = 0; j < filteredDateRange.length - 1; j++) {
        
        sum = sum + ((filteredDateRange[j + 1].date.getTime() - filteredDateRange[j].date.getTime()) * multiplyer);
        if (filteredDateRange[j + 1].in_progress) {
            multiplyer++;
        }
        if (filteredDateRange[j + 1].merged) {
            multiplyer--;
        }
        if (filteredDateRange[j + 1].last_day) {
            break;
        }
    }
    let total = today.getTime() - filteredDateRange[0].date.getTime();
    let workInParrallelValue = sum/total;
    
    console.log("workInParrallelValue: " + workInParrallelValue);
    return workInParrallelValue;

}


function leadTimeAnalysis(rangeObject) {

let n = 1000;
let step = 1;
let max = rangeObject.range[1];
let min = rangeObject.range[0];
let skew = 1.5;
let temparray = [];


const randn_bm = (min, max, skew) => {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

// Create n samples between min and max
for (let i=0; i<n; i+=step) {
    let rand_num = randn_bm(min, max, skew);
    temparray.push(rand_num);
}
plotData = temparray;
}







function Chart(props) {
    const data = formatData(props.data);
    return (
        <div className="parent">
        <div>
        <Plot
        data={[
            //backlog
          {
            x: forplot.map(o => o.Day),
            y: forplot.map(o => o.Backlog),
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'red'},
          },
          //work done
          {
            x: forplot.map(o => o.Day),
            y: forplot.map(o => o.Work_Done),
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'green'},
          }
        ]}
        layout={ {width: 500, height: 500, title: 'A Fancy Plot'} }
      />
      </div>
      <div>
      <Plot
        data={[
            //backlog
            {
                x: mostRecentElevenTicketsArray.map(o => o['Lead Time']),
                type: 'histogram',
                histnorm: 'probability',
                marker: {
                    color: 'rgb(255,255,100)',
                 },
              },
        ]}
        layout={ {width: 500, height: 500, title: 'A Fancy Plot'} }
      />
      </div>
      <div>
      <Plot
        data={[
            //backlog
            {
                x: plotData,
                type: 'histogram',
                histnorm: 'probability',
                marker: {
                    color: 'rgb(255,255,100)',
                 },
              },
        ]}
        layout={ {width: 500, height: 500, title: 'A Fancy Plot'} }
      />
      </div>
      </div>
      );
}
export default Chart;