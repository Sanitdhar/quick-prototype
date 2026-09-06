import { useState } from 'react';
import './App.css';

interface Idea {
  id: number;
  text: string;
}

export function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [draft, setDraft] = useState('');

  function addIdea(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setIdeas((prev) => [...prev, { id: Date.now(), text }]);
    setDraft('');
  }

  function removeIdea(id: number) {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }

  return (
    <main className="app">
      <h1>Prototype starter</h1>
      <p>Delete this and build the real thing. Here's a working form + list to get going.</p>

      <form onSubmit={addIdea}>
        <input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          placeholder="What's the idea?"
          aria-label="New idea"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {ideas.map((idea) => (
          <li key={idea.id}>
            {idea.text}
            <button
              type="button"
              onClick={() => {
                removeIdea(idea.id);
              }}
              aria-label={`Remove ${idea.text}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
