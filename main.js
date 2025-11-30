const notes = ["A", "B", "C", "D", "E", "F", "G"];
const octaves = [4, 5];

// Precompute the sequence: A4..G4, A5..G5
const sequence = [];
for (const octave of octaves) {
  for (const note of notes) {
    sequence.push({ note, octave });
  }
}

let index = 0;

// Preload audio for each note+octave pair
const noteAudioMap = {};
for (const { note, octave } of sequence) {
  const key = `${note}${octave}`;
  if (!noteAudioMap[key]) {
    noteAudioMap[key] = new Audio(`./${key}.mp3`);
  }
}

// Map note+octave to frequency (equal temperament, A4 = 440 Hz)
// (kept in case you want to go back to synthesized tones later)
function getFrequency(note, octave) {
  const semitonesFromA4 = {
    C: -9,
    D: -7,
    E: -5,
    F: -4,
    G: -2,
    A: 0,
    B: 2,
  };

  const n = semitonesFromA4[note] + (octave - 4) * 12;
  return 440 * Math.pow(2, n / 12);
}

function playCurrentNote() {
  const { note, octave } = sequence[index];
  const key = `${note}${octave}`;
  const baseAudio = noteAudioMap[key];

  if (!baseAudio) return;

  // Clone so rapid taps can overlap without cutting off previous notes
  const audio = baseAudio.cloneNode(true);
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Ignore play errors (e.g. if browser blocks before user gesture)
  });
}

function updateDisplay() {
  const { note, octave } = sequence[index];
  document.getElementById("note").textContent = note;
  document.getElementById("octave").textContent = `Octave ${octave}`;
}

function nextNote() {
  index = (index + 1) % sequence.length;
  updateDisplay();
  playCurrentNote();
}

function handleTap(event) {
  event.preventDefault();
  nextNote();
}

updateDisplay(); // show initial A4

const app = document.getElementById("app");
app.addEventListener("click", handleTap, { passive: false });
app.addEventListener("touchend", handleTap, { passive: false });