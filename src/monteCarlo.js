import skewnorm from 'skew-normal-random';
import random from 'random';

var createdDate = 'Created';
let leadTimeMaxValue;

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

function findEarliestDate(dateArray, startDate) {
    var minIdx = 0, maxIdx = 0;
    for (var i = 0; i < dateArray.length; i++) {
        if (isValidDate(dateArray[i]['In Progress']) && isValidDate(dateArray[minIdx]['In Progress'])) {
            if (dateArray[i]['In Progress'] > dateArray[maxIdx]['In Progress']) maxIdx = i;
            if (dateArray[i]['In Progress'] < dateArray[minIdx]['In Progress']) minIdx = i;
        }
        if (isValidDate(dateArray[i]['In Progress']) && isValidDate(dateArray[minIdx]['In Progress']) == false) minIdx = i;
    }
    if (!startDate) {
        return new Date(dateArray[minIdx]['In Progress']);
    } else {
        return startDate;
    }
}

function isValidDate(date) {
    return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
}

function createDateArray(array, today, minimum, backlogOverride) {
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
    if (backlogOverride) {
        xaxis[Math.floor(graphXAxisNum)].Backlog = backlogOverride;
    }
    return xaxis;
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


function computeMeanSdAndItervalRangeMinMax(list) {
    const sum = list.reduce((a, b) => a + b, 0);
    const mean = list.reduce((a, b) => a + b) / list.length;
    const sumMinusMean = list.reduce((a, b) => a + (b - mean) * (b - mean), 0);
    const logNorm = list.map(x => Math.log(x))

    return {
        mean: mean,
        sd: Math.sqrt(sumMinusMean / (list.length - 1)),
        mode: median(mode(list)),
        median: median(list),
        range: [Math.min(...list), Math.max(...list)],
        best_case: mean - 2 * (Math.sqrt(sumMinusMean / (list.length - 1))),
        worst_case: mean + 2 * (Math.sqrt(sumMinusMean / (list.length - 1))),
        logNormal: logNorm
    };
}

function mode(numbers) {
    // as result can be bimodal or multi-modal,
    // the returned result is provided as an array
    // mode of [3, 5, 4, 4, 1, 1, 2, 3] = [1, 3, 4]
    var modes = [], count = [], i, number, maxIndex = 0, result = [];
    for (let i = 0; i < numbers.length; i++) {
        let rand_num = numbers[i];
        let rounded = round_to_precision(rand_num, 1)
        result.push(rounded);
    }

    for (i = 0; i < result.length; i += 1) {
        number = result[i];
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
    numbers.sort((a, b) => a - b);

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
//TODO: Make it so last 11 tickets respect start date
function lastElevenTickets(array, today, startDate) {
    var temp = array.slice().sort((a, b) => b['Merged'] - a['Merged']);

    let l = 0;
    let testarr = [];

    for (var k = 0; k < temp.length; k++) {
        if (l >= 11) break;
        if (isValidDate(temp[k]['Merged']) && temp[k]['Merged'] < today && temp[k]['Lead Time'] < leadTimeMaxValue && temp[k]['Merged'] > startDate) {
            testarr.push(temp[k]);
            l = l + 1;
        }
    }
    //mostRecentElevenTicketsArray = testarr
    return testarr;
}


function workInParrallel(array, today, workInParrallelOverride) {
    if (workInParrallelOverride) {
        return workInParrallelOverride;
    } else {
    let dateRange = [];
    const lastDay = {
        date: today,
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
}


function randNumFromDistribution(rangeObject, distributionType) {

    let n = 10000;
    let temparray = [];
    let logNorm = computeMeanSdAndItervalRangeMinMax(rangeObject.logNormal)

    const randn_bm = () => {
        var u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        const R = Math.sqrt(-2.0 * Math.log(u));
        const Θ = 2.0 * Math.PI * v;
        const test = [R * Math.cos(Θ), R * Math.sin(Θ)];

        const mean = rangeObject.mean;
        const ω = rangeObject.sd;
        //Pearson's first skewness coefficient (mode skewness)
        const α = (rangeObject.mean - rangeObject.mode) / ω;
        const 𝛿 = α / Math.sqrt(1 + α * α);
        const ξ = rangeObject.mean - ω * 𝛿 * Math.sqrt(2 / Math.PI);
        const med = rangeObject.median;

        function randomNormal(ξ, ω, median) {
            let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            num = num * ω + median;
            if ((num - median) / ω > 3) return randn_bm(); // remove outliers more than 3 standard deviations away from median
            return num;
        }

        // function randomSkewNormal(test, ξ, ω, α = 7) {
        //     const [u0, v] = test;
        //     if (α === 0) {
        //         return ξ + ω * u0;
        //     }
        //     const 𝛿 = α / Math.sqrt(1 + α * α);
        //     const u1 = 𝛿 * u0 + Math.sqrt(1 - 𝛿 * 𝛿) * v;
        //     //const z = u0 >= 0 ? u1 : -u1;
        //     const z = u1;
        //     //origin was ξ + ω * z
        //     let num = ξ + ω * z;
        //     //if (num < 0) num = randn_bm();
        //     return num;
        // }

        function randomSkewNormal(alpha, location, scale) {
            let num = skewnorm.rSkewNorm(alpha, location, scale);
            return num;
        }

        function randomLogNormal() {
            let num = random.logNormal(logNorm.mean, logNorm.sd)();
            if (num > leadTimeMaxValue) return randn_bm();
            return num;
        }


        if (distributionType == "Skew-Normal") {
            return randomSkewNormal(α, ξ, ω);
        } else if (distributionType == "Normal") {
            return randomNormal(mean, ω, med);
        } else if (distributionType == "Log-Normal") {
            return randomLogNormal();
        } else {
            return null;
        }

    }


    // Create n samples between min and max
    for (let i = 0; i < n; i++) {
        let rand_num = randn_bm();
        temparray.push(rand_num);
        }
    return temparray;
}

function monteCarlo(dates, randomNumsLeadTime, randomNumsWorkAdded, today, formattedData, startDate, workInParrallelOverride) {
    let workLeft = dates[dates.length - 1].Backlog - dates[dates.length - 1].Work_Done;
    let adjustedWorkLeft = workLeft / workInParrallel(lastElevenTickets(formattedData, today, startDate), today, workInParrallelOverride);
    let sum = randomNumsLeadTime[Math.floor(Math.random() * randomNumsLeadTime.length)] * adjustedWorkLeft;
    if (sum < 0) sum = 0;
    
    return sum //* (1 + randomNumsWorkAdded[Math.floor(Math.random() * randomNumsWorkAdded.length)]);
}

function runMonteCarlo(n, dates, randomNumsLeadTime, randomNumsWorkAdded, today, formattedData, startDate, workInParrallelOverride) {
    let runArray = [];
    for (let i = 0; i < n; i++) {
        runArray.push(monteCarlo(dates, randomNumsLeadTime, randomNumsWorkAdded, today, formattedData, startDate, workInParrallelOverride));
    }
    let monteCarloResults = {
        daysToCompletionArray: runArray,
        finalDistributionValuies: computeMeanSdAndItervalRangeMinMax(runArray),
        workInParrallelValue: workInParrallel(lastElevenTickets(formattedData, today, startDate), today, workInParrallelOverride),
        randomWorkAdded: computeMeanSdAndItervalRangeMinMax(randomNumsWorkAdded),
        confidence: getConfidence(runArray),
        bestAndWorstCaseForPlotObject: bestAndWorstCaseForPlot(dates, computeMeanSdAndItervalRangeMinMax(runArray), computeMeanSdAndItervalRangeMinMax(randomNumsWorkAdded), getConfidence(runArray))

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
        { percent: 25, value: undefined },
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
                confidence[l].value = hc_data[k].x + 1;
            }
        }
    }

    return confidence;
}

function bestAndWorstCaseForPlot(historicalData, finalDistributionValuies, randomWorkAdded, confidence) {

    let lastDay = historicalData[historicalData.length - 1].Day.getTime() / 86400000;
    let lastDayBacklogTotal = historicalData[historicalData.length - 1].Backlog;
    let lastDayDoneTotal = historicalData[historicalData.length - 1].Work_Done;
    let worstCaseDays = confidence[5].value;
    let ninetyFivePercent = confidence[4].value;
    let ninetyPercent = confidence[3].value;
    let seventyFivePercent = confidence[2].value;
    let fiftyPercent = confidence[1].value;
    let bestCaseDays = confidence[0].value;
    let averageWorkAdded = randomWorkAdded.median;
    let resultArray = [];
    for (let i = 0; i < worstCaseDays; i++) {
        const date = new Date((i + lastDay) * 86400000), 
        bckLgInc = averageWorkAdded * i + lastDayBacklogTotal, 
        doneWC = (i * (((averageWorkAdded * worstCaseDays) + lastDayBacklogTotal) - lastDayDoneTotal) / worstCaseDays) + lastDayDoneTotal, 
        CF95 = (i * (((averageWorkAdded * ninetyFivePercent) + lastDayBacklogTotal) - lastDayDoneTotal) / ninetyFivePercent) + lastDayDoneTotal, 
        CF90 = (i * (((averageWorkAdded * ninetyPercent) + lastDayBacklogTotal) - lastDayDoneTotal) / ninetyPercent) + lastDayDoneTotal, 
        CF75 = (i * (((averageWorkAdded * seventyFivePercent) + lastDayBacklogTotal) - lastDayDoneTotal) / seventyFivePercent) + lastDayDoneTotal, 
        CF50 = (i * (((averageWorkAdded * fiftyPercent) + lastDayBacklogTotal) - lastDayDoneTotal) / fiftyPercent) + lastDayDoneTotal, 
        CF25 = (i * (((averageWorkAdded * bestCaseDays) + lastDayBacklogTotal) - lastDayDoneTotal) / bestCaseDays) + lastDayDoneTotal;
        if (CF95 > lastDayBacklogTotal) {
            resultArray.push(
                {
                    day: date,
                    backlogIncrease: bckLgInc,
                    doneWorstCase: doneWC,
                }
            );
        } else if (CF90 > lastDayBacklogTotal) {
            resultArray.push(
                {
                    day: date,
                    backlogIncrease: bckLgInc,
                    doneWorstCase: doneWC,
                    confidence95: CF95,
                }
            );
        } else if (CF75 > lastDayBacklogTotal) {
            resultArray.push(
                {
                    day: date,
                    backlogIncrease: bckLgInc,
                    doneWorstCase: doneWC,
                    confidence95: CF95,
                    confidence90: CF90
                }
            );
        }else if (CF50 > lastDayBacklogTotal) {
            resultArray.push(
                {
                    day: date,
                    backlogIncrease: bckLgInc,
                    doneWorstCase: doneWC,
                    confidence95: CF95,
                    confidence90: CF90,
                    confidence75: CF75
                }
            );
        }else if (CF25 > lastDayBacklogTotal) {
            resultArray.push(
                {
                    day: date,
                    backlogIncrease: bckLgInc,
                    doneWorstCase: doneWC,
                    confidence95: CF95,
                    confidence90: CF90,
                    confidence75: CF75,
                    confidence50: CF50
                }
            );
        } else {
            resultArray.push(
                {
                    day: date,
                    backlogIncrease: bckLgInc,
                    doneWorstCase: doneWC,
                    confidence95: CF95,
                    confidence90: CF90,
                    confidence75: CF75,
                    confidence50: CF50,
                    confidence25: CF25
                }
            )
        }
    }
    return resultArray;
}


function formatDate(date) {
    if (!isValidDate(date)){
        return null
    } else {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
    }
}

function test(startDate, today, formattedData, distType) {
    let randomArr = randNumFromDistribution(computeMeanSdAndItervalRangeMinMax(lastElevenTickets(formattedData, today).map(o => o['Lead Time'])), distType);
    return runMonteCarlo(10000, createDateArray(formattedData, today, findEarliestDate(formattedData, startDate)), randomArr, createDateArray(formattedData, today, findEarliestDate(formattedData, startDate)).map(o => o.Work_Added), today, formattedData)
}


export function monteCarloFunction(props) {
    console.log(props);
    let today = new Date(props.data.simulationDate);
    const distType = props.data.distribution;
    let startDate = props.data.startDate == null ? false : new Date(props.data.startDate);
    //set lead time max value
    (props.data.leadTimeMaxValueOverride) ? leadTimeMaxValue = props.data.leadTimeMaxValueOverride : leadTimeMaxValue = 10000;
    console.log(leadTimeMaxValue)
    const formattedData = removeNotWorkedTickets(dateChange(props.data.data));
    const leadTimeLastEleven = (props.data.leadTimeOverride) ? props.data.leadTimeOverride.split(',').map(x => x*1) : lastElevenTickets(formattedData, today, findEarliestDate(formattedData, startDate)).map(o => o['Lead Time']);
    let forplot = createDateArray(formattedData, today, findEarliestDate(formattedData, startDate), props.data.backlogOverride);
    console.log(forplot)
    const lastElevenData = computeMeanSdAndItervalRangeMinMax(leadTimeLastEleven);
    const randLastElevenData = computeMeanSdAndItervalRangeMinMax(randNumFromDistribution(lastElevenData, distType));
    const workAdded = computeMeanSdAndItervalRangeMinMax(forplot.map(o => o.Work_Added));
    const randWorkadded = computeMeanSdAndItervalRangeMinMax(randNumFromDistribution(workAdded));
    let myBoyMonte = runMonteCarlo(10000, forplot, randNumFromDistribution(computeMeanSdAndItervalRangeMinMax(leadTimeLastEleven), distType), forplot.map(o => o.Work_Added), today, formattedData,findEarliestDate(formattedData, startDate), props.data.workInParrallelOverride);
    let plotdata = []
    for (let i = 0; i < forplot.map(o => o.Day).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.day).slice(1)).length; i++) {
        plotdata.push({
        days : forplot.map(o => o.Day).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.day).slice(1))[i],
        backlog : forplot.map(o => o.Backlog)[i],
        workDone : forplot.map(o => o.Work_Done)[i],
        workIncrease : new Array(forplot.map(o => o.Day).length-1).fill(undefined).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.backlogIncrease))[i],
        worstCase : new Array(forplot.map(o => o.Day).length-1).fill(undefined).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.doneWorstCase))[i],        
        confidence25 : new Array(forplot.map(o => o.Day).length-1).fill(undefined).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.confidence25))[i],
        confidence50 : new Array(forplot.map(o => o.Day).length-1).fill(undefined).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.confidence50))[i],
        confidence75 : new Array(forplot.map(o => o.Day).length-1).fill(undefined).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.confidence75))[i],
        confidence90 : new Array(forplot.map(o => o.Day).length-1).fill(undefined).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.confidence90))[i],
        confidence95 : new Array(forplot.map(o => o.Day).length-1).fill(undefined).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map(o => o.confidence95))[i]
    });
    }
    return {
        monte : myBoyMonte,
        plotData : plotdata,
        leadtime : {
            leadTimeLastEleven : leadTimeLastEleven,
            lastElevenData : lastElevenData,
            randLastElevenData : randLastElevenData,
            randLeadTimeData : randNumFromDistribution(lastElevenData, distType)
        },
        workAdded : {
            workAdded : workAdded,
            randWorkAdded : randWorkadded
        }
    }
}