/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { createAxiosInstance } from "../tol-ui/src/services/http/axios";
import { IButton } from "../tol-ui/src/general/Button";
import { UtilityBar } from "../tol-ui/src";
// import XLSX from 'xlsx';
var XLSX = require("xlsx");

function Sandbox() {
  const url = "https://docs.sheetjs.com";
  
  const axiosInstance = createAxiosInstance({
    baseURL: url,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  const FetchButton: IButton = {
    position: "right",
    type: "primary",
    text: "fetch",
    onClick: () => fetchData(),
  };
  
  const fetchData = () => {
  axiosInstance.get('/executive.json') // Relative to baseURL, so this hits https://api.example.com/data
  .then(response => {
    console.log('Data:', response.data);
    return response.data;
  })
  .then(raw_data => {
    console.log('renamedData:', raw_data);
    const prez = raw_data.filter(row => row.terms.some(term => term.type === "prez"));
    prez.forEach(row => row.start = row.terms.find(term => term.type === "prez").start);
    prez.sort((l,r) => l.start.localeCompare(r.start));
    const rows = prez.map(row => ({
      name: row.name.first + " " + row.name.last,
      birthday: row.bio.birthday
    }));
    console.log("Row details:", rows);
    const worksheet = XLSX.utils.json_to_sheet(rows);
  })
  }
  return <>
  <UtilityBar id="editor-markdown"
      buttons={[FetchButton]}/>
  </>;
}

export default Sandbox;
