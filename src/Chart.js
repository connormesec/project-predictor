import React from 'react';
import Plot from 'react-plotly.js';


var minimum = new Date();
var today = new Date();
var forplot = [];
var mostRecentElevenTicketsArray = [];
var createdDate = 'Created';

function dateChange(data) {
    let data3 = data.map(datastring => {
        datastring['Lead Time'] = calcBusinessDays(new Date(datastring['In Progress']), new Date(datastring['Merged']));
        datastring['In Progress'] = new Date(datastring['In Progress']);
        datastring[createdDate] = new Date(datastring[createdDate]);
        datastring['Merged'] = new Date(datastring['Merged']);
        datastring['Closed'] = new Date(datastring['Closed']);
        return datastring;
    })
    return data3;
}

function removeNotWorkedTickets(data) {
    let newArr = [];
    for (var i = 0; i < data.length; i++) {
        if (!isValidDate(data[i].Closed) || (isValidDate(data[i].Closed) && isValidDate(data[i].Merged))) {
            newArr.push(data[i]);
        }
    }
    return newArr;
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
}

function isValidDate(date) {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}

function createDateArray(array) {
    var graphXAxisNum = Math.floor(today.getTime() - minimum.getTime()) / 86400000;
    var xaxis = [];
    for (var j = 0; j < graphXAxisNum; j++) {
        let day = {
            "Day": addDays(minimum, j),
            "Backlog": getBacklogAndWorkDone(addDays(minimum, j), array, createdDate),
            "Work_Done": getBacklogAndWorkDone(addDays(minimum, j), array, 'Merged'),
            "Work_Added": getBacklogAndWorkDone(addDays(minimum, j), array, createdDate) - getBacklogAndWorkDone(addDays(minimum, j - 1), array, createdDate),
        }
        xaxis[j] = day;
    }
    forplot = xaxis;
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

// function lastElevenLeadTime(array, today) {
//     var leadTime = array.slice().sort((a, b) => b['Merged'] - a['Merged']);
//     let leadTimeEleven = [];
//     let j = 0;
//     let i = 0;

//     let l = 0;
//     let testarr = [];

//     for (var k = 0; k < leadTime.length; k++) {
//         if (isValidDate(leadTime[k]['Merged']) && leadTime[k]['Merged'] < today && leadTime[k]['Lead Time'] < 15) {
//             leadTimeEleven.push(leadTime[k]['Lead Time']);
//             l = l + 1;
//         }
//     }
//     console.log(leadTimeEleven)
//     return leadTimeEleven;
// }

function computeMeanSdAndItervalRangeMinMax(list) {
    const sum = list.reduce((a, b) => a + b, 0);
    const mean = list.reduce((a, b) => a + b) / list.length;
    const sumMinusMean = list.reduce((a, b) => a + (b - mean) * (b - mean), 0);

    return {
        mean: mean,
        sd: Math.sqrt(sumMinusMean / (list.length - 1)),
        mode: median(mode(list)),
        median: median(list),
        range: [Math.min(...list), Math.max(...list)],
        best_case: mean - 2 * (Math.sqrt(sumMinusMean / (list.length - 1))),
        worst_case: mean + 2 * (Math.sqrt(sumMinusMean / (list.length - 1)))
    };
}

function mode(numbers) {
    // as result can be bimodal or multi-modal,
    // the returned result is provided as an array
    // mode of [3, 5, 4, 4, 1, 1, 2, 3] = [1, 3, 4]
    var modes = [], count = [], i, number, maxIndex = 0;

    for (i = 0; i < numbers.length; i += 1) {
        number = numbers[i];
        count[number] = (count[number] || 0) + 1;
        if (count[number] > maxIndex) {
            maxIndex = count[number];
        }
    }

    for (i in count)
        if (count.hasOwnProperty(i)) {
            if (count[i] === maxIndex) {
                modes.push(Number(i));
            }
        }

    return modes;
}

function median(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var median = 0, numsLen = numbers.length;
    numbers.sort();

    if (
        numsLen % 2 === 0 // is even
    ) {
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }

    return median;
}

//get the last ll tickets worked to completion
function lastElevenTickets(array, today) {
    var temp = array.slice().sort((a, b) => b['Merged'] - a['Merged']);

    let l = 0;
    let testarr = [];

    for (var k = 0; k < temp.length; k++) {
        if (l >= 11) break;
        if (isValidDate(temp[k]['Merged']) && temp[k]['Merged'] < today && temp[k]['Lead Time'] < 15) {
            testarr.push(temp[k]);
            l = l + 1;
        }
    }
    console.log(testarr)
    mostRecentElevenTicketsArray = testarr
    return testarr;
}


function workInParrallel(array) {
    let dateRange = [];
    const lastDay = {
        date: new Date(today),
        in_progress: false,
        merged: false,
        last_day: true
    };
    for (var i = 0; i < array.length; i++) {
        if (isValidDate(array[i]['In Progress']) && isValidDate(array[i]['Merged'])) {
            const toadd = [{
                date: array[i]['In Progress'],
                in_progress: true,
                merged: false,
                last_day: false
            }, {
                date: array[i]['Merged'],
                in_progress: false,
                merged: true,
                last_day: false
            }];
            dateRange = dateRange.concat(toadd);
        }
        if (isValidDate(array[i]['In Progress']) && !isValidDate(array[i]['Merged'])) {
            dateRange = dateRange.concat({
                date: array[i]['In Progress'],
                in_progress: true,
                merged: false,
                last_day: false
            });
        }
        if (array[i]['In Prgress'] >= today) break;
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
    let workInParrallelValue = sum / total;

    return workInParrallelValue;

}


function leadTimeAnalysis(rangeObject) {

    let n = 10000;
    let temparray = [];


    const randn_bm = () => {
        var u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        const R = Math.sqrt(-2.0 * Math.log(u));
        const Θ = 2.0 * Math.PI * v;
        const test = [R * Math.cos(Θ), R * Math.sin(Θ)];

        const ξ = rangeObject.mean;
        const ω = rangeObject.sd;
        const α = rangeObject.mean / 2 * (Math.pow(rangeObject.sd, 3));
        const med = rangeObject.median;

        function randomNormal(ξ, ω, median) {
            let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            num = num * ω + median;
            if ((num - median) / ω > 3) return randn_bm(); // remove outliers more than 3 standard deviations away from median
            return num;
        }

        function randomSkewNormal(test, ξ, ω, α) {
            const [u0, v] = test;
            if (α === 0) {
                return ξ + ω * u0;
            }
            const 𝛿 = α / Math.sqrt(1 + α * α);
            const u1 = 𝛿 * u0 + Math.sqrt(1 - 𝛿 * 𝛿) * v;
            const z = u0 >= 0 ? u1 : -u1;
            //originally was let num = ξ + ω * z;
            let num = ξ + ω * z;
            if (num < 0) num = randn_bm();
            return num;
        }
        return randomNormal(ξ, ω, med)
        //return randomSkewNormal(test,ξ,ω,α);
    }
    // Create n samples between min and max
    for (let i = 0; i < n; i++) {
        let rand_num = randn_bm();
        temparray.push(rand_num);
    }

    return temparray;
}

function monteCarlo(dates, randomNumsLeadTime, randomNumsWorkAdded) {
    let workLeft = dates[dates.length - 1].Backlog - dates[dates.length - 1].Work_Done;
    let adjustedWorkLeft = workLeft / workInParrallel(mostRecentElevenTicketsArray);
    let sum = randomNumsLeadTime[Math.floor(Math.random() * randomNumsLeadTime.length)] * adjustedWorkLeft;
    if (sum < 0) sum = 0;
    // if (sum >= adjustedWorkLeft) {
    //     return sum
    // } else {
    // while (sum <= adjustedWorkLeft) {
    //      sum += randomNumsLeadTime[Math.floor(Math.random() * randomNumsLeadTime.length)];
    // }
    return sum //* (1 + randomNumsWorkAdded[Math.floor(Math.random() * randomNumsWorkAdded.length)]);
 //} 
}

function runMonteCarlo(n, dates, randomNumsLeadTime, randomNumsWorkAdded) {
    let runArray = [];
    for (let i = 0; i < n; i++) {
        runArray.push(monteCarlo(dates, randomNumsLeadTime, randomNumsWorkAdded));
    }
    let monteCarloResults = {
        daysToCompletionArray: runArray,
        finalDistributionValuies: computeMeanSdAndItervalRangeMinMax(runArray),
        workInParrallelValue: workInParrallel(mostRecentElevenTicketsArray),
        randomWorkAdded: computeMeanSdAndItervalRangeMinMax(randomNumsWorkAdded),
        bestAndWorstCaseForPlotObject: bestAndWorstCaseForPlot(forplot, computeMeanSdAndItervalRangeMinMax(runArray), computeMeanSdAndItervalRangeMinMax(randomNumsWorkAdded)),
        confidence: getConfidence(runArray)
    };
    console.log(monteCarloResults);
    return monteCarloResults;
}

const round_to_precision = (x, precision) => {
    var y = +x + (precision === undefined ? 0.5 : precision / 2);
    return y - (y % (precision === undefined ? 1 : +precision));
}

function getConfidence(rawDataArray) {
    let result = [];

    for (let j = 0; j < Math.max(...rawDataArray); j++) {
        result[j] = 0;
    }

    for (let i = 0; i < rawDataArray.length; i++) {
        let rand_num = rawDataArray[i];
        let rounded = round_to_precision(rand_num, 1)
        result[rounded] += 1;
    }

    let hc_data = [];
    for (const [key, val] of Object.entries(result)) {
        hc_data.push({ "x": parseFloat(key), "y": val / rawDataArray.length });
    }

    // Sort
    hc_data = hc_data.sort(function (a, b) {
        if (a.x < b.x) return -1;
        if (a.x > b.x) return 1;
        return 0;
    });

    //TODO: use hc_data as a way to create a custom frequency distribution
    let sum = 0;
    let confidence = [
        { percent: 50, value: undefined },
        { percent: 75, value: undefined },
        { percent: 90, value: undefined },
        { percent: 95, value: undefined },
        { percent: 99, value: undefined }
    ];
    for (let k = 0; k < hc_data.length; k++) {
        sum = sum + hc_data[k].y * 100;
        for (let l = 0; l < confidence.length; l++) {
            if (sum < confidence[l].percent) {
                confidence[l].value = hc_data[k].x;
            }
        }
    }

    return confidence;
}

function bestAndWorstCaseForPlot(historicalData, finalDistributionValuies, randomWorkAdded) {
    let lastDay = historicalData[historicalData.length - 1].Day.getTime() / 86400000;
    let lastDayBacklogTotal = historicalData[historicalData.length - 1].Backlog;
    let lastDayDoneTotal = historicalData[historicalData.length - 1].Work_Done;
    let worstCaseDays = finalDistributionValuies.worst_case;
    let bestCaseDays = finalDistributionValuies.best_case;
    let averageWorkAdded = randomWorkAdded.median;
    let resultArray = [];
    for (let i = 0; i < worstCaseDays; i++) {
        resultArray.push(
            {
                day: new Date((i + lastDay) * 86400000),
                backlogIncrease: averageWorkAdded * i + lastDayBacklogTotal,
                doneWorstCase: (i * (((averageWorkAdded * worstCaseDays) + lastDayBacklogTotal) - lastDayDoneTotal) / worstCaseDays) + lastDayDoneTotal,
                doneBestCase: undefined
            }
        )
    }
    console.log(resultArray);
    return resultArray;
}


function Chart(props) {

    today = props.data.today;
    const formattedData = removeNotWorkedTickets(dateChange(props.data.data));
    //set mostRecentElevenTicketsArray
    lastElevenTickets(formattedData, today);
    workInParrallel(mostRecentElevenTicketsArray);
    //set minimum
    findEarliestAndLatestDate(formattedData);
    //set forplot
    createDateArray(formattedData);

    const lastElevenData = computeMeanSdAndItervalRangeMinMax(lastElevenTickets(formattedData, today).map(o => o['Lead Time'])); 
    const randLastElevenData = computeMeanSdAndItervalRangeMinMax(leadTimeAnalysis(lastElevenData));
    const historicalLastElevenTickets = computeMeanSdAndItervalRangeMinMax(mostRecentElevenTicketsArray.map(o => o['Lead Time']));
    const workAdded = computeMeanSdAndItervalRangeMinMax(forplot.map(o => o.Work_Added));
    const randWorkadded = computeMeanSdAndItervalRangeMinMax(leadTimeAnalysis(workAdded));
    let myBoyMonte = runMonteCarlo(10000, forplot, leadTimeAnalysis(computeMeanSdAndItervalRangeMinMax(lastElevenTickets(formattedData, today).map(o => o['Lead Time']))), forplot.map(o => o.Work_Added));

    if (!myBoyMonte) return <div> Loading... </div>;
    return (

        <div className="center">
            <div className="container">
                <Plot
                    data={[
                        //backlog
                        {
                            x: forplot.map(o => o.Day),
                            y: forplot.map(o => o.Backlog),
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'red' },
                        },
                        //work done
                        {
                            x: forplot.map(o => o.Day),
                            y: forplot.map(o => o.Work_Done),
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'green' },
                        },
                        {
                            x: myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.day),
                            y: myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.backlogIncrease),
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'pink' },
                        },
                        {
                            x: myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.day),
                            y: myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.doneWorstCase),
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'red' },
                        },
                        {
                            x: myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.day),
                            y: myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.doneBestCase),
                            type: 'scatter',
                            mode: 'lines',
                            marker: { color: 'green' },
                        },
                    ]}
                    layout={{ width: 1000, height: 500, title: 'CFD' }}
                />
            </div>
            <div className="container">
                <div className="dataBox">
                    <h1>Monte Carlo Data</h1>
                    <h3>Confidence Values</h3>
                    <p>50%: {myBoyMonte.confidence[0].value} days</p>
                    <p>75%: {myBoyMonte.confidence[1].value} days</p>
                    <p>90%: {myBoyMonte.confidence[2].value} days</p>
                    <p>95%: {myBoyMonte.confidence[3].value} days</p>
                    <h3>Model Values</h3>
                    <p>Mean: {Math.round(myBoyMonte.finalDistributionValuies.mean * 100)/100}</p>
                    <p>Median: {Math.round(myBoyMonte.finalDistributionValuies.median * 100)/100}</p>
                    <p>Std Dev: {Math.round(myBoyMonte.finalDistributionValuies.sd * 100)/100}</p>
                    <p>Work in parallel value: {Math.round(myBoyMonte.workInParrallelValue * 100)/100}</p>
                </div>
                <div>
                <Plot
                    data={[
                        //monteCarlo
                        {
                            x: myBoyMonte.daysToCompletionArray,
                            type: 'histogram',
                            histnorm: 'probability',
                            marker: {
                                color: 'rgb(255,100,100)',
                            },
                        },
                    ]}
                    layout={{ width: 1000, height: 500, title: 'Monte Carlo', xaxis: { range: [0, Math.max(myBoyMonte.daysToCompletionArray)] } }}
                />
                </div>
            </div>
            <div className="container">
            <div className="dataBox">
                    <h1>Lead Time</h1>
                    <h3>Historical Values</h3>
                <p>{mostRecentElevenTicketsArray.map(o => o['Lead Time']).map((o) => <>{o},</>)}</p>
                    <p>Mean: {Math.round(historicalLastElevenTickets.mean * 100)/100}</p>
                    <p>Median: {Math.round(historicalLastElevenTickets.median * 100)/100}</p>
                    <p>Std Dev: {Math.round(historicalLastElevenTickets.sd * 100)/100}</p>
                    <h3>Random Values</h3>
                    <p>Mean: {Math.round(randLastElevenData.mean * 100)/100}</p>
                    <p>Median: {Math.round(randLastElevenData.median * 100)/100}</p>
                    <p>Std Dev: {Math.round(randLastElevenData.sd * 100)/100}</p>
                </div>
                <div className="plot">
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
                        layout={{ width: 500, height: 500, title: 'Lead Time Frequency Diagram' }}
                    />
                </div>
                <div className="plot">
                    <Plot
                        data={[
                            //backlog
                            {
                                x: leadTimeAnalysis(lastElevenData),
                                type: 'histogram',
                                histnorm: 'probability',
                                marker: {
                                    color: 'rgb(255,255,100)',
                                },
                            },
                        ]}
                        layout={{ width: 500, height: 500, title: 'Lead Time Random Numbers' }}
                    />
                </div>
            </div>
            <div className="container">
            <div className="dataBox">
                    <h1>Lead Time</h1>
                    <h3>Historical Values</h3>
                    <p>Mean: {Math.round(workAdded.mean * 100)/100}</p>
                    <p>Median: {Math.round(workAdded.median * 100)/100}</p>
                    <p>Std Dev: {Math.round(workAdded.sd * 100)/100}</p>
                    <h3>Random Values</h3>
                    <p>Mean: {Math.round(randWorkadded.mean * 100)/100}</p>
                    <p>Median: {Math.round(randWorkadded.median * 100)/100}</p>
                    <p>Std Dev: {Math.round(randWorkadded.sd * 100)/100}</p>
                </div>
                <div className="plot">
                    <Plot
                        data={[
                            //backlog
                            {
                                x: forplot.map(o => o.Work_Added),
                                type: 'histogram',
                                histnorm: 'probability',
                                marker: {
                                    color: 'rgb(255,255,100)',
                                },
                            },
                        ]}
                        layout={{ width: 500, height: 500, title: 'Work Added Frequency Diagram' }}
                    />
                </div>
                <div className="plot">
                    <Plot
                        data={[
                            //backlog
                            {
                                x: leadTimeAnalysis(workAdded),
                                type: 'histogram',
                                histnorm: 'probability',
                                marker: {
                                    color: 'rgb(255,255,100)',
                                },
                            },
                        ]}
                        layout={{ width: 500, height: 500, title: 'Work Added Random Numbers' }}
                    />
                </div>
            </div>
        </div>

    );
}
export default Chart;