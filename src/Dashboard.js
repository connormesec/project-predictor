import React, { useState } from "react";
import Papa from "papaparse";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Button from "@material-ui/core/Button";
import { TextField } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import { monteCarloFunction } from "./monteCarlo";
import CumulativeFlowDiagram from "./CumulativeFlowDiagram";
import MonteCarloFrequenctDiagram from "./MonteCarloFrequencyDiagram";
import MonteCarloConfidenceValues from "./MonteCarloConfidenceValues";
import { Input } from "@material-ui/core";
import LeadTimeFrequencyDiagram from "./LeadTimeFrequencyDiagram";
import LeadTimeConfidenceValues from "./LeadTimeConfidenceValues";
import LeadTimeRandomFrequencyDiagram from "./LeadTimeRandomFrequencyDiagram";

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
    height: "10%",
  },
  toolbarIcon: {
    height: "10%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    height: "10%",
    display: "flex",
    justifyContent: "center",
    background: "#26a69a",
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: -36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    height: "100%",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: 0,
  },
  drawerContainer: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "30%",
  },
  drawerLowerContainer: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "45%",
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: "500px",
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  overrideField: {
    height: "91%",
  },
  runButton: {
    height: "15%",
    background: "#26a69a",
  },
}));

export default function Dashboard() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
    resize();
  };
  const handleDrawerClose = () => {
    setOpen(false);
    resize();
  };
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [simulationDate, setSimulationDate] = useState(
    new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0]
  );
  const [csvFile, setCsvFile] = useState();
  const [startDate, setStartDate] = useState();
  const [data, setData] = useState();
  const [dist, setDist] = useState("Normal");
  const [monteResults, setMonteResults] = useState();
  const [leadTimeOverride, setLeadTimeOverride] = useState();
  const [backlogOverride, setBackLogOverride] = useState();
  const [workInParallelOverride, setWorkInParallelOverride] = useState();
  const [leadTimeMaxValueOverride, setLeadTimeMaxValueOverride] = useState();
  const [ticketStartedCol, setTicketStartedCol] = useState();
  const handleChange = (event) => setCsvFile(event.target.files[0]);
  const handleSimulationStartDateChange = (event) =>
    setSimulationDate(event.target.value);
  const handleStartDateChange = (event) => setStartDate(event.target.value);
  const handleLeadTimeOverrideChange = (event) =>
    setLeadTimeOverride(event.target.value);
  const updateData = (result) => {
    setData(result.data);
    setMonteResults(
      monteCarloFunction({
        data: {
          data: result.data,
          simulationDate: simulationDate.replace(/-/g, '/'),
          startDate: startDate,
          distribution: dist,
          leadTimeOverride: leadTimeOverride,
          backlogOverride: backlogOverride,
          workInParallelOverride: workInParallelOverride,
          leadTimeMaxValueOverride: leadTimeMaxValueOverride,
          ticketStartedCol: ticketStartedCol
        },
      })
    );
  };
  const importCSV = () =>
    Papa.parse(csvFile, {
      complete: updateData,
      header: true,
    });
  const handleMenuChange = (event) => {
    setDist(event.target.value);
  };

  console.log(simulationDate)

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              className={clsx(
                classes.menuButton,
                open && classes.menuButtonHidden
              )}
            >
              <ChevronRightIcon />
            </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Monte Carlo Simulation
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <div className={classes.drawerContainer}>
          <InputLabel htmlFor="import-button">
            <Input
              className={classes.textField}
              inputProps={{
                accept: ".csv",
              }}
              onChange={handleChange}
              style={{ hidden: { display: "none" } }}
              type="file"
              disableUnderline={true}
            />
          </InputLabel>
          <TextField
            id="date"
            label="Simulation Start Date (today)"
            type="date"
            value={simulationDate}
            onChange={handleSimulationStartDateChange}
            className={classes.textField}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
          />
          <FormControl variant="outlined" className={classes.textField}>
            <InputLabel>Distribution Type</InputLabel>
            <Select
              labelId="demo-simple-select-outlined-label"
              id="demo-simple-select-outlined"
              value={dist}
              onChange={handleMenuChange}
              label="Distribution Type"
            >
              <MenuItem value={"Normal"}>Normal</MenuItem>
              <MenuItem value={"Skew-Normal"}>Skew-Normal</MenuItem>
              <MenuItem value={"Log-Normal"}>Log-Normal</MenuItem>
              <MenuItem value={"Weibull"}>Weibull</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Divider className={classes.textField} />
        <div className={classes.drawerLowerContainer}>
        <TextField
            id="outlined-basic"
            label="Start Column"
            variant="outlined"
            onChange={(event) => setTicketStartedCol(event.target.value)}
            className={classes.overrideField}
          />
          <TextField
            id="date"
            label="Project Start Date"
            type="date"
            variant="outlined"
            onChange={handleStartDateChange}
            className={classes.overrideField}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            error={
              leadTimeOverride
                ? !/^\d+(?:,\d+)*$|^$/.test(leadTimeOverride)
                : false
            }
            id="outlined-basic"
            label="Lead Time"
            variant="outlined"
            onChange={handleLeadTimeOverrideChange}
            className={classes.overrideField}
          />
          <TextField
            error={
              backlogOverride ? !/^[1-9]\d*$|^$/.test(backlogOverride) : false
            }
            id="outlined-basic"
            label="Backlog"
            variant="outlined"
            onChange={(event) => setBackLogOverride(event.target.value)}
            className={classes.overrideField}
          />
          <TextField
            id="outlined-basic"
            label="Work In Parallel"
            variant="outlined"
            onChange={(event) => setWorkInParallelOverride(event.target.value)}
            className={classes.overrideField}
          />
          <TextField
            id="outlined-basic"
            label="Lead Time Max Value"
            variant="outlined"
            onChange={(event) =>
              setLeadTimeMaxValueOverride(event.target.value)
            }
            className={classes.overrideField}
          />
        </div>
        <Button
          disabled={dist && simulationDate && csvFile ? false : true}
          variant="contained"
          color="inherit"
          onClick={importCSV}
          className={classes.runButton}
        >
          <Typography
            component="h1"
            variant="h6"
            color="primary"
            noWrap
            className={classes.title}
          >
            Run
          </Typography>
        </Button>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        <Chartidge data={monteResults} />
      </main>
    </div>
  );
}

function Chartidge(props) {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  if (props.data) {
    return (
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={fixedHeightPaper}>
              <CumulativeFlowDiagram data={props.data} />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper className={fixedHeightPaper}>
              <MonteCarloConfidenceValues data={props.data} />
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <Paper className={fixedHeightPaper}>
              <MonteCarloFrequenctDiagram data={props.data} />
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper className={fixedHeightPaper}>
              <LeadTimeConfidenceValues data={props.data} />
            </Paper>
          </Grid>
          <Grid item xs={5}>
            <Paper className={fixedHeightPaper}>
              <LeadTimeFrequencyDiagram data={props.data} />
            </Paper>
          </Grid>
          <Grid item xs={5}>
            <Paper className={fixedHeightPaper}>
              <LeadTimeRandomFrequencyDiagram data={props.data} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  } else {
    return (
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <p>Documentation</p>
          </Grid>
        </Grid>
      </Container>
    );
  }
}

//trick the plots into resizing when the drawer is opened or closed
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const resize = async () => {
  await delay(300);
  window.dispatchEvent(new Event("resize"));
};
