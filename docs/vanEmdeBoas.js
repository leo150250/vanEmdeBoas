const div_arvore=document.getElementById("arvore");
const div_vetor=document.getElementById("vetor");
const div_log=document.getElementById("log");
//Config:
const input_configUniverso=document.getElementById("configUniverso");
const input_configInserir=document.getElementById("configInserir");
const input_configDeletar=document.getElementById("configDeletar");
const input_configBuscar=document.getElementById("configBuscar");

var mover_no=null
var movendo=false;
var mover_offsetX=0;
var mover_offsetY=0;
var vEB=null;

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
    noPai=null;

    div_no=null;
    div_u=null;
    div_min=null;
    div_max=null;
    div_sumario=null;
    div_grupoClusters=null;
    div_clusters=[];
    
    linhaDraw_sumario=null;
    linhaDraw_clusters=[];
    
    subnivel=0;

    //Construtor. Requer que seja repassado o tamanho do universo dessa árvore
    constructor(argTamanho,argSubnivel=0) {
        this.universo = argTamanho;
        this.min = -1;
        this.max = -1;
        this.subnivel=argSubnivel;
        this.div_no=document.createElement("div");
        this.div_no.className="no";
        this.div_no.style.top="0px";
        this.div_no.style.left="0px";
        this.div_no.addEventListener("mousedown", (event) => {
            mover_no=this;
            mover_offsetX=this.div_no.offsetLeft-event.clientX+div_arvore.scrollLeft+(this.div_no.offsetWidth/2);
            mover_offsetY=this.div_no.offsetTop-event.clientY+div_arvore.scrollTop+div_arvore.offsetTop+(this.div_no.offsetHeight/2);
            movendo=true;
        });
        this.div_u=document.createElement("div");
        this.div_u.className="u";
        this.div_min=document.createElement("div");
        this.div_min.className="min";
        this.div_max=document.createElement("div");
        this.div_max.className="max";
        this.div_sumario=document.createElement("div");
        this.div_sumario.className="sumario";
        this.div_grupoClusters=document.createElement("div");
        this.div_grupoClusters.className="clusters";
        this.div_no.appendChild(this.div_u);
        this.div_no.appendChild(this.div_min);
        this.div_no.appendChild(this.div_max);
        this.div_no.appendChild(document.createElement("hr"));
        this.div_no.appendChild(this.div_sumario);
        this.div_no.appendChild(this.div_grupoClusters);
        registrarLog("Nó criado. U: "+this.universo,this.subnivel,false,this.div_no);
        if (this.universo <= 2) {
            this.sumario = null;
            this.clusters[0] = null;
        } else {
            let numClusters = Math.ceil(Math.sqrt(this.universo));
            registrarLog("Sumário:",this.subnivel);
            this.sumario = new Van_Emde_Boas(numClusters,this.subnivel+1);
            this.sumario.noPai = this;
            this.sumario.div_no.classList.add("sumario");
            this.linhaDraw_sumario=document.createElement("div");
            this.linhaDraw_sumario.className="linha";
            registrarLog("Clusters:",this.subnivel);
            for (let i = 0; i < numClusters; i++) {
                this.clusters[i] = new Van_Emde_Boas(numClusters,this.subnivel+1);
                this.clusters[i].noPai = this;
                this.clusters[i].div_no.classList.add("cluster");
                this.div_clusters[i] = document.createElement("div");
                this.div_clusters[i].className="cluster";
                this.div_clusters[i].innerHTML=i;
                this.div_grupoClusters.appendChild(this.div_clusters[i]);
                this.linhaDraw_clusters[i]=document.createElement("div");
                this.linhaDraw_clusters[i].className="linha";
            }
        }
        this.div_u.innerHTML=this.universo;
        this.div_min.innerHTML=this.min;
        this.div_max.innerHTML=this.max;
    }

    //Desenha este nó:
    desenhar(argRepetir=false) {
        div_arvore.appendChild(this.div_no);
        this.organizarNos();
        if (this.sumario!=null) {
            this.sumario.desenhar();
        }
        for (let i = 0; i < this.clusters.length; i++) {
            if (this.clusters[i]!=null) {
                this.clusters[i].desenhar();
            }
        }
        if (this.sumario!=null) {
            this.desenharLinhaSumario();
        }
        for (let i=0; i<this.clusters.length; i++) {
            if (this.clusters[i]!=null) {
                this.desenharLinhaCluster(i);
            }
        }
        this.organizarNos();
        if (argRepetir) {
            ajustarDesenho();
            this.desenhar();
        }
    }

    //Organiza o desenho dos nós na tela automaticamente:
    organizarNos() {
        let deslocamentoX=0;
        let deslocamentoY=0;
        if (this.sumario!=null) {
            //Deslocamento do sumário:
            deslocamentoX=(this.div_no.offsetLeft - (this.div_no.offsetWidth))-10;
            deslocamentoY=(this.div_no.offsetTop)+10;
            this.sumario.div_no.style.left=deslocamentoX + "px";
            this.sumario.div_no.style.top=deslocamentoY + "px";
            if (this.sumario.div_no.offsetLeft<0) {
                deslocarDesenhoX(-this.sumario.div_no.offsetLeft);
            }
            if (this.sumario.div_no.offsetTop<0) {
                deslocarDesenhoY(-this.sumario.div_no.offsetTop);
            }
        }
        //Deslocamento de cada cluster:
        for (let i = 0; i < this.clusters.length; i++) {
            if (this.clusters[i]!=null) {
                deslocamentoX=50+this.div_no.offsetLeft + (i*(this.div_no.offsetWidth+10));
                deslocamentoY=(this.div_no.offsetTop + (this.div_no.offsetHeight))+30;
                this.clusters[i].div_no.style.left=deslocamentoX + "px";
                this.clusters[i].div_no.style.top=deslocamentoY + "px";
                if (this.clusters[i].div_no.offsetLeft<0) {
                    deslocarDesenhoX(-this.clusters[i].div_no.offsetLeft);
                }
                if (this.clusters[i].div_no.offsetTop<0) {
                    deslocarDesenhoY(-this.clusters[i].div_no.offsetTop);
                }
            }
        }
    }

    //Desenha a linha do sumário:
    desenharLinhaSumario() {
        if (this.linhaDraw_sumario.parentNode==null) {
            div_arvore.appendChild(this.linhaDraw_sumario);
        }
        let off1 = getOffset(this.div_sumario);
        let off2 = getOffset(this.sumario.div_no);
        let x1 = off1.left + (off1.width/2) + div_arvore.scrollLeft;
        let y1 = off1.top + (off1.height+5) + div_arvore.scrollTop - div_arvore.offsetTop;
        let x2 = off2.left + (off2.width/2) + div_arvore.scrollLeft;
        let y2 = off2.top - (off2.height/2) + div_arvore.scrollTop;
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

    //Desenha a linha de um cluster específico:
    desenharLinhaCluster(argCluster=-1) {
        let forInicio=-1;
        let forFim=-1;
        if (argCluster==-1) {
            forInicio=0;
            forFim=this.clusters.length;
        } else {
            forInicio=argCluster;
            forFim=argCluster+1;
        }
        for (let i=forInicio; i<forFim; i++) {
            if (this.linhaDraw_clusters[i]!=null) {
                if (this.linhaDraw_clusters[i].parentNode==null) {
                    div_arvore.appendChild(this.linhaDraw_clusters[i]);
                }
                let off1 = getOffset(this.div_clusters[i]);
                let off2 = getOffset(this.clusters[i].div_no);
                let x1 = off1.left + (off1.width/2) + div_arvore.scrollLeft;
                let y1 = off1.top + (off1.height+5) + div_arvore.scrollTop - div_arvore.offsetTop;
                let x2 = off2.left + (off2.width/2) + div_arvore.scrollLeft;
                let y2 = off2.top - (off2.height/2) + div_arvore.scrollTop;
                let thickness = 2;
                let length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
                let cx = ((x1 + x2) / 2) - (length / 2);
                let cy = ((y1 + y2) / 2) - (thickness / 2);
                let angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
                this.linhaDraw_clusters[i].style.left=cx + "px";
                this.linhaDraw_clusters[i].style.top=cy + "px";
                this.linhaDraw_clusters[i].style.width=length + "px"
                this.linhaDraw_clusters[i].style.transform="rotate("+ angle + "deg)";
            }
        }
    }

    obterPai(argChave) {
        let div = Math.ceil(Math.sqrt(this.universo));
        //console.log("(obterPai: "+div+")");
        //registrarLog("(obterPai: "+div+")",this.subnivel);
        return parseInt(argChave / div);
    }

    obterFilho(argChave) {
        let mod = Math.ceil(Math.sqrt(this.universo));
        //console.log("(obterFilho: "+mod+")");
        //registrarLog("(obterFilho: "+mod+")",this.subnivel);
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

    //Verifica se um elemento existe ou não na árvore:
    verificar(argChave,argComando=false,argCancelarRegistro=true) {
        if (argComando) {
            registrarLog("(Verificar chave: "+argChave+")",this.subnivel,true);
            argCancelarRegistro=false;
        }
        if (this.universo <= argChave) {
            if (!argCancelarRegistro) registrarLog("A chave "+argChave+" é maior que o universo deste nó: "+this.universo+" elementos.",this.subnivel,false,this.div_no);
            return false;
        }
        if (this.min == argChave || this.max == argChave) {
            if (!argCancelarRegistro) registrarLog("A chave "+argChave+" é um dos limites deste nó: "+this.min+" e "+this.max+", portanto, existe nesta árvore.",this.subnivel,false,this.div_no);
            return true;
        } else {
            if (this.universo==2) {
                if (!argCancelarRegistro) registrarLog("A chave "+argChave+" não existe nesta árvore.",this.subnivel,false,this.div_no);
                return false;
            } else {
                if (this.clusters[this.obterPai(argChave)]!=null) {
                    if (!argCancelarRegistro) registrarLog("O cluster pai("+argChave+")="+this.obterPai(argChave)+" existe. Continua recursão para o cluster pai("+argChave+")="+this.obterPai(argChave)+" buscando a chave filho("+argChave+")="+this.obterFilho(argChave),this.subnivel,false,this.div_no);
                    return this.clusters[this.obterPai(argChave)].verificar(this.obterFilho(argChave),false,argCancelarRegistro);
                } else {
                    return false;
                }
            }
        }
    }

    //Inserir um novo elemento na árvore:
    inserir(argChave,argComando=false) {
        if (argComando) {
            registrarLog("(Inserir chave: "+argChave+")",this.subnivel,true);
        }
        if (argChave<this.universo) {
            //Se nenhuma chave estiver presente na árvore, então define-se que o mínimo e o máximo são do mesmo valor de sua chave.
            if (this.min==-1) {
                registrarLog("Nenhuma chave presente nesta árvore. Define min e max para a chave: "+argChave,this.subnivel,false,this.div_no);
                this.definirMin(argChave);
                this.definirMax(argChave);
            } else {
                //Se a chave a ser inserida for menor que o mínimo, troca os valores das duas variáveis, para que o "mínimo" vá mais fundo na árvore, para a posição verdadeira dele.
                //Conceito similar ao "Lazy Propagation"
                if (argChave < this.min) {
                    registrarLog("Chave a ser inserida ("+argChave+") é menor que min ("+this.min+"). Inverte os dois.",this.subnivel,false,this.div_no);
                    let aux = this.min;
                    this.definirMin(argChave);
                    argChave = aux;
                }
                if (this.universo > 2) {
                    //Se nenhuma chave está presente nos clusters então insere a chave tanto no cluster quanto no sumário.
                    if (this.clusters[this.obterPai(argChave)].min == -1) {
                        registrarLog("Nenhuma chave presente no cluster pai("+argChave+")="+this.obterPai(argChave)+". Insere a chave pai("+argChave+")="+this.obterPai(argChave)+" no sumário.",this.subnivel,false,this.div_no);
                        this.sumario.inserir(this.obterPai(argChave));
                        registrarLog("Atualiza min e max do cluster pai("+argChave+")="+this.obterPai(argChave)+" para filho("+argChave+")="+this.obterFilho(argChave),this.subnivel,false,this.clusters[this.obterPai(argChave)].div_no);
                        this.clusters[this.obterPai(argChave)].definirMin(this.obterFilho(argChave));
                        this.clusters[this.obterPai(argChave)].definirMax(this.obterFilho(argChave));
                    } else {
                        //Se houver outros elementos na árvore então deve ir mais fundo recursivamente na estrutura para definir os atributos de acordo.
                        registrarLog("Chave a ser inserida ("+argChave+") é maior que min ("+this.min+"). Continua recursão para o cluster pai("+argChave+")="+this.obterPai(argChave)+" inserindo a chave filho("+argChave+")="+this.obterFilho(argChave),this.subnivel,false,this.div_no);
                        this.clusters[this.obterPai(argChave)].inserir(this.obterFilho(argChave));
                    }
                }
                //Define a chave a ser inserida como máxima caso seja maior que a máxima atual.
                if (argChave > this.max) {
                    registrarLog("Atualiza max para o valor da chave: "+argChave,this.subnivel,false,this.div_no);
                    this.definirMax(argChave);
                }
            }
            if (argComando) {

            }
            atualizarVetor();
        }
    }

    //Deletar um elemento da árvore:
    deletar(argChave,argComando) {
        if (argComando) {
            registrarLog("(Deletar chave: "+argChave+")",this.subnivel,true);
        }
        if (this.max == this.min) {
            registrarLog("Uma única chave está presente (min==max = "+this.min+"). Provavelmente é a chave que é para deletar: "+argChave,this.subnivel,false,this.div_no);
            this.definirMin(-1);
            this.definirMax(-1);
        } else if (this.universo == 2) {
            registrarLog("min e max estão diferentes. Tornando-os iguais ao valor inverso da chave: "+argChave+" -> "+((argChave==0)?1:0),this.subnivel,false,this.div_no);
            if (argChave == 0) {
                this.definirMin(1);
            } else {
                this.definirMin(0);
            }
            this.definirMax(this.min);
        } else {
            registrarLog("Universo > 2 e min/max diferentes da chave ("+argChave+")",this.subnivel,false,this.div_no);
            if (argChave == this.min) {
                registrarLog("Chave a ser deletada ("+argChave+") é o mínimo. Atualiza a chave para o min do primeiro cluster deste nó, que é o mínimo do sumário ("+this.sumario.min+")",this.subnivel,false,this.div_no);
                let primeiroCluster = this.sumario.min;
                argChave=this.gerarChave(primeiroCluster, this.clusters[primeiroCluster].min);
                this.definirMin(argChave);
            }
            registrarLog("Continua recursão para deletar a chave filho("+argChave+")="+this.obterFilho(argChave)+" no cluster pai("+argChave+")="+this.obterPai(argChave),this.subnivel,false,this.div_no);
            this.clusters[this.obterPai(argChave)].deletar(this.obterFilho(argChave));
            if (this.clusters[this.obterPai(argChave)].min == -1) {
                registrarLog("Nenhuma chave presente no cluster pai("+argChave+")="+this.obterPai(argChave)+". Remove a chave pai("+argChave+")="+this.obterPai(argChave)+" do sumário.",this.subnivel,false,this.div_no);
                this.sumario.deletar(this.obterPai(argChave));
                if (argChave==this.max) {
                    let maximoSumario=this.sumario.max;
                    if (maximoSumario==-1) {
                        registrarLog("Chave deletada ("+argChave+") é o max deste nó ("+this.max+"). Atualiza o max deste nó para o mesmo valor de min ("+this.min+") pois o max do sumário é -1.",this.subnivel,false,this.div_no);
                        this.definirMax(this.min);
                    } else {
                        registrarLog("Chave deletada ("+argChave+") é o max deste nó ("+this.max+"). Atualiza o max deste nó para o valor do max do sumário ("+maximoSumario+") * teto da raiz quadrada do universo ("+this.universo+") + o max do cluster que está no indice do max do sumário = "+this.gerarChave(maximoSumario, this.clusters[maximoSumario].max),this.subnivel,false,this.div_no);
                        this.definirMax(this.gerarChave(maximoSumario, this.clusters[maximoSumario].max));
                    }
                }
            } else if (argChave==this.max) {
                registrarLog("Chave a ser deletada ("+argChave+") é o max. Atualiza o max para o valor de pai("+argChave+")="+this.obterPai(argChave)+" * teto da raiz quadrada do universo ("+this.universo+") + o max do cluster pai("+argChave+")="+this.obterPai(argChave)+" = "+this.gerarChave(this.obterPai(argChave), this.clusters[this.obterPai(argChave)].max),this.subnivel,false,this.div_no);
                this.definirMax(this.gerarChave(this.obterPai(argChave), this.clusters[this.obterPai(argChave)].max));
            }
        }
        atualizarVetor();
    }

    //Busca o sucessor de uma chave específica:
    sucessor(argChave,argComando) {
        if (argComando) {
            registrarLog("(Sucessor da chave: "+argChave+")",this.subnivel,true);
        }
        if (this.universo==2) {
            if ((argChave==0) && (this.max==1)) {
                registrarLog("Universo = 2. Chave a ser buscada ("+argChave+") é 0 e max é 1. Retorna 1 pois é a chave do sucessor.",this.subnivel,false,this.div_no);
                return 1;
            } else {
                registrarLog("Universo = 2. Chave a ser buscada ("+argChave+") não é 0 e/ou max não é 1. Retorna -1 pois não há sucessor.",this.subnivel,false,this.div_no);
                return -1;
            }
        } else if ((this.min!=-1) && (argChave<this.min)) {
            registrarLog("Chave a ser buscada ("+argChave+") é menor que o min ("+this.min+"), por isso retorna min como chave.",this.subnivel,false,this.div_no);
            return this.min;
        } else {
            registrarLog("Universo > 2 e chave a ser buscada ("+argChave+") é maior ou igual ao min ("+this.min+"). Continua recursão para buscar o sucessor da chave, procurando o max do cluster pai("+argChave+")="+this.obterPai(argChave),this.subnivel,false,this.div_no);
            let clusterMaximo = this.clusters[this.obterPai(argChave)].max;
            let offsetCluster=0;
            let sucessorCluster=0;
            if ((clusterMaximo!=-1) && (this.obterFilho(argChave) < clusterMaximo)) {
                registrarLog("Cluster pai("+argChave+")="+this.obterPai(argChave)+" tem um max ("+clusterMaximo+") e a chave filho("+argChave+")="+this.obterFilho(argChave)+" é menor que o max. Define um offset com o valor do sucessor de filho("+argChave+")="+this.obterFilho(argChave)+" do cluster pai("+argChave+")="+this.obterPai(argChave)+" deste nó.",this.subnivel,false,this.div_no);
                offsetCluster=this.clusters[this.obterPai(argChave)].sucessor(this.obterFilho(argChave));
                registrarLog("Retorna o valor de pai("+argChave+")="+this.obterPai(argChave)+" * teto da raiz quadrada do universo ("+this.universo+") + o offset obtido ("+offsetCluster+") = "+this.gerarChave(this.obterPai(argChave), offsetCluster),this.subnivel,false,this.div_no);
                return this.gerarChave(this.obterPai(argChave), offsetCluster);
            } else {
                registrarLog("Cluster pai("+argChave+")="+this.obterPai(argChave)+" não tem um max ou a chave filho("+argChave+")="+this.obterFilho(argChave)+" é maior ou igual ao max. Continua recursão para buscar o cluster sucessor com base em pai("+argChave+")="+this.obterPai(argChave)+" do sumário.",this.subnivel,false,this.div_no);
                sucessorCluster=this.sumario.sucessor(this.obterPai(argChave));
                if (sucessorCluster==-1) {
                    registrarLog("Sumário não retornou um sucessor. Retorna -1.",this.subnivel,false,this.div_no);
                    return -1;
                } else {
                    offsetCluster=this.clusters[sucessorCluster].min;
                    registrarLog("Sumário retornou um sucessor ("+sucessorCluster+"). Define um offset para o min deste cluster ("+this.clusters[sucessorCluster].min+") neste nó e retorna o índice deste sucessor * teto da raiz quadrada do universo ("+this.universo+") + o offset obtido ("+offsetCluster+") = "+this.gerarChave(sucessorCluster, offsetCluster),this.subnivel,false,this.div_no);
                    return this.gerarChave(sucessorCluster, offsetCluster);
                }
            }
        }
    }

    //Busca o antecessor de uma chave específica:
    antecessor(argChave,argComando) {
        if (argComando) {
            registrarLog("(Antecessor da chave: "+argChave+")",this.subnivel,true);
        }
        if (this.universo==2) {
            if ((argChave==1) && (this.min==0)) {
                registrarLog("Universo = 2. Chave a ser buscada ("+argChave+") é 1 e min é 0. Retorna 0 pois é a chave do antecessor.",this.subnivel,false,this.div_no);
                return 0;
            } else {
                registrarLog("Universo = 2. Chave a ser buscada ("+argChave+") não é 1 e/ou min não é 0. Retorna -1 pois não há sucessor.",this.subnivel,false,this.div_no);
                return -1;
            }
        } else if ((this.max!=-1) && (argChave>this.max)) {
            registrarLog("Chave a ser buscada ("+argChave+") é maior que o max ("+this.max+"), por isso retorna max como chave.",this.subnivel,false,this.div_no);
            return this.max;
        } else {
            registrarLog("Universo > 2 e chave a ser buscada ("+argChave+") é menor ou igual ao max ("+this.max+"). Continua recursão para buscar o antecessor da chave, procurando o min do cluster pai("+argChave+")="+this.obterPai(argChave),this.subnivel,false,this.div_no);
            let clusterMinimo = this.clusters[this.obterPai(argChave)].min;
            let offsetCluster=0;
            let antecessorCluster=0;
            if ((clusterMinimo!=-1) && (this.obterFilho(argChave) > clusterMinimo)) {
                registrarLog("Cluster pai("+argChave+")="+this.obterPai(argChave)+" tem um min ("+clusterMinimo+") e a chave filho("+argChave+")="+this.obterFilho(argChave)+" é maior que o min. Define um offset com o valor do antecessor de filho("+argChave+")="+this.obterFilho(argChave)+" do cluster pai("+argChave+")="+this.obterPai(argChave)+" deste nó.",this.subnivel,false,this.div_no);
                offsetCluster=this.clusters[this.obterPai(argChave)].antecessor(this.obterFilho(argChave));
                registrarLog("Retorna o valor de pai("+argChave+")="+this.obterPai(argChave)+" * teto da raiz quadrada do universo ("+this.universo+") + o offset obtido ("+offsetCluster+") = "+this.gerarChave(this.obterPai(argChave), offsetCluster),this.subnivel,false,this.div_no);
                return this.gerarChave(this.obterPai(argChave), offsetCluster);
            } else {
                registrarLog("Cluster pai("+argChave+")="+this.obterPai(argChave)+" não tem um min ou a chave filho("+argChave+")="+this.obterFilho(argChave)+" é menor ou igual ao min. Continua recursão para buscar o cluster antecessor com base em pai("+argChave+")="+this.obterPai(argChave)+" do sumário.",this.subnivel,false,this.div_no);
                antecessorCluster=this.sumario.antecessor(this.obterPai(argChave));
                if (antecessorCluster==-1) {
                    if ((this.min!=-1) && (argChave>this.min)) {
                        registrarLog("Sumário retornou um antecessor e a chave ("+argChave+") é maior que min. Retorna min ("+this.min+").",this.subnivel,false,this.div_no);
                        return this.min;
                    } else {
                        registrarLog("Sumário não retornou um antecessor. Retorna -1.",this.subnivel,false,this.div_no);
                        return -1;
                    }
                } else {
                    offsetCluster=this.clusters[antecessorCluster].max;
                    registrarLog("Sumário retornou um antecessor ("+antecessorCluster+"). Define um offset para o max deste cluster ("+this.clusters[antecessorCluster].max+") neste nó e retorna o índice deste antecessor * teto da raiz quadrada do universo ("+this.universo+") + o offset obtido ("+offsetCluster+") = "+this.gerarChave(antecessorCluster, offsetCluster),this.subnivel,false,this.div_no);
                    return this.gerarChave(antecessorCluster, offsetCluster);
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
        let vetor=[];
        for (let i = 0; i < this.universo; i++) {
            if (this.verificar(i)) {
                textoSaida+=i;
                vetor[i]=true;
            } else {
                textoSaida+="-";
                vetor[i]=false;
            }
            if (i<this.universo-1) {
                textoSaida+=" | ";
            }
        }
        console.log(textoSaida);
        return vetor;
    }
};

function deslocarDesenhoX(argPixels) {
    let nos=document.getElementsByClassName("no");
    let linhas=document.getElementsByClassName("linha");
    for (let i = 0; i < nos.length; i++) {
        nos[i].style.left=parseInt(nos[i].style.left)+argPixels+"px";
    }
    for (let i = 0; i < linhas.length; i++) {
        linhas[i].style.left=parseInt(linhas[i].style.left)+argPixels+"px";
    }
}
function deslocarDesenhoY(argPixels) {
    let nos=document.getElementsByClassName("no");
    for (let i = 0; i < nos.length; i++) {
        nos[i].style.top=parseInt(nos[i].style.top)+argPixels+"px";
    }
}
function ajustarDesenho() {
    let alinhamentoMaxX=0;
    let nos=document.getElementsByClassName("no");
    for (let i = 0; i < nos.length; i++) {
        if (parseInt(nos[i].style.left)>alinhamentoMaxX) {
            alinhamentoMaxX=parseInt(nos[i].style.left);
        }
    }
    let alinhamentoMinX=alinhamentoMaxX;
    for (let i = 0; i < nos.length; i++) {
        if (parseInt(nos[i].style.left)<alinhamentoMinX) {
            alinhamentoMinX=parseInt(nos[i].style.left);
        }
    }
    deslocarDesenhoX(-alinhamentoMinX);
}

document.addEventListener("mouseup", function(event) {
    if (movendo) {
        movendo=false;
        mover_no=null;
        mover_offsetX=0;
        mover_offsetY=0;
    }
});
document.addEventListener("mousemove", function(event) {
    if (movendo) {
        mover_no.div_no.style.left=event.clientX+mover_offsetX-(mover_no.div_no.offsetWidth/2)-div_arvore.scrollLeft+"px";
        mover_no.div_no.style.top=(event.clientY+mover_offsetY-(mover_no.div_no.offsetHeight/2)-div_arvore.offsetTop-div_arvore.scrollTop)+"px";
        if (mover_no.sumario!=null) {
            mover_no.desenharLinhaSumario();
        }
        for (let i = 0; i < mover_no.clusters.length; i++) {
            if (mover_no.clusters[i]!=null) {
                mover_no.desenharLinhaCluster(i);
            }
        }
        if (mover_no.noPai!=null) {
            mover_no.noPai.desenharLinhaSumario();
            mover_no.noPai.desenharLinhaCluster();
        }
    }
});

function gerarArvore() {
    div_arvore.innerHTML="";
    div_log.innerHTML="";
    registrarLog("(Gerando árvore com universo: "+parseInt(input_configUniverso.value)+")",0,true);
    vEB = new Van_Emde_Boas(parseInt(input_configUniverso.value));
    vEB.desenhar(true);
    ajustarDesenho();
    criarVetor();
}
function criarVetor() {
    div_vetor.innerHTML="";
    for (let i = 0; i < vEB.universo; i++) {
        novoDivVetor=document.createElement("div");
        novoDivVetor.classList.add("indiceVetor");
        novoDivVetor.innerHTML=i;
        div_vetor.appendChild(novoDivVetor);
    }
}
function atualizarVetor() {
    let vetorvEB=vEB.imprimirVetor();
    let divsIndices=document.getElementsByClassName("indiceVetor");
    for (let i = 0; i < divsIndices.length; i++) {
        if (vetorvEB[i]) {
            divsIndices[i].classList.add("ok");
        } else {
            divsIndices[i].classList.remove("ok");
        }
    }
}
function inserirNumero() {
    vEB.inserir(parseInt(input_configInserir.value),true);
}
function deletarNumero() {
    numero=parseInt(input_configDeletar.value);
    if (vEB.verificar(numero)) {
        vEB.deletar(numero,true);
    } else {
        registrarLog("(O número "+numero+" não existe na árvore.)",0,true);
    }
}
function buscarNumero() {
    vEB.verificar(parseInt(input_configBuscar.value),true);
}
function sucessorNumero() {
    vEB.sucessor(parseInt(input_configBuscar.value),true);
}
function antecessorNumero() {
    vEB.antecessor(parseInt(input_configBuscar.value),true);
}
function registrarLog(argTexto,argSubnivel=0,argDestaque=false,argElemento=null) {
    let novoDivLog=document.createElement("div");
    novoDivLog.classList.add("log");
    if (argDestaque) {
        novoDivLog.classList.add("destaque");
    }
    if (argElemento!=null) {
        novoDivLog.addEventListener("mouseenter", function(event) {
            argElemento.classList.add("destaque");
            argElemento.scrollIntoView({behavior: "smooth", block: "center"});
        });
        novoDivLog.addEventListener("mouseleave", function(event) {
            argElemento.classList.remove("destaque");
        });
    }
    for (let i = 0; i < argSubnivel; i++) {
        let novoDivSubnivel=document.createElement("div");
        novoDivSubnivel.classList.add("subnivel");
        novoDivLog.appendChild(novoDivSubnivel);
    }
    let novoPLog=document.createElement("p");
    novoPLog.innerHTML=argTexto;
    novoDivLog.appendChild(novoPLog);
    div_log.appendChild(novoDivLog);
    novoDivLog.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
}

//Criando árvore vEB inicial:
gerarArvore();
//Inserindo valores na árvore:
vEB.inserir(2,true);
vEB.inserir(3,true);
vEB.inserir(5,true);
vEB.inserir(7,true);

vEB.desenhar(true);

buscarNumero();