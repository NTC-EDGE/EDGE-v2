const assert = require('assert');

// 1. Stress Test isThemeMode logic
function isThemeMode(value) {
  return value === 'light' || value === 'dark' || value === 'system';
}

console.log('--- Test 1: isThemeMode behavior ---');
assert.strictEqual(isThemeMode('light'), true);
assert.strictEqual(isThemeMode('dark'), true);
assert.strictEqual(isThemeMode('system'), true);
assert.strictEqual(isThemeMode(null), false);
assert.strictEqual(isThemeMode(undefined), false);
assert.strictEqual(isThemeMode(''), false);
assert.strictEqual(isThemeMode('LIGHT'), false);
assert.strictEqual(isThemeMode('{"mode":"dark"}'), false);
assert.strictEqual(isThemeMode('undefined'), false);
console.log('PASSED: isThemeMode validation logic');

// 2. Stress Test Storage simulation (SSR, corrupt, rapid toggling)
console.log('\n--- Test 2: Storage Edge Cases & SSR ---');

async function testStorageSimulation() {
  const THEME_STORAGE_KEY = '@edge/ui/theme_mode';

  // Helper storage mock
  function createStorageMock({ os, windowObj, asyncStorageObj }) {
    return {
      async getMode() {
        try {
          if (os === 'web') {
            if (typeof windowObj !== 'undefined' && windowObj !== null && windowObj.localStorage !== undefined) {
              const raw = windowObj.localStorage.getItem(THEME_STORAGE_KEY);
              if (isThemeMode(raw)) {
                return raw;
              }
            }
            return null;
          } else {
            const raw = await asyncStorageObj.getItem(THEME_STORAGE_KEY);
            if (isThemeMode(raw)) {
              return raw;
            }
            return null;
          }
        } catch {
          return null;
        }
      },
      async setMode(mode) {
        try {
          if (os === 'web') {
            if (typeof windowObj !== 'undefined' && windowObj !== null && windowObj.localStorage !== undefined) {
              windowObj.localStorage.setItem(THEME_STORAGE_KEY, mode);
            }
          } else {
            await asyncStorageObj.setItem(THEME_STORAGE_KEY, mode);
          }
        } catch {
          // Catch storage error gracefully
        }
      }
    };
  }

  // 2a. SSR Environment (window is undefined)
  const ssrStorage = createStorageMock({ os: 'web', windowObj: undefined });
  const ssrResult = await ssrStorage.getMode();
  assert.strictEqual(ssrResult, null, 'SSR getMode should return null');
  await ssrStorage.setMode('dark'); // Should not throw
  console.log('PASSED: SSR environment simulation');

  // 2b. Restricted Window (localStorage throws SecurityError)
  const brokenWindowStorage = createStorageMock({
    os: 'web',
    windowObj: {
      localStorage: {
        getItem: () => { throw new Error('SecurityError: Access is denied'); },
        setItem: () => { throw new Error('QuotaExceededError'); }
      }
    }
  });
  const brokenResult = await brokenWindowStorage.getMode();
  assert.strictEqual(brokenResult, null, 'Broken storage getMode should catch error and return null');
  await brokenWindowStorage.setMode('light'); // Should catch error and not throw
  console.log('PASSED: Restricted / Throwing localStorage simulation');

  // 2c. Corrupt Storage Values
  let mockStore = {};
  const corruptWindowStorage = createStorageMock({
    os: 'web',
    windowObj: {
      localStorage: {
        getItem: (k) => mockStore[k] || null,
        setItem: (k, v) => { mockStore[k] = v; }
      }
    }
  });

  mockStore[THEME_STORAGE_KEY] = '{"theme":"dark"}'; // Corrupt JSON
  assert.strictEqual(await corruptWindowStorage.getMode(), null, 'Corrupt JSON string should return null');

  mockStore[THEME_STORAGE_KEY] = 'random_junk_123';
  assert.strictEqual(await corruptWindowStorage.getMode(), null, 'Corrupt junk string should return null');

  mockStore[THEME_STORAGE_KEY] = 'dark';
  assert.strictEqual(await corruptWindowStorage.getMode(), 'dark', 'Valid string "dark" should return "dark"');
  console.log('PASSED: Corrupt storage value handling');

  // 2d. Rapid Mode Toggling ('light' -> 'dark' -> 'system')
  console.log('Testing rapid mode toggling...');
  const modesToToggle = ['light', 'dark', 'system', 'light', 'dark', 'system', 'light'];
  const promises = modesToToggle.map(m => corruptWindowStorage.setMode(m));
  await Promise.all(promises);
  // Last state set synchronously in JS mock was 'light'
  assert.strictEqual(mockStore[THEME_STORAGE_KEY], 'light', 'Final mode after rapid toggling should be saved');
  console.log('PASSED: Rapid mode toggling');
}

testStorageSimulation().then(() => {
  console.log('\n--- Test 3: Component Logic Edge Cases ---');

  // Avatar getAvatarColors edge cases
  function getAvatarColors(name, themeColors) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    if (themeColors !== undefined) {
      const dynamicFallbackColors = [
        { bg: themeColors.brand[900], text: themeColors.neutral.white },
        { bg: themeColors.brand[700], text: themeColors.neutral.white },
        { bg: themeColors.brand[500], text: themeColors.neutral.white },
        { bg: themeColors.semantic.successBg, text: themeColors.semantic.success },
        { bg: themeColors.semantic.warningBg, text: themeColors.semantic.warning },
        { bg: themeColors.semantic.infoBg, text: themeColors.semantic.info },
      ];
      const index = Math.abs(hash) % dynamicFallbackColors.length;
      const match = dynamicFallbackColors[index];
      if (match !== undefined) {
        return match;
      }
      return { bg: themeColors.neutral[100], text: themeColors.text };
    }
    return { bg: '#1E3A8A', text: '#FFFFFF' };
  }

  // Test empty name
  const emptyRes = getAvatarColors('');
  assert.ok(emptyRes.bg && emptyRes.text, 'Empty name should return fallback colors');

  // Test 10,000 char string
  const longName = 'A'.repeat(10000);
  const longRes = getAvatarColors(longName);
  assert.ok(longRes.bg && longRes.text, 'Long name should handle hash without error');

  console.log('PASSED: Avatar deterministic color calculations under edge cases');

  // StatusBadge getStatusColors edge cases
  function getStatusColors(status, themeColors) {
    const normalized = status.toLowerCase();
    const c = themeColors;

    if (normalized === 'approved' || normalized === 'active' || normalized === 'complete') {
      return {
        bg: c !== undefined ? c.semantic.successBg : '#ECFDF5',
        border: c !== undefined ? c.semantic.successBorder : '#A7F3D0',
        text: c !== undefined ? c.semantic.successText : '#10B981',
      };
    }
    if (normalized === 'pending' || normalized === 'reviewing' || normalized === 'warning') {
      return {
        bg: c !== undefined ? c.semantic.warningBg : '#FEF3C7',
        border: c !== undefined ? c.semantic.warningBorder : '#FDE68A',
        text: c !== undefined ? c.semantic.warningText : '#F59E0B',
      };
    }
    if (normalized === 'rejected' || normalized === 'failed' || normalized === 'error') {
      return {
        bg: c !== undefined ? c.semantic.errorBg : '#FEF2F2',
        border: c !== undefined ? c.semantic.errorBorder : '#FCA5A5',
        text: c !== undefined ? c.semantic.errorText : '#EF4444',
      };
    }
    return {
      bg: c !== undefined ? (c.text === '#F8FAFC' ? c.neutral[800] : c.neutral[100]) : '#F1F5F9',
      border: c !== undefined ? c.border : '#E2E8F0',
      text: c !== undefined ? c.textMuted : '#475569',
    };
  }

  assert.strictEqual(getStatusColors('APPROVED').text, '#10B981');
  assert.strictEqual(getStatusColors('UNKNOWN_STATUS').bg, '#F1F5F9');
  assert.strictEqual(getStatusColors('').bg, '#F1F5F9');

  console.log('PASSED: StatusBadge color lookup edge cases');
  console.log('\nALL EMPIRICAL TESTS PASSED SUCCESSFULLY!');
}).catch(err => {
  console.error('TEST FAILURE:', err);
  process.exit(1);
});
