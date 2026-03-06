import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // ✅ BOA PRÁTICA: Verificar título da página uma vez só no beforeEach,
    // garantindo que todos os testes partem de uma página válida.
    await expect(page).toHaveTitle(/QS Acadêmico/);
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe('Cadastro de Alunos', () => {

    test('deve exibir a seção de cadastro e o placeholder do campo nome ao carregar a página', async ({ page }) => {
      // ✅ toBeVisible() — confirma que a seção de cadastro está renderizada
      await expect(page.locator('#secao-cadastro')).toBeVisible();

      // ✅ toHaveAttribute() — verifica o placeholder acessível do campo nome
      await expect(page.getByLabel('Nome do Aluno')).toHaveAttribute(
        'placeholder', 'Digite o nome completo'
      );

      // ✅ getByText() — tabela começa no estado de placeholder
      await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
    });

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      // ✅ getByLabel() — seletor acessível, mais robusto que CSS
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      // ✅ getByRole() — seletor semântico para botões
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // ✅ toHaveCount() — verifica número exato de linhas na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.getByText('João Silva')).toBeVisible();
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // ✅ getByText() — placeholder da tabela deve continuar visível
      await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
    });

  });

  // ========== GRUPO 2: Cálculo de Média ==========

  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (8 + 6 + 10) / 3 = 8.00
      const celulaMedia = page.locator('#tabela-alunos tbody tr td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });

  });

  // ========== GRUPO 3: Validação de Notas ==========

  test.describe('Validação de Notas', () => {

    test('deve rejeitar nota acima de 10', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Carlos Lima');
      await page.getByLabel('Nota 1').fill('11');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // ✅ getByText() — nota inválida não gera cadastro; placeholder persiste
      await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
    });

    test('deve rejeitar nota negativa', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Mariana Souza');
      await page.getByLabel('Nota 1').fill('-1');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
    });

  });

  // ========== GRUPO 4: Busca por Nome ==========

  test.describe('Busca por Nome', () => {

    test('deve exibir apenas o aluno correspondente ao termo buscado', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Lucas Oliveira');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Fernanda Rocha');
      await page.getByLabel('Nota 1').fill('6');
      await page.getByLabel('Nota 2').fill('5');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // ✅ toHaveCount() — confirma que ambos estão na tabela antes de filtrar
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(2);

      // ✅ getByPlaceholder() — seletor acessível para o campo de busca
      await page.getByPlaceholder('Buscar aluno...').fill('Lucas');

      // ✅ .not.toBeVisible() — garante que o outro aluno sumiu da view
      await expect(page.getByText('Lucas Oliveira')).toBeVisible();
      await expect(page.getByText('Fernanda Rocha')).not.toBeVisible();
    });

  });

  // ========== GRUPO 5: Exclusão de Aluno ==========

  test.describe('Exclusão de Aluno', () => {

    test('deve remover o aluno e deixar a tabela vazia', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Rafael Torres');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);

      await page.getByRole('button', { name: 'Excluir' }).click();

      // ✅ .not.toBeVisible() — nome não deve mais aparecer após exclusão
      await expect(page.getByText('Rafael Torres')).not.toBeVisible();

      // ✅ getByText() — placeholder deve reaparecer ao esvaziar a tabela
      await expect(page.getByText('Nenhum aluno cadastrado.')).toBeVisible();
    });

  });

  // ========== GRUPO 6: Estatísticas ==========

  test.describe('Estatísticas', () => {

    test('deve exibir totais corretos nos cards de estatísticas', async ({ page }) => {
      // Aluno Aprovado: média >= 7
      await page.getByLabel('Nome do Aluno').fill('Aprovado Teste');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Aluno em Recuperação: 5 <= média < 7
      await page.getByLabel('Nome do Aluno').fill('Recuperacao Teste');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('5');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Aluno Reprovado: média < 5
      await page.getByLabel('Nome do Aluno').fill('Reprovado Teste');
      await page.getByLabel('Nota 1').fill('2');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('1');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // ✅ toHaveText() — verifica valor exato dos cards de estatística
      await expect(page.locator('#stat-total')).toHaveText('3');
      await expect(page.locator('#card-aprovados')).toContainText('1');
      await expect(page.locator('#card-recuperacao')).toContainText('1');
      await expect(page.locator('#card-reprovados')).toContainText('1');
    });

  });

  // ========== GRUPO 7: Situação — Aprovado ==========

  test.describe('Situação — Aprovado', () => {

    test('deve exibir situação "Aprovado" para média >= 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Bianca Ferreira');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média: (7 + 8 + 9) / 3 = 8.00 → Aprovado
      const celulaSituacao = page.locator('#tabela-alunos tbody tr td').nth(5);
      await expect(celulaSituacao).toHaveText('Aprovado');
    });

  });

  // ========== GRUPO 8: Situação — Reprovado ==========

  test.describe('Situação — Reprovado', () => {

    test('deve exibir situação "Reprovado" para média < 5', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Gustavo Mendes');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('4');
      await page.getByLabel('Nota 3').fill('2');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média: (3 + 4 + 2) / 3 = 3.00 → Reprovado
      const celulaSituacao = page.locator('#tabela-alunos tbody tr td').nth(5);
      await expect(celulaSituacao).toHaveText('Reprovado');
    });

  });

  // ========== GRUPO 9: Múltiplos Cadastros ==========

  test.describe('Múltiplos Cadastros', () => {

    test('deve exibir 3 linhas após cadastrar 3 alunos consecutivos', async ({ page }) => {
      // ✅ BOA PRÁTICA: dados de teste em array evita repetição de código
      const alunos = [
        { nome: 'Aluno Um',   n1: '6', n2: '7', n3: '8' },
        { nome: 'Aluno Dois', n1: '5', n2: '6', n3: '7' },
        { nome: 'Aluno Tres', n1: '9', n2: '8', n3: '10' },
      ];

      for (const aluno of alunos) {
        await page.getByLabel('Nome do Aluno').fill(aluno.nome);
        await page.getByLabel('Nota 1').fill(aluno.n1);
        await page.getByLabel('Nota 2').fill(aluno.n2);
        await page.getByLabel('Nota 3').fill(aluno.n3);
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      // ✅ toHaveCount() — verifica número exato de linhas após múltiplos cadastros
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
    });

  });

});