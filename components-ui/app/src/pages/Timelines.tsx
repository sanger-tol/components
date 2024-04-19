/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Timeline, Widgets } from '../tol-ui/src';

// Test timeline data
const aTimeline = [
    {
        date: "2021-07-02",
        title: "Sample Arrived",
        desc: "Sample arrived on site",
        active: false
    },
    {
        date: "2021-08-03",
        title: "Released to Lab",
        desc: "Sample has been released to lab",
        active: false
    },
    {
        date: "2021-08-15",
        title: "Event 3",
        desc: "Event 3 description...",
        active: true
    },
    {
        date: "2021-09-01",
        title: "Event 4",
        desc: "Event 4 description...",
        active: true
    }
]

const bTimeline = [
    {
        date: "2021-07-02",
        title: "Sample Arrived",
        desc: "Sample arrived on site",
        active: false
    },
    {
        date: "2021-08-03",
        title: "Released to Lab",
        desc: "Sample has been released to lab",
        active: false
    },
    {
        date: "2021-08-15",
        title: "Event 3",
        desc: "Event 3 description...",
        active: true
    },
    {
        date: "2021-09-01",
        title: "Event 4",
        desc: "Event 4 description...",
        active: true
    },
    {
        date: "2021-09-04",
        title: "Sequencing Complete",
        desc: "Sequencing is complete...",
        active: true
    }
]

function Timelines() {
    const aTimelineTitle = "Timeline of events for sample...";
    const bTimelineTitle = "Complete timeline of events for sample...";

    const incompleteTimeline = (
        <div>
            <h4>Incomplete Timeline</h4>
            <Timeline
                timelineTitle={aTimelineTitle}
                id="basic-timeline"
                endless={true}
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
                endless={false}
                timelineData={bTimeline}
            />
        </div>
    );

    const components = [
        {
            component: incompleteTimeline,
            type: 'full'
        },
        {
            component: completeTimeline,
            type: 'full'
        }
    ];

    return (
        <div>
            <Widgets components={components} />
        </div>
    );
}

export default Timelines;