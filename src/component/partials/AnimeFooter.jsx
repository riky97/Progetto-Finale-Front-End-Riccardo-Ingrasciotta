//ANTD
import { Layout } from "antd";

import useWindowDimensions from "../shared/UseWindowDimensions";

const { Footer } = Layout;

const AnimeFooter = () => {
  const { height, width } = useWindowDimensions();
  return (
    <Footer
      className={`anime-footer ${width <= 768 ? "anime-footer-bottom" : ""}`}
    >
      Anime List ©2022 Created by Riccardo Ingrasciotta
    </Footer>
  );
};

export default AnimeFooter;
