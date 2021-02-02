import skewnorm from "skew-normal-random";
import random from "random";
import jsrand from "jsrand";

var createdDate = "Created";
let ticketStartedCol;
let leadTimeMaxValue;

function dateChange(data) {
  let data3 = data.map((datastring) => {
    datastring["Lead Time"] = calcBusinessDays(
      new Date(datastring[ticketStartedCol]),
      new Date(datastring["Merged"])
    );
    datastring["In Progress"] = new Date(datastring["In Progress"]);
    datastring[createdDate] = new Date(datastring[createdDate]);
    datastring["Merged"] = new Date(datastring["Merged"]);
    //datastring["Closed"] = new Date(datastring["Closed"]);
    datastring[ticketStartedCol] = new Date(datastring[ticketStartedCol]);
    return datastring;
  });
  return data3;
}

function removeNotWorkedTickets(data) {
  let newArr = [];
  for (var i = 0; i < data.length; i++) {
    if (
      !(isValidDate(data[i][ticketStartedCol]) && (data[i].Status === "Closed" || data[i].Status === "Completed") && !isValidDate(data[i].Merged)) && !RegExp('post_prod', 'g').test(data[i].Labels)
    ) {
      newArr.push(data[i]);
    }
  }
  return newArr;
}

function leadTimeAndStatus(data, today, randLastElevenData) {
  let newData = data.map((datastring) => {
    datastring.leadTime = null; //calcBusinessDays(new Date(datastring['In Progress']), new Date(datastring['Merged']));
    datastring["In Progress"] = new Date(datastring["In Progress"]);
    datastring[createdDate] = new Date(datastring[createdDate]);
    datastring["Merged"] = new Date(new Date(datastring["Merged"]).setHours(0, 0, 0, 0));
    datastring["Closed"] = new Date(datastring["Closed"]);
    datastring[ticketStartedCol] = new Date(new Date(datastring[ticketStartedCol]).setHours(0, 0, 0, 0));
    datastring.alert = "";
    datastring.alertCount = 0;
    return datastring;
  });
  let newArr = [];
  for (var i = 0; i < newData.length; i++) {
    //In progress
    if (
      !isValidDate(newData[i].Merged) &&
      isValidDate(newData[i][ticketStartedCol]) &&
      newData[i].Status !== "New" &&
      newData[i].Status !== "Closed" &&
      newData[i].Status !== "Resolved" &&
      newData[i].Status !== "Complete" &&
      newData[i].Status !== "Completed" 
    ) {
      newData[i].leadTime = calcBusinessDays(
        new Date(newData[i][ticketStartedCol]),
        new Date(today)
      );
      newData[i].Status = "In Progress";
      if (newData[i].leadTime > randLastElevenData.worst_case) {
        newData[i].alert += " BEHIND SCHEDULE ";
        newData[i].alertCount++;
      }
      if (newData[i]["Release note required?"] === "TBD") {
        newData[i].alert += " NEEDS RELEASE NOTES ";
        newData[i].alertCount++;
      }
      if (newData[i]["Effort Points"] === "-") {
        newData[i].alert += " NO EFFORT POINTS ";
        newData[i].alertCount++;
      }
      newArr.push(newData[i]);
    }
    //Complete
    else if (
      isValidDate(newData[i].Merged) &&
      isValidDate(newData[i][ticketStartedCol])
    ) {
      newData[i].leadTime = calcBusinessDays(
        new Date(newData[i][ticketStartedCol]),
        new Date(newData[i].Merged)
      );
      newData[i].Status = "Complete";
      if (newData[i]["Release note required?"] === "TBD") {
        newData[i].alert += " NEEDS RELEASE NOTES ";
        newData[i].alertCount++;
      }
      newArr.push(newData[i]);
    }

    //New
    else if (newData[i].Status === ticketStartedCol) {
      if (newData[i]["Effort Points"] === "-") {
        newData[i].alert += " NO EFFORT POINTS ";
        newData[i].alertCount++;
      }
      newArr.push(newData[i]);
    } else {
      newArr.push(newData[i]);
    }
  }
  return newArr;
}

function calcBusinessDays(dDate1, dDate2) {
  // input given as Date objects

  var iWeeks,
    iDateDiff,
    iAdjust = 0;

  if (dDate2 < dDate1) return 0; // error code if dates transposed

  var iWeekday1 = dDate1.getDay(); // day of week
  var iWeekday2 = dDate2.getDay();

  iWeekday1 = iWeekday1 == 0 ? 7 : iWeekday1; // change Sunday from 0 to 7
  iWeekday2 = iWeekday2 == 0 ? 7 : iWeekday2;

  if (iWeekday1 > 5 && iWeekday2 > 5) iAdjust = 1; // adjustment if both days on weekend

  iWeekday1 = iWeekday1 > 5 ? 5 : iWeekday1; // only count weekdays
  iWeekday2 = iWeekday2 > 5 ? 5 : iWeekday2;

  // calculate differnece in weeks (1000mS * 60sec * 60min * 24hrs * 7 days = 604800000)
  iWeeks = Math.floor((dDate2.getTime() - dDate1.getTime()) / 604800000);

  if (iWeekday1 <= iWeekday2) {
    iDateDiff = iWeeks * 5 + (iWeekday2 - iWeekday1);
  } else {
    iDateDiff = (iWeeks + 1) * 5 - (iWeekday1 - iWeekday2);
  }
  iDateDiff -= iAdjust; // take into account both days on weekend
  if (iDateDiff < 1) iDateDiff = 1;
  return iDateDiff;
}

function findEarliestDate(dateArray, startDate) {
  let minIdx = 0,
    maxIdx = 0;
  for (var i = 0; i < dateArray.length; i++) {
    if (
      isValidDate(dateArray[i][ticketStartedCol]) &&
      isValidDate(dateArray[minIdx][ticketStartedCol])
    ) {
      if (dateArray[i][ticketStartedCol] > dateArray[maxIdx][ticketStartedCol])
        maxIdx = i;
      if (dateArray[i][ticketStartedCol] < dateArray[minIdx][ticketStartedCol])
        minIdx = i;
    }
    if (
      isValidDate(dateArray[i][ticketStartedCol]) &&
      isValidDate(dateArray[minIdx][ticketStartedCol]) == false
    )
      minIdx = i;
  }
  if (!startDate && isValidDate(dateArray[minIdx][createdDate])) {
    return new Date(dateArray[minIdx][createdDate]);
  } else if (!startDate && isValidDate(dateArray[minIdx][ticketStartedCol])) {
    return new Date(dateArray[minIdx][ticketStartedCol]);
  } else {
    return startDate;
  }
}

function isValidDate(date) {
  return (
    date &&
    Object.prototype.toString.call(date) === "[object Date]" &&
    !isNaN(date)
  );
}

function createDateArray(array, today, minimum, backlogOverride) {
  var graphXAxisNum =
    Math.floor(addDays(today, 1).getTime() - minimum.getTime()) / 86400000;
  var xaxis = [];
  for (var j = 0; j < graphXAxisNum; j++) {
    let day = {
      Day: addDays(minimum, j),
      Backlog: getBacklogAndWorkDone(addDays(minimum, j), array, createdDate),
      Work_Done: getBacklogAndWorkDone(addDays(minimum, j), array, "Merged"),
      Work_Added:
        getBacklogAndWorkDone(addDays(minimum, j), array, createdDate) -
        getBacklogAndWorkDone(addDays(minimum, j - 1), array, createdDate),
    };
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
      // call setHours to take the time out of the comparison
      if (date.setHours(0, 0, 0, 0) >= array[j][key].setHours(0, 0, 0, 0)) {
        // Date equals today's date
        count++;
      }
    }
  }
  return count;
}

function computeMeanSdAndItervalRangeMinMax(list) {
  const sum = list.reduce((a, b) => a + b, 0);
  const mean = list.reduce((a, b) => a + b, 0) / list.length;
  const sumMinusMean = list.reduce((a, b) => a + (b - mean) * (b - mean), 0);
  const logNorm = list.map((x) => Math.log(x));
  const shapeScale = getShapeAndScaleFromDataArray(list)

  return {
    mean: mean,
    sd: Math.sqrt(sumMinusMean / (list.length - 1)),
    mode: median(mode(list)),
    median: median(list),
    range: [Math.min(...list), Math.max(...list)],
    best_case: mean - 2 * Math.sqrt(sumMinusMean / (list.length - 1)),
    worst_case: mean + 2 * Math.sqrt(sumMinusMean / (list.length - 1)),
    logNormal: logNorm,
    list: list,
    shapeScale: shapeScale
  };
}

function mode(numbers) {
  // as result can be bimodal or multi-modal,
  // the returned result is provided as an array
  // mode of [3, 5, 4, 4, 1, 1, 2, 3] = [1, 3, 4]
  var modes = [],
    count = [],
    i,
    number,
    maxIndex = 0,
    result = [];
  for (let i = 0; i < numbers.length; i++) {
    let rand_num = numbers[i];
    let rounded = round_to_precision(rand_num, 1);
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
  var median = 0,
    numsLen = numbers.length;
  numbers.sort((a, b) => a - b);

  if (
    numsLen % 2 ===
    0 // is even
  ) {
    // average of two middle numbers
    median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
  } else {
    // is odd
    // middle number only
    median = numbers[(numsLen - 1) / 2];
  }
  return median;
}

//get the last ll tickets worked to completion
//TODO: Make it so last 11 tickets respect start date
function lastElevenTickets(array, today, startDate) {
  var temp = array.slice().sort((a, b) => b["Merged"] - a["Merged"]);
  let l = 0;
  let mostRecentElevenTicketsArray = [];

  for (var k = 0; k < temp.length; k++) {
    if (l >= 11) break;
    if (
      isValidDate(temp[k]["Merged"]) &&
      temp[k]["Merged"] < today &&
      temp[k]["Lead Time"] < leadTimeMaxValue &&
      temp[k]["Merged"] > startDate
    ) {
      mostRecentElevenTicketsArray.push(temp[k]);
      l = l + 1;
    }
  }
  return mostRecentElevenTicketsArray;
}

function workInParallel(formattedData, today, startDate, workInParallelOverride) {
  if (workInParallelOverride) {
    return workInParallelOverride;
  } else {
    let lastElevenCompletedTickets = lastElevenTickets(formattedData, today, startDate)
    let lastDay = lastElevenCompletedTickets[0][ticketStartedCol]
    let firstDay = lastElevenCompletedTickets[lastElevenCompletedTickets.length - 1].Merged
    let sum = 0;
    for (var k = 0; k < lastElevenCompletedTickets.length; k++) {
      sum = sum + lastElevenCompletedTickets[k]["Lead Time"]
    }
    let total = calcBusinessDays(firstDay, lastDay);
    let workInParallelValue = sum / total;
    if (workInParallelValue < 0.7) workInParallelValue = 0.7;

    if (isNaN(workInParallelValue)) {
      return 0.8;
    } else {
      return workInParallelValue;
    }
  }
}

function randNumFromDistribution(rangeObject, distributionType) {
  let n = 10000;
  let temparray = [];
  let logNorm = computeMeanSdAndItervalRangeMinMax(rangeObject.logNormal);
  //for weibull
  let shapeScaleParams = getShapeAndScaleFromDataArray(rangeObject.list);
  let scale = shapeScaleParams.estimatedScale;
  let shape = shapeScaleParams.estimatedShape;
  const randn_bm = () => {
    var u = 0,
      v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    const R = Math.sqrt(-2.0 * Math.log(u));
    const Θ = 2.0 * Math.PI * v;
    const test = [R * Math.cos(Θ), R * Math.sin(Θ)];

    const mean = rangeObject.mean;
    let ω = rangeObject.sd;
    if (rangeObject.sd == 0) ω = 3.26;
    //Pearson's first skewness coefficient (mode skewness)
    const α = (rangeObject.mean - rangeObject.mode) / ω;
    const 𝛿 = α / Math.sqrt(1 + α * α);
    const ξ = rangeObject.mean - ω * 𝛿 * Math.sqrt(2 / Math.PI);
    let med = rangeObject.median;
    if (isNaN(rangeObject.median)) med = 2;

    function randomNormal(ξ, ω, median) {
      let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      num = num * ω + median;
      if ((num - median) / ω > 3) return randn_bm();
      if (num > leadTimeMaxValue) return randn_bm();
      return num;
    }

    function randomSkewNormal(alpha, location, scale) {
      let num = skewnorm.rSkewNorm(alpha, location, scale);
      if (num > leadTimeMaxValue) return randn_bm();
      return num;
    }

    function randomLogNormal() {
      let num = random.logNormal(logNorm.mean, logNorm.sd)();
      if (num > leadTimeMaxValue) return randn_bm();
      return num;
    }

    function randomWeibull() {
      let num = jsrand.weibull(shape,scale);
      if (num > leadTimeMaxValue) return randn_bm();
      return num;
    }

    if (distributionType == "Skew-Normal") {
      return randomSkewNormal(α, ξ, ω);
    } else if (distributionType == "Normal") {
      return randomNormal(mean, ω, med);
    } else if (distributionType == "Log-Normal") {
      return randomLogNormal();
    } else if (distributionType == "Weibull") {
      return randomWeibull();
    } 
    else {
      return null;
    }
    //TODO account for weekends in returned values
  };

  // Create n samples between min and max
  for (let i = 0; i < n; i++) {
    let rand_num = randn_bm();
    temparray.push(rand_num);
  }
  return temparray;
}

function getShapeAndScaleFromDataArray(dataArray) {
  let estimatedShape = computeShape(dataArray);
  let estimatedScale = computeScale(dataArray, estimatedShape)
  function getShape(p1, p2, p1Result, p2Result) {
    return (Math.log(-Math.log(1 - p2)) - Math.log(-Math.log(1 - p1))) / (Math.log(p2Result) - Math.log(p1Result))
  }
  function getScale(p1, p1Result, shape) {
    return p1Result / (Math.pow((-Math.log(1 - p1)), (1 / shape)));
  }
  function computeShape(dataArray) {
    var shape = 1.0

    var sampleDataArray = dataArray;

    shape = getShape(0.3, 0.7, quantile(sampleDataArray, 0.3), quantile(sampleDataArray, 0.7));

    return shape;
  }
  function computeScale(dataArray, EstimatedShape) {
    var scale = 1.0

    var sampleDataArray = dataArray;

    scale = getScale(0.3, quantile(sampleDataArray, 0.3), EstimatedShape);

    return scale;
  }

  function quantile(data, q) {
    var pos = ((data.length) - 1) * q;
    var base = Math.floor(pos);
    var rest = pos - base;
    if ((data[base + 1] !== undefined)) {
      return data[base] + rest * (data[base + 1] - data[base]);
    } else {
      return data[base];
    }
  }
  return {
      estimatedShape : estimatedShape,
      estimatedScale : estimatedScale
  }
}

function monteCarlo(
  dates,
  randomNumsLeadTime,
  randomNumsWorkAdded,
  workInParallelValue
) {
  let workLeft =
    dates[dates.length - 1].Backlog - dates[dates.length - 1].Work_Done;
  let adjustedWorkLeft =
    workLeft /
    workInParallelValue
  let sum =
    randomNumsLeadTime[Math.floor(Math.random() * randomNumsLeadTime.length)] *
    adjustedWorkLeft;
  if (sum < 0) sum = 0;

  return sum; //* (1 + randomNumsWorkAdded[Math.floor(Math.random() * randomNumsWorkAdded.length)]);
}

function runMonteCarlo(
  n,
  dates,
  randomNumsLeadTime,
  randomNumsWorkAdded,
  workInParallelValue
) {
  let runArray = [];
  for (let i = 0; i < n; i++) {
    runArray.push(
      monteCarlo(
        dates,
        randomNumsLeadTime,
        randomNumsWorkAdded,
        workInParallelValue
      )
    );
  }
  let monteCarloResults = {
    daysToCompletionArray: runArray,
    finalDistributionValuies: computeMeanSdAndItervalRangeMinMax(runArray),
    workInParallelValue: workInParallelValue,
    randomWorkAdded: computeMeanSdAndItervalRangeMinMax(randomNumsWorkAdded),
    confidence: getConfidence(runArray),
    bestAndWorstCaseForPlotObject: bestAndWorstCaseForPlot(
      dates,
      computeMeanSdAndItervalRangeMinMax(runArray),
      computeMeanSdAndItervalRangeMinMax(randomNumsWorkAdded),
      getConfidence(runArray)
    ),
  };
  return monteCarloResults;
}

const round_to_precision = (x, precision) => {
  var y = +x + (precision === undefined ? 0.5 : precision / 2);
  return y - (y % (precision === undefined ? 1 : +precision));
};

function getConfidence(rawDataArray) {
  let result = [];

  for (let j = 0; j < Math.max(...rawDataArray); j++) {
    result[j] = 0;
  }

  for (let i = 0; i < rawDataArray.length; i++) {
    let rand_num = rawDataArray[i];
    let rounded = round_to_precision(rand_num, 1);
    result[rounded] += 1;
  }

  let hc_data = [];
  for (const [key, val] of Object.entries(result)) {
    hc_data.push({ x: parseFloat(key), y: val / rawDataArray.length });
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
    { percent: 99, value: undefined },
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

function bestAndWorstCaseForPlot(
  historicalData,
  finalDistributionValues,
  randomWorkAdded,
  confidence
) {
  let lastDay =
    historicalData[historicalData.length - 1].Day.getTime() / 86400000;
  let lastDayBacklogTotal = historicalData[historicalData.length - 1].Backlog;
  let lastDayDoneTotal = historicalData[historicalData.length - 1].Work_Done;
  let worstCaseDays = confidence[5].value;
  let ninetyFivePercent = confidence[4].value;
  let ninetyPercent = confidence[3].value;
  let seventyFivePercent = confidence[2].value;
  let fiftyPercent = confidence[1].value;
  let bestCaseDays = confidence[0].value;
  //TODO: get average work added to not always be 0 
  let averageWorkAdded = 0 //randomWorkAdded.median;
  let resultArray = [];
  for (let i = 0; i < ninetyPercent; i++) {
    const date = new Date((i + lastDay) * 86400000),
      bckLgInc = averageWorkAdded * i + lastDayBacklogTotal,
      doneWC =
        (i *
          (averageWorkAdded * worstCaseDays +
            lastDayBacklogTotal -
            lastDayDoneTotal)) /
        worstCaseDays +
        lastDayDoneTotal,
      CF95 =
        (i *
          (averageWorkAdded * ninetyFivePercent +
            lastDayBacklogTotal -
            lastDayDoneTotal)) /
        ninetyFivePercent +
        lastDayDoneTotal,
      CF90 =
        (i *
          (averageWorkAdded * ninetyPercent +
            lastDayBacklogTotal -
            lastDayDoneTotal)) /
        ninetyPercent +
        lastDayDoneTotal,
      CF75 =
        (i *
          (averageWorkAdded * seventyFivePercent +
            lastDayBacklogTotal -
            lastDayDoneTotal)) /
        seventyFivePercent +
        lastDayDoneTotal,
      CF50 =
        (i *
          (averageWorkAdded * fiftyPercent +
            lastDayBacklogTotal -
            lastDayDoneTotal)) /
        fiftyPercent +
        lastDayDoneTotal,
      CF25 =
        (i *
          (averageWorkAdded * bestCaseDays +
            lastDayBacklogTotal -
            lastDayDoneTotal)) /
        bestCaseDays +
        lastDayDoneTotal;
    if (CF95 > lastDayBacklogTotal) {
      resultArray.push({
        day: date,
        backlogIncrease: bckLgInc,
        doneWorstCase: doneWC,
      });
    } else if (CF90 > lastDayBacklogTotal) {
      resultArray.push({
        day: date,
        backlogIncrease: bckLgInc,
        doneWorstCase: doneWC,
        confidence95: CF95,
      });
    } else if (CF75 > lastDayBacklogTotal) {
      resultArray.push({
        day: date,
        backlogIncrease: bckLgInc,
        doneWorstCase: doneWC,
        confidence95: CF95,
        confidence90: CF90,
      });
    } else if (CF50 > lastDayBacklogTotal) {
      resultArray.push({
        day: date,
        backlogIncrease: bckLgInc,
        doneWorstCase: doneWC,
        confidence95: CF95,
        confidence90: CF90,
        confidence75: CF75,
      });
    } else if (CF25 > lastDayBacklogTotal) {
      resultArray.push({
        day: date,
        backlogIncrease: bckLgInc,
        doneWorstCase: doneWC,
        confidence95: CF95,
        confidence90: CF90,
        confidence75: CF75,
        confidence50: CF50,
      });
    } else {
      resultArray.push({
        day: date,
        backlogIncrease: bckLgInc,
        doneWorstCase: doneWC,
        confidence95: CF95,
        confidence90: CF90,
        confidence75: CF75,
        confidence50: CF50,
        confidence25: CF25,
      });
    }
  }
  return resultArray;
}

function formatDate(date) {
  if (!isValidDate(date)) {
    return null;
  } else {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
}

function test(startDate, today, formattedData, distType) {
  let randomArr = randNumFromDistribution(
    computeMeanSdAndItervalRangeMinMax(
      lastElevenTickets(formattedData, today).map((o) => o["Lead Time"])
    ),
    distType
  );
  return runMonteCarlo(
    10000,
    createDateArray(
      formattedData,
      today,
      findEarliestDate(formattedData, startDate)
    ),
    randomArr,
    createDateArray(
      formattedData,
      today,
      findEarliestDate(formattedData, startDate)
    ).map((o) => o.Work_Added),
    today,
    formattedData
  );
}

export function monteCarloFunction(props) {
  console.log(props);
  let today = new Date(props.data.simulationDate);
  const distType = props.data.distribution;
 
  //set lead time max value
  props.data.leadTimeMaxValueOverride
    ? (leadTimeMaxValue = props.data.leadTimeMaxValueOverride)
    : (leadTimeMaxValue = 10000);
  props.data.ticketStartedCol || props.data.ticketStartedCol == "" ? ticketStartedCol = props.data.ticketStartedCol : ticketStartedCol = "New";
  const formattedData = removeNotWorkedTickets(dateChange(props.data.data));
  console.log(formattedData)
   //.replace(/-/g, '\/') exists to handle time change, see https://stackoverflow.com/questions/8215556/how-to-check-if-input-date-is-equal-to-todays-date
   let startDate =
   props.data.startDate == null || props.data.startDate == "" ? findEarliestDate(formattedData, false) : new Date(props.data.startDate.replace(/-/g, '/'));
  const leadTimeLastEleven = props.data.leadTimeOverride
    ? props.data.leadTimeOverride.split(",").map((x) => x * 1)
    : lastElevenTickets(
      formattedData,
      today,
      startDate
    ).map((o) => o["Lead Time"]);
  let forplot = createDateArray(
    formattedData,
    today,
    startDate,
    props.data.backlogOverride
  );
  const lastElevenData = computeMeanSdAndItervalRangeMinMax(leadTimeLastEleven);
  const randLastElevenData = computeMeanSdAndItervalRangeMinMax(
    randNumFromDistribution(lastElevenData, distType)
  );
  const workAdded = computeMeanSdAndItervalRangeMinMax(
    forplot.map((o) => o.Work_Added)
  );
  const randWorkadded = computeMeanSdAndItervalRangeMinMax(
    randNumFromDistribution(workAdded)
  );
  const workInParallelValue = workInParallel(formattedData, today, startDate, props.data.workInParallelOverride)
  let myBoyMonte = runMonteCarlo(
    10000,
    forplot,
    randNumFromDistribution(
      computeMeanSdAndItervalRangeMinMax(leadTimeLastEleven),
      distType
    ),
    forplot.map((o) => o.Work_Added),
    workInParallelValue
  );
  console.log(myBoyMonte)
  let plotdata = [];
  for (let i = 0; i < forplot.map((o) => o.Day).concat(myBoyMonte.bestAndWorstCaseForPlotObject.map((o) => o.day).slice(1)).length; i++) {
    plotdata.push({
      days: forplot
        .map((o) => o.Day)
        .concat(
          myBoyMonte.bestAndWorstCaseForPlotObject.map((o) => o.day).slice(1)
        )[i],
      backlog: forplot.map((o) => o.Backlog)[i],
      workDone: forplot.map((o) => o.Work_Done)[i],
      workIncrease: new Array(forplot.map((o) => o.Day).length - 1)
        .fill(undefined)
        .concat(
          myBoyMonte.bestAndWorstCaseForPlotObject.map((o) => o.backlogIncrease)
        )[i],
      confidence25: new Array(forplot.map((o) => o.Day).length - 1)
        .fill(undefined)
        .concat(
          myBoyMonte.bestAndWorstCaseForPlotObject.map((o) => o.confidence25)
        )[i],
      confidence50: new Array(forplot.map((o) => o.Day).length - 1)
        .fill(undefined)
        .concat(
          myBoyMonte.bestAndWorstCaseForPlotObject.map((o) => o.confidence50)
        )[i],
      confidence75: new Array(forplot.map((o) => o.Day).length - 1)
        .fill(undefined)
        .concat(
          myBoyMonte.bestAndWorstCaseForPlotObject.map((o) => o.confidence75)
        )[i],
      confidence90: new Array(forplot.map((o) => o.Day).length - 1)
        .fill(undefined)
        .concat(
          myBoyMonte.bestAndWorstCaseForPlotObject.map((o) => o.confidence90)
        )[i],
    });
  }
  return {
    monte: myBoyMonte,
    plotData: plotdata,
    leadtime: {
      leadTimeLastEleven: leadTimeLastEleven,
      lastElevenData: lastElevenData,
      randLastElevenData: randLastElevenData,
      randLeadTimeData: randNumFromDistribution(lastElevenData, distType),
    },
    workAdded: {
      workAdded: workAdded,
      randWorkAdded: randWorkadded,
    },
  };
}
