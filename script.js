let options = [];
let isSpinning = false;
let wheel = null;
let ctx = null;

// Initialize the wheel
function initWheel() {
    const canvas = document.getElementById('wheel');
    ctx = canvas.getContext('2d');
    drawWheel();
}

// Draw the wheel
function drawWheel() {
    if (!ctx) return;
    
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    
    ctx.clearRect(0, 0, 300, 300);
    
    if (options.length === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.stroke();
        return;
    }

    const sliceAngle = (2 * Math.PI) / options.length;
    // Softer, more modern color palette
    const colors = [
        '#8B5CF6', // purple
        '#EC4899', // pink
        '#F59E0B', // amber
        '#10B981', // emerald
        '#3B82F6', // blue
        '#F43F5E'  // rose
    ];

    options.forEach((option, index) => {
        const startAngle = index * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = '500 14px Inter, system-ui, sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 2;
        ctx.fillText(option, radius - 25, 5);
        ctx.restore();
    });
}

// Add option to the wheel
function addOption() {
    const input = document.getElementById('optionInput');
    const option = input.value.trim();
    
    if (option && !options.includes(option)) {
        options.push(option);
        input.value = '';
        updateOptionsList();
        drawWheel();
    }
}

// Update the options list display
function updateOptionsList() {
    const list = document.getElementById('optionsList');
    list.innerHTML = options.map((option, index) => `
        <div class="option-item">
            <span class="text-gray-700">${option}</span>
            <span class="delete-btn" onclick="deleteOption(${index})">×</span>
        </div>
    `).join('');
}

// Delete an option
function deleteOption(index) {
    options.splice(index, 1);
    updateOptionsList();
    drawWheel();
}

// Spin the wheel
function spinWheel() {
    if (isSpinning || options.length === 0) return;
    
    isSpinning = true;
    document.getElementById('spinButton').disabled = true;
    document.getElementById('result').classList.add('hidden');
    
    const wheel = document.getElementById('wheel');
    const degrees = 1800 + Math.random() * 1800; // 5-10 full rotations
    
    wheel.style.transform = `rotate(${degrees}deg)`;
    wheel.classList.add('spinning');
    
    // Play spin sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-slot-machine-wheel-1931.mp3');
    audio.play();
    
    setTimeout(() => {
        isSpinning = false;
        document.getElementById('spinButton').disabled = false;
        wheel.classList.remove('spinning');
        
        // Calculate winner based on the pointing pin position
        const normalizedRotation = degrees % 360;
        const sliceAngle = 360 / options.length;
        // The pin points to the top, so we need to adjust the calculation
        const winningIndex = Math.floor(((360 - normalizedRotation) % 360) / sliceAngle);
        const winner = options[winningIndex];
        
        // Show result with a highlight effect
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <div class="winner-animation">
                <span class="text-4xl">🎉 </span>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    ${winner}
                </span>
                <span class="text-4xl"> 🎉</span>
            </div>
        `;
        resultDiv.classList.remove('hidden');
        
        // Trigger confetti
        createConfetti();
    }, 3000);
}

// Add this function to create a more dramatic confetti effect
function createConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// Initialize when the page loads
window.onload = initWheel; 