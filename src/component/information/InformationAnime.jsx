import React, { useState, useEffect } from "react";
import { getInformationAnime } from "../../api/information/getInformationAnime";

const InformationAnime = () => {
  const [informationAnime, setInformationAnime] = useState([]);
  useEffect(() => {
    const anime = async () => {
      const res = await getInformationAnime();

      setInformationAnime(res);
    };
    anime();
  }, []);
  console.log(informationAnime);
  return <div style={{ color: "#fff" }}>InformationAnime</div>;
};

export default InformationAnime;
