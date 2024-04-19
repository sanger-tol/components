/*
SPDX-FileCopyrightText: 2022 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Timeline as TL } from 'rsuite';
import { Col, Row } from '../index';

interface Props {
    id: string,
    timelineTitle: string,
    endless: boolean,
    timelineData: {
        date: string,
        title: string,
        desc: string,
        active?: boolean,
    }[]
}

function Timeline(props: Props) {
    const { id, timelineTitle, endless, timelineData } = props;

    return (
        <Col>
            <div>
                <Row>
                    <p className="timeline-header-text">{timelineTitle}</p>
                </Row>
                <Row>
                    <TL endless={endless} className="timeline-wrapper" id={id}>
                        {timelineData.map((item) => (
                            <TL.Item key={item.date} time={item.date}>
                                <p className="timeline-item-header-text">{item.title}</p>
                                <p>{item.desc}</p>
                            </TL.Item>
                        ))
                        }
                    </TL>
                </Row>
            </div>
        </Col>

    );
}

export default Timeline;