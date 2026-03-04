document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('converter-form');
    const wodTypeSelect = document.getElementById('wod-type');
    const resultGroup = document.getElementById('result-group');
    const resultTimeInput = document.getElementById('result-time');
    const resultAmrapInput = document.getElementById('result-amrap');
    const resultHint = document.getElementById('result-hint');
    const resultLabel = document.getElementById('result-label');
    const conversionTypeSelect = document.getElementById('conversion-type');
    const percentageInput = document.getElementById('percentage');
    const resultDisplay = document.getElementById('result-display');
    const finalValue = document.getElementById('final-value');
    const calculationDetails = document.getElementById('calculation-details');

    // Handle WOD Type change to show correct input
    wodTypeSelect.addEventListener('change', (e) => {
        const type = e.target.value;
        resultGroup.style.display = 'block';

        // Reset inputs
        resultTimeInput.value = '';
        resultAmrapInput.value = '';
        resultTimeInput.classList.remove('active');
        resultAmrapInput.classList.remove('active');
        resultTimeInput.required = false;
        resultAmrapInput.required = false;

        if (type === 'for-time') {
            resultLabel.textContent = 'Tempo Realizado';
            resultTimeInput.classList.add('active');
            resultTimeInput.required = true;
            resultHint.textContent = 'Formato: MM:SS (ex: 06:00, 15:30)';
        } else if (type === 'amrap') {
            resultLabel.textContent = 'Número de Repetições';
            resultAmrapInput.classList.add('active');
            resultAmrapInput.required = true;
            resultHint.textContent = 'Apenas números inteiros (ex: 300)';
        }
    });

    // Handle auto-formatting for the time input (MM:SS)
    resultTimeInput.addEventListener('input', (e) => {
        let val = e.target.value;

        if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
            return;
        }

        let cleanVal = val.replace(/[^\d:]/g, '');
        if (cleanVal !== val) {
            e.target.value = cleanVal;
            val = cleanVal;
        }

        if (val.includes(':')) {
            const parts = val.split(':');
            let mins = parts[0];
            let secs = parts[1] || '';

            if (secs.length > 2) secs = secs.slice(0, 2);
            if (mins.length > 3) mins = mins.slice(0, 3);

            let newVal = mins + ':' + secs;
            if (val !== newVal) {
                e.target.value = newVal;
            }
            return;
        }

        if (val.length === 2 && e.inputType === 'insertText') {
            e.target.value = val + ':';
        } else if (val.length > 2 && (!e.inputType || e.inputType.includes('Paste') || e.inputType.includes('Drop'))) {
            if (val.length > 5) val = val.slice(0, 5);
            e.target.value = val.slice(0, 2) + ':' + val.slice(2, 4);
        }
    });

    // Convert MM:SS to total seconds
    function timeToSeconds(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;
        const mins = parseInt(parts[0], 10) || 0;
        const secs = parseInt(parts[1], 10) || 0;
        return (mins * 60) + secs;
    }

    // Convert total seconds to MM:SS
    function secondsToTime(totalSeconds) {
        // Round to nearest second
        totalSeconds = Math.round(totalSeconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const wodType = wodTypeSelect.value;
        const conversionType = conversionTypeSelect.value;
        const percentage = parseFloat(percentageInput.value);

        if (!wodType || !conversionType || isNaN(percentage)) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        let resultStr = "";
        let detailsStr = "";

        if (wodType === 'for-time') {
            const timeVal = resultTimeInput.value;
            // Validate time format MM:SS
            if (!/^\d{1,3}:[0-5]\d$/.test(timeVal)) {
                alert('Por favor, insira o tempo no formato válido, ex: 06:00 ou 15:30 (minutos:segundos).');
                return;
            }

            const initialSeconds = timeToSeconds(timeVal);
            const deltaSeconds = initialSeconds * (percentage / 100);
            let finalSeconds = 0;

            if (conversionType === 'rx-to-scale') {
                // For Time + RX -> Scale: Add time
                finalSeconds = initialSeconds + deltaSeconds;
                detailsStr = `${timeVal} + ${percentage}%`;
            } else if (conversionType === 'scale-to-rx') {
                // For Time + Scale -> RX: Subtract time
                finalSeconds = initialSeconds - deltaSeconds;
                if (finalSeconds < 0) finalSeconds = 0;
                detailsStr = `${timeVal} - ${percentage}%`;
            }

            resultStr = secondsToTime(finalSeconds);

        } else if (wodType === 'amrap') {
            const repsVal = parseInt(resultAmrapInput.value, 10);
            if (isNaN(repsVal) || repsVal < 0) {
                alert('Por favor, insira um número de repetições válido.');
                return;
            }

            const deltaReps = repsVal * (percentage / 100);
            let finalReps = 0;

            if (conversionType === 'rx-to-scale') {
                // AMRAP + RX -> Scale: Subtract reps
                finalReps = repsVal - deltaReps;
                if (finalReps < 0) finalReps = 0;
                detailsStr = `${repsVal} reps - ${percentage}%`;
            } else if (conversionType === 'scale-to-rx') {
                // AMRAP + Scale -> RX: Add reps
                finalReps = repsVal + deltaReps;
                detailsStr = `${repsVal} reps + ${percentage}%`;
            }

            // Round reps to nearest integer
            resultStr = Math.round(finalReps).toString() + ' reps';
        }

        // Display results
        finalValue.textContent = resultStr;
        calculationDetails.textContent = `Cálculo: ${detailsStr}`;

        resultDisplay.classList.remove('hidden');
        // Trigger reflow for animation
        void resultDisplay.offsetWidth;
        resultDisplay.classList.add('visible');
    });
});
