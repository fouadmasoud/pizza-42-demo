import React from "react";

import logo from "../assets/pizza 42-logos_black.png";

const Hero = () => (
  <div className="text-center hero my-5">
    <img className="mb-3" src={logo} alt="Pizza42 logo" width="240" />
    <h1 className="mb-4">Making Great Pizza Since 1942</h1>
  </div>
);

export default Hero;
