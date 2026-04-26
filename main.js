// Shared utilities for all pages
document.addEventListener('DOMContentLoaded', () => {
    // Highlight current page in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });

    // Initialize page-specific functions
    if (currentPage === 'pretest.html') initPretest();
    if (currentPage === 'posttest.html') initPosttest();
    if (currentPage === 'simulation.html') initSimulation();
    if (currentPage === 'feedback.html') initFeedback();
});

// ---------- SIMULATION (Fourier series equation generator) ----------
function initSimulation() {
    const funcSelect = document.getElementById('funcSelect');
    const Linput = document.getElementById('Lval');
    const generateBtn = document.getElementById('generateBtn');
    const equationDiv = document.getElementById('fourierEquation');

    function fmtNum(val, digits = 4) {
        if (Math.abs(val) < 1e-8) return "0";
        let rounded = Number(val).toFixed(digits);
        if (rounded.includes('.') && rounded.endsWith('0'.repeat(digits))) {
            rounded = Math.round(val).toString();
        }
        return rounded;
    }

    // Coefficient calculators for each waveform
    function getSquareSeries(L) {
        return {
            a0: 0,
            an: (n) => 0,
            bn: (n) => (n % 2 === 1) ? 4 / (n * Math.PI) : 0,
            name: 'square'
        };
    }
    function getSawtoothSeries(L) {
        return {
            a0: 0,
            an: (n) => 0,
            bn: (n) => (2 * Math.pow(-1, n + 1)) / (n * Math.PI),
            name: 'sawtooth'
        };
    }
    function getTriangleSeries(L) {
        return {
            a0: 1,   // average = 0.5, but a0/2 = 0.5
            an: (n) => (n % 2 === 1) ? 8 / (Math.pow(n, 2) * Math.pow(Math.PI, 2)) : 0,
            bn: (n) => 0,
            name: 'triangle'
        };
    }
    function getHalfRectifiedSeries(L) {
        return {
            a0: 2 / Math.PI,
            an: (n) => {
                if (n === 1) return 0.5;
                if (n % 2 === 0) return 0;
                return -2 / (Math.PI * (n * n - 1));
            },
            bn: (n) => {
                if (n === 1) return 0.5;
                return 0;
            },
            name: 'halfrect'
        };
    }

    function generate() {
        let L = parseFloat(Linput.value);
        if (isNaN(L) || L <= 0) {
            equationDiv.innerHTML = '<span style="color:#ff8c69;">❌ Invalid L. Please enter a positive number.</span>';
            return;
        }
        const funcType = funcSelect.value;
        let coeffs;
        switch (funcType) {
            case 'square': coeffs = getSquareSeries(L); break;
            case 'sawtooth': coeffs = getSawtoothSeries(L); break;
            case 'triangle': coeffs = getTriangleSeries(L); break;
            case 'halfrect': coeffs = getHalfRectifiedSeries(L); break;
            default: coeffs = getSquareSeries(L);
        }
        const a0 = coeffs.a0;
        const an = coeffs.an;
        const bn = coeffs.bn;

        let html = `<div>f(x) = <strong>${fmtNum(a0 / 2, 4)}</strong>`;
        let cosTerms = '', sinTerms = '';
        for (let n = 1; n <= 5; n++) {
            let a_n = an(n);
            let b_n = bn(n);
            if (Math.abs(a_n) > 1e-6) {
                let sign = (a_n > 0 && cosTerms === '') ? '+' : (a_n > 0 ? '+' : '-');
                let absVal = fmtNum(Math.abs(a_n), 4);
                cosTerms += ` ${sign} ${absVal}·cos(${n}πx/${fmtNum(L,2)})`;
            }
            if (Math.abs(b_n) > 1e-6) {
                let sign = (b_n > 0 && sinTerms === '' && cosTerms === '') ? '+' : (b_n > 0 ? '+' : '-');
                let absVal = fmtNum(Math.abs(b_n), 4);
                sinTerms += ` ${sign} ${absVal}·sin(${n}πx/${fmtNum(L,2)})`;
            }
        }
        if (cosTerms !== '') html += ` + Σ[${cosTerms.trim()}]`;
        if (sinTerms !== '') html += ` + Σ[${sinTerms.trim()}]`;
        if (cosTerms === '' && sinTerms === '' && Math.abs(a0 / 2) < 1e-6) html += ` 0`;
        html += `</div>`;

        // Add coefficient explanation
        html += `<div style="margin-top: 16px; border-top: 1px solid #334155; padding-top: 12px;">`;
        html += `<strong>🔢 Exact coefficients:</strong><br>`;
        if (funcType === 'square') html += `a₀ = 0, bₙ = 4/(nπ) for odd n, else 0`;
        else if (funcType === 'sawtooth') html += `a₀ = 0, bₙ = 2·(-1)^{n+1}/(nπ)`;
        else if (funcType === 'triangle') html += `a₀ = 1, aₙ = 8/(n²π²) for odd n (cosine series)`;
        else if (funcType === 'halfrect') html += `a₀ = 2/π, a₁ = b₁ = 1/2, aₙ = -2/(π(n²-1)) for odd n>1`;
        html += `</div>`;
        equationDiv.innerHTML = html;
    }

    generateBtn.addEventListener('click', generate);
    generate(); // initial load
}

// ---------- PRETEST (5 questions) ----------
function initPretest() {
    const questions = [
        { q: "Who is credited with the development of Fourier series?", opts: ["Newton", "Fourier", "Laplace", "Euler"], correct: 1 },
        { q: "The Fourier series of an even function contains only:", opts: ["Sine terms", "Cosine terms", "Both", "Constant only"], correct: 1 },
        { q: "The coefficient a₀ in Fourier series represents:", opts: ["Average value", "Fundamental frequency", "Harmonic amplitude", "Phase"], correct: 0 },
        { q: "Dirichlet conditions guarantee:", opts: ["Convergence", "Divergence", "Uniform convergence", "Absolute convergence"], correct: 0 },
        { q: "Gibbs phenomenon occurs at:", opts: ["Discontinuities", "Smooth points", "Infinity", "Zero"], correct: 0 }
    ];
    renderQuiz(questions, 'pretest-container', 'pretest-score');
}

// ---------- POSTTEST (5 questions) ----------
function initPosttest() {
    const questions = [
        { q: "For a square wave, Fourier coefficients decay as:", opts: ["1/n", "1/n²", "1/√n", "exponentially"], correct: 0 },
        { q: "Parseval's theorem relates:", opts: ["Energy in time & frequency domains", "Phase & magnitude", "Convolution", "Derivatives"], correct: 0 },
        { q: "Complex Fourier series uses:", opts: ["e^(jnω₀t)", "sin(nω₀t)", "cos(nω₀t)", "tan"], correct: 0 },
        { q: "A periodic function with period 2π has fundamental frequency:", opts: ["1", "2π", "π", "1/2π"], correct: 0 },
        { q: "The series Σ sin(nx)/n represents which wave?", opts: ["Square wave", "Sawtooth", "Triangle", "Sine wave"], correct: 0 }
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
        div.className = 'quiz-question';
        div.innerHTML = `<p style="font-weight:600;">${idx + 1}. ${q.q}</p>`;
        q.opts.forEach((opt, optIdx) => {
            const label = document.createElement('label');
            label.style.display = 'block';
            label.style.margin = '6px 0 0 20px';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `q${idx}`;
            radio.value = optIdx;
            radio.style.marginRight = '8px';
            label.appendChild(radio);
            label.appendChild(document.createTextNode(opt));
            div.appendChild(label);
        });
        container.appendChild(div);
    });
    const submitBtn = document.createElement('button');
    submitBtn.innerText = 'Submit Answers';
    submitBtn.className = 'btn-submit';
    container.appendChild(submitBtn);
    submitBtn.addEventListener('click', () => {
        let score = 0;
        questions.forEach((q, idx) => {
            const selected = document.querySelector(`input[name="q${idx}"]:checked`);
            if (selected && parseInt(selected.value) === q.correct) score++;
        });
        const scoreSpan = document.getElementById(scoreSpanId);
        if (scoreSpan) scoreSpan.innerText = `${score} / ${questions.length}`;
        alert(`You scored ${score}/${questions.length}`);
    });
}

// ---------- FEEDBACK FORM ----------
function initFeedback() {
    const form = document.getElementById('feedback-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('student-name').value;
            const rating = document.querySelector('input[name="rating"]:checked');
            const comments = document.getElementById('comments').value;
            if (!rating) {
                alert('Please select a rating');
                return;
            }
            alert(`Thank you ${name || 'Student'}! Rating: ${rating.value}⭐\nComment: ${comments.slice(0, 100)}`);
            form.reset();
        });
    }
}
