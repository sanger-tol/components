/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Timeline, Widgets } from "../tol-ui/src";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCheck, faTruck, faExclamation } from "@fortawesome/free-solid-svg-icons";

// Test timeline data
const aTimeline = [
    {
        date: "2021-07-02",
        title: "Sample Arrived",
        desc: "Sample arrived on site",
        type: "dot",
    },
    {
        date: "2021-08-03",
        title: "Released to Lab",
        desc: "Sample has been released to lab",
        type: "dot",
    },
    {
        date: "2021-08-15",
        title: "Active event",
        desc: "Active event description...",
        type: "active-dot",
    },
    {
        date: "2021-09-01",
        title: "Event not in progress",
        desc: "Event description...",
        type: "dot",
    }
]

const bTimeline = [
    {
        date: "2021-07-02",
        title: "Sample Arrived",
        desc: "Sample has arrived on site",
        type: <FontAwesomeIcon icon={faTruck} />,
    },
    {
        date: "2021-08-03",
        title: "Released to Lab",
        desc: "Sample has been released to lab",
        type: <FontAwesomeIcon icon={faUser} style={{ color: "#fff" }} />,
        color: "#1E555C",
    },
    {
        date: "2021-08-15",
        title: "Error!",
        desc: "Oh no...",
        type: <FontAwesomeIcon icon={faExclamation} style={{ color: "#fff" }} />,
        color: "#FF0000"
    },
    {
        date: "2021-09-01",
        title: "Less Important",
        desc: "Slightly less important event...",
        type: "dot",
    },
    {
        date: "2021-09-04",
        title: "Sequencing Complete",
        desc: "Sequencing is complete...",
        type: <FontAwesomeIcon icon={faCheck} style={{ color: "#fff" }} />,
        color: "#15b215",
    }
]

const cTimeline = [
    {
        date: "2021-07-02",
        title: "Sample Arrived",
        desc: "Sample has arrived on site",
        type: <FontAwesomeIcon icon={faCheck} style={{ color: "#42A5F5", borderColor: "#42A5F5" }} />,
    },
    {
        date: "2021-08-03",
        title: "Released to Lab",
        desc: "Sample has been released to lab",
        type: <FontAwesomeIcon icon={faCheck} style={{ color: "#42A5F5", borderColor: "#42A5F5" }} />,
    },
    {
        date: "2021-08-15",
        title: "Error!",
        desc: "Oh no...",
        type: <FontAwesomeIcon icon={faCheck} style={{ color: "#42A5F5", borderColor: "#42A5F5" }} />,
    },
    {
        date: "2021-09-01",
        title: "Less Important",
        desc: "Slightly less important event...",
        type: <FontAwesomeIcon icon={faCheck} style={{ color: "#42A5F5", borderColor: "#42A5F5" }} />,
    },
    {
        date: "2021-09-04",
        title: "Sequencing Complete",
        desc: "Sequencing is complete...",
        type: <FontAwesomeIcon icon={faCheck} />,
    }
]

const dTimeline = [
    {
        date: "2021-07-02",
        title: "Event 1",
        desc: "Event 1 description",
        type: <FontAwesomeIcon icon={faCheck} style={{ color: "#15b215", borderColor: "#15b215" }} />,
    },
    {
        date: "2021-08-03",
        title: "Event 2",
        desc: "Event 2 description",
        type: "dot"
    },
    {
        date: "2021-08-15",
        title: "Event 3",
        desc: "Event 3 description",
        type: "dot"
    },
    {
        date: "2021-09-01",
        title: "Event 4",
        desc: "Event 4 description",
        type: "dot"
    },
    {
        date: "2021-09-04",
        title: "Event 5",
        desc: "Event 5 description",
        type: "dot"
    }
]

function Timelines() {
    const aTimelineTitle = "Timeline of events for sample...";
    const bTimelineTitle = "Nice looking timeline for species [Rando Specicus], sample [#83882.94]";
    const cTimelineTitle = "Timeline of events using ticks...";
    const dTimelineTitle = "This timeline uses a single tick to determine current stage...";

    const incompleteTimeline = (
        <div>
            <h4>Incomplete Timeline</h4>
            <Timeline
                timelineTitle={aTimelineTitle}
                id="basic-timeline"
                endless
                timelineData={aTimeline}
            />
        </div>
    );

    const completeTimeline = (
        <div>
            <h4>Completed Timeline</h4>
            <Timeline
                timelineTitle={bTimelineTitle}
                id="basic-timeline"
                timelineData={bTimeline}
            />
        </div>
    );

    const tickTimeline = (
        <div>
            <h4>Tick Mark Timeline</h4>
            <Timeline
                timelineTitle={cTimelineTitle}
                id="tick-timeline"
                timelineData={cTimeline}
            />
        </div>
    );

    const singleTickTimeline = (
        <div>
            <h4>Single Tick Timeline</h4>
            <Timeline
                timelineTitle={dTimelineTitle}
                id="single-tick-timeline"
                timelineData={dTimeline}
            />
        </div>
    );

    const components = [
        {
            component: incompleteTimeline,
            type: "full"
        },
        {
            component: completeTimeline,
            type: "full"
        },
        {
            component: tickTimeline,
            type: "full"
        },
        {
            component: singleTickTimeline,
            type: "full"
        }
    ];

  return (
    <div>
      <Widgets components={components} />
    </div>
  );
}

export default Timelines;