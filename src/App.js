import './App.css';
import FileReader from './FileReader';


function App() {
  return (
    <div className="App">
        <FileReader/>
    </div>
  );
}

function Plots({data}) {
  console.log(data);
}

export default App;
