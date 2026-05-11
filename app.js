// Instancia a nossa classe DesenhoMagico na demo
const demo = new DesenhoMagico('telaDemo', {
    lineWidth: parseInt(document.getElementById('lineWidth').value),
    lineColor: document.getElementById('colorPicker').value
});

// Controles de Ferramentas (Cor e Espessura)
document.getElementById('colorPicker').addEventListener('input', (e) => {
    demo.lineColor = e.target.value;
    demo.ctx.strokeStyle = demo.lineColor;
});

document.getElementById('lineWidth').addEventListener('input', (e) => {
    demo.lineWidth = parseInt(e.target.value);
    demo.ctx.lineWidth = demo.lineWidth;
});

// Eventos de Botões (Ações principais)
document.getElementById('btnExportar').addEventListener('click', () => {
    const codigoExportado = demo.gerarCodigo();
    if (codigoExportado) {
        document.getElementById('boxGerado').value = codigoExportado;
        
        // Efeito visual de sucesso
        const box = document.getElementById('boxGerado');
        box.style.borderColor = '#22c55e';
        setTimeout(() => box.style.borderColor = 'var(--border)', 1000);
    } else {
        alert('Desenhe alguma coisa no quadro antes de exportar!');
    }
});

document.getElementById('btnImportar').addEventListener('click', () => {
    const codigo = document.getElementById('boxEntrada').value;
    if (!codigo) {
        alert('Cole um código gerado na caixa de importação!');
        return;
    }

    const importouComSucesso = demo.carregarCodigo(codigo);
    if (!importouComSucesso) {
        alert('Código inválido ou corrompido. Tente novamente.');
    } else {
        // Ao carregar um código, os estilos do ctx são resetados para o padrão da lib. 
        // Precisamos re-aplicar as ferramentas escolhidas na interface.
        demo.ctx.strokeStyle = demo.lineColor;
        demo.ctx.lineWidth = demo.lineWidth;
        demo.ctx.lineCap = 'round';
        demo.ctx.lineJoin = 'round';
    }
});

document.getElementById('btnLimpar').addEventListener('click', () => {
    demo.limparTela();
    document.getElementById('boxGerado').value = '';
    document.getElementById('boxEntrada').value = '';
});
