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
let audioCtx = null;

// Map note+octave to frequency (equal temperament, A4 = 440 Hz)
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
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } else if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const { note, octave } = sequence[index];
  const freq = getFrequency(note, octave);

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.4, audioCtx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
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