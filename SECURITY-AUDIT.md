# Auditoria de Segurança — Akatsuky Delivery Sushi

Data: 2026-09-01

## Resultado

A arquitetura atual usa Firebase Realtime Database + Firebase Authentication para o painel administrativo e já possui regras por função (`admin`, `operator`, `cashier`).

## Pontos corrigidos/confirmados

- A raiz do Realtime Database está bloqueada por padrão.
- `users/<uid>` não pode ser alterado pelo cliente.
- Cardápio, abertura/fechamento da loja e taxa de entrega são graváveis somente por `admin`.
- Caixa é limitado a `admin`/`cashier`.
- Histórico de pedidos é limitado a equipe autorizada.
- Existem validações de estrutura e tipos em pedidos e caixa.
- Índices existem para consultas de pedidos e caixa.

## Ponto crítico encontrado

O caminho `orders/<orderId>` ainda possui leitura pública e permite criação de pedidos sem autenticação para manter o Delivery funcionando. Isso é compatível com o fluxo atual, mas significa que **não devemos considerar o sistema 100% seguro para dados de clientes** ainda.

Além disso, o Garçom atual precisa ser migrado para Firebase Authentication com a função `garcom` antes de restringirmos a leitura dos pedidos de mesa. Realtime Database não funciona como filtro de segurança: uma leitura no caminho pai precisa ser autorizada pela regra do próprio caminho, e regras filhas não conseguem revogar uma permissão concedida no pai.

## Próxima arquitetura segura

### ADM
`users/<uid>/role = admin`

- leitura/escrita administrativa
- pedidos
- cardápio
- configurações
- caixa

### Operador
`users/<uid>/role = operator`

- leitura dos pedidos
- atualização de status

### Caixa
`users/<uid>/role = cashier`

- caixa e histórico permitido

### Garçom
`users/<uid>/role = garcom`

- autenticação obrigatória
- leitura somente por consulta de `mesa`
- criação de pedidos com `origem = garcom`
- fechamento/pagamentos somente dos pedidos de mesa permitidos
- sem acesso ao cardápio administrativo, configurações ou caixa

### Cliente/Delivery
O próximo passo é adicionar identificação segura do pedido (UID anônimo ou token de acompanhamento) para que o cliente possa consultar somente o próprio pedido, em vez de deixar `orders` publicamente legível.

## Antes de colocar as regras finais em produção

1. Ativar Email/Password no Firebase Authentication.
2. Criar a conta do Garçom.
3. Copiar o UID da conta.
4. Criar no Realtime Database:

```json
"users": {
  "UID_DO_GARCOM": {
    "role": "garcom"
  }
}
```

5. Migrar o `garcom.html` para login obrigatório e consulta por `mesa`.
6. Migrar o acompanhamento do Delivery para UID/token próprio.
7. Publicar as regras finais.
8. Testar no Firebase Rules Simulator/Emulator antes do deploy.

## Importante

A alteração do arquivo `database.rules.json` no GitHub **não publica automaticamente as regras no Firebase**. O projeto referencia esse arquivo no `firebase.json`, mas é necessário executar o deploy pelo Firebase CLI/Console.

Nunca coloque senha, token secreto ou Firebase Admin SDK no GitHub.
