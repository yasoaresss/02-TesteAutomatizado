import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await expect(page.getByRole('textbox', { name: 'Nome do Aluno' })).toBeVisible();
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('João Silva');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('7');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.getByRole('cell', { name: 'João Silva', exact: true })).toBeVisible();
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Ana Costa');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('9');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('7');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 2: Cálculo de Média ==========

  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Pedro Santos');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('6');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (8 + 6 + 10) / 3 = 8.00
      const celulaMedia = page.locator('#tabela-alunos tbody tr td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });

  });

  // ========== GRUPO 3: Validação de Notas ==========

  test.describe('Validação de Notas', () => {

    test('deve rejeitar nota acima de 10', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Carlos Lima');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('11', { force: true });
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

    test('deve rejeitar nota negativa', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Mariana Souza');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('-1', { force: true });
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 4: Busca por Nome ==========

  test.describe('Busca por Nome', () => {

    test('deve exibir apenas o aluno correspondente ao termo buscado', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Lucas Oliveira');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('7');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Fernanda Rocha');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('6');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('5');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(2);

      await page.getByRole('textbox', { name: 'Buscar por nome' }).fill('Lucas');

      await expect(page.getByRole('cell', { name: 'Lucas Oliveira', exact: true })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Fernanda Rocha', exact: true })).not.toBeVisible();
    });

  });

  // ========== GRUPO 5: Exclusão de Aluno ==========

  test.describe('Exclusão de Aluno', () => {

    test('deve remover o aluno e deixar a tabela vazia', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Rafael Torres');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('7');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);

      await page.getByRole('button', { name: 'Excluir Rafael Torres' }).click();

      await expect(page.getByRole('cell', { name: 'Rafael Torres', exact: true })).not.toBeVisible();
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 6: Estatísticas ==========

  test.describe('Estatísticas', () => {

    test('deve exibir totais corretos nos cards de estatísticas', async ({ page }) => {
      // Aluno Aprovado: média >= 7
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aprovado Teste');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('7');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Aluno em Recuperação: 5 <= média < 7
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Recuperacao Teste');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('5');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('6');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('5');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Aluno Reprovado: média < 5
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Reprovado Teste');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('2');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('3');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('1');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#stat-aprovados')).toContainText('1');
      await expect(page.locator('#stat-recuperacao')).toContainText('1');
      await expect(page.locator('#stat-reprovados')).toContainText('1');
    });

  });

  // ========== GRUPO 7: Situação — Aprovado ==========

  test.describe('Situação — Aprovado', () => {

    test('deve exibir situação "Aprovado" para média >= 7', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Bianca Ferreira');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('7');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('8');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('9');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média: (7 + 8 + 9) / 3 = 8.00 → Aprovado
      const celulaSituacao = page.locator('#tabela-alunos tbody tr td').nth(5);
      await expect(celulaSituacao).toHaveText('Aprovado');
    });

  });

  // ========== GRUPO 8: Situação — Reprovado ==========

  test.describe('Situação — Reprovado', () => {

    test('deve exibir situação "Reprovado" para média < 5', async ({ page }) => {
      await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Gustavo Mendes');
      await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('3');
      await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('4');
      await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('2');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média: (3 + 4 + 2) / 3 = 3.00 → Reprovado
      const celulaSituacao = page.locator('#tabela-alunos tbody tr td').nth(5);
      await expect(celulaSituacao).toHaveText('Reprovado');
    });

  });

  // ========== GRUPO 9: Múltiplos Cadastros ==========

  test.describe('Múltiplos Cadastros', () => {

    test('deve exibir 3 linhas após cadastrar 3 alunos consecutivos', async ({ page }) => {
      const alunos = [
        { nome: 'Aluno Um',   n1: '6', n2: '7', n3: '8' },
        { nome: 'Aluno Dois', n1: '5', n2: '6', n3: '7' },
        { nome: 'Aluno Tres', n1: '9', n2: '8', n3: '10' },
      ];

      for (const aluno of alunos) {
        await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill(aluno.nome);
        await page.getByRole('spinbutton', { name: 'Nota 1' }).fill(aluno.n1);
        await page.getByRole('spinbutton', { name: 'Nota 2' }).fill(aluno.n2);
        await page.getByRole('spinbutton', { name: 'Nota 3' }).fill(aluno.n3);
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
    });

  });

});