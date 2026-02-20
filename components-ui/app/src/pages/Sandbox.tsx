/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { 
  Widgets, 
  IWidgetsComponent,
  ImageComponent,
  ImageCarousel,
  ImagesComponent,
  ImageList
} from "@tol/tol-ui";

export function Sandbox() {
  // Sample image URLs for testing
  const sampleImages = [
    "https://picsum.photos/800/600?random=1",
    "https://picsum.photos/800/600?random=2",
    "https://picsum.photos/800/600?random=3",
    "https://picsum.photos/800/600?random=4",
  ];

  const ImageComponentDemo = (
    <div>
      <h3>ImageComponent</h3>
      <p>A single image component with customizable height and fill options</p>
      <div style={{ border: "1px solid #ccc", padding: "20px", height: "300px" }}>
        <ImageComponent link={sampleImages[0]} height="250px" />
      </div>
    </div>
  );

  const ImageCarouselDemo = (
    <div>
      <h3>ImageCarousel</h3>
      <p>Carousel with navigation arrows (arrows hidden when only 1 image)</p>
      <div style={{ border: "1px solid #ccc", padding: "20px", height: "400px" }}>
        <ImageCarousel 
          links={sampleImages} 
          link={sampleImages[0]} 
          height="350px" 
        />
      </div>
    </div>
  );

  const ImagesComponentDemo = (
    <div>
      <h3>ImagesComponent</h3>
      <p>Main images component combining carousel functionality</p>
      <div style={{ border: "1px solid #ccc", padding: "20px", height: "400px" }}>
        <ImagesComponent 
          links={sampleImages} 
          height="350px" 
        />
      </div>
    </div>
  );

  const ImageListDemo = (
    <div>
      <h3>ImageList</h3>
      <p>Horizontal scrollable list with modal on click</p>
      <div style={{ border: "1px solid #ccc", padding: "20px" }}>
        <ImageList 
          links={sampleImages} 
          height="150px" 
        />
      </div>
    </div>
  );

  const components: IWidgetsComponent[] = [
    {
      component: <h1>Image Components Sandbox</h1>,
      type: "full"
    },
    {
      component: ImageComponentDemo,
      type: "full"
    },
    {
      component: ImageCarouselDemo,
      type: "full"
    },
    {
      component: ImagesComponentDemo,
      type: "full"
    },
    {
      component: ImageListDemo,
      type: "full"
    }
  ];

  return <Widgets components={components} />;
}
