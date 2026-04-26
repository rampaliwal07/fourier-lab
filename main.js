// Shared JS for all pages – navigation, simulation, quizzes, feedback
document.addEventListener('DOMContentLoaded', () => {
    // Highlight current page in sidebar
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('data-page');
        if (href === currentPage) {
            item.classList.add('active');
        }
    });

    // Initialize page-specific functions
    if (currentPage === 'simulation.html') initSimulation();
    if (currentPage === 'pretest.html') initPretest();
    if (currentPage === 'posttest.html') initPosttest();
    if (currentPage === 'feedback.html') initFeedback();
});

// ---------- SIMULATION: STEP-BY-STEP FOURIER SERIES ----------
function initSimulation() {
    const funcSelect = document.getElementById('funcSelect');
    const LInput = document.getElementById('Lval');
    const generateBtn = document.getElementById('generateBtn');
    const resultDiv = document.getElementById('stepResult');

    function formatNumber(val, digits = 4) {
        if (Math.abs(val) < 1e-8) return "0";
        let rounded = Number(val).toFixed(digits);
        if (rounded.includes('.') && rounded.endsWith('0'.repeat(digits))) {
            rounded = Math.round(val).toString();
        }
        return rounded;
    }

    function getCoefficients(funcType, L) {
        if (funcType === 'square') {
            return {
                a0: 0,
                an: (n) => 0,
                bn: (n) => (n % 2 === 1) ? 4 / (n * Math.PI) : 0,
                explanation: "Square wave is odd → only sine terms. bₙ = 4/(nπ) for odd n."
            };
        } else if (funcType === 'sawtooth') {
            return {
                a0: 0,
                an: (n) => 0,
                bn: (n) => (2 * Math.pow(-1, n + 1)) / (n * Math.PI),
                explanation: "Sawtooth wave is odd → only sine terms. bₙ = 2·(-1)^{n+1}/(nπ)."
            };
        } else if (funcType === 'triangle') {
            return {
                a0: 1,
                an: (n) => (n % 2 === 1) ? 8 / (Math.pow(n, 2) * Math.pow(Math.PI, 2)) : 0,
                bn: (n) => 0,
                explanation: "Triangle wave is even → only cosine terms. a₀ = 1, aₙ = 8/(n²π²) for odd n."
            };
        } else { // halfrect
            return {
                a0: 2 / Math.PI,
                an: (n) => {
                    if (n === 1) return 0.5;
                    if (n % 2 === 0) return 0;
                    return -2 / (Math.PI * (n * n - 1));
                },
                bn: (n) => (n === 1) ? 0.5 : 0,
                explanation: "Half‑rectified sine has both sine and cosine terms. a₀ = 2/π, a₁ = b₁ = 1/2, aₙ = -2/(π(n²-1)) for odd n>1."
            };
        }
    }

    function generate() {
        let L = parseFloat(LInput.value);
        if (isNaN(L) || L <= 0) {
            resultDiv.innerHTML = '<div class="step-card" style="color:red;">❌ Please enter a valid positive L.</div>';
            return;
        }
        const funcType = funcSelect.value;
        const coeffs = getCoefficients(funcType, L);
        const a0 = coeffs.a0;
        const an = coeffs.an;
        const bn = coeffs.bn;

        let html = `<div class="step-card">
                        <strong>🔢 Step 1 – Function & interval</strong><br>
                        f(x) is periodic with period 2L = ${formatNumber(2*L)}. L = ${formatNumber(L)}.
                        <br><br>
                        <strong>📐 Step 2 – General Fourier series formula</strong><br>
                        f(x) = a₀/2 + Σₙ₌₁^∞ [ aₙ cos(nπx/L) + bₙ sin(nπx/L) ]
                    </div>`;

        html += `<div class="step-card">
                    <strong>⚙️ Step 3 – Coefficient calculation</strong><br>
                    ${coeffs.explanation}<br>
                    a₀ = ${formatNumber(a0)} &nbsp;&nbsp;→ a₀/2 = ${formatNumber(a0/2)}<br>`;

        // Show first few non-zero coefficients
        let cosTerms = '', sinTerms = '';
        for (let n = 1; n <= 5; n++) {
            let a_n = an(n);
            let b_n = bn(n);
            if (Math.abs(a_n) > 1e-6) {
                cosTerms += ` ${a_n > 0 ? '+' : '-'} ${formatNumber(Math.abs(a_n))}·cos(${n}πx/${formatNumber(L)})`;
            }
            if (Math.abs(b_n) > 1e-6) {
                sinTerms += ` ${b_n > 0 ? '+' : '-'} ${formatNumber(Math.abs(b_n))}·sin(${n}πx/${formatNumber(L)})`;
            }
        }
        html += `<strong>First harmonic terms:</strong><br>`;
        if (cosTerms) html += `Cosine part: ${cosTerms}<br>`;
        if (sinTerms) html += `Sine part: ${sinTerms}<br>`;
        if (!cosTerms && !sinTerms) html += `(no non‑zero harmonics up to n=5)<br>`;

        html += `</div><div class="step-card">
                    <strong>✅ Step 4 – Final Fourier series (first few terms)</strong><br>
                    f(x) = ${formatNumber(a0/2)} ${cosTerms} ${sinTerms} + ... 
                </div>`;
        resultDiv.innerHTML = html;
    }

    generateBtn.addEventListener('click', generate);
    generate(); // initial
}

// ---------- PRETEST (5 questions) ----------
function initPretest() {
    const questions = [
        { text: "The Fourier series of an even function contains only which terms?", options: ["Sine terms", "Cosine terms", "Both", "Constant only"], correct: 1 },
        { text: "What does the coefficient a₀ represent?", options: ["Average value", "Fundamental frequency", "Harmonic amplitude", "Phase shift"], correct: 0 },
        { text: "Gibbs phenomenon occurs near:", options: ["Discontinuities", "Smooth points", "Zero crossings", "Infinite intervals"], correct: 0 },
        { text: "For a square wave, the Fourier coefficients decay as:", options: ["1/n", "1/n²", "1/√n", "Exponentially"], correct: 0 },
        { text: "Dirichlet conditions guarantee:", options: ["Convergence", "Divergence", "Uniform convergence", "Absolute convergence"], correct: 0 }
    ];
    renderQuiz(questions, 'pretest-container', 'pretest-score');
}

// ---------- POSTTEST (5 questions) ----------
function initPosttest() {
    const questions = [
        { text: "Parseval's theorem relates:", options: ["Energy in time & frequency domains", "Phase & magnitude", "Convolution", "Derivatives"], correct: 0 },
        { text: "Complex Fourier series uses:", options: ["e^(jnω₀t)", "sin(nω₀t)", "cos(nω₀t)", "tan"], correct: 0 },
        { text: "A function with period 2π has fundamental frequency:", options: ["1", "2π", "π", "1/(2π)"], correct: 0 },
        { text: "The series Σ sin(nx)/n represents which wave?", options: ["Square wave", "Sawtooth", "Triangle", "Half‑rectified sine"], correct: 0 },
        { text: "For a triangle wave, the Fourier coefficients decay as:", options: ["1/n", "1/n²", "1/√n", "Exponentially"], correct: 1 }
    ];
    renderQuiz(questions, 'posttest-container', 'posttest-score');
}

// Generic quiz renderer
function renderQuiz(questions, containerId, scoreSpanId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    questions.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = 'question-section';
        div.innerHTML = `<h3>Question ${idx+1}</h3><div class="question-text">${q.text}</div>`;
        q.options.forEach((opt, optIdx) => {
            const radioId = `q${idx}_opt${optIdx}`;
            div.innerHTML += `
                <div class="quiz-option">
                    <input type="radio" name="q${idx}" value="${optIdx}" id="${radioId}">
                    <label for="${radioId}">${opt}</label>
                </div>
            `;
        });
        container.appendChild(div);
    });
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit Answers';
    submitBtn.style.marginTop = '20px';
    submitBtn.onclick = () => {
        let score = 0;
        questions.forEach((q, idx) => {
            const selected = document.querySelector(`input[name="q${idx}"]:checked`);
            if (selected && parseInt(selected.value) === q.correct) score++;
        });
        document.getElementById(scoreSpanId).innerText = `${score} / ${questions.length}`;
        alert(`You scored ${score}/${questions.length}`);
    };
    container.appendChild(submitBtn);
}

// ---------- FEEDBACK ----------
function initFeedback() {
    const form = document.getElementById('feedbackForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('studentName').value;
            const rating = document.querySelector('input[name="rating"]:checked');
            const comments = document.getElementById('comments').value;
            if (!rating) {
                alert('Please select a rating');
                return;
            }
            alert(`Thank you ${name || 'Student'}! Rating: ${rating.value} ⭐\nComment: ${comments.slice(0,100)}`);
            form.reset();
        });
    }
}
