import LeadGenerationForm from './components/LeadGenerationForm';

function App() {
  return (
    <div className="app-container">
      <header className="fade-in-down">
        <h1>Apollo Lead Generation</h1>
        <p>
          Submit the form below to trigger the n8n workflow: leads flow through
          Clay for personalization, then into your Instantly campaign.
        </p>
      </header>

      <div className="fade-in-up lead-form-wrap">
        <LeadGenerationForm />
      </div>
    </div>
  );
}

export default App;
