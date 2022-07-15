#include <stdio.h>
#include <math.h>
using namespace std;

//Material: https://www.geeksforgeeks.org/proto-van-emde-boas-trees-set-1-background-introduction/

//Construir:
//https://www.geeksforgeeks.org/van-emde-boas-tree-set-1-basics-and-construction/
//https://www.geeksforgeeks.org/van-emde-boas-tree-set-2-insertion-find-minimum-and-maximum-queries/

//Uso: As an example, of you have a linear layout of stores on some line and want to find the closest store to some particular customer, using a vEB-tree could make the search exponentially faster than the (already fast) BST.

//Classe de nó de uma árvore vanEmdeBoas:
class Van_Emde_Boas {
    public:
    int universo;
    int min;
    int max;
    Van_Emde_Boas* sumario;
    Van_Emde_Boas* clusters[];

    //Construtor. Requer que seja repassado o tamanho do universo dessa árvore
    Van_Emde_Boas(int argTamanho) {
        universo = argTamanho;
        min = -1;
        max = -1;
        if (universo <=2) {
            sumario = NULL;
            clusters[0] = NULL;
        } else {
            int numClusters = ceil(sqrt(universo));
            sumario = new Van_Emde_Boas(numClusters);
            for (int i = 0; i < numClusters; i++) {
                clusters[i] = new Van_Emde_Boas(numClusters);
            }
        }
    }

    int obterPai(int argX) {
        int div = ceil(sqrt(universo));
        //printf("(obterPai: %d)\n", div);
        return argX / div;
    }

    int obterFilho(int argX) {
        int mod = ceil(sqrt(universo));
        //printf("(obterFilho: %d)\n", mod);
        return argX % mod;
    }

    int gerarChave(int argX, int argY) {
        return argX * ceil(sqrt(universo)) + argY;
    }

    void inserir(int argChave) {
        //Se nenhuma chave estiver presente na árvore, então define-se que o mínimo e o máximo são do mesmo valor de sua chave.
        if (min==-1) {
            min=argChave;
            max=argChave;
        } else {
            //Se a chave a ser inserida for menor que o mínimo, troca os valores das duas variáveis, para que o "mínimo" vá mais fundo na árvore, para a posição verdadeira dele.
            //Conceito similar ao "Lazy Propagation"
            if (argChave < min) {
                int aux = min;
                min = argChave;
                argChave = aux;
            }
            if (universo > 2) {
                //Se nenhuma chave está presente nos clusters então insere a chave tanto no cluster quanto no sumário.
                if (clusters[obterPai(argChave)]->min == -1) {
                    sumario->inserir(obterPai(argChave));
                    clusters[obterPai(argChave)]->min = obterFilho(argChave);
                    clusters[obterPai(argChave)]->max = obterFilho(argChave);
                } else {
                    //Se houver outros elementos na árvore então deve ir mais fundo recursivamente na estrutura para definir os atributos de acordo.
                    clusters[obterPai(argChave)]->inserir(obterFilho(argChave));
                }
            }
            //Define a chave a ser inserida como máxima caso seja maior que a máxima atual.
            if (argChave > max) {
                max = argChave;
            }
        }
    }

    //Verifica se um elemento existe ou não na árvore:
    bool verificar(int argChave) {
        if (universo < argChave) {
            return false;
        }
        if (min == argChave || max == argChave) {
            return true;
        } else {
            if (universo==2) {
                return false;
            } else {
                return clusters[obterPai(argChave)]->verificar(obterFilho(argChave));
            }
        }
    }

    //Imprime toda a árvore:
    void imprimir(int argPrefixo=0) {
        if (argPrefixo==0) {
            printf("==================\nRaiz:\n");
        }
        for (int i = 0; i < argPrefixo; i++) {
            printf("|");
        }
        printf("u: %d | min: %d | max: %d\n", universo, min, max);
        if (universo > 2) {
            if (sumario!=NULL) {
                for (int i = 0; i < argPrefixo; i++) {
                    printf("|");
                }
                printf("Sumario: \n");
                sumario->imprimir(argPrefixo+1);
                for (int i = 0; i < argPrefixo; i++) {
                    printf("|");
                }
                printf("Clusters: \n");
                for (int i = 0; i < ceil(sqrt(universo)); i++) {
                    clusters[i]->imprimir(argPrefixo+1);
                }
            }
        }
    }

    //Imprime se determinado número está na árvore:
    void imprimirVerificacao(int argChave) {
        printf("O número %d ", argChave);
        if (verificar(argChave)) {
            printf("está na árvore\n");
        } else {
            printf("não está na árvore\n");
        }
    }

    //Imprime o mínimo da árvore:
    void imprimirMinimo() {
        printf("O mínimo da árvore é %d\n", min);
    }

    //Imprime o máximo da árvore:
    void imprimirMaximo() {
        printf("O máximo da árvore é %d\n", max);
    }

    //Imprime a árvore como vetor sequencial:
    void imprimirVetor() {
        for (int i = 0; i < universo; i++) {
            if (verificar(i)) {
                printf("%d", i);
            } else {
                printf("-");
            }
            if (i < universo-1) {
                printf(" | ");
            }
        }
        printf("\n");
    }
};

int main() {
    //Criando árvore vEB com universo tamanho 8:
    Van_Emde_Boas* vEB = new Van_Emde_Boas(8);

    //Inserindo valores na árvore:
    vEB->inserir(2);
    vEB->inserir(3);
    vEB->inserir(7);
    vEB->inserir(5);
    //Verifica se os números 3 e 4 estão na árvore e imprime:
    vEB->imprimirVerificacao(3);
    vEB->imprimirVerificacao(4);

    //Imprime o mínimo e máximo da árvore:
    vEB->imprimirMinimo();
    vEB->imprimirMaximo();

    //Imprime a árvore:
    vEB->imprimir();

    //Imprime a árvore como vetor:
    vEB->imprimirVetor();
}