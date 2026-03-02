class BuscaCepService {
    constructor() {
        this.form = document.getElementById('cepForm');
        this.logradouroInput = document.getElementById('logradouro');
        this.cidadeInput = document.getElementById('cidade');
        this.estadoSelect = document.getElementById('estado');
        this.btnBuscar = document.getElementById('btnBuscar');
        this.resultadoDiv = document.getElementById('resultado');
        this.erroDiv = document.getElementById('erro');
        this.listaCepsDiv = document.getElementById('listaCeps');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupInputValidation();
    }

    setupInputValidation() {
        [this.logradouroInput, this.cidadeInput, this.estadoSelect].forEach(input => {
            input.addEventListener('input', () => this.clearResults());
        });
    }

    clearResults() {
        this.resultadoDiv.style.display = 'none';
        this.erroDiv.style.display = 'none';
        this.listaCepsDiv.innerHTML = '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const logradouro = this.logradouroInput.value.trim();
        const cidade = this.cidadeInput.value.trim();
        const estado = this.estadoSelect.value;

        if (!this.validateInputs(logradouro, cidade, estado)) {
            return;
        }

        await this.buscarCep(logradouro, cidade, estado);
    }

    validateInputs(logradouro, cidade, estado) {
        if (!logradouro) {
            this.showError('Por favor, informe o logradouro (rua/avenida).');
            return false;
        }

        if (!cidade) {
            this.showError('Por favor, informe a cidade.');
            return false;
        }

        if (!estado) {
            this.showError('Por favor, selecione o estado (UF).');
            return false;
        }

        return true;
    }

    async buscarCep(logradouro, cidade, estado) {
        this.setLoadingState(true);
        this.clearResults();

        try {
            // Codifica os parâmetros para URL
            const url = `https://viacep.com.br/ws/${estado}/${cidade}/${logradouro}/json/`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Erro na consulta. Tente novamente.');
            }

            const data = await response.json();

            if (data.erro) {
                this.showError('Nenhum CEP encontrado para este endereço.');
                return;
            }

            if (data.length === 0) {
                this.showError('Nenhum CEP encontrado para este endereço.');
                return;
            }

            this.displayResults(data);
        } catch (error) {
            console.error('Erro:', error);
            this.showError('Erro ao buscar o CEP. Verifique sua conexão e tente novamente.');
        } finally {
            this.setLoadingState(false);
        }
    }

    displayResults(ceps) {
        if (!Array.isArray(ceps)) {
            ceps = [ceps];
        }

        this.resultadoDiv.style.display = 'block';
        
        if (ceps.length === 1) {
            this.listaCepsDiv.innerHTML = this.createSingleResultHTML(ceps[0]);
        } else {
            this.listaCepsDiv.innerHTML = this.createMultipleResultsHTML(ceps);
        }
    }

    createSingleResultHTML(cep) {
        return `
            <div class="cep-item">
                <div class="cep-destaque">CEP: ${this.formatCep(cep.cep)}</div>
                <p><strong>Logradouro:</strong> ${cep.logradouro || 'Não informado'}</p>
                <p><strong>Complemento:</strong> ${cep.complemento || 'Não informado'}</p>
                <p><strong>Bairro:</strong> ${cep.bairro || 'Não informado'}</p>
                <p><strong>Cidade:</strong> ${cep.localidade || 'Não informado'}</p>
                <p><strong>Estado:</strong> ${cep.uf || 'Não informado'}</p>
                <p><strong>DDD:</strong> ${cep.ddd || 'Não informado'}</p>
                <p><strong>IBGE:</strong> ${cep.ibge || 'Não informado'}</p>
            </div>
        `;
    }

    createMultipleResultsHTML(ceps) {
        let html = '<p>Encontrados múltiplos CEPs para este endereço:</p>';
        
        ceps.forEach((cep, index) => {
            html += `
                <div class="cep-item">
                    <p><strong>Opção ${index + 1}</strong></p>
                    <p><strong>CEP:</strong> ${this.formatCep(cep.cep)}</p>
                    <p><strong>Logradouro:</strong> ${cep.logradouro || 'Não informado'}</p>
                    <p><strong>Complemento:</strong> ${cep.complemento || 'Não informado'}</p>
                    <p><strong>Bairro:</strong> ${cep.bairro || 'Não informado'}</p>
                </div>
            `;
        });
        
        return html;
    }

    formatCep(cep) {
        if (!cep) return 'Não informado';
        // Remove qualquer caractere não numérico e formata
        const cepNumerico = cep.replace(/\D/g, '');
        if (cepNumerico.length === 8) {
            return cepNumerico.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        return cep;
    }

    showError(message) {
        this.erroDiv.textContent = message;
        this.erroDiv.style.display = 'block';
        this.resultadoDiv.style.display = 'none';
        
        // Auto hide após 5 segundos
        setTimeout(() => {
            this.erroDiv.style.display = 'none';
        }, 5000);
    }

    setLoadingState(isLoading) {
        const btnText = this.btnBuscar.querySelector('.btn-text');
        const spinner = this.btnBuscar.querySelector('.loading-spinner');
        
        if (isLoading) {
            this.btnBuscar.disabled = true;
            btnText.style.display = 'none';
            spinner.style.display = 'inline-block';
        } else {
            this.btnBuscar.disabled = false;
            btnText.style.display = 'inline';
            spinner.style.display = 'none';
        }
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new BuscaCepService();
});