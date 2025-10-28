// 1. Substitua pelos seus dados do Supabase!
const SUPABASE_URL = https://tvpuleqsmtpqwkxmdzsd.supabase.co;
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2cHVsZXFzbXRwcXdreG1kenNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2Mzc3MzYsImV4cCI6MjA3NDIxMzczNn0.FOQRXzykxjB7_89RUknTCj4G8K6bdQX1wypL7xwlPwg;

// O "createClient" vem do CDN que incluímos no HTML
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Elementos do DOM
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('submitButton');

// Links de alternância
const toggleModeLink = document.getElementById('toggleMode');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const separator = document.getElementById('separator');

const messageElement = document.getElementById('message');
const loggedInArea = document.getElementById('loggedInArea');
const userEmailElement = document.getElementById('userEmail');
const logoutButton = document.getElementById('logoutButton');

let currentMode = 'signup'; // 'signup', 'login', ou 'forgot_password'

// Função para mostrar mensagens de feedback
function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = ''; 
    messageElement.classList.add(type);
    messageElement.classList.remove('hidden');
}

// Função para atualizar a interface com base no modo atual
function setMode(mode) {
    currentMode = mode;
    messageElement.classList.add('hidden'); // Limpa a mensagem ao trocar de modo

    // 1. Visibilidade do campo de senha
    passwordInput.required = (mode !== 'forgot_password');
    passwordInput.style.display = (mode === 'forgot_password' ? 'none' : 'block');

    // 2. Texto dos botões e links
    if (mode === 'signup') {
        submitButton.textContent = 'Cadastrar';
        toggleModeLink.textContent = 'Fazer Login';
        toggleModeLink.parentElement.firstChild.nodeValue = 'Já tem conta? ';
        separator.classList.remove('hidden');
        forgotPasswordLink.style.display = 'inline';

    } else if (mode === 'login') {
        submitButton.textContent = 'Login';
        toggleModeLink.textContent = 'Fazer Cadastro';
        toggleModeLink.parentElement.firstChild.nodeValue = 'Não tem conta? ';
        separator.classList.remove('hidden');
        forgotPasswordLink.style.display = 'inline';

    } else if (mode === 'forgot_password') {
        submitButton.textContent = 'Enviar Link de Recuperação';
        toggleModeLink.textContent = 'Voltar para Login';
        toggleModeLink.parentElement.firstChild.nodeValue = ''; // Remove o "Não tem conta?"
        separator.classList.add('hidden'); // Esconde o separador
        forgotPasswordLink.style.display = 'none'; // Esconde o link Esqueci a Senha
        emailInput.focus();
    }
}

// Função para atualizar a UI para o estado logado/deslogado
async function updateUI(session) {
    if (session) {
        // Usuário logado
        authForm.classList.add('hidden');
        document.querySelector('.toggle-links').classList.add('hidden');
        loggedInArea.classList.remove('hidden');
        userEmailElement.textContent = `Você está logado como: ${session.user.email}`;
        showMessage('Login realizado com sucesso!', 'success');
    } else {
        // Usuário deslogado
        authForm.classList.remove('hidden');
        document.querySelector('.toggle-links').classList.remove('hidden');
        loggedInArea.classList.add('hidden');
        userEmailElement.textContent = '';
        setMode('signup'); // Volta ao modo padrão após logout
    }
}

// 3. Lógica de Autenticação (Submit do Formulário)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (currentMode === 'signup') {
        // Cadastro
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            showMessage(`Erro ao cadastrar: ${error.message}`, 'error');
        } else {
            showMessage('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.', 'success');
        }

    } else if (currentMode === 'login') {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            showMessage(`Erro ao fazer login: ${error.message}`, 'error');
        } else if (data.session) {
            updateUI(data.session);
        }

    } else if (currentMode === 'forgot_password') {
        // Esqueci a Senha
        // O Supabase enviará um e-mail com um link para a recuperação
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // Nota: Você pode especificar uma URL de redirecionamento aqui,
            // que será a página onde o usuário define a nova senha.
            // redirectTo: 'http://localhost:8080/reset-password.html'
        });

        if (error) {
            showMessage(`Erro ao solicitar recuperação: ${error.message}`, 'error');
        } else {
            showMessage('Link de recuperação enviado! Verifique seu e-mail.', 'success');
        }
    }
});

// 4. Alternar entre Login e Cadastro/Voltar para Login
toggleModeLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentMode === 'signup') {
        setMode('login');
    } else if (currentMode === 'login') {
        setMode('signup');
    } else if (currentMode === 'forgot_password') {
        setMode('login'); // Volta para o login
    }
});

// 5. Entrar no modo Esqueci a Senha
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    setMode('forgot_password');
});

// 6. Lógica de Logout
logoutButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        showMessage('Erro ao sair.', 'error');
    } else {
        showMessage('Você saiu da conta.', 'success');
        updateUI(null); 
    }
});

// 7. Verificar o estado de login ao carregar a página
supabase.auth.getSession().then(({ data: { session } }) => {
    updateUI(session);
});

// Ouve mudanças de estado (ex: logado/deslogado via outro evento)
supabase.auth.onAuthStateChange((_event, session) => {
    updateUI(session);
});
