 Strength Trainer
A personal strength-training app for a 44-year-old woman training at home, built to a single rule: every exercise, set, rep and rest interval is chosen because evidence supports it — not because it's popular.
Status: in development. Nothing here is a finished product yet. Rename the repo and this heading once you've picked a name.
Why this exists
Commercial training apps (Fitbod, Gravl and similar) are built around two assumptions that don't hold here:
They assume a gym. Their progression engine adds weight from an estimated 1RM. That breaks when you train at home with a fixed set of dumbbells.
They assume male research. Almost all hypertrophy programming is extrapolated from trials in young men. Rest intervals, fatigue accumulation, effective rep ranges and recovery windows are not identical in women over 40.
This app is a program written for one person, with the evidence shown.
Principles
1. One best exercise per muscle group. Not ten variations of a curl. Each selection is justified — lengthened-position bias, regional hypertrophy data, load-matched trials.
2. Evidence from women, ideally women over 40. Where that research doesn't exist, the app says so rather than quietly borrowing from male data.
3. No invented numbers. Every prescription traces to a source. Unknown is written as "unknown".
4. Progression is an explicit rule, not a feeling — and it has to work on weeks when load can't increase.
   
 Features
  Feature
Set logging
What it does
Suggested weight and reps pre-filled; editable, with a reps-in-reserve rating
     Weekly plan
   Split, frequency and rest/active-recovery days chosen from evidence, not from a preferred day count
 Today's session
    Warm-up, working sets, cool-down stretches for the muscles actually trained
       Soreness swap
   One tap moves a sore muscle group out of today and rebuilds the week without losing weekly volume
     Auto- progression
   Next week's prescription is generated from what was logged this week
     Pull-up ladder
   Staged progression toward a first strict pull-up, tracked as a goal
 Charts
    Weekly volume per muscle group, estimated 1RM over time, pull-up stage, adherence
  Export
CSV / JSON — the training history belongs to the user, not the app
   Equipment model
The app only prescribes movements possible with equipment actually owned: Dumbbells (various weights), kettlebell, barbell with plates
Pull-up bar and dip/parallel bars (Decathlon training tower)
Adjustable incline bench
Loop bands, handle bands, foam roller
Water rowing machine (used for active-recovery days)
Equipment is a configurable list. When the best program needs a load that isn't owned, the app names the specific weight to buy rather than downgrading the exercise.
 
 Tech stack
React + TypeScript
Tailwind CSS
shadcn/ui components
Recharts for progress charts
Local persistence (IndexedDB / localStorage), no account required
Mobile-first. The primary use case is a phone on the bench between sets.
Getting started
  git clone <repo-url>
  cd <repo>
  npm install
  npm run dev
Then open the local URL the dev server prints.
   npm run build
npm run lint
npm test
# production build
# lint
# tests
 Project structure
 src/
  components/
  data/
  engine/
  screens/
  storage/
UI components (shadcn/ui based)
exercise library + evidence references
program generation, progression, volume rules
weekly plan, session, history, charts
persistence and export
The engine/ and data/ directories are the parts that matter. Everything else is presentation.
   
 Evidence
Programming decisions live in docs/evidence.md as a table of claim → source → strength of evidence. If a rule in engine/ isn't in that table, it shouldn't be in the app.
Roadmap
Exercise library with evidence annotations Program generator (split, volume, frequency) Session logging and persistence Auto-progression from logged history Soreness swap and week rebuild
Charts
Pull-up ladder CSV / JSON export
Disclaimer
This is a personal project, not medical advice. It doesn't account for injury, medication, or any health condition. Talk to a doctor or a qualified coach before starting or changing a training program.
License
[Choose one — MIT is the usual default for a personal project.]
     
