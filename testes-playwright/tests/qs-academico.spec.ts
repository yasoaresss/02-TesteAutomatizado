import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });


  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

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

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });


  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaMedia = page.locator('#tabela-alunos tbody tr td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });

  });


  test.describe('Validação de Notas', () => {

    test('deve rejeitar nota acima de 10', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Carlos Lima');
      await page.getByLabel('Nota 1').fill('11');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

    test('deve rejeitar nota negativa', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Mariana Souza');
      await page.getByLabel('Nota 1').fill('-1');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

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

      await page.getByPlaceholder('Buscar aluno...').fill('Lucas');

      await expect(page.getByText('Lucas Oliveira')).toBeVisible();
      await expect(page.getByText('Fernanda Rocha')).not.toBeVisible();
    });

  });

  test.describe('Exclusão de Aluno', () => {

    test('deve remover o aluno e deixar a tabela vazia', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Rafael Torres');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);

      await page.getByRole('button', { name: 'Excluir' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  test.describe('Estatísticas', () => {

    test('deve exibir totais corretos nos cards de estatísticas', async ({ page }) => {

      await page.getByLabel('Nome do Aluno').fill('Aprovado Teste');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Recuperacao Teste');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('5');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await page.getByLabel('Nome do Aluno').fill('Reprovado Teste');
      await page.getByLabel('Nota 1').fill('2');
      await page.getByLabel('Nota 2').fill('3');
      await page.getByLabel('Nota 3').fill('1');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#card-aprovados')).toContainText('1');
      await expect(page.locator('#card-recuperacao')).toContainText('1');
      await expect(page.locator('#card-reprovados')).toContainText('1');
    });

  });


  test.describe('Situação — Aprovado', () => {

    test('deve exibir situação "Aprovado" para média >= 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Bianca Ferreira');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaSituacao = page.locator('#tabela-alunos tbody tr td').nth(5);
      await expect(celulaSituacao).toHaveText('Aprovado');
    });

  });


  test.describe('Situação — Reprovado', () => {

    test('deve exibir situação "Reprovado" para média < 5', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Gustavo Mendes');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('4');
      await page.getByLabel('Nota 3').fill('2');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      const celulaSituacao = page.locator('#tabela-alunos tbody tr td').nth(5);
      await expect(celulaSituacao).toHaveText('Reprovado');
    });

  });

  test.describe('Múltiplos Cadastros', () => {

    test('deve exibir 3 linhas após cadastrar 3 alunos consecutivos', async ({ page }) => {
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

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
    });

  });

});