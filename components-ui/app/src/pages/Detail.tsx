/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { Button, CentreContents } from '../tol-ui/src';
import { Link } from "react-router-dom"

const buttonStyle = {
    marginBottom: '10px', // Adjust the value based on your preferred spacing
}

const detail = {
    "id1": 1230139,
    "id2": 1230140
}

function Detail() {
    return (
        <div>
            <CentreContents>
                <div style={buttonStyle}>
                    <Link to={'detail/' + detail.id1}>
                        <Button>Get Graphomya maculata</Button>
                    </Link>
                </div>
                <div style={buttonStyle}>
                    <Link to={'detail/' + detail.id2}>
                        <Button>Get Hebecnema nigra</Button>
                    </Link>
                </div>
            </CentreContents>
        </div>
    );
}

export default Detail;