import AITutor from './components/AITutor';

function App() {
  // This is the Bridge Function that talks to Rene
  const handleVisualize = (topic) => {
    if (!topic) {
      alert("Search for a topic first!");
      return;
    }
    // Deep-links to Rene on port 8000
    window.open(`http://localhost:8000?topic=${encodeURIComponent(topic)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* We pass the function as a 'prop' called onVisualize */}
      <AITutor onVisualize={handleVisualize} />
    </div>
  );
}

export default App;