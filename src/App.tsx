import "./App.css";
import { BoardWindow } from "./components/BoardWindow";
import { ScoreboardPage } from "./components/ScoreboardPage";

const isBoard = new URLSearchParams(window.location.search).get("view") === "board";

function App() {
    return isBoard ? <BoardWindow /> : <ScoreboardPage />;
}

export default App;
