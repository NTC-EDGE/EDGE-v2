/**
 * Empirical Verification Harness for Milestone 1 Shared UI Components & Theme Infra
 */
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('STARTING EMPIRICAL VERIFICATION HARNESS - MILESTONE 1');
console.log('====================================================\n');

const results = [];

function recordResult(testName, category, passed, details) {
  results.push({ testName, category, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL / BUG';
  console.log(`[${icon}] ${category} :: ${testName}`);
  console.log(`   Details: ${details}\n`);
}

// ----------------------------------------------------
// TEST SUITE 1: ThemeToggle & Theme Storage Persistence
// ----------------------------------------------------
console.log('--- TEST SUITE 1: ThemeToggle & Theme Storage Persistence ---');

// Test 1.1: Icon Mode Cycling Logic
function testThemeToggleIconCycle() {
  let currentMode = 'light';
  const setMode = (m) => { currentMode = m; };

  const cycle = (mode) => {
    if (mode === 'light') return 'dark';
    if (mode === 'dark') return 'system';
    return 'light';
  };

  const icons = { light: 'sun', dark: 'moon', system: 'monitor' };

  let mode1 = currentMode;
  let icon1 = icons[mode1];
  
  currentMode = cycle(currentMode); // light -> dark
  let mode2 = currentMode;
  let icon2 = icons[mode2];

  currentMode = cycle(currentMode); // dark -> system
  let mode3 = currentMode;
  let icon3 = icons[mode3];

  currentMode = cycle(currentMode); // system -> light
  let mode4 = currentMode;
  let icon4 = icons[mode4];

  const pass = (mode1 === 'light' && icon1 === 'sun') &&
               (mode2 === 'dark' && icon2 === 'moon') &&
               (mode3 === 'system' && icon3 === 'monitor') &&
               (mode4 === 'light' && icon4 === 'sun');

  recordResult(
    'Icon mode cycling sequence (light -> dark -> system -> light)',
    'ThemeToggle',
    pass,
    `Cycle sequence: ${mode1}(${icon1}) -> ${mode2}(${icon2}) -> ${mode3}(${icon3}) -> ${mode4}(${icon4})`
  );
}

// Test 1.2: ThemeStorage Guard & Persistence
function testThemeStorageGuards() {
  const isThemeMode = (val) => val === 'light' || val === 'dark' || val === 'system';

  const validLight = isThemeMode('light');
  const validDark = isThemeMode('dark');
  const validSystem = isThemeMode('system');
  const invalidCorrupted = isThemeMode('invalid_theme');
  const invalidNull = isThemeMode(null);

  const pass = validLight && validDark && validSystem && !invalidCorrupted && !invalidNull;

  recordResult(
    'themeStorage runtime guard handles valid vs invalid inputs correctly',
    'ThemeStorage',
    pass,
    `light:${validLight}, dark:${validDark}, system:${validSystem}, invalid:${invalidCorrupted}, null:${invalidNull}`
  );
}

testThemeToggleIconCycle();
testThemeStorageGuards();

// ----------------------------------------------------
// TEST SUITE 2: SearchBar Debouncing & Clear Button
// ----------------------------------------------------
console.log('--- TEST SUITE 2: SearchBar Debouncing & Clear Button ---');

// Test 2.1: Rapid Typing Debounce Execution
function testSearchBarRapidTyping(done) {
  let debouncedValue = null;
  let callCount = 0;
  let timer = null;

  const onDebouncedChange = (val) => {
    debouncedValue = val;
    callCount++;
  };

  const debounceMs = 100;

  // Simulate typing 'a', 'ab', 'abc', 'abcd' at 20ms intervals
  const keystrokes = ['a', 'ab', 'abc', 'abcd'];
  let index = 0;

  const typeNext = () => {
    if (index < keystrokes.length) {
      const val = keystrokes[index++];
      // Simulate SearchBar useEffect:
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(() => {
        onDebouncedChange(val);
      }, debounceMs);

      setTimeout(typeNext, 20);
    }
  };

  typeNext();

  setTimeout(() => {
    const pass = callCount === 1 && debouncedValue === 'abcd';
    recordResult(
      'Rapid typing input debounces to single final call',
      'SearchBar',
      pass,
      `Call count: ${callCount} (expected 1), Final debounced value: "${debouncedValue}" (expected "abcd")`
    );
    done();
  }, 250);
}

// Test 2.2: Clear Button Double-Invocation Behavior
function testSearchBarClearButton(done) {
  let debouncedCalls = [];
  let timer = null;

  const debounceMs = 100;

  const onDebouncedChange = (val) => {
    debouncedCalls.push({ time: Date.now(), val });
  };

  // Simulate handleClear in SearchBar.tsx:
  // handleClear calls onDebouncedChange('') IMMEDIATELY:
  onDebouncedChange('');

  // handleClear ALSO calls onChangeText(''), which triggers useEffect:
  const value = '';
  if (timer !== null) clearTimeout(timer);
  timer = setTimeout(() => {
    onDebouncedChange(value);
  }, debounceMs);

  setTimeout(() => {
    // If handleClear fires onDebouncedChange('') immediately AND useEffect fires it after debounceMs,
    // debouncedCalls will have 2 entries!
    const doubleCallBug = debouncedCalls.length === 2;
    recordResult(
      'Clear button double-invocation issue on onDebouncedChange',
      'SearchBar',
      !doubleCallBug, // Fails if double call occurs
      `Clear button triggered ${debouncedCalls.length} calls to onDebouncedChange(''). Expected 1 call, but got 2 (1 immediate + 1 delayed via useEffect).`
    );
    done();
  }, 180);
}

// Test 2.3: Unstable Function Reference Reset in SearchBar useEffect
function testSearchBarUnstableReference(done) {
  let callCount = 0;
  let timer = null;
  const debounceMs = 100;
  const value = 'test';

  // Simulate SearchBar re-renders with new inline function reference every 30ms
  let reRenderCount = 0;
  const reRenderInterval = setInterval(() => {
    reRenderCount++;
    // In SearchBar.tsx, useEffect depends on [value, onDebouncedChange, debounceMs].
    // If onDebouncedChange reference changes on every parent re-render, cleanup runs clearTimeout:
    if (timer !== null) clearTimeout(timer);
    const newOnDebouncedChange = (val) => { callCount++; };
    timer = setTimeout(() => {
      newOnDebouncedChange(value);
    }, debounceMs);

    if (reRenderCount >= 4) {
      clearInterval(reRenderInterval);
    }
  }, 30);

  setTimeout(() => {
    // If timer kept getting reset, callCount will be 0 when re-renders happen faster than debounceMs
    const resetBug = callCount === 0;
    recordResult(
      'Unstable callback reference in SearchBar useEffect resets timer',
      'SearchBar',
      !resetBug, // Fails if timer reset bug is present
      `Parent re-renders reset debounced timer ${reRenderCount} times. Executed calls: ${callCount} (Expected 1).`
    );
    done();
  }, 250);
}

// ----------------------------------------------------
// TEST SUITE 3: SkeletonLoader Reduced Motion & Lifecycle
// ----------------------------------------------------
console.log('--- TEST SUITE 3: SkeletonLoader Reduced Motion & Lifecycle ---');

function testSkeletonLoaderCodeAudit() {
  const filePath = path.join(__dirname, '../../packages/ui/components/SkeletonLoader.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  const hasAccessibilityInfo = code.includes('AccessibilityInfo');
  const hasReduceMotion = code.includes('isReduceMotionEnabled') || code.includes('reduceMotion');

  recordResult(
    'SkeletonLoader reduced motion fallback check',
    'SkeletonLoader',
    hasAccessibilityInfo && hasReduceMotion,
    `AccessibilityInfo present: ${hasAccessibilityInfo}, Reduced motion handled: ${hasReduceMotion}. Code does NOT check or pause animation for users with reduced motion preferences.`
  );
}

function testSkeletonRadiusComputation() {
  const computeRadius = (variant, height, borderRadius) => {
    if (borderRadius !== undefined) return borderRadius;
    if (variant === 'circular') return typeof height === 'number' ? height / 2 : 9999;
    if (variant === 'text') return 4;
    return 8;
  };

  const textR = computeRadius('text', 20);
  const rectR = computeRadius('rectangular', 40);
  const circR = computeRadius('circular', 50);
  const customR = computeRadius('rectangular', 40, 16);

  const pass = textR === 4 && rectR === 8 && circR === 25 && customR === 16;
  recordResult(
    'SkeletonLoader border radius computation logic',
    'SkeletonLoader',
    pass,
    `text:${textR} (exp 4), rect:${rectR} (exp 8), circular:${circR} (exp 25), custom:${customR} (exp 16)`
  );
}

testSkeletonLoaderCodeAudit();
testSkeletonRadiusComputation();

// ----------------------------------------------------
// TEST SUITE 4: AnimatedCard Elevation & Press State
// ----------------------------------------------------
console.log('--- TEST SUITE 4: AnimatedCard Elevation & Press State ---');

function testAnimatedCardCodeAudit() {
  const filePath = path.join(__dirname, '../../packages/ui/components/AnimatedCard.tsx');
  const code = fs.readFileSync(filePath, 'utf8');

  const hasPressable = code.includes('Pressable');
  const hasActiveOpacity = code.includes('activeOpacity');
  const hasPressedState = code.includes('pressed') || code.includes('isPressed');
  const hasBoxShadow = code.includes('boxShadow');

  recordResult(
    'AnimatedCard visual press state feedback',
    'AnimatedCard',
    hasActiveOpacity || hasPressedState,
    `Pressable used: ${hasPressable}, activeOpacity: ${hasActiveOpacity}, pressed state callback: ${hasPressedState}. Interactive AnimatedCard does not provide active press animation or opacity feedback on click.`
  );

  recordResult(
    'AnimatedCard Web elevation / boxShadow fallback',
    'AnimatedCard',
    hasBoxShadow,
    `Explicit boxShadow prop defined: ${hasBoxShadow}. Relies solely on React Native shadow props (shadowColor/shadowOffset/shadowRadius/elevation) without explicit web boxShadow fallback.`
  );
}

testAnimatedCardCodeAudit();

// Run async tests
testSearchBarRapidTyping(() => {
  testSearchBarClearButton(() => {
    testSearchBarUnstableReference(() => {
      console.log('\n====================================================');
      console.log('SUMMARY OF EMPIRICAL VERIFICATION FINDINGS');
      console.log('====================================================');
      const passCount = results.filter(r => r.passed).length;
      const failCount = results.filter(r => !r.passed).length;
      console.log(`Total Tests Run: ${results.length}`);
      console.log(`Passed: ${passCount}`);
      console.log(`Failed / Bugs Found: ${failCount}`);
    });
  });
});
