# SiteTalk English Trainer

A practical English speaking trainer for Mechanical Fabrication and Industrial Site work. It is built for Bangla-speaking learners, and every sentence comes with its Bangla meaning.

## Structure

```
index.html            page shell + all CSS (design tokens at the top, light + dark)
js/scenarios-1.js     scenario content, modules A (Daily), B (Fabrication), C (QC)
js/scenarios-2.js     scenario content, modules D (Maintenance), E (Safety), F (Problem solving)
js/grammar.js         categories, speaker names, 13 grammar lessons, 30-day plan
js/app.js             app logic: Data → Store → Voice → Coach → AI → Views → Router → Events
```

## Adding content

* **New scenario**: add an object to `scenarios-*.js`. Lines use `"SPEAKER|English|Bangla"`. Lines spoken by `Y` (You) automatically become Speaking Practice items and test questions.
* **New grammar lesson**: add it to `grammar.js` → `grammar`.
* **Change the 30-day plan**: edit `plan` in `grammar.js` (`{d, s: scenarioId, g: grammarId}`).

## How the app works

* **Progress** goes to `localStorage` straight away. When the page runs as a Claude artifact, it is also synced to a private per-user document (`data/users/<id>/progress`), so it follows the signed-in user across devices.
* **AI Supervisor** uses the artifact `sample` capability (Claude) for role-play and corrections. When that is not available, it falls back to an offline scripted coach. The offline coach uses word matching plus grammar rules with Bangla explanations (`RULES` in app.js).
* **Voice**: listening uses the browser's speech synthesis. Speaking uses browser speech recognition where it is allowed. Otherwise, use your phone keyboard's dictation key.

## Planned next steps

* More scenarios per module (format is ready, just add data).
* Server-side speech-to-text for pronunciation scoring.
* Spaced-repetition review of saved sentences.
