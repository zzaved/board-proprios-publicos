// Global state management
let featherReady = false;
let featherQueue = [];
let currentUser = {
    name: 'João Silva',
    role: 'Chefe de Seção SAR03',
    permissions: ['create_os', 'manage_reports', 'view_all']
};

// Mock databases
let osDatabase = new Map();
let materialDatabase = new Map();
let productionDatabase = new Map();

// Icon mappings for Feather compatibility
const ICON_MAPPINGS = {
    'map-pin': 'map-pin', 'user': 'user', 'calendar': 'calendar', 'tool': 'tool',
    'alert-triangle': 'alert-triangle', 'lightbulb': 'zap', 'cpu': 'cpu', 'package': 'package',
    'building': 'home', 'eye': 'eye', 'external-link': 'external-link', 'help-circle': 'help-circle',
    'image': 'image', 'check': 'check', 'x': 'x', 'dollar-sign': 'dollar-sign',
    'send': 'send', 'save': 'save', 'hash': 'hash', 'box': 'box', 'archive': 'archive'
};

function getValidFeatherIcon(iconName) {
    return ICON_MAPPINGS[iconName] || iconName;
}

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    loadFeatherIcons()
        .then(() => {
            featherReady = true;
            initializeApp();
            initializeMockData();
            simulateRealTimeUpdates();
            processFeatherQueue();
            initializeTabs();
            addNotificationStyles();
            console.log('🚀 BPP: Sistema inicializado com sucesso!');
        })
        .catch(error => {
            console.warn('❌ Erro ao carregar Feather:', error);
            handleFeatherFailure();
            initializeApp();
            initializeTabs();
        });

    // Set current date/time
    const now = new Date();
    const dateTimeInput = document.getElementById('data-hora');
    if (dateTimeInput) {
        dateTimeInput.value = now.toISOString().slice(0, 16);
    }
});

// Feather icons management
function loadFeatherIcons() {
    return new Promise((resolve, reject) => {
        if (typeof feather !== 'undefined' && feather.replace) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/feather-icons/4.29.0/feather.min.js';
        
        script.onload = () => {
            const checkFeather = setInterval(() => {
                if (typeof feather !== 'undefined' && feather.replace) {
                    clearInterval(checkFeather);
                    document.querySelectorAll('[data-feather]').forEach(icon => {
                        const originalIcon = icon.getAttribute('data-feather');
                        icon.setAttribute('data-feather', getValidFeatherIcon(originalIcon));
                    });
                    feather.replace();
                    resolve();
                }
            }, 50);

            setTimeout(() => {
                clearInterval(checkFeather);
                reject(new Error('Timeout waiting for Feather'));
            }, 5000);
        };
        
        script.onerror = () => reject(new Error('Failed to load Feather'));
        document.head.appendChild(script);
    });
}

function handleFeatherFailure() {
    featherReady = false;
    document.querySelectorAll('[data-feather]').forEach(icon => {
        icon.style.display = 'none';
        const parent = icon.parentElement;
        if (parent && parent.textContent.trim()) {
            const iconName = icon.getAttribute('data-feather');
            if (iconName && !parent.textContent.includes(iconName)) {
                const textNode = document.createTextNode(` [${iconName}] `);
                parent.insertBefore(textNode, icon);
            }
        }
    });
}

function safeFeatherReplace() {
    const operation = () => {
        if (!window.feather || !window.feather.replace) return;
        try {
            document.querySelectorAll('[data-feather]').forEach(icon => {
                const originalIcon = icon.getAttribute('data-feather');
                icon.setAttribute('data-feather', getValidFeatherIcon(originalIcon));
            });
            feather.replace();
        } catch (error) {
            console.warn('Erro ao atualizar ícones:', error);
        }
    };

    if (featherReady) {
        operation();
    } else {
        featherQueue.push(operation);
    }
}

function processFeatherQueue() {
    while (featherQueue.length > 0) {
        const operation = featherQueue.shift();
        try {
            operation();
        } catch (error) {
            console.warn('Erro ao processar fila:', error);
        }
    }
}

// Application initialization
function initializeApp() {
    initializeTabs();
    initializeEventListeners();
    initializeInteractiveElements();
    
    // Make functions globally available
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.showTab = showTab;
    window.createOS = createOS;
    window.createOSFromSEI = createOSFromSEI;
    window.showAISuggestions = showAISuggestions;
    window.finishVistoria = finishVistoria;
    window.saveDailyReport = saveDailyReport;
    window.sendToSEI = sendToSEI;
    window.generateMaterialReport = generateMaterialReport;
    window.saveMaterialMovement = saveMaterialMovement;
    window.saveProduction = saveProduction;
    window.openSpreadsheet = openSpreadsheet;
    window.generateQuarterlyReport = generateQuarterlyReport;
    window.addMaterial = addMaterial;
    window.removeMaterial = removeMaterial;
    window.updateProgress = updateProgress;
    window.openMaterialDetail = openMaterialDetail;
    window.exportSpreadsheet = exportSpreadsheet;
    window.printSpreadsheet = printSpreadsheet;
}

// Add notification styles
function addNotificationStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes slideOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
        .notification {
            position: fixed; top: 20px; right: 20px; background: white; border-radius: 8px; padding: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); border-left: 4px solid #007aff; z-index: 10000;
            max-width: 400px; animation: slideInNotification 0.3s ease; display: flex; align-items: flex-start; gap: 12px;
        }
        .notification-success { border-left-color: #34c759; }
        .notification-error { border-left-color: #ff3b30; }
        .notification-warning { border-left-color: #ff9500; }
        .notification-content { display: flex; align-items: flex-start; gap: 8px; flex: 1; }
        .notification-content i { width: 16px; height: 16px; margin-top: 2px; flex-shrink: 0; }
        .notification-success .notification-content i { color: #34c759; }
        .notification-error .notification-content i { color: #ff3b30; }
        .notification-warning .notification-content i { color: #ff9500; }
        .notification-content span { font-size: 14px; color: #1d1d1f; line-height: 1.4; }
        .notification-close { background: none; border: none; cursor: pointer; padding: 2px; border-radius: 4px; color: #86868b; flex-shrink: 0; }
        .notification-close:hover { background: #f2f2f7; color: #1d1d1f; }
        .notification-close i { width: 14px; height: 14px; }
        @keyframes slideInNotification { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (max-width: 768px) { .notification { right: 16px; left: 16px; max-width: none; } }
    `;
    document.head.appendChild(styles);
}

// Mock data initialization
function initializeMockData() {
    osDatabase.set('2025-0847', {
        seiNumber: '1129.2025/0000914-2',
        title: 'Vazamento hidráulico',
        location: 'CEU Continental',
        requester: 'Ana Costa - Diretora CEU',
        division: 'SAR03.03',
        status: 'vistoria',
        createdDate: new Date('2025-05-20'),
        description: 'Vazamento no sistema hidráulico da unidade'
    });

    materialDatabase.set('cimento', {
        name: 'Cimento (saco 50kg)',
        currentStock: 15,
        minStock: 50,
        unit: 'UN',
        lastMovement: new Date('2025-05-24')
    });

    materialDatabase.set('areia', {
        name: 'Areia (m³)',
        currentStock: 45,
        minStock: 20,
        unit: 'M³',
        lastMovement: new Date('2025-05-23')
    });

    materialDatabase.set('tinta', {
        name: 'Tinta Branca (18L)',
        currentStock: 8,
        minStock: 15,
        unit: 'UN',
        lastMovement: new Date('2025-05-24')
    });
}

// Tab functionality
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
}

function showTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (event && event.target) {
        const clickedTab = event.target.closest('.tab');
        if (clickedTab) {
            clickedTab.classList.add('active');
        }
    } else {
        const correspondingTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (correspondingTab) {
            correspondingTab.classList.add('active');
        }
    }
    
    safeFeatherReplace();
}

// AI Suggestions
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
        suggestionsContentElement.innerHTML = getSuggestionsByServiceType(tipoServico);
        safeFeatherReplace();
    } else {
        suggestionsDivElement.style.display = 'none';
    }
}

function getSuggestionsByServiceType(serviceType) {
    const suggestions = {
        'hidraulica': `
            <div class="suggestion-item">
                <div class="suggestion-header"><i data-feather="lightbulb"></i><strong>Caso Similar</strong></div>
                <div class="suggestion-content">
                    <p>OS #2024-1156 - Vazamento na UBS Centro (Set/2024)</p>
                    <div class="suggestion-details">
                        <span><strong>Materiais:</strong> Cano PVC 100mm (5m), Conexões (8 un), Vedante (2 tubos)</span>
                        <span><strong>Tempo médio:</strong> 2,5 dias | <strong>Custo médio:</strong> R$ 1.800,00</span>
                    </div>
                </div>
            </div>
            <div class="suggestion-item">
                <div class="suggestion-header"><i data-feather="package"></i><strong>Materiais Frequentes</strong></div>
                <div class="suggestion-content">
                    <ul class="materials-list">
                        <li>Canos PVC (diversos diâmetros)</li>
                        <li>Conexões e registros</li>
                        <li>Massa de vedação</li>
                        <li>Fita veda rosca</li>
                    </ul>
                </div>
            </div>`,
        'eletrica': `
            <div class="suggestion-item">
                <div class="suggestion-header"><i data-feather="lightbulb"></i><strong>Caso Similar</strong></div>
                <div class="suggestion-content">
                    <p>OS #2024-1278 - Quadro elétrico CEU Vila Galvão (Out/2024)</p>
                    <div class="suggestion-details">
                        <span><strong>Materiais:</strong> Disjuntores 20A (4 un), Fios 2,5mm (50m)</span>
                        <span><strong>Tempo médio:</strong> 1,8 dias | <strong>Custo médio:</strong> R$ 2.400,00</span>
                    </div>
                </div>
            </div>
            <div class="suggestion-item">
                <div class="suggestion-header"><i data-feather="alert-triangle"></i><strong>Atenção</strong></div>
                <div class="suggestion-content">
                    <p>Sempre verificar se precisa desligar energia geral antes de iniciar os trabalhos</p>
                </div>
            </div>`,
        'telhado': `
            <div class="suggestion-item">
                <div class="suggestion-header"><i data-feather="lightbulb"></i><strong>Caso Similar</strong></div>
                <div class="suggestion-content">
                    <p>OS #2024-1247 - Reparo telhado EMEI Jardim Adriana (Nov/2024)</p>
                    <div class="suggestion-details">
                        <span><strong>Materiais:</strong> Telhas cerâmicas (60 un), Argamassa (8 sacos)</span>
                        <span><strong>Tempo médio:</strong> 3,1 dias | <strong>Custo médio:</strong> R$ 3.500,00</span>
                    </div>
                </div>
            </div>`
    };

    return suggestions[serviceType] || `
        <div class="suggestion-item">
            <div class="suggestion-header"><i data-feather="info"></i><strong>Aguardando Seleção</strong></div>
            <div class="suggestion-content">
                <p>Casos similares serão sugeridos após seleção do tipo de serviço</p>
            </div>
        </div>`;
}

// OS Creation
function createOSFromSEI(seiNumber) {
    document.getElementById('sei-number').value = seiNumber;
    
    if (seiNumber === '1129.2025/0000916-7') {
        document.getElementById('solicitante').value = 'Maria Santos';
        document.getElementById('orgao').value = 'educacao';
        document.getElementById('local').value = 'Escola Municipal Vila Galvão';
        document.getElementById('tipo-servico').value = 'telhado';
        document.getElementById('descricao').value = 'Solicitação de reparo urgente no telhado devido a goteiras em várias salas de aula.';
    }
    
    openModal('nova-os-modal');
    showAISuggestions();
}

function createOS(event) {
    if (event) {
        event.preventDefault();
    }

    const formData = getFormData();
    if (!validateFormData(formData)) {
        return;
    }

    const button = event ? event.target : document.querySelector('.btn-primary');
    if (button) {
        showLoadingState(button);
        
        setTimeout(() => {
            const osNumber = generateOSNumber();
            const osData = createOSData(formData, osNumber);
            
            osDatabase.set(osNumber, osData);
            updateOSSpreadsheet(osData);
            
            showNotification(
                `Ordem de Serviço criada com sucesso!\n\n` +
                `Número: OS #${osNumber}\n` +
                `SEI: ${formData.seiNumber}\n` +
                `Divisão: ${formData.divisao}\n\n` +
                `OS impressa e pronta para vistoria técnica.`,
                'success'
            );

            resetForm();
            hideLoadingState(button);
            closeModal('nova-os-modal');
            
            setTimeout(() => {
                showTab('kanban');
            }, 1500);
        }, 2000);
    }
}

function getFormData() {
    return {
        seiNumber: document.getElementById('sei-number')?.value,
        solicitante: document.getElementById('solicitante')?.value,
        orgao: document.getElementById('orgao')?.value,
        local: document.getElementById('local')?.value,
        divisao: document.getElementById('divisao')?.value,
        tipoServico: document.getElementById('tipo-servico')?.value,
        dataHora: document.getElementById('data-hora')?.value,
        descricao: document.getElementById('descricao')?.value
    };
}

function validateFormData(data) {
    const required = ['seiNumber', 'solicitante', 'orgao', 'local', 'divisao', 'tipoServico', 'descricao'];
    
    for (const field of required) {
        if (!data[field]) {
            showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
            return false;
        }
    }
    return true;
}

function generateOSNumber() {
    return '2025-' + String(Math.floor(Math.random() * 1000) + 800).padStart(4, '0');
}

function createOSData(formData, osNumber) {
    return {
        osNumber,
        seiNumber: formData.seiNumber,
        title: formData.tipoServico,
        location: formData.local,
        requester: formData.solicitante,
        division: formData.divisao,
        serviceType: formData.tipoServico,
        description: formData.descricao,
        status: 'vistoria',
        createdDate: new Date(formData.dataHora || Date.now()),
        createdBy: currentUser.name
    };
}

function updateOSSpreadsheet(osData) {
    console.log(`Planilha ${osData.division} atualizada com OS #${osData.osNumber}`);
}

// Vistoria functionality
function finishVistoria() {
    const custoPrevio = document.getElementById('custo-previo')?.value;
    const urgencia = document.getElementById('urgencia-vistoria')?.value;
    
    if (!custoPrevio || !urgencia) {
        showNotification('Por favor, preencha o custo prévio e a classificação', 'error');
        return;
    }

    const isUrgent = urgencia === 'urgente';
    
    showNotification(
        `Vistoria concluída!\n\n` +
        `Custo estimado: R$ ${parseFloat(custoPrevio).toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n` +
        `Classificação: ${isUrgent ? 'URGENTE - Risco/Segurança' : 'Fila de Espera'}\n\n` +
        `OS encaminhada para o ${isUrgent ? 'atendimento imediato' : 'planejamento de execução'}.`,
        'success'
    );
    
    closeModal('vistoria-modal');
}

// Daily Report
function saveDailyReport() {
    const atividades = document.getElementById('atividades-realizadas')?.value;
    const progresso = document.getElementById('progresso-range')?.value;
    
    if (!atividades) {
        showNotification('Por favor, descreva as atividades realizadas', 'error');
        return;
    }

    const teamMembers = [];
    document.querySelectorAll('.team-member input[type="checkbox"]:checked').forEach(checkbox => {
        const label = checkbox.nextElementSibling;
        if (label) {
            teamMembers.push(label.textContent);
        }
    });

    const materials = [];
    document.querySelectorAll('.material-item').forEach(item => {
        const text = item.querySelector('span')?.textContent;
        if (text) {
            materials.push(text);
        }
    });

    materials.forEach(material => {
        updateMaterialUsage(material);
    });

    showNotification(
        `Relatório Diário salvo com sucesso!\n\n` +
        `Progresso: ${progresso}%\n` +
        `Equipe: ${teamMembers.length} funcionários\n` +
        `Materiais utilizados: ${materials.length} itens\n\n` +
        `Planilha de controle atualizada automaticamente.`,
        'success'
    );

    closeModal('daily-report-modal');
}

function updateMaterialUsage(materialText) {
    const match = materialText.match(/^(.+?)\s*-\s*(\d+)\s*unidades?$/);
    if (match) {
        const [, materialName, quantity] = match;
        const qty = parseInt(quantity);
        
        for (const [key, material] of materialDatabase) {
            if (material.name.toLowerCase().includes(materialName.toLowerCase())) {
                material.currentStock = Math.max(0, material.currentStock - qty);
                material.lastMovement = new Date();
                break;
            }
        }
    }
}

function addMaterial() {
    const materialSelect = document.querySelector('.material-select');
    const quantityInput = document.querySelector('.material-quantity');
    
    if (!materialSelect.value || !quantityInput.value) {
        showNotification('Selecione um material e quantidade', 'warning');
        return;
    }

    const materialText = materialSelect.options[materialSelect.selectedIndex].text;
    const quantity = quantityInput.value;
    
    const materialsList = document.querySelector('.materials-list');
    const materialItem = document.createElement('div');
    materialItem.className = 'material-item';
    materialItem.innerHTML = `
        <span>${materialText} - ${quantity} unidades</span>
        <button type="button" onclick="removeMaterial(this)">
            <i data-feather="trash-2"></i>
        </button>
    `;
    
    materialsList.appendChild(materialItem);
    safeFeatherReplace();
    
    materialSelect.value = '';
    quantityInput.value = '';
}

function removeMaterial(button) {
    button.closest('.material-item').remove();
}

function updateProgress(value) {
    document.getElementById('progress-value').textContent = value + '%';
}

// OS Closing
function sendToSEI() {
    showNotification(
        `Documentação enviada para o SEI!\n\n` +
        `• Relatório de materiais anexado\n` +
        `• Fotos do trabalho concluído\n` +
        `• OS finalizada e arquivada\n\n` +
        `Processo SEI atualizado automaticamente.`,
        'success'
    );

    closeModal('closing-modal');
}

function generateMaterialReport() {
    showNotification(
        `Relatório de Materiais gerado!\n\n` +
        `• Planilha XLS criada\n` +
        `• Custos detalhados por item\n` +
        `• Pronto para anexar ao SEI\n\n` +
        `Arquivo salvo em: Relatórios/Material_Gasto_OS2025-0830.xlsx`,
        'success'
    );
}

// Material Management
function saveMaterialMovement() {
    const tipo = document.getElementById('movimento-tipo')?.value;
    const material = document.getElementById('material-nome')?.value;
    const quantidade = document.getElementById('quantidade-movimento')?.value;
    const destino = document.getElementById('destino-origem')?.value;

    if (!tipo || !material || !quantidade) {
        showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }

    const materialKey = material.toLowerCase().replace(/\s+/g, '_');
    let materialData = materialDatabase.get(materialKey);
    
    if (!materialData) {
        materialData = {
            name: material,
            currentStock: 0,
            minStock: 10,
            unit: 'UN',
            lastMovement: new Date()
        };
        materialDatabase.set(materialKey, materialData);
    }

    const qty = parseInt(quantidade);
    if (tipo === 'entrada') {
        materialData.currentStock += qty;
    } else {
        materialData.currentStock = Math.max(0, materialData.currentStock - qty);
    }
    materialData.lastMovement = new Date();

    showNotification(
        `Movimentação registrada!\n\n` +
        `${material}: ${tipo === 'entrada' ? '+' : '-'}${qty} ${materialData.unit}\n` +
        `Estoque atual: ${materialData.currentStock} ${materialData.unit}\n` +
        `${destino ? `Destino/Origem: ${destino}` : ''}`,
        'success'
    );

    closeModal('material-entry-modal');
    
    if (document.getElementById('almoxarifado').classList.contains('active')) {
        updateWarehouseTable();
    }
}

function updateWarehouseTable() {
    const tbody = document.querySelector('.warehouse-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    for (const [key, material] of materialDatabase) {
        const row = document.createElement('tr');
        const isLowStock = material.currentStock <= material.minStock;
        
        if (isLowStock) {
            row.classList.add('low-stock');
        }

        const statusClass = material.currentStock <= material.minStock * 0.3 ? 'critical' :
                           material.currentStock <= material.minStock ? 'warning' : 'normal';
        const statusText = statusClass === 'critical' ? 'Crítico' :
                          statusClass === 'warning' ? 'Baixo' : 'Normal';

        row.innerHTML = `
            <td>${material.name}</td>
            <td>${material.currentStock}</td>
            <td>${material.unit}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${material.lastMovement.toLocaleDateString('pt-BR')}</td>
            <td>
                <button class="btn-icon" onclick="openMaterialDetail('${key}')">
                    <i data-feather="eye"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    }
    
    safeFeatherReplace();
}

function openMaterialDetail(materialKey) {
    const material = materialDatabase.get(materialKey);
    if (!material) return;

    showNotification(
        `Detalhes do Material\n\n` +
        `${material.name}\n` +
        `Estoque: ${material.currentStock} ${material.unit}\n` +
        `Mínimo: ${material.minStock} ${material.unit}\n` +
        `Última movimentação: ${material.lastMovement.toLocaleDateString('pt-BR')}`,
        'info'
    );
}

// Production Management
function saveProduction() {
    const produto = document.getElementById('produto-tipo')?.value;
    const quantidade = document.getElementById('quantidade-produzida')?.value;
    const data = document.getElementById('data-producao')?.value;
    const materiais = document.getElementById('materiais-utilizados-producao')?.value;

    if (!produto || !quantidade || !data) {
        showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }

    const productionId = `${produto}_${data}`;
    const productionData = {
        type: produto,
        quantity: parseInt(quantidade),
        date: new Date(data),
        materials: materiais,
        registeredBy: currentUser.name,
        registeredAt: new Date()
    };

    productionDatabase.set(productionId, productionData);

    if (materiais) {
        updateMaterialConsumption(materiais);
    }

    const productName = document.querySelector('#produto-tipo option:checked')?.text || produto;

    showNotification(
        `Produção registrada!\n\n` +
        `${productName}: ${quantidade} peças\n` +
        `Data: ${new Date(data).toLocaleDateString('pt-BR')}\n` +
        `${materiais ? `Materiais: ${materiais}` : ''}\n\n` +
        `Planilha de produção atualizada.`,
        'success'
    );

    closeModal('production-entry-modal');
}

function updateMaterialConsumption(materialsText) {
    const materialEntries = materialsText.split(',');
    
    materialEntries.forEach(entry => {
        const match = entry.trim().match(/(.+?):\s*(\d+)\s*(.+)/);
        if (match) {
            const [, materialName, quantity] = match;
            const qty = parseInt(quantity);
            
            for (const [key, material] of materialDatabase) {
                if (material.name.toLowerCase().includes(materialName.toLowerCase().trim())) {
                    material.currentStock = Math.max(0, material.currentStock - qty);
                    material.lastMovement = new Date();
                    break;
                }
            }
        }
    });
}

// Spreadsheet Management
function openSpreadsheet(type) {
    const spreadsheetData = generateSpreadsheetData(type);
    const modal = document.getElementById('spreadsheet-modal');
    const title = document.getElementById('spreadsheet-title');
    const content = document.getElementById('spreadsheet-content');

    title.textContent = spreadsheetData.title;
    content.innerHTML = spreadsheetData.content;

    openModal('spreadsheet-modal');
    safeFeatherReplace();
}

function generateSpreadsheetData(type) {
    const templates = {
        construcao: {
            title: 'SAR03.01 - Relatório de Ordens de Serviço (Construção)',
            content: generateConstructionSpreadsheet()
        },
        manutencao: {
            title: 'SAR03.03 - Relatório de Ordens de Serviço (Manutenção)',
            content: generateMaintenanceSpreadsheet()
        },
        almoxarifado: {
            title: 'Material do Almoxarifado - Janeiro 2025',
            content: generateAlmoxarifadoSpreadsheet()
        },
        fabrica: {
            title: 'Produção da Fábrica de Pré-moldados - Janeiro 2025',
            content: generateFactorySpreadsheet()
        }
    };

    return templates[type] || { title: 'Planilha', content: '<p>Dados não encontrados</p>' };
}

function generateConstructionSpreadsheet() {
    return `
        <table class="spreadsheet-table">
            <thead>
                <tr class="header-main">
                    <th colspan="12">PREFEITURA DE GUARULHOS</th>
                </tr>
                <tr class="header-section">
                    <th colspan="12">DIVISÃO TÉCNICA DE CONSTRUÇÃO - SAR 03.01</th>
                </tr>
                <tr class="header-year">
                    <th colspan="12">ORDENS DE SERVIÇOS EM 2025</th>
                </tr>
                <tr>
                    <th>O.S</th>
                    <th>DATA/OS</th>
                    <th>SOLICITANTE</th>
                    <th>PROJETO/OBRA/SERVIÇO</th>
                    <th>LOCAL/TRECHO</th>
                    <th>SEI</th>
                    <th>BAIRRO</th>
                    <th>INÍCIO</th>
                    <th>TÉRMINO</th>
                    <th>DIAS</th>
                    <th>SITUAÇÃO</th>
                    <th>CUSTO</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>2025-0840</td><td>20/05/2025</td><td>Lucia Ferreira</td><td>Pintura de salas</td><td>EMEI Jardim São João</td><td>1129.2025/0000908-5</td><td>Jardim São João</td><td>-</td><td>-</td><td>-</td><td>Fila</td><td>R$ 1.250,00</td></tr>
                <tr><td>2025-0835</td><td>18/05/2025</td><td>Paulo Santos</td><td>Reforma do pátio</td><td>Escola Municipal Centro</td><td>1129.2025/0000905-8</td><td>Centro</td><td>22/05/2025</td><td>-</td><td>3</td><td>Execução</td><td>R$ 8.500,00</td></tr>
                <tr><td>2025-0825</td><td>15/05/2025</td><td>Ana Silva</td><td>Construção de rampa</td><td>UBS Vila Rica</td><td>1129.2025/0000895-2</td><td>Vila Rica</td><td>16/05/2025</td><td>20/05/2025</td><td>4</td><td>Concluído</td><td>R$ 5.200,00</td></tr>
            </tbody>
        </table>
    `;
}

function generateMaintenanceSpreadsheet() {
    return `
        <table class="spreadsheet-table">
            <thead>
                <tr class="header-main">
                    <th colspan="10">SECRETARIA DE ADMINISTRAÇÕES REGIONAIS - SAR</th>
                </tr>
                <tr class="header-section">
                    <th colspan="10">CADASTRO DE SERVIÇO DIVISÃO TÉCNICA DE CONSTRUÇÃO - SAR 03.03</th>
                </tr>
                <tr class="header-year">
                    <th colspan="10">ANO 2025</th>
                </tr>
                <tr>
                    <th>O.S</th>
                    <th>SOLICITANTE</th>
                    <th>OBRA/SERVIÇO</th>
                    <th>LOCAL/TRECHO</th>
                    <th>SEI</th>
                    <th>BAIRRO</th>
                    <th>INÍCIO</th>
                    <th>TÉRMINO</th>
                    <th>SITUAÇÃO</th>
                    <th>CUSTO</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>2025-0847</td><td>Ana Costa</td><td>Vazamento hidráulico</td><td>CEU Continental</td><td>1129.2025/0000914-2</td><td>Continental</td><td>-</td><td>-</td><td>Vistoria</td><td>-</td></tr>
                <tr><td>2025-0845</td><td>Dr. Roberto Silva</td><td>Curto-circuito quadro elétrico</td><td>UBS Vila Augusta</td><td>1129.2025/0000910-1</td><td>Vila Augusta</td><td>-</td><td>-</td><td>Urgente</td><td>R$ 2.800,00</td></tr>
                <tr><td>2025-0830</td><td>Dra. Marina Costa</td><td>Troca de portas</td><td>UBS Macedo</td><td>1129.2025/0000901-3</td><td>Macedo</td><td>20/05/2025</td><td>23/05/2025</td><td>Concluído</td><td>R$ 3.200,00</td></tr>
            </tbody>
        </table>
    `;
}

function generateAlmoxarifadoSpreadsheet() {
    return `
        <table class="spreadsheet-table">
            <thead>
                <tr class="header-main">
                    <th colspan="8">SECRETARIA DE ADMINISTRAÇÕES REGIONAIS - SAR</th>
                </tr>
                <tr class="header-section">
                    <th colspan="8">DEPARTAMENTO DE OBRAS DA ADMINISTRAÇÃO DIRETA E MANUTENÇÃO - SAR03</th>
                </tr>
                <tr class="header-year">
                    <th colspan="8">MATERIAL AREIA - MÊS JANEIRO / 2025</th>
                </tr>
                <tr>
                    <th>DATA</th>
                    <th>QUANTIDADE ENTRADA</th>
                    <th>FORNECEDOR</th>
                    <th>DATA SAÍDA</th>
                    <th>QUANTIDADE REQUISIÇÃO/SOLICITANTE</th>
                    <th>DESTINO</th>
                    <th>ESTOQUE</th>
                    <th>M³</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>02/01/2025</td><td>50</td><td>Fornecedor ABC</td><td>05/01/2025</td><td>15</td><td>OS 2025-0820</td><td>35</td><td>M³</td></tr>
                <tr><td>10/01/2025</td><td>30</td><td>Fornecedor XYZ</td><td>12/01/2025</td><td>20</td><td>OS 2025-0825</td><td>45</td><td>M³</td></tr>
                <tr><td>-</td><td>-</td><td>-</td><td>24/05/2025</td><td>2</td><td>OS 2025-0835</td><td>43</td><td>M³</td></tr>
                <tr class="header-year"><td colspan="6">ESTOQUE ATUAL</td><td>43</td><td>M³</td></tr>
            </tbody>
        </table>
    `;
}

function generateFactorySpreadsheet() {
    return `
        <table class="spreadsheet-table">
            <thead>
                <tr class="header-main">
                    <th colspan="15">PREFEITURA MUNICIPAL DE GUARULHOS</th>
                </tr>
                <tr class="header-section">
                    <th colspan="15">SECRETARIA DE ADMINISTRAÇÕES REGIONAIS - SAR</th>
                </tr>
                <tr class="header-section">
                    <th colspan="15">DEPARTAMENTO DE OBRAS DA ADMINISTRAÇÃO DIRETA E MANUTENÇÃO - SAR03</th>
                </tr>
                <tr class="header-year">
                    <th colspan="15">FICHA CONTROLE DE PRODUÇÃO - 01/25 - 2025</th>
                </tr>
                <tr>
                    <th>DATA</th>
                    <th>BLOCO</th>
                    <th>LAJOTA</th>
                    <th>GUIA</th>
                    <th>SARJETA</th>
                    <th>MESA</th>
                    <th>MOURÃO</th>
                    <th>PLACA</th>
                    <th>POSTE</th>
                    <th>TAMPA</th>
                    <th>PÓ DE PEDRA</th>
                    <th>CIMENTO</th>
                    <th>AREIA</th>
                    <th>PEDRA</th>
                    <th>PEDRISCO</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>02/01</td><td>250</td><td>50</td><td>20</td><td>15</td><td>5</td><td>10</td><td>8</td><td>3</td><td>12</td><td>2</td><td>15</td><td>3</td><td>2</td><td>1</td></tr>
                <tr><td>05/01</td><td>300</td><td>60</td><td>25</td><td>18</td><td>8</td><td>12</td><td>10</td><td>5</td><td>15</td><td>3</td><td>18</td><td>4</td><td>3</td><td>2</td></tr>
                <tr><td>10/01</td><td>280</td><td>45</td><td>22</td><td>16</td><td>6</td><td>11</td><td>9</td><td>4</td><td>13</td><td>2</td><td>16</td><td>3</td><td>2</td><td>1</td></tr>
                <tr class="header-year"><td>TOTAL</td><td>2450</td><td>450</td><td>180</td><td>140</td><td>55</td><td>95</td><td>75</td><td>35</td><td>115</td><td>18</td><td>145</td><td>28</td><td>20</td><td>12</td></tr>
            </tbody>
        </table>
    `;
}

function exportSpreadsheet() {
    showNotification(
        'Planilha exportada!\n\n' +
        'Arquivo XLS salvo em Downloads/\n' +
        'Formato compatível com Excel',
        'success'
    );
}

function printSpreadsheet() {
    window.print();
}

// Quarterly Report
function generateQuarterlyReport() {
    showNotification(
        'Gerando Relatório Quadrimestral...\n\n' +
        '• Consolidando dados das OS\n' +
        '• Processando consumo de materiais\n' +
        '• Calculando produção da fábrica\n' +
        '• Gerando gráficos e análises',
        'info'
    );

    setTimeout(() => {
        showNotification(
            'Relatório Quadrimestral gerado!\n\n' +
            '• 156 OS finalizadas\n' +
            '• R$ 185.000 em materiais\n' +
            '• 2.340 peças produzidas\n' +
            '• Eficiência: 85%\n\n' +
            'Arquivo: Relatorio_Quadrimestral_2025_Q1.pdf',
            'success'
        );
    }, 3000);
}

// Utility functions
function showLoadingState(button) {
    const originalText = button.innerHTML;
    button.classList.add('loading');
    button.disabled = true;
    button.innerHTML = '<i data-feather="loader"></i> Processando...';
    button.setAttribute('data-original-text', originalText);
    safeFeatherReplace();
}

function hideLoadingState(button) {
    const originalText = button.getAttribute('data-original-text');
    button.classList.remove('loading');
    button.disabled = false;
    button.innerHTML = originalText;
    button.removeAttribute('data-original-text');
    safeFeatherReplace();
}

function resetForm() {
    const elements = [
        'sei-number', 'solicitante', 'orgao', 'local', 
        'divisao', 'tipo-servico', 'descricao'
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
        
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        safeFeatherReplace();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.style.animation = 'slideOut 0.3s ease';
        }
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            modal.style.animation = '';
            if (content) {
                content.style.animation = '';
            }
        }, 300);
    }
}

// Event Listeners
function initializeEventListeners() {
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });

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

function initializeInteractiveElements() {
    const cards = document.querySelectorAll('.os-card, .stat-card, .dashboard-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

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

    document.body.appendChild(notification);
    safeFeatherReplace();

    const timeout = type === 'success' ? 5000 : 8000;
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, timeout);
}

// Simulate real-time updates
function simulateRealTimeUpdates() {
    setInterval(() => {
        const statCards = document.querySelectorAll('.stat-card .stat-content h3');
        if (Math.random() > 0.9) {
            const randomCard = statCards[Math.floor(Math.random() * statCards.length)];
            if (randomCard) {
                const currentValue = parseInt(randomCard.textContent);
                if (!isNaN(currentValue) && !randomCard.textContent.includes('dias')) {
                    const change = Math.random() > 0.6 ? 1 : -1;
                    const newValue = Math.max(0, currentValue + change);
                    randomCard.textContent = newValue;
                    
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

// Performance tracking
function trackPerformance() {
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

// Final initialization
console.log('🎯 Sistema BPP totalmente carregado e operacional!');
console.log('📝 Funcionalidades disponíveis:');
console.log('   • Gestão completa de OS');
console.log('   • Relatórios integrados');
console.log('   • Controle de materiais');
console.log('   • Produção da fábrica');
console.log('   • Sistema de notificações');
console.log('   • Interface responsiva');
console.log('💡 Sistema pronto para demonstração!');