const express = require('express');
const events = require('events');

const app = express();

app.use(express.static('./'));

var output = 'nothing yet ';

var estimateData = function (data) {
  const currentlyInfected = {
    impact: data.reportedCases * 10,
    severeImpact: data.reportedCases * 50
  };

  var period = 30;
  if (data.periodType === 'months') {
    period = data.timeToElapse * 30;
  } else if (data.periodType === 'weeks') {
    period = data.timeToElapse * 7;
  } else {
    period = data.timeToElapse;
  }
  const infectionsByRequestedTime = {
    impact: currentlyInfected.impact * Math.pow(2, Math.round(period / 3)),
    severeImpact:
      currentlyInfected.severeImpact * Math.pow(2, Math.round(period / 3))
  };

  const severeCasesByRequestedTime = {
    impact: infectionsByRequestedTime.impact * 0.15,
    severeImpact: infectionsByRequestedTime.severeImpact * 0.15
  };

  const bedsAvailable = data.totalHospitalBeds * 0.35;

  var hospitalBedsByRequestedTime = {
    impact: bedsAvailable - severeCasesByRequestedTime.impact,
    severeImpact: bedsAvailable - severeCasesByRequestedTime.severeImpact
  };

  const casesForICUByRequestedTime = {
    impact: infectionsByRequestedTime.impact * 0.05,
    severeImpact: infectionsByRequestedTime.severeImpact * 0.05
  };

  const casesForVentilatorsByRequestedTime = {
    impact: infectionsByRequestedTime.impact * 0.02,
    severeImpact: infectionsByRequestedTime.severeImpact * 0.02
  };

  const dollarsInFlight = {
    impact: infectionsByRequestedTime.impact * 0.71 * 5 * period,
    severeImpact: infectionsByRequestedTime.severeImpact * 0.71 * 5 * period
  };

  return (output = {
    data: {
      region: {
        name: 'Africa',
        avgAge: 19.7,
        avgDailyIncomeInUSD: 5,
        avgDailyIncomePopulation: 0.71
      },
      periodType: data.periodType,
      timeToElapse: data.timeToElapse,
      reportedCases: data.reportedCases,
      population: data.population,
      totalHospitalBeds: data.totalHospitalBeds
    },
    impact: {
      currentlyInfected: currentlyInfected.impact,
      infectionsByRequestedTime: infectionsByRequestedTime.impact,
      severeCasesByRequestedTime: severeCasesByRequestedTime.impact,
      hospitalBedsByRequestedTime: hospitalBedsByRequestedTime.impact,
      casesForICUByRequestedTime: casesForICUByRequestedTime.impact,
      casesForVentilatorsByRequestedTime:
        casesForVentilatorsByRequestedTime.impact,
      dollarsInFlight: dollarsInFlight.impact
    },
    severeImpact: {
      currentlyInfected: currentlyInfected.severeImpact,
      infectionsByRequestedTime: infectionsByRequestedTime.severeImpact,
      severeCasesByRequestedTime: severeCasesByRequestedTime.severeImpact,
      hospitalBedsByRequestedTime: hospitalBedsByRequestedTime.severeImpact,
      casesForICUByRequestedTime: casesForICUByRequestedTime.severeImpact,
      casesForVentilatorsByRequestedTime:
        casesForVentilatorsByRequestedTime.severeImpact,
      dollarsInFlight: dollarsInFlight.severeImpact
    }
  });
};

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('index.ejs', { data: { output } });
});

app.get('/estimates', (req, res) => {
  res.render('estimates.ejs', { data: { output } });
});

app.post('/estimate', (req, res) => {
  const input = {
    population: req.body.population,
    timeToElapse: req.body.timeToElapse,
    reportedCases: req.body.reportedCases,
    totalHospitalBeds: req.body.totalHospitalBeds,
    periodType: req.body.periodType
  };
  estimateData(input);
  res.redirect('/estimates');
  res.render('estimates.ejs', { data: { output } });
});

app.listen(3000);
