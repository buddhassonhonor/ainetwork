import { test, expect } from '@playwright/test';

test.describe('计算机网络随堂测验系统 E2E 测试 (28题新版)', () => {
  const BASE_URL = 'http://localhost:5173/quiz';

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before test
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1. 错误学生信息登录时提示校验错误', async ({ page }) => {
    await page.goto(BASE_URL);

    // Fill invalid student credentials
    await page.fill('#student-name-input', '不存在的学生');
    await page.fill('#student-id-input', '999999999');
    await page.click('#btn-login-submit');

    // Verify error message is shown
    const errorBox = page.locator('text=未在 2024级通信工程1班 名单中匹配到此信息');
    await expect(errorBox).toBeVisible();
  });

  test('2. 正常学生登录并完成全套测试，满分自动评分与全班成绩汇总', async ({ page }) => {
    await page.goto(BASE_URL);

    // 1. Fill valid credentials: 高鹏远 (240307001)
    await page.fill('#student-name-input', '高鹏远');
    await page.fill('#student-id-input', '240307001');
    await page.click('#btn-login-submit');

    // 2. Verify test page opened
    await expect(page.locator('text=高鹏远').first()).toBeVisible();
    await expect(page.locator('text=240307001').first()).toBeVisible();

    // 3. Answer all 28 questions according to new standard answers
    const answers: Record<number, string> = {
      1: 'B', 2: 'C', 3: 'B', 4: 'B', 5: 'A',
      6: 'C', 7: 'A', 8: 'B', 9: 'C', 10: 'A',
      11: 'B', 12: 'B', 13: 'A', 14: 'B', 15: 'B',
      16: 'A', 17: 'B', 18: 'B', 19: 'B', 20: 'A',
      21: 'A', 22: 'B', 23: 'B', 24: 'B', 25: 'D',
      26: 'C', 27: 'C', 28: 'B'
    };

    for (const [qid, opt] of Object.entries(answers)) {
      await page.click(`#opt-${qid}-${opt}`);
    }

    // Verify all 28 questions are answered
    await expect(page.locator('text=已完成 28 / 28 道题目')).toBeVisible();

    // 4. Submit test
    await page.click('#btn-submit-top');

    // 5. Verify Score Report (100 points, 28/28)
    await expect(page.locator('text=最终得分')).toBeVisible();
    await expect(page.locator('text=100').first()).toBeVisible();
    await expect(page.locator('text=等级：优秀 🌟')).toBeVisible();
    await expect(page.locator('text=28 / 28')).toBeVisible();

    // 6. Check Class Score Sheet / Leaderboard
    await page.click('text=全班成绩单与统计');
    await expect(page.locator('text=2024级通信工程1班 · 测验成绩总榜')).toBeVisible();
    await expect(page.locator('text=/ 43 人')).toBeVisible();
    await expect(page.locator('text=已完成 (1)')).toBeVisible();
    await expect(page.locator('text=100.0').first()).toBeVisible();

    // Verify 高鹏远 is marked as 已完成 in the table
    const studentRow = page.locator('tr:has-text("240307001")');
    await expect(studentRow).toContainText('高鹏远');
    await expect(studentRow).toContainText('已完成');
    await expect(studentRow).toContainText('100');
    await expect(studentRow).toContainText('28/28');
  });

  test('3. 多名学生提交后，按比例四舍五入折算百分制与班级统计', async ({ page }) => {
    await page.goto(BASE_URL);

    // Student 1: 高鹏远 - 28/28 = 100分
    await page.fill('#student-name-input', '高鹏远');
    await page.fill('#student-id-input', '240307001');
    await page.click('#btn-login-submit');

    const perfectAnswers: Record<number, string> = {
      1: 'B', 2: 'C', 3: 'B', 4: 'B', 5: 'A',
      6: 'C', 7: 'A', 8: 'B', 9: 'C', 10: 'A',
      11: 'B', 12: 'B', 13: 'A', 14: 'B', 15: 'B',
      16: 'A', 17: 'B', 18: 'B', 19: 'B', 20: 'A',
      21: 'A', 22: 'B', 23: 'B', 24: 'B', 25: 'D',
      26: 'C', 27: 'C', 28: 'B'
    };

    for (const [qid, opt] of Object.entries(perfectAnswers)) {
      await page.click(`#opt-${qid}-${opt}`);
    }
    await page.click('#btn-submit-top');
    await expect(page.locator('text=最终得分')).toBeVisible();

    // Logout
    await page.click('button[title="退出登录"]');

    // Student 2: 刘语诺 (240302089) - 答错两题 (26/28 = 93分)
    await page.fill('#student-name-input', '刘语诺');
    await page.fill('#student-id-input', '240302089');
    await page.click('#btn-login-submit');

    for (const [qid, opt] of Object.entries(perfectAnswers)) {
      if (qid === '1') {
        await page.click(`#opt-1-A`); // wrong
      } else if (qid === '2') {
        await page.click(`#opt-2-A`); // wrong
      } else {
        await page.click(`#opt-${qid}-${opt}`);
      }
    }
    await page.click('#btn-submit-top');

    // 26 / 28 * 100 = 92.857 -> round to 93
    await expect(page.locator('text=93').first()).toBeVisible();
    await expect(page.locator('text=26 / 28')).toBeVisible();

    // Check Class Score Sheet
    await page.click('text=全班成绩单与统计');
    await expect(page.locator('text=/ 43 人')).toBeVisible();
    await expect(page.locator('text=已完成 (2)')).toBeVisible();
    // Average score: (100 + 93) / 2 = 96.5
    await expect(page.locator('text=96.5')).toBeVisible();
  });

  test('4. 导出成绩单 CSV 文件完整性检验', async ({ page }) => {
    await page.goto(BASE_URL);

    // Login as 高鹏远 and submit
    await page.fill('#student-name-input', '高鹏远');
    await page.fill('#student-id-input', '240307001');
    await page.click('#btn-login-submit');

    for (let i = 1; i <= 28; i++) {
      await page.click(`#opt-${i}-B`);
    }
    await page.click('#btn-submit-top');

    // Wait for review page to load
    await expect(page.locator('text=最终得分')).toBeVisible();

    // Click Class Records
    await page.click('#btn-nav-records');
    await expect(page.locator('text=2024级通信工程1班 · 测验成绩总榜')).toBeVisible();

    // Test 1: Export Excel (.xlsx)
    const excelDownloadPromise = page.waitForEvent('download');
    await page.click('#btn-export-excel');
    const excelDownload = await excelDownloadPromise;
    expect(excelDownload.suggestedFilename()).toContain('2024级通信1班');
    expect(excelDownload.suggestedFilename()).toContain('第1次测验');
    expect(excelDownload.suggestedFilename()).toMatch(/\.xlsx$/);

    // Test 2: Export CSV (.csv)
    const csvDownloadPromise = page.waitForEvent('download');
    await page.click('#btn-export-csv');
    const csvDownload = await csvDownloadPromise;
    expect(csvDownload.suggestedFilename()).toContain('2024级通信1班');
    expect(csvDownload.suggestedFilename()).toContain('第1次测验');
    expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/);
  });

  test('5. 重新作答密码鉴权机制（默认888888不外露，错误拦截，正确放行）', async ({ page }) => {
    await page.goto(BASE_URL);

    // 1. First attempt by 高鹏远
    await page.fill('#student-name-input', '高鹏远');
    await page.fill('#student-id-input', '240307001');
    await page.click('#btn-login-submit');

    for (let i = 1; i <= 28; i++) {
      await page.click(`#opt-${i}-B`);
    }
    await page.click('#btn-submit-top');
    await expect(page.locator('text=最终得分')).toBeVisible();

    // 2. Click 重新作答测验
    await page.click('#btn-retake-test');

    // 3. Verify modal opens and does NOT expose the password '888888'
    await expect(page.locator('text=重新作答权限验证')).toBeVisible();
    const modalContent = await page.locator('div.max-w-md').innerText();
    expect(modalContent).not.toContain('888888');

    // 4. Input wrong password -> should show error
    await page.fill('#retake-password-input', 'wrongpass');
    await page.click('#btn-confirm-retake-password');
    await expect(page.locator('text=授权密码错误，请联系任课教师获取重新作答密码')).toBeVisible();

    // 5. Input correct password '888888' -> enters test
    await page.fill('#retake-password-input', '888888');
    await page.click('#btn-confirm-retake-password');

    // 6. Verify back on testing view with fresh state
    await expect(page.locator('text=已完成 0 / 28 道题目')).toBeVisible();
  });
});
