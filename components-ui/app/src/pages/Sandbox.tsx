/*
SPDX-FileCopyrightText: 2023 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { OrgChart } from "../tol-ui/src";
import { OrgChartDataPoint } from "../tol-ui/src/charts/OrgChart";

function Sandbox() {
  // This example will be deleted after review.
  const orgChartData: OrgChartDataPoint[] = [
    {
      title: "test test",
      contact: "test",
      email: "test@test.com",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel feugiat dui. Sed lacus ligula, maximus eget aliquam ultricies, molestie a erat. Vivamus sit amet arcu orci. Morbi aliquam sed nisl sed sodales. Morbi ac cursus lorem. Sed pharetra laoreet risus, ut congue libero malesuada vel. Nam ac tellus ullamcorper, rhoncus lectus at, sollicitudin quam. Proin sodales porttitor neque ut convallis. Nam imperdiet eleifend posuere.",
    },
    {
      title: "test test",
      contact: "test",
      email: "test@test.com",
      description: "",
    },
    {
      title: "test test",
      contact: "test",
      email: "test@test.com",
      description: "",
    },
    {
      title: "test test",
      contact: "test",
      email: "test@test.com",
      description: "",
    },
    {
      title: "test test",
      contact: "test",
      email: "test@test.com",
      description: "",
    },
    {
      title: "test test",
      contact: "test",
      email: "test@test.com",
      description: "",
    },
  ];

  return (
    <OrgChart
      title={"Test Team"}
      data={orgChartData}
      subtitle="Click on each team to view test information."
      bordered
      modalKeys={["title", "contact", "email", "description"]}
      boxKeys={["contact"]}
    />
  );
}

export default Sandbox;
