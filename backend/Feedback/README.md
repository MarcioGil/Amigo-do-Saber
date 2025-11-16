# Feedback Function

Esta Azure Function permite receber e listar feedbacks dos usuários.

- **POST**: Envia feedback (nome, mensagem, idioma)
- **GET**: Lista feedbacks por idioma

## Exemplo de uso

### POST
```json
{
  "nome": "Maria",
  "mensagem": "Gostei muito da Tia Dora!",
  "idioma": "pt"
}
```

### GET
`/api/Feedback?idioma=pt`

## Cosmos DB
- Container: `feedbacks`
- Database: `amigo-do-saber` (padrão)

## Segurança
- Apenas dados públicos, sem informações sensíveis.
