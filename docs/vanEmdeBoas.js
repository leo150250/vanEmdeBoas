const div_arvore=document.getElementById("arvore");

//Função para pegar o offset de um elemento:
const getOffset = (el) => {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        width: rect.width || el.offsetWidth,
        height: rect.height || el.offsetHeight
    };
}

//A classe do nó da árvore de van Emde Boas:
class Van_Emde_Boas {
    universo=-1;
    min=-1;
    max=-1;
    sumario=null;
    clusters=[];

    div_no=null;
    div_u=null;
    div_min=null;
    div_max=null;
    div_sumario=null;
    div_clusters=null;
    
    linhaDraw_sumario=null;
    linhaDraw_clusters=[];

    //Construtor. Requer que seja repassado o tamanho do universo dessa árvore
    constructor(argTamanho) {
        this.universo = argTamanho;
        this.min = -1;
        this.max = -1;
        this.div_no=document.createElement("div");
        this.div_no.className="no";
        this.div_no.style.top="0px";
        this.div_no.style.left="0px";
        this.div_u=document.createElement("div");
        this.div_u.className="u";
        this.div_min=document.createElement("div");
        this.div_min.className="min";
        this.div_max=document.createElement("div");
        this.div_max.className="max";
        this.div_sumario=document.createElement("div");
        this.div_sumario.className="sumario";
        this.div_clusters=document.createElement("div");
        this.div_clusters.className="clusters";
        this.div_no.appendChild(this.div_u);
        this.div_no.appendChild(this.div_min);
        this.div_no.appendChild(this.div_max);
        this.div_no.appendChild(document.createElement("hr"));
        this.div_no.appendChild(this.div_sumario);
        this.div_no.appendChild(this.div_clusters);
        if (this.universo <= 2) {
            this.sumario = null;
            this.clusters[0] = null;
        } else {
            let numClusters = Math.ceil(Math.sqrt(this.universo));
            this.sumario = new Van_Emde_Boas(numClusters);
            this.sumario.div_no.style.left=this.div_no.style.left;
            this.sumario.div_no.style.top=(this.div_no.offsetTop + this.div_no.offsetHeight) + "px";
            this.linhaDraw_sumario=document.createElement("div");
            this.linhaDraw_sumario.className="linha";
            for (let i = 0; i < numClusters; i++) {
                this.clusters[i] = new Van_Emde_Boas(numClusters);
            }
        }
        this.div_u.innerHTML=this.universo;
        this.div_min.innerHTML=this.min;
        this.div_max.innerHTML=this.max;
    }

    //Desenha este nó:
    desenhar() {
        div_arvore.appendChild(this.div_no);
        if (this.universo > 2) {
            this.sumario.desenhar();
            this.desenharLinhaSumario();
            for (let i = 0; i < this.clusters.length; i++) {
                if (this.clusters[i]!=null) {
                    this.clusters[i].desenhar();
                }
            }
        }
    }

    //Desenha a linha do sumário:
    desenharLinhaSumario() {
        div_arvore.appendChild(this.linhaDraw_sumario);
        let off1 = getOffset(this.div_sumario);
        let off2 = getOffset(this.sumario.div_no);
        let x1 = off1.left + (off1.width/2);
        let y1 = off1.top - (off1.height/2);
        let x2 = off2.left + (off2.width/2);
        let y2 = off2.top - (off2.height/2);
        let thickness = 2;
        let length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
        let cx = ((x1 + x2) / 2) - (length / 2);
        let cy = ((y1 + y2) / 2) - (thickness / 2);
        let angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
        this.linhaDraw_sumario.style.left=cx + "px";
        this.linhaDraw_sumario.style.top=cy + "px";
        this.linhaDraw_sumario.style.width=length + "px"
        this.linhaDraw_sumario.style.transform="rotate("+ angle + "deg)";
    }

    obterPai(argChave) {
        let div = Math.ceil(Math.sqrt(this.universo));
        //console.log("(obterPai: "+div+")");
        return parseInt(argChave / div);
    }

    obterFilho(argChave) {
        let mod = Math.ceil(Math.sqrt(this.universo));
        //console.log("(obterFilho: "+mod+")");
        return argChave % mod;
    }

    gerarChave(argPai, argFilho) {
        return argPai * Math.ceil(Math.sqrt(this.universo)) + argFilho;
    }

    definirMin(argChave) {
        this.min = argChave;
        this.div_min.innerHTML=this.min;
    }

    definirMax(argChave) {
        this.max = argChave;
        this.div_max.innerHTML=this.max;
    }

    inserir(argChave) {
        //Se nenhuma chave estiver presente na árvore, então define-se que o mínimo e o máximo são do mesmo valor de sua chave.
        if (this.min==-1) {
            this.definirMin(argChave);
            this.definirMax(argChave);
        } else {
            //Se a chave a ser inserida for menor que o mínimo, troca os valores das duas variáveis, para que o "mínimo" vá mais fundo na árvore, para a posição verdadeira dele.
            //Conceito similar ao "Lazy Propagation"
            if (argChave < this.min) {
                let aux = this.min;
                this.definirMin(argChave);
                argChave = aux;
            }
            if (this.universo > 2) {
                //Se nenhuma chave está presente nos clusters então insere a chave tanto no cluster quanto no sumário.
                //if (this.clusters[this.obterPai(argChave)]!=null) {
                    if (this.clusters[this.obterPai(argChave)].min == -1) {
                        this.sumario.inserir(this.obterPai(argChave));
                        this.clusters[this.obterPai(argChave)].definirMin(this.obterFilho(argChave));
                        this.clusters[this.obterPai(argChave)].definirMax(this.obterFilho(argChave));
                    } else {
                        //Se houver outros elementos na árvore então deve ir mais fundo recursivamente na estrutura para definir os atributos de acordo.
                        this.clusters[this.obterPai(argChave)].inserir(this.obterFilho(argChave));
                    }
                //}
            }
            //Define a chave a ser inserida como máxima caso seja maior que a máxima atual.
            if (argChave > this.max) {
                this.definirMax(argChave);
            }
        }
    }

    //Verifica se um elemento existe ou não na árvore:
    verificar(argChave) {
        if (this.universo < argChave) {
            return false;
        }
        if (this.min == argChave || this.max == argChave) {
            return true;
        } else {
            if (this.universo==2) {
                return false;
            } else {
                if (this.clusters[this.obterPai(argChave)]!=null) {
                    return this.clusters[this.obterPai(argChave)].verificar(this.obterFilho(argChave));
                } else {
                    return false;
                }
            }
        }
    }

    //Imprime toda a árvore:
    imprimir(argPrefixo=0) {
        let textoSaida="";
        if (argPrefixo==0) {
            textoSaida+="==================\nRaiz:\n";
        }
        for (let i = 0; i < argPrefixo; i++) {
            textoSaida+="|";
        }
        textoSaida+="u: "+this.universo+" | min: "+this.min+" | max: "+this.max+"\n";
        if (this.universo > 2) {
            if (this.sumario!=null) {
                for (let i = 0; i < argPrefixo; i++) {
                    textoSaida+="|";
                }
                textoSaida+="Sumario:\n";
                textoSaida+=this.sumario.imprimir(argPrefixo+1);
                for (let i = 0; i < argPrefixo; i++) {
                    textoSaida+="|";
                }
                textoSaida+="Clusters:\n";
                for (let i = 0; i < Math.ceil(Math.sqrt(this.universo)); i++) {
                    textoSaida+=this.clusters[i].imprimir(argPrefixo+1);
                }
            }
        }
        if (argPrefixo==0) {
            console.log(textoSaida);
        } else {
            return textoSaida;
        }
    }

    //Imprime se determinado número está na árvore:
    imprimirVerificacao(argChave) {
        if (this.verificar(argChave)) {
            console.log("O número "+argChave+" está na árvore");
        } else {
            console.log("O número "+argChave+" não está na árvore");
        }
    }

    //Imprime o mínimo da árvore:
    imprimirMinimo() {
        console.log("O mínimo da árvore é "+this.min);
    }

    //Imprime o máximo da árvore:
    imprimirMaximo() {
        console.log("O máximo da árvore é "+this.max);
    }

    //Imprime a árvore como vetor sequencial:
    imprimirVetor() {
        let textoSaida="";
        for (let i = 0; i < this.universo; i++) {
            if (this.verificar(i)) {
                textoSaida+=i;
            } else {
                textoSaida+="-";
            }
            if (i<this.universo-1) {
                textoSaida+=" | ";
            }
        }
        console.log(textoSaida);
    }
};

//Criando árvore vEB com universo tamanho 8:
vEB = new Van_Emde_Boas(4);

//Inserindo valores na árvore:
vEB.inserir(0);
vEB.inserir(1);
vEB.inserir(3);
//vEB.inserir(5);

//Verifica se os números 3 e 4 estão na árvore e imprime:
//vEB.imprimirVerificacao(3);
//vEB.imprimirVerificacao(4);

//Imprime o mínimo e máximo da árvore:
vEB.imprimirMinimo();
vEB.imprimirMaximo();

//Imprime a árvore:
vEB.imprimir();

vEB.imprimirVetor();

vEB.desenhar();