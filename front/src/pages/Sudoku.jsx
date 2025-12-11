import { useEffect, useState } from "react";

export default function Sudoku() {
  const [grid, setGrid] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/sudoku/new", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(res => res.json())
      .then(data => setGrid(data));
  }, []);

  return (
    <div>
      {/* <h1>Sudoku</h1>
      {grid ? <pre>{JSON.stringify(grid, null, 2)}</pre> : "Loading..."} */}
    </div>
  );
}