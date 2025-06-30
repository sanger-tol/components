/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCheck,
  faTruck,
  faExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { Timeline, RemoteTimeline, Widgets, TimeLineData, TOL_DS } from "../tol-ui/src";


// Test Remote Timeline Data
const aRemoteTimeline: TimeLineData = {
  sts_sample_sts_submit_date_min: { title: "Compliance in Progress" },
  sts_sample_sts_accept_date_min: { title: "Approved to Ship" },
  sts_sample_sts_receive_date_min: { title: "Arrived at Sanger" },
  sts_sample_benchling_date_assigned_to_lab_min: { title: "Released to Lab" },
  grit_curation_grit_open_date_min: { title: "Assembly Complete" },
  grit_curation_grit_done_date_min: { title: "Curation" },
  grit_curation_grit_in_submission_date_min: {
    title: "ToLA / Grit Submission",
  },
  benchling_sequencing_request_benchling_completion_date_pacbio_min: {
    title: "PacBio Submission",
  },
  mlwh_run_data_mlwh_run_complete_pacbio_min: { title: "PacBio Extracted" },
  benchling_sequencing_request_benchling_completion_date_rnaseq_min: {
    title: "RNASeq Submission",
  },
  mlwh_run_data_mlwh_run_complete_rnaseq_min: { title: "RNASeq Extracted" },
  benchling_sequencing_request_benchling_completion_date_hic_min: {
    title: "HiC Submission",
  },
};

const bRemoteTimeline: TimeLineData = {
  sts_sample_sts_submit_date_min: {
    title: "Compliance in Progress",
    icon: <FontAwesomeIcon icon={faUser} style={{ color: "#fff" }} />,
    color: "#1E555C",
    desc: "Compliance is currently in progress...",
  },
  sts_sample_sts_accept_date_min: {
    title: "Approved to Ship",
    icon: "dot",
    desc: "This is an example of a timeline item without custom icon",
  },
  sts_sample_sts_receive_date_min: {
    title: "Arrived at Sanger",
    icon: <FontAwesomeIcon icon={faTruck} />,
    desc: "Sample has arrived on site and is ready to be released to lab",
  },
};

// Test timeline data
const aTimeline: TimeLineData = {
  "Sample Arrived": {
    date: new Date("2021-07-02"),
    icon: "dot",
    desc: "Sample has arrived on site",
  },
  "Released to Lab": {
    date: new Date("2021-08-03"),
    icon: "dot",
    desc: "Sample has been released to lab",
  },
  "Active event": {
    date: new Date("2021-08-15"),
    icon: "active-dot",
    desc: "This event is currently in progress",
  },
  "Event not in progress": {
    date: new Date("2021-09-01"),
    icon: "dot",
    desc: "This event is not currently in progress",
  },
};

const bTimeline: TimeLineData = {
  "Sample Arrived": {
    date: new Date("2021-07-02"),
    icon: <FontAwesomeIcon icon={faTruck} />,
    desc: "Sample has arrived on site",
  },
  "Released to Lab": {
    date: new Date("2021-08-03"),
    icon: <FontAwesomeIcon icon={faUser} style={{ color: "#fff" }} />,
    color: "#1E555C",
    desc: "Sample has been released to lab",
  },
  "Error!": {
    date: new Date("2021-08-15"),
    icon: <FontAwesomeIcon icon={faExclamation} style={{ color: "#fff" }} />,
    color: "#FF0000",
    desc: "Oh no...",
  },
  "Less Important": {
    date: new Date("2021-09-01"),
    icon: "dot",
    desc: "Slightly less important event...",
  },
  "Sequencing Complete": {
    date: new Date("2021-09-04"),
    icon: <FontAwesomeIcon icon={faCheck} style={{ color: "#fff" }} />,
    color: "#15b215",
    desc: "Sequencing is complete...",
  },
};

const cTimeline: TimeLineData = {
  "Sample Arrived": {
    date: new Date("2021-07-02"),
    icon: (
      <FontAwesomeIcon
        icon={faCheck}
        style={{ color: "#42A5F5", borderColor: "#42A5F5" }}
      />
    ),
    desc: "Sample has arrived on site",
  },
  "Released to Lab": {
    date: new Date("2021-08-03"),
    icon: (
      <FontAwesomeIcon
        icon={faCheck}
        style={{ color: "#42A5F5", borderColor: "#42A5F5" }}
      />
    ),
    desc: "Sample has been released to lab",
  },
  "Error!": {
    date: new Date("2021-08-15"),
    icon: (
      <FontAwesomeIcon
        icon={faCheck}
        style={{ color: "#42A5F5", borderColor: "#42A5F5" }}
      />
    ),
    desc: "Oh no...",
  },
  "Less Important": {
    date: new Date("2021-09-01"),
    icon: (
      <FontAwesomeIcon
        icon={faCheck}
        style={{ color: "#42A5F5", borderColor: "#42A5F5" }}
      />
    ),
    desc: "Slightly less important event...",
  },
  "Sequencing Complete": {
    date: new Date("2021-09-04"),
    icon: <FontAwesomeIcon icon={faCheck} />,
    desc: "Sequencing is complete...",
  },
};

export function Timelines() {
  const aTimelineTitle = "Timeline of events for sample...";
  const bTimelineTitle =
    "Nice looking timeline for species [Rando Specicus], sample [#83882.94]";
  const cTimelineTitle = "Timeline of events using ticks...";

  const remoteTimelineA = (
    <div>
      <h4>Remote Timeline with Default Dots</h4>
      <RemoteTimeline
        objectType="species"
        dataSource={TOL_DS}
        id="71285"
        data={aRemoteTimeline}
        titleDataPoint="sts_scientific_name"
        defaultIcon
        dateWithDay
      />
    </div>
  );

  const remoteTimelineB = (
    <div>
      <h4>Remote Timeline with Custom Dots</h4>
      <RemoteTimeline
        objectType="species"
        dataSource={TOL_DS}
        id="572802"
        data={bRemoteTimeline}
        titleDataPoint="Random Name"
      />
    </div>
  );

  const incompleteTimeline = (
    <div>
      <h4>Incomplete Timeline</h4>
      <Timeline
        title={aTimelineTitle}
        id="basic-timeline"
        endless
        data={aTimeline}
      />
    </div>
  );

  const completeTimeline = (
    <div>
      <h4>Completed Timeline</h4>
      <Timeline title={bTimelineTitle} id="basic-timeline" data={bTimeline} />
    </div>
  );

  const tickTimeline = (
    <div>
      <h4>Tick Mark Timeline</h4>
      <Timeline title={cTimelineTitle} id="tick-timeline" data={cTimeline} />
    </div>
  );

  const components = [
    {
      component: remoteTimelineA,
      type: "full",
    },
    {
      component: remoteTimelineB,
      type: "full",
    },
    {
      component: incompleteTimeline,
      type: "full",
    },
    {
      component: completeTimeline,
      type: "full",
    },
    {
      component: tickTimeline,
      type: "full",
    },
  ];

  return (
    <div>
      <Widgets components={components} />
    </div>
  );
}
