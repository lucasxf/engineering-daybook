## Demo Pages

Esta pasta contém páginas de demo para validação durante o desenvolvimento.

### Acessar as Demos

- **Em Inglês:** `/en/demos` e `/en/demos/timeline`
- **Em Português:** `/pt-BR/demos` e `/pt-BR/demos/timeline`

### Validação

A página de demo da Timeline permite testar:

- ✓ Suporte a i18n (en/pt-BR)
- ✓ Suporte a temas (light/dark/system)
- ✓ Todos os 6 estados de UI (populated, single-month, loading, empty, no-results, error)
- ✓ Busca funcional com debounce
- ✓ Ordenação ascendente/descendente
- ✓ Formatação de datas por locale

### Remover Antes do PR

Antes de abrir um PR para produção, delete esta pasta inteira:

```bash
rm -rf web/src/app/\[locale\]/demos/
```

Não comitar esta pasta no branch main ou em releases.
