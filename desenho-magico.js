/**
 * DesenhoMágico.js
 * Uma biblioteca leve para transformar desenhos no canvas em códigos (Base64) e vice-versa.
 */
class DesenhoMagico {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Configurações personalizáveis
        this.lineWidth = options.lineWidth || 3;
        this.lineColor = options.lineColor || '#000000';
        this.sensibilidade = options.sensibilidade || 3; // Ignora micromovimentos

        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.lineColor;

        this.desenhando = false;
        this.todosOsTracos = [];
        this.tracoAtual = [];
        this.ultimoX = 0;
        this.ultimoY = 0;

        this._iniciarEventos();
    }

    _obterCoordenadas(e) {
        // Pega a posição do mouse relativa ao canvas (ignora margens da página)
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: Math.round(e.clientX - rect.left),
            y: Math.round(e.clientY - rect.top)
        };
    }

    _iniciarEventos() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.desenhando = true;
            const {x, y} = this._obterCoordenadas(e);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            
            this.tracoAtual = {
                color: this.lineColor,
                width: this.lineWidth,
                points: [[x, y]]
            };
            this.ultimoX = x;
            this.ultimoY = y;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.desenhando) return;
            const {x, y} = this._obterCoordenadas(e);
            
            const distX = Math.abs(x - this.ultimoX);
            const distY = Math.abs(y - this.ultimoY);

            // Otimização: só salva se mover além da sensibilidade
            if (distX > this.sensibilidade || distY > this.sensibilidade) {
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                this.tracoAtual.points.push([x, y]);
                this.ultimoX = x;
                this.ultimoY = y;
            }
        });

        const finalizarTraco = () => {
            if (this.desenhando) {
                this.desenhando = false;
                if (this.tracoAtual && this.tracoAtual.points && this.tracoAtual.points.length > 0) {
                    this.todosOsTracos.push(this.tracoAtual);
                }
            }
        };

        this.canvas.addEventListener('mouseup', finalizarTraco);
        this.canvas.addEventListener('mouseleave', finalizarTraco); // Impede bugar ao tirar o mouse do canvas
    }

    gerarCodigo() {
        if (this.todosOsTracos.length === 0) return null;
        const textoJSON = JSON.stringify(this.todosOsTracos);
        return btoa(textoJSON); // Converte para Base64
    }

    carregarCodigo(codigo) {
        try {
            const textoJSON = atob(codigo);
            const tracosLidos = JSON.parse(textoJSON);

            this.limparTela();
            this.todosOsTracos = tracosLidos;

            this.todosOsTracos.forEach(traco => {
                const isNovaVersao = !Array.isArray(traco);
                const pontos = isNovaVersao ? traco.points : traco;
                const cor = isNovaVersao ? traco.color : this.lineColor;
                const espessura = isNovaVersao ? traco.width : this.lineWidth;

                this.ctx.beginPath();
                this.ctx.strokeStyle = cor;
                this.ctx.lineWidth = espessura;

                pontos.forEach((ponto, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(ponto[0], ponto[1]);
                    } else {
                        this.ctx.lineTo(ponto[0], ponto[1]);
                    }
                });
                this.ctx.stroke();
            });

            // Restaura as configurações atuais do pincel
            this.ctx.strokeStyle = this.lineColor;
            this.ctx.lineWidth = this.lineWidth;

            return true; // Sucesso
        } catch (erro) {
            return false; // Falha na leitura do código
        }
    }

    limparTela() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.todosOsTracos = [];
    }
}