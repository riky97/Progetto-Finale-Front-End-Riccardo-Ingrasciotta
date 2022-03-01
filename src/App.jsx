import axios from "axios";
import { useEffect, useState } from "react";
import { getTopAnime } from "./api/home/getTopAnime";
import ViewListAnime from "./component/home/ViewListAnime";

function App() {
  const [topAnimeUpcoming, setTopAnimeUpcoming] = useState([]);
  useEffect(() => {
    const anime = async () => {
      const res = await getTopAnime();
      console.log(res);
      setTopAnimeUpcoming(res.top);
    };
    anime();
  }, []);

  return (
    <div className="App">
      <ViewListAnime information={topAnimeUpcoming} />
    </div>
  );
}

export default App;
