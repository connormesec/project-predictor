import './App.css';
import FileReader from './FileReader';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="App">
        <FileReader/> </div>
      </header>
    </div>
  );
}

function Plots({data}) {
  console.log(data);
}

export default App;
