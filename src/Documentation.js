import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

function Documentation() {
  const useStyles = makeStyles((theme) => ({
    title: {},
    body: {
      align: "left",
    },
    sublist: {
      marginLeft: "20px",
    },
  }));
  const classes = useStyles();
  return (
    <div>
      <Typography variant="h4" className={classes.title}>
        Documentation
      </Typography>

      <Typography variant="body1" align="left" className={classes.body}>
        This app allows users to run a Monte Carlo simulation on their projects
        with the click of a button. If you have any questions or concerns please
        reach out to Connor Mesec.
      </Typography>

      <Typography variant="h6" className={classes.title}>
        Getting Started
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        Before you use this app, please make sure that you have access to Jira
        and the Jira plugin{" "}
        <a href="https://marketplace.atlassian.com/apps/1211756/time-in-status?hosting=cloud&tab=overview">
          Time In Status
        </a>
        . The following steps will show you how to use the Monte Carlo
        simulation:
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        1. Export a csv of a project that you want to simulate
      </Typography>
      <Typography variant="body1" align="left" className={classes.sublist}>
        a. Go to the Time In Status App (https://jira.atl.[your jira server
        here].net/plugins/servlet/timeinstatus)
      </Typography>
      <Typography variant="body1" align="left" className={classes.sublist}>
        b. Set the "Filter Type" dropdown to "Custom JQL" and input the JQL that
        encompasses the tickets in the project to be simulated. For example if
        you want to simulate Project A and all of the tickets associated with
        Project A are in the epic PROJ-123, then you would set the dropdown to
        "Custom JQL" and in the text field enter "Epic Link" = PROJ-123.
      </Typography>
      <Typography variant="body1" align="left" className={classes.sublist}>
        c. Set the "Columns By" dropdown to "Last Transition From Status Date"
        under "Date Reports".
      </Typography>
      <Typography variant="body1" align="left" className={classes.sublist}>
        d. In the "Statuses" dropdown first make sure "Closed" and "Merged" are
        included in the report. Then make sure the status is selected that
        developers move the ticket out of before beginning progress. For
        example, if your team Jira process is "Ready for Dev"-{">"}"In
        Progress"-{">"}"Code Review"-{">"}"Done". Then you would need to make
        sure that "Ready for Dev" is included in the report as it was the last
        status before devs begin progress on a ticket. This field is defaulted
        to "New" in the app so you will need to add "Ready for Dev" to the Start
        Column Overwrite field.
      </Typography>
      <Typography variant="body1" align="left" className={classes.sublist}>
        e. In the "Fields" dropdown first make sure "Created", "Status", and
        "Labels" are included in the report.
      </Typography>
      <Typography variant="body1" align="left" className={classes.sublist}>
        f. Press "enter" to generate the report
      </Typography>
      <Typography variant="body1" align="left" className={classes.sublist}>
        g. Press the "export" button on the far right of the report to bring up
        the Export Modal and press the blue export button
      </Typography>
      <Typography variant="body1" align="left" className={classes.sublist}>
        h. The modal will show a loading spinner and then take you to the
        "Previous Exports" tab. Download the export bly clicking on the cloud
        icon to the right of the export
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        2. Go to the Monte Carlo web app. Upload the csv into the app by
        clicking "choose file" in the left hand panel. The "Run" button at the
        bottom should become enabled
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        3. Select the date that you would like the simulation to start at. This
        is normally left as the current date, however, it can be interesting to
        see if the estimated completion dates were accurate at an earlier day
        during project development.
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        4. Select the distribution type you would like to use, the most accurate
        according to research has shown to be the Weibull distribution.
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        5. Click the "Run" button. Your results will appear momentarily.
      </Typography>
      <Typography variant="h6" className={classes.title}>
        How it works
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        This Monte Carlo simulation looks at the last 11 completed tickets from
        the imported csv and determines their lead time. It then uses this data
        to build a{" "}
        <a href="https://en.wikipedia.org/wiki/Cumulative_flow_diagram">
          cumulative flow diagram
        </a>{" "}
        and estimate completion dates based on confidence values. This app is
        essentially an automated version of{" "}
        <a href="http://www.kanbandan.com/?p=14">
          Dan Brown's method of estimating
        </a>
        .
      </Typography>
      <Typography variant="h6" className={classes.title}>
        Override Options Explained
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        <b>Start Column:</b> Defaults to "New". Add the status that devs move
        tickets out of as they transition tickets to "In Progress". See Getting
        Started step 1d.
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        <b>Project Start Date:</b> Defaults to earliest created date from the
        imported csv. Use this if the project had a long delay with tickets left
        in progress. For example if you have a project that expands over
        Christmas, set the project start date to the Monday after the holidays
        so the tickets left open over Christmas are not accounted for.
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        <b>Lead Time:</b> Defaults to the last 11 tickets, if there are less
        than 11 tickets it will include however many are available. Use this if
        you want to override the 11 ticket lead times, enter lead times as
        integers separated by commas (1,2,3,4,5). For example, if you have a
        project that has not been started yet or is in the early stages of
        development, you can input the lead times of the past few tickets from
        another project to get a prediction.
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        <b>Backlog:</b> Defaults to total tickets minus completed tickets. Use
        this if you want to manually set how many tickets are in the backlog.
        For example, if you have a project with a backlog of 20 tickets and want
        to see how the estimated completion date might change if 10 more tickets
        were added, then you would put 30 in the override field.
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        <b>Work In Parallel:</b> Override this if you want to see how the
        simulation would change if more developers were added or taken away from
        the project. In theory two developers should have a work in parallel
        value of two but in practice each developer tend to add 0.8 to the work
        in parallel value. For example if you have a project with two developers
        working on it with a work in parallel value of 1.3 and you want to see
        how the estimated completion dates will change if another is added then
        you would add 0.8 to your work in parallel value and input 2.1 in the
        override field.
      </Typography>
      <Typography variant="body1" align="left" className={classes.body}>
        <b>Lead Time Max Value:</b> If you want to remove lead time outliers
        above a certain threshold use this field. This is useful for lognormal
        and Weibull distributions as their distributions are based on logarithms
        and result in some very pessimistic results if this field is not used.
        For example, if you wanted to get a more accurate prediction and you
        know that you had a ticket with a lead time of 22 days you could set the
        override to 15 and the outlier would not be factored into the
        simulation.
      </Typography>
      <Typography variant="h6" className={classes.title}>
        This code is available on{" "}
        <a href="https://github.com/connormesec/project-predictor">Github</a>
      </Typography>
    </div>
  );
}

export default Documentation;
