[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/oHw8ptbv)
# API ebirds
- [Documentação](https://documenter.getpostman.com/view/664302/S1ENwy59)
- [Termos de uso](https://www.birds.cornell.edu/home/ebird-api-terms-of-use/)
- [Amostras](https://support.ebird.org/en/support/solutions/articles/48000838205-download-ebird-data#anchorEBD)
- [Views ebirds](https://ebird.org/explore)


# Escolhas de designs

## Globo
Meu objetivo era de alguma forma tentar melhorar a visualização de concentração de passaros da ebirds. 
Manter o formato de mapa é viavél pois queremos ter noção de onde elas estão geograficamente.

## Ratação e zoom
Para uma pesquisa com mais liberdade zoom e rotação do globo são excenciais 

## Bolhas
O heat-map possui algumas dificuldades quando queremos comparar numericamente dois dados, então substitui por um grafico de bolhas onde a quantidade de passaros é proporcional à área da bolha. Inicialmente tentem fazer de forma mais absoluta onde a bolha teria area correspondente a 2 vezes a quantidade de passaros, entretanto os circulos ficavam muito pequenos para vizualizações unicas, e se a escala fosse almentada as aves abundantes cobreriam todo mapa... então utilizei escalas com o ajuda do próprio d3.

## pesquisa
uma pesquisa simples para adicionar as espécies ao mapa e ao grafico, algo que já existia no original e eu quis manter.
vale alertar que apesar de existir a opção de selecionar tudo ela deixa a vizualização incrivelmente pesada e não é recomendada.

## Cores
Não consigo imaginar algo mais eficas para variaveis categóricas que forma e cor, como eu já estava usando circulos para espressar quantidade resolvi utilizar as cores para reprezentar as espécies. 

Infelismente a quantidade de dados foi gigantesca então fiz com ajuda do gpt uma escala manual com 30 cores, ainda não estão otimizadas, mas qualquer coisa acima de 15 começa a ficar muito poluido o mapa num geral

## Barras
As barras são muito mais expressivas que area de circulo para comparações, também por ser ordenada fica facil achar os valores extremos.

cada barra permite, apenas clicando, localizar o ponto em questão no mapa

## filtro por lat-lon
O filtro por espaço geografico foi adicionado para limitar o grafico de barras com ajuda de um dos bottoes é possivel selecionaer uma fatia do globo e as observações de dentro dessa area são mapeadas para o grafico de barras

## achatamento do globo
Essa opção foi posta pois no globo só conseguimos ver metade de todo o mundo e o achatamento permite que vejamos ele por completo, em contrapartida o globo preserva as dimenções reais e é mais bonito, então deixei a criterio do leitor decidir isso

## legenda
Os axes do grafico de barras não seguem a mesma dinamica que o d3 planeja, para se adequar ao pequeno espaço eu fiz meus próprios intervalos dinamicamente mas ele começa a sobrepor caso haja mais de 20 mil observações de alguma espécie (o maximo que presenciei foi 8 mil)

A legenda das bolhas ainda está um pouco bugada e somente são validas as ultimas 5 bolhas que aparecem nela (acredito que não terei tempo de arrumar isso) mas estas cinco mostram o valor maximo, o minimo, a mediana e as medias entre media e minimos e mediana e maximo

## botões 
tenho 3 botões:
- flatten globe | Return to globe: achata ou cancela o achatamento do globo
- select area: acabei de percener que não mudei o nome do botão vermelho mas ele permite cancelar o brush, o normal ativa
- clear selection: limpa os filtros do barchart e remove a area visual no mapa

# Coisa a melhorar de imediato:

- Não tem nada que deixe intuitivo que as barras do barchart servem de pesquisa para os pontos
- A legenda das bolhas está com bug, sendo validas somente as 5 ultimas bolhas
- A area de demarcada da seleção tem um delei em relação ao globo quando é feito zoom ou ratação

# Desenvolvimento

inicialmente dediquei 2 dias apenas para testes da api e plataformas (next e github pages)
em 4 dias consegui fazer um grafico plano com zoom, move e select que foi descartado pela ideia do globo e um grafico de barras já com a seleção
2 dias foram necessários para atualizar para a versão do globo e adicionar porcamente as cores
1 dia foi utilizado para ajustar as cores em todos os elementos
reajustar o brush levou 4 dias 
design e legendas levaram 2 dias 

-- utilizei o gpt para me auxiliar em bugs, me dar opções de solução principalmente para o brush e bastante para achar erros silenciosos gerados pelo react. ele também gerou minha paleta manual.

