const countdownMainTitleElement = document.getElementById('countdownMainTitle');
const countdownSubtitleElement = document.getElementById('countdownSubtitle');
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const infoMessageElement = document.getElementById('infoMessage');
const countdownDisplayElement = document.getElementById('countdownDisplay');

const settingsModal = document.getElementById('settingsModal');
const countdownNameInput = document.getElementById('countdownNameInput');
const targetDateInput = document.getElementById('targetDateInput');
const targetTimeInput = document.getElementById('targetTimeInput');
const saveButton = document.getElementById('saveButton');
const closeModalButton = document.getElementById('closeModalButton');

const settingsButton = document.getElementById('settingsButton');
const resetButton = document.getElementById('resetButton');
const themeToggleButton = document.getElementById('themeToggleButton');

let countdownInterval;

function formatTwoDigits(number) {
    return number < 10 ? '0' + number : number;
}

function updateCountdown() {
    const savedCountdownName = localStorage.getItem('countdownName');
    const savedTargetTimestamp = localStorage.getItem('targetTimestamp');

    if (!savedTargetTimestamp || !savedCountdownName) {
        countdownMainTitleElement.textContent = 'Configure sua Prova';
        countdownSubtitleElement.textContent = 'Por favor, defina a data e hora.';
        infoMessageElement.textContent = 'Configure a data e hora da sua prova para começar!';
        infoMessageElement.classList.remove('hidden');
        countdownDisplayElement.classList.add('hidden');

        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        targetDateInput.value = tomorrow.toISOString().split('T')[0];
        targetTimeInput.value = '09:00';
        countdownNameInput.value = savedCountdownName || 'Minha Prova Importante';
        return;
    }

    const targetDate = new Date(parseInt(savedTargetTimestamp));
    const now = new Date().getTime();
    const difference = targetDate.getTime() - now;

    countdownMainTitleElement.textContent = savedCountdownName;
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = targetDate.toLocaleDateString('pt-BR', options);
    countdownSubtitleElement.textContent = `até ${formattedDate}`;

    infoMessageElement.classList.add('hidden');
    countdownDisplayElement.classList.remove('hidden');

    if (difference < 0) {
        daysElement.innerHTML = '00<span>Dias</span>';
        hoursElement.innerHTML = '00<span>Horas</span>';
        minutesElement.innerHTML = '00<span>Minutos</span>';
        secondsElement.innerHTML = '00<span>Segundos</span>';
        countdownSubtitleElement.textContent = 'A prova já passou!';
        infoMessageElement.textContent = 'Contagem regressiva finalizada! A prova já passou.';
        infoMessageElement.classList.remove('hidden');
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    daysElement.innerHTML = `${formatTwoDigits(days)}<span>Dias</span>`;
    hoursElement.innerHTML = `${formatTwoDigits(hours)}<span>Horas</span>`;
    minutesElement.innerHTML = `${formatTwoDigits(minutes)}<span>Minutos</span>`;
    secondsElement.innerHTML = `${formatTwoDigits(seconds)}<span>Segundos</span>`;
}

function openSettingsModal() {
    settingsModal.classList.add('active');
    countdownNameInput.value = localStorage.getItem('countdownName') || '';
    const savedTimestamp = localStorage.getItem('targetTimestamp');
    if (savedTimestamp) {
        const savedDate = new Date(parseInt(savedTimestamp));
        targetDateInput.value = savedDate.toISOString().split('T')[0];
        targetTimeInput.value = savedDate.toTimeString().split(' ')[0].substring(0, 5);
    } else {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        targetDateInput.value = tomorrow.toISOString().split('T')[0];
        targetTimeInput.value = '09:00';
    }
}

function closeSettingsModal() {
    settingsModal.classList.remove('active');
    if (!localStorage.getItem('targetTimestamp')) {
        countdownMainTitleElement.textContent = 'Configure sua Prova';
        countdownSubtitleElement.textContent = 'Por favor, defina a data e hora.';
        infoMessageElement.classList.remove('hidden');
        countdownDisplayElement.classList.add('hidden');
    }
}

function saveSettings() {
    const name = countdownNameInput.value.trim();
    const date = targetDateInput.value;
    const time = targetTimeInput.value;

    if (!name || !date || !time) {
        infoMessageElement.textContent = 'Por favor, preencha todos os campos para configurar a contagem.';
        infoMessageElement.classList.remove('hidden');
        setTimeout(() => {
            infoMessageElement.classList.add('hidden');
        }, 3000);
        return;
    }

    const targetDateTime = new Date(`${date}T${time}:00`);

    localStorage.setItem('countdownName', name);
    localStorage.setItem('targetTimestamp', targetDateTime.getTime().toString());

    closeSettingsModal();
    updateCountdown();
    if (!countdownInterval) {
        countdownInterval = setInterval(updateCountdown, 1000);
    }
}

function resetCountdown() {
    const confirmReset = document.createElement('div');
    confirmReset.classList.add('modal-overlay', 'active');
    confirmReset.innerHTML = `
        <div class="modal-content">
            <h2>Resetar Contagem Regressiva</h2>
            <p style="margin-bottom: 1.5rem; color: var(--color-modal-text);">Tem certeza que deseja resetar a contagem regressiva? Isso apagará as configurações atuais.</p>
            <div class="modal-actions">
                <button id="confirmResetButton" class="button save-button">Sim</button>
                <button id="cancelResetButton" class="button close-button">Não</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmReset);

    document.getElementById('confirmResetButton').addEventListener('click', () => {
        localStorage.removeItem('countdownName');
        localStorage.removeItem('targetTimestamp');
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        updateCountdown();
        openSettingsModal();
        infoMessageElement.textContent = 'Contagem regressiva resetada. Por favor, configure uma nova.';
        infoMessageElement.classList.remove('hidden');
        setTimeout(() => {
            infoMessageElement.classList.add('hidden');
        }, 3000);
        document.body.removeChild(confirmReset);
    });

    document.getElementById('cancelResetButton').addEventListener('click', () => {
        document.body.removeChild(confirmReset);
    });
}

function toggleTheme() {
    const isLightMode = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    themeToggleButton.textContent = isLightMode ? 'Modo Escuro' : 'Modo Claro';
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleButton.textContent = 'Modo Escuro';
    } else {
        document.body.classList.remove('light-mode');
        themeToggleButton.textContent = 'Modo Claro';
    }
}

settingsButton.addEventListener('click', openSettingsModal);
resetButton.addEventListener('click', resetCountdown);
themeToggleButton.addEventListener('click', toggleTheme);
saveButton.addEventListener('click', saveSettings);
closeModalButton.addEventListener('click', closeSettingsModal);

applySavedTheme();
updateCountdown();
if (localStorage.getItem('targetTimestamp')) {
    countdownInterval = setInterval(updateCountdown, 1000);
} else {
    openSettingsModal();
}
