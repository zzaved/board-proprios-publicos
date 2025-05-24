// Global state for Feather initialization
let featherReady = false;
let featherQueue = [];

// Icon name mappings for compatibility
const ICON_MAPPINGS = {
    'map-pin': 'map-pin',  // exists in Feather
    'user': 'user',        // exists in Feather
    'calendar': 'calendar', // exists in Feather
    'tool': 'tool',        // exists in Feather
    'alert-triangle': 'alert-triangle', // exists in Feather
    'lightbulb': 'zap',    // using 'zap' as alternative
    'cpu': 'cpu',          // exists in Feather
    'package': 'package',  // exists in Feather
    'building': 'home',    // using 'home' as alternative
    'eye': 'eye',          // exists in Feather
    'external-link': 'external-link', // exists in Feather
    'help-circle': 'help-circle', // exists in Feather
    'image': 'image',      // exists in Feather
    'check': 'check',      // exists in Feather
    'x': 'x'              // exists in Feather
};

// Function to get valid Feather icon name
function getValidFeatherIcon(iconName) {
    return ICON_MAPPINGS[iconName] || iconName;
}

// Create a single styleSheet for all styles
const appStyles = document.createElement('style');
document.head.appendChild(appStyles);

// Add all necessary styles
function updateStyles() {
    appStyles.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }

    ${notificationStyles}
`;
}

// Declare all functions that need to be globally available
window.openModal = openModal;
window.closeModal = closeModal;
window.showTab = showTab;
window.createOS = createOS;
window.showAISuggestions = showAISuggestions;
window.exportToPDF = exportToPDF;
window.exportToExcel = exportToExcel;

// Initialize Feather icons and application
document.addEventListener('DOMContentLoaded', function() {
    // Create a promise to load Feather
    const loadFeather = new Promise((resolve, reject) => {
        // If Feather is already loaded and initialized
        if (typeof feather !== 'undefined' && feather.replace) {
            resolve();
            return;
        }

        // If not loaded, create and append the script
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.29.0/feather.min.js';
        
        // Wait for script to be fully loaded and initialized
        script.onload = () => {
            // Check periodically for Feather to be initialized
            const checkFeather = setInterval(() => {
                if (typeof feather !== 'undefined' && feather.replace) {
                    clearInterval(checkFeather);
                    resolve();
                }
            }, 50); // Check every 50ms

            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkFeather);
                reject(new Error('Timeout waiting for Feather to initialize'));
            }, 5000);
        };
        
        script.onerror = () => reject(new Error('Failed to load Feather script'));
        document.head.appendChild(script);
    });

    // Initialize app after Feather loads
    loadFeather
        .then(() => {
            console.log('✨ Feather carregado com sucesso!');
            return initializeFeatherIcons();
        })
        .then(() => {
            featherReady = true;
            initializeApp();
            simulateRealTimeUpdates();
            processFeatherQueue();
            initializeTabs();
            console.log('🚀 BPP: Board de Gestão de Próprios Públicos inicializado com sucesso!');
        })
        .catch(error => {
            console.warn('❌ Erro ao carregar Feather:', error);
            handleFeatherFailure();
            initializeTabs();
        });

    // Add event listeners for modals
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                const modalId = modal.id;
                closeModal(modalId);
            }
        });
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    const modalId = modal.id;
                    closeModal(modalId);
                }
            });
        }
    });
});

// Initialize tab functionality
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(event) {
            const tabName = this.getAttribute('data-tab');
            if (tabName) {
                showTab(tabName, event);
            }
        });
    });

    // Show initial tab if none is active
    const activeTab = document.querySelector('.tab.active');
    if (!activeTab) {
        const firstTab = document.querySelector('.tab');
        if (firstTab) {
            const tabName = firstTab.getAttribute('data-tab');
            if (tabName) {
                showTab(tabName);
            }
        }
    }
}

// Process queued operations
function processFeatherQueue() {
    while (featherQueue.length > 0) {
        const operation = featherQueue.shift();
        try {
            operation();
        } catch (error) {
            console.warn('Erro ao processar operação em fila:', error);
        }
    }
}

// Initialize Feather icons safely
function initializeFeatherIcons() {
    return new Promise((resolve, reject) => {
        try {
            if (!window.feather || !window.feather.replace) {
                throw new Error('Feather não está disponível');
            }
            
            // Update all icon names to valid ones
            document.querySelectorAll('[data-feather]').forEach(icon => {
                const originalIcon = icon.getAttribute('data-feather');
                icon.setAttribute('data-feather', getValidFeatherIcon(originalIcon));
            });
            
            feather.replace();
            featherReady = true;
            console.log('✨ Feather icons inicializados com sucesso!');
            resolve();
        } catch (error) {
            console.warn('Feather icons não puderam ser carregados:', error);
            reject(error);
        }
    });
}

// Handle Feather failure by hiding icons and showing alternatives
function handleFeatherFailure() {
    featherReady = false;
    // Hide all feather icons
    const featherIcons = document.querySelectorAll('[data-feather]');
    featherIcons.forEach(icon => {
        // Hide the icon
        icon.style.display = 'none';
        
        // If icon has a parent with text content, show text alternative
        const parent = icon.parentElement;
        if (parent && parent.textContent.trim()) {
            parent.style.display = 'inline';
            // Try to extract icon name from data-feather attribute and add as text
            const iconName = icon.getAttribute('data-feather');
            if (iconName && !parent.textContent.includes(iconName)) {
                const textNode = document.createTextNode(` [${iconName}] `);
                parent.insertBefore(textNode, icon);
            }
        }
    });
}

// Safe feather replace function with queuing
function safeFeatherReplace() {
    const operation = () => {
        if (!window.feather || !window.feather.replace) {
            console.warn('Feather não está disponível');
            handleFeatherFailure();
            return;
        }

        try {
            // Update all icon names to valid ones before replacing
            document.querySelectorAll('[data-feather]').forEach(icon => {
                const originalIcon = icon.getAttribute('data-feather');
                icon.setAttribute('data-feather', getValidFeatherIcon(originalIcon));
            });
            
            feather.replace();
        } catch (error) {
            console.warn('Erro ao atualizar ícones:', error);
            handleFeatherFailure();
        }
    };

    if (featherReady) {
        operation();
    } else {
        featherQueue.push(operation);
    }
}

// Tab functionality
function showTab(tabName, event) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab content
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked tab
    if (event && event.target) {
        const clickedTab = event.target.closest('.tab');
        if (clickedTab) {
            clickedTab.classList.add('active');
        }
    } else {
        // If no event (programmatic call), find and activate the corresponding tab
        const correspondingTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (correspondingTab) {
            correspondingTab.classList.add('active');
        }
    }
    
    // Queue icon refresh for after tab change
    safeFeatherReplace();
}

// AI Suggestions functionality
function showAISuggestions() {
    const tipoServicoElement = document.getElementById('tipo-servico');
    const suggestionsDivElement = document.getElementById('ai-suggestions');
    const suggestionsContentElement = document.getElementById('suggestions-content');

    if (!tipoServicoElement || !suggestionsDivElement || !suggestionsContentElement) {
        return;
    }

    const tipoServico = tipoServicoElement.value;

    if (tipoServico) {
        suggestionsDivElement.style.display = 'block';
        
        let suggestions = '';
        
        switch(tipoServico) {
            case 'hidraulica':
                suggestions = `
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="lightbulb"></i>
                            <strong>Caso Similar</strong>
                        </div>
                        <div class="suggestion-content">
                            <p>OS #2024-1156 - Vazamento na UBS Centro (Set/2024)</p>
                            <div class="suggestion-details">
                                <span><strong>Materiais:</strong> Cano PVC 100mm (5m), Conexões (8 un), Vedante (2 tubos)</span>
                                <span><strong>Tempo médio:</strong> 2,5 dias | <strong>Equipe mais eficiente:</strong> SAR03.03-B</span>
                            </div>
                        </div>
                    </div>
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="package"></i>
                            <strong>Materiais Frequentes</strong>
                        </div>
                        <div class="suggestion-content">
                            <ul class="materials-list">
                                <li>Canos PVC (diversos diâmetros)</li>
                                <li>Conexões e registros</li>
                                <li>Massa de vedação</li>
                                <li>Fita veda rosca</li>
                            </ul>
                        </div>
                    </div>
                `;
                break;
            case 'eletrica':
                suggestions = `
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="lightbulb"></i>
                            <strong>Caso Similar</strong>
                        </div>
                        <div class="suggestion-content">
                            <p>OS #2024-1278 - Quadro elétrico CEU Vila Galvão (Out/2024)</p>
                            <div class="suggestion-details">
                                <span><strong>Materiais:</strong> Disjuntores 20A (4 un), Fios 2,5mm (50m), Quadro de distribuição</span>
                                <span><strong>Tempo médio:</strong> 1,8 dias | <strong>Equipe mais eficiente:</strong> SAR03.03-A</span>
                            </div>
                        </div>
                    </div>
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="alert-triangle"></i>
                            <strong>Atenção</strong>
                        </div>
                        <div class="suggestion-content">
                            <p>Sempre verificar se precisa desligar energia geral antes de iniciar os trabalhos</p>
                        </div>
                    </div>
                `;
                break;
            case 'pintura':
                suggestions = `
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="lightbulb"></i>
                            <strong>Caso Similar</strong>
                        </div>
                        <div class="suggestion-content">
                            <p>OS #2024-1089 - Pintura externa Biblioteca Municipal (Ago/2024)</p>
                            <div class="suggestion-details">
                                <span><strong>Materiais:</strong> Tinta acrílica (25L), Primer (10L), Rolo e pincéis</span>
                                <span><strong>Tempo médio:</strong> 4,2 dias | <strong>Equipe mais eficiente:</strong> SAR03.03-C</span>
                            </div>
                        </div>
                    </div>
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="cloud-rain"></i>
                            <strong>Dica Importante</strong>
                        </div>
                        <div class="suggestion-content">
                            <p>Verificar previsão do tempo - evitar período chuvoso para melhor aderência</p>
                        </div>
                    </div>
                `;
                break;
            case 'telhado':
                suggestions = `
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="lightbulb"></i>
                            <strong>Caso Similar</strong>
                        </div>
                        <div class="suggestion-content">
                            <p>OS #2024-1247 - Reparo telhado EMEI Jardim Adriana (Nov/2024)</p>
                            <div class="suggestion-details">
                                <span><strong>Materiais:</strong> Telhas cerâmicas (60 un), Argamassa (8 sacos), Impermeabilizante</span>
                                <span><strong>Tempo médio:</strong> 3,1 dias | <strong>Equipe mais eficiente:</strong> SAR03.03-A</span>
                            </div>
                        </div>
                    </div>
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="package"></i>
                            <strong>Materiais Padrão</strong>
                        </div>
                        <div class="suggestion-content">
                            <ul class="materials-list">
                                <li>Telhas cerâmicas ou fibrocimento</li>
                                <li>Argamassa colante</li>
                                <li>Impermeabilizante</li>
                                <li>Ripas de madeira</li>
                            </ul>
                        </div>
                    </div>
                `;
                break;
            case 'carpintaria':
                suggestions = `
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="lightbulb"></i>
                            <strong>Caso Similar</strong>
                        </div>
                        <div class="suggestion-content">
                            <p>OS #2024-0956 - Reparo de portas CEU Santos Dumont (Jul/2024)</p>
                            <div class="suggestion-details">
                                <span><strong>Materiais:</strong> Madeira compensada, Dobradiças, Fechaduras</span>
                                <span><strong>Tempo médio:</strong> 2,8 dias | <strong>Equipe mais eficiente:</strong> SAR03.03-B</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
            default:
                suggestions = `
                    <div class="suggestion-item">
                        <div class="suggestion-header">
                            <i data-feather="info"></i>
                            <strong>Aguardando Seleção</strong>
                        </div>
                        <div class="suggestion-content">
                            <p>Casos similares serão sugeridos após seleção do tipo de serviço</p>
                        </div>
                    </div>
                `;
        }
        
        suggestionsContentElement.innerHTML = suggestions;
        
        // Refresh Feather icons in suggestions
        safeFeatherReplace();
    } else {
        suggestionsDivElement.style.display = 'none';
    }
}

// Create OS functionality
function createOS(event) {
    if (event) {
        event.preventDefault();
    }

    const solicitanteElement = document.getElementById('solicitante');
    const orgaoElement = document.getElementById('orgao');
    const localElement = document.getElementById('local');
    const tipoServicoElement = document.getElementById('tipo-servico');
    const urgenciaElement = document.getElementById('urgencia');
    const descricaoElement = document.getElementById('descricao');

    if (!solicitanteElement || !orgaoElement || !localElement || !tipoServicoElement || !urgenciaElement || !descricaoElement) {
        showNotification('Erro: Elementos do formulário não encontrados', 'error');
        return;
    }

    const solicitante = solicitanteElement.value;
    const orgao = orgaoElement.value;
    const local = localElement.value;
    const tipoServico = tipoServicoElement.value;
    const urgencia = urgenciaElement.value;
    const descricao = descricaoElement.value;

    if (!solicitante || !orgao || !local || !tipoServico || !urgencia || !descricao) {
        showNotification('Por favor, preencha todos os campos obrigatórios marcados com *', 'error');
        return;
    }

    // Show loading state
    const button = event ? event.target : document.querySelector('.btn-primary');
    if (button) {
        const originalText = button.innerHTML;
        button.classList.add('loading');
        button.disabled = true;
        button.innerHTML = '<i data-feather="loader"></i> Criando...';
        safeFeatherReplace();

        // Simulate OS creation
        setTimeout(() => {
            const osNumber = '2025-' + String(Math.floor(Math.random() * 1000) + 800).padStart(4, '0');
            
            showNotification(
                `Ordem de Serviço criada com sucesso!\n\n` +
                `Número: OS #${osNumber}\n` +
                `Solicitante: ${solicitante}\n` +
                `Local: ${local}\n` +
                `Tipo: ${tipoServico}\n\n` +
                `Um PDF de registro foi gerado automaticamente.\n` +
                `Notificação enviada para a divisão responsável.`,
                'success'
            );

            // Reset form
            resetForm();
            
            // Remove loading state
            button.classList.remove('loading');
            button.disabled = false;
            button.innerHTML = originalText;
            safeFeatherReplace();

            // Switch to kanban tab after 2 seconds
            setTimeout(() => {
                const kanbanTab = document.querySelector('[onclick*="kanban"]');
                if (kanbanTab) {
                    kanbanTab.click();
                }
            }, 2000);
        }, 2000);
    }
}

// Reset form
function resetForm() {
    const elements = [
        'sei-number', 'solicitante', 'orgao', 'local', 
        'tipo-servico', 'urgencia', 'descricao', 'fotos'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        }
    });
    
    const suggestionsElement = document.getElementById('ai-suggestions');
    if (suggestionsElement) {
        suggestionsElement.style.display = 'none';
    }
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus on first input if it's the new OS modal
        if (modalId === 'nova-os-modal') {
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }
        
        safeFeatherReplace();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Add closing animation
        modal.style.animation = 'fadeOut 0.3s ease';
        modal.querySelector('.modal-content').style.animation = 'slideOut 0.3s ease';
        
        // Wait for animation to complete
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // Reset animations
            modal.style.animation = '';
            modal.querySelector('.modal-content').style.animation = '';
        }, 300);
    }
}

// Notification system with Feather handling
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'x-circle' : 
                 type === 'warning' ? 'alert-triangle' : 'info';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i data-feather="${icon}"></i>
            <span>${message.replace(/\n/g, '<br>')}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i data-feather="x"></i>
        </button>
    `;

    // Add notification to page
    document.body.appendChild(notification);
    safeFeatherReplace();

    // Auto remove after timeout
    const timeout = type === 'success' ? 5000 : 8000;
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, timeout);
}

// Simulate real-time updates
function simulateRealTimeUpdates() {
    // Simulate small changes in the dashboard numbers every 5 seconds
    setInterval(() => {
        const statCards = document.querySelectorAll('.stat-card .stat-content h3');
        if (Math.random() > 0.9) { // 10% chance every interval
            const randomCard = statCards[Math.floor(Math.random() * statCards.length)];
            if (randomCard) {
                const currentValue = parseInt(randomCard.textContent);
                if (!isNaN(currentValue) && !randomCard.textContent.includes('dias')) {
                    const change = Math.random() > 0.6 ? 1 : -1;
                    const newValue = Math.max(0, currentValue + change);
                    randomCard.textContent = newValue;
                    
                    // Add pulse animation
                    randomCard.style.animation = 'pulse 0.5s ease';
                    setTimeout(() => {
                        randomCard.style.animation = '';
                    }, 500);
                }
            }
        }
    }, 5000);

    console.log('📡 Sistema conectado - atualizações em tempo real ativas');
}

// Initialize application
function initializeApp() {
    updateStyles();
    initializeTabs();
    initializeEventListeners();
}

function initializeEventListeners() {
    // Modal click outside listener
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Escape key listener
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    closeModal(modal.id);
                }
            });
        }
    });
}

// Kanban drag and drop functionality
function initializeKanbanDragAndDrop() {
    const cards = document.querySelectorAll('.os-card');
    const columns = document.querySelectorAll('.kanban-column');
    
    cards.forEach(card => {
        card.setAttribute('draggable', 'true');
        
        card.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', '');
            this.classList.add('dragging');
        });
        
        card.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
        });
    });
    
    columns.forEach(column => {
        column.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        column.addEventListener('dragleave', function(e) {
            this.classList.remove('drag-over');
        });
        
        column.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const draggingCard = document.querySelector('.dragging');
            if (draggingCard) {
                this.appendChild(draggingCard);
                updateKanbanCounts();
                showNotification('OS movida com sucesso!', 'success');
            }
        });
    });
}

// Update Kanban column counts
function updateKanbanCounts() {
    const columns = document.querySelectorAll('.kanban-column');
    columns.forEach(column => {
        const cards = column.querySelectorAll('.os-card');
        const countElement = column.querySelector('.kanban-count');
        if (countElement) {
            countElement.textContent = cards.length;
        }
    });
}

// Initialize interactive elements
function initializeInteractiveElements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.os-card, .stat-card, .dashboard-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click animation to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
            
            // Handle create OS button
            if (this.textContent.includes('Criar Ordem de Serviço')) {
                createOS(event);
            }
        });
    });
}

// Export functions
function exportToPDF() {
    showNotification('Gerando relatório em PDF...', 'info');
    // Simulate PDF generation
    setTimeout(() => {
        showNotification('Relatório PDF gerado com sucesso!', 'success');
    }, 2000);
}

function exportToExcel() {
    showNotification('Exportando dados para Excel...', 'info');
    // Simulate Excel export
    setTimeout(() => {
        showNotification('Dados exportados para Excel com sucesso!', 'success');
    }, 1500);
}

// Utility functions
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Performance monitoring
function trackPerformance() {
    // Simple performance tracking
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`⚡ BPP carregado em ${Math.round(loadTime)}ms`);
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('❌ Erro na aplicação:', e.error);
    showNotification('Ocorreu um erro inesperado. Tente novamente.', 'error');
});

// Initialize performance tracking
trackPerformance();

// Add CSS for notifications dynamically
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border-left: 4px solid #007aff;
        z-index: 10000;
        max-width: 400px;
        animation: slideInNotification 0.3s ease;
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }
    
    .notification-success {
        border-left-color: #34c759;
    }
    
    .notification-error {
        border-left-color: #ff3b30;
    }
    
    .notification-warning {
        border-left-color: #ff9500;
    }
    
    .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        flex: 1;
    }
    
    .notification-content i {
        width: 16px;
        height: 16px;
        margin-top: 2px;
        flex-shrink: 0;
    }
    
    .notification-success .notification-content i {
        color: #34c759;
    }
    
    .notification-error .notification-content i {
        color: #ff3b30;
    }
    
    .notification-warning .notification-content i {
        color: #ff9500;
    }
    
    .notification-content span {
        font-size: 14px;
        color: #1d1d1f;
        line-height: 1.4;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        border-radius: 4px;
        color: #86868b;
        flex-shrink: 0;
    }
    
    .notification-close:hover {
        background: #f2f2f7;
        color: #1d1d1f;
    }
    
    .notification-close i {
        width: 14px;
        height: 14px;
    }
    
    @keyframes slideInNotification {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .dragging {
        opacity: 0.5;
        transform: rotate(2deg);
    }
    
    .drag-over {
        background-color: rgba(0, 122, 255, 0.05);
        border: 2px dashed #007aff;
    }
    
    @media (max-width: 768px) {
        .notification {
            right: 16px;
            left: 16px;
            max-width: none;
        }
    }
`;